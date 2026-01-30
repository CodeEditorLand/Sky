var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TerminalWidgetManager {
  static {
    __name(this, "TerminalWidgetManager");
  }
  constructor() {
    this._attached = /* @__PURE__ */ new Map();
  }
  attachToElement(terminalWrapper) {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.classList.add("terminal-widget-container");
      terminalWrapper.appendChild(this._container);
    }
  }
  dispose() {
    if (this._container) {
      this._container.remove();
      this._container = void 0;
    }
    this._attached.forEach((w) => w.dispose());
    this._attached.clear();
  }
  attachWidget(widget) {
    if (!this._container) {
      return;
    }
    this._attached.get(widget.id)?.dispose();
    widget.attach(this._container);
    this._attached.set(widget.id, widget);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const current = this._attached.get(widget.id);
        if (current === widget) {
          this._attached.delete(widget.id);
          widget.dispose();
        }
      }, "dispose")
    };
  }
}
export {
  TerminalWidgetManager
};
//# sourceMappingURL=widgetManager.js.map
