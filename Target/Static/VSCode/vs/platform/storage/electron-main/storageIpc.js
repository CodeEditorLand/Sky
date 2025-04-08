var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { ILogService } from "../../log/common/log.js";
import { IBaseSerializableStorageRequest, ISerializableItemsChangeEvent, ISerializableUpdateRequest, Key, Value } from "../common/storageIpc.js";
import { IStorageChangeEvent, IStorageMain } from "./storageMain.js";
import { IStorageMainService } from "./storageMainService.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
import { reviveIdentifier, IAnyWorkspaceIdentifier } from "../../workspace/common/workspace.js";
class StorageDatabaseChannel extends Disposable {
  constructor(logService, storageMainService) {
    super();
    this.logService = logService;
    this.storageMainService = storageMainService;
    this.registerStorageChangeListeners(storageMainService.applicationStorage, this.onDidChangeApplicationStorageEmitter);
  }
  static {
    __name(this, "StorageDatabaseChannel");
  }
  static STORAGE_CHANGE_DEBOUNCE_TIME = 100;
  onDidChangeApplicationStorageEmitter = this._register(new Emitter());
  mapProfileToOnDidChangeProfileStorageEmitter = /* @__PURE__ */ new Map();
  //#region Storage Change Events
  registerStorageChangeListeners(storage, emitter) {
    this._register(Event.debounce(storage.onDidChangeStorage, (prev, cur) => {
      if (!prev) {
        prev = [cur];
      } else {
        prev.push(cur);
      }
      return prev;
    }, StorageDatabaseChannel.STORAGE_CHANGE_DEBOUNCE_TIME)((events) => {
      if (events.length) {
        emitter.fire(this.serializeStorageChangeEvents(events, storage));
      }
    }));
  }
  serializeStorageChangeEvents(events, storage) {
    const changed = /* @__PURE__ */ new Map();
    const deleted = /* @__PURE__ */ new Set();
    events.forEach((event) => {
      const existing = storage.get(event.key);
      if (typeof existing === "string") {
        changed.set(event.key, existing);
      } else {
        deleted.add(event.key);
      }
    });
    return {
      changed: Array.from(changed.entries()),
      deleted: Array.from(deleted.values())
    };
  }
  listen(_, event, arg) {
    switch (event) {
      case "onDidChangeStorage": {
        const profile = arg.profile ? revive(arg.profile) : void 0;
        if (!profile) {
          return this.onDidChangeApplicationStorageEmitter.event;
        }
        let profileStorageChangeEmitter = this.mapProfileToOnDidChangeProfileStorageEmitter.get(profile.id);
        if (!profileStorageChangeEmitter) {
          profileStorageChangeEmitter = this._register(new Emitter());
          this.registerStorageChangeListeners(this.storageMainService.profileStorage(profile), profileStorageChangeEmitter);
          this.mapProfileToOnDidChangeProfileStorageEmitter.set(profile.id, profileStorageChangeEmitter);
        }
        return profileStorageChangeEmitter.event;
      }
    }
    throw new Error(`Event not found: ${event}`);
  }
  //#endregion
  async call(_, command, arg) {
    const profile = arg.profile ? revive(arg.profile) : void 0;
    const workspace = reviveIdentifier(arg.workspace);
    const storage = await this.withStorageInitialized(profile, workspace);
    switch (command) {
      case "getItems": {
        return Array.from(storage.items.entries());
      }
      case "updateItems": {
        const items = arg;
        if (items.insert) {
          for (const [key, value] of items.insert) {
            storage.set(key, value);
          }
        }
        items.delete?.forEach((key) => storage.delete(key));
        break;
      }
      case "optimize": {
        return storage.optimize();
      }
      case "isUsed": {
        const path = arg.payload;
        if (typeof path === "string") {
          return this.storageMainService.isUsed(path);
        }
      }
      default:
        throw new Error(`Call not found: ${command}`);
    }
  }
  async withStorageInitialized(profile, workspace) {
    let storage;
    if (workspace) {
      storage = this.storageMainService.workspaceStorage(workspace);
    } else if (profile) {
      storage = this.storageMainService.profileStorage(profile);
    } else {
      storage = this.storageMainService.applicationStorage;
    }
    try {
      await storage.init();
    } catch (error) {
      this.logService.error(`StorageIPC#init: Unable to init ${workspace ? "workspace" : profile ? "profile" : "application"} storage due to ${error}`);
    }
    return storage;
  }
}
export {
  StorageDatabaseChannel
};
//# sourceMappingURL=storageIpc.js.map
