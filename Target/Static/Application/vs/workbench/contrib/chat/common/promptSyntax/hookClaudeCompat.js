var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { HookType, toHookType, resolveHookCommand } from "./hookSchema.js";
const CLAUDE_HOOK_TYPE_MAP = {
  "SessionStart": HookType.SessionStart,
  "UserPromptSubmit": HookType.UserPromptSubmit,
  "PreToolUse": HookType.PreToolUse,
  "PostToolUse": HookType.PostToolUse,
  "PreCompact": HookType.PreCompact,
  "SubagentStart": HookType.SubagentStart,
  "SubagentStop": HookType.SubagentStop,
  "Stop": HookType.Stop
};
let _hookTypeToClaudeName;
function getHookTypeToClaudeNameMap() {
  if (!_hookTypeToClaudeName) {
    _hookTypeToClaudeName = /* @__PURE__ */ new Map();
    for (const [claudeName, hookType] of Object.entries(CLAUDE_HOOK_TYPE_MAP)) {
      _hookTypeToClaudeName.set(hookType, claudeName);
    }
  }
  return _hookTypeToClaudeName;
}
__name(getHookTypeToClaudeNameMap, "getHookTypeToClaudeNameMap");
function resolveClaudeHookType(name) {
  return CLAUDE_HOOK_TYPE_MAP[name];
}
__name(resolveClaudeHookType, "resolveClaudeHookType");
function getClaudeHookTypeName(hookType) {
  return getHookTypeToClaudeNameMap().get(hookType);
}
__name(getClaudeHookTypeName, "getClaudeHookTypeName");
function parseClaudeHooks(json, workspaceRootUri, userHome) {
  const result = /* @__PURE__ */ new Map();
  if (!json || typeof json !== "object") {
    return { hooks: result, disabledAllHooks: false };
  }
  const root = json;
  if (root.disableAllHooks === true) {
    return { hooks: result, disabledAllHooks: true };
  }
  const hooks = root.hooks;
  if (!hooks || typeof hooks !== "object") {
    return { hooks: result, disabledAllHooks: false };
  }
  const hooksObj = hooks;
  for (const originalId of Object.keys(hooksObj)) {
    const hookType = resolveClaudeHookType(originalId) ?? toHookType(originalId);
    if (!hookType) {
      continue;
    }
    const hookArray = hooksObj[originalId];
    if (!Array.isArray(hookArray)) {
      continue;
    }
    const commands = [];
    for (const item of hookArray) {
      const extracted = extractHookCommandsFromItem(item, workspaceRootUri, userHome);
      commands.push(...extracted);
    }
    if (commands.length > 0) {
      const existing = result.get(hookType);
      if (existing) {
        existing.hooks.push(...commands);
      } else {
        result.set(hookType, { hooks: commands, originalId });
      }
    }
  }
  return { hooks: result, disabledAllHooks: false };
}
__name(parseClaudeHooks, "parseClaudeHooks");
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
export {
  CLAUDE_HOOK_TYPE_MAP,
  extractHookCommandsFromItem,
  getClaudeHookTypeName,
  parseClaudeHooks,
  resolveClaudeHookType
};
//# sourceMappingURL=hookClaudeCompat.js.map
