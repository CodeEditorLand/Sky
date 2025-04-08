var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IProcessDataEvent } from "./terminal.js";
class TerminalDataBufferer {
  constructor(_callback) {
    this._callback = _callback;
  }
  static {
    __name(this, "TerminalDataBufferer");
  }
  _terminalBufferMap = /* @__PURE__ */ new Map();
  dispose() {
    for (const buffer of this._terminalBufferMap.values()) {
      buffer.dispose();
    }
  }
  startBuffering(id, event, throttleBy = 5) {
    const disposable = event((e) => {
      const data = typeof e === "string" ? e : e.data;
      let buffer = this._terminalBufferMap.get(id);
      if (buffer) {
        buffer.data.push(data);
        return;
      }
      const timeoutId = setTimeout(() => this.flushBuffer(id), throttleBy);
      buffer = {
        data: [data],
        timeoutId,
        dispose: /* @__PURE__ */ __name(() => {
          clearTimeout(timeoutId);
          this.flushBuffer(id);
          disposable.dispose();
        }, "dispose")
      };
      this._terminalBufferMap.set(id, buffer);
    });
    return disposable;
  }
  stopBuffering(id) {
    const buffer = this._terminalBufferMap.get(id);
    buffer?.dispose();
  }
  flushBuffer(id) {
    const buffer = this._terminalBufferMap.get(id);
    if (buffer) {
      this._terminalBufferMap.delete(id);
      this._callback(id, buffer.data.join(""));
    }
  }
}
export {
  TerminalDataBufferer
};
//# sourceMappingURL=terminalDataBuffering.js.map
