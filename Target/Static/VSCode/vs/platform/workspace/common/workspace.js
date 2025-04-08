var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../nls.js";
import { Event } from "../../../base/common/event.js";
import { basename, extname } from "../../../base/common/path.js";
import { TernarySearchTree } from "../../../base/common/ternarySearchTree.js";
import { extname as resourceExtname, basenameOrAuthority, joinPath, extUriBiasedIgnorePathCase } from "../../../base/common/resources.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { Schemas } from "../../../base/common/network.js";
const IWorkspaceContextService = createDecorator("contextService");
function isSingleFolderWorkspaceIdentifier(obj) {
  const singleFolderIdentifier = obj;
  return typeof singleFolderIdentifier?.id === "string" && URI.isUri(singleFolderIdentifier.uri);
}
__name(isSingleFolderWorkspaceIdentifier, "isSingleFolderWorkspaceIdentifier");
function isEmptyWorkspaceIdentifier(obj) {
  const emptyWorkspaceIdentifier = obj;
  return typeof emptyWorkspaceIdentifier?.id === "string" && !isSingleFolderWorkspaceIdentifier(obj) && !isWorkspaceIdentifier(obj);
}
__name(isEmptyWorkspaceIdentifier, "isEmptyWorkspaceIdentifier");
const EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE = { id: "ext-dev" };
const UNKNOWN_EMPTY_WINDOW_WORKSPACE = { id: "empty-window" };
function toWorkspaceIdentifier(arg0, isExtensionDevelopment) {
  if (typeof arg0 === "string" || typeof arg0 === "undefined") {
    if (typeof arg0 === "string") {
      return {
        id: basename(arg0)
      };
    }
    if (isExtensionDevelopment) {
      return EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE;
    }
    return UNKNOWN_EMPTY_WINDOW_WORKSPACE;
  }
  const workspace = arg0;
  if (workspace.configuration) {
    return {
      id: workspace.id,
      configPath: workspace.configuration
    };
  }
  if (workspace.folders.length === 1) {
    return {
      id: workspace.id,
      uri: workspace.folders[0].uri
    };
  }
  return {
    id: workspace.id
  };
}
__name(toWorkspaceIdentifier, "toWorkspaceIdentifier");
function isWorkspaceIdentifier(obj) {
  const workspaceIdentifier = obj;
  return typeof workspaceIdentifier?.id === "string" && URI.isUri(workspaceIdentifier.configPath);
}
__name(isWorkspaceIdentifier, "isWorkspaceIdentifier");
function reviveIdentifier(identifier) {
  const singleFolderIdentifierCandidate = identifier;
  if (singleFolderIdentifierCandidate?.uri) {
    return { id: singleFolderIdentifierCandidate.id, uri: URI.revive(singleFolderIdentifierCandidate.uri) };
  }
  const workspaceIdentifierCandidate = identifier;
  if (workspaceIdentifierCandidate?.configPath) {
    return { id: workspaceIdentifierCandidate.id, configPath: URI.revive(workspaceIdentifierCandidate.configPath) };
  }
  if (identifier?.id) {
    return { id: identifier.id };
  }
  return void 0;
}
__name(reviveIdentifier, "reviveIdentifier");
var WorkbenchState = /* @__PURE__ */ ((WorkbenchState2) => {
  WorkbenchState2[WorkbenchState2["EMPTY"] = 1] = "EMPTY";
  WorkbenchState2[WorkbenchState2["FOLDER"] = 2] = "FOLDER";
  WorkbenchState2[WorkbenchState2["WORKSPACE"] = 3] = "WORKSPACE";
  return WorkbenchState2;
})(WorkbenchState || {});
function isWorkspace(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && typeof candidate.id === "string" && Array.isArray(candidate.folders));
}
__name(isWorkspace, "isWorkspace");
function isWorkspaceFolder(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && URI.isUri(candidate.uri) && typeof candidate.name === "string" && typeof candidate.toResource === "function");
}
__name(isWorkspaceFolder, "isWorkspaceFolder");
class Workspace {
  constructor(_id, folders, _transient, _configuration, ignorePathCasing) {
    this._id = _id;
    this._transient = _transient;
    this._configuration = _configuration;
    this.ignorePathCasing = ignorePathCasing;
    this.foldersMap = TernarySearchTree.forUris(this.ignorePathCasing, () => true);
    this.folders = folders;
  }
  static {
    __name(this, "Workspace");
  }
  foldersMap;
  _folders;
  get folders() {
    return this._folders;
  }
  set folders(folders) {
    this._folders = folders;
    this.updateFoldersMap();
  }
  update(workspace) {
    this._id = workspace.id;
    this._configuration = workspace.configuration;
    this._transient = workspace.transient;
    this.ignorePathCasing = workspace.ignorePathCasing;
    this.folders = workspace.folders;
  }
  get id() {
    return this._id;
  }
  get transient() {
    return this._transient;
  }
  get configuration() {
    return this._configuration;
  }
  set configuration(configuration) {
    this._configuration = configuration;
  }
  getFolder(resource) {
    if (!resource) {
      return null;
    }
    return this.foldersMap.findSubstr(resource) || null;
  }
  updateFoldersMap() {
    this.foldersMap = TernarySearchTree.forUris(this.ignorePathCasing, () => true);
    for (const folder of this.folders) {
      this.foldersMap.set(folder.uri, folder);
    }
  }
  toJSON() {
    return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration };
  }
}
class WorkspaceFolder {
  constructor(data, raw) {
    this.raw = raw;
    this.uri = data.uri;
    this.index = data.index;
    this.name = data.name;
  }
  static {
    __name(this, "WorkspaceFolder");
  }
  uri;
  name;
  index;
  toResource(relativePath) {
    return joinPath(this.uri, relativePath);
  }
  toJSON() {
    return { uri: this.uri, name: this.name, index: this.index };
  }
}
function toWorkspaceFolder(resource) {
  return new WorkspaceFolder({ uri: resource, index: 0, name: basenameOrAuthority(resource) }, { uri: resource.toString() });
}
__name(toWorkspaceFolder, "toWorkspaceFolder");
const WORKSPACE_EXTENSION = "code-workspace";
const WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;
const WORKSPACE_FILTER = [{ name: localize("codeWorkspace", "Code Workspace"), extensions: [WORKSPACE_EXTENSION] }];
const UNTITLED_WORKSPACE_NAME = "workspace.json";
function isUntitledWorkspace(path, environmentService) {
  return extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
}
__name(isUntitledWorkspace, "isUntitledWorkspace");
function isTemporaryWorkspace(arg1) {
  let path;
  if (URI.isUri(arg1)) {
    path = arg1;
  } else {
    path = arg1.configuration;
  }
  return path?.scheme === Schemas.tmp;
}
__name(isTemporaryWorkspace, "isTemporaryWorkspace");
const STANDALONE_EDITOR_WORKSPACE_ID = "4064f6ec-cb38-4ad0-af64-ee6467e63c82";
function isStandaloneEditorWorkspace(workspace) {
  return workspace.id === STANDALONE_EDITOR_WORKSPACE_ID;
}
__name(isStandaloneEditorWorkspace, "isStandaloneEditorWorkspace");
function isSavedWorkspace(path, environmentService) {
  return !isUntitledWorkspace(path, environmentService) && !isTemporaryWorkspace(path);
}
__name(isSavedWorkspace, "isSavedWorkspace");
function hasWorkspaceFileExtension(path) {
  const ext = typeof path === "string" ? extname(path) : resourceExtname(path);
  return ext === WORKSPACE_SUFFIX;
}
__name(hasWorkspaceFileExtension, "hasWorkspaceFileExtension");
export {
  EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE,
  IWorkspaceContextService,
  STANDALONE_EDITOR_WORKSPACE_ID,
  UNKNOWN_EMPTY_WINDOW_WORKSPACE,
  UNTITLED_WORKSPACE_NAME,
  WORKSPACE_EXTENSION,
  WORKSPACE_FILTER,
  WORKSPACE_SUFFIX,
  WorkbenchState,
  Workspace,
  WorkspaceFolder,
  hasWorkspaceFileExtension,
  isEmptyWorkspaceIdentifier,
  isSavedWorkspace,
  isSingleFolderWorkspaceIdentifier,
  isStandaloneEditorWorkspace,
  isTemporaryWorkspace,
  isUntitledWorkspace,
  isWorkspace,
  isWorkspaceFolder,
  isWorkspaceIdentifier,
  reviveIdentifier,
  toWorkspaceFolder,
  toWorkspaceIdentifier
};
//# sourceMappingURL=workspace.js.map
