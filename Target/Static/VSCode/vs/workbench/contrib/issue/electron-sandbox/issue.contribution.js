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
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IQuickAccessRegistry, Extensions as QuickAccessExtensions } from "../../../../platform/quickinput/common/quickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions, IWorkbenchContributionsRegistry } from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IssueQuickAccess } from "../browser/issueQuickAccess.js";
import "../browser/issueTroubleshoot.js";
import { BaseIssueContribution } from "../common/issue.contribution.js";
import { IIssueFormService, IWorkbenchIssueService, IssueType } from "../common/issue.js";
import { NativeIssueService } from "./issueService.js";
import { NativeIssueFormService } from "./nativeIssueFormService.js";
import "./processMainService.js";
registerSingleton(IWorkbenchIssueService, NativeIssueService, InstantiationType.Delayed);
registerSingleton(IIssueFormService, NativeIssueFormService, InstantiationType.Delayed);
let NativeIssueContribution = class extends BaseIssueContribution {
  static {
    __name(this, "NativeIssueContribution");
  }
  constructor(productService, configurationService) {
    super(productService, configurationService);
    if (!configurationService.getValue("telemetry.feedback.enabled")) {
      return;
    }
    if (productService.reportIssueUrl) {
      this._register(registerAction2(ReportPerformanceIssueUsingReporterAction));
    }
    let disposable;
    const registerQuickAccessProvider = /* @__PURE__ */ __name(() => {
      disposable = Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
        ctor: IssueQuickAccess,
        prefix: IssueQuickAccess.PREFIX,
        contextKey: "inReportIssuePicker",
        placeholder: localize("tasksQuickAccessPlaceholder", "Type the name of an extension to report on."),
        helpEntries: [{
          description: localize("openIssueReporter", "Open Issue Reporter"),
          commandId: "workbench.action.openIssueReporter"
        }]
      });
    }, "registerQuickAccessProvider");
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (!configurationService.getValue("extensions.experimental.issueQuickAccess") && disposable) {
        disposable.dispose();
        disposable = void 0;
      } else if (!disposable) {
        registerQuickAccessProvider();
      }
    }));
    if (configurationService.getValue("extensions.experimental.issueQuickAccess")) {
      registerQuickAccessProvider();
    }
  }
};
NativeIssueContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], NativeIssueContribution);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(NativeIssueContribution, LifecyclePhase.Restored);
class ReportPerformanceIssueUsingReporterAction extends Action2 {
  static {
    __name(this, "ReportPerformanceIssueUsingReporterAction");
  }
  static ID = "workbench.action.reportPerformanceIssueUsingReporter";
  constructor() {
    super({
      id: ReportPerformanceIssueUsingReporterAction.ID,
      title: localize2({ key: "reportPerformanceIssue", comment: [`Here, 'issue' means problem or bug`] }, "Report Performance Issue..."),
      category: Categories.Help,
      f1: true
    });
  }
  async run(accessor) {
    const issueService = accessor.get(IWorkbenchIssueService);
    return issueService.openReporter({ issueType: IssueType.PerformanceIssue });
  }
}
//# sourceMappingURL=issue.contribution.js.map
