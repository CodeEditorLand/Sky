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
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar, IActionViewItemProvider } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IAction } from "../../../../base/common/actions.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { TextOnlyMenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
let SuggestWidgetStatus = class {
  constructor(container, _menuId, instantiationService, _menuService, _contextKeyService) {
    this._menuId = _menuId;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this.element = dom.append(container, dom.$(".suggest-status-bar"));
    const actionViewItemProvider = /* @__PURE__ */ __name((action) => {
      return action instanceof MenuItemAction ? instantiationService.createInstance(TextOnlyMenuEntryActionViewItem, action, { useComma: true }) : void 0;
    }, "actionViewItemProvider");
    this._leftActions = new ActionBar(this.element, { actionViewItemProvider });
    this._rightActions = new ActionBar(this.element, { actionViewItemProvider });
    this._leftActions.domNode.classList.add("left");
    this._rightActions.domNode.classList.add("right");
  }
  static {
    __name(this, "SuggestWidgetStatus");
  }
  element;
  _leftActions;
  _rightActions;
  _menuDisposables = new DisposableStore();
  dispose() {
    this._menuDisposables.dispose();
    this._leftActions.dispose();
    this._rightActions.dispose();
    this.element.remove();
  }
  show() {
    const menu = this._menuService.createMenu(this._menuId, this._contextKeyService);
    const renderMenu = /* @__PURE__ */ __name(() => {
      const left = [];
      const right = [];
      for (const [group, actions] of menu.getActions()) {
        if (group === "left") {
          left.push(...actions);
        } else {
          right.push(...actions);
        }
      }
      this._leftActions.clear();
      this._leftActions.push(left);
      this._rightActions.clear();
      this._rightActions.push(right);
    }, "renderMenu");
    this._menuDisposables.add(menu.onDidChange(() => renderMenu()));
    this._menuDisposables.add(menu);
  }
  hide() {
    this._menuDisposables.clear();
  }
};
SuggestWidgetStatus = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService)
], SuggestWidgetStatus);
export {
  SuggestWidgetStatus
};
//# sourceMappingURL=suggestWidgetStatus.js.map
