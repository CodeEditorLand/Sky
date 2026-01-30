var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isObject, isString } from "../../../../../base/common/types.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../../browser/editor.js";
import { EditorExtensions } from "../../../../common/editor.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { CONTEXT_MODELS_EDITOR, CONTEXT_MODELS_SEARCH_FOCUS, MANAGE_CHAT_COMMAND_ID } from "../../common/constants.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { ChatManagementEditor, ModelsManagementEditor } from "./chatManagementEditor.js";
import { ChatManagementEditorInput, ModelsManagementEditorInput } from "./chatManagementEditorInput.js";
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ChatManagementEditor, ChatManagementEditor.ID, localize("chatManagementEditor", "Chat Management Editor")), [
  new SyncDescriptor(ChatManagementEditorInput)
]);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ModelsManagementEditor, ModelsManagementEditor.ID, localize("modelsManagementEditor", "Models Management Editor")), [
  new SyncDescriptor(ModelsManagementEditorInput)
]);
class ChatManagementEditorInputSerializer {
  static {
    __name(this, "ChatManagementEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(ChatManagementEditorInput);
  }
}
class ModelsManagementEditorInputSerializer {
  static {
    __name(this, "ModelsManagementEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(ModelsManagementEditorInput);
  }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ChatManagementEditorInput.ID, ChatManagementEditorInputSerializer);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ModelsManagementEditorInput.ID, ModelsManagementEditorInputSerializer);
function sanitizeString(arg) {
  return isString(arg) ? arg : void 0;
}
__name(sanitizeString, "sanitizeString");
function sanitizeOpenManageCopilotEditorArgs(input) {
  if (!isObject(input)) {
    input = {};
  }
  const args = input;
  return {
    query: sanitizeString(args?.query),
    section: sanitizeString(args?.section)
  };
}
__name(sanitizeOpenManageCopilotEditorArgs, "sanitizeOpenManageCopilotEditorArgs");
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: MANAGE_CHAT_COMMAND_ID,
      title: localize2("openAiManagement", "Manage Language Models"),
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ChatContextKeys.Entitlement.planFree, ChatContextKeys.Entitlement.planPro, ChatContextKeys.Entitlement.planProPlus, ChatContextKeys.Entitlement.internal)),
      f1: true
    });
  }
  async run(accessor, args) {
    const editorGroupsService = accessor.get(IEditorGroupsService);
    args = sanitizeOpenManageCopilotEditorArgs(args);
    return editorGroupsService.activeGroup.openEditor(new ModelsManagementEditorInput(), { pinned: true });
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "chat.models.action.clearSearchResults",
      precondition: CONTEXT_MODELS_EDITOR,
      keybinding: {
        primary: 9,
        weight: 100,
        when: CONTEXT_MODELS_SEARCH_FOCUS
      },
      title: localize2("models.clearResults", "Clear Models Search Results")
    });
  }
  run(accessor) {
    const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
    if (activeEditorPane instanceof ModelsManagementEditor) {
      activeEditorPane.clearSearch();
    }
    return null;
  }
});
//# sourceMappingURL=chatManagement.contribution.js.map
