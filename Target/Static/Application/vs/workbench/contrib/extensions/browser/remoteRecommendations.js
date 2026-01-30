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
import { ExtensionRecommendations } from "./extensionRecommendations.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { PlatformToString, platform } from "../../../../base/common/platform.js";
let RemoteRecommendations = class RemoteRecommendations2 extends ExtensionRecommendations {
  static {
    __name(this, "RemoteRecommendations");
  }
  get recommendations() {
    return this._recommendations;
  }
  constructor(productService) {
    super();
    this.productService = productService;
    this._recommendations = [];
  }
  async doActivate() {
    const extensionTips = { ...this.productService.remoteExtensionTips, ...this.productService.virtualWorkspaceExtensionTips };
    const currentPlatform = PlatformToString(platform);
    this._recommendations = Object.values(extensionTips).filter(({ supportedPlatforms }) => !supportedPlatforms || supportedPlatforms.includes(currentPlatform)).map((extension) => ({
      extension: extension.extensionId.toLowerCase(),
      reason: {
        reasonId: 6,
        reasonText: ""
      }
    }));
  }
};
RemoteRecommendations = __decorate([
  __param(0, IProductService)
], RemoteRecommendations);
export {
  RemoteRecommendations
};
//# sourceMappingURL=remoteRecommendations.js.map
