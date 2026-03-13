import './media/unifiedQuickAccess.css';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IQuickInputService } from '../../../../../../platform/quickinput/common/quickInput.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { ILayoutService } from '../../../../../../platform/layout/browser/layoutService.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
/**
 * Tab configuration for the unified quick access widget.
 */
export interface IUnifiedQuickAccessTab {
    /** Unique identifier for the tab */
    readonly id: string;
    /** Display label for the tab */
    readonly label: string;
    /** Quick access provider prefix (e.g., '' for files, '>' for commands, 'agent ' for sessions) */
    readonly prefix: string;
    /** Placeholder text when this tab is active */
    readonly placeholder: string;
    /** Tooltip for the tab */
    readonly tooltip?: string;
    /** Whether this is the special Send tab (no provider, just sends query) */
    readonly isSendTab?: boolean;
}
/**
 * Default tabs for the unified quick access widget.
 */
export declare const DEFAULT_UNIFIED_QUICK_ACCESS_TABS: IUnifiedQuickAccessTab[];
/**
 * Service for showing a unified quick access widget with multiple tabs.
 * Combines multiple QuickAccessProviders into a single tabbed interface.
 */
export declare class UnifiedQuickAccess extends Disposable {
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly layoutService;
    private readonly commandService;
    private readonly keybindingService;
    private readonly hoverService;
    private readonly registry;
    private readonly mapProviderToDescriptor;
    private _currentPicker;
    private _currentDisposables;
    private _providerDisposables;
    private _currentTab;
    private _providerCts;
    private _tabBarContainer;
    private _isInternalValueChange;
    private _isUpdatingSendToAgent;
    private _arrivedViaShortcut;
    private _sendToAgentTimeout;
    private _sendButton;
    private _sendButtonLabel;
    private _sendButtonIcon;
    private _sendButtonHover;
    private readonly _tabs;
    constructor(tabs: IUnifiedQuickAccessTab[] | undefined, quickInputService: IQuickInputService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, layoutService: ILayoutService, commandService: ICommandService, keybindingService: IKeybindingService, hoverService: IHoverService);
    /**
     * Show the unified quick access widget.
     * @param initialTabId Optional tab ID to start with. Defaults to first tab.
     * @param initialValue Optional initial filter value.
     */
    show(initialTabId?: string, initialValue?: string): void;
    /**
     * Hide the unified quick access widget if visible.
     */
    hide(): void;
    /**
     * Check if the widget is currently visible.
     */
    get isVisible(): boolean;
    /**
     * Inject the custom tab bar into the picker's header area.
     */
    private _injectTabBar;
    /**
     * Create the send button.
     */
    private _createSendButton;
    /**
     * Update the send button label and tooltip based on input state.
     */
    private _updateSendButtonState;
    /**
     * Open chat without sending a message.
     */
    private _openChat;
    /**
     * Send the exact message to a new agent session (no prefix stripping).
     */
    private _sendMessageRaw;
    /**
     * Send the current message to a new agent session (strips prefix or shortcut character).
     */
    private _sendMessage;
    /**
     * Check if we should show the "send to agent" item.
     * Always shows it as the first item when user has typed something.
     */
    private _maybeShowSendToAgent;
    /**
     * Switch to a different tab.
     */
    private _switchTab;
    /**
     * Detect which tab matches the current value based on prefix.
     * Only switches away from current tab if user explicitly typed a different prefix.
     * Supports shortcut keys: ">" for Commands, "<" for Sessions.
     */
    private _detectTabFromValue;
    /**
     * Activate the provider for a given tab.
     */
    private _activateProvider;
    /**
     * Get or create a provider instance for the given prefix.
     */
    private _getOrInstantiateProvider;
    dispose(): void;
}
