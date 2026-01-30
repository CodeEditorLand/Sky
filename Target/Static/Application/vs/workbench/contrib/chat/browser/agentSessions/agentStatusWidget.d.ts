import './media/agentStatusWidget.css';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IAgentStatusService } from './agentStatusService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IAgentSessionsService } from './agentSessionsService.js';
import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../../base/common/actions.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../../services/environment/browser/environmentService.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
/**
 * Agent Status Widget - renders agent status in the command center.
 *
 * Shows two different states:
 * 1. Default state: Copilot icon pill (turns blue with in-progress count when agents are running)
 * 2. Agent Session Projection state: Session title + close button (when viewing a session)
 *
 * The command center search box and navigation controls remain visible alongside this control.
 */
export declare class AgentStatusWidget extends BaseActionViewItem {
    private readonly instantiationService;
    private readonly agentStatusService;
    private readonly hoverService;
    private readonly commandService;
    private readonly keybindingService;
    private readonly agentSessionsService;
    private readonly labelService;
    private readonly workspaceContextService;
    private readonly environmentService;
    private readonly editorGroupsService;
    private readonly editorService;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly storageService;
    private static readonly _quickOpenCommandId;
    private _container;
    private readonly _dynamicDisposables;
    /** The currently displayed in-progress session (if any) - clicking pill opens this */
    private _displayedSession;
    /** Cached render state to avoid unnecessary DOM rebuilds */
    private _lastRenderState;
    /** Reusable menu for CommandCenterCenter items (e.g., debug toolbar) */
    private readonly _commandCenterMenu;
    constructor(action: IAction, options: IBaseActionViewItemOptions | undefined, instantiationService: IInstantiationService, agentStatusService: IAgentStatusService, hoverService: IHoverService, commandService: ICommandService, keybindingService: IKeybindingService, agentSessionsService: IAgentSessionsService, labelService: ILabelService, workspaceContextService: IWorkspaceContextService, environmentService: IBrowserWorkbenchEnvironmentService, editorGroupsService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, contextKeyService: IContextKeyService, storageService: IStorageService);
    render(container: HTMLElement): void;
    private _render;
    /**
     * Get computed session statistics for rendering.
     */
    private _getSessionStats;
    private _renderChatInputMode;
    private _renderSessionMode;
    /**
     * Render command center toolbar items (like debug toolbar) that are registered to CommandCenter
     * Filters out the quick open action since we provide our own search UI.
     * Adds a dot separator after the toolbar if content was rendered.
     */
    private _renderCommandCenterToolbar;
    /**
     * Render the search button. If parent is provided, appends to parent; otherwise appends to container.
     */
    private _renderSearchButton;
    /**
     * Render the status badge showing in-progress and/or unread session counts.
     * Shows split UI with both indicators when both types exist.
     * When no notifications, shows a chat sparkle icon.
     */
    private _renderStatusBadge;
    /**
     * Clear the filter if the currently filtered category becomes empty.
     * For example, if filtered to "unread" but no unread sessions exist, clear the filter.
     */
    private _clearFilterIfCategoryEmpty;
    /**
     * Opens the agent sessions view with a specific filter applied, or clears filter if already applied.
     * @param filterType 'unread' to show only unread sessions, 'inProgress' to show only in-progress sessions
     */
    private _openSessionsWithFilter;
    /**
     * Render the escape button for exiting session projection mode.
     */
    private _renderEscapeButton;
    /**
     * Handle pill click - opens the displayed session if showing progress, otherwise executes default action
     */
    private _handlePillClick;
    /**
     * Get the session most urgently needing user attention (approval/confirmation/input).
     * Returns undefined if no sessions need attention.
     */
    private _getSessionNeedingAttention;
    /**
     * Compute the label to display, matching the command center behavior.
     * Includes prefix and suffix decorations (remote host, extension dev host, etc.)
     */
    private _getLabel;
    /**
     * Get prefix and suffix decorations for the title (matching WindowTitle behavior)
     */
    private _getTitleDecorations;
}
