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
import { Emitter } from "../../../base/common/event.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostNotebookEditorsShape, INotebookEditorPropertiesChangeData, INotebookEditorViewColumnInfo } from "./extHost.protocol.js";
import { ExtHostNotebookController } from "./extHostNotebook.js";
import * as typeConverters from "./extHostTypeConverters.js";
let ExtHostNotebookEditors = class {
  constructor(_logService, _notebooksAndEditors) {
    this._logService = _logService;
    this._notebooksAndEditors = _notebooksAndEditors;
  }
  static {
    __name(this, "ExtHostNotebookEditors");
  }
  _onDidChangeNotebookEditorSelection = new Emitter();
  _onDidChangeNotebookEditorVisibleRanges = new Emitter();
  onDidChangeNotebookEditorSelection = this._onDidChangeNotebookEditorSelection.event;
  onDidChangeNotebookEditorVisibleRanges = this._onDidChangeNotebookEditorVisibleRanges.event;
  $acceptEditorPropertiesChanged(id, data) {
    this._logService.debug("ExtHostNotebook#$acceptEditorPropertiesChanged", id, data);
    const editor = this._notebooksAndEditors.getEditorById(id);
    if (data.visibleRanges) {
      editor._acceptVisibleRanges(data.visibleRanges.ranges.map(typeConverters.NotebookRange.to));
    }
    if (data.selections) {
      editor._acceptSelections(data.selections.selections.map(typeConverters.NotebookRange.to));
    }
    if (data.visibleRanges) {
      this._onDidChangeNotebookEditorVisibleRanges.fire({
        notebookEditor: editor.apiEditor,
        visibleRanges: editor.apiEditor.visibleRanges
      });
    }
    if (data.selections) {
      this._onDidChangeNotebookEditorSelection.fire(Object.freeze({
        notebookEditor: editor.apiEditor,
        selections: editor.apiEditor.selections
      }));
    }
  }
  $acceptEditorViewColumns(data) {
    for (const id in data) {
      const editor = this._notebooksAndEditors.getEditorById(id);
      editor._acceptViewColumn(typeConverters.ViewColumn.to(data[id]));
    }
  }
};
ExtHostNotebookEditors = __decorateClass([
  __decorateParam(0, ILogService)
], ExtHostNotebookEditors);
export {
  ExtHostNotebookEditors
};
//# sourceMappingURL=extHostNotebookEditors.js.map
