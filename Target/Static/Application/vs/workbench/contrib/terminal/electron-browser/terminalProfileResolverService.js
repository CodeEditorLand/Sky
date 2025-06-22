var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ErrorNoTelemetry } from "../../../../base/common/errors.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ITerminalLogService } from "../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ITerminalInstanceService } from "../browser/terminal.js";
import { BaseTerminalProfileResolverService } from "../browser/terminalProfileResolverService.js";
import { ITerminalProfileService } from "../common/terminal.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
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
let ElectronTerminalProfileResolverService = class ElectronTerminalProfileResolverService2 extends BaseTerminalProfileResolverService {
  static {
    __name(this, "ElectronTerminalProfileResolverService");
  }
  constructor(configurationResolverService, configurationService, historyService, logService, workspaceContextService, terminalProfileService, remoteAgentService, terminalInstanceService) {
    super({
      getDefaultSystemShell: /* @__PURE__ */ __name(async (remoteAuthority, platform) => {
        const backend = await terminalInstanceService.getBackend(remoteAuthority);
        if (!backend) {
          throw new ErrorNoTelemetry(`Cannot get default system shell when there is no backend for remote authority '${remoteAuthority}'`);
        }
        return backend.getDefaultSystemShell(platform);
      }, "getDefaultSystemShell"),
      getEnvironment: /* @__PURE__ */ __name(async (remoteAuthority) => {
        const backend = await terminalInstanceService.getBackend(remoteAuthority);
        if (!backend) {
          throw new ErrorNoTelemetry(`Cannot get environment when there is no backend for remote authority '${remoteAuthority}'`);
        }
        return backend.getEnvironment();
      }, "getEnvironment")
    }, configurationService, configurationResolverService, historyService, logService, terminalProfileService, workspaceContextService, remoteAgentService);
  }
};
ElectronTerminalProfileResolverService = __decorate([
  __param(0, IConfigurationResolverService),
  __param(1, IConfigurationService),
  __param(2, IHistoryService),
  __param(3, ITerminalLogService),
  __param(4, IWorkspaceContextService),
  __param(5, ITerminalProfileService),
  __param(6, IRemoteAgentService),
  __param(7, ITerminalInstanceService)
], ElectronTerminalProfileResolverService);
export {
  ElectronTerminalProfileResolverService
};
//# sourceMappingURL=terminalProfileResolverService.js.map
