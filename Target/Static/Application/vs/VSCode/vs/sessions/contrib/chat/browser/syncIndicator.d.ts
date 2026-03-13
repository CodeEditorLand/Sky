import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IGitRepository } from '../../../../workbench/contrib/git/common/gitService.js';
/**
 * Renders a compact "Synchronize Changes" button next to the branch picker.
 * Shows ahead/behind counts (e.g. "3↓ 2↑") and is only visible when
 * the selected branch matches the repository HEAD and has changes to sync.
 */
export declare class SyncIndicator extends Disposable {
    private readonly commandService;
    private _repository;
    private _selectedBranch;
    private _visible;
    private _syncing;
    private readonly _renderDisposables;
    private readonly _stateDisposables;
    private _slotElement;
    private _buttonElement;
    constructor(commandService: ICommandService);
    /**
     * Sets the git repository. Subscribes to its state observable to react to
     * ahead/behind changes.
     */
    setRepository(repository: IGitRepository | undefined): void;
    /**
     * Sets the currently selected branch name (from the branch picker).
     * The sync indicator is only shown when the selected branch is the HEAD branch.
     */
    setBranch(branch: string | undefined): void;
    /**
     * Renders the sync indicator button into the given container.
     */
    render(container: HTMLElement): void;
    /**
     * Shows or hides the sync indicator slot.
     */
    setVisible(visible: boolean): void;
    private _executeSyncCommand;
    private _getAheadBehind;
    private _update;
}
