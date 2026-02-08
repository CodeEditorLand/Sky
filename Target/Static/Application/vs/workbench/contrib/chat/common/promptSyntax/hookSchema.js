var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../../nls.js";
import { URI } from "../../../../../base/common/uri.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { isAbsolute } from "../../../../../base/common/path.js";
import { untildify } from "../../../../../base/common/labels.js";
var HookType;
(function(HookType2) {
  HookType2["SessionStart"] = "sessionStart";
  HookType2["UserPromptSubmitted"] = "userPromptSubmitted";
  HookType2["PreToolUse"] = "preToolUse";
  HookType2["PostToolUse"] = "postToolUse";
  HookType2["PostToolUseFailure"] = "postToolUseFailure";
  HookType2["SubagentStart"] = "subagentStart";
  HookType2["SubagentStop"] = "subagentStop";
  HookType2["Stop"] = "stop";
})(HookType || (HookType = {}));
const HOOK_TYPES = [
  {
    id: HookType.SessionStart,
    label: nls.localize("hookType.sessionStart.label", "Session Start"),
    description: nls.localize("hookType.sessionStart.description", "Executed when a new agent session begins or when resuming an existing session.")
  },
  {
    id: HookType.UserPromptSubmitted,
    label: nls.localize("hookType.userPromptSubmitted.label", "User Prompt Submitted"),
    description: nls.localize("hookType.userPromptSubmitted.description", "Executed when the user submits a prompt to the agent.")
  },
  {
    id: HookType.PreToolUse,
    label: nls.localize("hookType.preToolUse.label", "Pre-Tool Use"),
    description: nls.localize("hookType.preToolUse.description", "Executed before the agent uses any tool (such as bash, edit, view).")
  },
  {
    id: HookType.PostToolUse,
    label: nls.localize("hookType.postToolUse.label", "Post-Tool Use"),
    description: nls.localize("hookType.postToolUse.description", "Executed after a tool completes execution successfully.")
  },
  {
    id: HookType.PostToolUseFailure,
    label: nls.localize("hookType.postToolUseFailure.label", "Post-Tool Use Failure"),
    description: nls.localize("hookType.postToolUseFailure.description", "Executed after a tool completes execution with a failure.")
  },
  {
    id: HookType.SubagentStart,
    label: nls.localize("hookType.subagentStart.label", "Subagent Start"),
    description: nls.localize("hookType.subagentStart.description", "Executed when a subagent is started.")
  },
  {
    id: HookType.SubagentStop,
    label: nls.localize("hookType.subagentStop.label", "Subagent Stop"),
    description: nls.localize("hookType.subagentStop.description", "Executed when a subagent stops.")
  },
  {
    id: HookType.Stop,
    label: nls.localize("hookType.stop.label", "Stop"),
    description: nls.localize("hookType.stop.description", "Executed when the agent stops.")
  }
];
const hookCommandSchema = {
  type: "object",
  additionalProperties: false,
  required: ["type"],
  anyOf: [
    { required: ["command"] },
    { required: ["bash"] },
    { required: ["powershell"] }
  ],
  errorMessage: nls.localize("hook.commandRequired", 'At least one of "command", "bash", or "powershell" must be specified.'),
  properties: {
    type: {
      type: "string",
      enum: ["command"],
      description: nls.localize("hook.type", 'Must be "command".')
    },
    command: {
      type: "string",
      description: nls.localize("hook.command", "The command to execute. This is the recommended way to specify commands and works cross-platform.")
    },
    bash: {
      type: "string",
      description: nls.localize("hook.bash", 'Path to a bash script or an inline bash command. Use for Unix-specific commands when cross-platform "command" is not sufficient.')
    },
    powershell: {
      type: "string",
      description: nls.localize("hook.powershell", 'Path to a PowerShell script or an inline PowerShell command. Use for Windows-specific commands when cross-platform "command" is not sufficient.')
    },
    cwd: {
      type: "string",
      description: nls.localize("hook.cwd", "Working directory for the script (relative to repository root).")
    },
    env: {
      type: "object",
      additionalProperties: { type: "string" },
      description: nls.localize("hook.env", "Additional environment variables that are merged with the existing environment.")
    },
    timeoutSec: {
      type: "number",
      default: 30,
      description: nls.localize("hook.timeoutSec", "Maximum execution time in seconds (default: 30).")
    }
  }
};
const hookArraySchema = {
  type: "array",
  items: hookCommandSchema
};
const hookFileSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description: nls.localize("hookFile.description", "GitHub Copilot hook configuration file. Hooks enable executing custom shell commands at strategic points in an agent's workflow."),
  additionalProperties: false,
  required: ["version", "hooks"],
  properties: {
    version: {
      type: "number",
      enum: [1],
      description: nls.localize("hookFile.version", "Schema version. Must be 1.")
    },
    hooks: {
      type: "object",
      description: nls.localize("hookFile.hooks", "Hook definitions organized by type."),
      additionalProperties: false,
      properties: {
        sessionStart: {
          ...hookArraySchema,
          description: nls.localize("hookFile.sessionStart", "Executed when a new agent session begins or when resuming an existing session. Use to initialize environments, log session starts, validate project state, or set up temporary resources.")
        },
        userPromptSubmitted: {
          ...hookArraySchema,
          description: nls.localize("hookFile.userPromptSubmitted", "Executed when the user submits a prompt to the agent. Use to log user requests for auditing and usage analysis.")
        },
        preToolUse: {
          ...hookArraySchema,
          description: nls.localize("hookFile.preToolUse", "Executed before the agent uses any tool (such as bash, edit, view). This is the most powerful hook as it can approve or deny tool executions. Use to block dangerous commands, enforce security policies, require approval for sensitive operations, or log tool usage.")
        },
        postToolUse: {
          ...hookArraySchema,
          description: nls.localize("hookFile.postToolUse", "Executed after a tool completes execution successfully. Use to log execution results, track usage statistics, generate audit trails, or monitor performance.")
        },
        postToolUseFailure: {
          ...hookArraySchema,
          description: nls.localize("hookFile.postToolUseFailure", "Executed after a tool completes execution with a failure. Use to log errors, send failure alerts, or trigger recovery actions.")
        },
        subagentStart: {
          ...hookArraySchema,
          description: nls.localize("hookFile.subagentStart", "Executed when a subagent is started. Use to log subagent spawning, track nested agent usage, or initialize subagent-specific resources.")
        },
        subagentStop: {
          ...hookArraySchema,
          description: nls.localize("hookFile.subagentStop", "Executed when a subagent stops. Use to log subagent completion, cleanup subagent resources, or aggregate subagent results.")
        },
        stop: {
          ...hookArraySchema,
          description: nls.localize("hookFile.stop", "Executed when the agent session stops. Use to cleanup resources, generate final reports, or send completion notifications.")
        }
      }
    }
  },
  defaultSnippets: [
    {
      label: nls.localize("hookFile.snippet.basic", "Basic hook configuration"),
      description: nls.localize("hookFile.snippet.basic.description", "A basic hook configuration with common hooks"),
      body: {
        version: 1,
        hooks: {
          sessionStart: [
            {
              type: "command",
              command: '${1:echo "Session started"}'
            }
          ],
          preToolUse: [
            {
              type: "command",
              command: "${2:./scripts/validate.sh}",
              timeoutSec: 15
            }
          ]
        }
      }
    }
  ]
};
const HOOK_SCHEMA_URI = "vscode://schemas/hooks";
const HOOK_FILE_GLOB = "hooks/hooks.json";
function normalizeHookTypeId(rawHookTypeId) {
  if (Object.values(HookType).includes(rawHookTypeId)) {
    return rawHookTypeId;
  }
  switch (rawHookTypeId) {
    case "SessionStart":
      return HookType.SessionStart;
    case "UserPromptSubmit":
      return HookType.UserPromptSubmitted;
    case "PreToolUse":
      return HookType.PreToolUse;
    case "PostToolUse":
      return HookType.PostToolUse;
    case "PostToolUseFailure":
      return HookType.PostToolUseFailure;
    case "SubagentStart":
      return HookType.SubagentStart;
    case "SubagentStop":
      return HookType.SubagentStop;
    case "Stop":
      return HookType.Stop;
    default:
      return void 0;
  }
}
__name(normalizeHookTypeId, "normalizeHookTypeId");
function normalizeHookCommand(raw) {
  if (raw.type !== "command") {
    return void 0;
  }
  const hasCommand = typeof raw.command === "string" && raw.command.length > 0;
  const hasBash = typeof raw.bash === "string" && raw.bash.length > 0;
  const hasPowerShell = typeof raw.powershell === "string" && raw.powershell.length > 0;
  return {
    ...hasCommand && { command: raw.command },
    ...hasBash && { bash: raw.bash },
    ...hasPowerShell && { powershell: raw.powershell },
    ...typeof raw.cwd === "string" && { cwd: raw.cwd },
    ...typeof raw.env === "object" && raw.env !== null && { env: raw.env },
    ...typeof raw.timeoutSec === "number" && { timeoutSec: raw.timeoutSec }
  };
}
__name(normalizeHookCommand, "normalizeHookCommand");
function formatHookCommandLabel(hook) {
  if (hook.command) {
    return hook.command;
  }
  const parts = [];
  if (hook.bash) {
    parts.push(`bash: ${hook.bash}`);
  }
  if (hook.powershell) {
    parts.push(`powershell: ${hook.powershell}`);
  }
  return parts.join(" | ");
}
__name(formatHookCommandLabel, "formatHookCommandLabel");
function resolveHookCommand(raw, workspaceRootUri, userHome) {
  const normalized = normalizeHookCommand(raw);
  if (!normalized) {
    return void 0;
  }
  let cwdUri;
  if (normalized.cwd) {
    const expandedCwd = untildify(normalized.cwd, userHome);
    if (isAbsolute(expandedCwd)) {
      cwdUri = URI.file(expandedCwd);
    } else if (workspaceRootUri) {
      cwdUri = joinPath(workspaceRootUri, expandedCwd);
    }
  } else {
    cwdUri = workspaceRootUri;
  }
  return {
    type: "command",
    ...normalized.command && { command: normalized.command },
    ...normalized.bash && { bash: normalized.bash },
    ...normalized.powershell && { powershell: normalized.powershell },
    ...cwdUri && { cwd: cwdUri },
    ...normalized.env && { env: normalized.env },
    ...normalized.timeoutSec !== void 0 && { timeoutSec: normalized.timeoutSec }
  };
}
__name(resolveHookCommand, "resolveHookCommand");
export {
  HOOK_FILE_GLOB,
  HOOK_SCHEMA_URI,
  HOOK_TYPES,
  HookType,
  formatHookCommandLabel,
  hookFileSchema,
  normalizeHookTypeId,
  resolveHookCommand
};
//# sourceMappingURL=hookSchema.js.map
