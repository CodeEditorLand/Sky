import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { AgentSessionProviders } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js';
import { IGitRepository } from '../../../../workbench/contrib/git/common/gitService.js';
/**
 * A self-contained widget for selecting the session target (Local vs Cloud).
 * Encapsulates state, events, and rendering. Can be placed anywhere in the view.
 */
export declare class SessionTargetPicker extends Disposable {
    private _selectedTarget;
    private _allowedTargets;
    private readonly _onDidChangeTarget;
    readonly onDidChangeTarget: Event<AgentSessionProviders>;
    private readonly _renderDisposables;
    private _container;
    get selectedTarget(): AgentSessionProviders;
    constructor(allowedTargets: AgentSessionProviders[], defaultTarget: AgentSessionProviders);
    /**
     * Renders the target radio (Local / Cloud) into the given container.
     */
    render(container: HTMLElement): void;
    updateAllowedTargets(targets: AgentSessionProviders[]): void;
    private _renderRadio;
}
export type IsolationMode = 'worktree' | 'workspace';
/**
 * A self-contained widget for selecting the isolation mode (Worktree vs Folder).
 * Encapsulates state, events, and rendering. Can be placed anywhere in the view.
 */
export declare class IsolationModePicker extends Disposable {
    private readonly actionWidgetService;
    private _isolationMode;
    private _preferredIsolationMode;
    private _repository;
    private _enabled;
    private readonly _onDidChange;
    readonly onDidChange: Event<IsolationMode>;
    private readonly _renderDisposables;
    private _slotElement;
    private _triggerElement;
    get isolationMode(): IsolationMode;
    constructor(actionWidgetService: IActionWidgetService);
    /**
     * Sets the git repository. When undefined, worktree option is hidden
     * and isolation mode falls back to 'workspace'.
     */
    setRepository(repository: IGitRepository | undefined): void;
    /**
     * Renders the isolation mode picker into the given container.
     */
    render(container: HTMLElement): void;
    /**
     * Sets a preferred isolation mode to apply when a repository is set.
     */
    setPreferredIsolationMode(mode: IsolationMode): void;
    /**
     * Programmatically set the isolation mode.
     */
    setIsolationMode(mode: IsolationMode): void;
    /**
     * Shows or hides the picker.
     */
    setVisible(visible: boolean): void;
    /**
     * Enables or disables the picker. When disabled, the picker is shown
     * but cannot be interacted with.
     */
    setEnabled(enabled: boolean): void;
    private _showPicker;
    private _setMode;
    private _updateTriggerLabel;
}
