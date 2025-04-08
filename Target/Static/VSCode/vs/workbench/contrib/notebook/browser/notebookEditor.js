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
import * as DOM from "../../../../base/browser/dom.js";
import { IActionViewItem } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IAction, toAction } from "../../../../base/common/actions.js";
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { ByteSize, FileOperationError, FileOperationResult, IFileService, TooLargeFileOperationError } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { DEFAULT_EDITOR_ASSOCIATION, EditorPaneSelectionChangeReason, EditorPaneSelectionCompareResult, EditorResourceAccessor, IEditorMemento, IEditorOpenContext, IEditorPaneScrollPosition, IEditorPaneSelection, IEditorPaneSelectionChangeEvent, IEditorPaneWithScrolling, createEditorOpenError, createTooLargeFileError, isEditorOpenError } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { SELECT_KERNEL_ID } from "./controller/coreActions.js";
import { INotebookEditorOptions, INotebookEditorPane, INotebookEditorViewState } from "./notebookBrowser.js";
import { IBorrowValue, INotebookEditorService } from "./services/notebookEditorService.js";
import { NotebookEditorWidget } from "./notebookEditorWidget.js";
import { NotebooKernelActionViewItem } from "./viewParts/notebookKernelView.js";
import { NotebookTextModel } from "../common/model/notebookTextModel.js";
import { CellKind, NOTEBOOK_EDITOR_ID, NotebookWorkingCopyTypeIdentifier } from "../common/notebookCommon.js";
import { NotebookEditorInput } from "../common/notebookEditorInput.js";
import { NotebookPerfMarks } from "../common/notebookPerformance.js";
import { GroupsOrder, IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { InstallRecommendedExtensionAction } from "../../extensions/browser/extensionsActions.js";
import { INotebookService } from "../common/notebookService.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { EnablementState } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IWorkingCopyBackupService } from "../../../services/workingCopy/common/workingCopyBackup.js";
import { streamToBuffer } from "../../../../base/common/buffer.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
const NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = "NotebookEditorViewState";
let NotebookEditor = class extends EditorPane {
  constructor(group, telemetryService, themeService, _instantiationService, storageService, _editorService, _editorGroupService, _notebookWidgetService, _contextKeyService, _fileService, configurationService, _editorProgressService, _notebookService, _extensionsWorkbenchService, _workingCopyBackupService, logService, _preferencesService) {
    super(NotebookEditor.ID, group, telemetryService, themeService, storageService);
    this._instantiationService = _instantiationService;
    this._editorService = _editorService;
    this._editorGroupService = _editorGroupService;
    this._notebookWidgetService = _notebookWidgetService;
    this._contextKeyService = _contextKeyService;
    this._fileService = _fileService;
    this._editorProgressService = _editorProgressService;
    this._notebookService = _notebookService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._workingCopyBackupService = _workingCopyBackupService;
    this.logService = logService;
    this._preferencesService = _preferencesService;
    this._editorMemento = this.getEditorMemento(_editorGroupService, configurationService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
    this._register(this._fileService.onDidChangeFileSystemProviderCapabilities((e) => this._onDidChangeFileSystemProvider(e.scheme)));
    this._register(this._fileService.onDidChangeFileSystemProviderRegistrations((e) => this._onDidChangeFileSystemProvider(e.scheme)));
  }
  static {
    __name(this, "NotebookEditor");
  }
  static ID = NOTEBOOK_EDITOR_ID;
  _editorMemento;
  _groupListener = this._register(new DisposableStore());
  _widgetDisposableStore = this._register(new DisposableStore());
  _widget = { value: void 0 };
  _rootElement;
  _pagePosition;
  _inputListener = this._register(new MutableDisposable());
  // override onDidFocus and onDidBlur to be based on the NotebookEditorWidget element
  _onDidFocusWidget = this._register(new Emitter());
  get onDidFocus() {
    return this._onDidFocusWidget.event;
  }
  _onDidBlurWidget = this._register(new Emitter());
  get onDidBlur() {
    return this._onDidBlurWidget.event;
  }
  _onDidChangeModel = this._register(new Emitter());
  onDidChangeModel = this._onDidChangeModel.event;
  _onDidChangeSelection = this._register(new Emitter());
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onDidChangeScroll = this._register(new Emitter());
  onDidChangeScroll = this._onDidChangeScroll.event;
  _onDidChangeFileSystemProvider(scheme) {
    if (this.input instanceof NotebookEditorInput && this.input.resource?.scheme === scheme) {
      this._updateReadonly(this.input);
    }
  }
  _onDidChangeInputCapabilities(input) {
    if (this.input === input) {
      this._updateReadonly(input);
    }
  }
  _updateReadonly(input) {
    this._widget.value?.setOptions({ isReadOnly: !!input.isReadonly() });
  }
  get textModel() {
    return this._widget.value?.textModel;
  }
  get minimumWidth() {
    return 220;
  }
  get maximumWidth() {
    return Number.POSITIVE_INFINITY;
  }
  // these setters need to exist because this extends from EditorPane
  set minimumWidth(value) {
  }
  set maximumWidth(value) {
  }
  //#region Editor Core
  get scopedContextKeyService() {
    return this._widget.value?.scopedContextKeyService;
  }
  createEditor(parent) {
    this._rootElement = DOM.append(parent, DOM.$(".notebook-editor"));
    this._rootElement.id = `notebook-editor-element-${generateUuid()}`;
  }
  getActionViewItem(action, options) {
    if (action.id === SELECT_KERNEL_ID) {
      return this._register(this._instantiationService.createInstance(NotebooKernelActionViewItem, action, this, options));
    }
    return void 0;
  }
  getControl() {
    return this._widget.value;
  }
  setVisible(visible) {
    super.setVisible(visible);
    if (!visible) {
      this._widget.value?.onWillHide();
    }
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this._groupListener.clear();
    this._groupListener.add(this.group.onWillCloseEditor((e) => this._saveEditorViewState(e.editor)));
    this._groupListener.add(this.group.onDidModelChange(() => {
      if (this._editorGroupService.activeGroup !== this.group) {
        this._widget?.value?.updateEditorFocus();
      }
    }));
    if (!visible) {
      this._saveEditorViewState(this.input);
      if (this.input && this._widget.value) {
        this._widget.value.onWillHide();
      }
    }
  }
  focus() {
    super.focus();
    this._widget.value?.focus();
  }
  hasFocus() {
    const value = this._widget.value;
    if (!value) {
      return false;
    }
    return !!value && DOM.isAncestorOfActiveElement(value.getDomNode() || DOM.isAncestorOfActiveElement(value.getOverflowContainerDomNode()));
  }
  async setInput(input, options, context, token, noRetry) {
    try {
      let perfMarksCaptured = false;
      const fileOpenMonitor = timeout(1e4);
      fileOpenMonitor.then(() => {
        perfMarksCaptured = true;
        this._handlePerfMark(perf, input);
      });
      const perf = new NotebookPerfMarks();
      perf.mark("startTime");
      this._inputListener.value = input.onDidChangeCapabilities(() => this._onDidChangeInputCapabilities(input));
      this._widgetDisposableStore.clear();
      this._widget.value?.onWillHide();
      this._widget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, this.group.id, input, void 0, this._pagePosition?.dimension, this.window);
      if (this._rootElement && this._widget.value.getDomNode()) {
        this._rootElement.setAttribute("aria-flowto", this._widget.value.getDomNode().id || "");
        DOM.setParentFlowTo(this._widget.value.getDomNode(), this._rootElement);
      }
      this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(() => this._onDidChangeModel.fire()));
      this._widgetDisposableStore.add(this._widget.value.onDidChangeActiveCell(() => this._onDidChangeSelection.fire({ reason: EditorPaneSelectionChangeReason.USER })));
      if (this._pagePosition) {
        this._widget.value.layout(this._pagePosition.dimension, this._rootElement, this._pagePosition.position);
      }
      await super.setInput(input, options, context, token);
      const model = await input.resolve(options, perf);
      perf.mark("inputLoaded");
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (!this._widget.value) {
        if (noRetry) {
          return void 0;
        }
        return this.setInput(input, options, context, token, true);
      }
      if (model === null) {
        const knownProvider = this._notebookService.getViewTypeProvider(input.viewType);
        if (!knownProvider) {
          throw new Error(localize("fail.noEditor", "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType));
        }
        await this._extensionsWorkbenchService.whenInitialized;
        const extensionInfo = this._extensionsWorkbenchService.local.find((e) => e.identifier.id === knownProvider);
        throw createEditorOpenError(new Error(localize("fail.noEditor.extensionMissing", "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType)), [
          toAction({
            id: "workbench.notebook.action.installOrEnableMissing",
            label: extensionInfo ? localize("notebookOpenEnableMissingViewType", "Enable extension for '{0}'", input.viewType) : localize("notebookOpenInstallMissingViewType", "Install extension for '{0}'", input.viewType),
            run: /* @__PURE__ */ __name(async () => {
              const d = this._notebookService.onAddViewType((viewType) => {
                if (viewType === input.viewType) {
                  this._editorService.openEditor({ resource: input.resource });
                  d.dispose();
                }
              });
              const extensionInfo2 = this._extensionsWorkbenchService.local.find((e) => e.identifier.id === knownProvider);
              try {
                if (extensionInfo2) {
                  await this._extensionsWorkbenchService.setEnablement(extensionInfo2, extensionInfo2.enablementState === EnablementState.DisabledWorkspace ? EnablementState.EnabledWorkspace : EnablementState.EnabledGlobally);
                } else {
                  await this._instantiationService.createInstance(InstallRecommendedExtensionAction, knownProvider).run();
                }
              } catch (ex) {
                this.logService.error(`Failed to install or enable extension ${knownProvider}`, ex);
                d.dispose();
              }
            }, "run")
          }),
          toAction({
            id: "workbench.notebook.action.openAsText",
            label: localize("notebookOpenAsText", "Open As Text"),
            run: /* @__PURE__ */ __name(async () => {
              const backup = await this._workingCopyBackupService.resolve({ resource: input.resource, typeId: NotebookWorkingCopyTypeIdentifier.create(input.viewType) });
              if (backup) {
                const contents = await streamToBuffer(backup.value);
                this._editorService.openEditor({ resource: void 0, contents: contents.toString() });
              } else {
                this._editorService.openEditor({ resource: input.resource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id, pinned: true } });
              }
            }, "run")
          })
        ], { allowDialog: true });
      }
      this._widgetDisposableStore.add(model.notebook.onDidChangeContent(() => this._onDidChangeSelection.fire({ reason: EditorPaneSelectionChangeReason.EDIT })));
      const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
      this._widget.value.setParentContextKeyService(this._contextKeyService);
      this._widget.value.setEditorProgressService(this._editorProgressService);
      await this._widget.value.setModel(model.notebook, viewState, perf);
      const isReadOnly = !!input.isReadonly();
      await this._widget.value.setOptions({ ...options, isReadOnly });
      this._widgetDisposableStore.add(this._widget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
      this._widgetDisposableStore.add(this._widget.value.onDidBlurWidget(() => this._onDidBlurWidget.fire()));
      this._widgetDisposableStore.add(this._editorGroupService.createEditorDropTarget(this._widget.value.getDomNode(), {
        containsGroup: /* @__PURE__ */ __name((group) => this.group.id === group.id, "containsGroup")
      }));
      this._widgetDisposableStore.add(this._widget.value.onDidScroll(() => {
        this._onDidChangeScroll.fire();
      }));
      perf.mark("editorLoaded");
      fileOpenMonitor.cancel();
      if (perfMarksCaptured) {
        return;
      }
      this._handlePerfMark(perf, input, model.notebook);
      this._onDidChangeControl.fire();
    } catch (e) {
      this.logService.warn("NotebookEditorWidget#setInput failed", e);
      if (isEditorOpenError(e)) {
        throw e;
      }
      if (e.fileOperationResult === FileOperationResult.FILE_TOO_LARGE) {
        let message;
        if (e instanceof TooLargeFileOperationError) {
          message = localize("notebookTooLargeForHeapErrorWithSize", "The notebook is not displayed in the notebook editor because it is very large ({0}).", ByteSize.formatSize(e.size));
        } else {
          message = localize("notebookTooLargeForHeapErrorWithoutSize", "The notebook is not displayed in the notebook editor because it is very large.");
        }
        throw createTooLargeFileError(this.group, input, options, message, this._preferencesService);
      }
      const error = createEditorOpenError(e instanceof Error ? e : new Error(e ? e.message : ""), [
        toAction({
          id: "workbench.notebook.action.openInTextEditor",
          label: localize("notebookOpenInTextEditor", "Open in Text Editor"),
          run: /* @__PURE__ */ __name(async () => {
            const activeEditorPane = this._editorService.activeEditorPane;
            if (!activeEditorPane) {
              return;
            }
            const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
            if (!activeEditorResource) {
              return;
            }
            if (activeEditorResource.toString() === input.resource?.toString()) {
              return this._editorService.openEditor({
                resource: activeEditorResource,
                options: {
                  override: DEFAULT_EDITOR_ASSOCIATION.id,
                  pinned: true
                  // new file gets pinned by default
                }
              });
            }
            return;
          }, "run")
        })
      ], { allowDialog: true });
      throw error;
    }
  }
  _handlePerfMark(perf, input, notebook) {
    const perfMarks = perf.value;
    const startTime = perfMarks["startTime"];
    const extensionActivated = perfMarks["extensionActivated"];
    const inputLoaded = perfMarks["inputLoaded"];
    const webviewCommLoaded = perfMarks["webviewCommLoaded"];
    const customMarkdownLoaded = perfMarks["customMarkdownLoaded"];
    const editorLoaded = perfMarks["editorLoaded"];
    let extensionActivationTimespan = -1;
    let inputLoadingTimespan = -1;
    let webviewCommLoadingTimespan = -1;
    let customMarkdownLoadingTimespan = -1;
    let editorLoadingTimespan = -1;
    if (startTime !== void 0 && extensionActivated !== void 0) {
      extensionActivationTimespan = extensionActivated - startTime;
      if (inputLoaded !== void 0) {
        inputLoadingTimespan = inputLoaded - extensionActivated;
      }
      if (webviewCommLoaded !== void 0) {
        webviewCommLoadingTimespan = webviewCommLoaded - extensionActivated;
      }
      if (customMarkdownLoaded !== void 0) {
        customMarkdownLoadingTimespan = customMarkdownLoaded - startTime;
      }
      if (editorLoaded !== void 0) {
        editorLoadingTimespan = editorLoaded - startTime;
      }
    }
    let codeCellCount = void 0;
    let mdCellCount = void 0;
    let outputCount = void 0;
    let outputBytes = void 0;
    let codeLength = void 0;
    let markdownLength = void 0;
    let notebookStatsLoaded = void 0;
    if (notebook) {
      const stopWatch = new StopWatch();
      for (const cell of notebook.cells) {
        if (cell.cellKind === CellKind.Code) {
          codeCellCount = (codeCellCount || 0) + 1;
          codeLength = (codeLength || 0) + cell.getTextLength();
          outputCount = (outputCount || 0) + cell.outputs.length;
          outputBytes = (outputBytes || 0) + cell.outputs.reduce((prev, cur) => prev + cur.outputs.reduce((size, item) => size + item.data.byteLength, 0), 0);
        } else {
          mdCellCount = (mdCellCount || 0) + 1;
          markdownLength = (codeLength || 0) + cell.getTextLength();
        }
      }
      notebookStatsLoaded = stopWatch.elapsed();
    }
    this.logService.trace(`[NotebookEditor] open notebook perf ${notebook?.uri.toString() ?? ""} - extensionActivation: ${extensionActivationTimespan}, inputLoad: ${inputLoadingTimespan}, webviewComm: ${webviewCommLoadingTimespan}, customMarkdown: ${customMarkdownLoadingTimespan}, editorLoad: ${editorLoadingTimespan}`);
    this.telemetryService.publicLog2("notebook/editorOpenPerf", {
      scheme: input.resource.scheme,
      ext: extname(input.resource),
      viewType: input.viewType,
      extensionActivated: extensionActivationTimespan,
      inputLoaded: inputLoadingTimespan,
      webviewCommLoaded: webviewCommLoadingTimespan,
      customMarkdownLoaded: customMarkdownLoadingTimespan,
      editorLoaded: editorLoadingTimespan,
      codeCellCount,
      mdCellCount,
      outputCount,
      outputBytes,
      codeLength,
      markdownLength,
      notebookStatsLoaded
    });
  }
  clearInput() {
    this._inputListener.clear();
    if (this._widget.value) {
      this._saveEditorViewState(this.input);
      this._widget.value.onWillHide();
    }
    super.clearInput();
  }
  setOptions(options) {
    this._widget.value?.setOptions(options);
    super.setOptions(options);
  }
  saveState() {
    this._saveEditorViewState(this.input);
    super.saveState();
  }
  getViewState() {
    const input = this.input;
    if (!(input instanceof NotebookEditorInput)) {
      return void 0;
    }
    this._saveEditorViewState(input);
    return this._loadNotebookEditorViewState(input);
  }
  getSelection() {
    if (this._widget.value) {
      const activeCell = this._widget.value.getActiveCell();
      if (activeCell) {
        const cellUri = activeCell.uri;
        return new NotebookEditorSelection(cellUri, activeCell.getSelections());
      }
    }
    return void 0;
  }
  getScrollPosition() {
    const widget = this.getControl();
    if (!widget) {
      throw new Error("Notebook widget has not yet been initialized");
    }
    return {
      scrollTop: widget.scrollTop,
      scrollLeft: 0
    };
  }
  setScrollPosition(scrollPosition) {
    const editor = this.getControl();
    if (!editor) {
      throw new Error("Control has not yet been initialized");
    }
    editor.setScrollTop(scrollPosition.scrollTop);
  }
  _saveEditorViewState(input) {
    if (this._widget.value && input instanceof NotebookEditorInput) {
      if (this._widget.value.isDisposed) {
        return;
      }
      const state = this._widget.value.getEditorViewState();
      this._editorMemento.saveEditorState(this.group, input.resource, state);
    }
  }
  _loadNotebookEditorViewState(input) {
    const result = this._editorMemento.loadEditorState(this.group, input.resource);
    if (result) {
      return result;
    }
    for (const group of this._editorGroupService.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE)) {
      if (group.activeEditorPane !== this && group.activeEditorPane instanceof NotebookEditor && group.activeEditor?.matches(input)) {
        return group.activeEditorPane._widget.value?.getEditorViewState();
      }
    }
    return;
  }
  layout(dimension, position) {
    this._rootElement.classList.toggle("mid-width", dimension.width < 1e3 && dimension.width >= 600);
    this._rootElement.classList.toggle("narrow-width", dimension.width < 600);
    this._pagePosition = { dimension, position };
    if (!this._widget.value || !(this.input instanceof NotebookEditorInput)) {
      return;
    }
    if (this.input.resource.toString() !== this.textModel?.uri.toString() && this._widget.value?.hasModel()) {
      return;
    }
    if (this.isVisible()) {
      this._widget.value.layout(dimension, this._rootElement, position);
    }
  }
  //#endregion
};
NotebookEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, INotebookEditorService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ITextResourceConfigurationService),
  __decorateParam(11, IEditorProgressService),
  __decorateParam(12, INotebookService),
  __decorateParam(13, IExtensionsWorkbenchService),
  __decorateParam(14, IWorkingCopyBackupService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IPreferencesService)
], NotebookEditor);
class NotebookEditorSelection {
  constructor(cellUri, selections) {
    this.cellUri = cellUri;
    this.selections = selections;
  }
  static {
    __name(this, "NotebookEditorSelection");
  }
  compare(other) {
    if (!(other instanceof NotebookEditorSelection)) {
      return EditorPaneSelectionCompareResult.DIFFERENT;
    }
    if (isEqual(this.cellUri, other.cellUri)) {
      return EditorPaneSelectionCompareResult.IDENTICAL;
    }
    return EditorPaneSelectionCompareResult.DIFFERENT;
  }
  restore(options) {
    const notebookOptions = {
      cellOptions: {
        resource: this.cellUri,
        options: {
          selection: this.selections[0]
        }
      }
    };
    Object.assign(notebookOptions, options);
    return notebookOptions;
  }
  log() {
    return this.cellUri.fragment;
  }
}
export {
  NotebookEditor
};
//# sourceMappingURL=notebookEditor.js.map
