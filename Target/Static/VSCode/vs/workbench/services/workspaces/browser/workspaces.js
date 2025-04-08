var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { URI } from "../../../../base/common/uri.js";
import { hash } from "../../../../base/common/hash.js";
function getWorkspaceIdentifier(workspaceUri) {
  return {
    id: getWorkspaceId(workspaceUri),
    configPath: workspaceUri
  };
}
__name(getWorkspaceIdentifier, "getWorkspaceIdentifier");
function getSingleFolderWorkspaceIdentifier(folderUri) {
  return {
    id: getWorkspaceId(folderUri),
    uri: folderUri
  };
}
__name(getSingleFolderWorkspaceIdentifier, "getSingleFolderWorkspaceIdentifier");
function getWorkspaceId(uri) {
  return hash(uri.toString()).toString(16);
}
__name(getWorkspaceId, "getWorkspaceId");
export {
  getSingleFolderWorkspaceIdentifier,
  getWorkspaceIdentifier
};
//# sourceMappingURL=workspaces.js.map
