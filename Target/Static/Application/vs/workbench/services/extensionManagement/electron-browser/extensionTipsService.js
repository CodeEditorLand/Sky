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
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-browser/services.js";
import { IExtensionTipsService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionTipsService } from "../../../../platform/extensionManagement/common/extensionTipsService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Schemas } from "../../../../base/common/network.js";
let NativeExtensionTipsService = class NativeExtensionTipsService2 extends ExtensionTipsService {
  static {
    __name(this, "NativeExtensionTipsService");
  }
  constructor(fileService, productService, sharedProcessService) {
    super(fileService, productService);
    this.channel = sharedProcessService.getChannel("extensionTipsService");
  }
  getConfigBasedTips(folder) {
    if (folder.scheme === Schemas.file) {
      return this.channel.call("getConfigBasedTips", [folder]);
    }
    return super.getConfigBasedTips(folder);
  }
  getImportantExecutableBasedTips() {
    return this.channel.call("getImportantExecutableBasedTips");
  }
  getOtherExecutableBasedTips() {
    return this.channel.call("getOtherExecutableBasedTips");
  }
};
NativeExtensionTipsService = __decorate([
  __param(0, IFileService),
  __param(1, IProductService),
  __param(2, ISharedProcessService)
], NativeExtensionTipsService);
registerSingleton(
  IExtensionTipsService,
  NativeExtensionTipsService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=extensionTipsService.js.map
