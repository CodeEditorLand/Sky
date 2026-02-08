var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../base/common/network.js";
import { IChatSessionsService } from "./chatSessionsService.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
var ChatConfiguration;
(function(ChatConfiguration2) {
  ChatConfiguration2["AIDisabled"] = "chat.disableAIFeatures";
  ChatConfiguration2["AgentEnabled"] = "chat.agent.enabled";
  ChatConfiguration2["RequestQueueingEnabled"] = "chat.requestQueuing.enabled";
  ChatConfiguration2["AgentStatusEnabled"] = "chat.agentsControl.enabled";
  ChatConfiguration2["EditorAssociations"] = "chat.editorAssociations";
  ChatConfiguration2["UnifiedAgentsBar"] = "chat.unifiedAgentsBar.enabled";
  ChatConfiguration2["AgentSessionProjectionEnabled"] = "chat.agentSessionProjection.enabled";
  ChatConfiguration2["EditModeHidden"] = "chat.editMode.hidden";
  ChatConfiguration2["AlternativeToolAction"] = "chat.alternativeToolAction.enabled";
  ChatConfiguration2["Edits2Enabled"] = "chat.edits2.enabled";
  ChatConfiguration2["ExtensionToolsEnabled"] = "chat.extensionTools.enabled";
  ChatConfiguration2["RepoInfoEnabled"] = "chat.repoInfo.enabled";
  ChatConfiguration2["EditRequests"] = "chat.editRequests";
  ChatConfiguration2["InlineReferencesStyle"] = "chat.inlineReferences.style";
  ChatConfiguration2["GlobalAutoApprove"] = "chat.tools.global.autoApprove";
  ChatConfiguration2["AutoApproveEdits"] = "chat.tools.edits.autoApprove";
  ChatConfiguration2["AutoApprovedUrls"] = "chat.tools.urls.autoApprove";
  ChatConfiguration2["EligibleForAutoApproval"] = "chat.tools.eligibleForAutoApproval";
  ChatConfiguration2["EnableMath"] = "chat.math.enabled";
  ChatConfiguration2["CheckpointsEnabled"] = "chat.checkpoints.enabled";
  ChatConfiguration2["ThinkingStyle"] = "chat.agent.thinkingStyle";
  ChatConfiguration2["ThinkingGenerateTitles"] = "chat.agent.thinking.generateTitles";
  ChatConfiguration2["TerminalToolsInThinking"] = "chat.agent.thinking.terminalTools";
  ChatConfiguration2["AutoExpandToolFailures"] = "chat.tools.autoExpandFailures";
  ChatConfiguration2["TodosShowWidget"] = "chat.tools.todos.showWidget";
  ChatConfiguration2["NotifyWindowOnResponseReceived"] = "chat.notifyWindowOnResponseReceived";
  ChatConfiguration2["ChatViewSessionsEnabled"] = "chat.viewSessions.enabled";
  ChatConfiguration2["ChatViewSessionsGrouping"] = "chat.viewSessions.grouping";
  ChatConfiguration2["ChatViewSessionsOrientation"] = "chat.viewSessions.orientation";
  ChatConfiguration2["ChatViewProgressBadgeEnabled"] = "chat.viewProgressBadge.enabled";
  ChatConfiguration2["SubagentToolCustomAgents"] = "chat.customAgentInSubagent.enabled";
  ChatConfiguration2["ShowCodeBlockProgressAnimation"] = "chat.agent.codeBlockProgress";
  ChatConfiguration2["RestoreLastPanelSession"] = "chat.restoreLastPanelSession";
  ChatConfiguration2["ExitAfterDelegation"] = "chat.exitAfterDelegation";
  ChatConfiguration2["AgentsControlClickBehavior"] = "chat.agentsControl.clickBehavior";
  ChatConfiguration2["ExplainChangesEnabled"] = "chat.editing.explainChanges.enabled";
})(ChatConfiguration || (ChatConfiguration = {}));
var ChatModeKind;
(function(ChatModeKind2) {
  ChatModeKind2["Ask"] = "ask";
  ChatModeKind2["Edit"] = "edit";
  ChatModeKind2["Agent"] = "agent";
})(ChatModeKind || (ChatModeKind = {}));
function validateChatMode(mode) {
  switch (mode) {
    case ChatModeKind.Ask:
    case ChatModeKind.Edit:
    case ChatModeKind.Agent:
      return mode;
    default:
      return void 0;
  }
}
__name(validateChatMode, "validateChatMode");
function isChatMode(mode) {
  return !!validateChatMode(mode);
}
__name(isChatMode, "isChatMode");
var ThinkingDisplayMode;
(function(ThinkingDisplayMode2) {
  ThinkingDisplayMode2["Collapsed"] = "collapsed";
  ThinkingDisplayMode2["CollapsedPreview"] = "collapsedPreview";
  ThinkingDisplayMode2["FixedScrolling"] = "fixedScrolling";
})(ThinkingDisplayMode || (ThinkingDisplayMode = {}));
var CollapsedToolsDisplayMode;
(function(CollapsedToolsDisplayMode2) {
  CollapsedToolsDisplayMode2["Off"] = "off";
  CollapsedToolsDisplayMode2["WithThinking"] = "withThinking";
  CollapsedToolsDisplayMode2["Always"] = "always";
})(CollapsedToolsDisplayMode || (CollapsedToolsDisplayMode = {}));
var AgentsControlClickBehavior;
(function(AgentsControlClickBehavior2) {
  AgentsControlClickBehavior2["Default"] = "default";
  AgentsControlClickBehavior2["Cycle"] = "cycle";
  AgentsControlClickBehavior2["Focus"] = "focus";
})(AgentsControlClickBehavior || (AgentsControlClickBehavior = {}));
var ChatAgentLocation;
(function(ChatAgentLocation2) {
  ChatAgentLocation2["Chat"] = "panel";
  ChatAgentLocation2["Terminal"] = "terminal";
  ChatAgentLocation2["Notebook"] = "notebook";
  ChatAgentLocation2["EditorInline"] = "editor";
})(ChatAgentLocation || (ChatAgentLocation = {}));
(function(ChatAgentLocation2) {
  function fromRaw(value) {
    switch (value) {
      case "panel":
        return ChatAgentLocation2.Chat;
      case "terminal":
        return ChatAgentLocation2.Terminal;
      case "notebook":
        return ChatAgentLocation2.Notebook;
      case "editor":
        return ChatAgentLocation2.EditorInline;
    }
    return ChatAgentLocation2.Chat;
  }
  __name(fromRaw, "fromRaw");
  ChatAgentLocation2.fromRaw = fromRaw;
})(ChatAgentLocation || (ChatAgentLocation = {}));
const chatAlwaysUnsupportedFileSchemes = /* @__PURE__ */ new Set([
  Schemas.vscodeChatEditor,
  Schemas.walkThrough,
  Schemas.vscodeLocalChatSession,
  Schemas.vscodeSettings,
  Schemas.webviewPanel,
  Schemas.vscodeUserData,
  Schemas.extension,
  "ccreq",
  "openai-codex"
  // Codex session custom editor scheme
]);
function isSupportedChatFileScheme(accessor, scheme) {
  const chatService = accessor.get(IChatSessionsService);
  if (chatAlwaysUnsupportedFileSchemes.has(scheme)) {
    return false;
  }
  if (chatService.getContentProviderSchemes().includes(scheme)) {
    return false;
  }
  return true;
}
__name(isSupportedChatFileScheme, "isSupportedChatFileScheme");
const MANAGE_CHAT_COMMAND_ID = "workbench.action.chat.manage";
const ChatEditorTitleMaxLength = 30;
const CHAT_TERMINAL_OUTPUT_MAX_PREVIEW_LINES = 1e3;
const CONTEXT_MODELS_EDITOR = new RawContextKey("inModelsEditor", false);
const CONTEXT_MODELS_SEARCH_FOCUS = new RawContextKey("inModelsSearch", false);
export {
  AgentsControlClickBehavior,
  CHAT_TERMINAL_OUTPUT_MAX_PREVIEW_LINES,
  CONTEXT_MODELS_EDITOR,
  CONTEXT_MODELS_SEARCH_FOCUS,
  ChatAgentLocation,
  ChatConfiguration,
  ChatEditorTitleMaxLength,
  ChatModeKind,
  CollapsedToolsDisplayMode,
  MANAGE_CHAT_COMMAND_ID,
  ThinkingDisplayMode,
  isChatMode,
  isSupportedChatFileScheme,
  validateChatMode
};
//# sourceMappingURL=constants.js.map
