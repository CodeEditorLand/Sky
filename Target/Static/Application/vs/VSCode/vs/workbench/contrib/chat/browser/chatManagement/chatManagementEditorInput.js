var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import * as nls from "../../../../../nls.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
const ChatManagementEditorIcon = registerIcon("ai-management-editor-label-icon", Codicon.copilot, nls.localize("aiManagementEditorLabelIcon", "Icon of the AI Management editor label."));
const ModelsManagementEditorIcon = registerIcon("models-management-editor-label-icon", Codicon.settings, nls.localize("modelsManagementEditorLabelIcon", "Icon of the Models Management editor label."));
const CHAT_MANAGEMENT_SECTION_USAGE = "usage";
const CHAT_MANAGEMENT_SECTION_MODELS = "models";
class ChatManagementEditorInput extends EditorInput {
  static {
    __name(this, "ChatManagementEditorInput");
  }
  static {
    this.ID = "workbench.input.chatManagement";
  }
  constructor() {
    super();
    this.resource = void 0;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof ChatManagementEditorInput;
  }
  get typeId() {
    return ChatManagementEditorInput.ID;
  }
  getName() {
    return nls.localize("aiManagementEditorInputName", "Manage Copilot");
  }
  getIcon() {
    return ChatManagementEditorIcon;
  }
  async resolve() {
    return null;
  }
}
class ModelsManagementEditorInput extends EditorInput {
  static {
    __name(this, "ModelsManagementEditorInput");
  }
  static {
    this.ID = "workbench.input.modelsManagement";
  }
  constructor() {
    super();
    this.resource = void 0;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof ModelsManagementEditorInput;
  }
  get typeId() {
    return ModelsManagementEditorInput.ID;
  }
  getName() {
    return nls.localize("modelsManagementEditorInputName", "Language Models");
  }
  getIcon() {
    return ModelsManagementEditorIcon;
  }
  async resolve() {
    return null;
  }
}
export {
  CHAT_MANAGEMENT_SECTION_MODELS,
  CHAT_MANAGEMENT_SECTION_USAGE,
  ChatManagementEditorInput,
  ModelsManagementEditorInput
};
//# sourceMappingURL=chatManagementEditorInput.js.map
