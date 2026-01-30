import { localize } from "../../../../../nls.js";
import { ContextKeyExpr, RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IsWebContext } from "../../../../../platform/contextkey/common/contextkeys.js";
import { RemoteNameContext } from "../../../../common/contextkeys.js";
import { ChatEntitlementContextKeys } from "../../../../services/chat/common/chatEntitlementService.js";
import { ChatModeKind } from "../constants.js";
var ChatContextKeys;
(function(ChatContextKeys2) {
  ChatContextKeys2.responseVote = new RawContextKey("chatSessionResponseVote", "", { type: "string", description: localize("interactiveSessionResponseVote", "When the response has been voted up, is set to 'up'. When voted down, is set to 'down'. Otherwise an empty string.") });
  ChatContextKeys2.responseDetectedAgentCommand = new RawContextKey("chatSessionResponseDetectedAgentOrCommand", false, { type: "boolean", description: localize("chatSessionResponseDetectedAgentOrCommand", "When the agent or command was automatically detected") });
  ChatContextKeys2.responseSupportsIssueReporting = new RawContextKey("chatResponseSupportsIssueReporting", false, { type: "boolean", description: localize("chatResponseSupportsIssueReporting", "True when the current chat response supports issue reporting.") });
  ChatContextKeys2.responseIsFiltered = new RawContextKey("chatSessionResponseFiltered", false, { type: "boolean", description: localize("chatResponseFiltered", "True when the chat response was filtered out by the server.") });
  ChatContextKeys2.responseHasError = new RawContextKey("chatSessionResponseError", false, { type: "boolean", description: localize("chatResponseErrored", "True when the chat response resulted in an error.") });
  ChatContextKeys2.requestInProgress = new RawContextKey("chatSessionRequestInProgress", false, { type: "boolean", description: localize("interactiveSessionRequestInProgress", "True when the current request is still in progress.") });
  ChatContextKeys2.currentlyEditing = new RawContextKey("chatSessionCurrentlyEditing", false, { type: "boolean", description: localize("interactiveSessionCurrentlyEditing", "True when the current request is being edited.") });
  ChatContextKeys2.currentlyEditingInput = new RawContextKey("chatSessionCurrentlyEditingInput", false, { type: "boolean", description: localize("interactiveSessionCurrentlyEditingInput", "True when the current request input at the bottom is being edited.") });
  ChatContextKeys2.isResponse = new RawContextKey("chatResponse", false, { type: "boolean", description: localize("chatResponse", "The chat item is a response.") });
  ChatContextKeys2.isRequest = new RawContextKey("chatRequest", false, { type: "boolean", description: localize("chatRequest", "The chat item is a request") });
  ChatContextKeys2.itemId = new RawContextKey("chatItemId", "", { type: "string", description: localize("chatItemId", "The id of the chat item.") });
  ChatContextKeys2.lastItemId = new RawContextKey("chatLastItemId", [], { type: "string", description: localize("chatLastItemId", "The id of the last chat item.") });
  ChatContextKeys2.editApplied = new RawContextKey("chatEditApplied", false, { type: "boolean", description: localize("chatEditApplied", "True when the chat text edits have been applied.") });
  ChatContextKeys2.inputHasText = new RawContextKey("chatInputHasText", false, { type: "boolean", description: localize("interactiveInputHasText", "True when the chat input has text.") });
  ChatContextKeys2.inputHasFocus = new RawContextKey("chatInputHasFocus", false, { type: "boolean", description: localize("interactiveInputHasFocus", "True when the chat input has focus.") });
  ChatContextKeys2.inChatInput = new RawContextKey("inChatInput", false, { type: "boolean", description: localize("inInteractiveInput", "True when focus is in the chat input, false otherwise.") });
  ChatContextKeys2.inChatSession = new RawContextKey("inChat", false, { type: "boolean", description: localize("inChat", "True when focus is in the chat widget, false otherwise.") });
  ChatContextKeys2.inChatEditor = new RawContextKey("inChatEditor", false, { type: "boolean", description: localize("inChatEditor", "Whether focus is in a chat editor.") });
  ChatContextKeys2.inChatTerminalToolOutput = new RawContextKey("inChatTerminalToolOutput", false, { type: "boolean", description: localize("inChatTerminalToolOutput", "True when focus is in the chat terminal output region.") });
  ChatContextKeys2.chatModeKind = new RawContextKey("chatAgentKind", ChatModeKind.Ask, { type: "string", description: localize("agentKind", "The 'kind' of the current agent.") });
  ChatContextKeys2.chatToolCount = new RawContextKey("chatToolCount", 0, { type: "number", description: localize("chatToolCount", "The number of tools available in the current agent.") });
  ChatContextKeys2.chatToolGroupingThreshold = new RawContextKey("chat.toolGroupingThreshold", 0, { type: "number", description: localize("chatToolGroupingThreshold", "The number of tools at which we start doing virtual grouping.") });
  ChatContextKeys2.supported = ContextKeyExpr.or(IsWebContext.negate(), RemoteNameContext.notEqualsTo(""), ContextKeyExpr.has("config.chat.experimental.serverlessWebEnabled"));
  ChatContextKeys2.enabled = new RawContextKey("chatIsEnabled", false, { type: "boolean", description: localize("chatIsEnabled", "True when chat is enabled because a default chat participant is activated with an implementation.") });
  ChatContextKeys2.lockedToCodingAgent = new RawContextKey("lockedToCodingAgent", false, { type: "boolean", description: localize("lockedToCodingAgent", "True when the chat widget is locked to the coding agent session.") });
  ChatContextKeys2.agentSupportsAttachments = new RawContextKey("agentSupportsAttachments", false, { type: "boolean", description: localize("agentSupportsAttachments", "True when the chat agent supports attachments.") });
  ChatContextKeys2.withinEditSessionDiff = new RawContextKey("withinEditSessionDiff", false, { type: "boolean", description: localize("withinEditSessionDiff", "True when the chat widget dispatches to the edit session chat.") });
  ChatContextKeys2.filePartOfEditSession = new RawContextKey("filePartOfEditSession", false, { type: "boolean", description: localize("filePartOfEditSession", "True when the chat widget is within a file with an edit session.") });
  ChatContextKeys2.extensionParticipantRegistered = new RawContextKey("chatPanelExtensionParticipantRegistered", false, { type: "boolean", description: localize("chatPanelExtensionParticipantRegistered", "True when a default chat participant is registered for the panel from an extension.") });
  ChatContextKeys2.panelParticipantRegistered = new RawContextKey("chatPanelParticipantRegistered", false, { type: "boolean", description: localize("chatParticipantRegistered", "True when a default chat participant is registered for the panel.") });
  ChatContextKeys2.chatEditingCanUndo = new RawContextKey("chatEditingCanUndo", false, { type: "boolean", description: localize("chatEditingCanUndo", "True when it is possible to undo an interaction in the editing panel.") });
  ChatContextKeys2.chatEditingCanRedo = new RawContextKey("chatEditingCanRedo", false, { type: "boolean", description: localize("chatEditingCanRedo", "True when it is possible to redo an interaction in the editing panel.") });
  ChatContextKeys2.languageModelsAreUserSelectable = new RawContextKey("chatModelsAreUserSelectable", false, { type: "boolean", description: localize("chatModelsAreUserSelectable", "True when the chat model can be selected manually by the user.") });
  ChatContextKeys2.chatSessionHasModels = new RawContextKey("chatSessionHasModels", false, { type: "boolean", description: localize("chatSessionHasModels", "True when the chat is in a contributed chat session that has available 'models' to display.") });
  ChatContextKeys2.chatSessionOptionsValid = new RawContextKey("chatSessionOptionsValid", true, { type: "boolean", description: localize("chatSessionOptionsValid", "True when all selected session options exist in their respective option group items.") });
  ChatContextKeys2.extensionInvalid = new RawContextKey("chatExtensionInvalid", false, { type: "boolean", description: localize("chatExtensionInvalid", "True when the installed chat extension is invalid and needs to be updated.") });
  ChatContextKeys2.inputCursorAtTop = new RawContextKey("chatCursorAtTop", false);
  ChatContextKeys2.inputHasAgent = new RawContextKey("chatInputHasAgent", false);
  ChatContextKeys2.location = new RawContextKey("chatLocation", void 0);
  ChatContextKeys2.inQuickChat = new RawContextKey("quickChatHasFocus", false, { type: "boolean", description: localize("inQuickChat", "True when the quick chat UI has focus, false otherwise.") });
  ChatContextKeys2.inAgentSessionsWelcome = new RawContextKey("inAgentSessionsWelcome", false, { type: "boolean", description: localize("inAgentSessionsWelcome", "True when the chat input is within the agent sessions welcome page.") });
  ChatContextKeys2.chatSessionType = new RawContextKey("chatSessionType", "", { type: "string", description: localize("chatSessionType", "The type of the current chat session.") });
  ChatContextKeys2.hasFileAttachments = new RawContextKey("chatHasFileAttachments", false, { type: "boolean", description: localize("chatHasFileAttachments", "True when the chat has file attachments.") });
  ChatContextKeys2.chatSessionIsEmpty = new RawContextKey("chatSessionIsEmpty", true, { type: "boolean", description: localize("chatSessionIsEmpty", "True when the current chat session has no requests.") });
  ChatContextKeys2.remoteJobCreating = new RawContextKey("chatRemoteJobCreating", false, { type: "boolean", description: localize("chatRemoteJobCreating", "True when a remote coding agent job is being created.") });
  ChatContextKeys2.hasRemoteCodingAgent = new RawContextKey("hasRemoteCodingAgent", false, localize("hasRemoteCodingAgent", "Whether any remote coding agent is available"));
  ChatContextKeys2.hasCanDelegateProviders = new RawContextKey("chatHasCanDelegateProviders", false, { type: "boolean", description: localize("chatHasCanDelegateProviders", "True when there are chat session providers with delegation support available.") });
  ChatContextKeys2.enableRemoteCodingAgentPromptFileOverlay = new RawContextKey("enableRemoteCodingAgentPromptFileOverlay", false, localize("enableRemoteCodingAgentPromptFileOverlay", "Whether the remote coding agent prompt file overlay feature is enabled"));
  ChatContextKeys2.skipChatRequestInProgressMessage = new RawContextKey("chatSkipRequestInProgressMessage", false, { type: "boolean", description: localize("chatSkipRequestInProgressMessage", "True when the chat request in progress message should be skipped.") });
  ChatContextKeys2.Setup = ChatEntitlementContextKeys.Setup;
  ChatContextKeys2.Entitlement = ChatEntitlementContextKeys.Entitlement;
  ChatContextKeys2.chatQuotaExceeded = ChatEntitlementContextKeys.chatQuotaExceeded;
  ChatContextKeys2.completionsQuotaExceeded = ChatEntitlementContextKeys.completionsQuotaExceeded;
  ChatContextKeys2.Editing = {
    hasToolConfirmation: new RawContextKey("chatHasToolConfirmation", false, { type: "boolean", description: localize("chatEditingHasToolConfirmation", "True when a tool confirmation is present.") }),
    hasElicitationRequest: new RawContextKey("chatHasElicitationRequest", false, { type: "boolean", description: localize("chatEditingHasElicitationRequest", "True when a chat elicitation request is pending.") })
  };
  ChatContextKeys2.Tools = {
    toolsCount: new RawContextKey("toolsCount", 0, { type: "number", description: localize("toolsCount", "The count of tools available in the chat.") })
  };
  ChatContextKeys2.Modes = {
    hasCustomChatModes: new RawContextKey("chatHasCustomAgents", false, { type: "boolean", description: localize("chatHasAgents", "True when the chat has custom agents available.") }),
    agentModeDisabledByPolicy: new RawContextKey("chatAgentModeDisabledByPolicy", false, { type: "boolean", description: localize("chatAgentModeDisabledByPolicy", "True when agent mode is disabled by organization policy.") })
  };
  ChatContextKeys2.panelLocation = new RawContextKey("chatPanelLocation", void 0, { type: "number", description: localize("chatPanelLocation", "The location of the chat panel.") });
  ChatContextKeys2.agentSessionsViewerFocused = new RawContextKey("agentSessionsViewerFocused", true, { type: "boolean", description: localize("agentSessionsViewerFocused", "If the agent sessions view in the chat view is focused.") });
  ChatContextKeys2.agentSessionsViewerLimited = new RawContextKey("agentSessionsViewerLimited", void 0, { type: "boolean", description: localize("agentSessionsViewerLimited", "If the agent sessions view in the chat view is limited to show recent sessions only.") });
  ChatContextKeys2.agentSessionsViewerOrientation = new RawContextKey("agentSessionsViewerOrientation", void 0, { type: "number", description: localize("agentSessionsViewerOrientation", "Orientation of the agent sessions view in the chat view.") });
  ChatContextKeys2.agentSessionsViewerPosition = new RawContextKey("agentSessionsViewerPosition", void 0, { type: "number", description: localize("agentSessionsViewerPosition", "Position of the agent sessions view in the chat view.") });
  ChatContextKeys2.agentSessionsViewerVisible = new RawContextKey("agentSessionsViewerVisible", void 0, { type: "boolean", description: localize("agentSessionsViewerVisible", "Visibility of the agent sessions view in the chat view.") });
  ChatContextKeys2.agentSessionType = new RawContextKey("chatSessionType", "", { type: "string", description: localize("agentSessionType", "The type of the current agent session item.") });
  ChatContextKeys2.agentSessionSection = new RawContextKey("agentSessionSection", "", { type: "string", description: localize("agentSessionSection", "The section of the current agent session section item.") });
  ChatContextKeys2.isArchivedAgentSession = new RawContextKey("agentSessionIsArchived", false, { type: "boolean", description: localize("agentSessionIsArchived", "True when the agent session item is archived.") });
  ChatContextKeys2.isReadAgentSession = new RawContextKey("agentSessionIsRead", false, { type: "boolean", description: localize("agentSessionIsRead", "True when the agent session item is read.") });
  ChatContextKeys2.hasAgentSessionChanges = new RawContextKey("agentSessionHasChanges", false, { type: "boolean", description: localize("agentSessionHasChanges", "True when the current agent session item has changes.") });
  ChatContextKeys2.isKatexMathElement = new RawContextKey("chatIsKatexMathElement", false, { type: "boolean", description: localize("chatIsKatexMathElement", "True when focusing a KaTeX math element.") });
  ChatContextKeys2.inAgentSessionProjection = new RawContextKey("chatInAgentSessionProjection", false, { type: "boolean", description: localize("chatInAgentSessionProjection", "True when the workbench is in agent session projection mode for reviewing an agent session.") });
  ChatContextKeys2.agentStatusHasNotifications = new RawContextKey("agentStatusHasNotifications", false, { type: "boolean", description: localize("agentStatusHasNotifications", "True when the agent status widget has unread or in-progress sessions.") });
})(ChatContextKeys || (ChatContextKeys = {}));
var ChatContextKeyExprs;
(function(ChatContextKeyExprs2) {
  ChatContextKeyExprs2.inEditingMode = ContextKeyExpr.or(ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Edit), ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Agent));
  ChatContextKeyExprs2.chatSetupTriggerContext = ContextKeyExpr.or(ChatContextKeys.Setup.installed.negate(), ChatContextKeys.Entitlement.canSignUp);
})(ChatContextKeyExprs || (ChatContextKeyExprs = {}));
export {
  ChatContextKeyExprs,
  ChatContextKeys
};
//# sourceMappingURL=chatContextKeys.js.map
