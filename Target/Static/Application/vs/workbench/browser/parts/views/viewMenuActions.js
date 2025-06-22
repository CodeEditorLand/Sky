var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { getActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuId, IMenuService } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IViewDescriptorService, ViewContainerLocationToString } from "../../../common/views.js";
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
let ViewMenuActions = class ViewMenuActions2 extends Disposable {
  static {
    __name(this, "ViewMenuActions");
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
    this.menu = this._register(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true }));
    this._register(this.menu.onDidChange(() => {
      this.actions = void 0;
      this._onDidChange.fire();
    }));
  }
  getActions() {
    if (!this.actions) {
      this.actions = getActionBarActions(this.menu.getActions(this.options));
    }
    return this.actions;
  }
  getPrimaryActions() {
    return this.getActions().primary;
  }
  getSecondaryActions() {
    return this.getActions().secondary;
  }
  getContextMenuActions() {
    if (this.contextMenuId) {
      const menu = this.menuService.getMenuActions(this.contextMenuId, this.contextKeyService, this.options);
      return getActionBarActions(menu).secondary;
    }
    return [];
  }
};
ViewMenuActions = __decorate([
  __param(3, IContextKeyService),
  __param(4, IMenuService)
], ViewMenuActions);
let ViewContainerMenuActions = class ViewContainerMenuActions2 extends ViewMenuActions {
  static {
    __name(this, "ViewContainerMenuActions");
  }
  constructor(element, viewContainer, viewDescriptorService, contextKeyService, menuService) {
    const scopedContextKeyService = contextKeyService.createScoped(element);
    scopedContextKeyService.createKey("viewContainer", viewContainer.id);
    const viewContainerLocationKey = scopedContextKeyService.createKey("viewContainerLocation", ViewContainerLocationToString(viewDescriptorService.getViewContainerLocation(viewContainer)));
    super(MenuId.ViewContainerTitle, MenuId.ViewContainerTitleContext, { shouldForwardArgs: true, renderShortTitle: true }, scopedContextKeyService, menuService);
    this._register(scopedContextKeyService);
    this._register(Event.filter(viewDescriptorService.onDidChangeContainerLocation, (e) => e.viewContainer === viewContainer)(() => viewContainerLocationKey.set(ViewContainerLocationToString(viewDescriptorService.getViewContainerLocation(viewContainer)))));
  }
};
ViewContainerMenuActions = __decorate([
  __param(2, IViewDescriptorService),
  __param(3, IContextKeyService),
  __param(4, IMenuService)
], ViewContainerMenuActions);
export {
  ViewContainerMenuActions,
  ViewMenuActions
};
//# sourceMappingURL=viewMenuActions.js.map
