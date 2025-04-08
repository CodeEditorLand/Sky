var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class NotebookLogger {
  static {
    __name(this, "NotebookLogger");
  }
  constructor() {
    this._domFrameLog();
  }
  _frameId = 0;
  _domFrameLog() {
  }
  debug(...args) {
    const date = /* @__PURE__ */ new Date();
    console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, "0")}`, `frame #${this._frameId}: `, ...args);
  }
}
const instance = new NotebookLogger();
function notebookDebug(...args) {
  instance.debug(...args);
}
__name(notebookDebug, "notebookDebug");
export {
  notebookDebug
};
//# sourceMappingURL=notebookLogger.js.map
