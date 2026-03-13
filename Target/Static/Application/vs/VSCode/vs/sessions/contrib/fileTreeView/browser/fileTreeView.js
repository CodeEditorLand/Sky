var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var FileTreeRenderer_1;
import "./media/fileTreeView.css";
import * as dom from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived, observableFromEvent } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { FileKind, IFileService } from "../../../../platform/files/common/files.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchCompressibleAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ResourceLabels } from "../../../../workbench/browser/labels.js";
import { ViewPane } from "../../../../workbench/browser/parts/views/viewPane.js";
import { ViewPaneContainer } from "../../../../workbench/browser/parts/views/viewPaneContainer.js";
import { IViewDescriptorService } from "../../../../workbench/common/views.js";
import { createFileIconThemableTreeContainerScope } from "../../../../workbench/contrib/files/browser/views/explorerView.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { getChatSessionType } from "../../../../workbench/contrib/chat/common/model/chatUri.js";
import { isIChatSessionFileChange2 } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../../workbench/services/editor/common/editorService.js";
import { IExtensionService } from "../../../../workbench/services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../../workbench/services/layout/browser/layoutService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { GITHUB_REMOTE_FILE_SCHEME, getGitHubRemoteFileDisplayName } from "./githubFileSystemProvider.js";
import { basename } from "../../../../base/common/path.js";
import { isEqual } from "../../../../base/common/resources.js";
const $ = dom.$;
const FILE_TREE_VIEW_CONTAINER_ID = "workbench.view.agentSessions.fileTreeContainer";
const FILE_TREE_VIEW_ID = "workbench.view.agentSessions.fileTree";
class FileTreeDataSource {
  static {
    __name(this, "FileTreeDataSource");
  }
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  hasChildren(element) {
    if (URI.isUri(element)) {
      return true;
    }
    return element.isDirectory;
  }
  async getChildren(element) {
    const uri = URI.isUri(element) ? element : element.uri;
    try {
      const stat = await this.fileService.resolve(uri);
      if (!stat.children) {
        return [];
      }
      return stat.children.map((child) => ({
        uri: child.resource,
        name: child.name,
        isDirectory: child.isDirectory
      })).sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (e) {
      this.logService.warn(`[FileTreeView] Error fetching children for ${uri.toString()}:`, e);
      return [];
    }
  }
}
class FileTreeDelegate {
  static {
    __name(this, "FileTreeDelegate");
  }
  getHeight() {
    return 22;
  }
  getTemplateId() {
    return FileTreeRenderer.TEMPLATE_ID;
  }
}
let FileTreeRenderer = class FileTreeRenderer2 {
  static {
    __name(this, "FileTreeRenderer");
  }
  static {
    FileTreeRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "fileTreeRenderer";
  }
  constructor(labels, labelService) {
    this.labels = labels;
    this.labelService = labelService;
    this.templateId = FileTreeRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true, supportIcons: true }));
    return { label, templateDisposables };
  }
  renderElement(node, _index, templateData) {
    const element = node.element;
    templateData.label.element.style.display = "flex";
    templateData.label.setFile(element.uri, {
      fileKind: element.isDirectory ? FileKind.FOLDER : FileKind.FILE,
      hidePath: true
    });
  }
  renderCompressedElements(node, _index, templateData) {
    const compressed = node.element;
    const lastElement = compressed.elements[compressed.elements.length - 1];
    templateData.label.element.style.display = "flex";
    const label = compressed.elements.map((e) => e.name);
    templateData.label.setResource({ resource: lastElement.uri, name: label }, {
      fileKind: lastElement.isDirectory ? FileKind.FOLDER : FileKind.FILE,
      separator: this.labelService.getSeparator(lastElement.uri.scheme)
    });
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};
FileTreeRenderer = FileTreeRenderer_1 = __decorate([
  __param(1, ILabelService)
], FileTreeRenderer);
class FileTreeCompressionDelegate {
  static {
    __name(this, "FileTreeCompressionDelegate");
  }
  isIncompressible(element) {
    return !element.isDirectory;
  }
}
let FileTreeViewPane = class FileTreeViewPane2 extends ViewPane {
  static {
    __name(this, "FileTreeViewPane");
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, fileService, editorService, sessionManagementService, agentSessionsService, logService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.fileService = fileService;
    this.editorService = editorService;
    this.sessionManagementService = sessionManagementService;
    this.agentSessionsService = agentSessionsService;
    this.logService = logService;
    this.renderDisposables = this._register(new DisposableStore());
    this.treeInputDisposable = this._register(new MutableDisposable());
    this.currentBodyHeight = 0;
    this.currentBodyWidth = 0;
    const sessionsChangedSignal = observableFromEvent(this, this.agentSessionsService.model.onDidChangeSessions, () => ({}));
    this.treeRootUri = derived((reader) => {
      const activeSession = this.sessionManagementService.activeSession.read(reader);
      sessionsChangedSignal.read(reader);
      return this.resolveTreeRoot(activeSession);
    });
  }
  /**
   * Determines the root URI for the file tree based on the active session type.
   * Tries multiple data sources: IActiveSessionItem fields, agent session model metadata,
   * and file change URIs as a last resort.
   */
  resolveTreeRoot(activeSession) {
    if (!activeSession) {
      return void 0;
    }
    const sessionType = getChatSessionType(activeSession.resource);
    if (activeSession.worktree) {
      this.logService.info(`[FileTreeView] Using worktree: ${activeSession.worktree.toString()}`);
      return activeSession.worktree;
    }
    if (activeSession.repository && activeSession.repository.scheme === "file") {
      this.logService.info(`[FileTreeView] Using repository: ${activeSession.repository.toString()}`);
      return activeSession.repository;
    }
    const agentSession = this.agentSessionsService.getSession(activeSession.resource);
    if (agentSession?.metadata) {
      const metadata = agentSession.metadata;
      const workingDir = metadata.workingDirectoryPath;
      if (workingDir) {
        this.logService.info(`[FileTreeView] Using metadata.workingDirectoryPath: ${workingDir}`);
        return URI.file(workingDir);
      }
      const worktreePath = metadata.worktreePath;
      if (worktreePath) {
        this.logService.info(`[FileTreeView] Using metadata.worktreePath: ${worktreePath}`);
        return URI.file(worktreePath);
      }
      const repositoryPath = metadata.repositoryPath;
      if (repositoryPath) {
        this.logService.info(`[FileTreeView] Using metadata.repositoryPath: ${repositoryPath}`);
        return URI.file(repositoryPath);
      }
      const repoUri = this.extractRepoUriFromMetadata(metadata);
      if (repoUri) {
        return repoUri;
      }
    }
    if (sessionType === AgentSessionProviders.Cloud || sessionType === AgentSessionProviders.Codex) {
      const repoUri = this.inferRepoFromChanges(activeSession.resource);
      if (repoUri) {
        this.logService.info(`[FileTreeView] Inferred repo from changes: ${repoUri.toString()}`);
        return repoUri;
      }
    }
    if (activeSession.repository) {
      const repoStr = activeSession.repository.toString();
      const parsed = this.parseGitHubUrl(repoStr);
      if (parsed) {
        this.logService.info(`[FileTreeView] Parsed repository URI as GitHub: ${parsed.owner}/${parsed.repo}`);
        return URI.from({
          scheme: GITHUB_REMOTE_FILE_SCHEME,
          authority: "github",
          path: `/${parsed.owner}/${parsed.repo}/HEAD`
        });
      }
    }
    this.logService.trace(`[FileTreeView] No tree root resolved for session ${activeSession.resource.toString()} (type: ${sessionType})`);
    return void 0;
  }
  /**
   * Extracts a github-remote-file:// URI from session metadata, trying various known fields.
   */
  extractRepoUriFromMetadata(metadata) {
    const branch = typeof metadata.branch === "string" ? metadata.branch : "HEAD";
    const encodedRef = encodeURIComponent(branch);
    const repositoryNwo = metadata.repositoryNwo;
    if (repositoryNwo && repositoryNwo.includes("/")) {
      this.logService.info(`[FileTreeView] Using metadata.repositoryNwo: ${repositoryNwo}`);
      return URI.from({
        scheme: GITHUB_REMOTE_FILE_SCHEME,
        authority: "github",
        path: `/${repositoryNwo}/${encodedRef}`
      });
    }
    const repositoryUrl = metadata.repositoryUrl;
    if (repositoryUrl) {
      const parsed = this.parseGitHubUrl(repositoryUrl);
      if (parsed) {
        this.logService.info(`[FileTreeView] Using metadata.repositoryUrl: ${repositoryUrl}`);
        return URI.from({
          scheme: GITHUB_REMOTE_FILE_SCHEME,
          authority: "github",
          path: `/${parsed.owner}/${parsed.repo}/${encodedRef}`
        });
      }
    }
    const repository = metadata.repository;
    if (repository) {
      if (repository.includes("/") && !repository.includes(":")) {
        this.logService.info(`[FileTreeView] Using metadata.repository as nwo: ${repository}`);
        return URI.from({
          scheme: GITHUB_REMOTE_FILE_SCHEME,
          authority: "github",
          path: `/${repository}/${encodedRef}`
        });
      }
      const parsed = this.parseGitHubUrl(repository);
      if (parsed) {
        this.logService.info(`[FileTreeView] Using metadata.repository as URL: ${repository}`);
        return URI.from({
          scheme: GITHUB_REMOTE_FILE_SCHEME,
          authority: "github",
          path: `/${parsed.owner}/${parsed.repo}/${encodedRef}`
        });
      }
    }
    return void 0;
  }
  /**
   * Attempts to infer the repository from the session's file change URIs.
   * Cloud sessions have changes with URIs that reveal the repository.
   */
  inferRepoFromChanges(sessionResource) {
    const agentSession = this.agentSessionsService.getSession(sessionResource);
    if (!agentSession?.changes || !(agentSession.changes instanceof Array)) {
      return void 0;
    }
    for (const change of agentSession.changes) {
      const fileUri = isIChatSessionFileChange2(change) ? change.modifiedUri ?? change.uri : change.modifiedUri;
      if (!fileUri) {
        continue;
      }
      const parsed = this.parseRepoFromFileUri(fileUri);
      if (parsed) {
        return URI.from({
          scheme: GITHUB_REMOTE_FILE_SCHEME,
          authority: "github",
          path: `/${parsed.owner}/${parsed.repo}/${parsed.ref}`
        });
      }
    }
    return void 0;
  }
  /**
   * Tries to extract GitHub owner/repo from a file change URI.
   * Handles various URI formats used by cloud sessions.
   */
  parseRepoFromFileUri(uri) {
    if (uri.authority === "github" || uri.authority?.startsWith("github")) {
      const parts = uri.path.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1], ref: "HEAD" };
      }
    }
    if (uri.scheme === "github" || uri.scheme === "github1s") {
      const parts = uri.authority ? uri.authority.split("/") : uri.path.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1], ref: "HEAD" };
      }
    }
    return this.parseGitHubUrl(uri.toString());
  }
  parseGitHubUrl(url) {
    const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i.exec(url) || /^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i.exec(url);
    return match ? { owner: match[1], repo: match[2], ref: "HEAD" } : void 0;
  }
  renderBody(container) {
    super.renderBody(container);
    this.bodyContainer = dom.append(container, $(".file-tree-view-body"));
    this.welcomeContainer = dom.append(this.bodyContainer, $(".file-tree-welcome"));
    const welcomeIcon = dom.append(this.welcomeContainer, $(".file-tree-welcome-icon"));
    welcomeIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.repoClone));
    const welcomeMessage = dom.append(this.welcomeContainer, $(".file-tree-welcome-message"));
    welcomeMessage.textContent = localize("fileTreeView.noRepository", "No repository available for this session.");
    this.treeContainer = dom.append(this.bodyContainer, $(".file-tree-container.show-file-icons"));
    this._register(createFileIconThemableTreeContainerScope(this.treeContainer, this.themeService));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        this.onVisible();
      } else {
        this.renderDisposables.clear();
      }
    }));
    if (this.isBodyVisible()) {
      this.onVisible();
    }
  }
  onVisible() {
    this.renderDisposables.clear();
    this.logService.info("[FileTreeView] onVisible called");
    if (!this.tree && this.treeContainer) {
      const resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
      const dataSource = new FileTreeDataSource(this.fileService, this.logService);
      this.tree = this.instantiationService.createInstance(WorkbenchCompressibleAsyncDataTree, "FileTreeView", this.treeContainer, new FileTreeDelegate(), new FileTreeCompressionDelegate(), [this.instantiationService.createInstance(FileTreeRenderer, resourceLabels)], dataSource, {
        accessibilityProvider: {
          getAriaLabel: /* @__PURE__ */ __name((element) => element.name, "getAriaLabel"),
          getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("fileTreeView", "File Tree"), "getWidgetAriaLabel")
        },
        identityProvider: {
          getId: /* @__PURE__ */ __name((element) => element.uri.toString(), "getId")
        },
        compressionEnabled: true,
        collapseByDefault: /* @__PURE__ */ __name((_e) => true, "collapseByDefault")
      });
    }
    if (this.tree) {
      this.renderDisposables.add(this.tree.onDidOpen(async (e) => {
        if (!e.element || e.element.isDirectory) {
          return;
        }
        await this.editorService.openEditor({
          resource: e.element.uri,
          options: e.editorOptions
        }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
      }));
    }
    let lastRootUri;
    this.renderDisposables.add(autorun((reader) => {
      const rootUri = this.treeRootUri.read(reader);
      const hasRoot = !!rootUri;
      dom.setVisibility(hasRoot, this.treeContainer);
      dom.setVisibility(!hasRoot, this.welcomeContainer);
      if (this.tree && rootUri && !isEqual(rootUri, lastRootUri)) {
        lastRootUri = rootUri;
        this.updateTitle(this.getTreeTitle(rootUri));
        this.treeInputDisposable.clear();
        this.tree.setInput(rootUri).then(() => {
          this.layoutTree();
        });
      } else if (!rootUri && lastRootUri) {
        lastRootUri = void 0;
      }
    }));
  }
  getTreeTitle(rootUri) {
    return getGitHubRemoteFileDisplayName(rootUri) ?? (basename(rootUri.path) || rootUri.toString());
  }
  layoutTree() {
    if (!this.tree) {
      return;
    }
    this.tree.layout(this.currentBodyHeight, this.currentBodyWidth);
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.currentBodyHeight = height;
    this.currentBodyWidth = width;
    this.layoutTree();
  }
  focus() {
    super.focus();
    this.tree?.domFocus();
  }
  dispose() {
    this.tree?.dispose();
    this.tree = void 0;
    super.dispose();
  }
};
FileTreeViewPane = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IFileService),
  __param(11, IEditorService),
  __param(12, ISessionsManagementService),
  __param(13, IAgentSessionsService),
  __param(14, ILogService)
], FileTreeViewPane);
let FileTreeViewPaneContainer = class FileTreeViewPaneContainer2 extends ViewPaneContainer {
  static {
    __name(this, "FileTreeViewPaneContainer");
  }
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService, logService) {
    super(FILE_TREE_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("file-tree-viewlet");
  }
};
FileTreeViewPaneContainer = __decorate([
  __param(0, IWorkbenchLayoutService),
  __param(1, ITelemetryService),
  __param(2, IInstantiationService),
  __param(3, IContextMenuService),
  __param(4, IThemeService),
  __param(5, IStorageService),
  __param(6, IConfigurationService),
  __param(7, IExtensionService),
  __param(8, IWorkspaceContextService),
  __param(9, IViewDescriptorService),
  __param(10, ILogService)
], FileTreeViewPaneContainer);
export {
  FILE_TREE_VIEW_CONTAINER_ID,
  FILE_TREE_VIEW_ID,
  FileTreeViewPane,
  FileTreeViewPaneContainer
};
//# sourceMappingURL=fileTreeView.js.map
