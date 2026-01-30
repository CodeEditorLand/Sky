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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IChatPromptContentStore } from "../../common/promptSyntax/chatPromptContentStore.js";
import { PROMPT_LANGUAGE_ID } from "../../common/promptSyntax/promptTypes.js";
let ChatPromptContentProvider = class ChatPromptContentProvider2 extends Disposable {
  static {
    __name(this, "ChatPromptContentProvider");
  }
  constructor(textModelService, modelService, languageService, chatPromptContentStore) {
    super();
    this.modelService = modelService;
    this.languageService = languageService;
    this.chatPromptContentStore = chatPromptContentStore;
    this._register(textModelService.registerTextModelContentProvider(Schemas.vscodeChatPrompt, this));
  }
  async provideTextContent(resource) {
    const existing = this.modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const content = this.chatPromptContentStore.getContent(resource) ?? "";
    return this.modelService.createModel(content, this.languageService.createById(PROMPT_LANGUAGE_ID), resource);
  }
};
ChatPromptContentProvider = __decorate([
  __param(0, ITextModelService),
  __param(1, IModelService),
  __param(2, ILanguageService),
  __param(3, IChatPromptContentStore)
], ChatPromptContentProvider);
export {
  ChatPromptContentProvider
};
//# sourceMappingURL=chatPromptContentProvider.js.map
