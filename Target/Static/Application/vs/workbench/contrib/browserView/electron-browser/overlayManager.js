var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { getDomNodePagePosition } from "../../../../base/browser/dom.js";
const OVERLAY_CLASSES = [
  "monaco-menu-container",
  "quick-input-widget",
  "monaco-hover",
  "monaco-dialog-modal-block",
  "notifications-center",
  "notification-toast-container",
  "context-view"
];
const IBrowserOverlayManager = createDecorator("browserOverlayManager");
class BrowserOverlayManager extends Disposable {
  static {
    __name(this, "BrowserOverlayManager");
  }
  constructor(targetWindow) {
    super();
    this.targetWindow = targetWindow;
    this._onDidChangeOverlayState = this._register(new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => {
        this._observerIsConnected = true;
        this._structuralObserver.observe(this.targetWindow.document.body, {
          childList: true,
          subtree: true
        });
        this.updateTrackedElements();
      }, "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        this._observerIsConnected = false;
        this._structuralObserver.disconnect();
        this.stopTrackingElements();
      }, "onDidRemoveLastListener")
    }));
    this.onDidChangeOverlayState = this._onDidChangeOverlayState.event;
    this._overlayCollections = /* @__PURE__ */ new Map();
    this._overlayRectangles = /* @__PURE__ */ new WeakMap();
    this._elementObservers = /* @__PURE__ */ new WeakMap();
    this._observerIsConnected = false;
    for (const className of OVERLAY_CLASSES) {
      this._overlayCollections.set(className, this.targetWindow.document.getElementsByClassName(className));
    }
    this._structuralObserver = new MutationObserver((mutations) => {
      let didRemove = false;
      for (const mutation of mutations) {
        for (const node of mutation.removedNodes) {
          if (this._elementObservers.has(node)) {
            const observer = this._elementObservers.get(node);
            observer?.disconnect();
            this._elementObservers.delete(node);
            didRemove = true;
          }
          if (this._overlayRectangles.delete(node)) {
            didRemove = true;
          }
        }
      }
      this.updateTrackedElements(didRemove);
    });
  }
  *overlays() {
    for (const collection of this._overlayCollections.values()) {
      for (const element of collection) {
        yield element;
      }
    }
  }
  updateTrackedElements(shouldEmit = false) {
    for (const overlay of this.overlays()) {
      if (!this._elementObservers.has(overlay)) {
        const observer = new MutationObserver(() => {
          this._overlayRectangles.delete(overlay);
          this._onDidChangeOverlayState.fire();
        });
        this._elementObservers.set(overlay, observer);
        observer.observe(overlay, {
          attributes: true,
          attributeFilter: ["style", "class"],
          childList: true,
          subtree: true
        });
        shouldEmit = true;
      }
    }
    if (shouldEmit) {
      this._onDidChangeOverlayState.fire();
    }
  }
  getRect(element) {
    if (!this._overlayRectangles.has(element)) {
      const rect = getDomNodePagePosition(element);
      if (!this._observerIsConnected) {
        return rect;
      }
      this._overlayRectangles.set(element, rect);
    }
    return this._overlayRectangles.get(element);
  }
  isOverlappingWithOverlays(element) {
    const elementRect = getDomNodePagePosition(element);
    for (const overlay of this.overlays()) {
      const overlayRect = this.getRect(overlay);
      if (overlayRect && this.isRectanglesOverlapping(elementRect, overlayRect)) {
        return true;
      }
    }
    return false;
  }
  isRectanglesOverlapping(rect1, rect2) {
    if (rect1.width === 0 || rect1.height === 0 || rect2.width === 0 || rect2.height === 0) {
      return false;
    }
    return !(rect1.left + rect1.width <= rect2.left || rect2.left + rect2.width <= rect1.left || rect1.top + rect1.height <= rect2.top || rect2.top + rect2.height <= rect1.top);
  }
  stopTrackingElements() {
    for (const overlay of this.overlays()) {
      const observer = this._elementObservers.get(overlay);
      observer?.disconnect();
    }
    this._overlayRectangles = /* @__PURE__ */ new WeakMap();
    this._elementObservers = /* @__PURE__ */ new WeakMap();
  }
  dispose() {
    this._observerIsConnected = false;
    this._structuralObserver.disconnect();
    this.stopTrackingElements();
    super.dispose();
  }
}
export {
  BrowserOverlayManager,
  IBrowserOverlayManager
};
//# sourceMappingURL=overlayManager.js.map
