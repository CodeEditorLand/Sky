var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { WorkbenchState, IWorkspace } from "../../../../platform/workspace/common/workspace.js";
import { URI } from "../../../../base/common/uri.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkspaceTagsService, Tags } from "../common/workspaceTags.js";
class NoOpWorkspaceTagsService {
  static {
    __name(this, "NoOpWorkspaceTagsService");
  }
  getTags() {
    return Promise.resolve({});
  }
  async getTelemetryWorkspaceId(workspace, state) {
    return void 0;
  }
  getHashedRemotesFromUri(workspaceUri, stripEndingDotGit) {
    return Promise.resolve([]);
  }
}
registerSingleton(IWorkspaceTagsService, NoOpWorkspaceTagsService, InstantiationType.Delayed);
export {
  NoOpWorkspaceTagsService
};
//# sourceMappingURL=workspaceTagsService.js.map
