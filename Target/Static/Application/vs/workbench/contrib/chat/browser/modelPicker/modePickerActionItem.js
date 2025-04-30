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
import * as dom from "../../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { IActionWidgetService } from "../../../../../platform/actionWidget/browser/actionWidget.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { IChatAgentService } from "../../common/chatAgents.js";
import { ChatMode, modeToString } from "../../common/constants.js";
import { getOpenChatActionIdForMode } from "../actions/chatActions.js";
let ModePickerActionItem = class ModePickerActionItem2 extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ModePickerActionItem");
  }
  constructor(action, delegate, actionWidgetService, chatAgentService, keybindingService, contextKeyService) {
    const makeAction = /* @__PURE__ */ __name((mode) => ({
      ...action,
      id: getOpenChatActionIdForMode(mode),
      label: modeToString(mode),
      class: void 0,
      enabled: true,
      checked: delegate.getMode() === mode,
      run: /* @__PURE__ */ __name(async () => {
        const result = await action.run({ mode });
        this.renderLabel(this.element);
        return result;
      }, "run")
    }), "makeAction");
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const agentStateActions = [
          makeAction(ChatMode.Edit)
        ];
        if (chatAgentService.hasToolsAgent) {
          agentStateActions.push(makeAction(ChatMode.Agent));
        }
        agentStateActions.unshift(makeAction(ChatMode.Ask));
        return agentStateActions;
      }, "getActions")
    };
    const modelPickerActionWidgetOptions = {
      actionProvider,
      showItemKeybindings: false
    };
    super(action, modelPickerActionWidgetOptions, actionWidgetService, keybindingService, contextKeyService);
    this.delegate = delegate;
    this._register(delegate.onDidChangeMode(() => this.renderLabel(this.element)));
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const state = modeToString(this.delegate.getMode());
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
  __param(5, IContextKeyService)
], ModePickerActionItem);
export {
  ModePickerActionItem
};
//# sourceMappingURL=modePickerActionItem.js.map
