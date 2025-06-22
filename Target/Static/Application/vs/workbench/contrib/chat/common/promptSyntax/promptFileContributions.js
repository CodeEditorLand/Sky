var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ConfigMigration } from "./config/configMigration.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../../common/contributions.js";
import { PromptLinkProvider } from "./languageProviders/promptLinkProvider.js";
import { PromptLinkDiagnosticsInstanceManager } from "./languageProviders/promptLinkDiagnosticsProvider.js";
import { PromptHeaderDiagnosticsInstanceManager } from "./languageProviders/promptHeaderDiagnosticsProvider.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { PromptPathAutocompletion } from "./languageProviders/promptPathAutocompletion.js";
function registerPromptFileContributions() {
  registerContribution(PromptLinkProvider);
  registerContribution(PromptLinkDiagnosticsInstanceManager);
  registerContribution(PromptHeaderDiagnosticsInstanceManager);
  if (!isWindows) {
    registerContribution(PromptPathAutocompletion);
  }
  registerContribution(ConfigMigration);
}
__name(registerPromptFileContributions, "registerPromptFileContributions");
function registerContribution(contribution) {
  Registry.as(Extensions.Workbench).registerWorkbenchContribution(
    contribution,
    4
    /* LifecyclePhase.Eventually */
  );
}
__name(registerContribution, "registerContribution");
export {
  registerPromptFileContributions
};
//# sourceMappingURL=promptFileContributions.js.map
