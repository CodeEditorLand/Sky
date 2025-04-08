var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { AsyncEmitter, Event } from "../../../base/common/event.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostNotebookDocumentSaveParticipantShape, IWorkspaceEditDto, MainThreadBulkEditsShape } from "./extHost.protocol.js";
import { ExtHostNotebookController } from "./extHostNotebook.js";
import { TextDocumentSaveReason, WorkspaceEdit as WorksapceEditConverter } from "./extHostTypeConverters.js";
import { WorkspaceEdit } from "./extHostTypes.js";
import { SaveReason } from "../../common/editor.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { NotebookDocumentWillSaveEvent } from "vscode";
class ExtHostNotebookDocumentSaveParticipant {
  constructor(_logService, _notebooksAndEditors, _mainThreadBulkEdits, _thresholds = { timeout: 1500, errors: 3 }) {
    this._logService = _logService;
    this._notebooksAndEditors = _notebooksAndEditors;
    this._mainThreadBulkEdits = _mainThreadBulkEdits;
    this._thresholds = _thresholds;
  }
  static {
    __name(this, "ExtHostNotebookDocumentSaveParticipant");
  }
  _onWillSaveNotebookDocumentEvent = new AsyncEmitter();
  dispose() {
  }
  getOnWillSaveNotebookDocumentEvent(extension) {
    return (listener, thisArg, disposables) => {
      const wrappedListener = /* @__PURE__ */ __name(function wrapped(e) {
        listener.call(thisArg, e);
      }, "wrapped");
      wrappedListener.extension = extension;
      return this._onWillSaveNotebookDocumentEvent.event(wrappedListener, void 0, disposables);
    };
  }
  async $participateInSave(resource, reason, token) {
    const revivedUri = URI.revive(resource);
    const document = this._notebooksAndEditors.getNotebookDocument(revivedUri);
    if (!document) {
      throw new Error("Unable to resolve notebook document");
    }
    const edits = [];
    await this._onWillSaveNotebookDocumentEvent.fireAsync({ notebook: document.apiNotebook, reason: TextDocumentSaveReason.to(reason) }, token, async (thenable, listener) => {
      const now = Date.now();
      const data = await await Promise.resolve(thenable);
      if (Date.now() - now > this._thresholds.timeout) {
        this._logService.warn("onWillSaveNotebookDocument-listener from extension", listener.extension.identifier);
      }
      if (token.isCancellationRequested) {
        return;
      }
      if (data) {
        if (data instanceof WorkspaceEdit) {
          edits.push(data);
        } else {
          this._logService.warn("onWillSaveNotebookDocument-listener from extension", listener.extension.identifier, "ignored due to invalid data");
        }
      }
      return;
    });
    if (token.isCancellationRequested) {
      return false;
    }
    if (edits.length === 0) {
      return true;
    }
    const dto = { edits: [] };
    for (const edit of edits) {
      const { edits: edits2 } = WorksapceEditConverter.from(edit);
      dto.edits = dto.edits.concat(edits2);
    }
    return this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(new SerializableObjectWithBuffers(dto));
  }
}
export {
  ExtHostNotebookDocumentSaveParticipant
};
//# sourceMappingURL=extHostNotebookDocumentSaveParticipant.js.map
