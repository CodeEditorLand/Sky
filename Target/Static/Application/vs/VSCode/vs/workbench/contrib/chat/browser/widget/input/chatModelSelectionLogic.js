var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatAgentLocation, ChatModeKind } from "../../../common/constants.js";
import { ILanguageModelChatMetadata } from "../../../common/languageModels.js";
function filterModelsForSession(models, sessionType, currentModeKind, location, isInlineChatV2Enabled) {
  if (sessionType && sessionType !== "local" && hasModelsTargetingSession(models, sessionType)) {
    return models.filter((entry) => entry.metadata?.targetChatSessionType === sessionType && entry.metadata?.isUserSelectable);
  }
  return models.filter((entry) => !entry.metadata?.targetChatSessionType && entry.metadata?.isUserSelectable && isModelSupportedForMode(entry, currentModeKind) && isModelSupportedForInlineChat(entry, location, isInlineChatV2Enabled));
}
__name(filterModelsForSession, "filterModelsForSession");
function isModelSupportedForMode(model, currentModeKind) {
  if (currentModeKind === ChatModeKind.Agent) {
    return ILanguageModelChatMetadata.suitableForAgentMode(model.metadata);
  }
  return true;
}
__name(isModelSupportedForMode, "isModelSupportedForMode");
function isModelSupportedForInlineChat(model, location, isInlineChatV2Enabled) {
  if (location !== ChatAgentLocation.EditorInline || !isInlineChatV2Enabled) {
    return true;
  }
  return !!model.metadata.capabilities?.toolCalling;
}
__name(isModelSupportedForInlineChat, "isModelSupportedForInlineChat");
function hasModelsTargetingSession(allModels, sessionType) {
  if (!sessionType) {
    return false;
  }
  return allModels.some((m) => m.metadata.targetChatSessionType === sessionType);
}
__name(hasModelsTargetingSession, "hasModelsTargetingSession");
function isModelValidForSession(model, allModels, sessionType) {
  if (hasModelsTargetingSession(allModels, sessionType)) {
    return model.metadata.targetChatSessionType === sessionType;
  }
  return !model.metadata.targetChatSessionType;
}
__name(isModelValidForSession, "isModelValidForSession");
function findDefaultModel(models, location) {
  return models.find((m) => m.metadata.isDefaultForLocation[location]) || models[0];
}
__name(findDefaultModel, "findDefaultModel");
function shouldRestorePersistedModel(persistedModelId, persistedAsDefault, availableModels, location) {
  const model = availableModels.find((m) => m.identifier === persistedModelId);
  if (!model) {
    return { shouldRestore: false, model: void 0 };
  }
  if (!persistedAsDefault || model.metadata.isDefaultForLocation[location]) {
    return { shouldRestore: true, model };
  }
  return { shouldRestore: false, model };
}
__name(shouldRestorePersistedModel, "shouldRestorePersistedModel");
function shouldResetModelToDefault(currentModel, availableModels, context, allModels) {
  if (!currentModel) {
    return true;
  }
  if (!availableModels.some((m) => m.identifier === currentModel.identifier)) {
    return true;
  }
  if (!isModelSupportedForMode(currentModel, context.currentModeKind)) {
    return true;
  }
  if (!isModelSupportedForInlineChat(currentModel, context.location, context.isInlineChatV2Enabled)) {
    return true;
  }
  if (!isModelValidForSession(currentModel, allModels, context.sessionType)) {
    return true;
  }
  return false;
}
__name(shouldResetModelToDefault, "shouldResetModelToDefault");
function resolveModelFromSyncState(stateModel, currentModel, allModels, sessionType, context) {
  if (currentModel && currentModel.identifier === stateModel.identifier) {
    return { action: "keep" };
  }
  if (!isModelValidForSession(stateModel, allModels, sessionType)) {
    return { action: "default" };
  }
  if (context) {
    if (!isModelSupportedForMode(stateModel, context.currentModeKind)) {
      return { action: "default" };
    }
    if (!isModelSupportedForInlineChat(stateModel, context.location, context.isInlineChatV2Enabled)) {
      return { action: "default" };
    }
  }
  return { action: "apply" };
}
__name(resolveModelFromSyncState, "resolveModelFromSyncState");
function mergeModelsWithCache(liveModels, cachedModels, contributedVendors) {
  if (liveModels.length > 0) {
    const liveVendors = new Set(liveModels.map((m) => m.metadata.vendor));
    return [
      ...liveModels,
      ...cachedModels.filter((m) => !liveVendors.has(m.metadata.vendor) && contributedVendors.has(m.metadata.vendor))
    ];
  }
  return cachedModels;
}
__name(mergeModelsWithCache, "mergeModelsWithCache");
function shouldResetOnModelListChange(currentModelId, availableModels) {
  if (!currentModelId) {
    return true;
  }
  return !availableModels.some((m) => m.identifier === currentModelId);
}
__name(shouldResetOnModelListChange, "shouldResetOnModelListChange");
function shouldRestoreLateArrivingModel(persistedModelId, persistedAsDefault, model, location) {
  if (!model.metadata.isUserSelectable) {
    return false;
  }
  const result = shouldRestorePersistedModel(persistedModelId, persistedAsDefault, [model], location);
  return result.shouldRestore;
}
__name(shouldRestoreLateArrivingModel, "shouldRestoreLateArrivingModel");
export {
  filterModelsForSession,
  findDefaultModel,
  hasModelsTargetingSession,
  isModelSupportedForInlineChat,
  isModelSupportedForMode,
  isModelValidForSession,
  mergeModelsWithCache,
  resolveModelFromSyncState,
  shouldResetModelToDefault,
  shouldResetOnModelListChange,
  shouldRestoreLateArrivingModel,
  shouldRestorePersistedModel
};
//# sourceMappingURL=chatModelSelectionLogic.js.map
