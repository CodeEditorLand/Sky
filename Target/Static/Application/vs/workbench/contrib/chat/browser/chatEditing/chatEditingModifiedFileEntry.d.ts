import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, ITransaction } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUndoRedoElement, IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { IEditorPane } from '../../../../common/editor.js';
import { IFilesConfigurationService } from '../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IAiEditTelemetryService } from '../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js';
import { ICellEditOperation } from '../../../notebook/common/notebookCommon.js';
import { ChatUserAction, IChatService } from '../../common/chatService/chatService.js';
import { ChatEditKind, IModifiedEntryTelemetryInfo, IModifiedFileEntry, IModifiedFileEntryEditorIntegration, ISnapshotEntry, ModifiedFileEntryState } from '../../common/editing/chatEditingService.js';
import { IChatResponseModel } from '../../common/model/chatModel.js';
declare class AutoAcceptControl {
    readonly total: number;
    readonly remaining: number;
    readonly cancel: () => void;
    constructor(total: number, remaining: number, cancel: () => void);
}
export declare const pendingRewriteMinimap: string;
export declare abstract class AbstractChatEditingModifiedFileEntry extends Disposable implements IModifiedFileEntry {
    readonly modifiedURI: URI;
    protected _telemetryInfo: IModifiedEntryTelemetryInfo;
    protected _fileConfigService: IFilesConfigurationService;
    protected readonly _chatService: IChatService;
    protected readonly _fileService: IFileService;
    private readonly _undoRedoService;
    protected readonly _instantiationService: IInstantiationService;
    private readonly _aiEditTelemetryService;
    static readonly scheme = "modified-file-entry";
    private static lastEntryId;
    readonly entryId: string;
    protected readonly _onDidDelete: Emitter<void>;
    readonly onDidDelete: import("../../../../../base/common/event.js").Event<void>;
    protected readonly _stateObs: import("../../../../../base/common/observable.js").ISettableObservable<ModifiedFileEntryState, void>;
    readonly state: IObservable<ModifiedFileEntryState>;
    protected readonly _waitsForLastEdits: import("../../../../../base/common/observable.js").ISettableObservable<boolean, void>;
    readonly waitsForLastEdits: IObservable<boolean>;
    protected readonly _isCurrentlyBeingModifiedByObs: import("../../../../../base/common/observable.js").ISettableObservable<{
        responseModel: IChatResponseModel;
        undoStopId: string | undefined;
    } | undefined, void>;
    readonly isCurrentlyBeingModifiedBy: IObservable<{
        responseModel: IChatResponseModel;
        undoStopId: string | undefined;
    } | undefined>;
    /**
     * Flag to track if we're currently in an external edit operation.
     * When true, file system changes should be treated as agent edits, not user edits.
     */
    protected _isExternalEditInProgress: boolean;
    protected readonly _lastModifyingResponseObs: import("../../../../../base/common/observable.js").ISettableObservable<IChatResponseModel | undefined, void>;
    readonly lastModifyingResponse: IObservable<IChatResponseModel | undefined>;
    protected readonly _lastModifyingResponseInProgressObs: IObservable<boolean>;
    protected readonly _rewriteRatioObs: import("../../../../../base/common/observable.js").ISettableObservable<number, void>;
    readonly rewriteRatio: IObservable<number>;
    private readonly _reviewModeTempObs;
    readonly reviewMode: IObservable<boolean>;
    private readonly _autoAcceptCtrl;
    readonly autoAcceptController: IObservable<AutoAcceptControl | undefined>;
    protected readonly _autoAcceptTimeout: IObservable<number>;
    get telemetryInfo(): IModifiedEntryTelemetryInfo;
    readonly createdInRequestId: string | undefined;
    get lastModifyingRequestId(): string;
    private _refCounter;
    readonly abstract originalURI: URI;
    protected readonly _userEditScheduler: RunOnceScheduler;
    constructor(modifiedURI: URI, _telemetryInfo: IModifiedEntryTelemetryInfo, kind: ChatEditKind, configService: IConfigurationService, _fileConfigService: IFilesConfigurationService, _chatService: IChatService, _fileService: IFileService, _undoRedoService: IUndoRedoService, _instantiationService: IInstantiationService, _aiEditTelemetryService: IAiEditTelemetryService);
    dispose(): void;
    acquire(): this;
    enableReviewModeUntilSettled(): void;
    updateTelemetryInfo(telemetryInfo: IModifiedEntryTelemetryInfo): void;
    accept(): Promise<void>;
    /** Accepts and returns a function used to transition the state. This MUST be called by the consumer. */
    acceptDeferred(): Promise<((tx: ITransaction) => void) | undefined>;
    protected abstract _doAccept(): Promise<void>;
    reject(): Promise<void>;
    /** Rejects and returns a function used to transition the state. This MUST be called by the consumer. */
    rejectDeferred(): Promise<((tx: ITransaction) => void) | undefined>;
    protected abstract _doReject(): Promise<void>;
    protected _notifySessionAction(outcome: 'accepted' | 'rejected' | 'userModified'): void;
    protected _notifyAction(action: ChatUserAction): void;
    private readonly _editorIntegrations;
    getEditorIntegration(pane: IEditorPane): IModifiedFileEntryEditorIntegration;
    /**
     * Create the editor integration for this entry and the given editor pane. This will only be called
     * once (and cached) per pane. The integration is meant to be scoped to this entry only and when the
     * passed pane/editor changes input, then the editor integration must handle that, e.g use default/null
     * values
     */
    protected abstract _createEditorIntegration(editor: IEditorPane): IModifiedFileEntryEditorIntegration;
    abstract readonly changesCount: IObservable<number>;
    acceptStreamingEditsStart(responseModel: IChatResponseModel, undoStopId: string | undefined, tx: ITransaction | undefined): void;
    protected abstract _createUndoRedoElement(response: IChatResponseModel): IUndoRedoElement | undefined;
    abstract acceptAgentEdits(uri: URI, edits: (TextEdit | ICellEditOperation)[], isLastEdits: boolean, responseModel: IChatResponseModel | undefined): Promise<void>;
    acceptStreamingEditsEnd(): Promise<void>;
    protected abstract _areOriginalAndModifiedIdentical(): Promise<boolean>;
    protected _resetEditsState(tx: ITransaction | undefined): void;
    abstract createSnapshot(chatSessionResource: URI, requestId: string | undefined, undoStop: string | undefined): ISnapshotEntry;
    abstract equalsSnapshot(snapshot: ISnapshotEntry | undefined): boolean;
    abstract restoreFromSnapshot(snapshot: ISnapshotEntry, restoreToDisk?: boolean): Promise<void>;
    abstract resetToInitialContent(): Promise<void>;
    abstract initialContent: string;
    /**
     * Computes the edits between two snapshots of the file content.
     * @param beforeSnapshot The content before the changes
     * @param afterSnapshot The content after the changes
     * @returns Array of text edits or cell edit operations
     */
    abstract computeEditsFromSnapshots(beforeSnapshot: string, afterSnapshot: string): Promise<(TextEdit | ICellEditOperation)[]>;
    /**
     * Marks the start of an external edit operation.
     * File system changes will be treated as agent edits until stopExternalEdit is called.
     */
    startExternalEdit(): void;
    /**
     * Marks the end of an external edit operation.
     */
    stopExternalEdit(): void;
    /**
     * Saves the current model state to disk.
     */
    abstract save(): Promise<void>;
    /**
     * Reloads the model from disk to ensure it's in sync with file system changes.
     */
    abstract revertToDisk(): Promise<void>;
}
export {};
