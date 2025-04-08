var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyMod } from "../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { IEditorContribution } from "../../../../editor/common/editorCommon.js";
class MenuPreventer extends Disposable {
  static {
    __name(this, "MenuPreventer");
  }
  static ID = "editor.contrib.menuPreventer";
  _editor;
  _altListeningMouse;
  _altMouseTriggered;
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
      if (e.equals(KeyMod.Alt)) {
        if (!this._altListeningMouse) {
          this._altMouseTriggered = false;
        }
        this._altListeningMouse = true;
      }
    }));
    this._register(this._editor.onKeyUp((e) => {
      if (e.equals(KeyMod.Alt)) {
        if (this._altMouseTriggered) {
          e.preventDefault();
        }
        this._altListeningMouse = false;
        this._altMouseTriggered = false;
      }
    }));
  }
}
registerEditorContribution(MenuPreventer.ID, MenuPreventer, EditorContributionInstantiation.BeforeFirstInteraction);
export {
  MenuPreventer
};
//# sourceMappingURL=menuPreventer.js.map
