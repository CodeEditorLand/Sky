import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceEditingService } from '../../../../workbench/services/workspaces/common/workspaceEditing.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class WorkspaceFolderManagementContribution extends Disposable implements IWorkbenchContribution {
    private readonly sessionManagementService;
    private readonly uriIdentityService;
    private readonly workspaceContextService;
    private readonly workspaceEditingService;
    private readonly workspaceTrustManagementService;
    static readonly ID = "workbench.contrib.workspaceFolderManagement";
    constructor(sessionManagementService: ISessionsManagementService, uriIdentityService: IUriIdentityService, workspaceContextService: IWorkspaceContextService, workspaceEditingService: IWorkspaceEditingService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
    private updateWorkspaceFoldersForSession;
    private getActiveSessionFolderData;
    private manageTrustWorkspaceForSession;
    private isUriTrusted;
}
