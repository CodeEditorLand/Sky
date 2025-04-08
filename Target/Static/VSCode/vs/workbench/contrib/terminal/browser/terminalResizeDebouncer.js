var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { getWindow, runWhenWindowIdle } from "../../../../base/browser/dom.js";
import { debounce } from "../../../../base/common/decorators.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["StartDebouncingThreshold"] = 200] = "StartDebouncingThreshold";
  return Constants2;
})(Constants || {});
class TerminalResizeDebouncer extends Disposable {
  constructor(_isVisible, _getXterm, _resizeBothCallback, _resizeXCallback, _resizeYCallback) {
    super();
    this._isVisible = _isVisible;
    this._getXterm = _getXterm;
    this._resizeBothCallback = _resizeBothCallback;
    this._resizeXCallback = _resizeXCallback;
    this._resizeYCallback = _resizeYCallback;
  }
  static {
    __name(this, "TerminalResizeDebouncer");
  }
  _latestX = 0;
  _latestY = 0;
  _resizeXJob = this._register(new MutableDisposable());
  _resizeYJob = this._register(new MutableDisposable());
  async resize(cols, rows, immediate) {
    this._latestX = cols;
    this._latestY = rows;
    if (immediate || this._getXterm().raw.buffer.normal.length < 200 /* StartDebouncingThreshold */) {
      this._resizeXJob.clear();
      this._resizeYJob.clear();
      this._resizeBothCallback(cols, rows);
      return;
    }
    const win = getWindow(this._getXterm().raw.element);
    if (win && !this._isVisible()) {
      if (!this._resizeXJob.value) {
        this._resizeXJob.value = runWhenWindowIdle(win, async () => {
          this._resizeXCallback(this._latestX);
          this._resizeXJob.clear();
        });
      }
      if (!this._resizeYJob.value) {
        this._resizeYJob.value = runWhenWindowIdle(win, async () => {
          this._resizeYCallback(this._latestY);
          this._resizeYJob.clear();
        });
      }
      return;
    }
    this._resizeYCallback(rows);
    this._latestX = cols;
    this._debounceResizeX(cols);
  }
  flush() {
    if (this._resizeXJob.value || this._resizeYJob.value) {
      this._resizeXJob.clear();
      this._resizeYJob.clear();
      this._resizeBothCallback(this._latestX, this._latestY);
    }
  }
  _debounceResizeX(cols) {
    this._resizeXCallback(cols);
  }
}
__decorateClass([
  debounce(100)
], TerminalResizeDebouncer.prototype, "_debounceResizeX", 1);
export {
  TerminalResizeDebouncer
};
//# sourceMappingURL=terminalResizeDebouncer.js.map
