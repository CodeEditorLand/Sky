var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { HOOKS_BY_TARGET } from "./hookTypes.js";
import { Target } from "./promptTypes.js";
const COPILOT_CLI_HOOK_TYPE_MAP = HOOKS_BY_TARGET[Target.GitHubCopilot];
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
