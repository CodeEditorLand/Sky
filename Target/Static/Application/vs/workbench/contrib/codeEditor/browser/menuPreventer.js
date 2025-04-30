var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
class MenuPreventer extends Disposable {
  static {
    __name(this, "MenuPreventer");
  }
  static {
    this.ID = "editor.contrib.menuPreventer";
  }
  constructor(editor) {
    super();
    this._editor = editor;
    this._altListeningMouse = false;
    this._altMouseTriggered = false;
    this._register(this._editor.onMouseDown((e) => {
      if (this._altListeningMouse) {
        this._altMouseTriggered = true;
      }
    }));
    this._register(this._editor.onKeyDown((e) => {
      if (e.equals(
        512
        /* KeyMod.Alt */
      )) {
        if (!this._altListeningMouse) {
          this._altMouseTriggered = false;
        }
        this._altListeningMouse = true;
      }
    }));
    this._register(this._editor.onKeyUp((e) => {
      if (e.equals(
        512
        /* KeyMod.Alt */
      )) {
        if (this._altMouseTriggered) {
          e.preventDefault();
        }
        this._altListeningMouse = false;
        this._altMouseTriggered = false;
      }
    }));
  }
}
registerEditorContribution(
  MenuPreventer.ID,
  MenuPreventer,
  2
  /* EditorContributionInstantiation.BeforeFirstInteraction */
);
export {
  MenuPreventer
};
//# sourceMappingURL=menuPreventer.js.map
