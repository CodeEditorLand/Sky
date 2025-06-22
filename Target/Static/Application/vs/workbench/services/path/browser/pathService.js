var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { IPathService, AbstractPathService } from "../common/pathService.js";
import { URI } from "../../../../base/common/uri.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { dirname } from "../../../../base/common/resources.js";
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
let BrowserPathService = class BrowserPathService2 extends AbstractPathService {
  static {
    __name(this, "BrowserPathService");
  }
  constructor(remoteAgentService, environmentService, contextService) {
    super(guessLocalUserHome(environmentService, contextService), remoteAgentService, environmentService, contextService);
  }
};
BrowserPathService = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IWorkbenchEnvironmentService),
  __param(2, IWorkspaceContextService)
], BrowserPathService);
function guessLocalUserHome(environmentService, contextService) {
  const workspace = contextService.getWorkspace();
  const firstFolder = workspace.folders.at(0);
  if (firstFolder) {
    return firstFolder.uri;
  }
  if (workspace.configuration) {
    return dirname(workspace.configuration);
  }
  return URI.from({
    scheme: AbstractPathService.findDefaultUriScheme(environmentService, contextService),
    authority: environmentService.remoteAuthority,
    path: "/"
  });
}
__name(guessLocalUserHome, "guessLocalUserHome");
registerSingleton(
  IPathService,
  BrowserPathService,
  1
  /* InstantiationType.Delayed */
);
export {
  BrowserPathService
};
//# sourceMappingURL=pathService.js.map
