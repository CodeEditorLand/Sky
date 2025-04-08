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
import { IAction } from "../../base/common/actions.js";
import { Disposable, DisposableStore, IDisposable } from "../../base/common/lifecycle.js";
import { Emitter, Event } from "../../base/common/event.js";
import { MenuId, IMenuService, IMenu, SubmenuItemAction, IMenuActionOptions } from "../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../platform/contextkey/common/contextkey.js";
import { getActionBarActions } from "../../platform/actions/browser/menuEntryActionViewItem.js";
class MenuActions extends Disposable {
  constructor(menuId, options, menuService, contextKeyService) {
    super();
    this.options = options;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
    this._register(this.menu.onDidChange(() => this.updateActions()));
    this.updateActions();
  }
  static {
    __name(this, "MenuActions");
  }
  menu;
  _primaryActions = [];
  get primaryActions() {
    return this._primaryActions;
  }
  _secondaryActions = [];
  get secondaryActions() {
    return this._secondaryActions;
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  disposables = this._register(new DisposableStore());
  updateActions() {
    this.disposables.clear();
    const newActions = getActionBarActions(this.menu.getActions(this.options));
    this._primaryActions = newActions.primary;
    this._secondaryActions = newActions.secondary;
    this.disposables.add(this.updateSubmenus([...this._primaryActions, ...this._secondaryActions], {}));
    this._onDidChange.fire();
  }
  updateSubmenus(actions, submenus) {
    const disposables = new DisposableStore();
    for (const action of actions) {
      if (action instanceof SubmenuItemAction && !submenus[action.item.submenu.id]) {
        const menu = submenus[action.item.submenu.id] = disposables.add(this.menuService.createMenu(action.item.submenu, this.contextKeyService));
        disposables.add(menu.onDidChange(() => this.updateActions()));
        disposables.add(this.updateSubmenus(action.actions, submenus));
      }
    }
    return disposables;
  }
}
let CompositeMenuActions = class extends Disposable {
  constructor(menuId, contextMenuId, options, contextKeyService, menuService) {
    super();
    this.menuId = menuId;
    this.contextMenuId = contextMenuId;
    this.options = options;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.menuActions = this._register(new MenuActions(menuId, this.options, menuService, contextKeyService));
    this._register(this.menuActions.onDidChange(() => this._onDidChange.fire()));
  }
  static {
    __name(this, "CompositeMenuActions");
  }
  menuActions;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  getPrimaryActions() {
    return this.menuActions.primaryActions;
  }
  getSecondaryActions() {
    return this.menuActions.secondaryActions;
  }
  getContextMenuActions() {
    if (this.contextMenuId) {
      const menu = this.menuService.getMenuActions(this.contextMenuId, this.contextKeyService, this.options);
      return getActionBarActions(menu).secondary;
    }
    return [];
  }
};
CompositeMenuActions = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMenuService)
], CompositeMenuActions);
export {
  CompositeMenuActions
};
//# sourceMappingURL=actions.js.map
