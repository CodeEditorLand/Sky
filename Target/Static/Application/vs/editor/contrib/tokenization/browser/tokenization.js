var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { EditorAction, registerEditorAction } from "../../../browser/editorExtensions.js";
import * as nls from "../../../../nls.js";
class ForceRetokenizeAction extends EditorAction {
  static {
    __name(this, "ForceRetokenizeAction");
  }
  constructor() {
    super({
      id: "editor.action.forceRetokenize",
      label: nls.localize2("forceRetokenize", "Developer: Force Retokenize"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    model.tokenization.resetTokenization();
    const sw = new StopWatch();
    model.tokenization.forceTokenization(model.getLineCount());
    sw.stop();
    console.log(`tokenization took ${sw.elapsed()}`);
  }
}
registerEditorAction(ForceRetokenizeAction);
//# sourceMappingURL=tokenization.js.map
