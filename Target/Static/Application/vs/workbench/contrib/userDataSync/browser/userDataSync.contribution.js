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
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { UserDataSyncWorkbenchContribution } from "./userDataSync.js";
import { IUserDataAutoSyncService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { isWeb } from "../../../../base/common/platform.js";
import { UserDataSyncTrigger } from "./userDataSyncTrigger.js";
import { toAction } from "../../../../base/common/actions.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { SHOW_SYNC_LOG_COMMAND_ID } from "../../../services/userDataSync/common/userDataSync.js";
let UserDataSyncReportIssueContribution = class UserDataSyncReportIssueContribution2 extends Disposable {
  static {
    __name(this, "UserDataSyncReportIssueContribution");
  }
  constructor(userDataAutoSyncService, notificationService, productService, commandService, hostService) {
    super();
    this.notificationService = notificationService;
    this.productService = productService;
    this.commandService = commandService;
    this.hostService = hostService;
    this._register(userDataAutoSyncService.onError((error) => this.onAutoSyncError(error)));
  }
  onAutoSyncError(error) {
    switch (error.code) {
      case "LocalTooManyRequests": {
        const message = isWeb ? localize({ key: "local too many requests - reload", comment: ["Settings Sync is the name of the feature"] }, "Settings sync is suspended temporarily because the current device is making too many requests. Please reload {0} to resume.", this.productService.nameLong) : localize({ key: "local too many requests - restart", comment: ["Settings Sync is the name of the feature"] }, "Settings sync is suspended temporarily because the current device is making too many requests. Please restart {0} to resume.", this.productService.nameLong);
        this.notificationService.notify({
          severity: Severity.Error,
          message,
          actions: {
            primary: [
              toAction({
                id: "Show Sync Logs",
                label: localize("show sync logs", "Show Log"),
                run: /* @__PURE__ */ __name(() => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID), "run")
              }),
              toAction({
                id: "Restart",
                label: isWeb ? localize("reload", "Reload") : localize("restart", "Restart"),
                run: /* @__PURE__ */ __name(() => this.hostService.restart(), "run")
              })
            ]
          }
        });
        return;
      }
      case "RemoteTooManyRequests": {
        const operationId = error.operationId ? localize("operationId", "Operation Id: {0}", error.operationId) : void 0;
        const message = localize({ key: "server too many requests", comment: ["Settings Sync is the name of the feature"] }, "Settings sync is disabled because the current device is making too many requests. Please wait for 10 minutes and turn on sync.");
        this.notificationService.notify({
          severity: Severity.Error,
          message: operationId ? `${message} ${operationId}` : message,
          source: error.operationId ? localize("settings sync", "Settings Sync. Operation Id: {0}", error.operationId) : void 0,
          actions: {
            primary: [
              toAction({
                id: "Show Sync Logs",
                label: localize("show sync logs", "Show Log"),
                run: /* @__PURE__ */ __name(() => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID), "run")
              })
            ]
          }
        });
        return;
      }
    }
  }
};
UserDataSyncReportIssueContribution = __decorate([
  __param(0, IUserDataAutoSyncService),
  __param(1, INotificationService),
  __param(2, IProductService),
  __param(3, ICommandService),
  __param(4, IHostService)
], UserDataSyncReportIssueContribution);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(
  UserDataSyncWorkbenchContribution,
  3
  /* LifecyclePhase.Restored */
);
workbenchRegistry.registerWorkbenchContribution(
  UserDataSyncTrigger,
  4
  /* LifecyclePhase.Eventually */
);
workbenchRegistry.registerWorkbenchContribution(
  UserDataSyncReportIssueContribution,
  4
  /* LifecyclePhase.Eventually */
);
//# sourceMappingURL=userDataSync.contribution.js.map
