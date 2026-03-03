import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IChatRequestVariableEntry } from '../../../../workbench/contrib/chat/common/attachments/chatVariableEntries.js';
import { ISearchService } from '../../../../workbench/services/search/common/search.js';
/**
 * Manages context attachments for the sessions new-chat widget.
 *
 * Supports:
 * - File picker via quick access ("Files and Open Folders...")
 * - Image from Clipboard
 * - Drag and drop files
 * - Paste images from clipboard (Ctrl/Cmd+V)
 */
export declare class NewChatContextAttachments extends Disposable {
    private readonly quickInputService;
    private readonly textModelService;
    private readonly fileService;
    private readonly clipboardService;
    private readonly fileDialogService;
    private readonly labelService;
    private readonly searchService;
    private readonly configurationService;
    private readonly openerService;
    private readonly _attachedContext;
    private _container;
    private readonly _renderDisposables;
    private readonly _onDidChangeContext;
    readonly onDidChangeContext: import("../../../../base/common/event.js").Event<void>;
    get attachments(): readonly IChatRequestVariableEntry[];
    setAttachments(entries: readonly IChatRequestVariableEntry[]): void;
    constructor(quickInputService: IQuickInputService, textModelService: ITextModelService, fileService: IFileService, clipboardService: IClipboardService, fileDialogService: IFileDialogService, labelService: ILabelService, searchService: ISearchService, configurationService: IConfigurationService, openerService: IOpenerService);
    renderAttachedContext(container: HTMLElement): void;
    private _updateRendering;
    registerDropTarget(dndContainer: HTMLElement): void;
    registerPasteHandler(element: HTMLElement): void;
    showPicker(folderUri?: URI): void;
    private _collectFilePicks;
    private _collectFilePicksViaSearch;
    private _collectFilePicksViaFileService;
    private _handleFileDialog;
    private _attachFileUri;
    private _handleClipboardImage;
    private _getUniqueImageName;
    private _addAttachments;
    private _removeAttachment;
    clear(): void;
}
