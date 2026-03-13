var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../browser/editorExtensions.js";
import { MessageController } from "../../message/browser/messageController.js";
import * as nls from "../../../../nls.js";
class ReadOnlyMessageController extends Disposable {
  static {
    __name(this, "ReadOnlyMessageController");
  }
  static {
    this.ID = "editor.contrib.readOnlyMessageController";
  }
  constructor(editor) {
    super();
    this.editor = editor;
    this._register(this.editor.onDidAttemptReadOnlyEdit(() => this._onDidAttemptReadOnlyEdit()));
  }
  _onDidAttemptReadOnlyEdit() {
    const messageController = MessageController.get(this.editor);
    if (messageController && this.editor.hasModel()) {
      let message = this.editor.getOptions().get(
        105
        /* EditorOption.readOnlyMessage */
      );
      if (!message) {
        if (this.editor.isSimpleWidget) {
          message = new MarkdownString(nls.localize("editor.simple.readonly", "Cannot edit in read-only input"));
        } else {
          message = new MarkdownString(nls.localize("editor.readonly", "Cannot edit in read-only editor"));
        }
      }
      messageController.showMessage(message, this.editor.getPosition());
    }
  }
}
registerEditorContribution(
  ReadOnlyMessageController.ID,
  ReadOnlyMessageController,
  2
  /* EditorContributionInstantiation.BeforeFirstInteraction */
);
export {
  ReadOnlyMessageController
};
//# sourceMappingURL=contribution.js.map
