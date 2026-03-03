var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { COPILOT_CLI_HOOK_TYPE_MAP } from "./hookSchema.js";
let _hookTypeToCopilotCliName;
function getHookTypeToCopilotCliNameMap() {
  if (!_hookTypeToCopilotCliName) {
    _hookTypeToCopilotCliName = /* @__PURE__ */ new Map();
    for (const [copilotCliName, hookType] of Object.entries(COPILOT_CLI_HOOK_TYPE_MAP)) {
      _hookTypeToCopilotCliName.set(hookType, copilotCliName);
    }
  }
  return _hookTypeToCopilotCliName;
}
__name(getHookTypeToCopilotCliNameMap, "getHookTypeToCopilotCliNameMap");
function resolveCopilotCliHookType(name) {
  return COPILOT_CLI_HOOK_TYPE_MAP[name];
}
__name(resolveCopilotCliHookType, "resolveCopilotCliHookType");
function getCopilotCliHookTypeName(hookType) {
  return getHookTypeToCopilotCliNameMap().get(hookType);
}
__name(getCopilotCliHookTypeName, "getCopilotCliHookTypeName");
export {
  getCopilotCliHookTypeName,
  resolveCopilotCliHookType
};
//# sourceMappingURL=hookCopilotCliCompat.js.map
