var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../../nls.js";
import { URI } from "../../../../../base/common/uri.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { isAbsolute } from "../../../../../base/common/path.js";
import { untildify } from "../../../../../base/common/labels.js";
import { HookType, HOOKS_BY_TARGET, HOOK_METADATA } from "./hookTypes.js";
import { Target } from "./promptTypes.js";
function mergeHooks(base, additional) {
  if (!base) {
    return additional;
  }
  const result = { ...base };
  for (const hookType of Object.values(HookType)) {
    const baseArr = base[hookType];
    const additionalArr = additional[hookType];
    if (additionalArr && additionalArr.length > 0) {
      result[hookType] = baseArr ? [...baseArr, ...additionalArr] : additionalArr;
    }
  }
  return result;
}
__name(mergeHooks, "mergeHooks");
const HOOK_COMMAND_FIELD_DESCRIPTIONS = {
  type: nls.localize("hook.type", 'Must be "command".'),
  command: nls.localize("hook.command", "The command to execute. This is the default cross-platform command."),
  windows: nls.localize("hook.windows", 'Windows-specific command. If specified and running on Windows, this overrides the "command" field.'),
  linux: nls.localize("hook.linux", 'Linux-specific command. If specified and running on Linux, this overrides the "command" field.'),
  osx: nls.localize("hook.osx", 'macOS-specific command. If specified and running on macOS, this overrides the "command" field.'),
  bash: nls.localize("hook.bash", "Bash command for Linux and macOS."),
  powershell: nls.localize("hook.powershell", "PowerShell command for Windows."),
  cwd: nls.localize("hook.cwd", "Working directory for the script (relative to repository root)."),
  env: nls.localize("hook.env", "Additional environment variables that are merged with the existing environment."),
  timeout: nls.localize("hook.timeout", "Maximum execution time in seconds (default: 30)."),
  timeoutSec: nls.localize("hook.timeoutSec", "Maximum execution time in seconds (default: 10).")
};
const vscodeHookCommandSchema = {
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
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.type
    },
    command: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.command
    },
    windows: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.windows
    },
    linux: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.linux
    },
    osx: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.osx
    },
    cwd: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.cwd
    },
    env: {
      type: "object",
      additionalProperties: { type: "string" },
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.env
    },
    timeout: {
      type: "number",
      default: 30,
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.timeout
    }
  }
};
const hookArraySchema = {
  type: "array",
  items: vscodeHookCommandSchema
};
function buildHookProperties(target, arraySchema) {
  return Object.fromEntries(Object.entries(HOOKS_BY_TARGET[target]).map(([key, hookType]) => [
    key,
    { ...arraySchema, description: HOOK_METADATA[hookType]?.description }
  ]));
}
__name(buildHookProperties, "buildHookProperties");
const vscodeHookProperties = buildHookProperties(Target.VSCode, hookArraySchema);
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
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.type
    },
    bash: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.bash
    },
    powershell: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.powershell
    },
    cwd: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.cwd
    },
    env: {
      type: "object",
      additionalProperties: { type: "string" },
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.env
    },
    timeoutSec: {
      type: "number",
      default: 10,
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.timeoutSec
    }
  }
};
const copilotCliHookArraySchema = {
  type: "array",
  items: copilotCliHookCommandSchema
};
const copilotCliHookProperties = buildHookProperties(Target.GitHubCopilot, copilotCliHookArraySchema);
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
function extractHookCommandsFromItem(item, workspaceRootUri, userHome) {
  if (!item || typeof item !== "object") {
    return [];
  }
  const itemObj = item;
  const commands = [];
  const nestedHooks = itemObj.hooks;
  if (nestedHooks !== void 0 && Array.isArray(nestedHooks)) {
    for (const nestedHook of nestedHooks) {
      if (!nestedHook || typeof nestedHook !== "object") {
        continue;
      }
      const normalized = normalizeForResolve(nestedHook);
      const resolved = resolveHookCommand(normalized, workspaceRootUri, userHome);
      if (resolved) {
        commands.push(resolved);
      }
    }
  } else {
    const normalized = normalizeForResolve(itemObj);
    const resolved = resolveHookCommand(normalized, workspaceRootUri, userHome);
    if (resolved) {
      commands.push(resolved);
    }
  }
  return commands;
}
__name(extractHookCommandsFromItem, "extractHookCommandsFromItem");
function normalizeForResolve(raw) {
  if (raw.type === void 0 || raw.type === "command") {
    return { ...raw, type: "command" };
  }
  return raw;
}
__name(normalizeForResolve, "normalizeForResolve");
function yamlValueToPlain(value) {
  switch (value.type) {
    case "scalar":
      return value.value;
    case "sequence":
      return value.items.map(yamlValueToPlain);
    case "map": {
      const obj = {};
      for (const prop of value.properties) {
        obj[prop.key.value] = yamlValueToPlain(prop.value);
      }
      return obj;
    }
  }
}
__name(yamlValueToPlain, "yamlValueToPlain");
function parseSubagentHooksFromYaml(hooksMap, workspaceRootUri, userHome, target = Target.Undefined) {
  const result = {};
  const targetHookMap = HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET[Target.Undefined];
  for (const prop of hooksMap.properties) {
    const hookTypeName = prop.key.value;
    const hookType = targetHookMap[hookTypeName] ?? toHookType(hookTypeName);
    if (!hookType) {
      continue;
    }
    if (prop.value.type !== "sequence") {
      continue;
    }
    const commands = [];
    for (const item of prop.value.items) {
      const plainItem = yamlValueToPlain(item);
      const extracted = extractHookCommandsFromItem(plainItem, workspaceRootUri, userHome);
      commands.push(...extracted);
    }
    if (commands.length > 0) {
      if (!result[hookType]) {
        result[hookType] = [];
      }
      result[hookType].push(...commands);
    }
  }
  return result;
}
__name(parseSubagentHooksFromYaml, "parseSubagentHooksFromYaml");
export {
  HOOK_COMMAND_FIELD_DESCRIPTIONS,
  HOOK_SCHEMA_URI,
  extractHookCommandsFromItem,
  formatHookCommandLabel,
  getEffectiveCommandFieldKey,
  getEffectiveCommandSource,
  getPlatformLabel,
  hookFileSchema,
  isUsingPlatformOverride,
  mergeHooks,
  parseSubagentHooksFromYaml,
  resolveEffectiveCommand,
  resolveHookCommand,
  toHookType
};
//# sourceMappingURL=hookSchema.js.map
