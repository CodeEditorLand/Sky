var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import { IWorkspaceIdentifier } from "../../workspace/common/workspace.js";
function isFolderBackupInfo(curr) {
  return curr && curr.hasOwnProperty("folderUri");
}
__name(isFolderBackupInfo, "isFolderBackupInfo");
function isWorkspaceBackupInfo(curr) {
  return curr && curr.hasOwnProperty("workspace");
}
__name(isWorkspaceBackupInfo, "isWorkspaceBackupInfo");
export {
  isFolderBackupInfo,
  isWorkspaceBackupInfo
};
//# sourceMappingURL=backup.js.map
