var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import * as nls from "../../../../nls.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../common/contributions.js";
import { IssueFormService } from "./issueFormService.js";
import { BrowserIssueService } from "./issueService.js";
import "./issueTroubleshoot.js";
import { IIssueFormService, IWorkbenchIssueService } from "../common/issue.js";
import { BaseIssueContribution } from "../common/issue.contribution.js";
let WebIssueContribution = class WebIssueContribution2 extends BaseIssueContribution {
  static {
    __name(this, "WebIssueContribution");
  }
  constructor(productService, configurationService) {
    super(productService, configurationService);
    Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
      properties: {
        "issueReporter.experimental.webReporter": {
          type: "boolean",
          default: productService.quality !== "stable",
          description: "Enable experimental issue reporter for web."
        }
      }
    });
  }
};
WebIssueContribution = __decorate([
  __param(0, IProductService),
  __param(1, IConfigurationService)
], WebIssueContribution);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(
  WebIssueContribution,
  3
  /* LifecyclePhase.Restored */
);
registerSingleton(
  IWorkbenchIssueService,
  BrowserIssueService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IIssueFormService,
  IssueFormService,
  1
  /* InstantiationType.Delayed */
);
CommandsRegistry.registerCommand("_issues.getSystemStatus", (accessor) => {
  return nls.localize("statusUnsupported", "The --status argument is not yet supported in browsers.");
});
//# sourceMappingURL=issue.contribution.js.map
