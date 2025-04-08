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
import { ProxyChannel } from "../../../base/parts/ipc/common/ipc.js";
import { IMainProcessService } from "../../ipc/common/mainProcessService.js";
import { INativeHostService } from "./native.js";
let NativeHostService = class {
  constructor(windowId, mainProcessService) {
    this.windowId = windowId;
    return ProxyChannel.toService(mainProcessService.getChannel("nativeHost"), {
      context: windowId,
      properties: (() => {
        const properties = /* @__PURE__ */ new Map();
        properties.set("windowId", windowId);
        return properties;
      })()
    });
  }
  static {
    __name(this, "NativeHostService");
  }
};
NativeHostService = __decorateClass([
  __decorateParam(1, IMainProcessService)
], NativeHostService);
export {
  NativeHostService
};
//# sourceMappingURL=nativeHostService.js.map
