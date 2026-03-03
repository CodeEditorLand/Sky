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
import { getBaseLayerHoverDelegate } from "../../../../../../base/browser/ui/hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { BaseActionViewItem } from "../../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ModelPickerWidget } from "./chatModelPicker.js";
let EnhancedModelPickerActionItem = class EnhancedModelPickerActionItem2 extends BaseActionViewItem {
  static {
    __name(this, "EnhancedModelPickerActionItem");
  }
  constructor(action, delegate, pickerOptions, instantiationService, _contextKeyService, keybindingService) {
    super(void 0, action);
    this.pickerOptions = pickerOptions;
    this._contextKeyService = _contextKeyService;
    this.keybindingService = keybindingService;
    this._managedHover = this._register(new MutableDisposable());
    this._pickerWidget = this._register(instantiationService.createInstance(ModelPickerWidget, delegate));
    this._pickerWidget.setSelectedModel(delegate.currentModel.get());
    this._register(autorun((t) => {
      const model = delegate.currentModel.read(t);
      this._pickerWidget.setSelectedModel(model);
      this._updateTooltip();
    }));
    this._register(this._pickerWidget.onDidChangeSelection((model) => delegate.setModel(model)));
  }
  render(container) {
    this._pickerWidget.render(container);
    this.element = this._pickerWidget.domNode;
    this._updateTooltip();
    container.classList.add("chat-input-picker-item");
  }
  _getAnchorElement() {
    if (this.element && getActiveWindow().document.contains(this.element)) {
      return this.element;
    }
    return this.pickerOptions.getOverflowAnchor?.() ?? this.element;
  }
  openModelPicker() {
    this._showPicker();
  }
  show() {
    this._showPicker();
  }
  _showPicker() {
    this._pickerWidget.show(this._getAnchorElement());
  }
  _updateTooltip() {
    if (!this.element) {
      return;
    }
    const hoverContent = this._getHoverContents();
    if (typeof hoverContent === "string" && hoverContent) {
      this._managedHover.value = getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, hoverContent);
    } else {
      this._managedHover.clear();
    }
  }
  _getHoverContents() {
    let label = localize("chat.modelPicker.label", "Pick Model");
    const keybindingLabel = this.keybindingService.lookupKeybinding(this._action.id, this._contextKeyService)?.getLabel();
    if (keybindingLabel) {
      label += ` (${keybindingLabel})`;
    }
    const { statusIcon, tooltip } = this._pickerWidget.selectedModel?.metadata || {};
    return statusIcon && tooltip ? `${label} \u2022 ${tooltip}` : label;
  }
};
EnhancedModelPickerActionItem = __decorate([
  __param(3, IInstantiationService),
  __param(4, IContextKeyService),
  __param(5, IKeybindingService)
], EnhancedModelPickerActionItem);
export {
  EnhancedModelPickerActionItem
};
//# sourceMappingURL=modelPickerActionItem2.js.map
