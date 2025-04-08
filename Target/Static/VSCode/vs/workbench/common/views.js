var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Command } from "../../editor/common/languages.js";
import { UriComponents, URI } from "../../base/common/uri.js";
import { Event, Emitter } from "../../base/common/event.js";
import { ContextKeyExpression } from "../../platform/contextkey/common/contextkey.js";
import { localize } from "../../nls.js";
import { createDecorator } from "../../platform/instantiation/common/instantiation.js";
import { IDisposable, Disposable, toDisposable } from "../../base/common/lifecycle.js";
import { ThemeIcon } from "../../base/common/themables.js";
import { getOrSet, SetMap } from "../../base/common/map.js";
import { Registry } from "../../platform/registry/common/platform.js";
import { IKeybindings } from "../../platform/keybinding/common/keybindingsRegistry.js";
import { ExtensionIdentifier } from "../../platform/extensions/common/extensions.js";
import { SyncDescriptor } from "../../platform/instantiation/common/descriptors.js";
import { IProgressIndicator } from "../../platform/progress/common/progress.js";
import Severity from "../../base/common/severity.js";
import { IAccessibilityInformation } from "../../platform/accessibility/common/accessibility.js";
import { IMarkdownString, MarkdownString } from "../../base/common/htmlContent.js";
import { mixin } from "../../base/common/objects.js";
import { Codicon } from "../../base/common/codicons.js";
import { registerIcon } from "../../platform/theme/common/iconRegistry.js";
import { CancellationToken } from "../../base/common/cancellation.js";
import { VSDataTransfer } from "../../base/common/dataTransfer.js";
import { ILocalizedString } from "../../platform/action/common/action.js";
const VIEWS_LOG_ID = "views";
const VIEWS_LOG_NAME = localize("views log", "Views");
const defaultViewIcon = registerIcon("default-view-icon", Codicon.window, localize("defaultViewIcon", "Default view icon."));
var Extensions;
((Extensions2) => {
  Extensions2.ViewContainersRegistry = "workbench.registry.view.containers";
  Extensions2.ViewsRegistry = "workbench.registry.view";
})(Extensions || (Extensions = {}));
var ViewContainerLocation = /* @__PURE__ */ ((ViewContainerLocation2) => {
  ViewContainerLocation2[ViewContainerLocation2["Sidebar"] = 0] = "Sidebar";
  ViewContainerLocation2[ViewContainerLocation2["Panel"] = 1] = "Panel";
  ViewContainerLocation2[ViewContainerLocation2["AuxiliaryBar"] = 2] = "AuxiliaryBar";
  return ViewContainerLocation2;
})(ViewContainerLocation || {});
const ViewContainerLocations = [0 /* Sidebar */, 1 /* Panel */, 2 /* AuxiliaryBar */];
function ViewContainerLocationToString(viewContainerLocation) {
  switch (viewContainerLocation) {
    case 0 /* Sidebar */:
      return "sidebar";
    case 1 /* Panel */:
      return "panel";
    case 2 /* AuxiliaryBar */:
      return "auxiliarybar";
  }
}
__name(ViewContainerLocationToString, "ViewContainerLocationToString");
class ViewContainersRegistryImpl extends Disposable {
  static {
    __name(this, "ViewContainersRegistryImpl");
  }
  _onDidRegister = this._register(new Emitter());
  onDidRegister = this._onDidRegister.event;
  _onDidDeregister = this._register(new Emitter());
  onDidDeregister = this._onDidDeregister.event;
  viewContainers = /* @__PURE__ */ new Map();
  defaultViewContainers = [];
  get all() {
    return [...this.viewContainers.values()].flat();
  }
  registerViewContainer(viewContainerDescriptor, viewContainerLocation, options) {
    const existing = this.get(viewContainerDescriptor.id);
    if (existing) {
      return existing;
    }
    const viewContainer = viewContainerDescriptor;
    viewContainer.openCommandActionDescriptor = options?.doNotRegisterOpenCommand ? void 0 : viewContainer.openCommandActionDescriptor ?? { id: viewContainer.id };
    const viewContainers = getOrSet(this.viewContainers, viewContainerLocation, []);
    viewContainers.push(viewContainer);
    if (options?.isDefault) {
      this.defaultViewContainers.push(viewContainer);
    }
    this._onDidRegister.fire({ viewContainer, viewContainerLocation });
    return viewContainer;
  }
  deregisterViewContainer(viewContainer) {
    for (const viewContainerLocation of this.viewContainers.keys()) {
      const viewContainers = this.viewContainers.get(viewContainerLocation);
      const index = viewContainers?.indexOf(viewContainer);
      if (index !== -1) {
        viewContainers?.splice(index, 1);
        if (viewContainers.length === 0) {
          this.viewContainers.delete(viewContainerLocation);
        }
        this._onDidDeregister.fire({ viewContainer, viewContainerLocation });
        return;
      }
    }
  }
  get(id) {
    return this.all.filter((viewContainer) => viewContainer.id === id)[0];
  }
  getViewContainers(location) {
    return [...this.viewContainers.get(location) || []];
  }
  getViewContainerLocation(container) {
    return [...this.viewContainers.keys()].filter((location) => this.getViewContainers(location).filter((viewContainer) => viewContainer?.id === container.id).length > 0)[0];
  }
  getDefaultViewContainer(location) {
    return this.defaultViewContainers.find((viewContainer) => this.getViewContainerLocation(viewContainer) === location);
  }
}
Registry.add(Extensions.ViewContainersRegistry, new ViewContainersRegistryImpl());
var ViewContentGroups = /* @__PURE__ */ ((ViewContentGroups2) => {
  ViewContentGroups2["Open"] = "2_open";
  ViewContentGroups2["Debug"] = "4_debug";
  ViewContentGroups2["SCM"] = "5_scm";
  ViewContentGroups2["More"] = "9_more";
  return ViewContentGroups2;
})(ViewContentGroups || {});
function compareViewContentDescriptors(a, b) {
  const aGroup = a.group ?? "9_more" /* More */;
  const bGroup = b.group ?? "9_more" /* More */;
  if (aGroup !== bGroup) {
    return aGroup.localeCompare(bGroup);
  }
  return (a.order ?? 5) - (b.order ?? 5);
}
__name(compareViewContentDescriptors, "compareViewContentDescriptors");
class ViewsRegistry extends Disposable {
  static {
    __name(this, "ViewsRegistry");
  }
  _onViewsRegistered = this._register(new Emitter());
  onViewsRegistered = this._onViewsRegistered.event;
  _onViewsDeregistered = this._register(new Emitter());
  onViewsDeregistered = this._onViewsDeregistered.event;
  _onDidChangeContainer = this._register(new Emitter());
  onDidChangeContainer = this._onDidChangeContainer.event;
  _onDidChangeViewWelcomeContent = this._register(new Emitter());
  onDidChangeViewWelcomeContent = this._onDidChangeViewWelcomeContent.event;
  _viewContainers = [];
  _views = /* @__PURE__ */ new Map();
  _viewWelcomeContents = new SetMap();
  registerViews(views, viewContainer) {
    this.registerViews2([{ views, viewContainer }]);
  }
  registerViews2(views) {
    views.forEach(({ views: views2, viewContainer }) => this.addViews(views2, viewContainer));
    this._onViewsRegistered.fire(views);
  }
  deregisterViews(viewDescriptors, viewContainer) {
    const views = this.removeViews(viewDescriptors, viewContainer);
    if (views.length) {
      this._onViewsDeregistered.fire({ views, viewContainer });
    }
  }
  moveViews(viewsToMove, viewContainer) {
    for (const container of this._views.keys()) {
      if (container !== viewContainer) {
        const views = this.removeViews(viewsToMove, container);
        if (views.length) {
          this.addViews(views, viewContainer);
          this._onDidChangeContainer.fire({ views, from: container, to: viewContainer });
        }
      }
    }
  }
  getViews(loc) {
    return this._views.get(loc) || [];
  }
  getView(id) {
    for (const viewContainer of this._viewContainers) {
      const viewDescriptor = (this._views.get(viewContainer) || []).filter((v) => v.id === id)[0];
      if (viewDescriptor) {
        return viewDescriptor;
      }
    }
    return null;
  }
  getViewContainer(viewId) {
    for (const viewContainer of this._viewContainers) {
      const viewDescriptor = (this._views.get(viewContainer) || []).filter((v) => v.id === viewId)[0];
      if (viewDescriptor) {
        return viewContainer;
      }
    }
    return null;
  }
  registerViewWelcomeContent(id, viewContent) {
    this._viewWelcomeContents.add(id, viewContent);
    this._onDidChangeViewWelcomeContent.fire(id);
    return toDisposable(() => {
      this._viewWelcomeContents.delete(id, viewContent);
      this._onDidChangeViewWelcomeContent.fire(id);
    });
  }
  registerViewWelcomeContent2(id, viewContentMap) {
    const disposables = /* @__PURE__ */ new Map();
    for (const [key, content] of viewContentMap) {
      this._viewWelcomeContents.add(id, content);
      disposables.set(key, toDisposable(() => {
        this._viewWelcomeContents.delete(id, content);
        this._onDidChangeViewWelcomeContent.fire(id);
      }));
    }
    this._onDidChangeViewWelcomeContent.fire(id);
    return disposables;
  }
  getViewWelcomeContent(id) {
    const result = [];
    this._viewWelcomeContents.forEach(id, (descriptor) => result.push(descriptor));
    return result.sort(compareViewContentDescriptors);
  }
  addViews(viewDescriptors, viewContainer) {
    let views = this._views.get(viewContainer);
    if (!views) {
      views = [];
      this._views.set(viewContainer, views);
      this._viewContainers.push(viewContainer);
    }
    for (const viewDescriptor of viewDescriptors) {
      if (this.getView(viewDescriptor.id) !== null) {
        throw new Error(localize("duplicateId", "A view with id '{0}' is already registered", viewDescriptor.id));
      }
      views.push(viewDescriptor);
    }
  }
  removeViews(viewDescriptors, viewContainer) {
    const views = this._views.get(viewContainer);
    if (!views) {
      return [];
    }
    const viewsToDeregister = [];
    const remaningViews = [];
    for (const view of views) {
      if (!viewDescriptors.includes(view)) {
        remaningViews.push(view);
      } else {
        viewsToDeregister.push(view);
      }
    }
    if (viewsToDeregister.length) {
      if (remaningViews.length) {
        this._views.set(viewContainer, remaningViews);
      } else {
        this._views.delete(viewContainer);
        this._viewContainers.splice(this._viewContainers.indexOf(viewContainer), 1);
      }
    }
    return viewsToDeregister;
  }
}
Registry.add(Extensions.ViewsRegistry, new ViewsRegistry());
const IViewDescriptorService = createDecorator("viewDescriptorService");
var ViewVisibilityState = /* @__PURE__ */ ((ViewVisibilityState2) => {
  ViewVisibilityState2[ViewVisibilityState2["Default"] = 0] = "Default";
  ViewVisibilityState2[ViewVisibilityState2["Expand"] = 1] = "Expand";
  return ViewVisibilityState2;
})(ViewVisibilityState || {});
var TreeItemCollapsibleState = /* @__PURE__ */ ((TreeItemCollapsibleState2) => {
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["None"] = 0] = "None";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Collapsed"] = 1] = "Collapsed";
  TreeItemCollapsibleState2[TreeItemCollapsibleState2["Expanded"] = 2] = "Expanded";
  return TreeItemCollapsibleState2;
})(TreeItemCollapsibleState || {});
class ResolvableTreeItem {
  static {
    __name(this, "ResolvableTreeItem");
  }
  handle;
  parentHandle;
  collapsibleState;
  label;
  description;
  icon;
  iconDark;
  themeIcon;
  resourceUri;
  tooltip;
  contextValue;
  command;
  children;
  accessibilityInformation;
  resolve;
  resolved = false;
  _hasResolve = false;
  constructor(treeItem, resolve) {
    mixin(this, treeItem);
    this._hasResolve = !!resolve;
    this.resolve = async (token) => {
      if (resolve && !this.resolved) {
        const resolvedItem = await resolve(token);
        if (resolvedItem) {
          this.tooltip = this.tooltip ?? resolvedItem.tooltip;
          this.command = this.command ?? resolvedItem.command;
        }
      }
      if (!token.isCancellationRequested) {
        this.resolved = true;
      }
    };
  }
  get hasResolve() {
    return this._hasResolve;
  }
  resetResolve() {
    this.resolved = false;
  }
  asTreeItem() {
    return {
      handle: this.handle,
      parentHandle: this.parentHandle,
      collapsibleState: this.collapsibleState,
      label: this.label,
      description: this.description,
      icon: this.icon,
      iconDark: this.iconDark,
      themeIcon: this.themeIcon,
      resourceUri: this.resourceUri,
      tooltip: this.tooltip,
      contextValue: this.contextValue,
      command: this.command,
      children: this.children,
      accessibilityInformation: this.accessibilityInformation
    };
  }
}
class NoTreeViewError extends Error {
  static {
    __name(this, "NoTreeViewError");
  }
  name = "NoTreeViewError";
  constructor(treeViewId) {
    super(localize("treeView.notRegistered", "No tree view with id '{0}' registered.", treeViewId));
  }
  static is(err) {
    return !!err && err.name === "NoTreeViewError";
  }
}
export {
  Extensions,
  IViewDescriptorService,
  NoTreeViewError,
  ResolvableTreeItem,
  TreeItemCollapsibleState,
  VIEWS_LOG_ID,
  VIEWS_LOG_NAME,
  ViewContainerLocation,
  ViewContainerLocationToString,
  ViewContainerLocations,
  ViewContentGroups,
  ViewVisibilityState,
  defaultViewIcon
};
//# sourceMappingURL=views.js.map
