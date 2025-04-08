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
import { SequencerByKey } from "../../../../base/common/async.js";
import { IEncryptionService } from "../../../../platform/encryption/common/encryptionService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ISecretStorageProvider, ISecretStorageService, BaseSecretStorageService } from "../../../../platform/secrets/common/secrets.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
let BrowserSecretStorageService = class extends BaseSecretStorageService {
  static {
    __name(this, "BrowserSecretStorageService");
  }
  _secretStorageProvider;
  _embedderSequencer;
  constructor(storageService, encryptionService, environmentService, logService) {
    super(true, storageService, encryptionService, logService);
    if (environmentService.options?.secretStorageProvider) {
      this._secretStorageProvider = environmentService.options.secretStorageProvider;
      this._embedderSequencer = new SequencerByKey();
    }
  }
  get(key) {
    if (this._secretStorageProvider) {
      return this._embedderSequencer.queue(key, () => this._secretStorageProvider.get(key));
    }
    return super.get(key);
  }
  set(key, value) {
    if (this._secretStorageProvider) {
      return this._embedderSequencer.queue(key, async () => {
        await this._secretStorageProvider.set(key, value);
        this.onDidChangeSecretEmitter.fire(key);
      });
    }
    return super.set(key, value);
  }
  delete(key) {
    if (this._secretStorageProvider) {
      return this._embedderSequencer.queue(key, async () => {
        await this._secretStorageProvider.delete(key);
        this.onDidChangeSecretEmitter.fire(key);
      });
    }
    return super.delete(key);
  }
  get type() {
    if (this._secretStorageProvider) {
      return this._secretStorageProvider.type;
    }
    return super.type;
  }
};
BrowserSecretStorageService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IEncryptionService),
  __decorateParam(2, IBrowserWorkbenchEnvironmentService),
  __decorateParam(3, ILogService)
], BrowserSecretStorageService);
registerSingleton(ISecretStorageService, BrowserSecretStorageService, InstantiationType.Delayed);
export {
  BrowserSecretStorageService
};
//# sourceMappingURL=secretStorageService.js.map
