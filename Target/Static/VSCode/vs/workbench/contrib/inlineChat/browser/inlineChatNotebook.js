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
import { illegalState } from "../../../../base/common/errors.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isEqual } from "../../../../base/common/resources.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { InlineChatController } from "./inlineChatController.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import { CellUri } from "../../notebook/common/notebookCommon.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { NotebookTextDiffEditor } from "../../notebook/browser/diff/notebookDiffEditor.js";
import { NotebookMultiTextDiffEditor } from "../../notebook/browser/diff/notebookMultiDiffEditor.js";
let InlineChatNotebookContribution = class {
  static {
    __name(this, "InlineChatNotebookContribution");
  }
  _store = new DisposableStore();
  constructor(sessionService, editorService, notebookEditorService) {
    this._store.add(sessionService.registerSessionKeyComputer(Schemas.vscodeNotebookCell, {
      getComparisonKey: /* @__PURE__ */ __name((editor, uri) => {
        const data = CellUri.parse(uri);
        if (!data) {
          throw illegalState("Expected notebook cell uri");
        }
        let fallback;
        for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
          if (notebookEditor.hasModel() && isEqual(notebookEditor.textModel.uri, data.notebook)) {
            const candidate = `<notebook>${notebookEditor.getId()}#${uri}`;
            if (!fallback) {
              fallback = candidate;
            }
            if (notebookEditor.codeEditors.find((tuple) => tuple[1] === editor)) {
              return candidate;
            }
          }
        }
        if (fallback) {
          return fallback;
        }
        const activeEditor = editorService.activeEditorPane;
        if (activeEditor && (activeEditor.getId() === NotebookTextDiffEditor.ID || activeEditor.getId() === NotebookMultiTextDiffEditor.ID)) {
          return `<notebook>${editor.getId()}#${uri}`;
        }
        throw illegalState("Expected notebook editor");
      }, "getComparisonKey")
    }));
    this._store.add(sessionService.onWillStartSession((newSessionEditor) => {
      const candidate = CellUri.parse(newSessionEditor.getModel().uri);
      if (!candidate) {
        return;
      }
      for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
        if (isEqual(notebookEditor.textModel?.uri, candidate.notebook)) {
          let found = false;
          const editors = [];
          for (const [, codeEditor] of notebookEditor.codeEditors) {
            editors.push(codeEditor);
            found = codeEditor === newSessionEditor || found;
          }
          if (found) {
            for (const editor of editors) {
              if (editor !== newSessionEditor) {
                InlineChatController.get(editor)?.acceptSession();
              }
            }
            break;
          }
        }
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
InlineChatNotebookContribution = __decorateClass([
  __decorateParam(0, IInlineChatSessionService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, INotebookEditorService)
], InlineChatNotebookContribution);
export {
  InlineChatNotebookContribution
};
//# sourceMappingURL=inlineChatNotebook.js.map
