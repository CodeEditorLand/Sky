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
import { IPromptsService } from "../../../service/types.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../../../base/common/types.js";
import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { CancellationError } from "../../../../../../../../base/common/errors.js";
import { PROMPT_AND_INSTRUCTIONS_LANGUAGE_SELECTOR } from "../../../constants.js";
import { FolderReference, NotPromptFile } from "../../../../promptFileReferenceErrors.js";
import { ILanguageFeaturesService } from "../../../../../../../../editor/common/services/languageFeatures.js";
let PromptLinkProvider = class PromptLinkProvider2 extends Disposable {
  static {
    __name(this, "PromptLinkProvider");
  }
  constructor(promptsService, languageService) {
    super();
    this.promptsService = promptsService;
    this.languageService = languageService;
    this._register(this.languageService.linkProvider.register(PROMPT_AND_INSTRUCTIONS_LANGUAGE_SELECTOR, this));
  }
  /**
   * Provide list of links for the provided text model.
   */
  async provideLinks(model, token) {
    assert(!token.isCancellationRequested, new CancellationError());
    const parser = this.promptsService.getSyntaxParserFor(model);
    assert(!parser.disposed, "Prompt parser must not be disposed.");
    const { references } = await parser.start().settled();
    assert(!token.isCancellationRequested, new CancellationError());
    const links = references.filter((reference) => {
      const { errorCondition, linkRange } = reference;
      if (!errorCondition && linkRange) {
        return true;
      }
      if (errorCondition instanceof FolderReference) {
        return false;
      }
      return errorCondition instanceof NotPromptFile;
    }).map((reference) => {
      const { uri, linkRange } = reference;
      assertDefined(linkRange, "Link range must be defined.");
      return {
        range: linkRange,
        url: uri
      };
    });
    return {
      links
    };
  }
};
PromptLinkProvider = __decorate([
  __param(0, IPromptsService),
  __param(1, ILanguageFeaturesService)
], PromptLinkProvider);
export {
  PromptLinkProvider
};
//# sourceMappingURL=promptLinkProvider.js.map
