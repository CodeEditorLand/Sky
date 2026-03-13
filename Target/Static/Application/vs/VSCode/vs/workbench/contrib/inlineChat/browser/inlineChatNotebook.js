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
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { InlineChatController } from "./inlineChatController.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import { CellUri } from "../../notebook/common/notebookCommon.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
let InlineChatNotebookContribution = class InlineChatNotebookContribution2 {
  static {
    __name(this, "InlineChatNotebookContribution");
  }
  constructor(sessionService, editorService, notebookEditorService) {
    this._store = new DisposableStore();
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
InlineChatNotebookContribution = __decorate([
  __param(0, IInlineChatSessionService),
  __param(1, IEditorService),
  __param(2, INotebookEditorService)
], InlineChatNotebookContribution);
export {
  InlineChatNotebookContribution
};
//# sourceMappingURL=inlineChatNotebook.js.map
