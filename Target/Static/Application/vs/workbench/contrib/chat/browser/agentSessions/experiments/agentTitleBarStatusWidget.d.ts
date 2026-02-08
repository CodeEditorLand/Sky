import './media/agenttitlebarstatuswidget.css';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IAgentTitleBarStatusService } from './agentTitleBarStatusService.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IAgentSessionsService } from '../agentSessionsService.js';
import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../../../base/common/actions.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { IWorkspaceContextService } from '../../../../../../platform/workspace/common/workspace.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../../../services/environment/browser/environmentService.js';
import { IEditorGroupsService } from '../../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IMenuService } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../../../common/contributions.js';
import { IActionViewItemService } from '../../../../../../platform/actions/browser/actionViewItemService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { IChatWidgetService } from '../../chat.js';
/**
 * Agent Status Widget - renders agent status in the command center.
 *
 * Shows two different states:
 * 1. Default state: Copilot icon pill (turns blue with in-progress count when agents are running)
 * 2. Agent Session Projection state: Session title + close button (when viewing a session)
 *
 * The command center search box and navigation controls remain visible alongside this control.
 */
export declare class AgentTitleBarStatusWidget extends BaseActionViewItem {
    private readonly instantiationService;
    private readonly agentTitleBarStatusService;
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
    private readonly configurationService;
    private readonly chatEntitlementService;
    private readonly chatWidgetService;
    private _container;
    private readonly _dynamicDisposables;
    /** The currently displayed in-progress session (if any) - clicking pill opens this */
    private _displayedSession;
    /** Cached render state to avoid unnecessary DOM rebuilds */
    private _lastRenderState;
    /** Guard to prevent re-entrant rendering */
    private _isRendering;
    /** First focusable element for keyboard navigation */
    private _firstFocusableElement;
    /** Tracks if this window applied a badge filter (unread/inProgress), so we only auto-clear our own filters */
    private _badgeFilterAppliedByThisWindow;
    /** Reusable menu for CommandCenterCenter items (e.g., debug toolbar) */
    private readonly _commandCenterMenu;
    /** Menu for ChatTitleBarMenu items (same as chat controls dropdown) */
    private readonly _chatTitleBarMenu;
    constructor(action: IAction, options: IBaseActionViewItemOptions | undefined, instantiationService: IInstantiationService, agentTitleBarStatusService: IAgentTitleBarStatusService, hoverService: IHoverService, commandService: ICommandService, keybindingService: IKeybindingService, agentSessionsService: IAgentSessionsService, labelService: ILabelService, workspaceContextService: IWorkspaceContextService, environmentService: IBrowserWorkbenchEnvironmentService, editorGroupsService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, contextKeyService: IContextKeyService, storageService: IStorageService, configurationService: IConfigurationService, chatEntitlementService: IChatEntitlementService, chatWidgetService: IChatWidgetService);
    render(container: HTMLElement): void;
    setFocusable(_focusable: boolean): void;
    focus(): void;
    blur(): void;
    private _render;
    /**
     * Get computed session statistics for rendering.
     * Respects the current provider (session type) filter when calculating counts.
     */
    private _getSessionStats;
    private _renderChatInputMode;
    private _renderSessionMode;
    /**
     * Render session ready mode - shows session title + enter projection button.
     * Used when a projection-capable session is available but not yet entered.
     */
    private _renderSessionReadyMode;
    /**
     * Render badge-only mode - just the status badge without the full pill.
     * Used when Agent Status is enabled but Enhanced Agent Status is not.
     */
    private _renderBadgeOnlyMode;
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
     * Render the status badge showing in-progress, needs-input, and/or unread session counts.
     * Shows split UI with sparkle icon on left, then unread, needs-input, and active indicators.
     * Always renders the sparkle icon section.
     */
    private _renderStatusBadge;
    /**
     * Clear the filter if the currently filtered category becomes empty.
     * For example, if filtered to "unread" but no unread sessions exist, restore user's previous filter.
     * Only auto-clears if THIS window applied the badge filter to avoid cross-window interference.
     */
    private _clearFilterIfCategoryEmpty;
    /**
     * Get the current filter state from storage.
     */
    private _getCurrentFilterState;
    /**
     * Get the stored filter object from storage.
     */
    private _getStoredFilter;
    /**
     * Store a filter object to storage.
     */
    private _storeFilter;
    /**
     * Clear all filters (reset to default).
     */
    private _clearFilter;
    /**
     * Save the current user filter before we override it with a badge filter.
     * Only saves if the current filter is NOT already a badge filter (unread or in-progress).
     * This preserves the original user filter when switching between badge filters.
     */
    private _saveUserFilter;
    /**
     * Restore the user's previous filter (saved before we applied a badge filter).
     */
    private _restoreUserFilter;
    /**
     * Opens the agent sessions view with a specific filter applied, or restores previous filter if already applied.
     * Preserves session type (provider) filters while toggling only status filters.
     * @param filterType 'unread' to show only unread sessions, 'inProgress' to show only in-progress sessions
     */
    private _openSessionsWithFilter;
    /**
     * Render the escape button for exiting session projection mode.
     */
    private _renderEscapeButton;
    /**
     * Render the enter button for entering session projection mode.
     */
    private _renderEnterButton;
    /**
     * Handle pill click - opens the displayed session if showing progress, otherwise opens unified quick access
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
/**
 * Provides custom rendering for the agent status in the command center.
 * Uses IActionViewItemService to render a custom AgentStatusWidget
 * for the AgentsControlMenu submenu.
 * Also adds CSS classes to the workbench based on settings.
 */
export declare class AgentTitleBarStatusRendering extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.agentStatus.rendering";
    constructor(actionViewItemService: IActionViewItemService, instantiationService: IInstantiationService, configurationService: IConfigurationService);
}
