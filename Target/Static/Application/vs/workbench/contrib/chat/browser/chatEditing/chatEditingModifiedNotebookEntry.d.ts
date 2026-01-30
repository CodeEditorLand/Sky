import { IReference } from '../../../../../base/common/lifecycle.js';
import { ITransaction, IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { Location, TextEdit } from '../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUndoRedoElement, IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { IEditorPane } from '../../../../common/editor.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { CellDiffInfo } from '../../../notebook/browser/diff/notebookDiffViewModel.js';
import { NotebookCellTextModel } from '../../../notebook/common/model/notebookCellTextModel.js';
import { ICellEditOperation, IResolvedNotebookEditorModel, NotebookTextModelChangedEvent, TransientOptions } from '../../../notebook/common/notebookCommon.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookLoggingService } from '../../../notebook/common/notebookLoggingService.js';
import { INotebookEditorWorkerService } from '../../../notebook/common/services/notebookWorkerService.js';
import { ChatEditKind, IModifiedEntryTelemetryInfo, IModifiedFileEntryEditorIntegration, ISnapshotEntry } from '../../common/editing/chatEditingService.js';
import { IChatResponseModel } from '../../common/model/chatModel.js';
import { IChatService } from '../../common/chatService/chatService.js';
import { AbstractChatEditingModifiedFileEntry } from './chatEditingModifiedFileEntry.js';
import { ChatEditingNotebookCellEntry } from './notebook/chatEditingNotebookCellEntry.js';
import { ICellDiffInfo } from './notebook/notebookCellChanges.js';
import { IAiEditTelemetryService } from '../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js';
export declare class ChatEditingModifiedNotebookEntry extends AbstractChatEditingModifiedFileEntry {
    private readonly modifiedResourceRef;
    private readonly _multiDiffEntryDelegate;
    private readonly transientOptions;
    private readonly configurationService;
    private readonly textModelService;
    private readonly modelService;
    private readonly notebookEditorWorkerService;
    private readonly loggingService;
    private readonly notebookResolver;
    static NewModelCounter: number;
    private readonly modifiedModel;
    private readonly originalModel;
    originalURI: URI;
    /**
     * JSON stringified version of the original notebook.
     */
    initialContent: string;
    /**
     * Whether we're still generating diffs from a response.
     */
    private _isProcessingResponse;
    get isProcessingResponse(): IObservable<boolean>;
    private _isEditFromUs;
    /**
     * Whether all edits are from us, e.g. is possible a user has made edits, then this will be false.
     */
    private _allEditsAreFromUs;
    private readonly _changesCount;
    changesCount: IObservable<number>;
    private readonly cellEntryMap;
    private modifiedToOriginalCell;
    private readonly _cellsDiffInfo;
    get cellsDiffInfo(): IObservable<ICellDiffInfo[]>;
    get viewType(): string;
    /**
     * List of Cell URIs that are edited,
     * Will be cleared once all edits have been accepted.
     * I.e. this will only contain URIS while acceptAgentEdits is being called & before `isLastEdit` is sent.
     * I.e. this is populated only when edits are being streamed.
     */
    private readonly editedCells;
    static create(uri: URI, _multiDiffEntryDelegate: {
        collapse: (transaction: ITransaction | undefined) => void;
    }, telemetryInfo: IModifiedEntryTelemetryInfo, chatKind: ChatEditKind, initialContent: string | undefined, instantiationService: IInstantiationService): Promise<AbstractChatEditingModifiedFileEntry>;
    static canHandleSnapshotContent(initialContent: string | undefined): boolean;
    static canHandleSnapshot(snapshot: ISnapshotEntry): boolean;
    private readonly initialContentComparer;
    constructor(modifiedResourceRef: IReference<IResolvedNotebookEditorModel>, originalResourceRef: IReference<IResolvedNotebookEditorModel>, _multiDiffEntryDelegate: {
        collapse: (transaction: ITransaction | undefined) => void;
    }, transientOptions: TransientOptions | undefined, telemetryInfo: IModifiedEntryTelemetryInfo, kind: ChatEditKind, initialContent: string, configurationService: IConfigurationService, fileConfigService: IFilesConfigurationService, chatService: IChatService, fileService: IFileService, instantiationService: IInstantiationService, textModelService: ITextModelService, modelService: IModelService, undoRedoService: IUndoRedoService, notebookEditorWorkerService: INotebookEditorWorkerService, loggingService: INotebookLoggingService, notebookResolver: INotebookEditorModelResolverService, aiEditTelemetryService: IAiEditTelemetryService);
    hasModificationAt(location: Location): boolean;
    initializeModelsFromDiffImpl(cellsDiffInfo: CellDiffInfo[]): void;
    getIndexOfCellHandle(handle: number): number;
    private computeRequestId;
    initializeModelsFromDiff(): Promise<void>;
    updateCellDiffInfo(cellsDiffInfo: ICellDiffInfo[], transcation: ITransaction | undefined): void;
    mirrorNotebookEdits(e: NotebookTextModelChangedEvent): void;
    protected _doAccept(): Promise<void>;
    protected _doReject(): Promise<void>;
    private _collapse;
    protected _createEditorIntegration(editor: IEditorPane): IModifiedFileEntryEditorIntegration;
    protected _resetEditsState(tx: ITransaction): void;
    protected _createUndoRedoElement(response: IChatResponseModel): IUndoRedoElement | undefined;
    protected _areOriginalAndModifiedIdentical(): Promise<boolean>;
    private _areOriginalAndModifiedIdenticalImpl;
    private newNotebookEditGenerator?;
    acceptAgentEdits(resource: URI, edits: (TextEdit | ICellEditOperation)[], isLastEdits: boolean, responseModel: IChatResponseModel | undefined): Promise<void>;
    private disposeDeletedCellEntries;
    acceptNotebookEdit(edit: ICellEditOperation): void;
    private computeStateAfterAcceptingRejectingChanges;
    createModifiedCellDiffInfo(modifiedCellIndex: number, originalCellIndex: number): ICellDiffInfo;
    createInsertedCellDiffInfo(modifiedCellIndex: number): ICellDiffInfo;
    createDeleteCellDiffInfo(originalCellIndex: number): ICellDiffInfo;
    private undoPreviouslyInsertedCell;
    private keepPreviouslyInsertedCell;
    private undoPreviouslyDeletedCell;
    private keepPreviouslyDeletedCell;
    private _applyEdits;
    private _applyEditsSync;
    getCurrentSnapshot(): string;
    createSnapshot(chatSessionResource: URI, requestId: string | undefined, undoStop: string | undefined): ISnapshotEntry;
    equalsSnapshot(snapshot: ISnapshotEntry | undefined): boolean;
    restoreFromSnapshot(snapshot: ISnapshotEntry, restoreToDisk?: boolean): Promise<void>;
    resetToInitialContent(): Promise<void>;
    restoreModifiedModelFromSnapshot(snapshot: string): Promise<void>;
    private restoreSnapshotInModifiedModel;
    private readonly cellTextModelMap;
    private resolveCellModel;
    getOrCreateModifiedTextFileEntryForCell(cell: NotebookCellTextModel, modifiedCellModel: ITextModel, originalCellModel: ITextModel): ChatEditingNotebookCellEntry | undefined;
    computeEditsFromSnapshots(beforeSnapshot: string, afterSnapshot: string): Promise<(TextEdit | ICellEditOperation)[]>;
    save(): Promise<void>;
    revertToDisk(): Promise<void>;
}
