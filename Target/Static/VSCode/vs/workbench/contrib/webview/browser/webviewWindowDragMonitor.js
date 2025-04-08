var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../base/browser/dom.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWebview } from "./webview.js";
class WebviewWindowDragMonitor extends Disposable {
  static {
    __name(this, "WebviewWindowDragMonitor");
  }
  constructor(targetWindow, getWebview) {
    super();
    const onDragStart = /* @__PURE__ */ __name(() => {
      getWebview()?.windowDidDragStart();
    }, "onDragStart");
    const onDragEnd = /* @__PURE__ */ __name(() => {
      getWebview()?.windowDidDragEnd();
    }, "onDragEnd");
    this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG_START, () => {
      onDragStart();
    }));
    this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG_END, onDragEnd));
    this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.MOUSE_MOVE, (currentEvent) => {
      if (currentEvent.buttons === 0) {
        onDragEnd();
      }
    }));
    this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG, (event) => {
      if (event.shiftKey) {
        onDragEnd();
      } else {
        onDragStart();
      }
    }));
    this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG_OVER, (event) => {
      if (event.shiftKey) {
        onDragEnd();
      } else {
        onDragStart();
      }
    }));
  }
}
export {
  WebviewWindowDragMonitor
};
//# sourceMappingURL=webviewWindowDragMonitor.js.map
