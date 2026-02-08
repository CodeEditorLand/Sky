var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ResourceMap, ResourceSet } from "../../../../../../base/common/map.js";
import { dirname, extUriBiasedIgnorePathCase } from "../../../../../../base/common/resources.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
class ChatExternalPathConfirmationContribution {
  static {
    __name(this, "ChatExternalPathConfirmationContribution");
  }
  constructor(_getPathInfo) {
    this._getPathInfo = _getPathInfo;
    this.canUseDefaultApprovals = false;
    this._sessionFolderAllowlist = new ResourceMap();
  }
  getPreConfirmAction(ref) {
    const pathInfo = this._getPathInfo(ref);
    if (!pathInfo || !ref.chatSessionResource) {
      return void 0;
    }
    const allowedFolders = this._sessionFolderAllowlist.get(ref.chatSessionResource);
    if (!allowedFolders || allowedFolders.size === 0) {
      return void 0;
    }
    let pathUri;
    try {
      pathUri = URI.file(pathInfo.path);
    } catch {
      return void 0;
    }
    for (const folderUri of allowedFolders) {
      if (extUriBiasedIgnorePathCase.isEqualOrParent(pathUri, folderUri)) {
        return {
          type: 4
          /* ToolConfirmKind.UserAction */
        };
      }
    }
    return void 0;
  }
  getPreConfirmActions(ref) {
    const pathInfo = this._getPathInfo(ref);
    if (!pathInfo || !ref.chatSessionResource) {
      return [];
    }
    let pathUri;
    try {
      pathUri = URI.file(pathInfo.path);
    } catch {
      return [];
    }
    const folderUri = pathInfo.isDirectory ? pathUri : dirname(pathUri);
    const sessionResource = ref.chatSessionResource;
    return [
      {
        label: localize("allowFolderSession", "Allow this folder in this session"),
        detail: localize("allowFolderSessionDetail", "Allow reading files from this folder without further confirmation in this chat session"),
        select: /* @__PURE__ */ __name(async () => {
          let folders = this._sessionFolderAllowlist.get(sessionResource);
          if (!folders) {
            folders = new ResourceSet();
            this._sessionFolderAllowlist.set(sessionResource, folders);
          }
          folders.add(folderUri);
          return true;
        }, "select")
      }
    ];
  }
}
export {
  ChatExternalPathConfirmationContribution
};
//# sourceMappingURL=chatExternalPathConfirmation.js.map
