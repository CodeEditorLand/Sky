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
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IPathService, AbstractPathService } from "../common/pathService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
let NativePathService = class extends AbstractPathService {
  static {
    __name(this, "NativePathService");
  }
  constructor(remoteAgentService, environmentService, contextService) {
    super(environmentService.userHome, remoteAgentService, environmentService, contextService);
  }
};
NativePathService = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, IWorkspaceContextService)
], NativePathService);
registerSingleton(IPathService, NativePathService, InstantiationType.Delayed);
export {
  NativePathService
};
//# sourceMappingURL=pathService.js.map
