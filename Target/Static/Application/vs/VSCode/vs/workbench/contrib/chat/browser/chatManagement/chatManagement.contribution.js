var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { isObject, isString } from "../../../../../base/common/types.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { EditorPaneDescriptor } from "../../../../browser/editor.js";
import { EditorExtensions } from "../../../../common/editor.js";
import { IEditorService, MODAL_GROUP } from "../../../../services/editor/common/editorService.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { CONTEXT_MODELS_EDITOR, CONTEXT_MODELS_SEARCH_FOCUS, MANAGE_CHAT_COMMAND_ID } from "../../common/constants.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { ChatManagementEditor, ModelsManagementEditor } from "./chatManagementEditor.js";
import { ChatManagementEditorInput, ModelsManagementEditorInput } from "./chatManagementEditorInput.js";
import { ILanguageModelsConfigurationService } from "../../common/languageModelsConfiguration.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
const languageModelsOpenSettingsIcon = registerIcon("language-models-open-settings", Codicon.goToFile, localize("languageModelsOpenSettings", "Icon for open language models settings commands."));
const LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ChatContextKeys.Entitlement.planFree, ChatContextKeys.Entitlement.planPro, ChatContextKeys.Entitlement.planProPlus, ChatContextKeys.Entitlement.planBusiness, ChatContextKeys.Entitlement.planEnterprise, ChatContextKeys.Entitlement.internal));
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
let ChatManagementActionsContribution = class ChatManagementActionsContribution2 extends Disposable {
  static {
    __name(this, "ChatManagementActionsContribution");
  }
  static {
    this.ID = "workbench.contrib.chatManagementActions";
  }
  constructor(languageModelsConfigurationService) {
    super();
    this.languageModelsConfigurationService = languageModelsConfigurationService;
    this.registerChatManagementActions();
    this.registerLanguageModelsEditorTitleActions();
  }
  registerChatManagementActions() {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: MANAGE_CHAT_COMMAND_ID,
          title: localize2("openAiManagement", "Manage Language Models"),
          category: CHAT_CATEGORY,
          precondition: LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION,
          f1: true
        });
      }
      async run(accessor, args) {
        const editorService = accessor.get(IEditorService);
        args = sanitizeOpenManageCopilotEditorArgs(args);
        return editorService.openEditor(new ModelsManagementEditorInput(), { pinned: true }, MODAL_GROUP);
      }
    }));
    this._register(registerAction2(class extends Action2 {
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
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.openLanguageModelsJson",
          title: localize2("openLanguageModelsJson", "Open Language Models (JSON)"),
          category: CHAT_CATEGORY,
          precondition: LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION,
          f1: true
        });
      }
      async run(accessor) {
        const languageModelsConfigurationService = accessor.get(ILanguageModelsConfigurationService);
        await languageModelsConfigurationService.configureLanguageModels();
      }
    }));
  }
  registerLanguageModelsEditorTitleActions() {
    const modelsConfigurationFile = this.languageModelsConfigurationService.configurationFile;
    const openModelsManagementEditorWhen = ContextKeyExpr.and(CONTEXT_MODELS_EDITOR.toNegated(), ResourceContextKey.Resource.isEqualTo(modelsConfigurationFile.toString()), ContextKeyExpr.not("isInDiffEditor"), LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION);
    MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
      command: {
        id: MANAGE_CHAT_COMMAND_ID,
        title: localize2("openAiManagement", "Manage Language Models"),
        icon: languageModelsOpenSettingsIcon
      },
      when: openModelsManagementEditorWhen,
      group: "navigation",
      order: 1
    });
    const openLanguageModelsJsonWhen = ContextKeyExpr.and(CONTEXT_MODELS_EDITOR, LANGUAGE_MODELS_ENTITLEMENT_PRECONDITION);
    MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
      command: {
        id: "workbench.action.openLanguageModelsJson",
        title: localize2("openLanguageModelsJson", "Open Language Models (JSON)"),
        icon: languageModelsOpenSettingsIcon
      },
      when: openLanguageModelsJsonWhen,
      group: "navigation",
      order: 1
    });
  }
};
ChatManagementActionsContribution = __decorate([
  __param(0, ILanguageModelsConfigurationService)
], ChatManagementActionsContribution);
registerWorkbenchContribution2(
  ChatManagementActionsContribution.ID,
  ChatManagementActionsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=chatManagement.contribution.js.map
