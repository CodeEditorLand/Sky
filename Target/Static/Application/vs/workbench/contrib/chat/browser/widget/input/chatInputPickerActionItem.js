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
import { getActiveWindow } from "../../../../../../base/browser/dom.js";
import { ActionWidgetDropdownActionViewItem } from "../../../../../../platform/actions/browser/actionWidgetDropdownActionViewItem.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
let ChatInputPickerActionViewItem = class ChatInputPickerActionViewItem2 extends ActionWidgetDropdownActionViewItem {
  static {
    __name(this, "ChatInputPickerActionViewItem");
  }
  constructor(action, actionWidgetOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService) {
    const optionsWithAnchor = {
      ...actionWidgetOptions,
      getAnchor: /* @__PURE__ */ __name(() => this.getAnchorElement(), "getAnchor")
    };
    super(action, optionsWithAnchor, actionWidgetService, keybindingService, contextKeyService);
    this.pickerOptions = pickerOptions;
  }
  /**
   * Returns the anchor element for the dropdown.
   * Falls back to the overflow anchor if this element is not in the DOM.
   */
  getAnchorElement() {
    if (this.element && getActiveWindow().document.contains(this.element)) {
      return this.element;
    }
    return this.pickerOptions.getOverflowAnchor?.() ?? this.element;
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-input-picker-item");
  }
};
ChatInputPickerActionViewItem = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IKeybindingService),
  __param(5, IContextKeyService)
], ChatInputPickerActionViewItem);
export {
  ChatInputPickerActionViewItem
};
//# sourceMappingURL=chatInputPickerActionItem.js.map
