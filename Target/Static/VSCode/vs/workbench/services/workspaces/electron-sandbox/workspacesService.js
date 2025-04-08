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
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
let NativeWorkspacesService = class {
  static {
    __name(this, "NativeWorkspacesService");
  }
  constructor(mainProcessService, nativeHostService) {
    return ProxyChannel.toService(mainProcessService.getChannel("workspaces"), { context: nativeHostService.windowId });
  }
};
NativeWorkspacesService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, INativeHostService)
], NativeWorkspacesService);
registerSingleton(IWorkspacesService, NativeWorkspacesService, InstantiationType.Delayed);
export {
  NativeWorkspacesService
};
//# sourceMappingURL=workspacesService.js.map
