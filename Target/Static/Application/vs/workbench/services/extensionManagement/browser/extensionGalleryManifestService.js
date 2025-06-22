var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IExtensionGalleryManifestService } from "../../../../platform/extensionManagement/common/extensionGalleryManifest.js";
import { ExtensionGalleryManifestService } from "../../../../platform/extensionManagement/common/extensionGalleryManifestService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
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
let WebExtensionGalleryManifestService = class WebExtensionGalleryManifestService2 extends ExtensionGalleryManifestService {
  static {
    __name(this, "WebExtensionGalleryManifestService");
  }
  constructor(productService, remoteAgentService) {
    super(productService);
    const remoteConnection = remoteAgentService.getConnection();
    if (remoteConnection) {
      const channel = remoteConnection.getChannel("extensionGalleryManifest");
      this.getExtensionGalleryManifest().then((manifest) => {
        channel.call("setExtensionGalleryManifest", [manifest]);
        this._register(this.onDidChangeExtensionGalleryManifest((manifest2) => channel.call("setExtensionGalleryManifest", [manifest2])));
      });
    }
  }
};
WebExtensionGalleryManifestService = __decorate([
  __param(0, IProductService),
  __param(1, IRemoteAgentService)
], WebExtensionGalleryManifestService);
registerSingleton(
  IExtensionGalleryManifestService,
  WebExtensionGalleryManifestService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=extensionGalleryManifestService.js.map
