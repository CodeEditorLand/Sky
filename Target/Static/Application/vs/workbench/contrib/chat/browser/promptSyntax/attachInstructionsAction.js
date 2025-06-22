var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatViewId, IChatWidgetService, showChatView } from "../chat.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { localize, localize2 } from "../../../../../nls.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { PromptFilePickers } from "./pickers/promptFilePickers.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { getCleanPromptName } from "../../common/promptSyntax/config/promptFileLocations.js";
import { INSTRUCTIONS_LANGUAGE_ID, PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { compare } from "../../../../../base/common/strings.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { dirname } from "../../../../../base/common/resources.js";
import { toPromptFileVariableEntry } from "../../common/chatVariableEntries.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
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
const ATTACH_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.attach.instructions";
const CONFIGURE_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.configure.instructions";
class AttachInstructionsAction extends Action2 {
  static {
    __name(this, "AttachInstructionsAction");
  }
  constructor() {
    super({
      id: ATTACH_INSTRUCTIONS_ACTION_ID,
      title: localize2("attach-instructions.capitalized.ellipses", "Attach Instructions..."),
      f1: false,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY,
      keybinding: {
        primary: 2048 | 512 | 90,
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
      }
    });
  }
  async run(accessor, options) {
    const viewsService = accessor.get(IViewsService);
    const instaService = accessor.get(IInstantiationService);
    if (!options) {
      options = {
        resource: getActiveInstructionsFileUri(accessor),
        widget: getFocusedChatWidget(accessor)
      };
    }
    const pickers = instaService.createInstance(PromptFilePickers);
    const { skipSelectionDialog, resource } = options;
    const widget = options.widget ?? await showChatView(viewsService);
    if (!widget) {
      return;
    }
    if (skipSelectionDialog && resource) {
      widget.attachmentModel.addContext(toPromptFileVariableEntry(resource, true));
      widget.focusInput();
      return;
    }
    const placeholder = localize("commands.instructions.select-dialog.placeholder", "Select instructions files to attach");
    const result = await pickers.selectPromptFile({ resource, placeholder, type: PromptsType.instructions });
    if (result !== void 0) {
      widget.attachmentModel.addContext(toPromptFileVariableEntry(result.promptFile, true));
      widget.focusInput();
    }
  }
}
class ManageInstructionsFilesAction extends Action2 {
  static {
    __name(this, "ManageInstructionsFilesAction");
  }
  constructor() {
    super({
      id: CONFIGURE_INSTRUCTIONS_ACTION_ID,
      title: localize2("configure-instructions", "Configure Instructions..."),
      icon: Codicon.bookmark,
      f1: true,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
        order: 11,
        group: "2_manage"
      }
    });
  }
  async run(accessor) {
    const openerService = accessor.get(IOpenerService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const placeholder = localize("commands.prompt.manage-dialog.placeholder", "Select the instructions file to open");
    const result = await pickers.selectPromptFile({ placeholder, type: PromptsType.instructions, optionEdit: false });
    if (result !== void 0) {
      await openerService.open(result.promptFile);
    }
  }
}
function getFocusedChatWidget(accessor) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const { lastFocusedWidget } = chatWidgetService;
  if (!lastFocusedWidget) {
    return void 0;
  }
  if (!lastFocusedWidget.hasInputFocus()) {
    return void 0;
  }
  return lastFocusedWidget;
}
__name(getFocusedChatWidget, "getFocusedChatWidget");
function getActiveInstructionsFileUri(accessor) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const model = codeEditorService.getActiveCodeEditor()?.getModel();
  if (model?.getLanguageId() === INSTRUCTIONS_LANGUAGE_ID) {
    return model.uri;
  }
  return void 0;
}
__name(getActiveInstructionsFileUri, "getActiveInstructionsFileUri");
function registerAttachPromptActions() {
  registerAction2(AttachInstructionsAction);
  registerAction2(ManageInstructionsFilesAction);
}
__name(registerAttachPromptActions, "registerAttachPromptActions");
let ChatInstructionsPickerPick = class ChatInstructionsPickerPick2 {
  static {
    __name(this, "ChatInstructionsPickerPick");
  }
  constructor(promptsService, labelService, configurationService) {
    this.promptsService = promptsService;
    this.labelService = labelService;
    this.configurationService = configurationService;
    this.type = "pickerPick";
    this.label = localize("chatContext.attach.instructions.label", "Instructions...");
    this.icon = Codicon.bookmark;
    this.commandId = ATTACH_INSTRUCTIONS_ACTION_ID;
  }
  isEnabled(widget) {
    return PromptsConfig.enabled(this.configurationService);
  }
  asPicker() {
    const picks = this.promptsService.listPromptFiles(PromptsType.instructions, CancellationToken.None).then((value) => {
      const result = [];
      value = value.slice(0).sort((a, b) => compare(a.storage, b.storage));
      let storageType;
      for (const { uri, storage } of value) {
        if (storageType !== storage) {
          storageType = storage;
          result.push({
            type: "separator",
            label: storage === "user" ? localize("user-data-dir.capitalized", "User data folder") : this.labelService.getUriLabel(dirname(uri), { relative: true })
          });
        }
        result.push({
          label: getCleanPromptName(uri),
          asAttachment: /* @__PURE__ */ __name(() => {
            return toPromptFileVariableEntry(uri, true);
          }, "asAttachment")
        });
      }
      return result;
    });
    return {
      placeholder: localize("placeholder", "Select instructions files to attach"),
      picks,
      configure: {
        label: localize("configureInstructions", "Configure Instructions..."),
        commandId: CONFIGURE_INSTRUCTIONS_ACTION_ID
      }
    };
  }
};
ChatInstructionsPickerPick = __decorate([
  __param(0, IPromptsService),
  __param(1, ILabelService),
  __param(2, IConfigurationService)
], ChatInstructionsPickerPick);
export {
  ChatInstructionsPickerPick,
  registerAttachPromptActions
};
//# sourceMappingURL=attachInstructionsAction.js.map
