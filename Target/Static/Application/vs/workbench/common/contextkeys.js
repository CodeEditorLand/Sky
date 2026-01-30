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
var AbstractResourceContextKey_1;
import { DisposableStore } from "../../base/common/lifecycle.js";
import { localize } from "../../nls.js";
import { IContextKeyService, RawContextKey } from "../../platform/contextkey/common/contextkey.js";
import { basename, dirname, extname, isEqual } from "../../base/common/resources.js";
import { ILanguageService } from "../../editor/common/languages/language.js";
import { IFileService } from "../../platform/files/common/files.js";
import { IModelService } from "../../editor/common/services/model.js";
import { Schemas } from "../../base/common/network.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "./editor.js";
import { DiffEditorInput } from "./editor/diffEditorInput.js";
const WorkbenchStateContext = new RawContextKey("workbenchState", void 0, { type: "string", description: localize("workbenchState", "The kind of workspace opened in the window, either 'empty' (no workspace), 'folder' (single folder) or 'workspace' (multi-root workspace)") });
const WorkspaceFolderCountContext = new RawContextKey("workspaceFolderCount", 0, localize("workspaceFolderCount", "The number of root folders in the workspace"));
const OpenFolderWorkspaceSupportContext = new RawContextKey("openFolderWorkspaceSupport", true, true);
const EnterMultiRootWorkspaceSupportContext = new RawContextKey("enterMultiRootWorkspaceSupport", true, true);
const EmptyWorkspaceSupportContext = new RawContextKey("emptyWorkspaceSupport", true, true);
const DirtyWorkingCopiesContext = new RawContextKey("dirtyWorkingCopies", false, localize("dirtyWorkingCopies", "Whether there are any working copies with unsaved changes"));
const RemoteNameContext = new RawContextKey("remoteName", "", localize("remoteName", "The name of the remote the window is connected to or an empty string if not connected to any remote"));
const VirtualWorkspaceContext = new RawContextKey("virtualWorkspace", "", localize("virtualWorkspace", "The scheme of the current workspace is from a virtual file system or an empty string."));
const TemporaryWorkspaceContext = new RawContextKey("temporaryWorkspace", false, localize("temporaryWorkspace", "The scheme of the current workspace is from a temporary file system."));
const HasWebFileSystemAccess = new RawContextKey("hasWebFileSystemAccess", false, true);
const EmbedderIdentifierContext = new RawContextKey("embedderIdentifier", void 0, localize("embedderIdentifier", "The identifier of the embedder according to the product service, if one is defined"));
const InAutomationContext = new RawContextKey("inAutomation", false, localize("inAutomation", "Whether VS Code is running under automation/smoke test"));
const IsMainWindowFullscreenContext = new RawContextKey("isFullscreen", false, localize("isFullscreen", "Whether the main window is in fullscreen mode"));
const IsAuxiliaryWindowFocusedContext = new RawContextKey("isAuxiliaryWindowFocusedContext", false, localize("isAuxiliaryWindowFocusedContext", "Whether an auxiliary window is focused"));
const IsWindowAlwaysOnTopContext = new RawContextKey("isWindowAlwaysOnTop", false, localize("isWindowAlwaysOnTop", "Whether the window is always on top"));
const IsAuxiliaryWindowContext = new RawContextKey("isAuxiliaryWindow", false, localize("isAuxiliaryWindow", "Window is an auxiliary window"));
const ActiveEditorDirtyContext = new RawContextKey("activeEditorIsDirty", false, localize("activeEditorIsDirty", "Whether the active editor has unsaved changes"));
const ActiveEditorPinnedContext = new RawContextKey("activeEditorIsNotPreview", false, localize("activeEditorIsNotPreview", "Whether the active editor is not in preview mode"));
const ActiveEditorFirstInGroupContext = new RawContextKey("activeEditorIsFirstInGroup", false, localize("activeEditorIsFirstInGroup", "Whether the active editor is the first one in its group"));
const ActiveEditorLastInGroupContext = new RawContextKey("activeEditorIsLastInGroup", false, localize("activeEditorIsLastInGroup", "Whether the active editor is the last one in its group"));
const ActiveEditorStickyContext = new RawContextKey("activeEditorIsPinned", false, localize("activeEditorIsPinned", "Whether the active editor is pinned"));
const ActiveEditorReadonlyContext = new RawContextKey("activeEditorIsReadonly", false, localize("activeEditorIsReadonly", "Whether the active editor is read-only"));
const ActiveCompareEditorCanSwapContext = new RawContextKey("activeCompareEditorCanSwap", false, localize("activeCompareEditorCanSwap", "Whether the active compare editor can swap sides"));
const ActiveEditorCanToggleReadonlyContext = new RawContextKey("activeEditorCanToggleReadonly", true, localize("activeEditorCanToggleReadonly", "Whether the active editor can toggle between being read-only or writeable"));
const ActiveEditorCanRevertContext = new RawContextKey("activeEditorCanRevert", false, localize("activeEditorCanRevert", "Whether the active editor can revert"));
const ActiveEditorCanSplitInGroupContext = new RawContextKey("activeEditorCanSplitInGroup", true);
const ActiveEditorContext = new RawContextKey("activeEditor", null, { type: "string", description: localize("activeEditor", "The identifier of the active editor") });
const ActiveEditorAvailableEditorIdsContext = new RawContextKey("activeEditorAvailableEditorIds", "", localize("activeEditorAvailableEditorIds", "The available editor identifiers that are usable for the active editor"));
const TextCompareEditorVisibleContext = new RawContextKey("textCompareEditorVisible", false, localize("textCompareEditorVisible", "Whether a text compare editor is visible"));
const TextCompareEditorActiveContext = new RawContextKey("textCompareEditorActive", false, localize("textCompareEditorActive", "Whether a text compare editor is active"));
const SideBySideEditorActiveContext = new RawContextKey("sideBySideEditorActive", false, localize("sideBySideEditorActive", "Whether a side by side editor is active"));
const EditorGroupEditorsCountContext = new RawContextKey("groupEditorsCount", 0, localize("groupEditorsCount", "The number of opened editor groups"));
const ActiveEditorGroupEmptyContext = new RawContextKey("activeEditorGroupEmpty", false, localize("activeEditorGroupEmpty", "Whether the active editor group is empty"));
const ActiveEditorGroupIndexContext = new RawContextKey("activeEditorGroupIndex", 0, localize("activeEditorGroupIndex", "The index of the active editor group"));
const ActiveEditorGroupLastContext = new RawContextKey("activeEditorGroupLast", false, localize("activeEditorGroupLast", "Whether the active editor group is the last group"));
const ActiveEditorGroupLockedContext = new RawContextKey("activeEditorGroupLocked", false, localize("activeEditorGroupLocked", "Whether the active editor group is locked"));
const MultipleEditorGroupsContext = new RawContextKey("multipleEditorGroups", false, localize("multipleEditorGroups", "Whether there are multiple editor groups opened"));
const SingleEditorGroupsContext = MultipleEditorGroupsContext.toNegated();
const MultipleEditorsSelectedInGroupContext = new RawContextKey("multipleEditorsSelectedInGroup", false, localize("multipleEditorsSelectedInGroup", "Whether multiple editors have been selected in an editor group"));
const TwoEditorsSelectedInGroupContext = new RawContextKey("twoEditorsSelectedInGroup", false, localize("twoEditorsSelectedInGroup", "Whether exactly two editors have been selected in an editor group"));
const SelectedEditorsInGroupFileOrUntitledResourceContextKey = new RawContextKey("SelectedEditorsInGroupFileOrUntitledResourceContextKey", true, localize("SelectedEditorsInGroupFileOrUntitledResourceContextKey", "Whether all selected editors in a group have a file or untitled resource associated"));
const EditorPartMultipleEditorGroupsContext = new RawContextKey("editorPartMultipleEditorGroups", false, localize("editorPartMultipleEditorGroups", "Whether there are multiple editor groups opened in an editor part"));
const EditorPartSingleEditorGroupsContext = EditorPartMultipleEditorGroupsContext.toNegated();
const EditorPartMaximizedEditorGroupContext = new RawContextKey("editorPartMaximizedEditorGroup", false, localize("editorPartEditorGroupMaximized", "Editor Part has a maximized group"));
const EditorsVisibleContext = new RawContextKey("editorIsOpen", false, localize("editorIsOpen", "Whether an editor is open"));
const InEditorZenModeContext = new RawContextKey("inZenMode", false, localize("inZenMode", "Whether Zen mode is enabled"));
const IsMainEditorCenteredLayoutContext = new RawContextKey("isCenteredLayout", false, localize("isMainEditorCenteredLayout", "Whether centered layout is enabled for the main editor"));
const SplitEditorsVertically = new RawContextKey("splitEditorsVertically", false, localize("splitEditorsVertically", "Whether editors split vertically"));
const MainEditorAreaVisibleContext = new RawContextKey("mainEditorAreaVisible", true, localize("mainEditorAreaVisible", "Whether the editor area in the main window is visible"));
const EditorTabsVisibleContext = new RawContextKey("editorTabsVisible", true, localize("editorTabsVisible", "Whether editor tabs are visible"));
const SideBarVisibleContext = new RawContextKey("sideBarVisible", false, localize("sideBarVisible", "Whether the sidebar is visible"));
const SidebarFocusContext = new RawContextKey("sideBarFocus", false, localize("sideBarFocus", "Whether the sidebar has keyboard focus"));
const ActiveViewletContext = new RawContextKey("activeViewlet", "", localize("activeViewlet", "The identifier of the active viewlet"));
const StatusBarFocused = new RawContextKey("statusBarFocused", false, localize("statusBarFocused", "Whether the status bar has keyboard focus"));
const TitleBarStyleContext = new RawContextKey("titleBarStyle", "custom", localize("titleBarStyle", "Style of the window title bar"));
const TitleBarVisibleContext = new RawContextKey("titleBarVisible", false, localize("titleBarVisible", "Whether the title bar is visible"));
const IsCompactTitleBarContext = new RawContextKey("isCompactTitleBar", false, localize("isCompactTitleBar", "Title bar is in compact mode"));
const BannerFocused = new RawContextKey("bannerFocused", false, localize("bannerFocused", "Whether the banner has keyboard focus"));
const NotificationFocusedContext = new RawContextKey("notificationFocus", true, localize("notificationFocus", "Whether a notification has keyboard focus"));
const NotificationsCenterVisibleContext = new RawContextKey("notificationCenterVisible", false, localize("notificationCenterVisible", "Whether the notifications center is visible"));
const NotificationsToastsVisibleContext = new RawContextKey("notificationToastsVisible", false, localize("notificationToastsVisible", "Whether a notification toast is visible"));
const ActiveAuxiliaryContext = new RawContextKey("activeAuxiliary", "", localize("activeAuxiliary", "The identifier of the active auxiliary panel"));
const AuxiliaryBarFocusContext = new RawContextKey("auxiliaryBarFocus", false, localize("auxiliaryBarFocus", "Whether the auxiliary bar has keyboard focus"));
const AuxiliaryBarVisibleContext = new RawContextKey("auxiliaryBarVisible", false, localize("auxiliaryBarVisible", "Whether the auxiliary bar is visible"));
const AuxiliaryBarMaximizedContext = new RawContextKey("auxiliaryBarMaximized", false, localize("auxiliaryBarMaximized", "Whether the auxiliary bar is maximized"));
const ActivePanelContext = new RawContextKey("activePanel", "", localize("activePanel", "The identifier of the active panel"));
const PanelFocusContext = new RawContextKey("panelFocus", false, localize("panelFocus", "Whether the panel has keyboard focus"));
const PanelPositionContext = new RawContextKey("panelPosition", "bottom", localize("panelPosition", "The position of the panel, always 'bottom'"));
const PanelAlignmentContext = new RawContextKey("panelAlignment", "center", localize("panelAlignment", "The alignment of the panel, either 'center', 'left', 'right' or 'justify'"));
const PanelVisibleContext = new RawContextKey("panelVisible", false, localize("panelVisible", "Whether the panel is visible"));
const PanelMaximizedContext = new RawContextKey("panelMaximized", false, localize("panelMaximized", "Whether the panel is maximized"));
const FocusedViewContext = new RawContextKey("focusedView", "", localize("focusedView", "The identifier of the view that has keyboard focus"));
function getVisbileViewContextKey(viewId) {
  return `view.${viewId}.visible`;
}
__name(getVisbileViewContextKey, "getVisbileViewContextKey");
let AbstractResourceContextKey = class AbstractResourceContextKey2 {
  static {
    __name(this, "AbstractResourceContextKey");
  }
  static {
    AbstractResourceContextKey_1 = this;
  }
  static {
    this.Scheme = new RawContextKey("resourceScheme", void 0, { type: "string", description: localize("resourceScheme", "The scheme of the resource") });
  }
  static {
    this.Filename = new RawContextKey("resourceFilename", void 0, { type: "string", description: localize("resourceFilename", "The file name of the resource") });
  }
  static {
    this.Dirname = new RawContextKey("resourceDirname", void 0, { type: "string", description: localize("resourceDirname", "The folder name the resource is contained in") });
  }
  static {
    this.Path = new RawContextKey("resourcePath", void 0, { type: "string", description: localize("resourcePath", "The full path of the resource") });
  }
  static {
    this.LangId = new RawContextKey("resourceLangId", void 0, { type: "string", description: localize("resourceLangId", "The language identifier of the resource") });
  }
  static {
    this.Resource = new RawContextKey("resource", void 0, { type: "URI", description: localize("resource", "The full value of the resource including scheme and path") });
  }
  static {
    this.Extension = new RawContextKey("resourceExtname", void 0, { type: "string", description: localize("resourceExtname", "The extension name of the resource") });
  }
  static {
    this.HasResource = new RawContextKey("resourceSet", void 0, { type: "boolean", description: localize("resourceSet", "Whether a resource is present or not") });
  }
  static {
    this.IsFileSystemResource = new RawContextKey("isFileSystemResource", void 0, { type: "boolean", description: localize("isFileSystemResource", "Whether the resource is backed by a file system provider") });
  }
  constructor(_contextKeyService, _fileService, _languageService, _modelService) {
    this._contextKeyService = _contextKeyService;
    this._fileService = _fileService;
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._schemeKey = AbstractResourceContextKey_1.Scheme.bindTo(this._contextKeyService);
    this._filenameKey = AbstractResourceContextKey_1.Filename.bindTo(this._contextKeyService);
    this._dirnameKey = AbstractResourceContextKey_1.Dirname.bindTo(this._contextKeyService);
    this._pathKey = AbstractResourceContextKey_1.Path.bindTo(this._contextKeyService);
    this._langIdKey = AbstractResourceContextKey_1.LangId.bindTo(this._contextKeyService);
    this._resourceKey = AbstractResourceContextKey_1.Resource.bindTo(this._contextKeyService);
    this._extensionKey = AbstractResourceContextKey_1.Extension.bindTo(this._contextKeyService);
    this._hasResource = AbstractResourceContextKey_1.HasResource.bindTo(this._contextKeyService);
    this._isFileSystemResource = AbstractResourceContextKey_1.IsFileSystemResource.bindTo(this._contextKeyService);
  }
  _setLangId() {
    const value = this.get();
    if (!value) {
      this._langIdKey.set(null);
      return;
    }
    const langId = this._modelService.getModel(value)?.getLanguageId() ?? this._languageService.guessLanguageIdByFilepathOrFirstLine(value);
    this._langIdKey.set(langId);
  }
  set(value) {
    value = value ?? void 0;
    if (isEqual(this._value, value)) {
      return;
    }
    this._value = value;
    this._contextKeyService.bufferChangeEvents(() => {
      this._resourceKey.set(value ? value.toString() : null);
      this._schemeKey.set(value ? value.scheme : null);
      this._filenameKey.set(value ? basename(value) : null);
      this._dirnameKey.set(value ? this.uriToPath(dirname(value)) : null);
      this._pathKey.set(value ? this.uriToPath(value) : null);
      this._setLangId();
      this._extensionKey.set(value ? extname(value) : null);
      this._hasResource.set(Boolean(value));
      this._isFileSystemResource.set(value ? this._fileService.hasProvider(value) : false);
    });
  }
  uriToPath(uri) {
    if (uri.scheme === Schemas.file) {
      return uri.fsPath;
    }
    return uri.path;
  }
  reset() {
    this._value = void 0;
    this._contextKeyService.bufferChangeEvents(() => {
      this._resourceKey.reset();
      this._schemeKey.reset();
      this._filenameKey.reset();
      this._dirnameKey.reset();
      this._pathKey.reset();
      this._langIdKey.reset();
      this._extensionKey.reset();
      this._hasResource.reset();
      this._isFileSystemResource.reset();
    });
  }
  get() {
    return this._value;
  }
};
AbstractResourceContextKey = AbstractResourceContextKey_1 = __decorate([
  __param(0, IContextKeyService),
  __param(1, IFileService),
  __param(2, ILanguageService),
  __param(3, IModelService)
], AbstractResourceContextKey);
let ResourceContextKey = class ResourceContextKey2 extends AbstractResourceContextKey {
  static {
    __name(this, "ResourceContextKey");
  }
  constructor(contextKeyService, fileService, languageService, modelService) {
    super(contextKeyService, fileService, languageService, modelService);
    this._disposables = new DisposableStore();
    this._disposables.add(fileService.onDidChangeFileSystemProviderRegistrations(() => {
      const resource = this.get();
      this._isFileSystemResource.set(Boolean(resource && fileService.hasProvider(resource)));
    }));
    this._disposables.add(modelService.onModelAdded((model) => {
      if (isEqual(model.uri, this.get())) {
        this._setLangId();
      }
    }));
    this._disposables.add(modelService.onModelLanguageChanged((e) => {
      if (isEqual(e.model.uri, this.get())) {
        this._setLangId();
      }
    }));
  }
  dispose() {
    this._disposables.dispose();
  }
};
ResourceContextKey = __decorate([
  __param(0, IContextKeyService),
  __param(1, IFileService),
  __param(2, ILanguageService),
  __param(3, IModelService)
], ResourceContextKey);
class StaticResourceContextKey extends AbstractResourceContextKey {
  static {
    __name(this, "StaticResourceContextKey");
  }
}
function applyAvailableEditorIds(contextKey, editor, editorResolverService) {
  if (!editor) {
    contextKey.set("");
    return;
  }
  const editors = getAvailableEditorIds(editor, editorResolverService);
  contextKey.set(editors.join(","));
}
__name(applyAvailableEditorIds, "applyAvailableEditorIds");
function getAvailableEditorIds(editor, editorResolverService) {
  if (editor.resource?.scheme === Schemas.untitled && editor.editorId !== DEFAULT_EDITOR_ASSOCIATION.id) {
    return [];
  }
  if (editor instanceof DiffEditorInput) {
    const original = getAvailableEditorIds(editor.original, editorResolverService);
    const modified = new Set(getAvailableEditorIds(editor.modified, editorResolverService));
    return original.filter((editor2) => modified.has(editor2));
  }
  if (editor.resource) {
    return editorResolverService.getEditors(editor.resource).map((editor2) => editor2.id);
  }
  return [];
}
__name(getAvailableEditorIds, "getAvailableEditorIds");
export {
  ActiveAuxiliaryContext,
  ActiveCompareEditorCanSwapContext,
  ActiveEditorAvailableEditorIdsContext,
  ActiveEditorCanRevertContext,
  ActiveEditorCanSplitInGroupContext,
  ActiveEditorCanToggleReadonlyContext,
  ActiveEditorContext,
  ActiveEditorDirtyContext,
  ActiveEditorFirstInGroupContext,
  ActiveEditorGroupEmptyContext,
  ActiveEditorGroupIndexContext,
  ActiveEditorGroupLastContext,
  ActiveEditorGroupLockedContext,
  ActiveEditorLastInGroupContext,
  ActiveEditorPinnedContext,
  ActiveEditorReadonlyContext,
  ActiveEditorStickyContext,
  ActivePanelContext,
  ActiveViewletContext,
  AuxiliaryBarFocusContext,
  AuxiliaryBarMaximizedContext,
  AuxiliaryBarVisibleContext,
  BannerFocused,
  DirtyWorkingCopiesContext,
  EditorGroupEditorsCountContext,
  EditorPartMaximizedEditorGroupContext,
  EditorPartMultipleEditorGroupsContext,
  EditorPartSingleEditorGroupsContext,
  EditorTabsVisibleContext,
  EditorsVisibleContext,
  EmbedderIdentifierContext,
  EmptyWorkspaceSupportContext,
  EnterMultiRootWorkspaceSupportContext,
  FocusedViewContext,
  HasWebFileSystemAccess,
  InAutomationContext,
  InEditorZenModeContext,
  IsAuxiliaryWindowContext,
  IsAuxiliaryWindowFocusedContext,
  IsCompactTitleBarContext,
  IsMainEditorCenteredLayoutContext,
  IsMainWindowFullscreenContext,
  IsWindowAlwaysOnTopContext,
  MainEditorAreaVisibleContext,
  MultipleEditorGroupsContext,
  MultipleEditorsSelectedInGroupContext,
  NotificationFocusedContext,
  NotificationsCenterVisibleContext,
  NotificationsToastsVisibleContext,
  OpenFolderWorkspaceSupportContext,
  PanelAlignmentContext,
  PanelFocusContext,
  PanelMaximizedContext,
  PanelPositionContext,
  PanelVisibleContext,
  RemoteNameContext,
  ResourceContextKey,
  SelectedEditorsInGroupFileOrUntitledResourceContextKey,
  SideBarVisibleContext,
  SideBySideEditorActiveContext,
  SidebarFocusContext,
  SingleEditorGroupsContext,
  SplitEditorsVertically,
  StaticResourceContextKey,
  StatusBarFocused,
  TemporaryWorkspaceContext,
  TextCompareEditorActiveContext,
  TextCompareEditorVisibleContext,
  TitleBarStyleContext,
  TitleBarVisibleContext,
  TwoEditorsSelectedInGroupContext,
  VirtualWorkspaceContext,
  WorkbenchStateContext,
  WorkspaceFolderCountContext,
  applyAvailableEditorIds,
  getVisbileViewContextKey
};
//# sourceMappingURL=contextkeys.js.map
