import { Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
/**
 * Shared filter state for the Agent Debug Panel.
 *
 * Both the Logs view and the Flow Chart view read from this single source of
 * truth. Toggle commands modify the state and fire `onDidChange` so every
 * consumer can re-render.
 */
export declare class ChatDebugFilterState extends Disposable {
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    filterKindToolCall: boolean;
    filterKindModelTurn: boolean;
    filterKindPromptDiscovery: boolean;
    filterKindSubagent: boolean;
    textFilter: string;
    isKindVisible(kind: string, category?: string): boolean;
    isAllKindsVisible(): boolean;
    isAllFiltersDefault(): boolean;
    setTextFilter(text: string): void;
    fire(): void;
}
/**
 * Registers the toggle-filter commands and menu items once, wired to a shared
 * {@link ChatDebugFilterState}. Returns a disposable that unregisters them.
 */
export declare function registerFilterMenuItems(state: ChatDebugFilterState, scopedContextKeyService: IContextKeyService): DisposableStore;
/**
 * Binds context keys for filter state into a scoped context key service.
 * Returns a function to sync all keys from the current state.
 */
export declare function bindFilterContextKeys(state: ChatDebugFilterState, scopedContextKeyService: IContextKeyService): () => void;
