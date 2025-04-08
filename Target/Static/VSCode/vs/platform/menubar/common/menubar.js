var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
function isMenubarMenuItemSubmenu(menuItem) {
  return menuItem.submenu !== void 0;
}
__name(isMenubarMenuItemSubmenu, "isMenubarMenuItemSubmenu");
function isMenubarMenuItemSeparator(menuItem) {
  return menuItem.id === "vscode.menubar.separator";
}
__name(isMenubarMenuItemSeparator, "isMenubarMenuItemSeparator");
function isMenubarMenuItemRecentAction(menuItem) {
  return menuItem.uri !== void 0;
}
__name(isMenubarMenuItemRecentAction, "isMenubarMenuItemRecentAction");
function isMenubarMenuItemAction(menuItem) {
  return !isMenubarMenuItemSubmenu(menuItem) && !isMenubarMenuItemSeparator(menuItem) && !isMenubarMenuItemRecentAction(menuItem);
}
__name(isMenubarMenuItemAction, "isMenubarMenuItemAction");
export {
  isMenubarMenuItemAction,
  isMenubarMenuItemRecentAction,
  isMenubarMenuItemSeparator,
  isMenubarMenuItemSubmenu
};
//# sourceMappingURL=menubar.js.map
