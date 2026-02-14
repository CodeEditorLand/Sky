var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function Fallback() {
  if (typeof window.legacyBridge !== "undefined") {
    window.vscode = window.legacyBridge;
    return;
  }
  if (typeof window.vscode === "undefined") {
    window.vscode = {
      process: { platform: "web" },
      ipcRenderer: {
        send: /* @__PURE__ */ __name(() => {
        }, "send"),
        invoke: /* @__PURE__ */ __name(async () => ({}), "invoke"),
        on: /* @__PURE__ */ __name(() => ({}), "on"),
        once: /* @__PURE__ */ __name(() => ({}), "once"),
        removeListener: /* @__PURE__ */ __name(() => ({}), "removeListener"),
        removeAllListeners: /* @__PURE__ */ __name(() => {
        }, "removeAllListeners")
      }
    };
  }
}
__name(Fallback, "Fallback");
export {
  Fallback
};
//# sourceMappingURL=Fallback.js.map
