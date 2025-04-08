var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import { IBaseBackupInfo, IFolderBackupInfo, IWorkspaceBackupInfo } from "../common/backup.js";
function isEmptyWindowBackupInfo(obj) {
  const candidate = obj;
  return typeof candidate?.backupFolder === "string";
}
__name(isEmptyWindowBackupInfo, "isEmptyWindowBackupInfo");
function deserializeWorkspaceInfos(serializedBackupWorkspaces) {
  let workspaceBackupInfos = [];
  try {
    if (Array.isArray(serializedBackupWorkspaces.workspaces)) {
      workspaceBackupInfos = serializedBackupWorkspaces.workspaces.map((workspace) => ({
        workspace: {
          id: workspace.id,
          configPath: URI.parse(workspace.configURIPath)
        },
        remoteAuthority: workspace.remoteAuthority
      }));
    }
  } catch (e) {
  }
  return workspaceBackupInfos;
}
__name(deserializeWorkspaceInfos, "deserializeWorkspaceInfos");
function deserializeFolderInfos(serializedBackupWorkspaces) {
  let folderBackupInfos = [];
  try {
    if (Array.isArray(serializedBackupWorkspaces.folders)) {
      folderBackupInfos = serializedBackupWorkspaces.folders.map((folder) => ({
        folderUri: URI.parse(folder.folderUri),
        remoteAuthority: folder.remoteAuthority
      }));
    }
  } catch (e) {
  }
  return folderBackupInfos;
}
__name(deserializeFolderInfos, "deserializeFolderInfos");
export {
  deserializeFolderInfos,
  deserializeWorkspaceInfos,
  isEmptyWindowBackupInfo
};
//# sourceMappingURL=backup.js.map
