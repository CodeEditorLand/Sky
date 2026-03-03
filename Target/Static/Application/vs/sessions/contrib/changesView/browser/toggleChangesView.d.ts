import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { IChatService } from '../../../../workbench/contrib/chat/common/chatService/chatService.js';
import { IChatEditingService } from '../../../../workbench/contrib/chat/common/editing/chatEditingService.js';
import { IWorkbenchLayoutService } from '../../../../workbench/services/layout/browser/layoutService.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
import { IViewsService } from '../../../../workbench/services/views/common/viewsService.js';
export declare class ToggleChangesViewContribution extends Disposable {
    private readonly layoutService;
    private readonly sessionManagementService;
    private readonly chatEditingService;
    private readonly agentSessionsService;
    private readonly chatService;
    private readonly viewsService;
    static readonly ID = "workbench.contrib.toggleChangesView";
    private readonly pendingTurnStateByResource;
    constructor(layoutService: IWorkbenchLayoutService, sessionManagementService: ISessionsManagementService, chatEditingService: IChatEditingService, agentSessionsService: IAgentSessionsService, chatService: IChatService, viewsService: IViewsService);
    private hasSessionChanges;
    private syncAuxiliaryBarVisibility;
}
