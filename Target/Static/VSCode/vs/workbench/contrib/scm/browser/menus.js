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
import { IAction } from "../../../../base/common/actions.js";
import { equals } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable, dispose } from "../../../../base/common/lifecycle.js";
import "./media/scm.css";
import { localize } from "../../../../nls.js";
import { getActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenu, IMenuService, MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ISCMMenus, ISCMProvider, ISCMRepository, ISCMRepositoryMenus, ISCMResource, ISCMResourceGroup, ISCMService } from "../common/scm.js";
function actionEquals(a, b) {
  return a.id === b.id;
}
__name(actionEquals, "actionEquals");
let SCMTitleMenu = class {
  static {
    __name(this, "SCMTitleMenu");
  }
  _actions = [];
  get actions() {
    return this._actions;
  }
  _secondaryActions = [];
  get secondaryActions() {
    return this._secondaryActions;
  }
  _onDidChangeTitle = new Emitter();
  onDidChangeTitle = this._onDidChangeTitle.event;
  menu;
  disposables = new DisposableStore();
  constructor(menuService, contextKeyService) {
    this.menu = menuService.createMenu(MenuId.SCMTitle, contextKeyService);
    this.disposables.add(this.menu);
    this.menu.onDidChange(this.updateTitleActions, this, this.disposables);
    this.updateTitleActions();
  }
  updateTitleActions() {
    const { primary, secondary } = getActionBarActions(this.menu.getActions({ shouldForwardArgs: true }));
    if (equals(primary, this._actions, actionEquals) && equals(secondary, this._secondaryActions, actionEquals)) {
      return;
    }
    this._actions = primary;
    this._secondaryActions = secondary;
    this._onDidChangeTitle.fire();
  }
  dispose() {
    this.disposables.dispose();
  }
};
SCMTitleMenu = __decorateClass([
  __decorateParam(0, IMenuService),
  __decorateParam(1, IContextKeyService)
], SCMTitleMenu);
class SCMMenusItem {
  constructor(contextKeyService, menuService) {
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
  }
  static {
    __name(this, "SCMMenusItem");
  }
  _resourceFolderMenu;
  get resourceFolderMenu() {
    if (!this._resourceFolderMenu) {
      this._resourceFolderMenu = this.menuService.createMenu(MenuId.SCMResourceFolderContext, this.contextKeyService);
    }
    return this._resourceFolderMenu;
  }
  genericResourceGroupMenu;
  contextualResourceGroupMenus;
  genericResourceMenu;
  contextualResourceMenus;
  getResourceGroupMenu(resourceGroup) {
    if (typeof resourceGroup.contextValue === "undefined") {
      if (!this.genericResourceGroupMenu) {
        this.genericResourceGroupMenu = this.menuService.createMenu(MenuId.SCMResourceGroupContext, this.contextKeyService);
      }
      return this.genericResourceGroupMenu;
    }
    if (!this.contextualResourceGroupMenus) {
      this.contextualResourceGroupMenus = /* @__PURE__ */ new Map();
    }
    let item = this.contextualResourceGroupMenus.get(resourceGroup.contextValue);
    if (!item) {
      const contextKeyService = this.contextKeyService.createOverlay([["scmResourceGroupState", resourceGroup.contextValue]]);
      const menu = this.menuService.createMenu(MenuId.SCMResourceGroupContext, contextKeyService);
      item = {
        menu,
        dispose() {
          menu.dispose();
        }
      };
      this.contextualResourceGroupMenus.set(resourceGroup.contextValue, item);
    }
    return item.menu;
  }
  getResourceMenu(resource) {
    if (typeof resource.contextValue === "undefined") {
      if (!this.genericResourceMenu) {
        this.genericResourceMenu = this.menuService.createMenu(MenuId.SCMResourceContext, this.contextKeyService);
      }
      return this.genericResourceMenu;
    }
    if (!this.contextualResourceMenus) {
      this.contextualResourceMenus = /* @__PURE__ */ new Map();
    }
    let item = this.contextualResourceMenus.get(resource.contextValue);
    if (!item) {
      const contextKeyService = this.contextKeyService.createOverlay([["scmResourceState", resource.contextValue]]);
      const menu = this.menuService.createMenu(MenuId.SCMResourceContext, contextKeyService);
      item = {
        menu,
        dispose() {
          menu.dispose();
        }
      };
      this.contextualResourceMenus.set(resource.contextValue, item);
    }
    return item.menu;
  }
  dispose() {
    this.genericResourceGroupMenu?.dispose();
    this.genericResourceMenu?.dispose();
    this._resourceFolderMenu?.dispose();
    if (this.contextualResourceGroupMenus) {
      dispose(this.contextualResourceGroupMenus.values());
      this.contextualResourceGroupMenus.clear();
      this.contextualResourceGroupMenus = void 0;
    }
    if (this.contextualResourceMenus) {
      dispose(this.contextualResourceMenus.values());
      this.contextualResourceMenus.clear();
      this.contextualResourceMenus = void 0;
    }
  }
}
let SCMRepositoryMenus = class {
  constructor(provider, contextKeyService, instantiationService, menuService) {
    this.provider = provider;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService.createOverlay([
      ["scmProvider", provider.contextValue],
      ["scmProviderRootUri", provider.rootUri?.toString()],
      ["scmProviderHasRootUri", !!provider.rootUri]
    ]);
    const serviceCollection = new ServiceCollection([IContextKeyService, this.contextKeyService]);
    instantiationService = instantiationService.createChild(serviceCollection, this.disposables);
    this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
    this.disposables.add(this.titleMenu);
    this.repositoryMenu = menuService.createMenu(MenuId.SCMSourceControlInline, this.contextKeyService);
    this.disposables.add(this.repositoryMenu);
    provider.onDidChangeResourceGroups(this.onDidChangeResourceGroups, this, this.disposables);
    this.onDidChangeResourceGroups();
  }
  static {
    __name(this, "SCMRepositoryMenus");
  }
  contextKeyService;
  titleMenu;
  repositoryMenu;
  resourceGroupMenusItems = /* @__PURE__ */ new Map();
  _repositoryContextMenu;
  get repositoryContextMenu() {
    if (!this._repositoryContextMenu) {
      this._repositoryContextMenu = this.menuService.createMenu(MenuId.SCMSourceControl, this.contextKeyService);
      this.disposables.add(this._repositoryContextMenu);
    }
    return this._repositoryContextMenu;
  }
  disposables = new DisposableStore();
  getResourceGroupMenu(group) {
    return this.getOrCreateResourceGroupMenusItem(group).getResourceGroupMenu(group);
  }
  getResourceMenu(resource) {
    return this.getOrCreateResourceGroupMenusItem(resource.resourceGroup).getResourceMenu(resource);
  }
  getResourceFolderMenu(group) {
    return this.getOrCreateResourceGroupMenusItem(group).resourceFolderMenu;
  }
  getOrCreateResourceGroupMenusItem(group) {
    let result = this.resourceGroupMenusItems.get(group);
    if (!result) {
      const contextKeyService = this.contextKeyService.createOverlay([
        ["scmResourceGroup", group.id],
        ["multiDiffEditorEnableViewChanges", group.multiDiffEditorEnableViewChanges]
      ]);
      result = new SCMMenusItem(contextKeyService, this.menuService);
      this.resourceGroupMenusItems.set(group, result);
    }
    return result;
  }
  onDidChangeResourceGroups() {
    for (const resourceGroup of this.resourceGroupMenusItems.keys()) {
      if (!this.provider.groups.includes(resourceGroup)) {
        this.resourceGroupMenusItems.get(resourceGroup)?.dispose();
        this.resourceGroupMenusItems.delete(resourceGroup);
      }
    }
  }
  dispose() {
    this.disposables.dispose();
    this.resourceGroupMenusItems.forEach((item) => item.dispose());
  }
};
SCMRepositoryMenus = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMenuService)
], SCMRepositoryMenus);
let SCMMenus = class {
  constructor(scmService, instantiationService) {
    this.instantiationService = instantiationService;
    this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
    scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    this.disposables.add(Event.runAndSubscribe(MenuRegistry.onDidChangeMenu, (e) => {
      if (e && !e.has(MenuId.SCMTitle)) {
        return;
      }
      this.repositoryMenuDisposables.clear();
      for (const menuItem of MenuRegistry.getMenuItems(MenuId.SCMTitle)) {
        this.repositoryMenuDisposables.add(MenuRegistry.appendMenuItem(MenuId.SCMSourceControlInline, menuItem));
      }
    }));
  }
  static {
    __name(this, "SCMMenus");
  }
  titleMenu;
  disposables = new DisposableStore();
  repositoryMenuDisposables = new DisposableStore();
  menus = /* @__PURE__ */ new Map();
  onDidRemoveRepository(repository) {
    const menus = this.menus.get(repository.provider);
    menus?.dispose();
    this.menus.delete(repository.provider);
  }
  getRepositoryMenus(provider) {
    let result = this.menus.get(provider);
    if (!result) {
      const menus = this.instantiationService.createInstance(SCMRepositoryMenus, provider);
      const dispose2 = /* @__PURE__ */ __name(() => {
        menus.dispose();
        this.menus.delete(provider);
      }, "dispose");
      result = { menus, dispose: dispose2 };
      this.menus.set(provider, result);
    }
    return result.menus;
  }
  dispose() {
    this.disposables.dispose();
  }
};
SCMMenus = __decorateClass([
  __decorateParam(0, ISCMService),
  __decorateParam(1, IInstantiationService)
], SCMMenus);
MenuRegistry.appendMenuItem(MenuId.SCMResourceContext, {
  title: localize("miShare", "Share"),
  submenu: MenuId.SCMResourceContextShare,
  group: "45_share",
  order: 3
});
export {
  SCMMenus,
  SCMRepositoryMenus,
  SCMTitleMenu
};
//# sourceMappingURL=menus.js.map
