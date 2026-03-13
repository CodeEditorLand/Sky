import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IChatModelInputState } from '../model/chatModel.js';
import { ChatAgentLocation } from '../constants.js';
export declare const IChatWidgetHistoryService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatWidgetHistoryService>;
export interface IChatWidgetHistoryService {
    _serviceBrand: undefined;
    readonly onDidChangeHistory: Event<ChatHistoryChange>;
    clearHistory(): void;
    getHistory(location: ChatAgentLocation): readonly IChatModelInputState[];
    append(location: ChatAgentLocation, history: IChatModelInputState): void;
}
export type ChatHistoryChange = {
    kind: 'append';
    entry: IChatModelInputState;
} | {
    kind: 'clear';
};
export declare const ChatInputHistoryMaxEntries = 40;
export declare class ChatWidgetHistoryService extends Disposable implements IChatWidgetHistoryService {
    _serviceBrand: undefined;
    private memento;
    private viewState;
    private readonly _onDidChangeHistory;
    private changed;
    readonly onDidChangeHistory: Event<ChatHistoryChange>;
    constructor(storageService: IStorageService);
    getHistory(location: ChatAgentLocation): IChatModelInputState[];
    private migrateHistoryEntry;
    private getKey;
    append(location: ChatAgentLocation, history: IChatModelInputState): void;
    clearHistory(): void;
}
export declare class ChatHistoryNavigator extends Disposable {
    private readonly location;
    private readonly chatWidgetHistoryService;
    /**
     * Index of our point in history. Goes 1 past the length of `_history`
     */
    private _currentIndex;
    private _history;
    private _overlay;
    get values(): readonly IChatModelInputState[];
    constructor(location: ChatAgentLocation, chatWidgetHistoryService: IChatWidgetHistoryService);
    isAtEnd(): boolean;
    isAtStart(): boolean;
    /**
     * Replaces a history entry at the current index in this view of the history.
     * Allows editing of old history entries while preventing accidental navigation
     * from losing the edits.
     */
    overlay(entry: IChatModelInputState): void;
    resetCursor(): void;
    previous(): IChatModelInputState | undefined;
    next(): IChatModelInputState | undefined;
    current(): IChatModelInputState | undefined;
    /**
     * Appends a new entry to the navigator. Resets the state back to the end
     * and clears any overlayed entries.
     */
    append(entry: IChatModelInputState): void;
}
