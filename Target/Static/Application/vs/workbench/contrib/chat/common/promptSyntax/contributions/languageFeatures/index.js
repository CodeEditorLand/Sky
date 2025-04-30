import { PromptLinkProvider } from "./providers/promptLinkProvider.js";
import { isWindows } from "../../../../../../../base/common/platform.js";
import { PromptPathAutocompletion } from "./providers/promptPathAutocompletion.js";
import { PromptLinkDiagnosticsInstanceManager } from "./providers/promptLinkDiagnosticsProvider.js";
import { PromptHeaderDiagnosticsInstanceManager } from "./providers/promptHeaderDiagnosticsProvider.js";
import { PromptDecorationsProviderInstanceManager } from "./providers/decorationsProvider/promptDecorationsProvider.js";
const CONTRIBUTIONS = [
  PromptLinkProvider,
  PromptLinkDiagnosticsInstanceManager,
  PromptHeaderDiagnosticsInstanceManager,
  PromptDecorationsProviderInstanceManager
];
if (isWindows === false) {
  CONTRIBUTIONS.push(PromptPathAutocompletion);
}
const LANGUAGE_FEATURE_CONTRIBUTIONS = Object.freeze(CONTRIBUTIONS);
export {
  LANGUAGE_FEATURE_CONTRIBUTIONS
};
//# sourceMappingURL=index.js.map
