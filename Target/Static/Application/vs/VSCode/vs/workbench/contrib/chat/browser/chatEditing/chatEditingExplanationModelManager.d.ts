import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { DetailedLineRangeMapping, LineRangeMapping } from '../../../../../editor/common/diff/rangeMapping.js';
import { ILanguageModelsService } from '../../common/languageModels.js';
/**
 * Simple diff info interface for explanation generation
 */
export interface IExplanationDiffInfo {
    readonly changes: readonly (LineRangeMapping | DetailedLineRangeMapping)[];
    readonly identical: boolean;
    readonly originalModel: ITextModel;
    readonly modifiedModel: ITextModel;
}
/**
 * A single explanation for a change
 */
export interface IChangeExplanation {
    readonly uri: URI;
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly originalText: string;
    readonly modifiedText: string;
    readonly explanation: string;
}
/**
 * Progress state for explanation generation
 */
export type ExplanationProgress = 'idle' | 'loading' | 'complete' | 'error';
/**
 * Explanation state for a single URI
 */
export interface IExplanationState {
    readonly progress: ExplanationProgress;
    readonly explanations: readonly IChangeExplanation[];
    readonly diffInfo: IExplanationDiffInfo;
    readonly chatSessionResource: URI | undefined;
    readonly errorMessage?: string;
}
/**
 * Handle returned when generating explanations
 */
export interface IExplanationGenerationHandle extends IDisposable {
    /**
     * The URIs being explained
     */
    readonly uris: readonly URI[];
    /**
     * Promise that resolves when generation is complete
     */
    readonly completed: Promise<void>;
}
export declare const IChatEditingExplanationModelManager: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatEditingExplanationModelManager>;
export interface IChatEditingExplanationModelManager {
    readonly _serviceBrand: undefined;
    /**
     * Observable map from URI to explanation state.
     * When a URI has state, explanations are shown. When removed, they are hidden.
     * UI code can use autorun or derived to react to state changes.
     */
    readonly state: IObservable<ResourceMap<IExplanationState>>;
    /**
     * Generates explanations for the given diff infos using a single LLM request.
     * This allows the model to understand the complete change across files.
     * Returns a disposable handle for lifecycle management.
     * The generation can be cancelled by disposing the handle or via the cancellation token.
     * Disposing the handle also removes the explanations from the state.
     *
     * State is updated per-file as explanations are parsed from the response.
     *
     * @param diffInfos Array of diff info objects, one per file
     * @param chatSessionResource Chat session resource for follow-up actions
     * @param token Cancellation token for external cancellation control
     * @returns A handle with disposal and completion tracking
     */
    generateExplanations(diffInfos: readonly IExplanationDiffInfo[], chatSessionResource: URI | undefined, token: CancellationToken): IExplanationGenerationHandle;
}
export declare class ChatEditingExplanationModelManager extends Disposable implements IChatEditingExplanationModelManager {
    private readonly _languageModelsService;
    readonly _serviceBrand: undefined;
    private readonly _state;
    readonly state: IObservable<ResourceMap<IExplanationState>>;
    constructor(_languageModelsService: ILanguageModelsService);
    private _updateUriState;
    private _updateUriStatePartial;
    private _removeUris;
    generateExplanations(diffInfos: readonly IExplanationDiffInfo[], chatSessionResource: URI | undefined, token: CancellationToken): IExplanationGenerationHandle;
    private _doGenerateExplanations;
}
