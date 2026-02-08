var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../nls.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { URI } from "../../../../../base/common/uri.js";
import { localChatSessionType } from "../../common/chatSessionsService.js";
import { foreground, listActiveSelectionForeground, registerColor, transparent } from "../../../../../platform/theme/common/colorRegistry.js";
import { getChatSessionType } from "../../common/model/chatUri.js";
var AgentSessionProviders;
(function(AgentSessionProviders2) {
  AgentSessionProviders2["Local"] = "local";
  AgentSessionProviders2["Background"] = "copilotcli";
  AgentSessionProviders2["Cloud"] = "copilot-cloud-agent";
  AgentSessionProviders2["Claude"] = "claude-code";
  AgentSessionProviders2["Codex"] = "openai-codex";
})(AgentSessionProviders || (AgentSessionProviders = {}));
function isBuiltInAgentSessionProvider(provider) {
  return provider === AgentSessionProviders.Local || provider === AgentSessionProviders.Background || provider === AgentSessionProviders.Cloud || provider === AgentSessionProviders.Claude;
}
__name(isBuiltInAgentSessionProvider, "isBuiltInAgentSessionProvider");
function getAgentSessionProvider(sessionResource) {
  const type = URI.isUri(sessionResource) ? getChatSessionType(sessionResource) : sessionResource;
  switch (type) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
    case AgentSessionProviders.Claude:
    case AgentSessionProviders.Codex:
      return type;
    default:
      return void 0;
  }
}
__name(getAgentSessionProvider, "getAgentSessionProvider");
function getAgentSessionProviderName(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return localize("chat.session.providerLabel.local", "Local");
    case AgentSessionProviders.Background:
      return localize("chat.session.providerLabel.background", "Background");
    case AgentSessionProviders.Cloud:
      return localize("chat.session.providerLabel.cloud", "Cloud");
    case AgentSessionProviders.Claude:
      return "Claude";
    case AgentSessionProviders.Codex:
      return "Codex";
  }
}
__name(getAgentSessionProviderName, "getAgentSessionProviderName");
function getAgentSessionProviderIcon(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return Codicon.vm;
    case AgentSessionProviders.Background:
      return Codicon.worktree;
    case AgentSessionProviders.Cloud:
      return Codicon.cloud;
    case AgentSessionProviders.Codex:
      return Codicon.openai;
    case AgentSessionProviders.Claude:
      return Codicon.claude;
  }
}
__name(getAgentSessionProviderIcon, "getAgentSessionProviderIcon");
function isFirstPartyAgentSessionProvider(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
      return true;
    case AgentSessionProviders.Claude:
    case AgentSessionProviders.Codex:
      return false;
  }
}
__name(isFirstPartyAgentSessionProvider, "isFirstPartyAgentSessionProvider");
function getAgentCanContinueIn(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
      return true;
    case AgentSessionProviders.Claude:
    case AgentSessionProviders.Codex:
      return false;
  }
}
__name(getAgentCanContinueIn, "getAgentCanContinueIn");
function getAgentSessionProviderDescription(provider) {
  switch (provider) {
    case AgentSessionProviders.Local:
      return localize("chat.session.providerDescription.local", "Run tasks within VS Code chat. The agent iterates via chat and works interactively to implement changes on your main workspace.");
    case AgentSessionProviders.Background:
      return localize("chat.session.providerDescription.background", "Delegate tasks to a background agent running locally on your machine. The agent iterates via chat and works asynchronously in a Git worktree to implement changes isolated from your main workspace using the GitHub Copilot CLI.");
    case AgentSessionProviders.Cloud:
      return localize("chat.session.providerDescription.cloud", "Delegate tasks to the GitHub Copilot coding agent. The agent iterates via chat and works asynchronously in the cloud to implement changes and pull requests as needed.");
    case AgentSessionProviders.Claude:
      return localize("chat.session.providerDescription.claude", "Delegate tasks to the Claude Agent SDK using the Claude models included in your GitHub Copilot subscription. The agent iterates via chat and works interactively to implement changes on your main workspace.");
    case AgentSessionProviders.Codex:
      return localize("chat.session.providerDescription.codex", "Opens a new Codex session in the editor. Codex sessions can be managed from the chat sessions view.");
  }
}
__name(getAgentSessionProviderDescription, "getAgentSessionProviderDescription");
var AgentSessionsViewerOrientation;
(function(AgentSessionsViewerOrientation2) {
  AgentSessionsViewerOrientation2[AgentSessionsViewerOrientation2["Stacked"] = 1] = "Stacked";
  AgentSessionsViewerOrientation2[AgentSessionsViewerOrientation2["SideBySide"] = 2] = "SideBySide";
})(AgentSessionsViewerOrientation || (AgentSessionsViewerOrientation = {}));
var AgentSessionsViewerPosition;
(function(AgentSessionsViewerPosition2) {
  AgentSessionsViewerPosition2[AgentSessionsViewerPosition2["Left"] = 1] = "Left";
  AgentSessionsViewerPosition2[AgentSessionsViewerPosition2["Right"] = 2] = "Right";
})(AgentSessionsViewerPosition || (AgentSessionsViewerPosition = {}));
const agentSessionReadIndicatorForeground = registerColor("agentSessionReadIndicator.foreground", { dark: transparent(foreground, 0.15), light: transparent(foreground, 0.15), hcDark: null, hcLight: null }, localize("agentSessionReadIndicatorForeground", "Foreground color for the read indicator in an agent session."));
const agentSessionSelectedBadgeBorder = registerColor("agentSessionSelectedBadge.border", { dark: transparent(listActiveSelectionForeground, 0.3), light: transparent(listActiveSelectionForeground, 0.3), hcDark: foreground, hcLight: foreground }, localize("agentSessionSelectedBadgeBorder", "Border color for the badges in selected agent session items."));
const agentSessionSelectedUnfocusedBadgeBorder = registerColor("agentSessionSelectedUnfocusedBadge.border", { dark: transparent(foreground, 0.3), light: transparent(foreground, 0.3), hcDark: foreground, hcLight: foreground }, localize("agentSessionSelectedUnfocusedBadgeBorder", "Border color for the badges in selected agent session items when the view is unfocused."));
const AGENT_SESSION_RENAME_ACTION_ID = "agentSession.rename";
const AGENT_SESSION_DELETE_ACTION_ID = "agentSession.delete";
function getAgentSessionTime(timing) {
  return timing.lastRequestEnded ?? timing.lastRequestStarted ?? timing.created;
}
__name(getAgentSessionTime, "getAgentSessionTime");
export {
  AGENT_SESSION_DELETE_ACTION_ID,
  AGENT_SESSION_RENAME_ACTION_ID,
  AgentSessionProviders,
  AgentSessionsViewerOrientation,
  AgentSessionsViewerPosition,
  agentSessionReadIndicatorForeground,
  agentSessionSelectedBadgeBorder,
  agentSessionSelectedUnfocusedBadgeBorder,
  getAgentCanContinueIn,
  getAgentSessionProvider,
  getAgentSessionProviderDescription,
  getAgentSessionProviderIcon,
  getAgentSessionProviderName,
  getAgentSessionTime,
  isBuiltInAgentSessionProvider,
  isFirstPartyAgentSessionProvider
};
//# sourceMappingURL=agentSessions.js.map
