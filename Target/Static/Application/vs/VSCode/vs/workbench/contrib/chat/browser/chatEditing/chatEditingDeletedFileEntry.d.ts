import { IObservable, ITransaction } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IDocumentDiff } from '../../../../../editor/common/diff/documentDiffProvider.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUndoRedoElement, IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { IEditorPane } from '../../../../common/editor.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IAiEditTelemetryService } from '../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js';
import { ICellEditOperation } from '../../../notebook/common/notebookCommon.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { IModifiedEntryTelemetryInfo, IModifiedFileEntry, IModifiedFileEntryEditorIntegration, ISnapshotEntry } from '../../common/editing/chatEditingService.js';
import { IChatResponseModel } from '../../common/model/chatModel.js';
import { AbstractChatEditingModifiedFileEntry } from './chatEditingModifiedFileEntry.js';
interface IMultiDiffEntryDelegate {
    collapse: (transaction: ITransaction | undefined) => void;
}
/**
 * Represents a file that has been deleted by the chat editing session.
 * Unlike ChatEditingModifiedDocumentEntry, this doesn't maintain a live model
 * since the file no longer exists on disk.
 */
export declare class ChatEditingDeletedFileEntry extends AbstractChatEditingModifiedFileEntry implements IModifiedFileEntry {
    private readonly _multiDiffEntryDelegate;
    private readonly _languageId;
    private readonly _modelService;
    private readonly _languageService;
    readonly initialContent: string;
    /**
     * The original content before deletion, stored for diff display and potential restoration.
     */
    private readonly _originalContent;
    /**
     * Lazily created model for the original content (for diff display).
     */
    private _originalModel;
    /**
     * Lazily created empty model representing the deleted state (for diff display).
     */
    private _modifiedModel;
    readonly originalURI: URI;
    readonly diffInfo: IObservable<IDocumentDiff>;
    readonly linesAdded: IObservable<number>;
    readonly linesRemoved: IObservable<number>;
    private readonly _changesCount;
    readonly changesCount: import("../../../../../base/common/observable.js").ISettableObservable<number, void>;
    readonly isDeletion = true;
    constructor(resource: URI, originalContent: string, _multiDiffEntryDelegate: IMultiDiffEntryDelegate, telemetryInfo: IModifiedEntryTelemetryInfo, _languageId: string, _modelService: IModelService, _languageService: ILanguageService, configService: IConfigurationService, fileConfigService: IFilesConfigurationService, chatService: IChatService, fileService: IFileService, undoRedoService: IUndoRedoService, instantiationService: IInstantiationService, aiEditTelemetryService: IAiEditTelemetryService);
    dispose(): void;
    /**
     * Gets or creates the original model for diff display.
     */
    private _getOrCreateOriginalModel;
    /**
     * Gets or creates an empty model representing the deleted state.
     */
    private _getOrCreateModifiedModel;
    private _diffInfo;
    getDiffInfo(): Promise<IDocumentDiff>;
    equalsSnapshot(snapshot: ISnapshotEntry | undefined): boolean;
    createSnapshot(chatSessionResource: URI, requestId: string | undefined, undoStop: string | undefined): ISnapshotEntry;
    restoreFromSnapshot(snapshot: ISnapshotEntry, restoreToDisk?: boolean): Promise<void>;
    resetToInitialContent(): Promise<void>;
    protected _areOriginalAndModifiedIdentical(): Promise<boolean>;
    protected _createUndoRedoElement(response: IChatResponseModel): IUndoRedoElement;
    acceptAgentEdits(_uri: URI, _edits: (TextEdit | ICellEditOperation)[], isLastEdits: boolean, _responseModel: IChatResponseModel | undefined): Promise<void>;
    protected _doAccept(): Promise<void>;
    protected _doReject(): Promise<void>;
    protected _createEditorIntegration(_editor: IEditorPane): IModifiedFileEntryEditorIntegration;
    computeEditsFromSnapshots(_beforeSnapshot: string, _afterSnapshot: string): Promise<(TextEdit | ICellEditOperation)[]>;
    save(): Promise<void>;
    revertToDisk(): Promise<void>;
}
export {};
