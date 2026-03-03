var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
let _getInlineCompletionsController;
function getInlineCompletionsController(editor) {
  return _getInlineCompletionsController?.(editor) ?? null;
}
__name(getInlineCompletionsController, "getInlineCompletionsController");
function setInlineCompletionsControllerGetter(getter) {
  _getInlineCompletionsController = getter;
}
__name(setInlineCompletionsControllerGetter, "setInlineCompletionsControllerGetter");
export {
  getInlineCompletionsController,
  setInlineCompletionsControllerGetter
};
//# sourceMappingURL=common.js.map
