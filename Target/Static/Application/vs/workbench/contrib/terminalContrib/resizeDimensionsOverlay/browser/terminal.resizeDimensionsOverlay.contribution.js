var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { timeout } from "../../../../../base/common/async.js";
import { TerminalResizeDimensionsOverlay } from "./terminalResizeDimensionsOverlay.js";
class TerminalResizeDimensionsOverlayContribution extends Disposable {
  static {
    __name(this, "TerminalResizeDimensionsOverlayContribution");
  }
  static {
    this.ID = "terminal.resizeDimensionsOverlay";
  }
  constructor(_ctx) {
    super();
    this._ctx = _ctx;
    this._overlay = this._register(new MutableDisposable());
  }
  xtermOpen(xterm) {
    this._ctx.processManager.ptyProcessReady.then(() => {
      timeout(1e3).then(() => {
        if (!this._store.isDisposed) {
          this._overlay.value = new TerminalResizeDimensionsOverlay(this._ctx.instance.domElement, xterm);
        }
      });
    });
  }
}
registerTerminalContribution(TerminalResizeDimensionsOverlayContribution.ID, TerminalResizeDimensionsOverlayContribution);
//# sourceMappingURL=terminal.resizeDimensionsOverlay.contribution.js.map
