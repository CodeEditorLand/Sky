var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename, dirname } from "../../../../../base/common/path.js";
import { toHookType } from "./hookSchema.js";
import { parseClaudeHooks, extractHookCommandsFromItem } from "./hookClaudeCompat.js";
import { resolveCopilotCliHookType } from "./hookCopilotCliCompat.js";
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
  const hooks = root.hooks;
  if (!hooks || typeof hooks !== "object") {
    return result;
  }
  const hooksObj = hooks;
  for (const originalId of Object.keys(hooksObj)) {
    const hookType = resolveCopilotCliHookType(originalId) ?? toHookType(originalId);
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
      result.set(hookType, { hooks: commands, originalId });
    }
  }
  return result;
}
__name(parseCopilotHooks, "parseCopilotHooks");
function parseHooksFromFile(fileUri, json, workspaceRootUri, userHome) {
  const format = getHookSourceFormat(fileUri);
  let hooks;
  let disabledAllHooks = false;
  switch (format) {
    case HookSourceFormat.Claude: {
      const result = parseClaudeHooks(json, workspaceRootUri, userHome);
      hooks = result.hooks;
      disabledAllHooks = result.disabledAllHooks;
      break;
    }
    case HookSourceFormat.Copilot:
    default:
      hooks = parseCopilotHooks(json, workspaceRootUri, userHome);
      break;
  }
  return { format, hooks, disabledAllHooks };
}
__name(parseHooksFromFile, "parseHooksFromFile");
function parseHooksIgnoringDisableAll(fileUri, json, workspaceRootUri, userHome) {
  const format = getHookSourceFormat(fileUri);
  let hooks;
  switch (format) {
    case HookSourceFormat.Claude: {
      if (json && typeof json === "object") {
        const { disableAllHooks: _, ...rest } = json;
        const result = parseClaudeHooks(rest, workspaceRootUri, userHome);
        hooks = result.hooks;
      } else {
        hooks = /* @__PURE__ */ new Map();
      }
      break;
    }
    case HookSourceFormat.Copilot:
    default:
      hooks = parseCopilotHooks(json, workspaceRootUri, userHome);
      break;
  }
  return { format, hooks, disabledAllHooks: true };
}
__name(parseHooksIgnoringDisableAll, "parseHooksIgnoringDisableAll");
function getHookSourceFormatLabel(format) {
  switch (format) {
    case HookSourceFormat.Claude:
      return "Claude";
    case HookSourceFormat.Copilot:
      return "GitHub Copilot";
  }
}
__name(getHookSourceFormatLabel, "getHookSourceFormatLabel");
function buildNewHookEntry(format) {
  const commandEntry = { type: "command", command: "" };
  if (format === HookSourceFormat.Claude) {
    return { matcher: "", hooks: [commandEntry] };
  }
  return commandEntry;
}
__name(buildNewHookEntry, "buildNewHookEntry");
export {
  HookSourceFormat,
  buildNewHookEntry,
  getHookSourceFormat,
  getHookSourceFormatLabel,
  isReadOnlyHookSource,
  parseCopilotHooks,
  parseHooksFromFile,
  parseHooksIgnoringDisableAll
};
//# sourceMappingURL=hookCompatibility.js.map
