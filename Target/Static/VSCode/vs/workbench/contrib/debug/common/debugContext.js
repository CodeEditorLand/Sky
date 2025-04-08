var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_DEBUG_TYPE } from "./debug.js";
import { Variable } from "./debugModel.js";
function getContextForVariable(parentContext, variable, additionalContext = []) {
  const session = variable.getSession();
  const contextKeys = [
    [CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT.key, variable.variableMenuContext || ""],
    [CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.key, !!variable.evaluateName],
    [CONTEXT_CAN_VIEW_MEMORY.key, !!session?.capabilities.supportsReadMemoryRequest && variable.memoryReference !== void 0],
    [CONTEXT_VARIABLE_IS_READONLY.key, !!variable.presentationHint?.attributes?.includes("readOnly") || variable.presentationHint?.lazy],
    [CONTEXT_DEBUG_TYPE.key, session?.configuration.type],
    ...additionalContext
  ];
  return parentContext.createOverlay(contextKeys);
}
__name(getContextForVariable, "getContextForVariable");
export {
  getContextForVariable
};
//# sourceMappingURL=debugContext.js.map
