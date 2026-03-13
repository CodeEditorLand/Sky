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
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IRemoteUserDataProfilesService } from "../../userDataProfile/common/remoteUserDataProfiles.js";
import { WorkbenchMcpManagementService as BaseWorkbenchMcpManagementService, IWorkbenchMcpManagementService } from "../common/mcpWorkbenchManagementService.js";
import { McpManagementService } from "../../../../platform/mcp/common/mcpManagementService.js";
import { IAllowedMcpServersService } from "../../../../platform/mcp/common/mcpManagement.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let WorkbenchMcpManagementService = class WorkbenchMcpManagementService2 extends BaseWorkbenchMcpManagementService {
  static {
    __name(this, "WorkbenchMcpManagementService");
  }
  constructor(allowedMcpServersService, logService, userDataProfileService, uriIdentityService, workspaceContextService, remoteAgentService, userDataProfilesService, remoteUserDataProfilesService, instantiationService) {
    const mMcpManagementService = instantiationService.createInstance(McpManagementService);
    super(mMcpManagementService, allowedMcpServersService, logService, userDataProfileService, uriIdentityService, workspaceContextService, remoteAgentService, userDataProfilesService, remoteUserDataProfilesService, instantiationService);
    this._register(mMcpManagementService);
  }
};
WorkbenchMcpManagementService = __decorate([
  __param(0, IAllowedMcpServersService),
  __param(1, ILogService),
  __param(2, IUserDataProfileService),
  __param(3, IUriIdentityService),
  __param(4, IWorkspaceContextService),
  __param(5, IRemoteAgentService),
  __param(6, IUserDataProfilesService),
  __param(7, IRemoteUserDataProfilesService),
  __param(8, IInstantiationService)
], WorkbenchMcpManagementService);
registerSingleton(
  IWorkbenchMcpManagementService,
  WorkbenchMcpManagementService,
  1
  /* InstantiationType.Delayed */
);
export {
  WorkbenchMcpManagementService
};
//# sourceMappingURL=mcpWorkbenchManagementService.js.map
