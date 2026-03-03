var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { webContents } from "electron";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { WebviewProtocolProvider } from "./webviewProtocolProvider.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { IFileService } from "../../files/common/files.js";
let WebviewMainService = class WebviewMainService2 extends Disposable {
  static {
    __name(this, "WebviewMainService");
  }
  constructor(fileService, windowsMainService) {
    super();
    this.windowsMainService = windowsMainService;
    this._onFoundInFrame = this._register(new Emitter());
    this.onFoundInFrame = this._onFoundInFrame.event;
    this._register(new WebviewProtocolProvider(fileService));
  }
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
WebviewMainService = __decorate([
  __param(0, IFileService),
  __param(1, IWindowsMainService)
], WebviewMainService);
export {
  WebviewMainService
};
//# sourceMappingURL=webviewMainService.js.map
