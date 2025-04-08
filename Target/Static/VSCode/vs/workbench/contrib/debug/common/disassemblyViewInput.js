var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorInput } from "../../../common/editor/editorInput.js";
import { localize } from "../../../../nls.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const DisassemblyEditorIcon = registerIcon("disassembly-editor-label-icon", Codicon.debug, localize("disassemblyEditorLabelIcon", "Icon of the disassembly editor label."));
class DisassemblyViewInput extends EditorInput {
  static {
    __name(this, "DisassemblyViewInput");
  }
  static ID = "debug.disassemblyView.input";
  get typeId() {
    return DisassemblyViewInput.ID;
  }
  static _instance;
  static get instance() {
    if (!DisassemblyViewInput._instance || DisassemblyViewInput._instance.isDisposed()) {
      DisassemblyViewInput._instance = new DisassemblyViewInput();
    }
    return DisassemblyViewInput._instance;
  }
  resource = void 0;
  getName() {
    return localize("disassemblyInputName", "Disassembly");
  }
  getIcon() {
    return DisassemblyEditorIcon;
  }
  matches(other) {
    return other instanceof DisassemblyViewInput;
  }
}
export {
  DisassemblyViewInput
};
//# sourceMappingURL=disassemblyViewInput.js.map
