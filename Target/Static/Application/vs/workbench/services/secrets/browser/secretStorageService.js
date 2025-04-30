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
import { SequencerByKey } from "../../../../base/common/async.js";
import { IEncryptionService } from "../../../../platform/encryption/common/encryptionService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ISecretStorageService, BaseSecretStorageService } from "../../../../platform/secrets/common/secrets.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
let BrowserSecretStorageService = class BrowserSecretStorageService2 extends BaseSecretStorageService {
  static {
    __name(this, "BrowserSecretStorageService");
  }
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
BrowserSecretStorageService = __decorate([
  __param(0, IStorageService),
  __param(1, IEncryptionService),
  __param(2, IBrowserWorkbenchEnvironmentService),
  __param(3, ILogService)
], BrowserSecretStorageService);
registerSingleton(
  ISecretStorageService,
  BrowserSecretStorageService,
  1
  /* InstantiationType.Delayed */
);
export {
  BrowserSecretStorageService
};
//# sourceMappingURL=secretStorageService.js.map
