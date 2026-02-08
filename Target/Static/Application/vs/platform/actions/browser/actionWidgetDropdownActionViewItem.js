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
import { $, append } from "../../../base/browser/dom.js";
import { BaseActionViewItem } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { getBaseLayerHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IActionWidgetService } from "../../actionWidget/browser/actionWidget.js";
import { ActionWidgetDropdown } from "../../actionWidget/browser/actionWidgetDropdown.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
let ActionWidgetDropdownActionViewItem = class ActionWidgetDropdownActionViewItem2 extends BaseActionViewItem {
  static {
    __name(this, "ActionWidgetDropdownActionViewItem");
  }
  constructor(action, actionWidgetOptions, _actionWidgetService, _keybindingService, _contextKeyService, _telemetryService) {
    super(void 0, action);
    this.actionWidgetOptions = actionWidgetOptions;
    this._actionWidgetService = _actionWidgetService;
    this._keybindingService = _keybindingService;
    this._contextKeyService = _contextKeyService;
    this._telemetryService = _telemetryService;
    this.actionItem = null;
  }
  render(container) {
    this.actionItem = container;
    const labelRenderer = /* @__PURE__ */ __name((el) => {
      this.element = append(el, $("a.action-label"));
      return this.renderLabel(this.element);
    }, "labelRenderer");
    this.actionWidgetDropdown = this._register(new ActionWidgetDropdown(container, { ...this.actionWidgetOptions, labelRenderer }, this._actionWidgetService, this._keybindingService, this._telemetryService));
    this._register(this.actionWidgetDropdown.onDidChangeVisibility((visible) => {
      this.element?.setAttribute("aria-expanded", `${visible}`);
    }));
    this.updateTooltip();
    this.updateEnabled();
  }
  renderLabel(element) {
    element.classList.add("codicon");
    if (this._action.label) {
      this._register(getBaseLayerHoverDelegate().setupManagedHover(this.options.hoverDelegate ?? getDefaultHoverDelegate("mouse"), element, this._action.label));
    }
    return null;
  }
  updateAriaLabel() {
    if (this.element) {
      this.setAriaLabelAttributes(this.element);
    }
  }
  setAriaLabelAttributes(element) {
    element.setAttribute("role", "button");
    element.setAttribute("aria-haspopup", "true");
    element.setAttribute("aria-expanded", "false");
    element.ariaLabel = this.getTooltip() + " - " + (element.textContent || this._action.label) || "";
  }
  getTooltip() {
    const tooltip = this.action.tooltip ?? this.action.label;
    return this._keybindingService.appendKeybinding(tooltip, this.action.id, this._contextKeyService);
  }
  show() {
    this.actionWidgetDropdown?.show();
  }
  updateEnabled() {
    const disabled = !this.action.enabled;
    this.actionItem?.classList.toggle("disabled", disabled);
    this.element?.classList.toggle("disabled", disabled);
    this.actionWidgetDropdown?.setEnabled(!disabled);
  }
};
ActionWidgetDropdownActionViewItem = __decorate([
  __param(2, IActionWidgetService),
  __param(3, IKeybindingService),
  __param(4, IContextKeyService),
  __param(5, ITelemetryService)
], ActionWidgetDropdownActionViewItem);
export {
  ActionWidgetDropdownActionViewItem
};
//# sourceMappingURL=actionWidgetDropdownActionViewItem.js.map
