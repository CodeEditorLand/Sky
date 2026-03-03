var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../browser/editorExtensions.js";
class LongLinesHelper extends Disposable {
  static {
    __name(this, "LongLinesHelper");
  }
  static {
    this.ID = "editor.contrib.longLinesHelper";
  }
  static get(editor) {
    return editor.getContribution(LongLinesHelper.ID);
  }
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(this._editor.onMouseDown((e) => {
      const stopRenderingLineAfter = this._editor.getOption(
        133
        /* EditorOption.stopRenderingLineAfter */
      );
      if (stopRenderingLineAfter >= 0 && e.target.type === 6 && e.target.position.column >= stopRenderingLineAfter) {
        this._editor.updateOptions({
          stopRenderingLineAfter: -1
        });
      }
    }));
  }
}
registerEditorContribution(
  LongLinesHelper.ID,
  LongLinesHelper,
  2
  /* EditorContributionInstantiation.BeforeFirstInteraction */
);
//# sourceMappingURL=longLinesHelper.js.map
