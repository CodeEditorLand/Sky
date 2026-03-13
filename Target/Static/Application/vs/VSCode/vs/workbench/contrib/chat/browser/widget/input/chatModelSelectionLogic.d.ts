import { ChatAgentLocation, ChatModeKind } from '../../../common/constants.js';
import { ILanguageModelChatMetadataAndIdentifier } from '../../../common/languageModels.js';
/**
 * Describes the context needed for model selection decisions.
 */
export interface IModelSelectionContext {
    readonly location: ChatAgentLocation;
    readonly currentModeKind: ChatModeKind;
    readonly isInlineChatV2Enabled: boolean;
    readonly sessionType: string | undefined;
}
/**
 * Filter models based on session type.
 * When a session has a specific type (and it's not 'local'), only models targeting that
 * session type are returned. Otherwise, general-purpose models are returned.
 */
export declare function filterModelsForSession(models: ILanguageModelChatMetadataAndIdentifier[], sessionType: string | undefined, currentModeKind: ChatModeKind, location: ChatAgentLocation, isInlineChatV2Enabled: boolean): ILanguageModelChatMetadataAndIdentifier[];
/**
 * Check if a model is suitable for the current chat mode (e.g., agent mode requires tool calling).
 */
export declare function isModelSupportedForMode(model: ILanguageModelChatMetadataAndIdentifier, currentModeKind: ChatModeKind): boolean;
/**
 * Check if a model is suitable for inline chat (editor inline) usage.
 */
export declare function isModelSupportedForInlineChat(model: ILanguageModelChatMetadataAndIdentifier, location: ChatAgentLocation, isInlineChatV2Enabled: boolean): boolean;
/**
 * Check if any models in the pool target a specific session type.
 */
export declare function hasModelsTargetingSession(allModels: ILanguageModelChatMetadataAndIdentifier[], sessionType: string | undefined): boolean;
/**
 * Check if a model is valid for the current session's model pool.
 * If the session has targeted models, the model must target that session type.
 * If no models target this session, the model must not be session-specific.
 */
export declare function isModelValidForSession(model: ILanguageModelChatMetadataAndIdentifier, allModels: ILanguageModelChatMetadataAndIdentifier[], sessionType: string | undefined): boolean;
/**
 * Find the default model for a given location from a list of models.
 * Prefers the model marked as default for the location, falls back to the first model.
 */
export declare function findDefaultModel(models: ILanguageModelChatMetadataAndIdentifier[], location: ChatAgentLocation): ILanguageModelChatMetadataAndIdentifier | undefined;
/**
 * Determine whether a persisted model selection should be restored.
 *
 * A persisted model should be restored if:
 * 1. The model still exists in the available models list
 * 2. Either the model wasn't the default at the time it was persisted,
 *    OR it is currently the default for the location
 *
 * This prevents scenarios where a user's explicit model choice gets overridden
 * when the default model changes, while still tracking default model changes
 * for users who never explicitly chose a model.
 */
export declare function shouldRestorePersistedModel(persistedModelId: string, persistedAsDefault: boolean, availableModels: ILanguageModelChatMetadataAndIdentifier[], location: ChatAgentLocation): {
    shouldRestore: boolean;
    model: ILanguageModelChatMetadataAndIdentifier | undefined;
};
/**
 * Determines whether the current model should be reset because it is no longer
 * compatible with the current mode, session, or availability.
 *
 * Returns true if the model should be reset to default.
 */
export declare function shouldResetModelToDefault(currentModel: ILanguageModelChatMetadataAndIdentifier | undefined, availableModels: ILanguageModelChatMetadataAndIdentifier[], context: IModelSelectionContext, allModels: ILanguageModelChatMetadataAndIdentifier[]): boolean;
/**
 * Determines whether a model from a sync state should be applied to the current view.
 *
 * Returns an action:
 * - `'keep'`    - the view already has the same model; no change needed.
 * - `'apply'`   - the state model is valid; the caller should switch to it.
 * - `'default'` - the state model is incompatible (wrong session pool, unsupported
 *                 mode, or missing inline-chat capability); the caller should fall
 *                 back to the default model for the current location.
 *
 * @param context Optional because some callers (e.g. unit tests, or code paths
 *   that only care about session-pool validation) don't have a full UI context
 *   available. When omitted, mode and inline-chat checks are skipped and only
 *   session-pool membership is validated.
 */
export declare function resolveModelFromSyncState(stateModel: ILanguageModelChatMetadataAndIdentifier, currentModel: ILanguageModelChatMetadataAndIdentifier | undefined, allModels: ILanguageModelChatMetadataAndIdentifier[], sessionType: string | undefined, context?: IModelSelectionContext): {
    action: 'keep' | 'apply' | 'default';
};
/**
 * Merges live models with cached models per-vendor.
 * For vendors whose models have resolved, uses live data.
 * For vendors that are contributed but haven't resolved yet (startup race), keeps cached models.
 * Vendors no longer contributed are evicted from cache.
 */
export declare function mergeModelsWithCache(liveModels: ILanguageModelChatMetadataAndIdentifier[], cachedModels: ILanguageModelChatMetadataAndIdentifier[], contributedVendors: Set<string>): ILanguageModelChatMetadataAndIdentifier[];
/**
 * Determines whether the currently selected model should be reset to default
 * when the language model list changes.
 *
 * Returns true if the model should be reset to default (i.e., the selected model
 * is no longer in the available models list).
 */
export declare function shouldResetOnModelListChange(currentModelId: string | undefined, availableModels: ILanguageModelChatMetadataAndIdentifier[]): boolean;
/**
 * Determines whether a late-arriving persisted model should be restored.
 * This handles the startup race where the model wasn't available during
 * `initSelectedModel` but arrives later via `onDidChangeLanguageModels`.
 *
 * The model must pass both the persisted-default check and the `isUserSelectable` check.
 */
export declare function shouldRestoreLateArrivingModel(persistedModelId: string, persistedAsDefault: boolean, model: ILanguageModelChatMetadataAndIdentifier, location: ChatAgentLocation): boolean;
