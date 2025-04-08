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
import { addDisposableListener, Dimension, EventType, findParentWithClass, getWindow } from "../../../../base/browser/dom.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ViewPane, ViewPaneShowActions } from "../../../browser/parts/views/viewPane.js";
import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { Memento, MementoObject } from "../../../common/memento.js";
import { IViewBadge, IViewDescriptorService } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ExtensionKeyedWebviewOriginStore, IOverlayWebview, IWebviewService, WebviewContentPurpose } from "../../webview/browser/webview.js";
import { WebviewWindowDragMonitor } from "../../webview/browser/webviewWindowDragMonitor.js";
import { IWebviewViewService, WebviewView } from "./webviewViewService.js";
import { IActivityService, NumberBadge } from "../../../services/activity/common/activity.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
const storageKeys = {
  webviewState: "webviewState"
};
let WebviewViewPane = class extends ViewPane {
  constructor(options, configurationService, contextKeyService, contextMenuService, instantiationService, keybindingService, openerService, hoverService, themeService, viewDescriptorService, activityService, extensionService, progressService, storageService, viewService, webviewService, webviewViewService) {
    super({ ...options, titleMenuId: MenuId.ViewTitle, showActions: ViewPaneShowActions.WhenExpanded }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.activityService = activityService;
    this.extensionService = extensionService;
    this.progressService = progressService;
    this.storageService = storageService;
    this.viewService = viewService;
    this.webviewService = webviewService;
    this.webviewViewService = webviewViewService;
    this.extensionId = options.fromExtensionId;
    this.defaultTitle = this.title;
    this.memento = new Memento(`webviewView.${this.id}`, storageService);
    this.viewState = this.memento.getMemento(StorageScope.WORKSPACE, StorageTarget.MACHINE);
    this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
    this._register(this.webviewViewService.onNewResolverRegistered((e) => {
      if (e.viewType === this.id) {
        this.updateTreeVisibility();
      }
    }));
    this.updateTreeVisibility();
  }
  static {
    __name(this, "WebviewViewPane");
  }
  static _originStore;
  static getOriginStore(storageService) {
    this._originStore ??= new ExtensionKeyedWebviewOriginStore("webviewViews.origins", storageService);
    return this._originStore;
  }
  _webview = this._register(new MutableDisposable());
  _webviewDisposables = this._register(new DisposableStore());
  _activated = false;
  _container;
  _rootContainer;
  _resizeObserver;
  defaultTitle;
  setTitle;
  badge;
  activity = this._register(new MutableDisposable());
  memento;
  viewState;
  extensionId;
  _repositionTimeout;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  _onDispose = this._register(new Emitter());
  onDispose = this._onDispose.event;
  dispose() {
    this._onDispose.fire();
    clearTimeout(this._repositionTimeout);
    super.dispose();
  }
  focus() {
    super.focus();
    this._webview.value?.focus();
  }
  renderBody(container) {
    super.renderBody(container);
    this._container = container;
    this._rootContainer = void 0;
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          this.layoutWebview();
        }, 0);
      });
      this._register(toDisposable(() => {
        this._resizeObserver.disconnect();
      }));
      this._resizeObserver.observe(container);
    }
  }
  saveState() {
    if (this._webview.value) {
      this.viewState[storageKeys.webviewState] = this._webview.value.state;
    }
    this.memento.saveMemento();
    super.saveState();
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.layoutWebview(new Dimension(width, height));
  }
  updateTreeVisibility() {
    if (this.isBodyVisible()) {
      this.activate();
      this._webview.value?.claim(this, getWindow(this.element), void 0);
    } else {
      this._webview.value?.release(this);
    }
  }
  activate() {
    if (this._activated) {
      return;
    }
    this._activated = true;
    const origin = this.extensionId ? WebviewViewPane.getOriginStore(this.storageService).getOrigin(this.id, this.extensionId) : void 0;
    const webview = this.webviewService.createWebviewOverlay({
      origin,
      providedViewType: this.id,
      title: this.title,
      options: { purpose: WebviewContentPurpose.WebviewView },
      contentOptions: {},
      extension: this.extensionId ? { id: this.extensionId } : void 0
    });
    webview.state = this.viewState[storageKeys.webviewState];
    this._webview.value = webview;
    if (this._container) {
      this.layoutWebview();
    }
    this._webviewDisposables.add(toDisposable(() => {
      this._webview.value?.release(this);
    }));
    this._webviewDisposables.add(webview.onDidUpdateState(() => {
      this.viewState[storageKeys.webviewState] = webview.state;
    }));
    for (const event of [EventType.DRAG, EventType.DRAG_END, EventType.DRAG_ENTER, EventType.DRAG_LEAVE, EventType.DRAG_START]) {
      this._webviewDisposables.add(addDisposableListener(this._webview.value.container, event, (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.dropTargetElement.dispatchEvent(new DragEvent(e.type, e));
      }));
    }
    this._webviewDisposables.add(new WebviewWindowDragMonitor(getWindow(this.element), () => this._webview.value));
    const source = this._webviewDisposables.add(new CancellationTokenSource());
    this.withProgress(async () => {
      await this.extensionService.activateByEvent(`onView:${this.id}`);
      const self = this;
      const webviewView = {
        webview,
        onDidChangeVisibility: this.onDidChangeBodyVisibility,
        onDispose: this.onDispose,
        get title() {
          return self.setTitle;
        },
        set title(value) {
          self.updateTitle(value);
        },
        get description() {
          return self.titleDescription;
        },
        set description(value) {
          self.updateTitleDescription(value);
        },
        get badge() {
          return self.badge;
        },
        set badge(badge) {
          self.updateBadge(badge);
        },
        dispose: /* @__PURE__ */ __name(() => {
          this._activated = false;
          this._webview.clear();
          this._webviewDisposables.clear();
        }, "dispose"),
        show: /* @__PURE__ */ __name((preserveFocus) => {
          this.viewService.openView(this.id, !preserveFocus);
        }, "show")
      };
      await this.webviewViewService.resolve(this.id, webviewView, source.token);
    });
  }
  updateTitle(value) {
    this.setTitle = value;
    super.updateTitle(typeof value === "string" ? value : this.defaultTitle);
  }
  updateBadge(badge) {
    if (this.badge?.value === badge?.value && this.badge?.tooltip === badge?.tooltip) {
      return;
    }
    this.badge = badge;
    if (badge) {
      const activity = {
        badge: new NumberBadge(badge.value, () => badge.tooltip),
        priority: 150
      };
      this.activity.value = this.activityService.showViewActivity(this.id, activity);
    }
  }
  async withProgress(task) {
    return this.progressService.withProgress({ location: this.id, delay: 500 }, task);
  }
  onDidScrollRoot() {
    this.layoutWebview();
  }
  doLayoutWebview(dimension) {
    const webviewEntry = this._webview.value;
    if (!this._container || !webviewEntry) {
      return;
    }
    if (!this._rootContainer || !this._rootContainer.isConnected) {
      this._rootContainer = this.findRootContainer(this._container);
    }
    webviewEntry.layoutWebviewOverElement(this._container, dimension, this._rootContainer);
  }
  layoutWebview(dimension) {
    this.doLayoutWebview(dimension);
    clearTimeout(this._repositionTimeout);
    this._repositionTimeout = setTimeout(() => this.doLayoutWebview(dimension), 200);
  }
  findRootContainer(container) {
    return findParentWithClass(container, "monaco-scrollable-element") ?? void 0;
  }
};
WebviewViewPane = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IActivityService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IProgressService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IViewsService),
  __decorateParam(15, IWebviewService),
  __decorateParam(16, IWebviewViewService)
], WebviewViewPane);
export {
  WebviewViewPane
};
//# sourceMappingURL=webviewViewPane.js.map
