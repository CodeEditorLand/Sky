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
import { $, addDisposableListener, append, EventType } from "../../../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../../../base/browser/keyboardEvent.js";
import { ActionViewItem, BaseActionViewItem } from "../../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Action } from "../../../../../../base/common/actions.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { IActionViewItemService } from "../../../../../../platform/actions/browser/actionViewItemService.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { MenuId, SubmenuItemAction } from "../../../../../../platform/actions/common/actions.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { ChatConfiguration } from "../../../common/constants.js";
import { ChatSubmitAction } from "../../actions/chatExecuteActions.js";
import { ChatQueueMessageAction, ChatSteerWithMessageAction } from "../../actions/chatQueueActions.js";
let ChatQueuePickerActionItem = class ChatQueuePickerActionItem2 extends BaseActionViewItem {
  static {
    __name(this, "ChatQueuePickerActionItem");
  }
  constructor(action, _options, commandService, configurationService, actionWidgetService, keybindingService, contextKeyService, telemetryService) {
    super(void 0, action);
    this.commandService = commandService;
    this.configurationService = configurationService;
    const isSteerDefault = this._isSteerDefault();
    this._primaryActionAction = this._register(new Action("chat.queuePickerPrimary", isSteerDefault ? localize("chat.steerWithMessage", "Steer with Message") : localize("chat.queueMessage", "Add to Queue"), ThemeIcon.asClassName(Codicon.arrowUp), !!contextKeyService.getContextKeyValue(ChatContextKeys.inputHasText.key), () => this._runDefaultAction()));
    this._primaryAction = this._register(new ActionViewItem(void 0, this._primaryActionAction, { icon: true, label: false }));
    this._register(contextKeyService.onDidChangeContext((e) => {
      this._primaryActionAction.enabled = !!contextKeyService.getContextKeyValue(ChatContextKeys.inputHasText.key);
    }));
    const dropdownAction = this._register(new Action("chat.queuePickerDropdown", localize("chat.queuePicker.moreActions", "More Actions...")));
    this._dropdown = this._register(new ChevronActionWidgetDropdown(dropdownAction, {
      actionProvider: { getActions: /* @__PURE__ */ __name(() => this._getDropdownActions(), "getActions") },
      showItemKeybindings: true
    }, actionWidgetService, keybindingService, contextKeyService, telemetryService));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.RequestQueueingDefaultAction)) {
        this._updatePrimaryAction();
      }
    }));
  }
  _isSteerDefault() {
    return this.configurationService.getValue(ChatConfiguration.RequestQueueingDefaultAction) === "steer";
  }
  _updatePrimaryAction() {
    const isSteerDefault = this._isSteerDefault();
    this._primaryActionAction.label = isSteerDefault ? localize("chat.steerWithMessage", "Steer with Message") : localize("chat.queueMessage", "Add to Queue");
  }
  _runDefaultAction() {
    const actionId = this._isSteerDefault() ? ChatSteerWithMessageAction.ID : ChatQueueMessageAction.ID;
    this.commandService.executeCommand(actionId);
  }
  render(container) {
    super.render(container);
    container.classList.add("monaco-dropdown-with-default");
    const primaryContainer = $(".action-container");
    this._primaryAction.render(append(container, primaryContainer));
    this._register(addDisposableListener(primaryContainer, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        17
        /* KeyCode.RightArrow */
      )) {
        this._primaryAction.blur();
        this._dropdown.focus();
        event.stopPropagation();
      }
    }));
    const dropdownContainer = $(".dropdown-action-container");
    this._dropdown.render(append(container, dropdownContainer));
    this._register(addDisposableListener(dropdownContainer, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        15
        /* KeyCode.LeftArrow */
      )) {
        this._dropdown.setFocusable(false);
        this._primaryAction.focus();
        event.stopPropagation();
      }
    }));
  }
  focus(fromRight) {
    if (fromRight) {
      this._dropdown.focus();
    } else {
      this._primaryAction.focus();
    }
  }
  blur() {
    this._primaryAction.blur();
    this._dropdown.blur();
  }
  setFocusable(focusable) {
    this._primaryAction.setFocusable(focusable);
    this._dropdown.setFocusable(focusable);
  }
  _getDropdownActions() {
    const queueAction = {
      id: ChatQueueMessageAction.ID,
      label: localize("chat.queueMessage", "Add to Queue"),
      tooltip: "",
      enabled: true,
      icon: Codicon.add,
      class: void 0,
      hover: {
        content: localize("chat.queueMessage.hover", "Queue this message to send after the current request completes. The current response will finish uninterrupted before the queued message is sent.")
      },
      run: /* @__PURE__ */ __name(() => {
        this.commandService.executeCommand(ChatQueueMessageAction.ID);
      }, "run")
    };
    const steerAction = {
      id: ChatSteerWithMessageAction.ID,
      label: localize("chat.steerWithMessage", "Steer with Message"),
      tooltip: "",
      enabled: true,
      icon: Codicon.arrowRight,
      class: void 0,
      hover: {
        content: localize("chat.steerWithMessage.hover", "Send this message at the next opportunity, signaling the current request to yield. The current response will stop and the new message will be sent immediately.")
      },
      run: /* @__PURE__ */ __name(() => {
        this.commandService.executeCommand(ChatSteerWithMessageAction.ID);
      }, "run")
    };
    const sendAction = {
      id: "_" + ChatSubmitAction.ID,
      // _ to avoid showing a keybinding which is not valid in this context
      label: localize("chat.sendImmediately", "Stop and Send"),
      tooltip: "",
      enabled: true,
      icon: Codicon.arrowUp,
      class: void 0,
      hover: {
        content: localize("chat.sendImmediately.hover", "Cancel the current request and send this message immediately.")
      },
      run: /* @__PURE__ */ __name(() => {
        this.commandService.executeCommand(ChatSubmitAction.ID);
      }, "run")
    };
    return [sendAction, queueAction, steerAction];
  }
};
ChatQueuePickerActionItem = __decorate([
  __param(2, ICommandService),
  __param(3, IConfigurationService),
  __param(4, IActionWidgetService),
  __param(5, IKeybindingService),
  __param(6, IContextKeyService),
  __param(7, ITelemetryService)
], ChatQueuePickerActionItem);
class ChevronActionWidgetDropdown extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ChevronActionWidgetDropdown");
  }
  renderLabel(element) {
    element.classList.add("codicon", "codicon-chevron-down");
    return null;
  }
}
let ChatQueuePickerRendering = class ChatQueuePickerRendering2 extends Disposable {
  static {
    __name(this, "ChatQueuePickerRendering");
  }
  static {
    this.ID = "chat.queuePickerRendering";
  }
  constructor(actionViewItemService) {
    super();
    this._register(actionViewItemService.register(MenuId.ChatExecute, MenuId.ChatExecuteQueue, (action, options, instantiationService) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChatQueuePickerActionItem, action, options);
    }));
  }
};
ChatQueuePickerRendering = __decorate([
  __param(0, IActionViewItemService)
], ChatQueuePickerRendering);
export {
  ChatQueuePickerActionItem,
  ChatQueuePickerRendering
};
//# sourceMappingURL=chatQueuePickerActionItem.js.map
