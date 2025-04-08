var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IWorkspace } from "../../../../platform/workspace/common/workspace.js";
import { IFileService } from "../../../../platform/files/common/files.js";
async function areWorkspaceFoldersEmpty(workspace, fileService) {
  for (const folder of workspace.folders) {
    const folderStat = await fileService.resolve(folder.uri);
    if (folderStat.children && folderStat.children.length > 0) {
      return false;
    }
  }
  return true;
}
__name(areWorkspaceFoldersEmpty, "areWorkspaceFoldersEmpty");
export {
  areWorkspaceFoldersEmpty
};
//# sourceMappingURL=workspaceUtils.js.map
