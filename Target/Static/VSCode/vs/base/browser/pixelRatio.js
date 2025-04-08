var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getWindowId, onDidUnregisterWindow } from "./dom.js";
import { Emitter, Event } from "../common/event.js";
import { Disposable, markAsSingleton } from "../common/lifecycle.js";
class DevicePixelRatioMonitor extends Disposable {
  static {
    __name(this, "DevicePixelRatioMonitor");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _listener;
  _mediaQueryList;
  constructor(targetWindow) {
    super();
    this._listener = () => this._handleChange(targetWindow, true);
    this._mediaQueryList = null;
    this._handleChange(targetWindow, false);
  }
  _handleChange(targetWindow, fireEvent) {
    this._mediaQueryList?.removeEventListener("change", this._listener);
    this._mediaQueryList = targetWindow.matchMedia(`(resolution: ${targetWindow.devicePixelRatio}dppx)`);
    this._mediaQueryList.addEventListener("change", this._listener);
    if (fireEvent) {
      this._onDidChange.fire();
    }
  }
}
class PixelRatioMonitorImpl extends Disposable {
  static {
    __name(this, "PixelRatioMonitorImpl");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _value;
  get value() {
    return this._value;
  }
  constructor(targetWindow) {
    super();
    this._value = this._getPixelRatio(targetWindow);
    const dprMonitor = this._register(new DevicePixelRatioMonitor(targetWindow));
    this._register(dprMonitor.onDidChange(() => {
      this._value = this._getPixelRatio(targetWindow);
      this._onDidChange.fire(this._value);
    }));
  }
  _getPixelRatio(targetWindow) {
    const ctx = document.createElement("canvas").getContext("2d");
    const dpr = targetWindow.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
  }
}
class PixelRatioMonitorFacade {
  static {
    __name(this, "PixelRatioMonitorFacade");
  }
  mapWindowIdToPixelRatioMonitor = /* @__PURE__ */ new Map();
  _getOrCreatePixelRatioMonitor(targetWindow) {
    const targetWindowId = getWindowId(targetWindow);
    let pixelRatioMonitor = this.mapWindowIdToPixelRatioMonitor.get(targetWindowId);
    if (!pixelRatioMonitor) {
      pixelRatioMonitor = markAsSingleton(new PixelRatioMonitorImpl(targetWindow));
      this.mapWindowIdToPixelRatioMonitor.set(targetWindowId, pixelRatioMonitor);
      markAsSingleton(Event.once(onDidUnregisterWindow)(({ vscodeWindowId }) => {
        if (vscodeWindowId === targetWindowId) {
          pixelRatioMonitor?.dispose();
          this.mapWindowIdToPixelRatioMonitor.delete(targetWindowId);
        }
      }));
    }
    return pixelRatioMonitor;
  }
  getInstance(targetWindow) {
    return this._getOrCreatePixelRatioMonitor(targetWindow);
  }
}
const PixelRatio = new PixelRatioMonitorFacade();
export {
  PixelRatio
};
//# sourceMappingURL=pixelRatio.js.map
