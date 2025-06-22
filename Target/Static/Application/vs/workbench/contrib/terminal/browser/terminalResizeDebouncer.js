var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindow, runWhenWindowIdle } from "../../../../base/browser/dom.js";
import { debounce } from "../../../../base/common/decorators.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Constants;
(function(Constants2) {
  Constants2[Constants2["StartDebouncingThreshold"] = 200] = "StartDebouncingThreshold";
})(Constants || (Constants = {}));
class TerminalResizeDebouncer extends Disposable {
  static {
    __name(this, "TerminalResizeDebouncer");
  }
  constructor(_isVisible, _getXterm, _resizeBothCallback, _resizeXCallback, _resizeYCallback) {
    super();
    this._isVisible = _isVisible;
    this._getXterm = _getXterm;
    this._resizeBothCallback = _resizeBothCallback;
    this._resizeXCallback = _resizeXCallback;
    this._resizeYCallback = _resizeYCallback;
    this._latestX = 0;
    this._latestY = 0;
    this._resizeXJob = this._register(new MutableDisposable());
    this._resizeYJob = this._register(new MutableDisposable());
  }
  async resize(cols, rows, immediate) {
    this._latestX = cols;
    this._latestY = rows;
    if (immediate || this._getXterm().raw.buffer.normal.length < 200) {
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
__decorate([
  debounce(100)
], TerminalResizeDebouncer.prototype, "_debounceResizeX", null);
export {
  TerminalResizeDebouncer
};
//# sourceMappingURL=terminalResizeDebouncer.js.map
