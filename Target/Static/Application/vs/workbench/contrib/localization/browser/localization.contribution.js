var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseLocalizationWorkbenchContribution } from "../common/localization.contribution.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
class WebLocalizationWorkbenchContribution extends BaseLocalizationWorkbenchContribution {
  static {
    __name(this, "WebLocalizationWorkbenchContribution");
  }
}
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(
  WebLocalizationWorkbenchContribution,
  4
  /* LifecyclePhase.Eventually */
);
export {
  WebLocalizationWorkbenchContribution
};
//# sourceMappingURL=localization.contribution.js.map
