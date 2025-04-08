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
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { URI } from "../../../../base/common/uri.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
let NativeClipboardService = class {
  constructor(nativeHostService) {
    this.nativeHostService = nativeHostService;
  }
  static {
    __name(this, "NativeClipboardService");
  }
  static FILE_FORMAT = "code/file-list";
  async triggerPaste() {
    return this.nativeHostService.triggerPaste();
  }
  async readImage() {
    return this.nativeHostService.readImage();
  }
  async writeText(text, type) {
    return this.nativeHostService.writeClipboardText(text, type);
  }
  async readText(type) {
    return this.nativeHostService.readClipboardText(type);
  }
  async readFindText() {
    if (isMacintosh) {
      return this.nativeHostService.readClipboardFindText();
    }
    return "";
  }
  async writeFindText(text) {
    if (isMacintosh) {
      return this.nativeHostService.writeClipboardFindText(text);
    }
  }
  async writeResources(resources) {
    if (resources.length) {
      return this.nativeHostService.writeClipboardBuffer(NativeClipboardService.FILE_FORMAT, this.resourcesToBuffer(resources));
    }
  }
  async readResources() {
    return this.bufferToResources(await this.nativeHostService.readClipboardBuffer(NativeClipboardService.FILE_FORMAT));
  }
  async hasResources() {
    return this.nativeHostService.hasClipboard(NativeClipboardService.FILE_FORMAT);
  }
  resourcesToBuffer(resources) {
    return VSBuffer.fromString(resources.map((r) => r.toString()).join("\n"));
  }
  bufferToResources(buffer) {
    if (!buffer) {
      return [];
    }
    const bufferValue = buffer.toString();
    if (!bufferValue) {
      return [];
    }
    try {
      return bufferValue.split("\n").map((f) => URI.parse(f));
    } catch (error) {
      return [];
    }
  }
};
NativeClipboardService = __decorateClass([
  __decorateParam(0, INativeHostService)
], NativeClipboardService);
registerSingleton(IClipboardService, NativeClipboardService, InstantiationType.Delayed);
export {
  NativeClipboardService
};
//# sourceMappingURL=clipboardService.js.map
