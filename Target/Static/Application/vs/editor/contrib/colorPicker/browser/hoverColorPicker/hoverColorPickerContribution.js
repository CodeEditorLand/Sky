var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Range } from "../../../../common/core/range.js";
import { ContentHoverController } from "../../../hover/browser/contentHoverController.js";
import { isOnColorDecorator } from "./hoverColorPicker.js";
class HoverColorPickerContribution extends Disposable {
  static {
    __name(this, "HoverColorPickerContribution");
  }
  static {
    this.ID = "editor.contrib.colorContribution";
  }
  static {
    this.RECOMPUTE_TIME = 1e3;
  }
  // ms
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(_editor.onMouseDown((e) => this.onMouseDown(e)));
  }
  dispose() {
    super.dispose();
  }
  onMouseDown(mouseEvent) {
    const colorDecoratorsActivatedOn = this._editor.getOption(
      154
      /* EditorOption.colorDecoratorsActivatedOn */
    );
    if (colorDecoratorsActivatedOn !== "click" && colorDecoratorsActivatedOn !== "clickAndHover") {
      return;
    }
    if (!isOnColorDecorator(mouseEvent)) {
      return;
    }
    const hoverController = this._editor.getContribution(ContentHoverController.ID);
    if (!hoverController) {
      return;
    }
    if (hoverController.isColorPickerVisible) {
      return;
    }
    const targetRange = mouseEvent.target.range;
    if (!targetRange) {
      return;
    }
    const range = new Range(targetRange.startLineNumber, targetRange.startColumn + 1, targetRange.endLineNumber, targetRange.endColumn + 1);
    hoverController.showContentHover(range, 1, 1, false);
  }
}
export {
  HoverColorPickerContribution
};
//# sourceMappingURL=hoverColorPickerContribution.js.map
