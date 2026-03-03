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
import { PromptLinkProvider } from "./languageProviders/promptLinkProvider.js";
import { PromptBodyAutocompletion } from "./languageProviders/promptBodyAutocompletion.js";
import { PromptHeaderAutocompletion } from "./languageProviders/promptHeaderAutocompletion.js";
import { PromptHoverProvider } from "./languageProviders/promptHovers.js";
import { PromptHeaderDefinitionProvider } from "./languageProviders/PromptHeaderDefinitionProvider.js";
import { PromptValidatorContribution } from "./languageProviders/promptValidator.js";
import { PromptDocumentSemanticTokensProvider } from "./languageProviders/promptDocumentSemanticTokensProvider.js";
import { PromptCodeActionProvider } from "./languageProviders/promptCodeActions.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ALL_PROMPTS_LANGUAGE_SELECTOR } from "./promptTypes.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
let PromptLanguageFeaturesProvider = class PromptLanguageFeaturesProvider2 extends Disposable {
  static {
    __name(this, "PromptLanguageFeaturesProvider");
  }
  static {
    this.ID = "chat.promptLanguageFeatures";
  }
  constructor(languageService, instantiationService) {
    super();
    this._register(languageService.linkProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptLinkProvider)));
    this._register(languageService.completionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptBodyAutocompletion)));
    this._register(languageService.completionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHeaderAutocompletion)));
    this._register(languageService.hoverProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHoverProvider)));
    this._register(languageService.definitionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHeaderDefinitionProvider)));
    this._register(languageService.documentSemanticTokensProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptDocumentSemanticTokensProvider)));
    this._register(languageService.codeActionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptCodeActionProvider)));
    this._register(instantiationService.createInstance(PromptValidatorContribution));
  }
};
PromptLanguageFeaturesProvider = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IInstantiationService)
], PromptLanguageFeaturesProvider);
export {
  PromptLanguageFeaturesProvider
};
//# sourceMappingURL=promptFileContributions.js.map
