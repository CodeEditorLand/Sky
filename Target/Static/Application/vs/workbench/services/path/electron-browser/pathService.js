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
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { IPathService, AbstractPathService } from "../common/pathService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
let NativePathService = class NativePathService2 extends AbstractPathService {
  static {
    __name(this, "NativePathService");
  }
  constructor(remoteAgentService, environmentService, contextService) {
    super(environmentService.userHome, remoteAgentService, environmentService, contextService);
  }
};
NativePathService = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, INativeWorkbenchEnvironmentService),
  __param(2, IWorkspaceContextService)
], NativePathService);
registerSingleton(
  IPathService,
  NativePathService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativePathService
};
//# sourceMappingURL=pathService.js.map
