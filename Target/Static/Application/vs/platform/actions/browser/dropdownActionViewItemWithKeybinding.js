var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DropdownMenuActionViewItem } from "../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import * as nls from "../../../nls.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
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
let DropdownMenuActionViewItemWithKeybinding = class DropdownMenuActionViewItemWithKeybinding2 extends DropdownMenuActionViewItem {
  static {
    __name(this, "DropdownMenuActionViewItemWithKeybinding");
  }
  constructor(action, menuActionsOrProvider, contextMenuProvider, options = /* @__PURE__ */ Object.create(null), keybindingService, contextKeyService) {
    super(action, menuActionsOrProvider, contextMenuProvider, options);
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
  }
  getTooltip() {
    const keybinding = this.keybindingService.lookupKeybinding(this.action.id, this.contextKeyService);
    const keybindingLabel = keybinding && keybinding.getLabel();
    const tooltip = this.action.tooltip ?? this.action.label;
    return keybindingLabel ? nls.localize("titleAndKb", "{0} ({1})", tooltip, keybindingLabel) : tooltip;
  }
};
DropdownMenuActionViewItemWithKeybinding = __decorate([
  __param(4, IKeybindingService),
  __param(5, IContextKeyService)
], DropdownMenuActionViewItemWithKeybinding);
export {
  DropdownMenuActionViewItemWithKeybinding
};
//# sourceMappingURL=dropdownActionViewItemWithKeybinding.js.map
