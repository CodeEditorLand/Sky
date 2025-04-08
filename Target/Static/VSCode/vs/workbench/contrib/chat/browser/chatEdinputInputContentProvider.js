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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelContentProvider, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ChatInputPart } from "./chatInputPart.js";
let ChatInputBoxContentProvider = class extends Disposable {
  constructor(textModelService, modelService, languageService) {
    super();
    this.modelService = modelService;
    this.languageService = languageService;
    this._register(textModelService.registerTextModelContentProvider(ChatInputPart.INPUT_SCHEME, this));
  }
  static {
    __name(this, "ChatInputBoxContentProvider");
  }
  async provideTextContent(resource) {
    const existing = this.modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    return this.modelService.createModel("", this.languageService.createById("chatinput"), resource);
  }
};
ChatInputBoxContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService)
], ChatInputBoxContentProvider);
export {
  ChatInputBoxContentProvider
};
//# sourceMappingURL=chatEdinputInputContentProvider.js.map
