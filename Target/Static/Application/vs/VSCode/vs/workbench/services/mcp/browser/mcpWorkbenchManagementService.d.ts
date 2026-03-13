import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IRemoteUserDataProfilesService } from '../../userDataProfile/common/remoteUserDataProfiles.js';
import { WorkbenchMcpManagementService as BaseWorkbenchMcpManagementService } from '../common/mcpWorkbenchManagementService.js';
import { IAllowedMcpServersService } from '../../../../platform/mcp/common/mcpManagement.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class WorkbenchMcpManagementService extends BaseWorkbenchMcpManagementService {
    constructor(allowedMcpServersService: IAllowedMcpServersService, logService: ILogService, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService, workspaceContextService: IWorkspaceContextService, remoteAgentService: IRemoteAgentService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, instantiationService: IInstantiationService);
}
