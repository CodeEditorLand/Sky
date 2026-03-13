import * as nls from "../../../../../nls.js";
import { Target } from "./promptTypes.js";
var HookType;
(function(HookType2) {
  HookType2["SessionStart"] = "SessionStart";
  HookType2["SessionEnd"] = "SessionEnd";
  HookType2["UserPromptSubmit"] = "UserPromptSubmit";
  HookType2["PreToolUse"] = "PreToolUse";
  HookType2["PostToolUse"] = "PostToolUse";
  HookType2["PreCompact"] = "PreCompact";
  HookType2["SubagentStart"] = "SubagentStart";
  HookType2["SubagentStop"] = "SubagentStop";
  HookType2["Stop"] = "Stop";
  HookType2["ErrorOccurred"] = "ErrorOccurred";
})(HookType || (HookType = {}));
const HOOKS_BY_TARGET = {
  // see https://code.visualstudio.com/docs/copilot/customization/hooks#_hook-lifecycle-events
  [Target.VSCode]: {
    "SessionStart": HookType.SessionStart,
    "UserPromptSubmit": HookType.UserPromptSubmit,
    "PreToolUse": HookType.PreToolUse,
    "PostToolUse": HookType.PostToolUse,
    "PreCompact": HookType.PreCompact,
    "SubagentStart": HookType.SubagentStart,
    "SubagentStop": HookType.SubagentStop,
    "Stop": HookType.Stop
  },
  // see https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks#types-of-hooks
  [Target.GitHubCopilot]: {
    "sessionStart": HookType.SessionStart,
    "sessionEnd": HookType.SessionEnd,
    "userPromptSubmitted": HookType.UserPromptSubmit,
    "preToolUse": HookType.PreToolUse,
    "postToolUse": HookType.PostToolUse,
    "agentStop": HookType.Stop,
    "subagentStop": HookType.SubagentStop,
    "errorOccurred": HookType.ErrorOccurred
  },
  // see https://docs.anthropic.com/en/docs/claude-code/hooks
  [Target.Claude]: {
    "SessionStart": HookType.SessionStart,
    "UserPromptSubmit": HookType.UserPromptSubmit,
    "PreToolUse": HookType.PreToolUse,
    "PostToolUse": HookType.PostToolUse,
    "PreCompact": HookType.PreCompact,
    "SubagentStart": HookType.SubagentStart,
    "SubagentStop": HookType.SubagentStop,
    "Stop": HookType.Stop
  },
  // if no target, just list all known hook types.
  [Target.Undefined]: Object.fromEntries(Object.values(HookType).map((h) => [h, h]))
};
const HOOK_METADATA = {
  [HookType.SessionStart]: {
    label: nls.localize("hookType.sessionStart.label", "Session Start"),
    description: nls.localize("hookType.sessionStart.description", "Executed when a new agent session begins.")
  },
  [HookType.UserPromptSubmit]: {
    label: nls.localize("hookType.userPromptSubmit.label", "User Prompt Submit"),
    description: nls.localize("hookType.userPromptSubmit.description", "Executed when the user submits a prompt to the agent.")
  },
  [HookType.PreToolUse]: {
    label: nls.localize("hookType.preToolUse.label", "Pre-Tool Use"),
    description: nls.localize("hookType.preToolUse.description", "Executed before the agent uses any tool.")
  },
  [HookType.PostToolUse]: {
    label: nls.localize("hookType.postToolUse.label", "Post-Tool Use"),
    description: nls.localize("hookType.postToolUse.description", "Executed after a tool completes execution successfully.")
  },
  [HookType.PreCompact]: {
    label: nls.localize("hookType.preCompact.label", "Pre-Compact"),
    description: nls.localize("hookType.preCompact.description", "Executed before the agent compacts the conversation context.")
  },
  [HookType.SubagentStart]: {
    label: nls.localize("hookType.subagentStart.label", "Subagent Start"),
    description: nls.localize("hookType.subagentStart.description", "Executed when a subagent is started.")
  },
  [HookType.SubagentStop]: {
    label: nls.localize("hookType.subagentStop.label", "Subagent Stop"),
    description: nls.localize("hookType.subagentStop.description", "Executed when a subagent stops.")
  },
  [HookType.Stop]: {
    label: nls.localize("hookType.stop.label", "Stop"),
    description: nls.localize("hookType.stop.description", "Executed when the agent stops.")
  },
  [HookType.SessionEnd]: {
    label: nls.localize("hookType.sessionEnd.label", "Session End"),
    description: nls.localize("hookType.sessionEnd.description", "Executed when an agent session ends.")
  },
  [HookType.ErrorOccurred]: {
    label: nls.localize("hookType.errorOccurred.label", "Error Occurred"),
    description: nls.localize("hookType.errorOccurred.description", "Executed when an error occurs during the agent session.")
  }
};
export {
  HOOKS_BY_TARGET,
  HOOK_METADATA,
  HookType
};
//# sourceMappingURL=hookTypes.js.map
