var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DecorationBase } from "./decorationBase.js";
class ReactiveDecorationBase extends DecorationBase {
  static {
    __name(this, "ReactiveDecorationBase");
  }
  /**
   * Whether the decoration has changed since the last {@link change}.
   */
  get changed() {
    for (const marker of this.childDecorators) {
      if (marker instanceof ReactiveDecorationBase === false) {
        continue;
      }
      if (marker.changed === true) {
        return true;
      }
    }
    return this.didChange;
  }
  constructor(accessor, token) {
    super(accessor, token);
    this.didChange = true;
    this.childDecorators = [];
  }
  /**
   * Whether cursor is currently inside the decoration range.
   */
  get active() {
    return true;
  }
  /**
   * Set cursor position and update {@link changed} property if needed.
   */
  setCursorPosition(position) {
    if (this.cursorPosition === position) {
      return false;
    }
    if (this.cursorPosition && position) {
      if (this.cursorPosition.equals(position)) {
        return false;
      }
    }
    const wasActive = this.active;
    this.cursorPosition = position;
    this.didChange = wasActive !== this.active;
    return this.changed;
  }
  change(accessor) {
    if (this.didChange === false) {
      return this;
    }
    super.change(accessor);
    this.didChange = false;
    for (const marker of this.childDecorators) {
      marker.change(accessor);
    }
    return this;
  }
  remove(accessor) {
    super.remove(accessor);
    for (const marker of this.childDecorators) {
      marker.remove(accessor);
    }
    return this;
  }
  get className() {
    return this.active ? this.classNames.Main : this.classNames.MainInactive;
  }
  get inlineClassName() {
    return this.active ? this.classNames.Inline : this.classNames.InlineInactive;
  }
}
export {
  ReactiveDecorationBase
};
//# sourceMappingURL=reactiveDecorationBase.js.map
