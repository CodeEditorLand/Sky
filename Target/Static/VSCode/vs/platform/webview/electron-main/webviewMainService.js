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
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { WebContents, webContents, WebFrameMain } from "electron";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { FindInFrameOptions, FoundInFrameResult, IWebviewManagerService, WebviewWebContentsId, WebviewWindowId } from "../common/webviewManagerService.js";
import { WebviewProtocolProvider } from "./webviewProtocolProvider.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
let WebviewMainService = class extends Disposable {
  constructor(windowsMainService) {
    super();
    this.windowsMainService = windowsMainService;
    this._register(new WebviewProtocolProvider());
  }
  static {
    __name(this, "WebviewMainService");
  }
  _onFoundInFrame = this._register(new Emitter());
  onFoundInFrame = this._onFoundInFrame.event;
  async setIgnoreMenuShortcuts(id, enabled) {
    let contents;
    if (typeof id.windowId === "number") {
      const { windowId } = id;
      const window = this.windowsMainService.getWindowById(windowId);
      if (!window?.win) {
        throw new Error(`Invalid windowId: ${windowId}`);
      }
      contents = window.win.webContents;
    } else {
      const { webContentsId } = id;
      contents = webContents.fromId(webContentsId);
      if (!contents) {
        throw new Error(`Invalid webContentsId: ${webContentsId}`);
      }
    }
    if (!contents.isDestroyed()) {
      contents.setIgnoreMenuShortcuts(enabled);
    }
  }
  async findInFrame(windowId, frameName, text, options) {
    const initialFrame = this.getFrameByName(windowId, frameName);
    const frame = initialFrame;
    if (typeof frame.findInFrame === "function") {
      frame.findInFrame(text, {
        findNext: options.findNext,
        forward: options.forward
      });
      const foundInFrameHandler = /* @__PURE__ */ __name((_, result) => {
        if (result.finalUpdate) {
          this._onFoundInFrame.fire(result);
          frame.removeListener("found-in-frame", foundInFrameHandler);
        }
      }, "foundInFrameHandler");
      frame.on("found-in-frame", foundInFrameHandler);
    }
  }
  async stopFindInFrame(windowId, frameName, options) {
    const initialFrame = this.getFrameByName(windowId, frameName);
    const frame = initialFrame;
    if (typeof frame.stopFindInFrame === "function") {
      frame.stopFindInFrame(options.keepSelection ? "keepSelection" : "clearSelection");
    }
  }
  getFrameByName(windowId, frameName) {
    const window = this.windowsMainService.getWindowById(windowId.windowId);
    if (!window?.win) {
      throw new Error(`Invalid windowId: ${windowId}`);
    }
    const frame = window.win.webContents.mainFrame.framesInSubtree.find((frame2) => {
      return frame2.name === frameName;
    });
    if (!frame) {
      throw new Error(`Unknown frame: ${frameName}`);
    }
    return frame;
  }
};
WebviewMainService = __decorateClass([
  __decorateParam(0, IWindowsMainService)
], WebviewMainService);
export {
  WebviewMainService
};
//# sourceMappingURL=webviewMainService.js.map
