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
  AgentSessionProviders2["ClaudeCode"] = "claude-code";
})(AgentSessionProviders || (AgentSessionProviders = {}));
function getAgentSessionProvider(sessionResource) {
  const type = URI.isUri(sessionResource) ? getChatSessionType(sessionResource) : sessionResource;
  switch (type) {
    case AgentSessionProviders.Local:
    case AgentSessionProviders.Background:
    case AgentSessionProviders.Cloud:
    case AgentSessionProviders.ClaudeCode:
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
    case AgentSessionProviders.ClaudeCode:
      return localize("chat.session.providerLabel.claude", "Claude");
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
    case AgentSessionProviders.ClaudeCode:
      return Codicon.code;
  }
}
__name(getAgentSessionProviderIcon, "getAgentSessionProviderIcon");
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
export {
  AGENT_SESSION_DELETE_ACTION_ID,
  AGENT_SESSION_RENAME_ACTION_ID,
  AgentSessionProviders,
  AgentSessionsViewerOrientation,
  AgentSessionsViewerPosition,
  agentSessionReadIndicatorForeground,
  agentSessionSelectedBadgeBorder,
  agentSessionSelectedUnfocusedBadgeBorder,
  getAgentSessionProvider,
  getAgentSessionProviderIcon,
  getAgentSessionProviderName
};
//# sourceMappingURL=agentSessions.js.map
