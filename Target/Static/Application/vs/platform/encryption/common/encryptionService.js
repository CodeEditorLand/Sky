var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IEncryptionService = createDecorator("encryptionService");
const IEncryptionMainService = createDecorator("encryptionMainService");
var PasswordStoreCLIOption;
(function(PasswordStoreCLIOption2) {
  PasswordStoreCLIOption2["kwallet"] = "kwallet";
  PasswordStoreCLIOption2["kwallet5"] = "kwallet5";
  PasswordStoreCLIOption2["gnomeLibsecret"] = "gnome-libsecret";
  PasswordStoreCLIOption2["basic"] = "basic";
})(PasswordStoreCLIOption || (PasswordStoreCLIOption = {}));
var KnownStorageProvider;
(function(KnownStorageProvider2) {
  KnownStorageProvider2["unknown"] = "unknown";
  KnownStorageProvider2["basicText"] = "basic_text";
  KnownStorageProvider2["gnomeAny"] = "gnome_any";
  KnownStorageProvider2["gnomeLibsecret"] = "gnome_libsecret";
  KnownStorageProvider2["gnomeKeyring"] = "gnome_keyring";
  KnownStorageProvider2["kwallet"] = "kwallet";
  KnownStorageProvider2["kwallet5"] = "kwallet5";
  KnownStorageProvider2["kwallet6"] = "kwallet6";
  KnownStorageProvider2["dplib"] = "dpapi";
  KnownStorageProvider2["keychainAccess"] = "keychain_access";
})(KnownStorageProvider || (KnownStorageProvider = {}));
function isKwallet(backend) {
  return backend === "kwallet" || backend === "kwallet5" || backend === "kwallet6";
}
__name(isKwallet, "isKwallet");
function isGnome(backend) {
  return backend === "gnome_any" || backend === "gnome_libsecret" || backend === "gnome_keyring";
}
__name(isGnome, "isGnome");
export {
  IEncryptionMainService,
  IEncryptionService,
  KnownStorageProvider,
  PasswordStoreCLIOption,
  isGnome,
  isKwallet
};
//# sourceMappingURL=encryptionService.js.map
