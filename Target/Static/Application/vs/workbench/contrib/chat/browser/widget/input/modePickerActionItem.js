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
import * as dom from "../../../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { coalesce } from "../../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { groupBy } from "../../../../../../base/common/collections.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { getFlatActionBarActions } from "../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { IProductService } from "../../../../../../platform/product/common/productService.js";
import { IChatAgentService } from "../../../common/participants/chatAgents.js";
import { ChatMode, IChatModeService } from "../../../common/chatModes.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../../common/constants.js";
import { ExtensionAgentSourceType, PromptsStorage } from "../../../common/promptSyntax/service/promptsService.js";
import { getOpenChatActionIdForMode } from "../../actions/chatActions.js";
import { ToggleAgentModeActionId } from "../../actions/chatExecuteActions.js";
import { ChatInputPickerActionViewItem } from "./chatInputPickerActionItem.js";
const builtinDefaultIcon = Codicon.tasklist;
let ModePickerActionItem = class ModePickerActionItem2 extends ChatInputPickerActionViewItem {
  static {
    __name(this, "ModePickerActionItem");
  }
  constructor(action, delegate, pickerOptions, actionWidgetService, chatAgentService, keybindingService, configurationService, contextKeyService, chatModeService, menuService, commandService, _productService) {
    const builtInCategory = { label: localize("built-in", "Built-In"), order: 0 };
    const customCategory = { label: localize("custom", "Custom"), order: 1 };
    const policyDisabledCategory = { label: localize("managedByOrganization", "Managed by your organization"), order: 999, showHeader: true };
    const agentModeDisabledViaPolicy = configurationService.inspect(ChatConfiguration.AgentEnabled).policyValue === false;
    const makeAction = /* @__PURE__ */ __name((mode, currentMode) => {
      const isDisabledViaPolicy = mode.kind === ChatModeKind.Agent && agentModeDisabledViaPolicy;
      const tooltip = chatAgentService.getDefaultAgent(ChatAgentLocation.Chat, mode.kind)?.description ?? action.tooltip;
      return {
        ...action,
        id: getOpenChatActionIdForMode(mode),
        label: mode.label.get(),
        icon: isDisabledViaPolicy ? ThemeIcon.fromId(Codicon.lock.id) : mode.icon.get(),
        class: isDisabledViaPolicy ? "disabled-by-policy" : void 0,
        enabled: !isDisabledViaPolicy,
        checked: !isDisabledViaPolicy && currentMode.id === mode.id,
        tooltip,
        run: /* @__PURE__ */ __name(async () => {
          if (isDisabledViaPolicy) {
            return;
          }
          const result = await commandService.executeCommand(ToggleAgentModeActionId, { modeId: mode.id, sessionResource: this.delegate.sessionResource() });
          if (this.element) {
            this.renderLabel(this.element);
          }
          return result;
        }, "run"),
        category: isDisabledViaPolicy ? policyDisabledCategory : builtInCategory
      };
    }, "makeAction");
    const makeActionFromCustomMode = /* @__PURE__ */ __name((mode, currentMode) => {
      return {
        ...makeAction(mode, currentMode),
        tooltip: mode.description.get() ?? chatAgentService.getDefaultAgent(ChatAgentLocation.Chat, mode.kind)?.description ?? action.tooltip,
        icon: mode.icon.get() ?? (isModeConsideredBuiltIn(mode, this._productService) ? builtinDefaultIcon : void 0),
        category: agentModeDisabledViaPolicy ? policyDisabledCategory : customCategory
      };
    }, "makeActionFromCustomMode");
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const modes = chatModeService.getModes();
        const currentMode = delegate.currentMode.get();
        const agentMode = modes.builtin.find((mode) => mode.id === ChatMode.Agent.id);
        const otherBuiltinModes = modes.builtin.filter((mode) => mode.id !== ChatMode.Agent.id);
        const customModes = groupBy(modes.custom, (mode) => isModeConsideredBuiltIn(mode, this._productService) ? "builtin" : "custom");
        const customBuiltinModeActions = customModes.builtin?.map((mode) => {
          const action2 = makeActionFromCustomMode(mode, currentMode);
          action2.category = agentModeDisabledViaPolicy ? policyDisabledCategory : builtInCategory;
          return action2;
        }) ?? [];
        const orderedModes = coalesce([
          agentMode && makeAction(agentMode, currentMode),
          ...otherBuiltinModes.map((mode) => mode && makeAction(mode, currentMode)),
          ...customBuiltinModeActions,
          ...customModes.custom?.map((mode) => makeActionFromCustomMode(mode, currentMode)) ?? []
        ]);
        return orderedModes;
      }, "getActions")
    };
    const modePickerActionWidgetOptions = {
      actionProvider,
      actionBarActionProvider: {
        getActions: /* @__PURE__ */ __name(() => this.getModePickerActionBarActions(), "getActions")
      },
      showItemKeybindings: true
    };
    super(action, modePickerActionWidgetOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService);
    this.delegate = delegate;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this._productService = _productService;
    this._register(autorun((reader) => {
      this.delegate.currentMode.read(reader).label.read(reader);
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  getModePickerActionBarActions() {
    const menuActions = this.menuService.createMenu(MenuId.ChatModePicker, this.contextKeyService);
    const menuContributions = getFlatActionBarActions(menuActions.getActions({ renderShortTitle: true }));
    menuActions.dispose();
    return menuContributions;
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const currentMode = this.delegate.currentMode.get();
    const isDefault = currentMode.id === ChatMode.Agent.id;
    const state = currentMode.label.get();
    let icon = currentMode.icon.get();
    if (!icon && isModeConsideredBuiltIn(currentMode, this._productService)) {
      icon = builtinDefaultIcon;
    }
    const labelElements = [];
    if (icon) {
      labelElements.push(...renderLabelWithIcons(`$(${icon.id})`));
    }
    if (!isDefault || !icon) {
      labelElements.push(dom.$("span.chat-input-picker-label", void 0, state));
    }
    labelElements.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...labelElements);
    return null;
  }
};
ModePickerActionItem = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IChatAgentService),
  __param(5, IKeybindingService),
  __param(6, IConfigurationService),
  __param(7, IContextKeyService),
  __param(8, IChatModeService),
  __param(9, IMenuService),
  __param(10, ICommandService),
  __param(11, IProductService)
], ModePickerActionItem);
function isModeConsideredBuiltIn(mode, productService) {
  if (mode.isBuiltin) {
    return true;
  }
  return mode.source?.storage === PromptsStorage.extension && mode.source.extensionId.value === productService.defaultChatAgent?.chatExtensionId && mode.source.type === ExtensionAgentSourceType.contribution;
}
__name(isModeConsideredBuiltIn, "isModeConsideredBuiltIn");
export {
  ModePickerActionItem
};
//# sourceMappingURL=modePickerActionItem.js.map
