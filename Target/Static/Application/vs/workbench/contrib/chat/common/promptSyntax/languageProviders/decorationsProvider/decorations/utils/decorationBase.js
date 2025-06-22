var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ModelDecorationOptions } from "../../../../../../../../../editor/common/model/textModel.js";
class DecorationBase {
  static {
    __name(this, "DecorationBase");
  }
  /**
   * Indicates whether the decoration spans the whole line(s).
   */
  get isWholeLine() {
    return false;
  }
  /**
   * Hover message of the decoration.
   */
  get hoverMessage() {
    return null;
  }
  constructor(accessor, token) {
    this.token = token;
    this.id = accessor.addDecoration(this.range, this.decorationOptions);
  }
  /**
   * Range of the decoration.
   */
  get range() {
    return this.token.range;
  }
  /**
   * Changes the decoration in the editor.
   */
  change(accessor) {
    accessor.changeDecorationOptions(this.id, this.decorationOptions);
    return this;
  }
  /**
   * Removes associated editor decoration(s).
   */
  remove(accessor) {
    accessor.removeDecoration(this.id);
    return this;
  }
  /**
   * Get editor decoration options for this decorator.
   */
  get decorationOptions() {
    return ModelDecorationOptions.createDynamic({
      description: this.description,
      hoverMessage: this.hoverMessage,
      className: this.className,
      inlineClassName: this.inlineClassName,
      isWholeLine: this.isWholeLine,
      stickiness: 1,
      shouldFillLineOnLineBreak: true
    });
  }
}
export {
  DecorationBase
};
//# sourceMappingURL=decorationBase.js.map
