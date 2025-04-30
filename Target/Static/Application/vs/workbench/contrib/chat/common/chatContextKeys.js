import { localize } from "../../../../nls.js";
import { ContextKeyExpr, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IsWebContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { RemoteNameContext } from "../../../common/contextkeys.js";
import { ChatMode } from "./constants.js";
var ChatContextKeys;
(function(ChatContextKeys2) {
  ChatContextKeys2.responseVote = new RawContextKey("chatSessionResponseVote", "", { type: "string", description: localize("interactiveSessionResponseVote", "When the response has been voted up, is set to 'up'. When voted down, is set to 'down'. Otherwise an empty string.") });
  ChatContextKeys2.responseDetectedAgentCommand = new RawContextKey("chatSessionResponseDetectedAgentOrCommand", false, { type: "boolean", description: localize("chatSessionResponseDetectedAgentOrCommand", "When the agent or command was automatically detected") });
  ChatContextKeys2.responseSupportsIssueReporting = new RawContextKey("chatResponseSupportsIssueReporting", false, { type: "boolean", description: localize("chatResponseSupportsIssueReporting", "True when the current chat response supports issue reporting.") });
  ChatContextKeys2.responseIsFiltered = new RawContextKey("chatSessionResponseFiltered", false, { type: "boolean", description: localize("chatResponseFiltered", "True when the chat response was filtered out by the server.") });
  ChatContextKeys2.responseHasError = new RawContextKey("chatSessionResponseError", false, { type: "boolean", description: localize("chatResponseErrored", "True when the chat response resulted in an error.") });
  ChatContextKeys2.requestInProgress = new RawContextKey("chatSessionRequestInProgress", false, { type: "boolean", description: localize("interactiveSessionRequestInProgress", "True when the current request is still in progress.") });
  ChatContextKeys2.isRequestPaused = new RawContextKey("chatRequestIsPaused", false, { type: "boolean", description: localize("chatRequestIsPaused", "True when the current request is paused.") });
  ChatContextKeys2.canRequestBePaused = new RawContextKey("chatCanRequestBePaused", false, { type: "boolean", description: localize("chatCanRequestBePaused", "True when the current request can be paused.") });
  ChatContextKeys2.isResponse = new RawContextKey("chatResponse", false, { type: "boolean", description: localize("chatResponse", "The chat item is a response.") });
  ChatContextKeys2.isRequest = new RawContextKey("chatRequest", false, { type: "boolean", description: localize("chatRequest", "The chat item is a request") });
  ChatContextKeys2.itemId = new RawContextKey("chatItemId", "", { type: "string", description: localize("chatItemId", "The id of the chat item.") });
  ChatContextKeys2.lastItemId = new RawContextKey("chatLastItemId", [], { type: "string", description: localize("chatLastItemId", "The id of the last chat item.") });
  ChatContextKeys2.editApplied = new RawContextKey("chatEditApplied", false, { type: "boolean", description: localize("chatEditApplied", "True when the chat text edits have been applied.") });
  ChatContextKeys2.inputHasText = new RawContextKey("chatInputHasText", false, { type: "boolean", description: localize("interactiveInputHasText", "True when the chat input has text.") });
  ChatContextKeys2.inputHasFocus = new RawContextKey("chatInputHasFocus", false, { type: "boolean", description: localize("interactiveInputHasFocus", "True when the chat input has focus.") });
  ChatContextKeys2.inChatInput = new RawContextKey("inChatInput", false, { type: "boolean", description: localize("inInteractiveInput", "True when focus is in the chat input, false otherwise.") });
  ChatContextKeys2.inChatSession = new RawContextKey("inChat", false, { type: "boolean", description: localize("inChat", "True when focus is in the chat widget, false otherwise.") });
  ChatContextKeys2.hasPromptFile = new RawContextKey("chatPromptFileAttached", false, { type: "boolean", description: localize("chatPromptFileAttachedContextDescription", "True when the chat has a prompt file attached.") });
  ChatContextKeys2.chatMode = new RawContextKey("chatMode", ChatMode.Ask, { type: "string", description: localize("chatMode", "The current chat mode.") });
  ChatContextKeys2.supported = ContextKeyExpr.or(IsWebContext.negate(), RemoteNameContext.notEqualsTo(""));
  ChatContextKeys2.enabled = new RawContextKey("chatIsEnabled", false, { type: "boolean", description: localize("chatIsEnabled", "True when chat is enabled because a default chat participant is activated with an implementation.") });
  ChatContextKeys2.extensionParticipantRegistered = new RawContextKey("chatPanelExtensionParticipantRegistered", false, { type: "boolean", description: localize("chatPanelExtensionParticipantRegistered", "True when a default chat participant is registered for the panel from an extension.") });
  ChatContextKeys2.panelParticipantRegistered = new RawContextKey("chatPanelParticipantRegistered", false, { type: "boolean", description: localize("chatParticipantRegistered", "True when a default chat participant is registered for the panel.") });
  ChatContextKeys2.editingParticipantRegistered = new RawContextKey("chatEditingParticipantRegistered", false, { type: "boolean", description: localize("chatEditingParticipantRegistered", "True when a default chat participant is registered for editing.") });
  ChatContextKeys2.chatEditingCanUndo = new RawContextKey("chatEditingCanUndo", false, { type: "boolean", description: localize("chatEditingCanUndo", "True when it is possible to undo an interaction in the editing panel.") });
  ChatContextKeys2.chatEditingCanRedo = new RawContextKey("chatEditingCanRedo", false, { type: "boolean", description: localize("chatEditingCanRedo", "True when it is possible to redo an interaction in the editing panel.") });
  ChatContextKeys2.extensionInvalid = new RawContextKey("chatExtensionInvalid", false, { type: "boolean", description: localize("chatExtensionInvalid", "True when the installed chat extension is invalid and needs to be updated.") });
  ChatContextKeys2.inputCursorAtTop = new RawContextKey("chatCursorAtTop", false);
  ChatContextKeys2.inputHasAgent = new RawContextKey("chatInputHasAgent", false);
  ChatContextKeys2.location = new RawContextKey("chatLocation", void 0);
  ChatContextKeys2.inQuickChat = new RawContextKey("quickChatHasFocus", false, { type: "boolean", description: localize("inQuickChat", "True when the quick chat UI has focus, false otherwise.") });
  ChatContextKeys2.hasFileAttachments = new RawContextKey("chatHasFileAttachments", false, { type: "boolean", description: localize("chatHasFileAttachments", "True when the chat has file attachments.") });
  ChatContextKeys2.languageModelsAreUserSelectable = new RawContextKey("chatModelsAreUserSelectable", false, { type: "boolean", description: localize("chatModelsAreUserSelectable", "True when the chat model can be selected manually by the user.") });
  ChatContextKeys2.Setup = {
    hidden: new RawContextKey("chatSetupHidden", false, true),
    // True when chat setup is explicitly hidden.
    installed: new RawContextKey("chatSetupInstalled", false, true),
    // True when the chat extension is installed and enabled.
    disabled: new RawContextKey("chatSetupDisabled", false, true)
    // True when the chat extension is disabled.
  };
  ChatContextKeys2.Entitlement = {
    signedOut: new RawContextKey("chatSetupSignedOut", false, true),
    // True when user is signed out.
    canSignUp: new RawContextKey("chatPlanCanSignUp", false, true),
    // True when user can sign up to be a chat limited user.
    limited: new RawContextKey("chatPlanLimited", false, true),
    // True when user is a chat limited user.
    pro: new RawContextKey("chatPlanPro", false, true)
    // True when user is a chat pro user.
  };
  ChatContextKeys2.chatQuotaExceeded = new RawContextKey("chatQuotaExceeded", false, true);
  ChatContextKeys2.completionsQuotaExceeded = new RawContextKey("completionsQuotaExceeded", false, true);
  ChatContextKeys2.Editing = {
    agentModeDisallowed: new RawContextKey("chatAgentModeDisallowed", void 0, { type: "boolean", description: localize("chatAgentModeDisallowed", "True when agent mode is not allowed.") }),
    // experiment-driven disablement
    hasToolConfirmation: new RawContextKey("chatHasToolConfirmation", false, { type: "boolean", description: localize("chatEditingHasToolConfirmation", "True when a tool confirmation is present.") })
  };
  ChatContextKeys2.Tools = {
    toolsCount: new RawContextKey("toolsCount", 0, { type: "number", description: localize("toolsCount", "The count of tools available in the chat.") })
  };
})(ChatContextKeys || (ChatContextKeys = {}));
var ChatContextKeyExprs;
(function(ChatContextKeyExprs2) {
  ChatContextKeyExprs2.inEditingMode = ContextKeyExpr.or(ChatContextKeys.chatMode.isEqualTo(ChatMode.Edit), ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent));
})(ChatContextKeyExprs || (ChatContextKeyExprs = {}));
export {
  ChatContextKeyExprs,
  ChatContextKeys
};
//# sourceMappingURL=chatContextKeys.js.map
