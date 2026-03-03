var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../../nls.js";
import { URI } from "../../../../../base/common/uri.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { isAbsolute } from "../../../../../base/common/path.js";
import { untildify } from "../../../../../base/common/labels.js";
var HookType;
(function(HookType2) {
  HookType2["SessionStart"] = "SessionStart";
  HookType2["UserPromptSubmit"] = "UserPromptSubmit";
  HookType2["PreToolUse"] = "PreToolUse";
  HookType2["PostToolUse"] = "PostToolUse";
  HookType2["PreCompact"] = "PreCompact";
  HookType2["SubagentStart"] = "SubagentStart";
  HookType2["SubagentStop"] = "SubagentStop";
  HookType2["Stop"] = "Stop";
})(HookType || (HookType = {}));
const COPILOT_CLI_HOOK_TYPE_MAP = {
  "sessionStart": HookType.SessionStart,
  "userPromptSubmitted": HookType.UserPromptSubmit,
  "preToolUse": HookType.PreToolUse,
  "postToolUse": HookType.PostToolUse
};
const HOOK_TYPES = [
  {
    id: HookType.SessionStart,
    label: nls.localize("hookType.sessionStart.label", "Session Start"),
    description: nls.localize("hookType.sessionStart.description", "Executed when a new agent session begins.")
  },
  {
    id: HookType.UserPromptSubmit,
    label: nls.localize("hookType.userPromptSubmit.label", "User Prompt Submit"),
    description: nls.localize("hookType.userPromptSubmit.description", "Executed when the user submits a prompt to the agent.")
  },
  {
    id: HookType.PreToolUse,
    label: nls.localize("hookType.preToolUse.label", "Pre-Tool Use"),
    description: nls.localize("hookType.preToolUse.description", "Executed before the agent uses any tool.")
  },
  {
    id: HookType.PostToolUse,
    label: nls.localize("hookType.postToolUse.label", "Post-Tool Use"),
    description: nls.localize("hookType.postToolUse.description", "Executed after a tool completes execution successfully.")
  },
  {
    id: HookType.PreCompact,
    label: nls.localize("hookType.preCompact.label", "Pre-Compact"),
    description: nls.localize("hookType.preCompact.description", "Executed before the agent compacts the conversation context.")
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
  additionalProperties: true,
  required: ["type"],
  anyOf: [
    { required: ["command"] },
    { required: ["windows"] },
    { required: ["linux"] },
    { required: ["osx"] },
    { required: ["bash"] },
    { required: ["powershell"] }
  ],
  errorMessage: nls.localize("hook.commandRequired", 'At least one of "command", "windows", "linux", or "osx" must be specified.'),
  properties: {
    type: {
      type: "string",
      enum: ["command"],
      description: nls.localize("hook.type", 'Must be "command".')
    },
    command: {
      type: "string",
      description: nls.localize("hook.command", "The command to execute. This is the default cross-platform command.")
    },
    windows: {
      type: "string",
      description: nls.localize("hook.windows", 'Windows-specific command. If specified and running on Windows, this overrides the "command" field.')
    },
    linux: {
      type: "string",
      description: nls.localize("hook.linux", 'Linux-specific command. If specified and running on Linux, this overrides the "command" field.')
    },
    osx: {
      type: "string",
      description: nls.localize("hook.osx", 'macOS-specific command. If specified and running on macOS, this overrides the "command" field.')
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
    timeout: {
      type: "number",
      default: 30,
      description: nls.localize("hook.timeout", "Maximum execution time in seconds (default: 30).")
    }
  }
};
const hookArraySchema = {
  type: "array",
  items: hookCommandSchema
};
const vscodeHookProperties = {
  SessionStart: {
    ...hookArraySchema,
    description: nls.localize("hookFile.sessionStart", "Executed when a new agent session begins. Use to initialize environments, log session starts, validate project state, or set up temporary resources.")
  },
  UserPromptSubmit: {
    ...hookArraySchema,
    description: nls.localize("hookFile.userPromptSubmit", "Executed when the user submits a prompt to the agent. Use to log user requests for auditing and usage analysis.")
  },
  PreToolUse: {
    ...hookArraySchema,
    description: nls.localize("hookFile.preToolUse", "Executed before the agent uses any tool. This is the most powerful hook as it can approve or deny tool executions. Use to block dangerous commands, enforce security policies, require approval for sensitive operations, or log tool usage.")
  },
  PostToolUse: {
    ...hookArraySchema,
    description: nls.localize("hookFile.postToolUse", "Executed after a tool completes execution successfully. Use to log execution results, track usage statistics, generate audit trails, or monitor performance.")
  },
  PreCompact: {
    ...hookArraySchema,
    description: nls.localize("hookFile.preCompact", "Executed before the agent compacts the conversation context. Use to save conversation state, export important information, or prepare for context reduction.")
  },
  SubagentStart: {
    ...hookArraySchema,
    description: nls.localize("hookFile.subagentStart", "Executed when a subagent is started. Use to log subagent spawning, track nested agent usage, or initialize subagent-specific resources.")
  },
  SubagentStop: {
    ...hookArraySchema,
    description: nls.localize("hookFile.subagentStop", "Executed when a subagent stops. Use to log subagent completion, cleanup subagent resources, or aggregate subagent results.")
  },
  Stop: {
    ...hookArraySchema,
    description: nls.localize("hookFile.stop", "Executed when the agent session stops. Use to cleanup resources, generate final reports, or send completion notifications.")
  }
};
const copilotCliHookCommandSchema = {
  type: "object",
  additionalProperties: true,
  required: ["type"],
  anyOf: [
    { required: ["bash"] },
    { required: ["powershell"] }
  ],
  errorMessage: nls.localize("hook.cliCommandRequired", 'At least one of "bash" or "powershell" must be specified.'),
  properties: {
    type: {
      type: "string",
      enum: ["command"],
      description: nls.localize("hook.type", 'Must be "command".')
    },
    bash: {
      type: "string",
      description: nls.localize("hook.bash", "Bash command for Linux and macOS.")
    },
    powershell: {
      type: "string",
      description: nls.localize("hook.powershell", "PowerShell command for Windows.")
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
      default: 10,
      description: nls.localize("hook.timeoutSec", "Maximum execution time in seconds (default: 10).")
    }
  }
};
const copilotCliHookArraySchema = {
  type: "array",
  items: copilotCliHookCommandSchema
};
const copilotCliHookProperties = {
  sessionStart: {
    ...copilotCliHookArraySchema,
    description: nls.localize("hookFile.cli.sessionStart", "Executed when a new agent session begins.")
  },
  userPromptSubmitted: {
    ...copilotCliHookArraySchema,
    description: nls.localize("hookFile.cli.userPromptSubmitted", "Executed when the user submits a prompt to the agent.")
  },
  preToolUse: {
    ...copilotCliHookArraySchema,
    description: nls.localize("hookFile.cli.preToolUse", "Executed before the agent uses any tool. Can approve or deny tool executions.")
  },
  postToolUse: {
    ...copilotCliHookArraySchema,
    description: nls.localize("hookFile.cli.postToolUse", "Executed after a tool completes execution successfully.")
  }
};
const hookFileSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description: nls.localize("hookFile.description", "GitHub Copilot hook configuration file. Hooks enable executing custom shell commands at strategic points in an agent's workflow."),
  additionalProperties: true,
  required: ["hooks"],
  properties: {
    hooks: {
      type: "object",
      description: nls.localize("hookFile.hooks", "Hook definitions organized by type."),
      additionalProperties: true
    }
  },
  // Conditionally apply PascalCase or camelCase hook properties based on
  // whether the file uses the Copilot CLI format (detected by the "version" field).
  if: {
    required: ["version"],
    properties: {
      version: { type: "number" }
    }
  },
  then: {
    // Copilot CLI format: camelCase hook names, bash/powershell/timeoutSec fields
    properties: {
      version: {
        type: "number",
        description: nls.localize("hookFile.version", "Hook configuration format version.")
      },
      hooks: {
        properties: copilotCliHookProperties
      }
    }
  },
  else: {
    // VS Code / PascalCase format
    properties: {
      hooks: {
        properties: vscodeHookProperties
      }
    }
  },
  defaultSnippets: [
    {
      label: nls.localize("hookFile.snippet.basic", "Basic hook configuration"),
      description: nls.localize("hookFile.snippet.basic.description", "A basic hook configuration with common hooks"),
      body: {
        hooks: {
          SessionStart: [
            {
              type: "command",
              command: '${1:echo "Session started" >> session.log}'
            }
          ],
          PreToolUse: [
            {
              type: "command",
              command: "${2:./scripts/validate.sh}",
              timeout: 15
            }
          ]
        }
      }
    }
  ]
};
const HOOK_SCHEMA_URI = "vscode://schemas/hooks";
const HOOK_FILE_GLOB = ".github/hooks/*.json";
function toHookType(rawHookTypeId) {
  if (Object.values(HookType).includes(rawHookTypeId)) {
    return rawHookTypeId;
  }
  return void 0;
}
__name(toHookType, "toHookType");
function normalizeHookCommand(raw) {
  if (raw.type !== "command") {
    return void 0;
  }
  const hasCommand = typeof raw.command === "string" && raw.command.length > 0;
  const hasBash = typeof raw.bash === "string" && raw.bash.length > 0;
  const hasPowerShell = typeof raw.powershell === "string" && raw.powershell.length > 0;
  const hasWindows = typeof raw.windows === "string" && raw.windows.length > 0;
  const hasLinux = typeof raw.linux === "string" && raw.linux.length > 0;
  const hasOsx = typeof raw.osx === "string" && raw.osx.length > 0;
  const windows = hasWindows ? raw.windows : hasPowerShell ? raw.powershell : void 0;
  const linux = hasLinux ? raw.linux : hasBash ? raw.bash : void 0;
  const osx = hasOsx ? raw.osx : hasBash ? raw.bash : void 0;
  const windowsSource = hasWindows ? "windows" : hasPowerShell ? "powershell" : void 0;
  const linuxSource = hasLinux ? "linux" : hasBash ? "bash" : void 0;
  const osxSource = hasOsx ? "osx" : hasBash ? "bash" : void 0;
  return {
    ...hasCommand && { command: raw.command },
    ...windows && { windows },
    ...linux && { linux },
    ...osx && { osx },
    ...windowsSource && { windowsSource },
    ...linuxSource && { linuxSource },
    ...osxSource && { osxSource },
    ...typeof raw.cwd === "string" && { cwd: raw.cwd },
    ...typeof raw.env === "object" && raw.env !== null && { env: raw.env },
    ...typeof raw.timeout !== "number" && typeof raw.timeoutSec === "number" && { timeout: raw.timeoutSec },
    ...typeof raw.timeout === "number" && { timeout: raw.timeout }
  };
}
__name(normalizeHookCommand, "normalizeHookCommand");
function getPlatformLabel(os) {
  if (os === 1) {
    return "Windows";
  } else if (os === 2) {
    return "macOS";
  } else if (os === 3) {
    return "Linux";
  }
  return "";
}
__name(getPlatformLabel, "getPlatformLabel");
function resolveEffectiveCommand(hook, os) {
  if (os === 1 && hook.windows) {
    return hook.windows;
  } else if (os === 2 && hook.osx) {
    return hook.osx;
  } else if (os === 3 && hook.linux) {
    return hook.linux;
  }
  return hook.command;
}
__name(resolveEffectiveCommand, "resolveEffectiveCommand");
function isUsingPlatformOverride(hook, os) {
  if (os === 1 && hook.windows) {
    return true;
  } else if (os === 2 && hook.osx) {
    return true;
  } else if (os === 3 && hook.linux) {
    return true;
  }
  return false;
}
__name(isUsingPlatformOverride, "isUsingPlatformOverride");
function getEffectiveCommandSource(hook, os) {
  if (os === 1 && hook.windows && hook.windowsSource === "powershell") {
    return "powershell";
  } else if (os === 2 && hook.osx && hook.osxSource === "bash") {
    return "bash";
  } else if (os === 3 && hook.linux && hook.linuxSource === "bash") {
    return "bash";
  }
  return void 0;
}
__name(getEffectiveCommandSource, "getEffectiveCommandSource");
function getEffectiveCommandFieldKey(hook, os) {
  if (os === 1 && hook.windows) {
    return hook.windowsSource ?? "windows";
  } else if (os === 2 && hook.osx) {
    return hook.osxSource ?? "osx";
  } else if (os === 3 && hook.linux) {
    return hook.linuxSource ?? "linux";
  }
  return "command";
}
__name(getEffectiveCommandFieldKey, "getEffectiveCommandFieldKey");
function formatHookCommandLabel(hook, os) {
  const command = resolveEffectiveCommand(hook, os);
  if (!command) {
    return "";
  }
  return command;
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
    ...normalized.windows && { windows: normalized.windows },
    ...normalized.linux && { linux: normalized.linux },
    ...normalized.osx && { osx: normalized.osx },
    ...normalized.windowsSource && { windowsSource: normalized.windowsSource },
    ...normalized.linuxSource && { linuxSource: normalized.linuxSource },
    ...normalized.osxSource && { osxSource: normalized.osxSource },
    ...cwdUri && { cwd: cwdUri },
    ...normalized.env && { env: normalized.env },
    ...normalized.timeout !== void 0 && { timeout: normalized.timeout }
  };
}
__name(resolveHookCommand, "resolveHookCommand");
export {
  COPILOT_CLI_HOOK_TYPE_MAP,
  HOOK_FILE_GLOB,
  HOOK_SCHEMA_URI,
  HOOK_TYPES,
  HookType,
  formatHookCommandLabel,
  getEffectiveCommandFieldKey,
  getEffectiveCommandSource,
  getPlatformLabel,
  hookFileSchema,
  isUsingPlatformOverride,
  resolveEffectiveCommand,
  resolveHookCommand,
  toHookType
};
//# sourceMappingURL=hookSchema.js.map
