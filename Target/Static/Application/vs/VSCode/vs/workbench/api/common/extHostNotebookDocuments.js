var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
class ExtHostNotebookDocuments {
  static {
    __name(this, "ExtHostNotebookDocuments");
  }
  constructor(_notebooksAndEditors) {
    this._notebooksAndEditors = _notebooksAndEditors;
    this._onDidSaveNotebookDocument = new Emitter();
    this.onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
    this._onDidChangeNotebookDocument = new Emitter();
    this.onDidChangeNotebookDocument = this._onDidChangeNotebookDocument.event;
  }
  $acceptModelChanged(uri, event, isDirty, newMetadata) {
    const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
    const e = document.acceptModelChanged(event.value, isDirty, newMetadata);
    this._onDidChangeNotebookDocument.fire(e);
  }
  $acceptDirtyStateChanged(uri, isDirty) {
    const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
    document.acceptDirty(isDirty);
  }
  $acceptModelSaved(uri) {
    const document = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri));
    this._onDidSaveNotebookDocument.fire(document.apiNotebook);
  }
}
export {
  ExtHostNotebookDocuments
};
//# sourceMappingURL=extHostNotebookDocuments.js.map
