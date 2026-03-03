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
import { IRemoteAgentService } from "../common/remoteAgentService.js";
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { AbstractRemoteAgentService } from "../common/abstractRemoteAgentService.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { URI } from "../../../../base/common/uri.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
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
    this.ID = "workbench.contrib.nativeRemoteConnectionFailureNotification";
  }
  constructor(_remoteAgentService, notificationService, environmentService, telemetryService, nativeHostService, _remoteAuthorityResolverService, openerService) {
    this._remoteAgentService = _remoteAgentService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._remoteAgentService.getRawEnvironment().then(void 0, (err) => {
      if (!RemoteAuthorityResolverError.isHandled(err)) {
        const choices = [
          {
            label: nls.localize("devTools", "Open Developer Tools"),
            run: /* @__PURE__ */ __name(() => nativeHostService.openDevTools(), "run")
          }
        ];
        const troubleshootingURL = this._getTroubleshootingURL();
        if (troubleshootingURL) {
          choices.push({
            label: nls.localize("directUrl", "Open in browser"),
            run: /* @__PURE__ */ __name(() => openerService.open(troubleshootingURL, { openExternal: true }), "run")
          });
        }
        notificationService.prompt(Severity.Error, nls.localize("connectionError", "Failed to connect to the remote extension host server (Error: {0})", err ? err.message : ""), choices);
      }
    });
  }
  _getTroubleshootingURL() {
    const remoteAgentConnection = this._remoteAgentService.getConnection();
    if (!remoteAgentConnection) {
      return null;
    }
    const connectionData = this._remoteAuthorityResolverService.getConnectionData(remoteAgentConnection.remoteAuthority);
    if (!connectionData || connectionData.connectTo.type !== 0) {
      return null;
    }
    return URI.from({
      scheme: "http",
      authority: `${connectionData.connectTo.host}:${connectionData.connectTo.port}`,
      path: `/version`
    });
  }
};
RemoteConnectionFailureNotificationContribution = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, INotificationService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, ITelemetryService),
  __param(4, INativeHostService),
  __param(5, IRemoteAuthorityResolverService),
  __param(6, IOpenerService)
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
