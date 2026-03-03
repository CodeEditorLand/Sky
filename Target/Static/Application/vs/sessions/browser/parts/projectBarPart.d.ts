import './media/projectBarPart.css';
import { Part } from '../../../workbench/browser/part.js';
import { IWorkbenchLayoutService } from '../../../workbench/services/layout/browser/layoutService.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
import { Event } from '../../../base/common/event.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../base/common/uri.js';
import { IFileDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { IPathService } from '../../../workbench/services/path/common/pathService.js';
import { IWorkspaceEditingService } from '../../../workbench/services/workspaces/common/workspaceEditing.js';
import { ILabelService } from '../../../platform/label/common/label.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IQuickInputService } from '../../../platform/quickinput/common/quickInput.js';
/**
 * ProjectBarPart displays project folder entries stored in workspace storage and allows selection between them.
 * When a folder is selected, the workspace editing service is used to replace the current workspace folder
 * with the selected one. It is positioned to the left of the sidebar and has the same visual style as the activity bar.
 * Also includes global activities (accounts, settings) at the bottom.
 */
export declare class ProjectBarPart extends Part {
    private readonly storageService;
    private readonly workspaceContextService;
    private readonly fileDialogService;
    private readonly pathService;
    private readonly workspaceEditingService;
    private readonly labelService;
    private readonly hoverService;
    private readonly contextMenuService;
    private readonly quickInputService;
    private readonly instantiationService;
    static readonly ACTION_HEIGHT = 48;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    private content;
    private actionsContainer;
    private addFolderButton;
    private entries;
    private _selectedFolderUri;
    private readonly globalCompositeBar;
    private readonly workspaceEntryDisposables;
    private readonly _onDidSelectWorkspace;
    readonly onDidSelectWorkspace: Event<URI | undefined>;
    constructor(layoutService: IWorkbenchLayoutService, themeService: IThemeService, storageService: IStorageService, workspaceContextService: IWorkspaceContextService, fileDialogService: IFileDialogService, pathService: IPathService, workspaceEditingService: IWorkspaceEditingService, labelService: ILabelService, hoverService: IHoverService, contextMenuService: IContextMenuService, quickInputService: IQuickInputService, instantiationService: IInstantiationService);
    private getContextMenuActions;
    private loadEntriesFromStorage;
    private saveEntriesToStorage;
    private addFolderEntry;
    private applySelectedFolder;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private renderContent;
    private createAddFolderButton;
    private pickAndAddFolder;
    private createWorkspaceEntries;
    private createWorkspaceEntry;
    private selectWorkspace;
    private removeFolderEntry;
    private showCustomizeQuickPick;
    private pickIcon;
    get selectedWorkspaceFolder(): URI | undefined;
    updateStyles(): void;
    focus(): void;
    focusGlobalCompositeBar(): void;
    layout(width: number, height: number): void;
    toJSON(): object;
}
