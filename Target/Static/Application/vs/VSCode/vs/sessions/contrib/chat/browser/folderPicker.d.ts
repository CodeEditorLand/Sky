import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IActionWidgetService } from '../../../../platform/actionWidget/browser/actionWidget.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
/**
 * A folder picker that uses the action widget dropdown to show a list of
 * recently selected and recently opened folders. Remembers the last selected
 * folder and recently picked folders in storage. Enables a filter input when
 * there are more than 10 items.
 */
export declare class FolderPicker extends Disposable {
    private readonly actionWidgetService;
    private readonly storageService;
    private readonly fileDialogService;
    private readonly commandService;
    private readonly _onDidSelectFolder;
    readonly onDidSelectFolder: Event<URI>;
    private _selectedFolderUri;
    private _recentlyPickedFolders;
    private _triggerElement;
    private readonly _renderDisposables;
    get selectedFolderUri(): URI | undefined;
    constructor(actionWidgetService: IActionWidgetService, storageService: IStorageService, fileDialogService: IFileDialogService, commandService: ICommandService);
    /**
     * Renders the folder picker trigger button into the given container.
     * Returns the container element.
     */
    render(container: HTMLElement): HTMLElement;
    /**
     * Shows the folder picker dropdown anchored to the trigger element.
     */
    showPicker(): void;
    /**
     * Programmatically set the selected folder (e.g. restoring draft state).
     */
    setSelectedFolder(folderUri: URI): void;
    /**
     * Clears the selected folder.
     */
    clearSelection(): void;
    private _selectFolder;
    private _browseForFolder;
    private _cloneRepository;
    private _addToRecentlyPickedFolders;
    private _buildItems;
    /**
     * Removes a folder from the recently picked list and storage.
     */
    removeFromRecents(folderUri: URI): void;
    private _removeFolder;
    private _updateTriggerLabel;
}
