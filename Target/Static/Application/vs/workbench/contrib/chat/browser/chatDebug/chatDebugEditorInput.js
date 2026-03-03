var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
import { EditorInput } from "../../../../common/editor/editorInput.js";
const chatDebugEditorIcon = registerIcon("chat-debug-editor-label-icon", Codicon.bug, localize("chatDebugEditorLabelIcon", "Icon of the chat debug editor label."));
class ChatDebugEditorInput extends EditorInput {
  static {
    __name(this, "ChatDebugEditorInput");
  }
  constructor() {
    super(...arguments);
    this.resource = ChatDebugEditorInput.RESOURCE;
  }
  static {
    this.ID = "workbench.editor.chatDebug";
  }
  static {
    this.RESOURCE = URI.from({
      scheme: "chat-debug",
      path: "default"
    });
  }
  static get instance() {
    if (!ChatDebugEditorInput._instance || ChatDebugEditorInput._instance.isDisposed()) {
      ChatDebugEditorInput._instance = new ChatDebugEditorInput();
    }
    return ChatDebugEditorInput._instance;
  }
  get typeId() {
    return ChatDebugEditorInput.ID;
  }
  get editorId() {
    return ChatDebugEditorInput.ID;
  }
  get capabilities() {
    return 2 | 8;
  }
  getName() {
    return localize("chatDebugInputName", "Agent Debug Panel");
  }
  getIcon() {
    return chatDebugEditorIcon;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof ChatDebugEditorInput;
  }
}
class ChatDebugEditorInputSerializer {
  static {
    __name(this, "ChatDebugEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return ChatDebugEditorInput.instance;
  }
}
export {
  ChatDebugEditorInput,
  ChatDebugEditorInputSerializer
};
//# sourceMappingURL=chatDebugEditorInput.js.map
