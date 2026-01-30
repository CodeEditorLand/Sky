var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/terminalResizeDimensionsOverlay.css";
import { $ } from "../../../../../base/browser/dom.js";
import { disposableTimeout } from "../../../../../base/common/async.js";
import { Disposable, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
var Constants;
(function(Constants2) {
  Constants2[Constants2["ResizeOverlayHideDelay"] = 500] = "ResizeOverlayHideDelay";
  Constants2["VisibleClass"] = "visible";
})(Constants || (Constants = {}));
class TerminalResizeDimensionsOverlay extends Disposable {
  static {
    __name(this, "TerminalResizeDimensionsOverlay");
  }
  constructor(_container, xterm) {
    super();
    this._container = _container;
    this._resizeOverlayHideTimeout = this._register(new MutableDisposable());
    this._register(xterm.raw.onResize((dims) => this._handleDimensionsChanged(dims)));
    this._register(toDisposable(() => {
      this._resizeOverlay?.remove();
      this._resizeOverlay = void 0;
    }));
  }
  _handleDimensionsChanged(dims) {
    const container = this._container;
    if (!container || !container.isConnected) {
      return;
    }
    const overlay = this._ensureResizeOverlay(container);
    overlay.textContent = `${dims.cols} x ${dims.rows}`;
    overlay.classList.add(
      "visible"
      /* Constants.VisibleClass */
    );
    this._resizeOverlayHideTimeout.value = disposableTimeout(
      () => {
        this._resizeOverlay?.classList.remove(
          "visible"
          /* Constants.VisibleClass */
        );
      },
      500
      /* Constants.ResizeOverlayHideDelay */
    );
  }
  _ensureResizeOverlay(container) {
    if (!this._resizeOverlay) {
      this._resizeOverlay = $(".terminal-resize-overlay");
      this._resizeOverlay.setAttribute("role", "status");
      this._resizeOverlay.setAttribute("aria-live", "polite");
      container.appendChild(this._resizeOverlay);
    } else if (!container.contains(this._resizeOverlay)) {
      container.appendChild(this._resizeOverlay);
    }
    return this._resizeOverlay;
  }
}
export {
  TerminalResizeDimensionsOverlay
};
//# sourceMappingURL=terminalResizeDimensionsOverlay.js.map
