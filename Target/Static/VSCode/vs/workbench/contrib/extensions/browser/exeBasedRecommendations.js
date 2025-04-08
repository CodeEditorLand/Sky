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
import { IExtensionTipsService, IExecutableBasedExtensionTip } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionRecommendations, ExtensionRecommendation } from "./extensionRecommendations.js";
import { localize } from "../../../../nls.js";
import { ExtensionRecommendationReason } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
let ExeBasedRecommendations = class extends ExtensionRecommendations {
  constructor(extensionTipsService) {
    super();
    this.extensionTipsService = extensionTipsService;
  }
  static {
    __name(this, "ExeBasedRecommendations");
  }
  _otherTips = [];
  _importantTips = [];
  get otherRecommendations() {
    return this._otherTips.map((tip) => this.toExtensionRecommendation(tip));
  }
  get importantRecommendations() {
    return this._importantTips.map((tip) => this.toExtensionRecommendation(tip));
  }
  get recommendations() {
    return [...this.importantRecommendations, ...this.otherRecommendations];
  }
  getRecommendations(exe) {
    const important = this._importantTips.filter((tip) => tip.exeName.toLowerCase() === exe.toLowerCase()).map((tip) => this.toExtensionRecommendation(tip));
    const others = this._otherTips.filter((tip) => tip.exeName.toLowerCase() === exe.toLowerCase()).map((tip) => this.toExtensionRecommendation(tip));
    return { important, others };
  }
  async doActivate() {
    this._otherTips = await this.extensionTipsService.getOtherExecutableBasedTips();
    await this.fetchImportantExeBasedRecommendations();
  }
  _importantExeBasedRecommendations;
  async fetchImportantExeBasedRecommendations() {
    if (!this._importantExeBasedRecommendations) {
      this._importantExeBasedRecommendations = this.doFetchImportantExeBasedRecommendations();
    }
    return this._importantExeBasedRecommendations;
  }
  async doFetchImportantExeBasedRecommendations() {
    const importantExeBasedRecommendations = /* @__PURE__ */ new Map();
    this._importantTips = await this.extensionTipsService.getImportantExecutableBasedTips();
    this._importantTips.forEach((tip) => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
    return importantExeBasedRecommendations;
  }
  toExtensionRecommendation(tip) {
    return {
      extension: tip.extensionId.toLowerCase(),
      reason: {
        reasonId: ExtensionRecommendationReason.Executable,
        reasonText: localize("exeBasedRecommendation", "This extension is recommended because you have {0} installed.", tip.exeFriendlyName)
      }
    };
  }
};
ExeBasedRecommendations = __decorateClass([
  __decorateParam(0, IExtensionTipsService)
], ExeBasedRecommendations);
export {
  ExeBasedRecommendations
};
//# sourceMappingURL=exeBasedRecommendations.js.map
