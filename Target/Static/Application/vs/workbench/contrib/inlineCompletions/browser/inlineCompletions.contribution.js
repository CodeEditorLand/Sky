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
import { withoutDuplicates } from "../../../../base/common/arrays.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableFromEvent } from "../../../../base/common/observable.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { inlineCompletionProviderGetMatcher, providerIdSchemaUri } from "../../../../editor/contrib/inlineCompletions/browser/controller/commands.js";
import { Extensions } from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { wrapInHotClass1 } from "../../../../platform/observable/common/wrapInHotClass.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { InlineCompletionLanguageStatusBarContribution } from "./inlineCompletionLanguageStatusBarContribution.js";
registerWorkbenchContribution2(
  InlineCompletionLanguageStatusBarContribution.Id,
  wrapInHotClass1(InlineCompletionLanguageStatusBarContribution.hot),
  4
  /* WorkbenchPhase.Eventually */
);
let InlineCompletionSchemaContribution = class InlineCompletionSchemaContribution2 extends Disposable {
  static {
    __name(this, "InlineCompletionSchemaContribution");
  }
  static {
    this.Id = "vs.contrib.InlineCompletionSchemaContribution";
  }
  constructor(_languageFeaturesService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    const registry = Registry.as(Extensions.JSONContribution);
    const inlineCompletionsProvider = observableFromEvent(this, this._languageFeaturesService.inlineCompletionsProvider.onDidChange, () => this._languageFeaturesService.inlineCompletionsProvider.allNoModel());
    this._register(autorun((reader) => {
      const provider = inlineCompletionsProvider.read(reader);
      registry.registerSchema(providerIdSchemaUri, {
        enum: withoutDuplicates(provider.flatMap((p) => inlineCompletionProviderGetMatcher(p)))
      }, reader.store);
    }));
  }
};
InlineCompletionSchemaContribution = __decorate([
  __param(0, ILanguageFeaturesService)
], InlineCompletionSchemaContribution);
registerWorkbenchContribution2(
  InlineCompletionSchemaContribution.Id,
  InlineCompletionSchemaContribution,
  4
  /* WorkbenchPhase.Eventually */
);
export {
  InlineCompletionSchemaContribution
};
//# sourceMappingURL=inlineCompletions.contribution.js.map
