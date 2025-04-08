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
import { LANGUAGE_SELECTOR } from "../constants.js";
import { IPromptsService } from "../service/types.js";
import { assert } from "../../../../../../base/common/assert.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { CancellationError } from "../../../../../../base/common/errors.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { FolderReference, NotPromptFile } from "../../promptFileReferenceErrors.js";
import { LifecyclePhase } from "../../../../../services/lifecycle/common/lifecycle.js";
import { ILink, ILinksList, LinkProvider } from "../../../../../../editor/common/languages.js";
import { IWorkbenchContributionsRegistry, Extensions } from "../../../../../common/contributions.js";
import { ILanguageFeaturesService } from "../../../../../../editor/common/services/languageFeatures.js";
let PromptLinkProvider = class extends Disposable {
  constructor(promptsService, languageService) {
    super();
    this.promptsService = promptsService;
    this.languageService = languageService;
    this._register(this.languageService.linkProvider.register(LANGUAGE_SELECTOR, this));
  }
  static {
    __name(this, "PromptLinkProvider");
  }
  /**
   * Provide list of links for the provided text model.
   */
  async provideLinks(model, token) {
    assert(
      !token.isCancellationRequested,
      new CancellationError()
    );
    const parser = this.promptsService.getSyntaxParserFor(model);
    assert(
      !parser.disposed,
      "Prompt parser must not be disposed."
    );
    const { references } = await parser.start().settled();
    assert(
      !token.isCancellationRequested,
      new CancellationError()
    );
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
      assertDefined(
        linkRange,
        "Link range must be defined."
      );
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
PromptLinkProvider = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, ILanguageFeaturesService)
], PromptLinkProvider);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(PromptLinkProvider, LifecyclePhase.Eventually);
export {
  PromptLinkProvider
};
//# sourceMappingURL=promptLinkProvider.js.map
