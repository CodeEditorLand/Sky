var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MainContext, MainThreadStorageShape, ExtHostStorageShape } from "./extHost.protocol.js";
import { Emitter } from "../../../base/common/event.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtensionIdWithVersion } from "../../../platform/extensionManagement/common/extensionStorage.js";
import { ILogService } from "../../../platform/log/common/log.js";
class ExtHostStorage {
  constructor(mainContext, _logService) {
    this._logService = _logService;
    this._proxy = mainContext.getProxy(MainContext.MainThreadStorage);
  }
  static {
    __name(this, "ExtHostStorage");
  }
  _serviceBrand;
  _proxy;
  _onDidChangeStorage = new Emitter();
  onDidChangeStorage = this._onDidChangeStorage.event;
  registerExtensionStorageKeysToSync(extension, keys) {
    this._proxy.$registerExtensionStorageKeysToSync(extension, keys);
  }
  async initializeExtensionStorage(shared, key, defaultValue) {
    const value = await this._proxy.$initializeExtensionStorage(shared, key);
    let parsedValue;
    if (value) {
      parsedValue = this.safeParseValue(shared, key, value);
    }
    return parsedValue || defaultValue;
  }
  setValue(shared, key, value) {
    return this._proxy.$setValue(shared, key, value);
  }
  $acceptValue(shared, key, value) {
    const parsedValue = this.safeParseValue(shared, key, value);
    if (parsedValue) {
      this._onDidChangeStorage.fire({ shared, key, value: parsedValue });
    }
  }
  safeParseValue(shared, key, value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      this._logService.error(`[extHostStorage] unexpected error parsing storage contents (extensionId: ${key}, global: ${shared}): ${error}`);
    }
    return void 0;
  }
}
const IExtHostStorage = createDecorator("IExtHostStorage");
export {
  ExtHostStorage,
  IExtHostStorage
};
//# sourceMappingURL=extHostStorage.js.map
