var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ConfigMigration } from "./configMigration.js";
import { LANGUAGE_FEATURE_CONTRIBUTIONS } from "./languageFeatures/index.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../../../common/contributions.js";
const registerPromptFileContributions = /* @__PURE__ */ __name(() => {
  registerContributions(LANGUAGE_FEATURE_CONTRIBUTIONS);
  registerContribution(ConfigMigration);
}, "registerPromptFileContributions");
const registerContribution = /* @__PURE__ */ __name((contribution) => {
  Registry.as(Extensions.Workbench).registerWorkbenchContribution(
    contribution,
    4
    /* LifecyclePhase.Eventually */
  );
}, "registerContribution");
const registerContributions = /* @__PURE__ */ __name((contributions) => {
  contributions.map(registerContribution);
}, "registerContributions");
export {
  registerPromptFileContributions
};
//# sourceMappingURL=index.js.map
