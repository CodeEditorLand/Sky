import './media/sessionsTitleBarWidget.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMenuService, SubmenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IChatSessionsService } from '../../../../workbench/contrib/chat/common/chatSessionsService.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { IActionViewItemService } from '../../../../platform/actions/browser/actionViewItemService.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { ISessionsManagementService } from './sessionsManagementService.js';
import { IChatService } from '../../../../workbench/contrib/chat/common/chatService/chatService.js';
/**
 * Sessions Title Bar Widget - renders the active chat session title
 * in the command center of the agent sessions workbench.
 *
 * Shows the current chat session label as a clickable pill with:
 * - Kind icon at the beginning (provider type icon)
 * - Session title
 * - Repository folder name
 *
 * Session actions (changes, terminal, etc.) are rendered via the
 * SessionTitleActions menu toolbar next to the session title.
 *
 * On click, opens the sessions picker.
 */
export declare class SessionsTitleBarWidget extends BaseActionViewItem {
    private readonly instantiationService;
    private readonly hoverService;
    private readonly activeSessionService;
    private readonly chatService;
    private readonly agentSessionsService;
    private readonly contextMenuService;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly chatSessionsService;
    private _container;
    private readonly _dynamicDisposables;
    private readonly _modelChangeListener;
    /** Cached render state to avoid unnecessary DOM rebuilds */
    private _lastRenderState;
    /** Guard to prevent re-entrant rendering */
    private _isRendering;
    constructor(action: SubmenuItemAction, options: IBaseActionViewItemOptions | undefined, instantiationService: IInstantiationService, hoverService: IHoverService, activeSessionService: ISessionsManagementService, chatService: IChatService, agentSessionsService: IAgentSessionsService, contextMenuService: IContextMenuService, menuService: IMenuService, contextKeyService: IContextKeyService, chatSessionsService: IChatSessionsService);
    render(container: HTMLElement): void;
    setFocusable(_focusable: boolean): void;
    onClick(): void;
    private _render;
    /**
     * Track title changes on the chat model for the given session resource.
     * When the model title changes, re-render the widget.
     */
    private _trackModelTitleChanges;
    /**
     * Get the label of the active chat session.
     */
    private _getActiveSessionLabel;
    /**
     * Get the icon for the active session's kind/provider.
     */
    private _getActiveSessionIcon;
    /**
     * Get the repository label for the active session.
     */
    private _getRepositoryLabel;
    private _showContextMenu;
    /**
     * Get the changes summary for the active session.
     */
    private _getChangesSummary;
    private _showSessionsPicker;
}
/**
 * Provides custom rendering for the sessions title bar widget
 * in the command center. Uses IActionViewItemService to render a custom widget
 * for the TitleBarControlMenu submenu.
 */
export declare class SessionsTitleBarContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.agentSessionsTitleBar";
    constructor(actionViewItemService: IActionViewItemService, instantiationService: IInstantiationService);
}
