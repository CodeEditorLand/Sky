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
import { isSafari, isWebkitWebView } from "../../../base/browser/browser.js";
import { $, addDisposableListener, getActiveDocument, getActiveWindow, isHTMLElement, onDidRegisterWindow } from "../../../base/browser/dom.js";
import { mainWindow } from "../../../base/browser/window.js";
import { DeferredPromise } from "../../../base/common/async.js";
import { Event } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IClipboardService } from "../common/clipboardService.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import { ILogService } from "../../log/common/log.js";
const vscodeResourcesMime = "application/vnd.code.resources";
let BrowserClipboardService = class extends Disposable {
  constructor(layoutService, logService) {
    super();
    this.layoutService = layoutService;
    this.logService = logService;
    if (isSafari || isWebkitWebView) {
      this.installWebKitWriteTextWorkaround();
    }
    this._register(Event.runAndSubscribe(onDidRegisterWindow, ({ window, disposables }) => {
      disposables.add(addDisposableListener(window.document, "copy", () => this.clearResourcesState()));
    }, { window: mainWindow, disposables: this._store }));
  }
  static {
    __name(this, "BrowserClipboardService");
  }
  triggerPaste() {
    return void 0;
  }
  async readImage() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const clipboardItem = clipboardItems[0];
      const supportedImageTypes = ["image/png", "image/jpeg", "image/gif", "image/tiff", "image/bmp"];
      const mimeType = supportedImageTypes.find((type) => clipboardItem.types.includes(type));
      if (mimeType) {
        const blob = await clipboardItem.getType(mimeType);
        const buffer = await blob.arrayBuffer();
        return new Uint8Array(buffer);
      } else {
        console.error("No supported image type found in the clipboard");
      }
    } catch (error) {
      console.error("Error reading image from clipboard:", error);
    }
    return new Uint8Array(0);
  }
  webKitPendingClipboardWritePromise;
  // In Safari, it has the following note:
  //
  // "The request to write to the clipboard must be triggered during a user gesture.
  // A call to clipboard.write or clipboard.writeText outside the scope of a user
  // gesture(such as "click" or "touch" event handlers) will result in the immediate
  // rejection of the promise returned by the API call."
  // From: https://webkit.org/blog/10855/async-clipboard-api/
  //
  // Since extensions run in a web worker, and handle gestures in an asynchronous way,
  // they are not classified by Safari as "in response to a user gesture" and will reject.
  //
  // This function sets up some handlers to work around that behavior.
  installWebKitWriteTextWorkaround() {
    const handler = /* @__PURE__ */ __name(() => {
      const currentWritePromise = new DeferredPromise();
      if (this.webKitPendingClipboardWritePromise && !this.webKitPendingClipboardWritePromise.isSettled) {
        this.webKitPendingClipboardWritePromise.cancel();
      }
      this.webKitPendingClipboardWritePromise = currentWritePromise;
      getActiveWindow().navigator.clipboard.write([new ClipboardItem({
        "text/plain": currentWritePromise.p
      })]).catch(async (err) => {
        if (!(err instanceof Error) || err.name !== "NotAllowedError" || !currentWritePromise.isRejected) {
          this.logService.error(err);
        }
      });
    }, "handler");
    this._register(Event.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container, disposables }) => {
      disposables.add(addDisposableListener(container, "click", handler));
      disposables.add(addDisposableListener(container, "keydown", handler));
    }, { container: this.layoutService.mainContainer, disposables: this._store }));
  }
  mapTextToType = /* @__PURE__ */ new Map();
  // unsupported in web (only in-memory)
  async writeText(text, type) {
    this.clearResourcesState();
    if (type) {
      this.mapTextToType.set(type, text);
      return;
    }
    if (this.webKitPendingClipboardWritePromise) {
      return this.webKitPendingClipboardWritePromise.complete(text);
    }
    try {
      return await getActiveWindow().navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
    }
    this.fallbackWriteText(text);
  }
  fallbackWriteText(text) {
    const activeDocument = getActiveDocument();
    const activeElement = activeDocument.activeElement;
    const textArea = activeDocument.body.appendChild($("textarea", { "aria-hidden": true }));
    textArea.style.height = "1px";
    textArea.style.width = "1px";
    textArea.style.position = "absolute";
    textArea.value = text;
    textArea.focus();
    textArea.select();
    activeDocument.execCommand("copy");
    if (isHTMLElement(activeElement)) {
      activeElement.focus();
    }
    textArea.remove();
  }
  async readText(type) {
    if (type) {
      return this.mapTextToType.get(type) || "";
    }
    try {
      return await getActiveWindow().navigator.clipboard.readText();
    } catch (error) {
      console.error(error);
    }
    return "";
  }
  findText = "";
  // unsupported in web (only in-memory)
  async readFindText() {
    return this.findText;
  }
  async writeFindText(text) {
    this.findText = text;
  }
  resources = [];
  // unsupported in web (only in-memory)
  resourcesStateHash = void 0;
  static MAX_RESOURCE_STATE_SOURCE_LENGTH = 1e3;
  async writeResources(resources) {
    try {
      await getActiveWindow().navigator.clipboard.write([
        new ClipboardItem({
          [`web ${vscodeResourcesMime}`]: new Blob([
            JSON.stringify(resources.map((x) => x.toJSON()))
          ], {
            type: vscodeResourcesMime
          })
        })
      ]);
    } catch (error) {
    }
    if (resources.length === 0) {
      this.clearResourcesState();
    } else {
      this.resources = resources;
      this.resourcesStateHash = await this.computeResourcesStateHash();
    }
  }
  async readResources() {
    try {
      const items = await getActiveWindow().navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes(`web ${vscodeResourcesMime}`)) {
          const blob = await item.getType(`web ${vscodeResourcesMime}`);
          const resources = JSON.parse(await blob.text()).map((x) => URI.from(x));
          return resources;
        }
      }
    } catch (error) {
    }
    const resourcesStateHash = await this.computeResourcesStateHash();
    if (this.resourcesStateHash !== resourcesStateHash) {
      this.clearResourcesState();
    }
    return this.resources;
  }
  async computeResourcesStateHash() {
    if (this.resources.length === 0) {
      return void 0;
    }
    const clipboardText = await this.readText();
    return hash(clipboardText.substring(0, BrowserClipboardService.MAX_RESOURCE_STATE_SOURCE_LENGTH));
  }
  async hasResources() {
    try {
      const items = await getActiveWindow().navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes(`web ${vscodeResourcesMime}`)) {
          return true;
        }
      }
    } catch (error) {
    }
    return this.resources.length > 0;
  }
  clearInternalState() {
    this.clearResourcesState();
  }
  clearResourcesState() {
    this.resources = [];
    this.resourcesStateHash = void 0;
  }
};
BrowserClipboardService = __decorateClass([
  __decorateParam(0, ILayoutService),
  __decorateParam(1, ILogService)
], BrowserClipboardService);
export {
  BrowserClipboardService
};
//# sourceMappingURL=clipboardService.js.map
