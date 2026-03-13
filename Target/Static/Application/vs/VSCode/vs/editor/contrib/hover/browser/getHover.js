var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AsyncIterableProducer } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { registerModelAndPositionCommand } from "../../../browser/editorExtensions.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
class HoverProviderResult {
  static {
    __name(this, "HoverProviderResult");
  }
  constructor(provider, hover, ordinal) {
    this.provider = provider;
    this.hover = hover;
    this.ordinal = ordinal;
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
  return AsyncIterableProducer.fromPromisesResolveOrder(promises).coalesce();
}
__name(getHoverProviderResultsAsAsyncIterable, "getHoverProviderResultsAsAsyncIterable");
async function getHoversPromise(registry, model, position, token, recursive = false) {
  const out = [];
  for await (const item of getHoverProviderResultsAsAsyncIterable(registry, model, position, token, recursive)) {
    out.push(item.hover);
  }
  return out;
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
