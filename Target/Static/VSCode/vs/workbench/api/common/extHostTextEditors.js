var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "../../../base/common/arrays.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ExtHostEditorsShape, IEditorPropertiesChangeData, IMainContext, ITextDocumentShowOptions, ITextEditorDiffInformation, ITextEditorPositionData, MainContext, MainThreadTextEditorsShape } from "./extHost.protocol.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { ExtHostTextEditor, TextEditorDecorationType } from "./extHostTextEditor.js";
import * as TypeConverters from "./extHostTypeConverters.js";
import { TextEditorSelectionChangeKind, TextEditorChangeKind } from "./extHostTypes.js";
import * as vscode from "vscode";
class ExtHostEditors extends Disposable {
  constructor(mainContext, _extHostDocumentsAndEditors) {
    super();
    this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
    this._proxy = mainContext.getProxy(MainContext.MainThreadTextEditors);
    this._register(this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors((e) => this._onDidChangeVisibleTextEditors.fire(e)));
    this._register(this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor((e) => this._onDidChangeActiveTextEditor.fire(e)));
  }
  static {
    __name(this, "ExtHostEditors");
  }
  _onDidChangeTextEditorSelection = new Emitter();
  _onDidChangeTextEditorOptions = new Emitter();
  _onDidChangeTextEditorVisibleRanges = new Emitter();
  _onDidChangeTextEditorViewColumn = new Emitter();
  _onDidChangeTextEditorDiffInformation = new Emitter();
  _onDidChangeActiveTextEditor = new Emitter();
  _onDidChangeVisibleTextEditors = new Emitter();
  onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
  onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
  onDidChangeTextEditorVisibleRanges = this._onDidChangeTextEditorVisibleRanges.event;
  onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
  onDidChangeTextEditorDiffInformation = this._onDidChangeTextEditorDiffInformation.event;
  onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
  onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
  _proxy;
  getActiveTextEditor() {
    return this._extHostDocumentsAndEditors.activeEditor();
  }
  getVisibleTextEditors(internal) {
    const editors = this._extHostDocumentsAndEditors.allEditors();
    return internal ? editors : editors.map((editor) => editor.value);
  }
  async showTextDocument(document, columnOrOptions, preserveFocus) {
    let options;
    if (typeof columnOrOptions === "number") {
      options = {
        position: TypeConverters.ViewColumn.from(columnOrOptions),
        preserveFocus
      };
    } else if (typeof columnOrOptions === "object") {
      options = {
        position: TypeConverters.ViewColumn.from(columnOrOptions.viewColumn),
        preserveFocus: columnOrOptions.preserveFocus,
        selection: typeof columnOrOptions.selection === "object" ? TypeConverters.Range.from(columnOrOptions.selection) : void 0,
        pinned: typeof columnOrOptions.preview === "boolean" ? !columnOrOptions.preview : void 0
      };
    } else {
      options = {
        preserveFocus: false
      };
    }
    const editorId = await this._proxy.$tryShowTextDocument(document.uri, options);
    const editor = editorId && this._extHostDocumentsAndEditors.getEditor(editorId);
    if (editor) {
      return editor.value;
    }
    if (editorId) {
      throw new Error(`Could NOT open editor for "${document.uri.toString()}" because another editor opened in the meantime.`);
    } else {
      throw new Error(`Could NOT open editor for "${document.uri.toString()}".`);
    }
  }
  createTextEditorDecorationType(extension, options) {
    return new TextEditorDecorationType(this._proxy, extension, options).value;
  }
  // --- called from main thread
  $acceptEditorPropertiesChanged(id, data) {
    const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
    if (!textEditor) {
      throw new Error("unknown text editor");
    }
    if (data.options) {
      textEditor._acceptOptions(data.options);
    }
    if (data.selections) {
      const selections = data.selections.selections.map(TypeConverters.Selection.to);
      textEditor._acceptSelections(selections);
    }
    if (data.visibleRanges) {
      const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
      textEditor._acceptVisibleRanges(visibleRanges);
    }
    if (data.options) {
      this._onDidChangeTextEditorOptions.fire({
        textEditor: textEditor.value,
        options: { ...data.options, lineNumbers: TypeConverters.TextEditorLineNumbersStyle.to(data.options.lineNumbers) }
      });
    }
    if (data.selections) {
      const kind = TextEditorSelectionChangeKind.fromValue(data.selections.source);
      const selections = data.selections.selections.map(TypeConverters.Selection.to);
      this._onDidChangeTextEditorSelection.fire({
        textEditor: textEditor.value,
        selections,
        kind
      });
    }
    if (data.visibleRanges) {
      const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
      this._onDidChangeTextEditorVisibleRanges.fire({
        textEditor: textEditor.value,
        visibleRanges
      });
    }
  }
  $acceptEditorPositionData(data) {
    for (const id in data) {
      const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
      if (!textEditor) {
        throw new Error("Unknown text editor");
      }
      const viewColumn = TypeConverters.ViewColumn.to(data[id]);
      if (textEditor.value.viewColumn !== viewColumn) {
        textEditor._acceptViewColumn(viewColumn);
        this._onDidChangeTextEditorViewColumn.fire({ textEditor: textEditor.value, viewColumn });
      }
    }
  }
  $acceptEditorDiffInformation(id, diffInformation) {
    const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
    if (!textEditor) {
      throw new Error("unknown text editor");
    }
    if (!diffInformation) {
      textEditor._acceptDiffInformation(void 0);
      this._onDidChangeTextEditorDiffInformation.fire({
        textEditor: textEditor.value,
        diffInformation: void 0
      });
      return;
    }
    const that = this;
    const result = diffInformation.map((diff) => {
      const original = URI.revive(diff.original);
      const modified = URI.revive(diff.modified);
      const changes = diff.changes.map((change) => {
        const [originalStartLineNumber, originalEndLineNumberExclusive, modifiedStartLineNumber, modifiedEndLineNumberExclusive] = change;
        let kind;
        if (originalStartLineNumber === originalEndLineNumberExclusive) {
          kind = TextEditorChangeKind.Addition;
        } else if (modifiedStartLineNumber === modifiedEndLineNumberExclusive) {
          kind = TextEditorChangeKind.Deletion;
        } else {
          kind = TextEditorChangeKind.Modification;
        }
        return {
          original: {
            startLineNumber: originalStartLineNumber,
            endLineNumberExclusive: originalEndLineNumberExclusive
          },
          modified: {
            startLineNumber: modifiedStartLineNumber,
            endLineNumberExclusive: modifiedEndLineNumberExclusive
          },
          kind
        };
      });
      return Object.freeze({
        documentVersion: diff.documentVersion,
        original,
        modified,
        changes,
        get isStale() {
          const document = that._extHostDocumentsAndEditors.getDocument(modified);
          return document?.version !== diff.documentVersion;
        }
      });
    });
    textEditor._acceptDiffInformation(result);
    this._onDidChangeTextEditorDiffInformation.fire({
      textEditor: textEditor.value,
      diffInformation: result
    });
  }
  getDiffInformation(id) {
    return Promise.resolve(this._proxy.$getDiffInformation(id));
  }
}
export {
  ExtHostEditors
};
//# sourceMappingURL=extHostTextEditors.js.map
