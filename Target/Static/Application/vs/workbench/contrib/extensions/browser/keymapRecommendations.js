var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtensionRecommendations } from "./extensionRecommendations.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
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
let KeymapRecommendations = class KeymapRecommendations2 extends ExtensionRecommendations {
  static {
    __name(this, "KeymapRecommendations");
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
    if (this.productService.keymapExtensionTips) {
      this._recommendations = this.productService.keymapExtensionTips.map((extensionId) => ({
        extension: extensionId.toLowerCase(),
        reason: {
          reasonId: 6,
          reasonText: ""
        }
      }));
    }
  }
};
KeymapRecommendations = __decorate([
  __param(0, IProductService)
], KeymapRecommendations);
export {
  KeymapRecommendations
};
//# sourceMappingURL=keymapRecommendations.js.map
