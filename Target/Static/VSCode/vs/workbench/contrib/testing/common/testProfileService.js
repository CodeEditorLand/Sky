var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter, Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { deepClone } from "../../../../base/common/objects.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { StoredValue } from "./storedValue.js";
import { TestId } from "./testId.js";
import { IMainThreadTestController } from "./testService.js";
import { ITestItem, ITestRunProfile, InternalTestItem, TestRunProfileBitset, testRunProfileBitsetList } from "./testTypes.js";
import { TestingContextKeys } from "./testingContextKeys.js";
const ITestProfileService = createDecorator("testProfileService");
const canUseProfileWithTest = /* @__PURE__ */ __name((profile, test) => profile.controllerId === test.controllerId && (TestId.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag)), "canUseProfileWithTest");
const sorter = /* @__PURE__ */ __name((a, b) => {
  if (a.isDefault !== b.isDefault) {
    return a.isDefault ? -1 : 1;
  }
  return a.label.localeCompare(b.label);
}, "sorter");
const capabilityContextKeys = /* @__PURE__ */ __name((capabilities) => [
  [TestingContextKeys.hasRunnableTests.key, (capabilities & TestRunProfileBitset.Run) !== 0],
  [TestingContextKeys.hasDebuggableTests.key, (capabilities & TestRunProfileBitset.Debug) !== 0],
  [TestingContextKeys.hasCoverableTests.key, (capabilities & TestRunProfileBitset.Coverage) !== 0]
], "capabilityContextKeys");
let TestProfileService = class extends Disposable {
  static {
    __name(this, "TestProfileService");
  }
  userDefaults;
  capabilitiesContexts;
  changeEmitter = this._register(new Emitter());
  controllerProfiles = /* @__PURE__ */ new Map();
  /** @inheritdoc */
  onDidChange = this.changeEmitter.event;
  constructor(contextKeyService, storageService) {
    super();
    storageService.remove("testingPreferredProfiles", StorageScope.WORKSPACE);
    this.userDefaults = this._register(new StoredValue({
      key: "testingPreferredProfiles2",
      scope: StorageScope.WORKSPACE,
      target: StorageTarget.MACHINE
    }, storageService));
    this.capabilitiesContexts = {
      [TestRunProfileBitset.Run]: TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
      [TestRunProfileBitset.Debug]: TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
      [TestRunProfileBitset.Coverage]: TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
      [TestRunProfileBitset.HasNonDefaultProfile]: TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
      [TestRunProfileBitset.HasConfigurable]: TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
      [TestRunProfileBitset.SupportsContinuousRun]: TestingContextKeys.supportsContinuousRun.bindTo(contextKeyService)
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
        capabilities |= capabilities & profile.group ? TestRunProfileBitset.HasNonDefaultProfile : profile.group;
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
        allCapabilities |= allCapabilities & profile.group ? TestRunProfileBitset.HasNonDefaultProfile : profile.group;
        allCapabilities |= profile.supportsContinuousRun ? TestRunProfileBitset.SupportsContinuousRun : 0;
      }
    }
    for (const group of testRunProfileBitsetList) {
      this.capabilitiesContexts[group].set((allCapabilities & group) !== 0);
    }
  }
};
TestProfileService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IStorageService)
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
