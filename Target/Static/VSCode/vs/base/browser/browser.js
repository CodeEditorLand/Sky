var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CodeWindow, mainWindow } from "./window.js";
import { Emitter } from "../common/event.js";
class WindowManager {
  static {
    __name(this, "WindowManager");
  }
  static INSTANCE = new WindowManager();
  // --- Zoom Level
  mapWindowIdToZoomLevel = /* @__PURE__ */ new Map();
  _onDidChangeZoomLevel = new Emitter();
  onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
  getZoomLevel(targetWindow) {
    return this.mapWindowIdToZoomLevel.get(this.getWindowId(targetWindow)) ?? 0;
  }
  setZoomLevel(zoomLevel, targetWindow) {
    if (this.getZoomLevel(targetWindow) === zoomLevel) {
      return;
    }
    const targetWindowId = this.getWindowId(targetWindow);
    this.mapWindowIdToZoomLevel.set(targetWindowId, zoomLevel);
    this._onDidChangeZoomLevel.fire(targetWindowId);
  }
  // --- Zoom Factor
  mapWindowIdToZoomFactor = /* @__PURE__ */ new Map();
  getZoomFactor(targetWindow) {
    return this.mapWindowIdToZoomFactor.get(this.getWindowId(targetWindow)) ?? 1;
  }
  setZoomFactor(zoomFactor, targetWindow) {
    this.mapWindowIdToZoomFactor.set(this.getWindowId(targetWindow), zoomFactor);
  }
  // --- Fullscreen
  _onDidChangeFullscreen = new Emitter();
  onDidChangeFullscreen = this._onDidChangeFullscreen.event;
  mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
  setFullscreen(fullscreen, targetWindow) {
    if (this.isFullscreen(targetWindow) === fullscreen) {
      return;
    }
    const windowId = this.getWindowId(targetWindow);
    this.mapWindowIdToFullScreen.set(windowId, fullscreen);
    this._onDidChangeFullscreen.fire(windowId);
  }
  isFullscreen(targetWindow) {
    return !!this.mapWindowIdToFullScreen.get(this.getWindowId(targetWindow));
  }
  getWindowId(targetWindow) {
    return targetWindow.vscodeWindowId;
  }
}
function addMatchMediaChangeListener(targetWindow, query, callback) {
  if (typeof query === "string") {
    query = targetWindow.matchMedia(query);
  }
  query.addEventListener("change", callback);
}
__name(addMatchMediaChangeListener, "addMatchMediaChangeListener");
function setZoomLevel(zoomLevel, targetWindow) {
  WindowManager.INSTANCE.setZoomLevel(zoomLevel, targetWindow);
}
__name(setZoomLevel, "setZoomLevel");
function getZoomLevel(targetWindow) {
  return WindowManager.INSTANCE.getZoomLevel(targetWindow);
}
__name(getZoomLevel, "getZoomLevel");
const onDidChangeZoomLevel = WindowManager.INSTANCE.onDidChangeZoomLevel;
function getZoomFactor(targetWindow) {
  return WindowManager.INSTANCE.getZoomFactor(targetWindow);
}
__name(getZoomFactor, "getZoomFactor");
function setZoomFactor(zoomFactor, targetWindow) {
  WindowManager.INSTANCE.setZoomFactor(zoomFactor, targetWindow);
}
__name(setZoomFactor, "setZoomFactor");
function setFullscreen(fullscreen, targetWindow) {
  WindowManager.INSTANCE.setFullscreen(fullscreen, targetWindow);
}
__name(setFullscreen, "setFullscreen");
function isFullscreen(targetWindow) {
  return WindowManager.INSTANCE.isFullscreen(targetWindow);
}
__name(isFullscreen, "isFullscreen");
const onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
const userAgent = navigator.userAgent;
const isFirefox = userAgent.indexOf("Firefox") >= 0;
const isWebKit = userAgent.indexOf("AppleWebKit") >= 0;
const isChrome = userAgent.indexOf("Chrome") >= 0;
const isSafari = !isChrome && userAgent.indexOf("Safari") >= 0;
const isWebkitWebView = !isChrome && !isSafari && isWebKit;
const isElectron = userAgent.indexOf("Electron/") >= 0;
const isAndroid = userAgent.indexOf("Android") >= 0;
let standalone = false;
if (typeof mainWindow.matchMedia === "function") {
  const standaloneMatchMedia = mainWindow.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)");
  const fullScreenMatchMedia = mainWindow.matchMedia("(display-mode: fullscreen)");
  standalone = standaloneMatchMedia.matches;
  addMatchMediaChangeListener(mainWindow, standaloneMatchMedia, ({ matches }) => {
    if (standalone && fullScreenMatchMedia.matches) {
      return;
    }
    standalone = matches;
  });
}
function isStandalone() {
  return standalone;
}
__name(isStandalone, "isStandalone");
function isWCOEnabled() {
  return navigator?.windowControlsOverlay?.visible;
}
__name(isWCOEnabled, "isWCOEnabled");
function getWCOTitlebarAreaRect(targetWindow) {
  return targetWindow.navigator?.windowControlsOverlay?.getTitlebarAreaRect();
}
__name(getWCOTitlebarAreaRect, "getWCOTitlebarAreaRect");
export {
  addMatchMediaChangeListener,
  getWCOTitlebarAreaRect,
  getZoomFactor,
  getZoomLevel,
  isAndroid,
  isChrome,
  isElectron,
  isFirefox,
  isFullscreen,
  isSafari,
  isStandalone,
  isWCOEnabled,
  isWebKit,
  isWebkitWebView,
  onDidChangeFullscreen,
  onDidChangeZoomLevel,
  setFullscreen,
  setZoomFactor,
  setZoomLevel
};
//# sourceMappingURL=browser.js.map
