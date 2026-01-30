import { VSBuffer } from '../../../../../base/common/buffer.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IBulkEditService } from '../../../../../editor/browser/services/bulkEditService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { INotebookService } from '../../../notebook/common/notebookService.js';
import { ChatEditingSessionState, IChatEditingSession, IEditSessionEntryDiff, IModifiedFileEntry, IStreamingEdits } from '../../common/editing/chatEditingService.js';
import { IChatResponseModel } from '../../common/model/chatModel.js';
import { IChatProgress } from '../../common/chatService/chatService.js';
import { AbstractChatEditingModifiedFileEntry } from './chatEditingModifiedFileEntry.js';
export declare class ChatEditingSession extends Disposable implements IChatEditingSession {
    readonly chatSessionResource: URI;
    readonly isGlobalEditingSession: boolean;
    private _lookupExternalEntry;
    private readonly _instantiationService;
    private readonly _modelService;
    private readonly _languageService;
    private readonly _textModelService;
    readonly _bulkEditService: IBulkEditService;
    private readonly _editorGroupsService;
    private readonly _editorService;
    private readonly _notebookService;
    private readonly _accessibilitySignalService;
    private readonly _logService;
    private readonly configurationService;
    private readonly _state;
    private readonly _timeline;
    /**
     * Contains the contents of a file when the AI first began doing edits to it.
     */
    private readonly _initialFileContents;
    private readonly _baselineCreationLocks;
    private readonly _streamingEditLocks;
    /**
     * Tracks active external edit operations.
     * Key is operationId, value contains the operation state.
     */
    private readonly _externalEditOperations;
    private readonly _entriesObs;
    readonly entries: IObservable<readonly IModifiedFileEntry[]>;
    private _editorPane;
    get state(): IObservable<ChatEditingSessionState>;
    readonly canUndo: IObservable<boolean>;
    readonly canRedo: IObservable<boolean>;
    get requestDisablement(): IObservable<import("../../common/model/chatModel.js").IChatRequestDisablement[]>;
    private readonly _onDidDispose;
    get onDidDispose(): import("../../../../../base/common/event.js").Event<void>;
    constructor(chatSessionResource: URI, isGlobalEditingSession: boolean, _lookupExternalEntry: (uri: URI) => AbstractChatEditingModifiedFileEntry | undefined, transferFrom: IChatEditingSession | undefined, _instantiationService: IInstantiationService, _modelService: IModelService, _languageService: ILanguageService, _textModelService: ITextModelService, _bulkEditService: IBulkEditService, _editorGroupsService: IEditorGroupsService, _editorService: IEditorService, _notebookService: INotebookService, _accessibilitySignalService: IAccessibilitySignalService, _logService: ILogService, configurationService: IConfigurationService);
    private _getTimelineDelegate;
    private _init;
    private _getEntry;
    getEntry(uri: URI): IModifiedFileEntry | undefined;
    readEntry(uri: URI, reader: IReader | undefined): IModifiedFileEntry | undefined;
    storeState(): Promise<void>;
    private _getStoredState;
    getEntryDiffBetweenStops(uri: URI, requestId: string | undefined, stopId: string | undefined): IObservable<IEditSessionEntryDiff | undefined> | undefined;
    getEntryDiffBetweenRequests(uri: URI, startRequestId: string, stopRequestId: string): IObservable<IEditSessionEntryDiff | undefined>;
    getDiffsForFilesInSession(): IObservable<readonly IEditSessionEntryDiff[]>;
    getDiffForSession(): IObservable<import("../../common/editing/chatEditingService.js").IEditSessionDiffStats>;
    getDiffsForFilesInRequest(requestId: string): IObservable<readonly IEditSessionEntryDiff[]>;
    hasEditsInRequest(requestId: string, reader?: IReader): boolean;
    createSnapshot(requestId: string, undoStop: string | undefined): void;
    getSnapshotContents(requestId: string, uri: URI, stopId: string | undefined): Promise<VSBuffer | undefined>;
    getSnapshotModel(requestId: string, undoStop: string | undefined, snapshotUri: URI): Promise<ITextModel | null>;
    getSnapshotUri(requestId: string, uri: URI, stopId: string | undefined): URI | undefined;
    restoreSnapshot(requestId: string, stopId: string | undefined): Promise<void>;
    private _assertNotDisposed;
    accept(...uris: URI[]): Promise<void>;
    reject(...uris: URI[]): Promise<void>;
    private _operateEntry;
    show(previousChanges?: boolean): Promise<void>;
    private _stopPromise;
    stop(clearState?: boolean): Promise<void>;
    private _performStop;
    dispose(): void;
    private get isDisposed();
    startStreamingEdits(resource: URI, responseModel: IChatResponseModel, inUndoStop: string | undefined): IStreamingEdits;
    startExternalEdits(responseModel: IChatResponseModel, operationId: number, resources: URI[], undoStopId: string): Promise<IChatProgress[]>;
    stopExternalEdits(responseModel: IChatResponseModel, operationId: number): Promise<IChatProgress[]>;
    undoInteraction(): Promise<void>;
    redoInteraction(): Promise<void>;
    private _recordEditOperations;
    private _getCurrentTextOrNotebookSnapshot;
    private _acceptStreamingEditsStart;
    private _initEntries;
    private _acceptEdits;
    private _getTelemetryInfoForModel;
    private _resolve;
    /**
     * Retrieves or creates a modified file entry.
     *
     * @returns The modified file entry.
     */
    private _getOrCreateModifiedFileEntry;
    private _createModifiedFileEntry;
    private _collapse;
}
