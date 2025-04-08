var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { DisposableStore } from "../../base/common/lifecycle.js";
import { URI } from "../../base/common/uri.js";
import { localize } from "../../nls.js";
import { IContextKeyService, IContextKey, RawContextKey } from "../../platform/contextkey/common/contextkey.js";
import { basename, dirname, extname, isEqual } from "../../base/common/resources.js";
import { ILanguageService } from "../../editor/common/languages/language.js";
import { IFileService } from "../../platform/files/common/files.js";
import { IModelService } from "../../editor/common/services/model.js";
import { Schemas } from "../../base/common/network.js";
import { EditorInput } from "./editor/editorInput.js";
import { IEditorResolverService } from "../services/editor/common/editorResolverService.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "./editor.js";
const WorkbenchStateContext = new RawContextKey("workbenchState", void 0, { type: "string", description: localize("workbenchState", "The kind of workspace opened in the window, either 'empty' (no workspace), 'folder' (single folder) or 'workspace' (multi-root workspace)") });
const WorkspaceFolderCountContext = new RawContextKey("workspaceFolderCount", 0, localize("workspaceFolderCount", "The number of root folders in the workspace"));
const OpenFolderWorkspaceSupportContext = new RawContextKey("openFolderWorkspaceSupport", true, true);
const EnterMultiRootWorkspaceSupportContext = new RawContextKey("enterMultiRootWorkspaceSupport", true, true);
const EmptyWorkspaceSupportContext = new RawContextKey("emptyWorkspaceSupport", true, true);
const DirtyWorkingCopiesContext = new RawContextKey("dirtyWorkingCopies", false, localize("dirtyWorkingCopies", "Whether there are any working copies with unsaved changes"));
const RemoteNameContext = new RawContextKey("remoteName", "", localize("remoteName", "The name of the remote the window is connected to or an empty string if not connected to any remote"));
const VirtualWorkspaceContext = new RawContextKey("virtualWorkspace", "", localize("virtualWorkspace", "The scheme of the current workspace is from a virtual file system or an empty string."));
const TemporaryWorkspaceContext = new RawContextKey("temporaryWorkspace", false, localize("temporaryWorkspace", "The scheme of the current workspace is from a temporary file system."));
const IsMainWindowFullscreenContext = new RawContextKey("isFullscreen", false, localize("isFullscreen", "Whether the main window is in fullscreen mode"));
const IsAuxiliaryWindowFocusedContext = new RawContextKey("isAuxiliaryWindowFocusedContext", false, localize("isAuxiliaryWindowFocusedContext", "Whether an auxiliary window is focused"));
const HasWebFileSystemAccess = new RawContextKey("hasWebFileSystemAccess", false, true);
const EmbedderIdentifierContext = new RawContextKey("embedderIdentifier", void 0, localize("embedderIdentifier", "The identifier of the embedder according to the product service, if one is defined"));
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
const IsAuxiliaryEditorPartContext = new RawContextKey("isAuxiliaryEditorPart", false, localize("isAuxiliaryEditorPart", "Editor Part is in an auxiliary window"));
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
const BannerFocused = new RawContextKey("bannerFocused", false, localize("bannerFocused", "Whether the banner has keyboard focus"));
const NotificationFocusedContext = new RawContextKey("notificationFocus", true, localize("notificationFocus", "Whether a notification has keyboard focus"));
const NotificationsCenterVisibleContext = new RawContextKey("notificationCenterVisible", false, localize("notificationCenterVisible", "Whether the notifications center is visible"));
const NotificationsToastsVisibleContext = new RawContextKey("notificationToastsVisible", false, localize("notificationToastsVisible", "Whether a notification toast is visible"));
const ActiveAuxiliaryContext = new RawContextKey("activeAuxiliary", "", localize("activeAuxiliary", "The identifier of the active auxiliary panel"));
const AuxiliaryBarFocusContext = new RawContextKey("auxiliaryBarFocus", false, localize("auxiliaryBarFocus", "Whether the auxiliary bar has keyboard focus"));
const AuxiliaryBarVisibleContext = new RawContextKey("auxiliaryBarVisible", false, localize("auxiliaryBarVisible", "Whether the auxiliary bar is visible"));
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
let ResourceContextKey = class {
  constructor(_contextKeyService, _fileService, _languageService, _modelService) {
    this._contextKeyService = _contextKeyService;
    this._fileService = _fileService;
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._schemeKey = ResourceContextKey.Scheme.bindTo(this._contextKeyService);
    this._filenameKey = ResourceContextKey.Filename.bindTo(this._contextKeyService);
    this._dirnameKey = ResourceContextKey.Dirname.bindTo(this._contextKeyService);
    this._pathKey = ResourceContextKey.Path.bindTo(this._contextKeyService);
    this._langIdKey = ResourceContextKey.LangId.bindTo(this._contextKeyService);
    this._resourceKey = ResourceContextKey.Resource.bindTo(this._contextKeyService);
    this._extensionKey = ResourceContextKey.Extension.bindTo(this._contextKeyService);
    this._hasResource = ResourceContextKey.HasResource.bindTo(this._contextKeyService);
    this._isFileSystemResource = ResourceContextKey.IsFileSystemResource.bindTo(this._contextKeyService);
    this._disposables.add(_fileService.onDidChangeFileSystemProviderRegistrations(() => {
      const resource = this.get();
      this._isFileSystemResource.set(Boolean(resource && _fileService.hasProvider(resource)));
    }));
    this._disposables.add(_modelService.onModelAdded((model) => {
      if (isEqual(model.uri, this.get())) {
        this._setLangId();
      }
    }));
    this._disposables.add(_modelService.onModelLanguageChanged((e) => {
      if (isEqual(e.model.uri, this.get())) {
        this._setLangId();
      }
    }));
  }
  static {
    __name(this, "ResourceContextKey");
  }
  // NOTE: DO NOT CHANGE THE DEFAULT VALUE TO ANYTHING BUT
  // UNDEFINED! IT IS IMPORTANT THAT DEFAULTS ARE INHERITED
  // FROM THE PARENT CONTEXT AND ONLY UNDEFINED DOES THIS
  static Scheme = new RawContextKey("resourceScheme", void 0, { type: "string", description: localize("resourceScheme", "The scheme of the resource") });
  static Filename = new RawContextKey("resourceFilename", void 0, { type: "string", description: localize("resourceFilename", "The file name of the resource") });
  static Dirname = new RawContextKey("resourceDirname", void 0, { type: "string", description: localize("resourceDirname", "The folder name the resource is contained in") });
  static Path = new RawContextKey("resourcePath", void 0, { type: "string", description: localize("resourcePath", "The full path of the resource") });
  static LangId = new RawContextKey("resourceLangId", void 0, { type: "string", description: localize("resourceLangId", "The language identifier of the resource") });
  static Resource = new RawContextKey("resource", void 0, { type: "URI", description: localize("resource", "The full value of the resource including scheme and path") });
  static Extension = new RawContextKey("resourceExtname", void 0, { type: "string", description: localize("resourceExtname", "The extension name of the resource") });
  static HasResource = new RawContextKey("resourceSet", void 0, { type: "boolean", description: localize("resourceSet", "Whether a resource is present or not") });
  static IsFileSystemResource = new RawContextKey("isFileSystemResource", void 0, { type: "boolean", description: localize("isFileSystemResource", "Whether the resource is backed by a file system provider") });
  _disposables = new DisposableStore();
  _value;
  _resourceKey;
  _schemeKey;
  _filenameKey;
  _dirnameKey;
  _pathKey;
  _langIdKey;
  _extensionKey;
  _hasResource;
  _isFileSystemResource;
  dispose() {
    this._disposables.dispose();
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
ResourceContextKey = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService)
], ResourceContextKey);
function applyAvailableEditorIds(contextKey, editor, editorResolverService) {
  if (!editor) {
    contextKey.set("");
    return;
  }
  const editorResource = editor.resource;
  if (editorResource?.scheme === Schemas.untitled && editor.editorId !== DEFAULT_EDITOR_ASSOCIATION.id) {
    contextKey.set("");
  } else {
    const editors = editorResource ? editorResolverService.getEditors(editorResource).map((editor2) => editor2.id) : [];
    contextKey.set(editors.join(","));
  }
}
__name(applyAvailableEditorIds, "applyAvailableEditorIds");
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
  InEditorZenModeContext,
  IsAuxiliaryEditorPartContext,
  IsAuxiliaryWindowFocusedContext,
  IsMainEditorCenteredLayoutContext,
  IsMainWindowFullscreenContext,
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
