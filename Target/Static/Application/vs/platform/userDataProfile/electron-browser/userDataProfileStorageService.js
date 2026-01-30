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
import { IUserDataProfileStorageService, RemoteUserDataProfileStorageService } from "../common/userDataProfileStorageService.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ILogService } from "../../log/common/log.js";
import { IUserDataProfilesService } from "../common/userDataProfile.js";
import { IMainProcessService } from "../../ipc/common/mainProcessService.js";
let NativeUserDataProfileStorageService = class NativeUserDataProfileStorageService2 extends RemoteUserDataProfileStorageService {
  static {
    __name(this, "NativeUserDataProfileStorageService");
  }
  constructor(mainProcessService, userDataProfilesService, storageService, logService) {
    super(false, mainProcessService, userDataProfilesService, storageService, logService);
  }
};
NativeUserDataProfileStorageService = __decorate([
  __param(0, IMainProcessService),
  __param(1, IUserDataProfilesService),
  __param(2, IStorageService),
  __param(3, ILogService)
], NativeUserDataProfileStorageService);
registerSingleton(
  IUserDataProfileStorageService,
  NativeUserDataProfileStorageService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeUserDataProfileStorageService
};
//# sourceMappingURL=userDataProfileStorageService.js.map
