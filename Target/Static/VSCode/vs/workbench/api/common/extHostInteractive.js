var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI, UriComponents } from "../../../base/common/uri.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostInteractiveShape, IMainContext } from "./extHost.protocol.js";
import { ApiCommand, ApiCommandArgument, ApiCommandResult, ExtHostCommands } from "./extHostCommands.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { ExtHostNotebookController } from "./extHostNotebook.js";
import { NotebookEditor } from "vscode";
class ExtHostInteractive {
  constructor(mainContext, _extHostNotebooks, _textDocumentsAndEditors, _commands, _logService) {
    this._extHostNotebooks = _extHostNotebooks;
    this._textDocumentsAndEditors = _textDocumentsAndEditors;
    this._commands = _commands;
    const openApiCommand = new ApiCommand(
      "interactive.open",
      "_interactive.open",
      "Open interactive window and return notebook editor and input URI",
      [
        new ApiCommandArgument("showOptions", "Show Options", (v) => true, (v) => v),
        new ApiCommandArgument("resource", "Interactive resource Uri", (v) => true, (v) => v),
        new ApiCommandArgument("controllerId", "Notebook controller Id", (v) => true, (v) => v),
        new ApiCommandArgument("title", "Interactive editor title", (v) => true, (v) => v)
      ],
      new ApiCommandResult("Notebook and input URI", (v) => {
        _logService.debug("[ExtHostInteractive] open iw with notebook editor id", v.notebookEditorId);
        if (v.notebookEditorId !== void 0) {
          const editor = this._extHostNotebooks.getEditorById(v.notebookEditorId);
          _logService.debug("[ExtHostInteractive] notebook editor found", editor.id);
          return { notebookUri: URI.revive(v.notebookUri), inputUri: URI.revive(v.inputUri), notebookEditor: editor.apiEditor };
        }
        _logService.debug("[ExtHostInteractive] notebook editor not found, uris for the interactive document", v.notebookUri, v.inputUri);
        return { notebookUri: URI.revive(v.notebookUri), inputUri: URI.revive(v.inputUri) };
      })
    );
    this._commands.registerApiCommand(openApiCommand);
  }
  static {
    __name(this, "ExtHostInteractive");
  }
  $willAddInteractiveDocument(uri, eol, languageId, notebookUri) {
    this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
      addedDocuments: [{
        EOL: eol,
        lines: [""],
        languageId,
        uri,
        isDirty: false,
        versionId: 1,
        encoding: "utf8"
      }]
    });
  }
  $willRemoveInteractiveDocument(uri, notebookUri) {
    this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
      removedDocuments: [uri]
    });
  }
}
export {
  ExtHostInteractive
};
//# sourceMappingURL=extHostInteractive.js.map
