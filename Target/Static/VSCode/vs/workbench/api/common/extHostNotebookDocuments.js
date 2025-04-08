var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import * as extHostProtocol from "./extHost.protocol.js";
import { ExtHostNotebookController } from "./extHostNotebook.js";
import { NotebookDocumentMetadata } from "../../contrib/notebook/common/notebookCommon.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
class ExtHostNotebookDocuments {
  constructor(_notebooksAndEditors) {
    this._notebooksAndEditors = _notebooksAndEditors;
  }
  static {
    __name(this, "ExtHostNotebookDocuments");
  }
  _onDidSaveNotebookDocument = new Emitter();
  onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
  _onDidChangeNotebookDocument = new Emitter();
  onDidChangeNotebookDocument = this._onDidChangeNotebookDocument.event;
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
