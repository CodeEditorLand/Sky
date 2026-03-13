import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader, ITransaction } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookService } from '../../../notebook/common/notebookService.js';
import { IEditSessionDiffStats, IEditSessionEntryDiff, IModifiedEntryTelemetryInfo } from '../../common/editing/chatEditingService.js';
import { IChatRequestDisablement } from '../../common/model/chatModel.js';
import { IChatEditingCheckpointTimeline } from './chatEditingCheckpointTimeline.js';
import { FileOperation, IChatEditingTimelineState, IFileBaseline } from './chatEditingOperations.js';
/**
 * A filesystem delegate used by the checkpointing timeline such that
 * navigating in the timeline tracks the changes as agent-initiated.
 */
export interface IChatEditingTimelineFsDelegate {
    /** Creates a file with initial content. */
    createFile: (uri: URI, initialContent: string) => Promise<unknown>;
    /** Delete a URI */
    deleteFile: (uri: URI) => Promise<void>;
    /** Rename a URI, retaining contents */
    renameFile: (fromUri: URI, toUri: URI) => Promise<void>;
    /** Set a URI contents, should create it if it does not already exist */
    setContents(uri: URI, content: string, telemetryInfo: IModifiedEntryTelemetryInfo): Promise<void>;
}
/**
 * Implementation of the checkpoint-based timeline system.
 *
 * Invariants:
 * - There is at most one checkpoint or operation per epoch
 * - _checkpoints and _operations are always sorted in ascending order by epoch
 * - _currentEpoch being equal to the epoch of an operation means that
 *   operation is _not_ currently applied
 */
export declare class ChatEditingCheckpointTimelineImpl implements IChatEditingCheckpointTimeline {
    private readonly chatSessionResource;
    private readonly _delegate;
    private readonly _notebookEditorModelResolverService;
    private readonly _notebookService;
    private readonly _textModelService;
    private readonly _editorWorkerService;
    private readonly _configurationService;
    private _epochCounter;
    private readonly _checkpoints;
    private readonly _currentEpoch;
    private readonly _operations;
    private readonly _fileBaselines;
    private readonly _refCountedDiffs;
    private readonly _finalizedDiffCache;
    /** Gets the checkpoint, if any, we can 'undo' to. */
    private readonly _willUndoToCheckpoint;
    readonly canUndo: IObservable<boolean>;
    /**
     * Gets the epoch we'll redo this. Unlike undo this doesn't only use checkpoints
     * because we could potentially redo to a 'tip' operation that's not checkpointed yet.
     */
    private readonly _willRedoToEpoch;
    readonly canRedo: IObservable<boolean>;
    readonly requestDisablement: IObservable<IChatRequestDisablement[]>;
    constructor(chatSessionResource: URI, _delegate: IChatEditingTimelineFsDelegate, _notebookEditorModelResolverService: INotebookEditorModelResolverService, _notebookService: INotebookService, _textModelService: ITextModelService, _editorWorkerService: IEditorWorkerService, _configurationService: IConfigurationService);
    createCheckpoint(requestId: string | undefined, undoStopId: string | undefined, label: string, description?: string): string;
    undoToLastCheckpoint(): Promise<void>;
    redoToNextCheckpoint(): Promise<void>;
    navigateToCheckpoint(checkpointId: string): Promise<void>;
    getContentURIAtStop(requestId: string, fileURI: URI, stopId: string | undefined): URI;
    private _navigateToEpoch;
    private _getCheckpoint;
    incrementEpoch(): number;
    recordFileOperation(operation: FileOperation): void;
    private _getVisibleOperationsAndCheckpoints;
    recordFileBaseline(baseline: IFileBaseline): void;
    private _getFileBaseline;
    hasFileBaseline(uri: URI, requestId: string): boolean;
    getContentAtStop(requestId: string, contentURI: URI, stopId: string | undefined): Promise<string | undefined>;
    private _getTimelineCanonicalUriForPath;
    /**
     * Creates a callback that is invoked when data at the stop changes. This
     * will not fire initially and may be debounced internally.
     */
    onDidChangeContentsAtStop(requestId: string, contentURI: URI, stopId: string | undefined, callback: (data: string) => void): IDisposable;
    private _getCheckpointBeforeEpoch;
    private _reconstructFileState;
    getStateForPersistence(): IChatEditingTimelineState;
    restoreFromState(state: IChatEditingTimelineState, tx: ITransaction): void;
    getCheckpointIdForRequest(requestId: string, undoStopId?: string): string | undefined;
    private _reconstructAllFileContents;
    private _getBaselineKey;
    private _findBestBaselineForFile;
    private _getFileOperationsInRange;
    private _replayOperations;
    private _applyOperationToState;
    private _applyFileSystemOperations;
    private _applyFileSystemOperation;
    private _applyTextEditsToContent;
    getEntryDiffBetweenStops(uri: URI, requestId: string | undefined, stopId: string | undefined): IObservable<IEditSessionEntryDiff | undefined>;
    /** Gets the epoch bounds of the request. If stopRequestId is undefined, gets ONLY the single request's bounds */
    private _getRequestEpochBounds;
    getEntryDiffBetweenRequests(uri: URI, startRequestId: string, stopRequestId: string): IObservable<IEditSessionEntryDiff | undefined>;
    private _getEntryDiffBetweenEpochs;
    private _getEntryDiffBetweenEpochsInner;
    private _computeDiff;
    hasEditsInRequest(requestId: string, reader?: IReader): boolean;
    getDiffsForFilesInRequest(requestId: string): IObservable<readonly IEditSessionEntryDiff[]>;
    private _getDiffsForFilesAtEpochs;
    getDiffsForFilesInSession(): IObservable<readonly IEditSessionEntryDiff[]>;
    getDiffForSession(): IObservable<IEditSessionDiffStats>;
}
