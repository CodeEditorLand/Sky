var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createHash } from "crypto";
import { Stats } from "fs";
import { Schemas } from "../../../base/common/network.js";
import { isLinux, isMacintosh, isWindows } from "../../../base/common/platform.js";
import { originalFSPath } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from "../../workspace/common/workspace.js";
const NON_EMPTY_WORKSPACE_ID_LENGTH = 128 / 4;
function getWorkspaceIdentifier(configPath) {
  function getWorkspaceId() {
    let configPathStr = configPath.scheme === Schemas.file ? originalFSPath(configPath) : configPath.toString();
    if (!isLinux) {
      configPathStr = configPathStr.toLowerCase();
    }
    return createHash("md5").update(configPathStr).digest("hex");
  }
  __name(getWorkspaceId, "getWorkspaceId");
  return {
    id: getWorkspaceId(),
    configPath
  };
}
__name(getWorkspaceIdentifier, "getWorkspaceIdentifier");
function getSingleFolderWorkspaceIdentifier(folderUri, folderStat) {
  function getFolderId() {
    if (folderUri.scheme !== Schemas.file) {
      return createHash("md5").update(folderUri.toString()).digest("hex");
    }
    if (!folderStat) {
      return void 0;
    }
    let ctime;
    if (isLinux) {
      ctime = folderStat.ino;
    } else if (isMacintosh) {
      ctime = folderStat.birthtime.getTime();
    } else if (isWindows) {
      if (typeof folderStat.birthtimeMs === "number") {
        ctime = Math.floor(folderStat.birthtimeMs);
      } else {
        ctime = folderStat.birthtime.getTime();
      }
    }
    return createHash("md5").update(folderUri.fsPath).update(ctime ? String(ctime) : "").digest("hex");
  }
  __name(getFolderId, "getFolderId");
  const folderId = getFolderId();
  if (typeof folderId === "string") {
    return {
      id: folderId,
      uri: folderUri
    };
  }
  return void 0;
}
__name(getSingleFolderWorkspaceIdentifier, "getSingleFolderWorkspaceIdentifier");
function createEmptyWorkspaceIdentifier() {
  return {
    id: (Date.now() + Math.round(Math.random() * 1e3)).toString()
  };
}
__name(createEmptyWorkspaceIdentifier, "createEmptyWorkspaceIdentifier");
export {
  NON_EMPTY_WORKSPACE_ID_LENGTH,
  createEmptyWorkspaceIdentifier,
  getSingleFolderWorkspaceIdentifier,
  getWorkspaceIdentifier
};
//# sourceMappingURL=workspaces.js.map
