var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IWorkbenchIssueService } from "./issue.js";
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
const OpenIssueReporterActionId = "workbench.action.openIssueReporter";
const OpenIssueReporterApiId = "vscode.openIssueReporter";
const OpenIssueReporterCommandMetadata = {
  description: "Open the issue reporter and optionally prefill part of the form.",
  args: [
    {
      name: "options",
      description: "Data to use to prefill the issue reporter with.",
      isOptional: true,
      schema: {
        oneOf: [
          {
            type: "string",
            description: "The extension id to preselect."
          },
          {
            type: "object",
            properties: {
              extensionId: {
                type: "string"
              },
              issueTitle: {
                type: "string"
              },
              issueBody: {
                type: "string"
              }
            }
          }
        ]
      }
    }
  ]
};
let BaseIssueContribution = class BaseIssueContribution2 extends Disposable {
  static {
    __name(this, "BaseIssueContribution");
  }
  constructor(productService, configurationService) {
    super();
    if (!configurationService.getValue("telemetry.feedback.enabled")) {
      this._register(CommandsRegistry.registerCommand({
        id: "workbench.action.openIssueReporter",
        handler: /* @__PURE__ */ __name(function(accessor) {
          const data = accessor.get(INotificationService);
          data.info("Feedback is disabled.");
        }, "handler")
      }));
      return;
    }
    if (!productService.reportIssueUrl) {
      return;
    }
    this._register(CommandsRegistry.registerCommand({
      id: OpenIssueReporterActionId,
      handler: /* @__PURE__ */ __name(function(accessor, args) {
        const data = typeof args === "string" ? { extensionId: args } : Array.isArray(args) ? { extensionId: args[0] } : args ?? {};
        return accessor.get(IWorkbenchIssueService).openReporter(data);
      }, "handler"),
      metadata: OpenIssueReporterCommandMetadata
    }));
    this._register(CommandsRegistry.registerCommand({
      id: OpenIssueReporterApiId,
      handler: /* @__PURE__ */ __name(function(accessor, args) {
        const data = typeof args === "string" ? { extensionId: args } : Array.isArray(args) ? { extensionId: args[0] } : args ?? {};
        return accessor.get(IWorkbenchIssueService).openReporter(data);
      }, "handler"),
      metadata: OpenIssueReporterCommandMetadata
    }));
    const reportIssue = {
      id: OpenIssueReporterActionId,
      title: localize2({ key: "reportIssueInEnglish", comment: ['Translate this to "Report Issue in English" in all languages please!'] }, "Report Issue..."),
      category: Categories.Help
    };
    this._register(MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: reportIssue }));
    this._register(MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
      group: "3_feedback",
      command: {
        id: OpenIssueReporterActionId,
        title: localize({ key: "miReportIssue", comment: ["&& denotes a mnemonic", 'Translate this to "Report Issue in English" in all languages please!'] }, "Report &&Issue")
      },
      order: 3
    }));
  }
};
BaseIssueContribution = __decorate([
  __param(0, IProductService),
  __param(1, IConfigurationService)
], BaseIssueContribution);
export {
  BaseIssueContribution
};
//# sourceMappingURL=issue.contribution.js.map
