var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../base/common/network.js";
function isVirtualResource(resource) {
  return resource.scheme !== Schemas.file && resource.scheme !== Schemas.vscodeRemote;
}
__name(isVirtualResource, "isVirtualResource");
function getVirtualWorkspaceLocation(workspace) {
  if (workspace.folders.length) {
    return workspace.folders.every((f) => isVirtualResource(f.uri)) ? workspace.folders[0].uri : void 0;
  } else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
    return workspace.configuration;
  }
  return void 0;
}
__name(getVirtualWorkspaceLocation, "getVirtualWorkspaceLocation");
function getVirtualWorkspaceScheme(workspace) {
  return getVirtualWorkspaceLocation(workspace)?.scheme;
}
__name(getVirtualWorkspaceScheme, "getVirtualWorkspaceScheme");
function getVirtualWorkspaceAuthority(workspace) {
  return getVirtualWorkspaceLocation(workspace)?.authority;
}
__name(getVirtualWorkspaceAuthority, "getVirtualWorkspaceAuthority");
function isVirtualWorkspace(workspace) {
  return getVirtualWorkspaceLocation(workspace) !== void 0;
}
__name(isVirtualWorkspace, "isVirtualWorkspace");
export {
  getVirtualWorkspaceAuthority,
  getVirtualWorkspaceLocation,
  getVirtualWorkspaceScheme,
  isVirtualResource,
  isVirtualWorkspace
};
//# sourceMappingURL=virtualWorkspace.js.map
