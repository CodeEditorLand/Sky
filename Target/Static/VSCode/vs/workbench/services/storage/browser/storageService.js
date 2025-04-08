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
import { BroadcastDataChannel } from "../../../../base/browser/broadcast.js";
import { isSafari } from "../../../../base/browser/browser.js";
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { IndexedDB } from "../../../../base/browser/indexedDB.js";
import { DeferredPromise, Promises } from "../../../../base/common/async.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { InMemoryStorageDatabase, isStorageItemsChangeEvent, IStorage, IStorageDatabase, IStorageItemsChangeEvent, IUpdateRequest, Storage } from "../../../../base/parts/storage/common/storage.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractStorageService, isProfileUsingDefaultStorage, IS_NEW_KEY, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { isUserDataProfile, IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IAnyWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
let BrowserStorageService = class extends AbstractStorageService {
  constructor(workspace, userDataProfileService, logService) {
    super({ flushInterval: BrowserStorageService.BROWSER_DEFAULT_FLUSH_INTERVAL });
    this.workspace = workspace;
    this.userDataProfileService = userDataProfileService;
    this.logService = logService;
    this.profileStorageProfile = this.userDataProfileService.currentProfile;
    this.registerListeners();
  }
  static {
    __name(this, "BrowserStorageService");
  }
  static BROWSER_DEFAULT_FLUSH_INTERVAL = 5 * 1e3;
  // every 5s because async operations are not permitted on shutdown
  applicationStorage;
  applicationStorageDatabase;
  applicationStoragePromise = new DeferredPromise();
  profileStorage;
  profileStorageDatabase;
  profileStorageProfile;
  profileStorageDisposables = this._register(new DisposableStore());
  workspaceStorage;
  workspaceStorageDatabase;
  get hasPendingUpdate() {
    return Boolean(
      this.applicationStorageDatabase?.hasPendingUpdate || this.profileStorageDatabase?.hasPendingUpdate || this.workspaceStorageDatabase?.hasPendingUpdate
    );
  }
  registerListeners() {
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => e.join(this.switchToProfile(e.profile))));
  }
  async doInitialize() {
    await Promises.settled([
      this.createApplicationStorage(),
      this.createProfileStorage(this.profileStorageProfile),
      this.createWorkspaceStorage()
    ]);
  }
  async createApplicationStorage() {
    const applicationStorageIndexedDB = await IndexedDBStorageDatabase.createApplicationStorage(this.logService);
    this.applicationStorageDatabase = this._register(applicationStorageIndexedDB);
    this.applicationStorage = this._register(new Storage(this.applicationStorageDatabase));
    this._register(this.applicationStorage.onDidChangeStorage((e) => this.emitDidChangeValue(StorageScope.APPLICATION, e)));
    await this.applicationStorage.init();
    this.updateIsNew(this.applicationStorage);
    this.applicationStoragePromise.complete({ indexedDb: applicationStorageIndexedDB, storage: this.applicationStorage });
  }
  async createProfileStorage(profile) {
    this.profileStorageDisposables.clear();
    this.profileStorageProfile = profile;
    if (isProfileUsingDefaultStorage(this.profileStorageProfile)) {
      const { indexedDb: applicationStorageIndexedDB, storage: applicationStorage } = await this.applicationStoragePromise.p;
      this.profileStorageDatabase = applicationStorageIndexedDB;
      this.profileStorage = applicationStorage;
      this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage((e) => this.emitDidChangeValue(StorageScope.PROFILE, e)));
    } else {
      const profileStorageIndexedDB = await IndexedDBStorageDatabase.createProfileStorage(this.profileStorageProfile, this.logService);
      this.profileStorageDatabase = this.profileStorageDisposables.add(profileStorageIndexedDB);
      this.profileStorage = this.profileStorageDisposables.add(new Storage(this.profileStorageDatabase));
      this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage((e) => this.emitDidChangeValue(StorageScope.PROFILE, e)));
      await this.profileStorage.init();
      this.updateIsNew(this.profileStorage);
    }
  }
  async createWorkspaceStorage() {
    const workspaceStorageIndexedDB = await IndexedDBStorageDatabase.createWorkspaceStorage(this.workspace.id, this.logService);
    this.workspaceStorageDatabase = this._register(workspaceStorageIndexedDB);
    this.workspaceStorage = this._register(new Storage(this.workspaceStorageDatabase));
    this._register(this.workspaceStorage.onDidChangeStorage((e) => this.emitDidChangeValue(StorageScope.WORKSPACE, e)));
    await this.workspaceStorage.init();
    this.updateIsNew(this.workspaceStorage);
  }
  updateIsNew(storage) {
    const firstOpen = storage.getBoolean(IS_NEW_KEY);
    if (firstOpen === void 0) {
      storage.set(IS_NEW_KEY, true);
    } else if (firstOpen) {
      storage.set(IS_NEW_KEY, false);
    }
  }
  getStorage(scope) {
    switch (scope) {
      case StorageScope.APPLICATION:
        return this.applicationStorage;
      case StorageScope.PROFILE:
        return this.profileStorage;
      default:
        return this.workspaceStorage;
    }
  }
  getLogDetails(scope) {
    switch (scope) {
      case StorageScope.APPLICATION:
        return this.applicationStorageDatabase?.name;
      case StorageScope.PROFILE:
        return this.profileStorageDatabase?.name;
      default:
        return this.workspaceStorageDatabase?.name;
    }
  }
  async switchToProfile(toProfile) {
    if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
      return;
    }
    const oldProfileStorage = assertIsDefined(this.profileStorage);
    const oldItems = oldProfileStorage.items;
    if (oldProfileStorage !== this.applicationStorage) {
      await oldProfileStorage.close();
    }
    await this.createProfileStorage(toProfile);
    this.switchData(oldItems, assertIsDefined(this.profileStorage), StorageScope.PROFILE);
  }
  async switchToWorkspace(toWorkspace, preserveData) {
    throw new Error("Migrating storage is currently unsupported in Web");
  }
  shouldFlushWhenIdle() {
    return getActiveWindow().document.hasFocus() && !this.hasPendingUpdate;
  }
  close() {
    if (isSafari) {
      this.applicationStorage?.close();
      this.profileStorageDatabase?.close();
      this.workspaceStorageDatabase?.close();
    }
    this.dispose();
  }
  async clear() {
    for (const scope of [StorageScope.APPLICATION, StorageScope.PROFILE, StorageScope.WORKSPACE]) {
      for (const target of [StorageTarget.USER, StorageTarget.MACHINE]) {
        for (const key of this.keys(scope, target)) {
          this.remove(key, scope);
        }
      }
      await this.getStorage(scope)?.whenFlushed();
    }
    await Promises.settled([
      this.applicationStorageDatabase?.clear() ?? Promise.resolve(),
      this.profileStorageDatabase?.clear() ?? Promise.resolve(),
      this.workspaceStorageDatabase?.clear() ?? Promise.resolve()
    ]);
  }
  hasScope(scope) {
    if (isUserDataProfile(scope)) {
      return this.profileStorageProfile.id === scope.id;
    }
    return this.workspace.id === scope.id;
  }
};
BrowserStorageService = __decorateClass([
  __decorateParam(2, ILogService)
], BrowserStorageService);
class InMemoryIndexedDBStorageDatabase extends InMemoryStorageDatabase {
  static {
    __name(this, "InMemoryIndexedDBStorageDatabase");
  }
  hasPendingUpdate = false;
  name = "in-memory-indexedb-storage";
  async clear() {
    (await this.getItems()).clear();
  }
  dispose() {
  }
}
class IndexedDBStorageDatabase extends Disposable {
  constructor(options, logService) {
    super();
    this.logService = logService;
    this.name = `${IndexedDBStorageDatabase.STORAGE_DATABASE_PREFIX}${options.id}`;
    this.broadcastChannel = options.broadcastChanges ? this._register(new BroadcastDataChannel(this.name)) : void 0;
    this.whenConnected = this.connect();
    this.registerListeners();
  }
  static {
    __name(this, "IndexedDBStorageDatabase");
  }
  static async createApplicationStorage(logService) {
    return IndexedDBStorageDatabase.create({ id: "global", broadcastChanges: true }, logService);
  }
  static async createProfileStorage(profile, logService) {
    return IndexedDBStorageDatabase.create({ id: `global-${profile.id}`, broadcastChanges: true }, logService);
  }
  static async createWorkspaceStorage(workspaceId, logService) {
    return IndexedDBStorageDatabase.create({ id: workspaceId }, logService);
  }
  static async create(options, logService) {
    try {
      const database = new IndexedDBStorageDatabase(options, logService);
      await database.whenConnected;
      return database;
    } catch (error) {
      logService.error(`[IndexedDB Storage ${options.id}] create(): ${toErrorMessage(error, true)}`);
      return new InMemoryIndexedDBStorageDatabase();
    }
  }
  static STORAGE_DATABASE_PREFIX = "vscode-web-state-db-";
  static STORAGE_OBJECT_STORE = "ItemTable";
  _onDidChangeItemsExternal = this._register(new Emitter());
  onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
  broadcastChannel;
  pendingUpdate = void 0;
  get hasPendingUpdate() {
    return !!this.pendingUpdate;
  }
  name;
  whenConnected;
  registerListeners() {
    if (this.broadcastChannel) {
      this._register(this.broadcastChannel.onDidReceiveData((data) => {
        if (isStorageItemsChangeEvent(data)) {
          this._onDidChangeItemsExternal.fire(data);
        }
      }));
    }
  }
  async connect() {
    try {
      return await IndexedDB.create(this.name, void 0, [IndexedDBStorageDatabase.STORAGE_OBJECT_STORE]);
    } catch (error) {
      this.logService.error(`[IndexedDB Storage ${this.name}] connect() error: ${toErrorMessage(error)}`);
      throw error;
    }
  }
  async getItems() {
    const db = await this.whenConnected;
    function isValid(value) {
      return typeof value === "string";
    }
    __name(isValid, "isValid");
    return db.getKeyValues(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, isValid);
  }
  async updateItems(request) {
    let didUpdate = false;
    this.pendingUpdate = this.doUpdateItems(request);
    try {
      didUpdate = await this.pendingUpdate;
    } finally {
      this.pendingUpdate = void 0;
    }
    if (this.broadcastChannel && didUpdate) {
      const event = {
        changed: request.insert,
        deleted: request.delete
      };
      this.broadcastChannel.postData(event);
    }
  }
  async doUpdateItems(request) {
    const toInsert = request.insert;
    const toDelete = request.delete;
    if (!toInsert && !toDelete || toInsert?.size === 0 && toDelete?.size === 0) {
      return false;
    }
    const db = await this.whenConnected;
    await db.runInTransaction(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, "readwrite", (objectStore) => {
      const requests = [];
      if (toInsert) {
        for (const [key, value] of toInsert) {
          requests.push(objectStore.put(value, key));
        }
      }
      if (toDelete) {
        for (const key of toDelete) {
          requests.push(objectStore.delete(key));
        }
      }
      return requests;
    });
    return true;
  }
  async optimize() {
  }
  async close() {
    const db = await this.whenConnected;
    await this.pendingUpdate;
    return db.close();
  }
  async clear() {
    const db = await this.whenConnected;
    await db.runInTransaction(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, "readwrite", (objectStore) => objectStore.clear());
  }
}
export {
  BrowserStorageService,
  IndexedDBStorageDatabase
};
//# sourceMappingURL=storageService.js.map
