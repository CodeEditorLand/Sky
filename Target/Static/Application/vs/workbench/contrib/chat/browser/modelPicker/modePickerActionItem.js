var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { localize } from "../../../../../nls.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { getFlatActionBarActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IActionWidgetService } from "../../../../../platform/actionWidget/browser/actionWidget.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IChatAgentService } from "../../common/chatAgents.js";
import { IChatModeService } from "../../common/chatModes.js";
import { ChatAgentLocation, modeToString } from "../../common/constants.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { getOpenChatActionIdForMode } from "../actions/chatActions.js";
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
let ModePickerActionItem = class ModePickerActionItem2 extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ModePickerActionItem");
  }
  constructor(action, delegate, actionWidgetService, chatAgentService, keybindingService, contextKeyService, promptsService, chatModeService, menuService) {
    const makeAction = /* @__PURE__ */ __name((mode, includeCategory) => ({
      ...action,
      id: getOpenChatActionIdForMode(mode),
      label: modeToString(mode),
      class: void 0,
      enabled: true,
      checked: delegate.getMode().id === mode,
      tooltip: chatAgentService.getDefaultAgent(ChatAgentLocation.Panel, mode)?.description ?? action.tooltip,
      run: /* @__PURE__ */ __name(async () => {
        const result = await action.run({ mode });
        this.renderLabel(this.element);
        return result;
      }, "run"),
      category: includeCategory ? { label: localize("built-in", "Built-In"), order: 0 } : void 0
    }), "makeAction");
    const makeActionFromCustomMode = /* @__PURE__ */ __name((mode) => ({
      ...action,
      id: getOpenChatActionIdForMode(mode.name),
      label: mode.name,
      class: void 0,
      enabled: true,
      checked: delegate.getMode().id === mode.id,
      tooltip: mode.description ?? chatAgentService.getDefaultAgent(ChatAgentLocation.Panel, mode.kind)?.description ?? action.tooltip,
      run: /* @__PURE__ */ __name(async () => {
        const result = await action.run({ mode });
        this.renderLabel(this.element);
        return result;
      }, "run"),
      category: { label: localize("custom", "Custom"), order: 1 }
    }), "makeActionFromCustomMode");
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const modes = chatModeService.getModes();
        const hasCustomModes = modes.custom && modes.custom.length > 0;
        const agentStateActions = modes.builtin.map((mode) => makeAction(mode.kind, !!hasCustomModes));
        if (modes.custom) {
          agentStateActions.push(...modes.custom.map((mode) => makeActionFromCustomMode(mode)));
        }
        return agentStateActions;
      }, "getActions")
    };
    const modePickerActionWidgetOptions = {
      actionProvider,
      actionBarActionProvider: {
        getActions: /* @__PURE__ */ __name(() => this.getModePickerActionBarActions(), "getActions")
      },
      showItemKeybindings: true
    };
    super(action, modePickerActionWidgetOptions, actionWidgetService, keybindingService, contextKeyService);
    this.delegate = delegate;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this._register(delegate.onDidChangeMode(() => this.renderLabel(this.element)));
  }
  getModePickerActionBarActions() {
    const menuActions = this.menuService.createMenu(MenuId.ChatModePicker, this.contextKeyService);
    const menuContributions = getFlatActionBarActions(menuActions.getActions({ renderShortTitle: true }));
    menuActions.dispose();
    return menuContributions;
  }
  renderLabel(element) {
    if (!this.element) {
      return null;
    }
    this.setAriaLabelAttributes(element);
    const state = this.delegate.getMode().name;
    dom.reset(element, dom.$("span.chat-model-label", void 0, state), ...renderLabelWithIcons(`$(chevron-down)`));
    return null;
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-modelPicker-item");
  }
};
ModePickerActionItem = __decorate([
  __param(2, IActionWidgetService),
  __param(3, IChatAgentService),
  __param(4, IKeybindingService),
  __param(5, IContextKeyService),
  __param(6, IPromptsService),
  __param(7, IChatModeService),
  __param(8, IMenuService)
], ModePickerActionItem);
export {
  ModePickerActionItem
};
//# sourceMappingURL=modePickerActionItem.js.map
