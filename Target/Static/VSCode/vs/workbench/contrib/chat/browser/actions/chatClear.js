var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatEditorOptions } from "../chatEditor.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
async function clearChatEditor(accessor, chatEditorInput) {
  const editorService = accessor.get(IEditorService);
  if (!chatEditorInput) {
    const editorInput = editorService.activeEditor;
    chatEditorInput = editorInput instanceof ChatEditorInput ? editorInput : void 0;
  }
  if (chatEditorInput instanceof ChatEditorInput) {
    const identifier = editorService.findEditors(chatEditorInput.resource)[0];
    await editorService.replaceEditors([{
      editor: chatEditorInput,
      replacement: { resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true } }
    }], identifier.groupId);
  }
}
__name(clearChatEditor, "clearChatEditor");
export {
  clearChatEditor
};
//# sourceMappingURL=chatClear.js.map
