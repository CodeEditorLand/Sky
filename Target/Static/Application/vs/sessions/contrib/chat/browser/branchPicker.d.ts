import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { IGitRepository } from '../../../../workbench/contrib/git/common/gitService.js';
import { INewSession } from './newSession.js';
/**
 * A self-contained widget for selecting a git branch.
 * Uses `IGitRepository.getRefs` to list local branches.
 * Copilot worktree branches are shown in a collapsible section;
 * other branches are listed without a section header.
 * Writes the selected branch to the new session object.
 */
export declare class BranchPicker extends Disposable {
    private readonly actionWidgetService;
    private _selectedBranch;
    private _newSession;
    private _branches;
    private readonly _onDidChange;
    readonly onDidChange: Event<string | undefined>;
    private readonly _onDidChangeLoading;
    readonly onDidChangeLoading: Event<boolean>;
    private readonly _renderDisposables;
    private _slotElement;
    private _triggerElement;
    get selectedBranch(): string | undefined;
    constructor(actionWidgetService: IActionWidgetService);
    /**
     * Sets the new session that this picker writes to.
     */
    setNewSession(session: INewSession | undefined): void;
    /**
     * Sets the git repository and loads its branches.
     * When undefined, the picker is shown disabled.
     */
    setRepository(repository: IGitRepository | undefined): Promise<void>;
    /**
     * Renders the branch picker trigger into the given container.
     */
    render(container: HTMLElement): void;
    /**
     * Shows or hides the picker.
     */
    setVisible(visible: boolean): void;
    /**
     * Shows the branch picker dropdown anchored to the trigger element.
     */
    showPicker(): void;
    private _buildItems;
    private _selectBranch;
    private _updateTriggerLabel;
    private _setLoading;
}
