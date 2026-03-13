import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { IDocumentDiff } from '../../../../../editor/common/diff/documentDiffProvider.js';
import { DetailedLineRangeMapping } from '../../../../../editor/common/diff/rangeMapping.js';
import { TextEdit } from '../../../../../editor/common/languages.js';
import { ITextModel, ITextSnapshot } from '../../../../../editor/common/model.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ICellEditOperation } from '../../../notebook/common/notebookCommon.js';
import { ModifiedFileEntryState } from '../../common/editing/chatEditingService.js';
import { IChatResponseModel } from '../../common/model/chatModel.js';
type affectedLines = {
    linesAdded: number;
    linesRemoved: number;
    lineCount: number;
    hasRemainingEdits: boolean;
};
type acceptedOrRejectedLines = affectedLines & {
    state: 'accepted' | 'rejected';
};
export declare class ChatEditingTextModelChangeService extends Disposable {
    private readonly originalModel;
    private readonly modifiedModel;
    private readonly state;
    private readonly _editorWorkerService;
    private readonly _accessibilitySignalService;
    private static readonly _lastEditDecorationOptions;
    private static readonly _pendingEditDecorationOptions;
    private static readonly _atomicEditDecorationOptions;
    private _isEditFromUs;
    get isEditFromUs(): boolean;
    private _allEditsAreFromUs;
    get allEditsAreFromUs(): boolean;
    private _isExternalEditInProgress;
    private _diffOperation;
    private _diffOperationIds;
    private readonly _diffInfo;
    get diffInfo(): IObservable<{
        originalModel: ITextModel;
        modifiedModel: ITextModel;
        keep: (changes: DetailedLineRangeMapping) => Promise<boolean>;
        undo: (changes: DetailedLineRangeMapping) => Promise<boolean>;
        identical: boolean;
        quitEarly: boolean;
        changes: readonly DetailedLineRangeMapping[];
        moves: readonly import("../../../../../editor/common/diff/linesDiffComputer.ts").MovedText[];
    }>;
    private readonly _editDecorationClear;
    private _editDecorations;
    private readonly _didAcceptOrRejectAllHunks;
    readonly onDidAcceptOrRejectAllHunks: import("../../../../../base/common/event.js").Event<ModifiedFileEntryState.Accepted | ModifiedFileEntryState.Rejected>;
    private readonly _didAcceptOrRejectLines;
    readonly onDidAcceptOrRejectLines: import("../../../../../base/common/event.js").Event<acceptedOrRejectedLines>;
    private notifyHunkAction;
    private _didUserEditModelFired;
    private readonly _didUserEditModel;
    readonly onDidUserEditModel: import("../../../../../base/common/event.js").Event<void>;
    private _originalToModifiedEdit;
    private lineChangeCount;
    private linesAdded;
    private linesRemoved;
    constructor(originalModel: ITextModel, modifiedModel: ITextModel, state: IObservable<ModifiedFileEntryState>, isExternalEditInProgress: (() => boolean) | undefined, _editorWorkerService: IEditorWorkerService, _accessibilitySignalService: IAccessibilitySignalService);
    private updateLineChangeCount;
    clearCurrentEditLineDecoration(): void;
    areOriginalAndModifiedIdentical(): Promise<boolean>;
    acceptAgentEdits(resource: URI, textEdits: (TextEdit | ICellEditOperation)[], isLastEdits: boolean, responseModel: IChatResponseModel | undefined): Promise<{
        rewriteRatio: number;
        maxLineNumber: number;
    }>;
    private _createEditSource;
    private _applyEdits;
    /**
     * Keeps the current modified document as the final contents.
     */
    keep(): void;
    /**
     * Undoes the current modified document as the final contents.
     */
    undo(): void;
    private _reset;
    resetDocumentValues(newOriginal: string | ITextSnapshot | undefined, newModified: string | undefined): Promise<void>;
    private _mirrorEdits;
    private _keepHunk;
    private _undoHunk;
    getDiffInfo(): Promise<IDocumentDiff>;
    private _updateDiffInfoSeq;
    hasHunkAt(range: IRange): boolean;
    private _updateDiffInfo;
}
export {};
