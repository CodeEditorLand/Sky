var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IContextMenuProvider } from "../../../base/browser/contextmenu.js";
import { IActionProvider } from "../../../base/browser/ui/dropdown/dropdown.js";
import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from "../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { IAction } from "../../../base/common/actions.js";
import * as nls from "../../../nls.js";
import { IContextKeyService } from "../../contextkey/common/contextkey.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
let DropdownMenuActionViewItemWithKeybinding = class extends DropdownMenuActionViewItem {
  constructor(action, menuActionsOrProvider, contextMenuProvider, options = /* @__PURE__ */ Object.create(null), keybindingService, contextKeyService) {
    super(action, menuActionsOrProvider, contextMenuProvider, options);
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "DropdownMenuActionViewItemWithKeybinding");
  }
  getTooltip() {
    const keybinding = this.keybindingService.lookupKeybinding(this.action.id, this.contextKeyService);
    const keybindingLabel = keybinding && keybinding.getLabel();
    const tooltip = this.action.tooltip ?? this.action.label;
    return keybindingLabel ? nls.localize("titleAndKb", "{0} ({1})", tooltip, keybindingLabel) : tooltip;
  }
};
DropdownMenuActionViewItemWithKeybinding = __decorateClass([
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService)
], DropdownMenuActionViewItemWithKeybinding);
export {
  DropdownMenuActionViewItemWithKeybinding
};
//# sourceMappingURL=dropdownActionViewItemWithKeybinding.js.map
