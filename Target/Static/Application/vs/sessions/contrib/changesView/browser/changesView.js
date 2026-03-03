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
var ChangesTreeRenderer_1;
import "./media/changesView.css";
import * as dom from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived, derivedOpts, observableFromEvent, observableValue } from "../../../../base/common/observable.js";
import { basename, dirname } from "../../../../base/common/path.js";
import { isEqual } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { MenuWorkbenchButtonBar } from "../../../../platform/actions/browser/buttonbar.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchCompressibleObjectTree } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { fillEditorsDragData } from "../../../../workbench/browser/dnd.js";
import { ResourceLabels } from "../../../../workbench/browser/labels.js";
import { ViewPane, ViewAction } from "../../../../workbench/browser/parts/views/viewPane.js";
import { ViewPaneContainer } from "../../../../workbench/browser/parts/views/viewPaneContainer.js";
import { IViewDescriptorService } from "../../../../workbench/common/views.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ChatContextKeys } from "../../../../workbench/contrib/chat/common/actions/chatContextKeys.js";
import { isIChatSessionFileChange2 } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { chatEditingWidgetFileStateContextKey, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { getChatSessionType } from "../../../../workbench/contrib/chat/common/model/chatUri.js";
import { createFileIconThemableTreeContainerScope } from "../../../../workbench/contrib/files/browser/views/explorerView.js";
import { IActivityService, NumberBadge } from "../../../../workbench/services/activity/common/activity.js";
import { IEditorService, MODAL_GROUP, SIDE_GROUP } from "../../../../workbench/services/editor/common/editorService.js";
import { IExtensionService } from "../../../../workbench/services/extensions/common/extensions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IWorkbenchLayoutService } from "../../../../workbench/services/layout/browser/layoutService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
const $ = dom.$;
const CHANGES_VIEW_CONTAINER_ID = "workbench.view.agentSessions.changesContainer";
const CHANGES_VIEW_ID = "workbench.view.agentSessions.changes";
var ChangesViewMode;
(function(ChangesViewMode2) {
  ChangesViewMode2["List"] = "list";
  ChangesViewMode2["Tree"] = "tree";
})(ChangesViewMode || (ChangesViewMode = {}));
const changesViewModeContextKey = new RawContextKey(
  "changesViewMode",
  "list"
  /* ChangesViewMode.List */
);
function isChangesFileItem(element) {
  return element.type === "file";
}
__name(isChangesFileItem, "isChangesFileItem");
function buildTreeChildren(items) {
  if (items.length === 0) {
    return [];
  }
  const root = { name: "", uri: URI.file("/"), children: /* @__PURE__ */ new Map(), files: [] };
  for (const item of items) {
    const dirPath = dirname(item.uri.path);
    const segments = dirPath.split("/").filter(Boolean);
    let current = root;
    let currentPath = "";
    for (const segment of segments) {
      currentPath += "/" + segment;
      if (!current.children.has(segment)) {
        current.children.set(segment, {
          name: segment,
          uri: item.uri.with({ path: currentPath }),
          children: /* @__PURE__ */ new Map(),
          files: []
        });
      }
      current = current.children.get(segment);
    }
    current.files.push(item);
  }
  function convert(node) {
    const result = [];
    for (const [, child] of node.children) {
      const folderElement = { type: "folder", uri: child.uri, name: child.name };
      const folderChildren = convert(child);
      result.push({
        element: folderElement,
        children: folderChildren,
        collapsible: true,
        collapsed: false
      });
    }
    for (const file of node.files) {
      result.push({
        element: file,
        collapsible: false
      });
    }
    return result;
  }
  __name(convert, "convert");
  return convert(root);
}
__name(buildTreeChildren, "buildTreeChildren");
let ChangesViewPane = class ChangesViewPane2 extends ViewPane {
  static {
    __name(this, "ChangesViewPane");
  }
  get viewMode() {
    return this.viewModeObs.get();
  }
  set viewMode(mode) {
    if (this.viewModeObs.get() === mode) {
      return;
    }
    this.viewModeObs.set(mode, void 0);
    this.viewModeContextKey.set(mode);
    this.storageService.store(
      "changesView.viewMode",
      mode,
      1,
      0
      /* StorageTarget.USER */
    );
  }
  get activeSessionHasChanges() {
    return this.activeSessionHasChangesObs;
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, chatEditingService, editorService, activityService, agentSessionsService, sessionManagementService, labelService, storageService, commandService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.chatEditingService = chatEditingService;
    this.editorService = editorService;
    this.activityService = activityService;
    this.agentSessionsService = agentSessionsService;
    this.sessionManagementService = sessionManagementService;
    this.labelService = labelService;
    this.storageService = storageService;
    this.commandService = commandService;
    this.renderDisposables = this._register(new DisposableStore());
    this.currentBodyHeight = 0;
    this.currentBodyWidth = 0;
    this.badgeDisposable = this._register(new MutableDisposable());
    const storedMode = this.storageService.get(
      "changesView.viewMode",
      1
      /* StorageScope.WORKSPACE */
    );
    const initialMode = storedMode === "tree" ? "tree" : "list";
    this.viewModeObs = observableValue(this, initialMode);
    this.viewModeContextKey = changesViewModeContextKey.bindTo(contextKeyService);
    this.viewModeContextKey.set(initialMode);
    this.activeSession = derivedOpts({
      equalsFn: /* @__PURE__ */ __name((a, b) => isEqual(a?.resource, b?.resource), "equalsFn")
    }, (reader) => {
      const activeSession = this.sessionManagementService.activeSession.read(reader);
      if (!activeSession?.resource) {
        return void 0;
      }
      return {
        resource: activeSession.resource,
        sessionType: getChatSessionType(activeSession.resource)
      };
    }).recomputeInitiallyAndOnChange(this._store);
    this.activeSessionFileCountObs = this.createActiveSessionFileCountObservable();
    this.activeSessionHasChangesObs = this.activeSessionFileCountObs.map((fileCount) => fileCount > 0).recomputeInitiallyAndOnChange(this._store);
    this.registerBadgeTracking();
    const viewSessionTypeKey = this.scopedContextKeyService.createKey(ChatContextKeys.agentSessionType.key, "");
    this._register(autorun((reader) => {
      const activeSession = this.activeSession.read(reader);
      viewSessionTypeKey.set(activeSession?.sessionType ?? "");
    }));
  }
  registerBadgeTracking() {
    this._register(autorun((reader) => {
      const fileCount = this.activeSessionFileCountObs.read(reader);
      this.updateBadge(fileCount);
    }));
  }
  createActiveSessionFileCountObservable() {
    const activeSessionResource = this.activeSession.map((a) => a?.resource);
    const sessionsChangedSignal = observableFromEvent(this, this.agentSessionsService.model.onDidChangeSessions, () => ({}));
    const sessionFileChangesObs = derived((reader) => {
      const sessionResource = activeSessionResource.read(reader);
      sessionsChangedSignal.read(reader);
      if (!sessionResource) {
        return Iterable.empty();
      }
      const model = this.agentSessionsService.getSession(sessionResource);
      return model?.changes instanceof Array ? model.changes : Iterable.empty();
    });
    return derived((reader) => {
      const activeSession = this.activeSession.read(reader);
      if (!activeSession) {
        return 0;
      }
      const isBackgroundSession = activeSession.sessionType === AgentSessionProviders.Background;
      let editingSessionCount = 0;
      if (!isBackgroundSession) {
        const sessions = this.chatEditingService.editingSessionsObs.read(reader);
        const session = sessions.find((candidate) => isEqual(candidate.chatSessionResource, activeSession.resource));
        editingSessionCount = session ? session.entries.read(reader).length : 0;
      }
      const sessionFiles = [...sessionFileChangesObs.read(reader)];
      const sessionFilesCount = sessionFiles.length;
      return editingSessionCount + sessionFilesCount;
    }).recomputeInitiallyAndOnChange(this._store);
  }
  updateBadge(fileCount) {
    if (fileCount > 0) {
      const message = fileCount === 1 ? localize("changesView.oneFileChanged", "1 file changed") : localize("changesView.filesChanged", "{0} files changed", fileCount);
      this.badgeDisposable.value = this.activityService.showViewActivity(CHANGES_VIEW_ID, { badge: new NumberBadge(fileCount, () => message) });
    } else {
      this.badgeDisposable.clear();
    }
  }
  renderBody(container) {
    super.renderBody(container);
    this.bodyContainer = dom.append(container, $(".changes-view-body"));
    this.welcomeContainer = dom.append(this.bodyContainer, $(".changes-welcome"));
    const welcomeIcon = dom.append(this.welcomeContainer, $(".changes-welcome-icon"));
    welcomeIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.diffMultiple));
    const welcomeMessage = dom.append(this.welcomeContainer, $(".changes-welcome-message"));
    welcomeMessage.textContent = localize("changesView.noChanges", "No files have been changed.");
    this.actionsContainer = dom.append(this.bodyContainer, $(".chat-editing-session-actions.outside-card"));
    this.contentContainer = dom.append(this.bodyContainer, $(".chat-editing-session-container.show-file-icons"));
    this._register(createFileIconThemableTreeContainerScope(this.contentContainer, this.themeService));
    const updateHasFileIcons = /* @__PURE__ */ __name(() => {
      this.contentContainer.classList.toggle("has-file-icons", this.themeService.getFileIconTheme().hasFileIcons);
    }, "updateHasFileIcons");
    updateHasFileIcons();
    this._register(this.themeService.onDidFileIconThemeChange(updateHasFileIcons));
    this.overviewContainer = dom.append(this.contentContainer, $(".chat-editing-session-overview"));
    this.summaryContainer = dom.append(this.overviewContainer, $(".changes-summary"));
    this.listContainer = dom.append(this.contentContainer, $(".chat-editing-session-list"));
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
    const activeSessionResource = this.activeSession.map((a) => a?.resource);
    const activeEditingSessionObs = derived((reader) => {
      const activeSession = this.activeSession.read(reader);
      if (!activeSession) {
        return void 0;
      }
      const sessions = this.chatEditingService.editingSessionsObs.read(reader);
      return sessions.find((candidate) => isEqual(candidate.chatSessionResource, activeSession.resource));
    });
    const editSessionEntriesObs = derived((reader) => {
      const activeSession = this.activeSession.read(reader);
      if (activeSession?.sessionType === AgentSessionProviders.Background) {
        return [];
      }
      const session = activeEditingSessionObs.read(reader);
      if (!session) {
        return [];
      }
      const entries = session.entries.read(reader);
      const items = [];
      for (const entry of entries) {
        const isDeletion = entry.isDeletion ?? false;
        const linesAdded = entry.linesAdded?.read(reader) ?? 0;
        const linesRemoved = entry.linesRemoved?.read(reader) ?? 0;
        items.push({
          type: "file",
          uri: entry.modifiedURI,
          originalUri: entry.originalURI,
          state: entry.state.read(reader),
          isDeletion,
          changeType: isDeletion ? "deleted" : "modified",
          linesAdded,
          linesRemoved
        });
      }
      return items;
    });
    const sessionsChangedSignal = observableFromEvent(this.renderDisposables, this.agentSessionsService.model.onDidChangeSessions, () => ({}));
    const sessionFileChangesObs = derived((reader) => {
      const sessionResource = activeSessionResource.read(reader);
      sessionsChangedSignal.read(reader);
      if (!sessionResource) {
        return Iterable.empty();
      }
      const model = this.agentSessionsService.getSession(sessionResource);
      return model?.changes instanceof Array ? model.changes : Iterable.empty();
    });
    const sessionFilesObs = derived((reader) => [...sessionFileChangesObs.read(reader)].map((entry) => {
      const isDeletion = entry.modifiedUri === void 0;
      const isAddition = entry.originalUri === void 0;
      return {
        type: "file",
        uri: isIChatSessionFileChange2(entry) ? entry.modifiedUri ?? entry.uri : entry.modifiedUri,
        originalUri: entry.originalUri,
        state: 1,
        isDeletion,
        changeType: isDeletion ? "deleted" : isAddition ? "added" : "modified",
        linesAdded: entry.insertions,
        linesRemoved: entry.deletions
      };
    }));
    const combinedEntriesObs = derived((reader) => {
      const editEntries = editSessionEntriesObs.read(reader);
      const sessionFiles = sessionFilesObs.read(reader);
      return [...editEntries, ...sessionFiles];
    });
    const topLevelStats = derived((reader) => {
      const editEntries = editSessionEntriesObs.read(reader);
      const sessionFiles = sessionFilesObs.read(reader);
      const entries = combinedEntriesObs.read(reader);
      let added = 0, removed = 0;
      for (const entry of entries) {
        added += entry.linesAdded;
        removed += entry.linesRemoved;
      }
      const files = entries.length;
      const isSessionMenu = editEntries.length === 0 && sessionFiles.length > 0;
      return { files, added, removed, isSessionMenu };
    });
    if (this.actionsContainer) {
      dom.clearNode(this.actionsContainer);
      const scopedContextKeyService = this.renderDisposables.add(this.contextKeyService.createScoped(this.actionsContainer));
      const scopedInstantiationService = this.renderDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
      const chatSessionTypeKey = scopedContextKeyService.createKey(ChatContextKeys.agentSessionType.key, "");
      this.renderDisposables.add(autorun((reader) => {
        const activeSession = this.activeSession.read(reader);
        chatSessionTypeKey.set(activeSession?.sessionType ?? "");
      }));
      this.renderDisposables.add(bindContextKey(hasUndecidedChatEditingResourceContextKey, scopedContextKeyService, (r) => {
        const session = activeEditingSessionObs.read(r);
        if (!session) {
          return false;
        }
        const entries = session.entries.read(r);
        return entries.some(
          (entry) => entry.state.read(r) === 0
          /* ModifiedFileEntryState.Modified */
        );
      }));
      this.renderDisposables.add(bindContextKey(hasAppliedChatEditsContextKey, scopedContextKeyService, (r) => {
        const session = activeEditingSessionObs.read(r);
        if (!session) {
          return false;
        }
        const entries = session.entries.read(r);
        return entries.length > 0;
      }));
      this.renderDisposables.add(bindContextKey(ChatContextKeys.hasAgentSessionChanges, scopedContextKeyService, (r) => {
        const { files } = topLevelStats.read(r);
        return files > 0;
      }));
      this.renderDisposables.add(autorun((reader) => {
        const sessionResource = activeSessionResource.read(reader);
        if (sessionResource) {
          const metadata = this.agentSessionsService.getSession(sessionResource)?.metadata;
          this.commandService.executeCommand("github.checkOpenPullRequest", sessionResource, metadata).catch(() => {
          });
        }
      }));
      this.renderDisposables.add(autorun((reader) => {
        const { isSessionMenu, added, removed } = topLevelStats.read(reader);
        const sessionResource = activeSessionResource.read(reader);
        const menuId = isSessionMenu ? MenuId.ChatEditingSessionChangesToolbar : MenuId.ChatEditingWidgetToolbar;
        reader.store.add(scopedInstantiationService.createInstance(MenuWorkbenchButtonBar, this.actionsContainer, menuId, {
          telemetrySource: "changesView",
          menuOptions: isSessionMenu && sessionResource ? { args: [sessionResource, this.agentSessionsService.getSession(sessionResource)?.metadata] } : { shouldForwardArgs: true },
          buttonConfigProvider: /* @__PURE__ */ __name((action) => {
            if (action.id === "chatEditing.viewChanges" || action.id === "chatEditing.viewPreviousEdits" || action.id === "chatEditing.viewAllSessionChanges" || action.id === "chat.openSessionWorktreeInVSCode") {
              const diffStatsLabel = new MarkdownString(`<span class="working-set-lines-added">+${added}</span>&nbsp;<span class="working-set-lines-removed">-${removed}</span>`, { supportHtml: true });
              return { showIcon: true, showLabel: true, isSecondary: true, customClass: "working-set-diff-stats", customLabel: diffStatsLabel };
            }
            if (action.id === "github.createPullRequest" || action.id === "github.openPullRequest") {
              return { showIcon: true, showLabel: true, isSecondary: true, customClass: "flex-grow" };
            }
            if (action.id === "chatEditing.applyToParentRepo") {
              return { showIcon: true, showLabel: false, isSecondary: true };
            }
            if (action.id === "chatEditing.synchronizeChanges") {
              return { showIcon: true, showLabel: true, isSecondary: true };
            }
            return void 0;
          }, "buttonConfigProvider")
        }));
      }));
    }
    this.renderDisposables.add(autorun((reader) => {
      const { files } = topLevelStats.read(reader);
      const hasEntries = files > 0;
      dom.setVisibility(hasEntries, this.contentContainer);
      dom.setVisibility(hasEntries, this.actionsContainer);
      dom.setVisibility(!hasEntries, this.welcomeContainer);
    }));
    if (this.summaryContainer) {
      dom.clearNode(this.summaryContainer);
      const linesAddedSpan = dom.$(".working-set-lines-added");
      const linesRemovedSpan = dom.$(".working-set-lines-removed");
      this.summaryContainer.appendChild(linesAddedSpan);
      this.summaryContainer.appendChild(linesRemovedSpan);
      this.renderDisposables.add(autorun((reader) => {
        const { added, removed } = topLevelStats.read(reader);
        linesAddedSpan.textContent = `+${added}`;
        linesRemovedSpan.textContent = `-${removed}`;
      }));
    }
    if (!this.tree && this.listContainer) {
      const resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
      this.tree = this.instantiationService.createInstance(WorkbenchCompressibleObjectTree, "ChangesViewTree", this.listContainer, new ChangesTreeDelegate(), [this.instantiationService.createInstance(ChangesTreeRenderer, resourceLabels, MenuId.ChatEditingWidgetModifiedFilesToolbar)], {
        alwaysConsumeMouseWheel: false,
        accessibilityProvider: {
          getAriaLabel: /* @__PURE__ */ __name((element) => isChangesFileItem(element) ? basename(element.uri.path) : element.name, "getAriaLabel"),
          getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("changesViewTree", "Changes Tree"), "getWidgetAriaLabel")
        },
        dnd: {
          getDragURI: /* @__PURE__ */ __name((element) => element.uri.toString(), "getDragURI"),
          getDragLabel: /* @__PURE__ */ __name((elements) => {
            const uris = elements.map((e) => e.uri);
            if (uris.length === 1) {
              return this.labelService.getUriLabel(uris[0], { relative: true });
            }
            return `${uris.length}`;
          }, "getDragLabel"),
          dispose: /* @__PURE__ */ __name(() => {
          }, "dispose"),
          onDragOver: /* @__PURE__ */ __name(() => false, "onDragOver"),
          drop: /* @__PURE__ */ __name(() => {
          }, "drop"),
          onDragStart: /* @__PURE__ */ __name((data, originalEvent) => {
            try {
              const elements = data.getData();
              const uris = elements.filter(isChangesFileItem).map((e) => e.uri);
              this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, uris, originalEvent));
            } catch {
            }
          }, "onDragStart")
        },
        identityProvider: {
          getId: /* @__PURE__ */ __name((element) => element.uri.toString(), "getId")
        },
        compressionEnabled: true,
        twistieAdditionalCssClass: /* @__PURE__ */ __name((e) => {
          if (this.viewMode === "list") {
            return "force-no-twistie";
          }
          return isChangesFileItem(e) ? "force-no-twistie" : void 0;
        }, "twistieAdditionalCssClass")
      });
    }
    if (this.tree) {
      const tree = this.tree;
      const openFileItem = /* @__PURE__ */ __name((item, items, sideBySide) => {
        const { uri: modifiedFileUri, originalUri, isDeletion } = item;
        const currentIndex = items.indexOf(item);
        const navigation = {
          total: items.length,
          current: currentIndex,
          navigate: /* @__PURE__ */ __name((index) => {
            const target = items[index];
            if (target) {
              openFileItem(target, items, false);
            }
          }, "navigate")
        };
        const group = sideBySide ? SIDE_GROUP : MODAL_GROUP;
        if (isDeletion && originalUri) {
          this.editorService.openEditor({
            resource: originalUri,
            options: { modal: { navigation } }
          }, group);
          return;
        }
        if (originalUri) {
          this.editorService.openEditor({
            original: { resource: originalUri },
            modified: { resource: modifiedFileUri },
            options: { modal: { navigation } }
          }, group);
          return;
        }
        this.editorService.openEditor({
          resource: modifiedFileUri,
          options: { modal: { navigation } }
        }, group);
      }, "openFileItem");
      this.renderDisposables.add(tree.onDidOpen((e) => {
        if (!e.element || !isChangesFileItem(e.element)) {
          return;
        }
        const items = combinedEntriesObs.get();
        openFileItem(e.element, items, e.sideBySide);
      }));
    }
    this.renderDisposables.add(autorun((reader) => {
      const entries = combinedEntriesObs.read(reader);
      const viewMode = this.viewModeObs.read(reader);
      if (!this.tree) {
        return;
      }
      this.listContainer?.classList.toggle(
        "list-mode",
        viewMode === "list"
        /* ChangesViewMode.List */
      );
      if (viewMode === "tree") {
        const treeChildren = buildTreeChildren(entries);
        this.tree.setChildren(null, treeChildren);
      } else {
        const listChildren = entries.map((item) => ({
          element: item,
          collapsible: false
        }));
        this.tree.setChildren(null, listChildren);
      }
      this.layoutTree();
    }));
  }
  layoutTree() {
    if (!this.tree || !this.listContainer) {
      return;
    }
    const bodyHeight = this.currentBodyHeight;
    if (bodyHeight <= 0) {
      return;
    }
    const bodyPadding = 16;
    const actionsHeight = this.actionsContainer?.offsetHeight ?? 0;
    const actionsMargin = actionsHeight > 0 ? 8 : 0;
    const overviewHeight = this.overviewContainer?.offsetHeight ?? 0;
    const containerPadding = 8;
    const containerBorder = 2;
    const usedHeight = bodyPadding + actionsHeight + actionsMargin + overviewHeight + containerPadding + containerBorder;
    const availableHeight = Math.max(0, bodyHeight - usedHeight);
    const contentHeight = this.tree.contentHeight;
    const treeHeight = Math.min(availableHeight, contentHeight);
    this.tree.layout(treeHeight, this.currentBodyWidth);
    this.tree.getHTMLElement().style.height = `${treeHeight}px`;
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
ChangesViewPane = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IChatEditingService),
  __param(11, IEditorService),
  __param(12, IActivityService),
  __param(13, IAgentSessionsService),
  __param(14, ISessionsManagementService),
  __param(15, ILabelService),
  __param(16, IStorageService),
  __param(17, ICommandService)
], ChangesViewPane);
let ChangesViewPaneContainer = class ChangesViewPaneContainer2 extends ViewPaneContainer {
  static {
    __name(this, "ChangesViewPaneContainer");
  }
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService, logService) {
    super(CHANGES_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("changes-viewlet");
  }
};
ChangesViewPaneContainer = __decorate([
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
], ChangesViewPaneContainer);
class ChangesTreeDelegate {
  static {
    __name(this, "ChangesTreeDelegate");
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return ChangesTreeRenderer.TEMPLATE_ID;
  }
}
let ChangesTreeRenderer = class ChangesTreeRenderer2 {
  static {
    __name(this, "ChangesTreeRenderer");
  }
  static {
    ChangesTreeRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "changesTreeRenderer";
  }
  constructor(labels, menuId, instantiationService, contextKeyService, labelService) {
    this.labels = labels;
    this.menuId = menuId;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.labelService = labelService;
    this.templateId = ChangesTreeRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true, supportIcons: true }));
    const lineCountsContainer = $(".working-set-line-counts");
    const addedSpan = dom.$(".working-set-lines-added");
    const removedSpan = dom.$(".working-set-lines-removed");
    lineCountsContainer.appendChild(addedSpan);
    lineCountsContainer.appendChild(removedSpan);
    label.element.appendChild(lineCountsContainer);
    const decorationBadge = dom.$(".changes-decoration-badge");
    label.element.appendChild(decorationBadge);
    let toolbar;
    let contextKeyService;
    if (this.menuId) {
      const actionBarContainer = $(".chat-collapsible-list-action-bar");
      contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(actionBarContainer));
      const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
      toolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, this.menuId, { menuOptions: { shouldForwardArgs: true, arg: void 0 } }));
      label.element.appendChild(actionBarContainer);
    }
    return { templateDisposables, label, toolbar, contextKeyService, decorationBadge, addedSpan, removedSpan, lineCountsContainer };
  }
  renderElement(node, _index, templateData) {
    const element = node.element;
    templateData.label.element.style.display = "flex";
    if (isChangesFileItem(element)) {
      this.renderFileElement(element, templateData);
    } else {
      this.renderFolderElement(element, templateData);
    }
  }
  renderCompressedElements(node, _index, templateData) {
    const compressed = node.element;
    const lastElement = compressed.elements[compressed.elements.length - 1];
    templateData.label.element.style.display = "flex";
    if (isChangesFileItem(lastElement)) {
      this.renderFileElement(lastElement, templateData);
    } else {
      const label = compressed.elements.map((e) => isChangesFileItem(e) ? basename(e.uri.path) : e.name);
      templateData.label.setResource({ resource: lastElement.uri, name: label }, {
        fileKind: FileKind.FOLDER,
        separator: this.labelService.getSeparator(lastElement.uri.scheme)
      });
      templateData.decorationBadge.style.display = "none";
      templateData.lineCountsContainer.style.display = "none";
      if (templateData.toolbar) {
        templateData.toolbar.context = void 0;
      }
      if (templateData.contextKeyService) {
        chatEditingWidgetFileStateContextKey.bindTo(templateData.contextKeyService).set(void 0);
      }
    }
  }
  renderFileElement(data, templateData) {
    templateData.label.setFile(data.uri, {
      fileKind: FileKind.FILE,
      fileDecorations: void 0,
      strikethrough: data.changeType === "deleted",
      hidePath: true
    });
    templateData.lineCountsContainer.style.display = "";
    templateData.decorationBadge.style.display = "";
    const badge = templateData.decorationBadge;
    badge.className = "changes-decoration-badge";
    switch (data.changeType) {
      case "added":
        badge.textContent = "A";
        badge.classList.add("added");
        break;
      case "deleted":
        badge.textContent = "D";
        badge.classList.add("deleted");
        break;
      case "modified":
      default:
        badge.textContent = "M";
        badge.classList.add("modified");
        break;
    }
    templateData.addedSpan.textContent = `+${data.linesAdded}`;
    templateData.removedSpan.textContent = `-${data.linesRemoved}`;
    templateData.label.element.querySelector(".monaco-icon-name-container")?.classList.add("modified");
    if (templateData.toolbar) {
      templateData.toolbar.context = data.uri;
    }
    if (templateData.contextKeyService) {
      chatEditingWidgetFileStateContextKey.bindTo(templateData.contextKeyService).set(data.state);
    }
  }
  renderFolderElement(data, templateData) {
    templateData.label.setFile(data.uri, {
      fileKind: FileKind.FOLDER
    });
    templateData.decorationBadge.style.display = "none";
    templateData.lineCountsContainer.style.display = "none";
    if (templateData.toolbar) {
      templateData.toolbar.context = void 0;
    }
    if (templateData.contextKeyService) {
      chatEditingWidgetFileStateContextKey.bindTo(templateData.contextKeyService).set(void 0);
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};
ChangesTreeRenderer = ChangesTreeRenderer_1 = __decorate([
  __param(2, IInstantiationService),
  __param(3, IContextKeyService),
  __param(4, ILabelService)
], ChangesTreeRenderer);
class SetChangesListViewModeAction extends ViewAction {
  static {
    __name(this, "SetChangesListViewModeAction");
  }
  constructor() {
    super({
      id: "workbench.changesView.action.setListViewMode",
      title: localize("setListViewMode", "View as List"),
      viewId: CHANGES_VIEW_ID,
      f1: false,
      icon: Codicon.listTree,
      toggled: changesViewModeContextKey.isEqualTo(
        "list"
        /* ChangesViewMode.List */
      ),
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals("view", CHANGES_VIEW_ID),
        group: "1_viewmode",
        order: 1
      }
    });
  }
  async runInView(_, view) {
    view.viewMode = "list";
  }
}
class SetChangesTreeViewModeAction extends ViewAction {
  static {
    __name(this, "SetChangesTreeViewModeAction");
  }
  constructor() {
    super({
      id: "workbench.changesView.action.setTreeViewMode",
      title: localize("setTreeViewMode", "View as Tree"),
      viewId: CHANGES_VIEW_ID,
      f1: false,
      icon: Codicon.listFlat,
      toggled: changesViewModeContextKey.isEqualTo(
        "tree"
        /* ChangesViewMode.Tree */
      ),
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals("view", CHANGES_VIEW_ID),
        group: "1_viewmode",
        order: 2
      }
    });
  }
  async runInView(_, view) {
    view.viewMode = "tree";
  }
}
registerAction2(SetChangesListViewModeAction);
registerAction2(SetChangesTreeViewModeAction);
export {
  CHANGES_VIEW_CONTAINER_ID,
  CHANGES_VIEW_ID,
  ChangesViewMode,
  ChangesViewPane,
  ChangesViewPaneContainer
};
//# sourceMappingURL=changesView.js.map
