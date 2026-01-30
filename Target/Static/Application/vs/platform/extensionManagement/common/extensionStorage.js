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
var ExtensionStorageService_1;
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IStorageService } from "../../storage/common/storage.js";
import { adoptToGalleryExtensionId, areSameExtensions, getExtensionId } from "./extensionManagementUtil.js";
import { IProductService } from "../../product/common/productService.js";
import { distinct } from "../../../base/common/arrays.js";
import { ILogService } from "../../log/common/log.js";
import { isString } from "../../../base/common/types.js";
const IExtensionStorageService = createDecorator("IExtensionStorageService");
const EXTENSION_KEYS_ID_VERSION_REGEX = /^extensionKeys\/([^.]+\..+)@(\d+\.\d+\.\d+(-.*)?)$/;
let ExtensionStorageService = class ExtensionStorageService2 extends Disposable {
  static {
    __name(this, "ExtensionStorageService");
  }
  static {
    ExtensionStorageService_1 = this;
  }
  static {
    this.LARGE_STATE_WARNING_THRESHOLD = 512 * 1024;
  }
  static toKey(extension) {
    return `extensionKeys/${adoptToGalleryExtensionId(extension.id)}@${extension.version}`;
  }
  static fromKey(key) {
    const matches = EXTENSION_KEYS_ID_VERSION_REGEX.exec(key);
    if (matches && matches[1]) {
      return { id: matches[1], version: matches[2] };
    }
    return void 0;
  }
  /* TODO @sandy081: This has to be done across all profiles */
  static async removeOutdatedExtensionVersions(extensionManagementService, storageService) {
    const extensions = await extensionManagementService.getInstalled();
    const extensionVersionsToRemove = [];
    for (const [id, versions] of ExtensionStorageService_1.readAllExtensionsWithKeysForSync(storageService)) {
      const extensionVersion = extensions.find((e) => areSameExtensions(e.identifier, { id }))?.manifest.version;
      for (const version of versions) {
        if (extensionVersion !== version) {
          extensionVersionsToRemove.push(ExtensionStorageService_1.toKey({ id, version }));
        }
      }
    }
    for (const key of extensionVersionsToRemove) {
      storageService.remove(
        key,
        0
        /* StorageScope.PROFILE */
      );
    }
  }
  static readAllExtensionsWithKeysForSync(storageService) {
    const extensionsWithKeysForSync = /* @__PURE__ */ new Map();
    const keys = storageService.keys(
      0,
      1
      /* StorageTarget.MACHINE */
    );
    for (const key of keys) {
      const extensionIdWithVersion = ExtensionStorageService_1.fromKey(key);
      if (extensionIdWithVersion) {
        let versions = extensionsWithKeysForSync.get(extensionIdWithVersion.id.toLowerCase());
        if (!versions) {
          extensionsWithKeysForSync.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
        }
        versions.push(extensionIdWithVersion.version);
      }
    }
    return extensionsWithKeysForSync;
  }
  constructor(storageService, productService, logService) {
    super();
    this.storageService = storageService;
    this.productService = productService;
    this.logService = logService;
    this._onDidChangeExtensionStorageToSync = this._register(new Emitter());
    this.onDidChangeExtensionStorageToSync = this._onDidChangeExtensionStorageToSync.event;
    this.extensionsWithKeysForSync = ExtensionStorageService_1.readAllExtensionsWithKeysForSync(storageService);
    this._register(this.storageService.onDidChangeValue(0, void 0, this._store)((e) => this.onDidChangeStorageValue(e)));
  }
  onDidChangeStorageValue(e) {
    if (this.extensionsWithKeysForSync.has(e.key.toLowerCase())) {
      this._onDidChangeExtensionStorageToSync.fire();
      return;
    }
    const extensionIdWithVersion = ExtensionStorageService_1.fromKey(e.key);
    if (extensionIdWithVersion) {
      if (this.storageService.get(
        e.key,
        0
        /* StorageScope.PROFILE */
      ) === void 0) {
        this.extensionsWithKeysForSync.delete(extensionIdWithVersion.id.toLowerCase());
      } else {
        let versions = this.extensionsWithKeysForSync.get(extensionIdWithVersion.id.toLowerCase());
        if (!versions) {
          this.extensionsWithKeysForSync.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
        }
        versions.push(extensionIdWithVersion.version);
        this._onDidChangeExtensionStorageToSync.fire();
      }
      return;
    }
  }
  getExtensionId(extension) {
    if (isString(extension)) {
      return extension;
    }
    const publisher = extension.manifest ? extension.manifest.publisher : extension.publisher;
    const name = extension.manifest ? extension.manifest.name : extension.name;
    return getExtensionId(publisher, name);
  }
  getExtensionState(extension, global) {
    const extensionId = this.getExtensionId(extension);
    const jsonValue = this.getExtensionStateRaw(extension, global);
    if (jsonValue) {
      try {
        return JSON.parse(jsonValue);
      } catch (error) {
        this.logService.error(`[mainThreadStorage] unexpected error parsing storage contents (extensionId: ${extensionId}, global: ${global}): ${error}`);
      }
    }
    return void 0;
  }
  getExtensionStateRaw(extension, global) {
    const extensionId = this.getExtensionId(extension);
    const rawState = this.storageService.get(
      extensionId,
      global ? 0 : 1
      /* StorageScope.WORKSPACE */
    );
    if (rawState && rawState?.length > ExtensionStorageService_1.LARGE_STATE_WARNING_THRESHOLD) {
      this.logService.warn(`[mainThreadStorage] large extension state detected (extensionId: ${extensionId}, global: ${global}): ${rawState.length / 1024}kb. Consider to use 'storageUri' or 'globalStorageUri' to store this data on disk instead.`);
    }
    return rawState;
  }
  setExtensionState(extension, state, global) {
    const extensionId = this.getExtensionId(extension);
    if (state === void 0) {
      this.storageService.remove(
        extensionId,
        global ? 0 : 1
        /* StorageScope.WORKSPACE */
      );
    } else {
      this.storageService.store(
        extensionId,
        JSON.stringify(state),
        global ? 0 : 1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
  setKeysForSync(extensionIdWithVersion, keys) {
    this.storageService.store(
      ExtensionStorageService_1.toKey(extensionIdWithVersion),
      JSON.stringify(keys),
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  getKeysForSync(extensionIdWithVersion) {
    const extensionKeysForSyncFromProduct = this.productService.extensionSyncedKeys?.[extensionIdWithVersion.id.toLowerCase()];
    const extensionKeysForSyncFromStorageValue = this.storageService.get(
      ExtensionStorageService_1.toKey(extensionIdWithVersion),
      0
      /* StorageScope.PROFILE */
    );
    const extensionKeysForSyncFromStorage = extensionKeysForSyncFromStorageValue ? JSON.parse(extensionKeysForSyncFromStorageValue) : void 0;
    return extensionKeysForSyncFromStorage && extensionKeysForSyncFromProduct ? distinct([...extensionKeysForSyncFromStorage, ...extensionKeysForSyncFromProduct]) : extensionKeysForSyncFromStorage || extensionKeysForSyncFromProduct;
  }
  addToMigrationList(from, to) {
    if (from !== to) {
      const migrationList = this.migrationList.filter((entry) => !entry.includes(from) && !entry.includes(to));
      migrationList.push([from, to]);
      this.migrationList = migrationList;
    }
  }
  getSourceExtensionToMigrate(toExtensionId) {
    const entry = this.migrationList.find(([, to]) => toExtensionId === to);
    return entry ? entry[0] : void 0;
  }
  get migrationList() {
    const value = this.storageService.get("extensionStorage.migrationList", -1, "[]");
    try {
      const migrationList = JSON.parse(value);
      if (Array.isArray(migrationList)) {
        return migrationList;
      }
    } catch (error) {
    }
    return [];
  }
  set migrationList(migrationList) {
    if (migrationList.length) {
      this.storageService.store(
        "extensionStorage.migrationList",
        JSON.stringify(migrationList),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.storageService.remove(
        "extensionStorage.migrationList",
        -1
        /* StorageScope.APPLICATION */
      );
    }
  }
};
ExtensionStorageService = ExtensionStorageService_1 = __decorate([
  __param(0, IStorageService),
  __param(1, IProductService),
  __param(2, ILogService)
], ExtensionStorageService);
export {
  ExtensionStorageService,
  IExtensionStorageService
};
//# sourceMappingURL=extensionStorage.js.map
