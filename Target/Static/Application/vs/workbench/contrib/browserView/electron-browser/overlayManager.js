var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { MicrotaskEmitter } from "../../../../base/common/event.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { getDomNodePagePosition } from "../../../../base/browser/dom.js";
var BrowserOverlayType;
(function(BrowserOverlayType2) {
  BrowserOverlayType2["Menu"] = "menu";
  BrowserOverlayType2["QuickInput"] = "quickInput";
  BrowserOverlayType2["Hover"] = "hover";
  BrowserOverlayType2["Dialog"] = "dialog";
  BrowserOverlayType2["Notification"] = "notification";
  BrowserOverlayType2["Unknown"] = "unknown";
})(BrowserOverlayType || (BrowserOverlayType = {}));
const OVERLAY_DEFINITIONS = [
  { className: "monaco-menu-container", type: BrowserOverlayType.Menu },
  { className: "quick-input-widget", type: BrowserOverlayType.QuickInput },
  { className: "monaco-hover", type: BrowserOverlayType.Hover },
  { className: "editor-widget", type: BrowserOverlayType.Hover },
  { className: "suggest-details-container", type: BrowserOverlayType.Hover },
  { className: "monaco-dialog-modal-block", type: BrowserOverlayType.Dialog },
  { className: "notifications-center", type: BrowserOverlayType.Notification },
  { className: "notification-toast-container", type: BrowserOverlayType.Notification },
  // Context view is very generic, so treat the content as unknown
  { className: "context-view", type: BrowserOverlayType.Unknown }
];
const IBrowserOverlayManager = createDecorator("browserOverlayManager");
class BrowserOverlayManager extends Disposable {
  static {
    __name(this, "BrowserOverlayManager");
  }
  constructor(targetWindow) {
    super();
    this.targetWindow = targetWindow;
    this._onDidChangeOverlayState = this._register(new MicrotaskEmitter({
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
      }, "onDidRemoveLastListener"),
      // Must be passed to prevent duplicate emits
      merge: /* @__PURE__ */ __name(() => {
      }, "merge")
    }));
    this.onDidChangeOverlayState = this._onDidChangeOverlayState.event;
    this._overlayCollections = /* @__PURE__ */ new Map();
    this._overlayRectangles = /* @__PURE__ */ new WeakMap();
    this._elementObservers = /* @__PURE__ */ new WeakMap();
    this._observerIsConnected = false;
    this._shadowRootObservers = /* @__PURE__ */ new WeakMap();
    this._shadowRootOverlayCache = /* @__PURE__ */ new WeakMap();
    for (const overlayDefinition of OVERLAY_DEFINITIONS) {
      this._overlayCollections.set(overlayDefinition.className, {
        type: overlayDefinition.type,
        // We need dynamic collections for overlay detection, using getElementsByClassName is intentional here
        // eslint-disable-next-line no-restricted-syntax
        collection: this.targetWindow.document.getElementsByClassName(overlayDefinition.className)
      });
    }
    this._shadowRootHostCollection = this.targetWindow.document.getElementsByClassName("shadow-root-host");
    this._structuralObserver = new targetWindow.MutationObserver((mutations) => {
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
          const hostElement = node;
          if (hostElement.shadowRoot) {
            const shadowRoot = hostElement.shadowRoot;
            const observer = this._shadowRootObservers.get(shadowRoot);
            if (observer) {
              observer.disconnect();
              this._shadowRootObservers.delete(shadowRoot);
              this._shadowRootOverlayCache.delete(shadowRoot);
              didRemove = true;
            }
          }
        }
      }
      this.updateTrackedElements(didRemove);
    });
  }
  *overlays() {
    for (const entry of this._overlayCollections.values()) {
      for (const element of entry.collection) {
        yield { element, type: entry.type };
      }
    }
    for (const hostElement of this._shadowRootHostCollection) {
      const shadowRoot = hostElement.shadowRoot;
      if (shadowRoot) {
        let cache = this._shadowRootOverlayCache.get(shadowRoot);
        if (!cache) {
          cache = [];
          for (const overlayDefinition of OVERLAY_DEFINITIONS) {
            const elements = shadowRoot.querySelectorAll(`.${overlayDefinition.className}`);
            for (const element of elements) {
              cache.push({ element, type: overlayDefinition.type });
            }
          }
          this._shadowRootOverlayCache.set(shadowRoot, cache);
        }
        yield* cache;
      }
    }
  }
  updateTrackedElements(shouldEmit = false) {
    for (const host of this._shadowRootHostCollection) {
      const hostElement = host;
      const shadowRoot = hostElement.shadowRoot;
      if (shadowRoot && !this._shadowRootObservers.has(shadowRoot)) {
        const observer = new this.targetWindow.MutationObserver(() => {
          this._shadowRootOverlayCache.delete(shadowRoot);
          this._onDidChangeOverlayState.fire();
        });
        observer.observe(shadowRoot, {
          childList: true,
          subtree: true
        });
        this._shadowRootObservers.set(shadowRoot, observer);
        shouldEmit = true;
      }
    }
    for (const overlay of this.overlays()) {
      if (!this._elementObservers.has(overlay.element)) {
        const observer = new this.targetWindow.MutationObserver(() => {
          this._overlayRectangles.delete(overlay.element);
          this._onDidChangeOverlayState.fire();
        });
        this._elementObservers.set(overlay.element, observer);
        observer.observe(overlay.element, {
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
  getOverlappingOverlays(element) {
    const elementRect = getDomNodePagePosition(element);
    const overlappingOverlays = [];
    for (const overlay of this.overlays()) {
      const overlayRect = this.getRect(overlay.element);
      if (overlayRect && this.isRectanglesOverlapping(elementRect, overlayRect)) {
        overlappingOverlays.push({
          type: overlay.type,
          rect: overlayRect
        });
      }
    }
    return overlappingOverlays;
  }
  isRectanglesOverlapping(rect1, rect2) {
    if (rect1.width === 0 || rect1.height === 0 || rect2.width === 0 || rect2.height === 0) {
      return false;
    }
    return !(rect1.left + rect1.width <= rect2.left || rect2.left + rect2.width <= rect1.left || rect1.top + rect1.height <= rect2.top || rect2.top + rect2.height <= rect1.top);
  }
  stopTrackingElements() {
    for (const overlay of this.overlays()) {
      const observer = this._elementObservers.get(overlay.element);
      observer?.disconnect();
    }
    for (const hostElement of this._shadowRootHostCollection) {
      const shadowRoot = hostElement.shadowRoot;
      const shadowObserver = this._shadowRootObservers.get(shadowRoot);
      shadowObserver?.disconnect();
    }
    this._shadowRootObservers = /* @__PURE__ */ new WeakMap();
    this._shadowRootOverlayCache = /* @__PURE__ */ new WeakMap();
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
  BrowserOverlayType,
  IBrowserOverlayManager
};
//# sourceMappingURL=overlayManager.js.map
