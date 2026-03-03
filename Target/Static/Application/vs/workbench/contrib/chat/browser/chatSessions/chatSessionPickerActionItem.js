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
import "./media/chatSessionPickerActionItem.css";
import * as dom from "../../../../../base/browser/dom.js";
import { IActionWidgetService } from "../../../../../platform/actionWidget/browser/actionWidget.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { renderLabelWithIcons, renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { localize } from "../../../../../nls.js";
let ChatSessionPickerActionItem = class ChatSessionPickerActionItem2 extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ChatSessionPickerActionItem");
  }
  constructor(action, initialState, delegate, actionWidgetService, contextKeyService, keybindingService, commandService, telemetryService) {
    const { group, item } = initialState;
    const actionWithLabel = {
      ...action,
      label: item?.name || group.name,
      tooltip: item?.description ?? group.description ?? group.name,
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    };
    const sessionPickerActionWidgetOptions = {
      actionProvider: {
        getActions: /* @__PURE__ */ __name(() => this.getDropdownActions(), "getActions")
      },
      actionBarActionProvider: void 0,
      reporter: { id: group.id, name: `ChatSession:${group.name}`, includeOptions: false }
    };
    super(actionWithLabel, sessionPickerActionWidgetOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.delegate = delegate;
    this.commandService = commandService;
    this.currentOption = item;
    this._register(this.delegate.onDidChangeOption((newOption) => {
      this.currentOption = newOption;
      if (this.element) {
        this.renderLabel(this.element);
      }
      this.updateEnabled();
    }));
  }
  /**
   * Returns the actions to show in the dropdown. Can be overridden by subclasses.
   */
  getDropdownActions() {
    const currentOption = this.delegate.getCurrentOption();
    if (currentOption?.locked) {
      return [this.createLockedOptionAction(currentOption)];
    }
    const group = this.delegate.getOptionGroup();
    if (!group) {
      return [];
    }
    const actions = group.items.map((optionItem) => {
      const isCurrent = optionItem.id === currentOption?.id;
      return {
        id: optionItem.id,
        enabled: !optionItem.locked,
        icon: optionItem.icon,
        checked: isCurrent,
        class: void 0,
        description: optionItem.description,
        tooltip: optionItem.description ?? optionItem.name,
        label: optionItem.name,
        run: /* @__PURE__ */ __name(() => {
          this.delegate.setOption(optionItem);
        }, "run")
      };
    });
    if (group.commands?.length) {
      const addSeparator = actions.length > 0;
      for (const command of group.commands) {
        const args = command.arguments ? [...command.arguments] : [];
        const sessionResource = this.delegate.getSessionResource();
        if (sessionResource) {
          args.unshift(sessionResource);
        }
        actions.push({
          id: command.command,
          enabled: true,
          checked: false,
          class: void 0,
          description: void 0,
          tooltip: command.tooltip ?? command.title,
          label: command.title,
          // Use category to create a separator before commands (only if there are options)
          category: addSeparator ? { label: "", order: Number.MAX_SAFE_INTEGER } : void 0,
          run: /* @__PURE__ */ __name(() => {
            this.commandService.executeCommand(command.command, ...args);
          }, "run")
        });
      }
    }
    return actions;
  }
  /**
   * Creates a disabled action for a locked option.
   */
  createLockedOptionAction(option) {
    return {
      id: option.id,
      enabled: false,
      icon: option.icon,
      checked: true,
      class: void 0,
      description: option.description,
      tooltip: option.description ?? option.name,
      label: option.name,
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    };
  }
  renderLabel(element) {
    const domChildren = [];
    element.classList.add("chat-session-option-picker");
    const group = this.delegate.getOptionGroup();
    const isDefaultWithIcon = this.currentOption?.default && this.currentOption?.icon;
    if (this.currentOption?.icon) {
      domChildren.push(renderIcon(this.currentOption.icon));
    }
    if (!isDefaultWithIcon) {
      domChildren.push(dom.$("span.chat-session-option-label", void 0, this.currentOption?.name ?? group?.description ?? localize("chat.sessionPicker.label", "Pick Option")));
    }
    domChildren.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...domChildren);
    this.setAriaLabelAttributes(element);
    return null;
  }
  render(container) {
    this.container = container;
    super.render(container);
    container.classList.add(this.getContainerClass());
    if (this.currentOption?.locked) {
      container.classList.add("locked");
    }
  }
  /**
   * Returns the CSS class to add to the container. Can be overridden by subclasses.
   */
  getContainerClass() {
    return "chat-sessionPicker-item";
  }
  updateEnabled() {
    const originalEnabled = this.action.enabled;
    if (this.currentOption?.locked) {
      this.action.enabled = false;
    }
    super.updateEnabled();
    this.action.enabled = originalEnabled;
    if (this.container) {
      this.container.classList.toggle("locked", !!this.currentOption?.locked);
    }
  }
};
ChatSessionPickerActionItem = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IContextKeyService),
  __param(5, IKeybindingService),
  __param(6, ICommandService),
  __param(7, ITelemetryService)
], ChatSessionPickerActionItem);
export {
  ChatSessionPickerActionItem
};
//# sourceMappingURL=chatSessionPickerActionItem.js.map
