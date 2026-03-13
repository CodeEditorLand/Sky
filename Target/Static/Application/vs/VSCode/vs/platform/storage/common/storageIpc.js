var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
class BaseStorageDatabaseClient extends Disposable {
  static {
    __name(this, "BaseStorageDatabaseClient");
  }
  constructor(channel, profile, workspace) {
    super();
    this.channel = channel;
    this.profile = profile;
    this.workspace = workspace;
  }
  async getItems() {
    const serializableRequest = { profile: this.profile, workspace: this.workspace };
    const items = await this.channel.call("getItems", serializableRequest);
    return new Map(items);
  }
  updateItems(request) {
    const serializableRequest = { profile: this.profile, workspace: this.workspace };
    if (request.insert) {
      serializableRequest.insert = Array.from(request.insert.entries());
    }
    if (request.delete) {
      serializableRequest.delete = Array.from(request.delete.values());
    }
    return this.channel.call("updateItems", serializableRequest);
  }
  optimize() {
    const serializableRequest = { profile: this.profile, workspace: this.workspace };
    return this.channel.call("optimize", serializableRequest);
  }
}
class BaseProfileAwareStorageDatabaseClient extends BaseStorageDatabaseClient {
  static {
    __name(this, "BaseProfileAwareStorageDatabaseClient");
  }
  constructor(channel, profile) {
    super(channel, profile, void 0);
    this._onDidChangeItemsExternal = this._register(new Emitter());
    this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.channel.listen("onDidChangeStorage", { profile: this.profile })((e) => this.onDidChangeStorage(e)));
  }
  onDidChangeStorage(e) {
    if (Array.isArray(e.changed) || Array.isArray(e.deleted)) {
      this._onDidChangeItemsExternal.fire({
        changed: e.changed ? new Map(e.changed) : void 0,
        deleted: e.deleted ? new Set(e.deleted) : void 0
      });
    }
  }
}
class ApplicationStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
  static {
    __name(this, "ApplicationStorageDatabaseClient");
  }
  constructor(channel) {
    super(channel, void 0);
  }
  async close() {
    this.dispose();
  }
}
class ProfileStorageDatabaseClient extends BaseProfileAwareStorageDatabaseClient {
  static {
    __name(this, "ProfileStorageDatabaseClient");
  }
  async close() {
    this.dispose();
  }
}
class WorkspaceStorageDatabaseClient extends BaseStorageDatabaseClient {
  static {
    __name(this, "WorkspaceStorageDatabaseClient");
  }
  constructor(channel, workspace) {
    super(channel, void 0, workspace);
    this.onDidChangeItemsExternal = Event.None;
  }
  async close() {
    this.dispose();
  }
}
class StorageClient {
  static {
    __name(this, "StorageClient");
  }
  constructor(channel) {
    this.channel = channel;
  }
  isUsed(path) {
    const serializableRequest = { payload: path, profile: void 0, workspace: void 0 };
    return this.channel.call("isUsed", serializableRequest);
  }
}
export {
  ApplicationStorageDatabaseClient,
  ProfileStorageDatabaseClient,
  StorageClient,
  WorkspaceStorageDatabaseClient
};
//# sourceMappingURL=storageIpc.js.map
