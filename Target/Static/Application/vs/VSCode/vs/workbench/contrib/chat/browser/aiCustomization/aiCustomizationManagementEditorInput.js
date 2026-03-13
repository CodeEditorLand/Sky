var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize } from "../../../../../nls.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
import { AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID } from "./aiCustomizationManagement.js";
class AICustomizationManagementEditorInput extends EditorInput {
  static {
    __name(this, "AICustomizationManagementEditorInput");
  }
  static {
    this.ID = AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID;
  }
  /**
   * Gets or creates the singleton instance of this input.
   */
  static getOrCreate() {
    if (!AICustomizationManagementEditorInput._instance || AICustomizationManagementEditorInput._instance.isDisposed()) {
      AICustomizationManagementEditorInput._instance = new AICustomizationManagementEditorInput();
    }
    return AICustomizationManagementEditorInput._instance;
  }
  constructor() {
    super();
    this.resource = void 0;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof AICustomizationManagementEditorInput;
  }
  get typeId() {
    return AICustomizationManagementEditorInput.ID;
  }
  getName() {
    return localize("aiCustomizationManagementEditorName", "Chat Customizations");
  }
  getIcon() {
    return Codicon.settingsGear;
  }
  async resolve() {
    return null;
  }
}
export {
  AICustomizationManagementEditorInput
};
//# sourceMappingURL=aiCustomizationManagementEditorInput.js.map
