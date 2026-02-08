var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename, dirname } from "../../../../../base/common/path.js";
import { normalizeHookTypeId, resolveHookCommand } from "./hookSchema.js";
import { parseClaudeHooks } from "./hookClaudeCompat.js";
var HookSourceFormat;
(function(HookSourceFormat2) {
  HookSourceFormat2["Copilot"] = "copilot";
  HookSourceFormat2["Claude"] = "claude";
})(HookSourceFormat || (HookSourceFormat = {}));
function getHookSourceFormat(fileUri) {
  const filename = basename(fileUri.path).toLowerCase();
  const dir = dirname(fileUri.path);
  if ((filename === "settings.json" || filename === "settings.local.json") && dir.endsWith(".claude")) {
    return HookSourceFormat.Claude;
  }
  if (filename === "hooks.json") {
    return HookSourceFormat.Copilot;
  }
  return HookSourceFormat.Copilot;
}
__name(getHookSourceFormat, "getHookSourceFormat");
function isReadOnlyHookSource(format) {
  return format === HookSourceFormat.Claude;
}
__name(isReadOnlyHookSource, "isReadOnlyHookSource");
function parseCopilotHooks(json, workspaceRootUri, userHome) {
  const result = /* @__PURE__ */ new Map();
  if (!json || typeof json !== "object") {
    return result;
  }
  const root = json;
  if (root.version !== 1) {
    return result;
  }
  const hooks = root.hooks;
  if (!hooks || typeof hooks !== "object") {
    return result;
  }
  const hooksObj = hooks;
  for (const originalId of Object.keys(hooksObj)) {
    const hookType = normalizeHookTypeId(originalId);
    if (!hookType) {
      continue;
    }
    const hookArray = hooksObj[originalId];
    if (!Array.isArray(hookArray)) {
      continue;
    }
    const commands = [];
    for (const item of hookArray) {
      const resolved = resolveHookCommand(item, workspaceRootUri, userHome);
      if (resolved) {
        commands.push(resolved);
      }
    }
    if (commands.length > 0) {
      result.set(hookType, { hooks: commands, originalId });
    }
  }
  return result;
}
__name(parseCopilotHooks, "parseCopilotHooks");
function parseHooksFromFile(fileUri, json, workspaceRootUri, userHome) {
  const format = getHookSourceFormat(fileUri);
  let hooks;
  switch (format) {
    case HookSourceFormat.Claude:
      hooks = parseClaudeHooks(json, workspaceRootUri, userHome);
      break;
    case HookSourceFormat.Copilot:
    default:
      hooks = parseCopilotHooks(json, workspaceRootUri, userHome);
      break;
  }
  return { format, hooks };
}
__name(parseHooksFromFile, "parseHooksFromFile");
function getHookSourceFormatLabel(format) {
  switch (format) {
    case HookSourceFormat.Claude:
      return "Claude";
    case HookSourceFormat.Copilot:
      return "GitHub Copilot";
  }
}
__name(getHookSourceFormatLabel, "getHookSourceFormatLabel");
export {
  HookSourceFormat,
  getHookSourceFormat,
  getHookSourceFormatLabel,
  isReadOnlyHookSource,
  parseCopilotHooks,
  parseHooksFromFile
};
//# sourceMappingURL=hookCompatibility.js.map
