var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IProcessService } from "../../../../platform/process/common/process.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Extensions as QuickAccessExtensions } from "../../../../platform/quickinput/common/quickAccess.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../common/contributions.js";
import { IssueQuickAccess } from "../browser/issueQuickAccess.js";
import "../browser/issueTroubleshoot.js";
import { BaseIssueContribution } from "../common/issue.contribution.js";
import { IIssueFormService, IWorkbenchIssueService } from "../common/issue.js";
import { NativeIssueService } from "./issueService.js";
import { NativeIssueFormService } from "./nativeIssueFormService.js";
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
registerSingleton(
  IWorkbenchIssueService,
  NativeIssueService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IIssueFormService,
  NativeIssueFormService,
  1
  /* InstantiationType.Delayed */
);
let NativeIssueContribution = class NativeIssueContribution2 extends BaseIssueContribution {
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
NativeIssueContribution = __decorate([
  __param(0, IProductService),
  __param(1, IConfigurationService)
], NativeIssueContribution);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(
  NativeIssueContribution,
  3
  /* LifecyclePhase.Restored */
);
class ReportPerformanceIssueUsingReporterAction extends Action2 {
  static {
    __name(this, "ReportPerformanceIssueUsingReporterAction");
  }
  static {
    this.ID = "workbench.action.reportPerformanceIssueUsingReporter";
  }
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
    return issueService.openReporter({
      issueType: 1
      /* IssueType.PerformanceIssue */
    });
  }
}
CommandsRegistry.registerCommand("_issues.getSystemStatus", (accessor) => {
  return accessor.get(IProcessService).getSystemStatus();
});
//# sourceMappingURL=issue.contribution.js.map
