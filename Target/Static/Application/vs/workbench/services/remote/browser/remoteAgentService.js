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
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IRemoteAgentService } from "../common/remoteAgentService.js";
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { AbstractRemoteAgentService } from "../common/abstractRemoteAgentService.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Severity } from "../../../../platform/notification/common/notification.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IHostService } from "../../host/browser/host.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { IRemoteSocketFactoryService } from "../../../../platform/remote/common/remoteSocketFactoryService.js";
let RemoteAgentService = class RemoteAgentService2 extends AbstractRemoteAgentService {
  static {
    __name(this, "RemoteAgentService");
  }
  constructor(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
    super(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService);
  }
};
RemoteAgentService = __decorate([
  __param(0, IRemoteSocketFactoryService),
  __param(1, IUserDataProfileService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, IProductService),
  __param(4, IRemoteAuthorityResolverService),
  __param(5, ISignService),
  __param(6, ILogService)
], RemoteAgentService);
let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution2 {
  static {
    __name(this, "RemoteConnectionFailureNotificationContribution");
  }
  static {
    this.ID = "workbench.contrib.browserRemoteConnectionFailureNotification";
  }
  constructor(remoteAgentService, _dialogService, _hostService) {
    this._dialogService = _dialogService;
    this._hostService = _hostService;
    remoteAgentService.getRawEnvironment().then(void 0, (err) => {
      if (!RemoteAuthorityResolverError.isHandled(err)) {
        this._presentConnectionError(err);
      }
    });
  }
  async _presentConnectionError(err) {
    await this._dialogService.prompt({
      type: Severity.Error,
      message: nls.localize("connectionError", "An unexpected error occurred that requires a reload of this page."),
      detail: nls.localize("connectionErrorDetail", "The workbench failed to connect to the server (Error: {0})", err ? err.message : ""),
      buttons: [
        {
          label: nls.localize({ key: "reload", comment: ["&& denotes a mnemonic"] }, "&&Reload"),
          run: /* @__PURE__ */ __name(() => this._hostService.reload(), "run")
        }
      ]
    });
  }
};
RemoteConnectionFailureNotificationContribution = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IDialogService),
  __param(2, IHostService)
], RemoteConnectionFailureNotificationContribution);
registerWorkbenchContribution2(
  RemoteConnectionFailureNotificationContribution.ID,
  RemoteConnectionFailureNotificationContribution,
  2
  /* WorkbenchPhase.BlockRestore */
);
export {
  RemoteAgentService
};
//# sourceMappingURL=remoteAgentService.js.map
