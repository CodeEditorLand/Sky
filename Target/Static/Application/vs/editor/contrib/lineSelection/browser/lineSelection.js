var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorAction, registerEditorAction } from "../../../browser/editorExtensions.js";
import { CursorMoveCommands } from "../../../common/cursor/cursorMoveCommands.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import * as nls from "../../../../nls.js";
class ExpandLineSelectionAction extends EditorAction {
  static {
    __name(this, "ExpandLineSelectionAction");
  }
  constructor() {
    super({
      id: "expandLineSelection",
      label: nls.localize2("expandLineSelection", "Expand Line Selection"),
      precondition: void 0,
      kbOpts: {
        weight: 0,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 | 42
        /* KeyCode.KeyL */
      }
    });
  }
  run(_accessor, editor, args) {
    args = args || {};
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    viewModel.model.pushStackElement();
    viewModel.setCursorStates(args.source, 3, CursorMoveCommands.expandLineSelection(viewModel, viewModel.getCursorStates()));
    viewModel.revealAllCursors(args.source, true);
  }
}
registerEditorAction(ExpandLineSelectionAction);
export {
  ExpandLineSelectionAction
};
//# sourceMappingURL=lineSelection.js.map
