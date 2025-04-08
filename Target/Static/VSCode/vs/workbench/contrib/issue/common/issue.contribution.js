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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../nls.js";
import { ICommandAction } from "../../../../platform/action/common/action.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry, ICommandMetadata } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IssueReporterData, IWorkbenchIssueService } from "./issue.js";
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
let BaseIssueContribution = class extends Disposable {
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
BaseIssueContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService)
], BaseIssueContribution);
export {
  BaseIssueContribution
};
//# sourceMappingURL=issue.contribution.js.map
