var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseLocalizationWorkbenchContribution } from "../common/localization.contribution.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
class WebLocalizationWorkbenchContribution extends BaseLocalizationWorkbenchContribution {
  static {
    __name(this, "WebLocalizationWorkbenchContribution");
  }
}
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(WebLocalizationWorkbenchContribution, LifecyclePhase.Eventually);
export {
  WebLocalizationWorkbenchContribution
};
//# sourceMappingURL=localization.contribution.js.map
