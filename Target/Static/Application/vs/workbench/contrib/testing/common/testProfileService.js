var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { deepClone } from "../../../../base/common/objects.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { StoredValue } from "./storedValue.js";
import { TestId } from "./testId.js";
import { testRunProfileBitsetList } from "./testTypes.js";
import { TestingContextKeys } from "./testingContextKeys.js";
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
const ITestProfileService = createDecorator("testProfileService");
const canUseProfileWithTest = /* @__PURE__ */ __name((profile, test) => profile.controllerId === test.controllerId && (TestId.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag)), "canUseProfileWithTest");
const sorter = /* @__PURE__ */ __name((a, b) => {
  if (a.isDefault !== b.isDefault) {
    return a.isDefault ? -1 : 1;
  }
  return a.label.localeCompare(b.label);
}, "sorter");
const capabilityContextKeys = /* @__PURE__ */ __name((capabilities) => [
  [TestingContextKeys.hasRunnableTests.key, (capabilities & 2) !== 0],
  [TestingContextKeys.hasDebuggableTests.key, (capabilities & 4) !== 0],
  [TestingContextKeys.hasCoverableTests.key, (capabilities & 8) !== 0]
], "capabilityContextKeys");
let TestProfileService = class TestProfileService2 extends Disposable {
  static {
    __name(this, "TestProfileService");
  }
  constructor(contextKeyService, storageService) {
    super();
    this.changeEmitter = this._register(new Emitter());
    this.controllerProfiles = /* @__PURE__ */ new Map();
    this.onDidChange = this.changeEmitter.event;
    storageService.remove(
      "testingPreferredProfiles",
      1
      /* StorageScope.WORKSPACE */
    );
    this.userDefaults = this._register(new StoredValue({
      key: "testingPreferredProfiles2",
      scope: 1,
      target: 1
    }, storageService));
    this.capabilitiesContexts = {
      [
        2
        /* TestRunProfileBitset.Run */
      ]: TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
      [
        4
        /* TestRunProfileBitset.Debug */
      ]: TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
      [
        8
        /* TestRunProfileBitset.Coverage */
      ]: TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
      [
        16
        /* TestRunProfileBitset.HasNonDefaultProfile */
      ]: TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
      [
        32
        /* TestRunProfileBitset.HasConfigurable */
      ]: TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
      [
        64
        /* TestRunProfileBitset.SupportsContinuousRun */
      ]: TestingContextKeys.supportsContinuousRun.bindTo(contextKeyService)
    };
    this.refreshContextKeys();
  }
  /** @inheritdoc */
  addProfile(controller, profile) {
    const previousExplicitDefaultValue = this.userDefaults.get()?.[controller.id]?.[profile.profileId];
    const extended = {
      ...profile,
      isDefault: previousExplicitDefaultValue ?? profile.isDefault,
      wasInitiallyDefault: profile.isDefault
    };
    let record = this.controllerProfiles.get(profile.controllerId);
    if (record) {
      record.profiles.push(extended);
      record.profiles.sort(sorter);
    } else {
      record = {
        profiles: [extended],
        controller
      };
      this.controllerProfiles.set(profile.controllerId, record);
    }
    this.refreshContextKeys();
    this.changeEmitter.fire();
  }
  /** @inheritdoc */
  updateProfile(controllerId, profileId, update) {
    const ctrl = this.controllerProfiles.get(controllerId);
    if (!ctrl) {
      return;
    }
    const profile = ctrl.profiles.find((c) => c.controllerId === controllerId && c.profileId === profileId);
    if (!profile) {
      return;
    }
    Object.assign(profile, update);
    ctrl.profiles.sort(sorter);
    if (update.isDefault !== void 0) {
      const map = deepClone(this.userDefaults.get({}));
      setIsDefault(map, profile, update.isDefault);
      this.userDefaults.store(map);
    }
    this.changeEmitter.fire();
  }
  /** @inheritdoc */
  configure(controllerId, profileId) {
    this.controllerProfiles.get(controllerId)?.controller.configureRunProfile(profileId);
  }
  /** @inheritdoc */
  removeProfile(controllerId, profileId) {
    const ctrl = this.controllerProfiles.get(controllerId);
    if (!ctrl) {
      return;
    }
    if (!profileId) {
      this.controllerProfiles.delete(controllerId);
      this.changeEmitter.fire();
      return;
    }
    const index = ctrl.profiles.findIndex((c) => c.profileId === profileId);
    if (index === -1) {
      return;
    }
    ctrl.profiles.splice(index, 1);
    this.refreshContextKeys();
    this.changeEmitter.fire();
  }
  /** @inheritdoc */
  capabilitiesForTest(test) {
    const ctrl = this.controllerProfiles.get(TestId.root(test.extId));
    if (!ctrl) {
      return 0;
    }
    let capabilities = 0;
    for (const profile of ctrl.profiles) {
      if (!profile.tag || test.tags.includes(profile.tag)) {
        capabilities |= capabilities & profile.group ? 16 : profile.group;
      }
    }
    return capabilities;
  }
  /** @inheritdoc */
  all() {
    return this.controllerProfiles.values();
  }
  /** @inheritdoc */
  getControllerProfiles(profileId) {
    return this.controllerProfiles.get(profileId)?.profiles ?? [];
  }
  /** @inheritdoc */
  getGroupDefaultProfiles(group, controllerId) {
    const allProfiles = controllerId ? this.controllerProfiles.get(controllerId)?.profiles || [] : [...Iterable.flatMap(this.controllerProfiles.values(), (c) => c.profiles)];
    const defaults = allProfiles.filter((c) => c.group === group && c.isDefault);
    if (defaults.length === 0) {
      const first = allProfiles.find((p) => p.group === group);
      if (first) {
        defaults.push(first);
      }
    }
    return defaults;
  }
  /** @inheritdoc */
  setGroupDefaultProfiles(group, profiles) {
    const next = {};
    for (const ctrl of this.controllerProfiles.values()) {
      next[ctrl.controller.id] = {};
      for (const profile of ctrl.profiles) {
        if (profile.group !== group) {
          continue;
        }
        setIsDefault(next, profile, profiles.some((p) => p.profileId === profile.profileId));
      }
      for (const profile of ctrl.profiles) {
        if (profile.group === group) {
          continue;
        }
        const matching = ctrl.profiles.find((p) => p.group === group && p.label === profile.label);
        if (matching) {
          setIsDefault(next, profile, matching.isDefault);
        }
      }
      ctrl.profiles.sort(sorter);
    }
    this.userDefaults.store(next);
    this.changeEmitter.fire();
  }
  getDefaultProfileForTest(group, test) {
    return this.getControllerProfiles(test.controllerId).find((p) => (p.group & group) !== 0 && canUseProfileWithTest(p, test));
  }
  refreshContextKeys() {
    let allCapabilities = 0;
    for (const { profiles } of this.controllerProfiles.values()) {
      for (const profile of profiles) {
        allCapabilities |= allCapabilities & profile.group ? 16 : profile.group;
        allCapabilities |= profile.supportsContinuousRun ? 64 : 0;
      }
    }
    for (const group of testRunProfileBitsetList) {
      this.capabilitiesContexts[group].set((allCapabilities & group) !== 0);
    }
  }
};
TestProfileService = __decorate([
  __param(0, IContextKeyService),
  __param(1, IStorageService)
], TestProfileService);
const setIsDefault = /* @__PURE__ */ __name((map, profile, isDefault) => {
  profile.isDefault = isDefault;
  map[profile.controllerId] ??= {};
  if (profile.isDefault !== profile.wasInitiallyDefault) {
    map[profile.controllerId][profile.profileId] = profile.isDefault;
  } else {
    delete map[profile.controllerId][profile.profileId];
  }
}, "setIsDefault");
export {
  ITestProfileService,
  TestProfileService,
  canUseProfileWithTest,
  capabilityContextKeys
};
//# sourceMappingURL=testProfileService.js.map
