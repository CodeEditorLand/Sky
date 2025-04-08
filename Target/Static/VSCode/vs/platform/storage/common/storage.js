var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Promises, RunOnceScheduler, runWhenGlobalIdle } from "../../../base/common/async.js";
import { Emitter, Event, PauseableEmitter } from "../../../base/common/event.js";
import { Disposable, DisposableStore, dispose, MutableDisposable } from "../../../base/common/lifecycle.js";
import { mark } from "../../../base/common/performance.js";
import { isUndefinedOrNull } from "../../../base/common/types.js";
import { InMemoryStorageDatabase, IStorage, IStorageChangeEvent, Storage, StorageHint, StorageValue } from "../../../base/parts/storage/common/storage.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { isUserDataProfile, IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
import { IAnyWorkspaceIdentifier } from "../../workspace/common/workspace.js";
const IS_NEW_KEY = "__$__isNewStorageMarker";
const TARGET_KEY = "__$__targetStorageMarker";
const IStorageService = createDecorator("storageService");
var WillSaveStateReason = /* @__PURE__ */ ((WillSaveStateReason2) => {
  WillSaveStateReason2[WillSaveStateReason2["NONE"] = 0] = "NONE";
  WillSaveStateReason2[WillSaveStateReason2["SHUTDOWN"] = 1] = "SHUTDOWN";
  return WillSaveStateReason2;
})(WillSaveStateReason || {});
var StorageScope = /* @__PURE__ */ ((StorageScope2) => {
  StorageScope2[StorageScope2["APPLICATION"] = -1] = "APPLICATION";
  StorageScope2[StorageScope2["PROFILE"] = 0] = "PROFILE";
  StorageScope2[StorageScope2["WORKSPACE"] = 1] = "WORKSPACE";
  return StorageScope2;
})(StorageScope || {});
var StorageTarget = /* @__PURE__ */ ((StorageTarget2) => {
  StorageTarget2[StorageTarget2["USER"] = 0] = "USER";
  StorageTarget2[StorageTarget2["MACHINE"] = 1] = "MACHINE";
  return StorageTarget2;
})(StorageTarget || {});
function loadKeyTargets(storage) {
  const keysRaw = storage.get(TARGET_KEY);
  if (keysRaw) {
    try {
      return JSON.parse(keysRaw);
    } catch (error) {
    }
  }
  return /* @__PURE__ */ Object.create(null);
}
__name(loadKeyTargets, "loadKeyTargets");
class AbstractStorageService extends Disposable {
  static {
    __name(this, "AbstractStorageService");
  }
  static DEFAULT_FLUSH_INTERVAL = 60 * 1e3;
  // every minute
  _onDidChangeValue = this._register(new PauseableEmitter());
  _onDidChangeTarget = this._register(new PauseableEmitter());
  onDidChangeTarget = this._onDidChangeTarget.event;
  _onWillSaveState = this._register(new Emitter());
  onWillSaveState = this._onWillSaveState.event;
  initializationPromise;
  flushWhenIdleScheduler;
  runFlushWhenIdle = this._register(new MutableDisposable());
  constructor(options = { flushInterval: AbstractStorageService.DEFAULT_FLUSH_INTERVAL }) {
    super();
    this.flushWhenIdleScheduler = this._register(new RunOnceScheduler(() => this.doFlushWhenIdle(), options.flushInterval));
  }
  onDidChangeValue(scope, key, disposable) {
    return Event.filter(this._onDidChangeValue.event, (e) => e.scope === scope && (key === void 0 || e.key === key), disposable);
  }
  doFlushWhenIdle() {
    this.runFlushWhenIdle.value = runWhenGlobalIdle(() => {
      if (this.shouldFlushWhenIdle()) {
        this.flush();
      }
      this.flushWhenIdleScheduler.schedule();
    });
  }
  shouldFlushWhenIdle() {
    return true;
  }
  stopFlushWhenIdle() {
    dispose([this.runFlushWhenIdle, this.flushWhenIdleScheduler]);
  }
  initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = (async () => {
        mark("code/willInitStorage");
        try {
          await this.doInitialize();
        } finally {
          mark("code/didInitStorage");
        }
        this.flushWhenIdleScheduler.schedule();
      })();
    }
    return this.initializationPromise;
  }
  emitDidChangeValue(scope, event) {
    const { key, external } = event;
    if (key === TARGET_KEY) {
      switch (scope) {
        case -1 /* APPLICATION */:
          this._applicationKeyTargets = void 0;
          break;
        case 0 /* PROFILE */:
          this._profileKeyTargets = void 0;
          break;
        case 1 /* WORKSPACE */:
          this._workspaceKeyTargets = void 0;
          break;
      }
      this._onDidChangeTarget.fire({ scope });
    } else {
      this._onDidChangeValue.fire({ scope, key, target: this.getKeyTargets(scope)[key], external });
    }
  }
  emitWillSaveState(reason) {
    this._onWillSaveState.fire({ reason });
  }
  get(key, scope, fallbackValue) {
    return this.getStorage(scope)?.get(key, fallbackValue);
  }
  getBoolean(key, scope, fallbackValue) {
    return this.getStorage(scope)?.getBoolean(key, fallbackValue);
  }
  getNumber(key, scope, fallbackValue) {
    return this.getStorage(scope)?.getNumber(key, fallbackValue);
  }
  getObject(key, scope, fallbackValue) {
    return this.getStorage(scope)?.getObject(key, fallbackValue);
  }
  storeAll(entries, external) {
    this.withPausedEmitters(() => {
      for (const entry of entries) {
        this.store(entry.key, entry.value, entry.scope, entry.target, external);
      }
    });
  }
  store(key, value, scope, target, external = false) {
    if (isUndefinedOrNull(value)) {
      this.remove(key, scope, external);
      return;
    }
    this.withPausedEmitters(() => {
      this.updateKeyTarget(key, scope, target);
      this.getStorage(scope)?.set(key, value, external);
    });
  }
  remove(key, scope, external = false) {
    this.withPausedEmitters(() => {
      this.updateKeyTarget(key, scope, void 0);
      this.getStorage(scope)?.delete(key, external);
    });
  }
  withPausedEmitters(fn) {
    this._onDidChangeValue.pause();
    this._onDidChangeTarget.pause();
    try {
      fn();
    } finally {
      this._onDidChangeValue.resume();
      this._onDidChangeTarget.resume();
    }
  }
  keys(scope, target) {
    const keys = [];
    const keyTargets = this.getKeyTargets(scope);
    for (const key of Object.keys(keyTargets)) {
      const keyTarget = keyTargets[key];
      if (keyTarget === target) {
        keys.push(key);
      }
    }
    return keys;
  }
  updateKeyTarget(key, scope, target, external = false) {
    const keyTargets = this.getKeyTargets(scope);
    if (typeof target === "number") {
      if (keyTargets[key] !== target) {
        keyTargets[key] = target;
        this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
      }
    } else {
      if (typeof keyTargets[key] === "number") {
        delete keyTargets[key];
        this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
      }
    }
  }
  _workspaceKeyTargets = void 0;
  get workspaceKeyTargets() {
    if (!this._workspaceKeyTargets) {
      this._workspaceKeyTargets = this.loadKeyTargets(1 /* WORKSPACE */);
    }
    return this._workspaceKeyTargets;
  }
  _profileKeyTargets = void 0;
  get profileKeyTargets() {
    if (!this._profileKeyTargets) {
      this._profileKeyTargets = this.loadKeyTargets(0 /* PROFILE */);
    }
    return this._profileKeyTargets;
  }
  _applicationKeyTargets = void 0;
  get applicationKeyTargets() {
    if (!this._applicationKeyTargets) {
      this._applicationKeyTargets = this.loadKeyTargets(-1 /* APPLICATION */);
    }
    return this._applicationKeyTargets;
  }
  getKeyTargets(scope) {
    switch (scope) {
      case -1 /* APPLICATION */:
        return this.applicationKeyTargets;
      case 0 /* PROFILE */:
        return this.profileKeyTargets;
      default:
        return this.workspaceKeyTargets;
    }
  }
  loadKeyTargets(scope) {
    const storage = this.getStorage(scope);
    return storage ? loadKeyTargets(storage) : /* @__PURE__ */ Object.create(null);
  }
  isNew(scope) {
    return this.getBoolean(IS_NEW_KEY, scope) === true;
  }
  async flush(reason = 0 /* NONE */) {
    this._onWillSaveState.fire({ reason });
    const applicationStorage = this.getStorage(-1 /* APPLICATION */);
    const profileStorage = this.getStorage(0 /* PROFILE */);
    const workspaceStorage = this.getStorage(1 /* WORKSPACE */);
    switch (reason) {
      // Unspecific reason: just wait when data is flushed
      case 0 /* NONE */:
        await Promises.settled([
          applicationStorage?.whenFlushed() ?? Promise.resolve(),
          profileStorage?.whenFlushed() ?? Promise.resolve(),
          workspaceStorage?.whenFlushed() ?? Promise.resolve()
        ]);
        break;
      // Shutdown: we want to flush as soon as possible
      // and not hit any delays that might be there
      case 1 /* SHUTDOWN */:
        await Promises.settled([
          applicationStorage?.flush(0) ?? Promise.resolve(),
          profileStorage?.flush(0) ?? Promise.resolve(),
          workspaceStorage?.flush(0) ?? Promise.resolve()
        ]);
        break;
    }
  }
  async log() {
    const applicationItems = this.getStorage(-1 /* APPLICATION */)?.items ?? /* @__PURE__ */ new Map();
    const profileItems = this.getStorage(0 /* PROFILE */)?.items ?? /* @__PURE__ */ new Map();
    const workspaceItems = this.getStorage(1 /* WORKSPACE */)?.items ?? /* @__PURE__ */ new Map();
    return logStorage(
      applicationItems,
      profileItems,
      workspaceItems,
      this.getLogDetails(-1 /* APPLICATION */) ?? "",
      this.getLogDetails(0 /* PROFILE */) ?? "",
      this.getLogDetails(1 /* WORKSPACE */) ?? ""
    );
  }
  async optimize(scope) {
    await this.flush();
    return this.getStorage(scope)?.optimize();
  }
  async switch(to, preserveData) {
    this.emitWillSaveState(0 /* NONE */);
    if (isUserDataProfile(to)) {
      return this.switchToProfile(to, preserveData);
    }
    return this.switchToWorkspace(to, preserveData);
  }
  canSwitchProfile(from, to) {
    if (from.id === to.id) {
      return false;
    }
    if (isProfileUsingDefaultStorage(to) && isProfileUsingDefaultStorage(from)) {
      return false;
    }
    return true;
  }
  switchData(oldStorage, newStorage, scope) {
    this.withPausedEmitters(() => {
      const handledkeys = /* @__PURE__ */ new Set();
      for (const [key, oldValue] of oldStorage) {
        handledkeys.add(key);
        const newValue = newStorage.get(key);
        if (newValue !== oldValue) {
          this.emitDidChangeValue(scope, { key, external: true });
        }
      }
      for (const [key] of newStorage.items) {
        if (!handledkeys.has(key)) {
          this.emitDidChangeValue(scope, { key, external: true });
        }
      }
    });
  }
}
function isProfileUsingDefaultStorage(profile) {
  return profile.isDefault || !!profile.useDefaultFlags?.globalState;
}
__name(isProfileUsingDefaultStorage, "isProfileUsingDefaultStorage");
class InMemoryStorageService extends AbstractStorageService {
  static {
    __name(this, "InMemoryStorageService");
  }
  applicationStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: StorageHint.STORAGE_IN_MEMORY }));
  profileStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: StorageHint.STORAGE_IN_MEMORY }));
  workspaceStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: StorageHint.STORAGE_IN_MEMORY }));
  constructor() {
    super();
    this._register(this.workspaceStorage.onDidChangeStorage((e) => this.emitDidChangeValue(1 /* WORKSPACE */, e)));
    this._register(this.profileStorage.onDidChangeStorage((e) => this.emitDidChangeValue(0 /* PROFILE */, e)));
    this._register(this.applicationStorage.onDidChangeStorage((e) => this.emitDidChangeValue(-1 /* APPLICATION */, e)));
  }
  getStorage(scope) {
    switch (scope) {
      case -1 /* APPLICATION */:
        return this.applicationStorage;
      case 0 /* PROFILE */:
        return this.profileStorage;
      default:
        return this.workspaceStorage;
    }
  }
  getLogDetails(scope) {
    switch (scope) {
      case -1 /* APPLICATION */:
        return "inMemory (application)";
      case 0 /* PROFILE */:
        return "inMemory (profile)";
      default:
        return "inMemory (workspace)";
    }
  }
  async doInitialize() {
  }
  async switchToProfile() {
  }
  async switchToWorkspace() {
  }
  shouldFlushWhenIdle() {
    return false;
  }
  hasScope(scope) {
    return false;
  }
}
async function logStorage(application, profile, workspace, applicationPath, profilePath, workspacePath) {
  const safeParse = /* @__PURE__ */ __name((value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }, "safeParse");
  const applicationItems = /* @__PURE__ */ new Map();
  const applicationItemsParsed = /* @__PURE__ */ new Map();
  application.forEach((value, key) => {
    applicationItems.set(key, value);
    applicationItemsParsed.set(key, safeParse(value));
  });
  const profileItems = /* @__PURE__ */ new Map();
  const profileItemsParsed = /* @__PURE__ */ new Map();
  profile.forEach((value, key) => {
    profileItems.set(key, value);
    profileItemsParsed.set(key, safeParse(value));
  });
  const workspaceItems = /* @__PURE__ */ new Map();
  const workspaceItemsParsed = /* @__PURE__ */ new Map();
  workspace.forEach((value, key) => {
    workspaceItems.set(key, value);
    workspaceItemsParsed.set(key, safeParse(value));
  });
  if (applicationPath !== profilePath) {
    console.group(`Storage: Application (path: ${applicationPath})`);
  } else {
    console.group(`Storage: Application & Profile (path: ${applicationPath}, default profile)`);
  }
  const applicationValues = [];
  applicationItems.forEach((value, key) => {
    applicationValues.push({ key, value });
  });
  console.table(applicationValues);
  console.groupEnd();
  console.log(applicationItemsParsed);
  if (applicationPath !== profilePath) {
    console.group(`Storage: Profile (path: ${profilePath}, profile specific)`);
    const profileValues = [];
    profileItems.forEach((value, key) => {
      profileValues.push({ key, value });
    });
    console.table(profileValues);
    console.groupEnd();
    console.log(profileItemsParsed);
  }
  console.group(`Storage: Workspace (path: ${workspacePath})`);
  const workspaceValues = [];
  workspaceItems.forEach((value, key) => {
    workspaceValues.push({ key, value });
  });
  console.table(workspaceValues);
  console.groupEnd();
  console.log(workspaceItemsParsed);
}
__name(logStorage, "logStorage");
export {
  AbstractStorageService,
  IS_NEW_KEY,
  IStorageService,
  InMemoryStorageService,
  StorageScope,
  StorageTarget,
  TARGET_KEY,
  WillSaveStateReason,
  isProfileUsingDefaultStorage,
  loadKeyTargets,
  logStorage
};
//# sourceMappingURL=storage.js.map
