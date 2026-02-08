var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { HookType, normalizeHookTypeId, resolveHookCommand } from "./hookSchema.js";
const CLAUDE_HOOK_TYPE_MAP = {
  "SessionStart": HookType.SessionStart,
  "UserPromptSubmit": HookType.UserPromptSubmitted,
  "PreToolUse": HookType.PreToolUse,
  "PostToolUse": HookType.PostToolUse,
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
    return result;
  }
  const root = json;
  const hooks = root.hooks;
  if (!hooks || typeof hooks !== "object") {
    return result;
  }
  const hooksObj = hooks;
  for (const originalId of Object.keys(hooksObj)) {
    const hookType = resolveClaudeHookType(originalId) ?? normalizeHookTypeId(originalId);
    if (!hookType) {
      continue;
    }
    const hookArray = hooksObj[originalId];
    if (!Array.isArray(hookArray)) {
      continue;
    }
    const commands = [];
    for (const item of hookArray) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const itemObj = item;
      const nestedHooks = itemObj.hooks;
      if (nestedHooks !== void 0 && Array.isArray(nestedHooks)) {
        for (const nestedHook of nestedHooks) {
          const resolved = resolveClaudeCommand(nestedHook, workspaceRootUri, userHome);
          if (resolved) {
            commands.push(resolved);
          }
        }
      } else {
        const resolved = resolveClaudeCommand(itemObj, workspaceRootUri, userHome);
        if (resolved) {
          commands.push(resolved);
        }
      }
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
  return result;
}
__name(parseClaudeHooks, "parseClaudeHooks");
function resolveClaudeCommand(raw, workspaceRootUri, userHome) {
  const hasValidType = raw.type === void 0 || raw.type === "command";
  if (!hasValidType) {
    return void 0;
  }
  const normalized = { ...raw, type: "command" };
  return resolveHookCommand(normalized, workspaceRootUri, userHome);
}
__name(resolveClaudeCommand, "resolveClaudeCommand");
export {
  CLAUDE_HOOK_TYPE_MAP,
  getClaudeHookTypeName,
  parseClaudeHooks,
  resolveClaudeHookType
};
//# sourceMappingURL=hookClaudeCompat.js.map
