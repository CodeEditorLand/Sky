import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
/**
 * A self-contained widget for selecting the repository in cloud sessions.
 * Uses the `github.copilot.chat.cloudSessions.openRepository` command for
 * browsing repositories. Manages recently used repos in storage.
 * Behaves like FolderPicker: trigger button with dropdown, storage persistence,
 * recently used list with remove buttons.
 */
export declare class RepoPicker extends Disposable {
    private readonly actionWidgetService;
    private readonly storageService;
    private readonly commandService;
    private readonly _onDidSelectRepo;
    readonly onDidSelectRepo: Event<string>;
    private _triggerElement;
    private readonly _renderDisposables;
    private _selectedRepo;
    private _recentlyPickedRepos;
    get selectedRepo(): string | undefined;
    constructor(actionWidgetService: IActionWidgetService, storageService: IStorageService, commandService: ICommandService);
    /**
     * Renders the repo picker trigger button into the given container.
     * Returns the container element.
     */
    render(container: HTMLElement): HTMLElement;
    /**
     * Shows the repo picker dropdown anchored to the trigger element.
     */
    showPicker(): void;
    /**
     * Programmatically set the selected repository.
     */
    setSelectedRepo(repoPath: string): void;
    /**
     * Clears the selected repository.
     */
    clearSelection(): void;
    private _selectRepo;
    private _browseForRepo;
    private _addToRecentlyPicked;
    private _buildItems;
    private _removeRepo;
    private _updateTriggerLabel;
}
