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
import { ProxyChannel } from "../../../base/parts/ipc/common/ipc.js";
import { IMainProcessService } from "../../ipc/common/mainProcessService.js";
let NativeBrowserElementsService = class NativeBrowserElementsService2 {
  static {
    __name(this, "NativeBrowserElementsService");
  }
  constructor(windowId, mainProcessService) {
    this.windowId = windowId;
    return ProxyChannel.toService(mainProcessService.getChannel("browserElements"), {
      context: windowId,
      properties: (() => {
        const properties = /* @__PURE__ */ new Map();
        properties.set("windowId", windowId);
        return properties;
      })()
    });
  }
};
NativeBrowserElementsService = __decorate([
  __param(1, IMainProcessService)
], NativeBrowserElementsService);
export {
  NativeBrowserElementsService
};
//# sourceMappingURL=nativeBrowserElementsService.js.map
