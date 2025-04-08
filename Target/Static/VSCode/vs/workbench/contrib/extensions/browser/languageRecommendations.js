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
import { ExtensionRecommendations, ExtensionRecommendation } from "./extensionRecommendations.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ExtensionRecommendationReason } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
let LanguageRecommendations = class extends ExtensionRecommendations {
  constructor(productService) {
    super();
    this.productService = productService;
  }
  static {
    __name(this, "LanguageRecommendations");
  }
  _recommendations = [];
  get recommendations() {
    return this._recommendations;
  }
  async doActivate() {
    if (this.productService.languageExtensionTips) {
      this._recommendations = this.productService.languageExtensionTips.map((extensionId) => ({
        extension: extensionId.toLowerCase(),
        reason: {
          reasonId: ExtensionRecommendationReason.Application,
          reasonText: ""
        }
      }));
    }
  }
};
LanguageRecommendations = __decorateClass([
  __decorateParam(0, IProductService)
], LanguageRecommendations);
export {
  LanguageRecommendations
};
//# sourceMappingURL=languageRecommendations.js.map
