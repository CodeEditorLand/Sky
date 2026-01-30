var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../../base/common/network.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ChatEditorInput } from "../widgetHosts/editor/chatEditorInput.js";
async function clearChatEditor(accessor, chatEditorInput) {
  const editorService = accessor.get(IEditorService);
  if (!chatEditorInput) {
    const editorInput = editorService.activeEditor;
    chatEditorInput = editorInput instanceof ChatEditorInput ? editorInput : void 0;
  }
  if (chatEditorInput instanceof ChatEditorInput) {
    const resource = chatEditorInput.sessionResource && chatEditorInput.sessionResource.scheme !== Schemas.vscodeLocalChatSession ? chatEditorInput.sessionResource.with({ path: `/untitled-${generateUuid()}` }) : ChatEditorInput.getNewEditorUri();
    const identifier = editorService.findEditors(chatEditorInput.resource)[0];
    await editorService.replaceEditors([{
      editor: chatEditorInput,
      replacement: { resource, options: { pinned: true } }
    }], identifier.groupId);
  }
}
__name(clearChatEditor, "clearChatEditor");
export {
  clearChatEditor
};
//# sourceMappingURL=chatClear.js.map
