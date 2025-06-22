var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEncryptionService } from "../../../../platform/encryption/common/encryptionService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
class EncryptionService {
  static {
    __name(this, "EncryptionService");
  }
  encrypt(value) {
    return Promise.resolve(value);
  }
  decrypt(value) {
    return Promise.resolve(value);
  }
  isEncryptionAvailable() {
    return Promise.resolve(false);
  }
  getKeyStorageProvider() {
    return Promise.resolve(
      "basic_text"
      /* KnownStorageProvider.basicText */
    );
  }
  setUsePlainTextEncryption() {
    return Promise.resolve(void 0);
  }
}
registerSingleton(
  IEncryptionService,
  EncryptionService,
  1
  /* InstantiationType.Delayed */
);
export {
  EncryptionService
};
//# sourceMappingURL=encryptionService.js.map
