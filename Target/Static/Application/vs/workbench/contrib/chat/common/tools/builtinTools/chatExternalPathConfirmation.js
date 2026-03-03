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
  constructor(_getPathInfo, _findGitRoot) {
    this._getPathInfo = _getPathInfo;
    this._findGitRoot = _findGitRoot;
    this.canUseDefaultApprovals = false;
    this._sessionFolderAllowlist = new ResourceMap();
    this._gitRootCache = new ResourceMap();
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
    const actions = [
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
    if (this._findGitRoot) {
      const findGitRoot = this._findGitRoot;
      const gitRootCache = this._gitRootCache;
      const allowlist = this._sessionFolderAllowlist;
      const cached = gitRootCache.get(pathUri);
      if (cached === null) {
      } else if (cached) {
        actions.push({
          label: localize("allowRepoSession", "Allow all files in this repository for this session"),
          detail: localize("allowRepoSessionDetail", "Allow reading files from {0}", cached.fsPath),
          select: /* @__PURE__ */ __name(async () => {
            let folders = allowlist.get(sessionResource);
            if (!folders) {
              folders = new ResourceSet();
              allowlist.set(sessionResource, folders);
            }
            folders.add(cached);
            return true;
          }, "select")
        });
      } else {
        actions.push({
          label: localize("allowRepoSession", "Allow all files in this repository for this session"),
          detail: localize("allowRepoSessionDetailLookup", "Looks up the containing git repository for this path"),
          select: /* @__PURE__ */ __name(async () => {
            const gitRootUri = await findGitRoot(pathUri);
            gitRootCache.set(pathUri, gitRootUri ?? null);
            if (!gitRootUri) {
              return false;
            }
            let folders = allowlist.get(sessionResource);
            if (!folders) {
              folders = new ResourceSet();
              allowlist.set(sessionResource, folders);
            }
            folders.add(gitRootUri);
            return true;
          }, "select")
        });
      }
    }
    return actions;
  }
}
export {
  ChatExternalPathConfirmationContribution
};
//# sourceMappingURL=chatExternalPathConfirmation.js.map
