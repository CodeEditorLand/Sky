var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
import { IDimension } from "../../common/core/dimension.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { getWindow, scheduleAtNextAnimationFrame } from "../../../base/browser/dom.js";
class ElementSizeObserver extends Disposable {
  static {
    __name(this, "ElementSizeObserver");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _referenceDomElement;
  _width;
  _height;
  _resizeObserver;
  constructor(referenceDomElement, dimension) {
    super();
    this._referenceDomElement = referenceDomElement;
    this._width = -1;
    this._height = -1;
    this._resizeObserver = null;
    this.measureReferenceDomElement(false, dimension);
  }
  dispose() {
    this.stopObserving();
    super.dispose();
  }
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }
  startObserving() {
    if (!this._resizeObserver && this._referenceDomElement) {
      let observedDimenstion = null;
      const observeNow = /* @__PURE__ */ __name(() => {
        if (observedDimenstion) {
          this.observe({ width: observedDimenstion.width, height: observedDimenstion.height });
        } else {
          this.observe();
        }
      }, "observeNow");
      let shouldObserve = false;
      let alreadyObservedThisAnimationFrame = false;
      const update = /* @__PURE__ */ __name(() => {
        if (shouldObserve && !alreadyObservedThisAnimationFrame) {
          try {
            shouldObserve = false;
            alreadyObservedThisAnimationFrame = true;
            observeNow();
          } finally {
            scheduleAtNextAnimationFrame(getWindow(this._referenceDomElement), () => {
              alreadyObservedThisAnimationFrame = false;
              update();
            });
          }
        }
      }, "update");
      this._resizeObserver = new ResizeObserver((entries) => {
        if (entries && entries[0] && entries[0].contentRect) {
          observedDimenstion = { width: entries[0].contentRect.width, height: entries[0].contentRect.height };
        } else {
          observedDimenstion = null;
        }
        shouldObserve = true;
        update();
      });
      this._resizeObserver.observe(this._referenceDomElement);
    }
  }
  stopObserving() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
  observe(dimension) {
    this.measureReferenceDomElement(true, dimension);
  }
  measureReferenceDomElement(emitEvent, dimension) {
    let observedWidth = 0;
    let observedHeight = 0;
    if (dimension) {
      observedWidth = dimension.width;
      observedHeight = dimension.height;
    } else if (this._referenceDomElement) {
      observedWidth = this._referenceDomElement.clientWidth;
      observedHeight = this._referenceDomElement.clientHeight;
    }
    observedWidth = Math.max(5, observedWidth);
    observedHeight = Math.max(5, observedHeight);
    if (this._width !== observedWidth || this._height !== observedHeight) {
      this._width = observedWidth;
      this._height = observedHeight;
      if (emitEvent) {
        this._onDidChange.fire();
      }
    }
  }
}
export {
  ElementSizeObserver
};
//# sourceMappingURL=elementSizeObserver.js.map
