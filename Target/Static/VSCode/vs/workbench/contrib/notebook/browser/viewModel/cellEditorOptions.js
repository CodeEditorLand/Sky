var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { deepClone } from "../../../../../base/common/objects.js";
import { IEditorOptions } from "../../../../../editor/common/config/editorOptions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IBaseCellEditorOptions, INotebookEditorDelegate } from "../notebookBrowser.js";
import { NotebookOptions } from "../notebookOptions.js";
class BaseCellEditorOptions extends Disposable {
  constructor(notebookEditor, notebookOptions, configurationService, language) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookOptions = notebookOptions;
    this.configurationService = configurationService;
    this.language = language;
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("editor") || e.affectsConfiguration("notebook")) {
        this._recomputeOptions();
      }
    }));
    this._register(notebookOptions.onDidChangeOptions((e) => {
      if (e.cellStatusBarVisibility || e.editorTopPadding || e.editorOptionsCustomizations) {
        this._recomputeOptions();
      }
    }));
    this._register(this.notebookEditor.onDidChangeModel(() => {
      this._localDisposableStore.clear();
      if (this.notebookEditor.hasModel()) {
        this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
          this._recomputeOptions();
        }));
        this._recomputeOptions();
      }
    }));
    if (this.notebookEditor.hasModel()) {
      this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
        this._recomputeOptions();
      }));
    }
    this._value = this._computeEditorOptions();
  }
  static {
    __name(this, "BaseCellEditorOptions");
  }
  static fixedEditorOptions = {
    scrollBeyondLastLine: false,
    scrollbar: {
      verticalScrollbarSize: 14,
      horizontal: "auto",
      useShadows: true,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      alwaysConsumeMouseWheel: false
    },
    renderLineHighlightOnlyWhenFocus: true,
    overviewRulerLanes: 0,
    lineDecorationsWidth: 0,
    folding: true,
    fixedOverflowWidgets: true,
    minimap: { enabled: false },
    renderValidationDecorations: "on",
    lineNumbersMinChars: 3
  };
  _localDisposableStore = this._register(new DisposableStore());
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _value;
  get value() {
    return this._value;
  }
  _recomputeOptions() {
    this._value = this._computeEditorOptions();
    this._onDidChange.fire();
  }
  _computeEditorOptions() {
    const editorOptions = deepClone(this.configurationService.getValue("editor", { overrideIdentifier: this.language }));
    const editorOptionsOverrideRaw = this.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
    const editorOptionsOverride = {};
    if (editorOptionsOverrideRaw) {
      for (const key in editorOptionsOverrideRaw) {
        if (key.indexOf("editor.") === 0) {
          editorOptionsOverride[key.substring(7)] = editorOptionsOverrideRaw[key];
        }
      }
    }
    const computed = Object.freeze({
      ...editorOptions,
      ...BaseCellEditorOptions.fixedEditorOptions,
      ...editorOptionsOverride,
      ...{ padding: { top: 12, bottom: 12 } },
      readOnly: this.notebookEditor.isReadOnly
    });
    return computed;
  }
}
export {
  BaseCellEditorOptions
};
//# sourceMappingURL=cellEditorOptions.js.map
