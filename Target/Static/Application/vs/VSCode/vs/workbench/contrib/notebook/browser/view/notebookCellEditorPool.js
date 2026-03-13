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
import * as DOM from "../../../../../base/browser/dom.js";
import { createCancelablePromise } from "../../../../../base/common/async.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { CellFocusMode } from "../notebookBrowser.js";
import { CellEditorOptions } from "./cellParts/cellEditorOptions.js";
let NotebookCellEditorPool = class NotebookCellEditorPool2 extends Disposable {
  static {
    __name(this, "NotebookCellEditorPool");
  }
  constructor(notebookEditor, contextKeyServiceProvider, textModelService, _configurationService, _instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.contextKeyServiceProvider = contextKeyServiceProvider;
    this.textModelService = textModelService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._editorDisposable = this._register(new MutableDisposable());
    this._isInitialized = false;
    this._isDisposed = false;
    this._focusedEditorDOM = this.notebookEditor.getDomNode().appendChild(DOM.$(".cell-editor-part-cache"));
    this._focusedEditorDOM.style.position = "absolute";
    this._focusedEditorDOM.style.top = "-50000px";
    this._focusedEditorDOM.style.width = "1px";
    this._focusedEditorDOM.style.height = "1px";
  }
  _initializeEditor(cell) {
    this._editorContextKeyService = this._register(this.contextKeyServiceProvider(this._focusedEditorDOM));
    const editorContainer = DOM.prepend(this._focusedEditorDOM, DOM.$(".cell-editor-container"));
    const editorInstaService = this._register(this._instantiationService.createChild(new ServiceCollection([IContextKeyService, this._editorContextKeyService])));
    EditorContextKeys.inCompositeEditor.bindTo(this._editorContextKeyService).set(true);
    const editorOptions = new CellEditorOptions(this.notebookEditor.getBaseCellEditorOptions(cell.language), this.notebookEditor.notebookOptions, this._configurationService);
    this._editor = this._register(editorInstaService.createInstance(CodeEditorWidget, editorContainer, {
      ...editorOptions.getDefaultValue(),
      dimension: {
        width: 0,
        height: 0
      },
      scrollbar: {
        vertical: "hidden",
        horizontal: "auto",
        handleMouseWheel: false,
        useShadows: false
      },
      allowVariableLineHeights: false
    }, {
      contributions: this.notebookEditor.creationOptions.cellEditorContributions
    }));
    editorOptions.dispose();
    this._isInitialized = true;
  }
  preserveFocusedEditor(cell) {
    if (!this._isInitialized) {
      this._initializeEditor(cell);
    }
    this._editorDisposable.clear();
    this._focusEditorCancellablePromise?.cancel();
    this._focusEditorCancellablePromise = createCancelablePromise(async (token) => {
      const ref = await this.textModelService.createModelReference(cell.uri);
      if (this._isDisposed || token.isCancellationRequested) {
        ref.dispose();
        return;
      }
      const editorDisposable = new DisposableStore();
      editorDisposable.add(ref);
      this._editor.setModel(ref.object.textEditorModel);
      this._editor.setSelections(cell.getSelections());
      this._editor.focus();
      const _update = /* @__PURE__ */ __name(() => {
        const editorSelections = this._editor.getSelections();
        if (editorSelections) {
          cell.setSelections(editorSelections);
        }
        this.notebookEditor.revealInView(cell);
        this._editor.setModel(null);
        ref.dispose();
      }, "_update");
      editorDisposable.add(this._editor.onDidChangeModelContent((e) => {
        _update();
      }));
      editorDisposable.add(this._editor.onDidChangeCursorSelection((e) => {
        if (e.source === "keyboard" || e.source === "mouse") {
          _update();
        }
      }));
      editorDisposable.add(this.notebookEditor.onDidChangeActiveEditor(() => {
        const latestActiveCell = this.notebookEditor.getActiveCell();
        if (latestActiveCell !== cell || latestActiveCell.focusMode !== CellFocusMode.Editor) {
          this._editorDisposable.clear();
          this._editor.setModel(null);
          ref.dispose();
        }
      }));
      this._editorDisposable.value = editorDisposable;
    });
  }
  dispose() {
    this._isDisposed = true;
    this._focusEditorCancellablePromise?.cancel();
    super.dispose();
  }
};
NotebookCellEditorPool = __decorate([
  __param(2, ITextModelService),
  __param(3, IConfigurationService),
  __param(4, IInstantiationService)
], NotebookCellEditorPool);
export {
  NotebookCellEditorPool
};
//# sourceMappingURL=notebookCellEditorPool.js.map
