import { IObservable } from '../../../base/common/observable.js';
import { Position } from '../../common/core/position.js';
import { Range } from '../../common/core/range.js';
import { ITextModel } from '../../common/model.js';
export declare const IRenameSymbolTrackerService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRenameSymbolTrackerService>;
/**
 * Represents a tracked word that is being edited by the user.
 */
export interface ITrackedWord {
    /**
     * The model in which the word is being tracked.
     */
    readonly model: ITextModel;
    /**
     * The original word text when tracking started.
     */
    readonly originalWord: string;
    /**
     * The original position where the word was found.
     */
    readonly originalPosition: Position;
    /**
     * The original range of the word when tracking started.
     */
    readonly originalRange: Range;
    /**
     * The current word text after edits.
     */
    readonly currentWord: string;
    /**
     * The current range of the word after edits.
     */
    readonly currentRange: Range;
}
export interface IRenameSymbolTrackerService {
    readonly _serviceBrand: undefined;
    /**
     * Observable that emits the currently tracked word, or undefined if no word is being tracked.
     */
    readonly trackedWord: IObservable<ITrackedWord | undefined>;
}
export declare class NullRenameSymbolTrackerService implements IRenameSymbolTrackerService {
    readonly _serviceBrand: undefined;
    private readonly _trackedWord;
    readonly trackedWord: IObservable<ITrackedWord | undefined>;
    constructor();
}
