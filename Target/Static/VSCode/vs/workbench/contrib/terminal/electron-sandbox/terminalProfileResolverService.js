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
let ElectronTerminalProfileResolverService = class extends BaseTerminalProfileResolverService {
  static {
    __name(this, "ElectronTerminalProfileResolverService");
  }
  constructor(configurationResolverService, configurationService, historyService, logService, workspaceContextService, terminalProfileService, remoteAgentService, terminalInstanceService) {
    super(
      {
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
      },
      configurationService,
      configurationResolverService,
      historyService,
      logService,
      terminalProfileService,
      workspaceContextService,
      remoteAgentService
    );
  }
};
ElectronTerminalProfileResolverService = __decorateClass([
  __decorateParam(0, IConfigurationResolverService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHistoryService),
  __decorateParam(3, ITerminalLogService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, ITerminalProfileService),
  __decorateParam(6, IRemoteAgentService),
  __decorateParam(7, ITerminalInstanceService)
], ElectronTerminalProfileResolverService);
export {
  ElectronTerminalProfileResolverService
};
//# sourceMappingURL=terminalProfileResolverService.js.map
