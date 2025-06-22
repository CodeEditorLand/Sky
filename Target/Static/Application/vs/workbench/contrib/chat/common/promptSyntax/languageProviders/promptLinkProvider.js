var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IPromptsService } from "../service/promptsService.js";
import { assert } from "../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { FolderReference, NotPromptFile } from "../../promptFileReferenceErrors.js";
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
let PromptLinkProvider = class PromptLinkProvider2 {
  static {
    __name(this, "PromptLinkProvider");
  }
  constructor(promptsService) {
    this.promptsService = promptsService;
  }
  /**
   * Provide list of links for the provided text model.
   */
  async provideLinks(model, token) {
    assert(!token.isCancellationRequested, new CancellationError());
    const parser = this.promptsService.getSyntaxParserFor(model);
    assert(parser.isDisposed === false, "Prompt parser must not be disposed.");
    const { references } = await parser.start(token).settled();
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
  __param(0, IPromptsService)
], PromptLinkProvider);
export {
  PromptLinkProvider
};
//# sourceMappingURL=promptLinkProvider.js.map
