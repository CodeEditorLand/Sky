var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { extUriBiasedIgnorePathCase } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { ICodeWindow } from "../../window/electron-main/window.js";
import { IResolvedWorkspace, ISingleFolderWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, IWorkspaceIdentifier } from "../../workspace/common/workspace.js";
async function findWindowOnFile(windows, fileUri, localWorkspaceResolver) {
  for (const window of windows) {
    const workspace = window.openedWorkspace;
    if (isWorkspaceIdentifier(workspace)) {
      const resolvedWorkspace = await localWorkspaceResolver(workspace);
      if (resolvedWorkspace) {
        if (resolvedWorkspace.folders.some((folder) => extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, folder.uri))) {
          return window;
        }
      } else {
        if (extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, workspace.configPath)) {
          return window;
        }
      }
    }
  }
  const singleFolderWindowsOnFilePath = windows.filter((window) => isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, window.openedWorkspace.uri));
  if (singleFolderWindowsOnFilePath.length) {
    return singleFolderWindowsOnFilePath.sort((windowA, windowB) => -(windowA.openedWorkspace.uri.path.length - windowB.openedWorkspace.uri.path.length))[0];
  }
  return void 0;
}
__name(findWindowOnFile, "findWindowOnFile");
function findWindowOnWorkspaceOrFolder(windows, folderOrWorkspaceConfigUri) {
  for (const window of windows) {
    if (isWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, folderOrWorkspaceConfigUri)) {
      return window;
    }
    if (isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderOrWorkspaceConfigUri)) {
      return window;
    }
  }
  return void 0;
}
__name(findWindowOnWorkspaceOrFolder, "findWindowOnWorkspaceOrFolder");
function findWindowOnExtensionDevelopmentPath(windows, extensionDevelopmentPaths) {
  const matches = /* @__PURE__ */ __name((uriString) => {
    return extensionDevelopmentPaths.some((path) => extUriBiasedIgnorePathCase.isEqual(URI.file(path), URI.file(uriString)));
  }, "matches");
  for (const window of windows) {
    if (window.config?.extensionDevelopmentPath?.some((path) => matches(path))) {
      return window;
    }
  }
  return void 0;
}
__name(findWindowOnExtensionDevelopmentPath, "findWindowOnExtensionDevelopmentPath");
export {
  findWindowOnExtensionDevelopmentPath,
  findWindowOnFile,
  findWindowOnWorkspaceOrFolder
};
//# sourceMappingURL=windowsFinder.js.map
