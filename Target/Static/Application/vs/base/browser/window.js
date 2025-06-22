var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function ensureCodeWindow(targetWindow, fallbackWindowId) {
  const codeWindow = targetWindow;
  if (typeof codeWindow.vscodeWindowId !== "number") {
    Object.defineProperty(codeWindow, "vscodeWindowId", {
      get: /* @__PURE__ */ __name(() => fallbackWindowId, "get")
    });
  }
}
__name(ensureCodeWindow, "ensureCodeWindow");
const mainWindow = window;
function isAuxiliaryWindow(obj) {
  if (obj === mainWindow) {
    return false;
  }
  const candidate = obj;
  return typeof candidate?.vscodeWindowId === "number";
}
__name(isAuxiliaryWindow, "isAuxiliaryWindow");
export {
  ensureCodeWindow,
  isAuxiliaryWindow,
  mainWindow
};
//# sourceMappingURL=window.js.map
