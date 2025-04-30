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
import { Disposable, DisposableStore } from "../../base/common/lifecycle.js";
import { Emitter } from "../../base/common/event.js";
import { IMenuService, SubmenuItemAction } from "../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../platform/contextkey/common/contextkey.js";
import { getActionBarActions } from "../../platform/actions/browser/menuEntryActionViewItem.js";
class MenuActions extends Disposable {
  static {
    __name(this, "MenuActions");
  }
  get primaryActions() {
    return this._primaryActions;
  }
  get secondaryActions() {
    return this._secondaryActions;
  }
  constructor(menuId, options, menuService, contextKeyService) {
    super();
    this.options = options;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this._primaryActions = [];
    this._secondaryActions = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.disposables = this._register(new DisposableStore());
    this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
    this._register(this.menu.onDidChange(() => this.updateActions()));
    this.updateActions();
  }
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
let CompositeMenuActions = class CompositeMenuActions2 extends Disposable {
  static {
    __name(this, "CompositeMenuActions");
  }
  constructor(menuId, contextMenuId, options, contextKeyService, menuService) {
    super();
    this.menuId = menuId;
    this.contextMenuId = contextMenuId;
    this.options = options;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.menuActions = this._register(new MenuActions(menuId, this.options, menuService, contextKeyService));
    this._register(this.menuActions.onDidChange(() => this._onDidChange.fire()));
  }
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
CompositeMenuActions = __decorate([
  __param(3, IContextKeyService),
  __param(4, IMenuService)
], CompositeMenuActions);
export {
  CompositeMenuActions
};
//# sourceMappingURL=actions.js.map
