var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import * as arrays from "../../../../base/common/arrays.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorunIterableDelta, observableValue } from "../../../../base/common/observable.js";
import { WellDefinedPrefixTree } from "../../../../base/common/prefixTree.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { StoredValue } from "./storedValue.js";
import { TestId } from "./testId.js";
import { TestingContextKeys } from "./testingContextKeys.js";
import { ITestProfileService } from "./testProfileService.js";
import { ITestService } from "./testService.js";
const ITestingContinuousRunService = createDecorator("testingContinuousRunService");
let TestingContinuousRunService = class TestingContinuousRunService2 extends Disposable {
  static {
    __name(this, "TestingContinuousRunService");
  }
  get lastRunProfileIds() {
    return this.lastRun.get(/* @__PURE__ */ new Set());
  }
  constructor(testService, storageService, contextKeyService, testProfileService) {
    super();
    this.testService = testService;
    this.testProfileService = testProfileService;
    this.changeEmitter = new Emitter();
    this.running = new WellDefinedPrefixTree();
    this.onDidChange = this.changeEmitter.event;
    const isGloballyOn = TestingContextKeys.isContinuousModeOn.bindTo(contextKeyService);
    this._register(this.onDidChange(() => {
      isGloballyOn.set(!!this.running.root.value);
    }));
    this.lastRun = this._register(new StoredValue({
      key: "lastContinuousRunProfileIds",
      scope: 1,
      target: 1,
      serialization: {
        deserialize: /* @__PURE__ */ __name((v) => new Set(JSON.parse(v)), "deserialize"),
        serialize: /* @__PURE__ */ __name((v) => JSON.stringify([...v]), "serialize")
      }
    }, storageService));
    this._register(toDisposable(() => {
      for (const cts of this.running.values()) {
        cts.handle.dispose();
      }
    }));
  }
  /** @inheritdoc */
  isSpecificallyEnabledFor(testId) {
    return this.running.size > 0 && this.running.hasKey(TestId.fromString(testId).path);
  }
  /** @inheritdoc */
  isEnabledForAParentOf(testId) {
    return !!this.running.root.value || this.running.size > 0 && this.running.hasKeyOrParent(TestId.fromString(testId).path);
  }
  /** @inheritdoc */
  isEnabledForProfile({ profileId, controllerId }) {
    for (const node of this.running.values()) {
      if (node.profiles.get().some((p) => p.profileId === profileId && p.controllerId === controllerId)) {
        return true;
      }
    }
    return false;
  }
  /** @inheritdoc */
  isEnabledForAChildOf(testId) {
    return !!this.running.root.value || this.running.size > 0 && this.running.hasKeyOrChildren(TestId.fromString(testId).path);
  }
  /** @inheritdoc */
  isEnabled() {
    return !!this.running.root.value || this.running.size > 0;
  }
  /** @inheritdoc */
  start(profiles, testId) {
    const store = new DisposableStore();
    let actualProfiles;
    if (profiles instanceof Array) {
      actualProfiles = observableValue("crProfiles", profiles);
    } else {
      const getRelevant = /* @__PURE__ */ __name(() => this.testProfileService.getGroupDefaultProfiles(profiles).filter((p) => p.supportsContinuousRun && (!testId || TestId.root(testId) === p.controllerId)), "getRelevant");
      actualProfiles = observableValue("crProfiles", getRelevant());
      store.add(this.testProfileService.onDidChange(() => {
        if (ref.autoSetDefault) {
          const newRelevant = getRelevant();
          if (!arrays.equals(newRelevant, actualProfiles.get())) {
            actualProfiles.set(getRelevant(), void 0);
          }
        }
      }));
    }
    const path = testId ? TestId.fromString(testId).path : [];
    const ref = { profiles: actualProfiles, handle: store, path, autoSetDefault: typeof profiles === "number" };
    const existing = this.running.find(path);
    if (existing) {
      store.dispose();
      ref.autoSetDefault = existing.autoSetDefault = false;
      existing.profiles.set([.../* @__PURE__ */ new Set([...actualProfiles.get(), ...existing.profiles.get()])], void 0);
      this.changeEmitter.fire(testId);
      return;
    }
    this.running.insert(path, ref);
    const cancellationStores = new DisposableMap();
    store.add(toDisposable(() => {
      for (const cts of cancellationStores.values()) {
        cts.cancel();
      }
      cancellationStores.dispose();
    }));
    store.add(autorunIterableDelta((reader) => actualProfiles.read(reader), ({ addedValues, removedValues }) => {
      for (const profile of addedValues) {
        const cts = new CancellationTokenSource();
        this.testService.startContinuousRun({
          continuous: true,
          group: profile.group,
          targets: [{
            testIds: [testId ?? profile.controllerId],
            controllerId: profile.controllerId,
            profileId: profile.profileId
          }]
        }, cts.token);
        cancellationStores.set(profile, cts);
      }
      for (const profile of removedValues) {
        cancellationStores.get(profile)?.cancel();
        cancellationStores.deleteAndDispose(profile);
      }
      this.lastRun.store(new Set([...cancellationStores.keys()].map((p) => p.profileId)));
    }));
    this.changeEmitter.fire(testId);
  }
  /** Stops a continuous run for the profile across all test items that are running it. */
  stopProfile({ profileId, controllerId }) {
    const toDelete = [];
    for (const node of this.running.values()) {
      const profs = node.profiles.get();
      const filtered = profs.filter((p) => p.profileId !== profileId || p.controllerId !== controllerId);
      if (filtered.length === profs.length) {
        continue;
      } else if (filtered.length === 0) {
        toDelete.push(node);
      } else {
        node.profiles.set(filtered, void 0);
      }
    }
    for (let i = toDelete.length - 1; i >= 0; i--) {
      toDelete[i].handle.dispose();
      this.running.delete(toDelete[i].path);
    }
    this.changeEmitter.fire(void 0);
  }
  /** @inheritdoc */
  stop(testId) {
    const cancellations = [...this.running.deleteRecursive(testId ? TestId.fromString(testId).path : [])];
    for (let i = cancellations.length - 1; i >= 0; i--) {
      cancellations[i].handle.dispose();
    }
    this.changeEmitter.fire(testId);
  }
};
TestingContinuousRunService = __decorate([
  __param(0, ITestService),
  __param(1, IStorageService),
  __param(2, IContextKeyService),
  __param(3, ITestProfileService)
], TestingContinuousRunService);
export {
  ITestingContinuousRunService,
  TestingContinuousRunService
};
//# sourceMappingURL=testingContinuousRunService.js.map
