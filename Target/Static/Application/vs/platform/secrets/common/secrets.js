var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SequencerByKey } from "../../../base/common/async.js";
import { IEncryptionService } from "../../encryption/common/encryptionService.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IStorageService, InMemoryStorageService } from "../../storage/common/storage.js";
import { Emitter } from "../../../base/common/event.js";
import { ILogService } from "../../log/common/log.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { Lazy } from "../../../base/common/lazy.js";
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
const ISecretStorageService = createDecorator("secretStorageService");
let BaseSecretStorageService = class BaseSecretStorageService2 extends Disposable {
  static {
    __name(this, "BaseSecretStorageService");
  }
  constructor(_useInMemoryStorage, _storageService, _encryptionService, _logService) {
    super();
    this._useInMemoryStorage = _useInMemoryStorage;
    this._storageService = _storageService;
    this._encryptionService = _encryptionService;
    this._logService = _logService;
    this._storagePrefix = "secret://";
    this.onDidChangeSecretEmitter = this._register(new Emitter());
    this.onDidChangeSecret = this.onDidChangeSecretEmitter.event;
    this._sequencer = new SequencerByKey();
    this._type = "unknown";
    this._onDidChangeValueDisposable = this._register(new DisposableStore());
    this._lazyStorageService = new Lazy(() => this.initialize());
  }
  /**
   * @Note initialize must be called first so that this can be resolved properly
   * otherwise it will return 'unknown'.
   */
  get type() {
    return this._type;
  }
  get resolvedStorageService() {
    return this._lazyStorageService.value;
  }
  get(key) {
    return this._sequencer.queue(key, async () => {
      const storageService = await this.resolvedStorageService;
      const fullKey = this.getKey(key);
      this._logService.trace("[secrets] getting secret for key:", fullKey);
      const encrypted = storageService.get(
        fullKey,
        -1
        /* StorageScope.APPLICATION */
      );
      if (!encrypted) {
        this._logService.trace("[secrets] no secret found for key:", fullKey);
        return void 0;
      }
      try {
        this._logService.trace("[secrets] decrypting gotten secret for key:", fullKey);
        const result = this._type === "in-memory" ? encrypted : await this._encryptionService.decrypt(encrypted);
        this._logService.trace("[secrets] decrypted secret for key:", fullKey);
        return result;
      } catch (e) {
        this._logService.error(e);
        this.delete(key);
        return void 0;
      }
    });
  }
  set(key, value) {
    return this._sequencer.queue(key, async () => {
      const storageService = await this.resolvedStorageService;
      this._logService.trace("[secrets] encrypting secret for key:", key);
      let encrypted;
      try {
        encrypted = this._type === "in-memory" ? value : await this._encryptionService.encrypt(value);
      } catch (e) {
        this._logService.error(e);
        throw e;
      }
      const fullKey = this.getKey(key);
      this._logService.trace("[secrets] storing encrypted secret for key:", fullKey);
      storageService.store(
        fullKey,
        encrypted,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
      this._logService.trace("[secrets] stored encrypted secret for key:", fullKey);
    });
  }
  delete(key) {
    return this._sequencer.queue(key, async () => {
      const storageService = await this.resolvedStorageService;
      const fullKey = this.getKey(key);
      this._logService.trace("[secrets] deleting secret for key:", fullKey);
      storageService.remove(
        fullKey,
        -1
        /* StorageScope.APPLICATION */
      );
      this._logService.trace("[secrets] deleted secret for key:", fullKey);
    });
  }
  async initialize() {
    let storageService;
    if (!this._useInMemoryStorage && await this._encryptionService.isEncryptionAvailable()) {
      this._logService.trace(`[SecretStorageService] Encryption is available, using persisted storage`);
      this._type = "persisted";
      storageService = this._storageService;
    } else {
      if (this._type === "in-memory") {
        return this._storageService;
      }
      this._logService.trace("[SecretStorageService] Encryption is not available, falling back to in-memory storage");
      this._type = "in-memory";
      storageService = this._register(new InMemoryStorageService());
    }
    this._onDidChangeValueDisposable.clear();
    this._onDidChangeValueDisposable.add(storageService.onDidChangeValue(-1, void 0, this._onDidChangeValueDisposable)((e) => {
      this.onDidChangeValue(e.key);
    }));
    return storageService;
  }
  reinitialize() {
    this._lazyStorageService = new Lazy(() => this.initialize());
  }
  onDidChangeValue(key) {
    if (!key.startsWith(this._storagePrefix)) {
      return;
    }
    const secretKey = key.slice(this._storagePrefix.length);
    this._logService.trace(`[SecretStorageService] Notifying change in value for secret: ${secretKey}`);
    this.onDidChangeSecretEmitter.fire(secretKey);
  }
  getKey(key) {
    return `${this._storagePrefix}${key}`;
  }
};
BaseSecretStorageService = __decorate([
  __param(1, IStorageService),
  __param(2, IEncryptionService),
  __param(3, ILogService)
], BaseSecretStorageService);
export {
  BaseSecretStorageService,
  ISecretStorageService
};
//# sourceMappingURL=secrets.js.map
