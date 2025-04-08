var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AsyncIterableObject } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { registerModelAndPositionCommand } from "../../../browser/editorExtensions.js";
import { Position } from "../../../common/core/position.js";
import { ITextModel } from "../../../common/model.js";
import { Hover, HoverProvider } from "../../../common/languages.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
class HoverProviderResult {
  constructor(provider, hover, ordinal) {
    this.provider = provider;
    this.hover = hover;
    this.ordinal = ordinal;
  }
  static {
    __name(this, "HoverProviderResult");
  }
}
async function executeProvider(provider, ordinal, model, position, token) {
  const result = await Promise.resolve(provider.provideHover(model, position, token)).catch(onUnexpectedExternalError);
  if (!result || !isValid(result)) {
    return void 0;
  }
  return new HoverProviderResult(provider, result, ordinal);
}
__name(executeProvider, "executeProvider");
function getHoverProviderResultsAsAsyncIterable(registry, model, position, token, recursive = false) {
  const providers = registry.ordered(model, recursive);
  const promises = providers.map((provider, index) => executeProvider(provider, index, model, position, token));
  return AsyncIterableObject.fromPromisesResolveOrder(promises).coalesce();
}
__name(getHoverProviderResultsAsAsyncIterable, "getHoverProviderResultsAsAsyncIterable");
function getHoversPromise(registry, model, position, token, recursive = false) {
  return getHoverProviderResultsAsAsyncIterable(registry, model, position, token, recursive).map((item) => item.hover).toPromise();
}
__name(getHoversPromise, "getHoversPromise");
registerModelAndPositionCommand("_executeHoverProvider", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  return getHoversPromise(languageFeaturesService.hoverProvider, model, position, CancellationToken.None);
});
registerModelAndPositionCommand("_executeHoverProvider_recursive", (accessor, model, position) => {
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  return getHoversPromise(languageFeaturesService.hoverProvider, model, position, CancellationToken.None, true);
});
function isValid(result) {
  const hasRange = typeof result.range !== "undefined";
  const hasHtmlContent = typeof result.contents !== "undefined" && result.contents && result.contents.length > 0;
  return hasRange && hasHtmlContent;
}
__name(isValid, "isValid");
export {
  HoverProviderResult,
  getHoverProviderResultsAsAsyncIterable,
  getHoversPromise
};
//# sourceMappingURL=getHover.js.map
