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
var ExtensionRenderer_1;
import * as dom from "../../../../base/browser/dom.js";
import { localize } from "../../../../nls.js";
import { dispose, Disposable, DisposableStore, toDisposable, isDisposable } from "../../../../base/common/lifecycle.js";
import { Action, ActionRunner, Separator } from "../../../../base/common/actions.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
import { Event } from "../../../../base/common/event.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IListService, WorkbenchAsyncDataTree, WorkbenchPagedList } from "../../../../platform/list/browser/listService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { Delegate, Renderer } from "./extensionsList.js";
import { listFocusForeground, listFocusBackground, foreground, editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { getAriaLabelForExtension } from "./extensionsViews.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { ExtensionAction, getContextMenuActions, ManageExtensionAction } from "./extensionsActions.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { getLocationBasedViewColors } from "../../../browser/parts/views/viewPane.js";
import { DelayedPagedModel } from "../../../../base/common/paging.js";
let ExtensionsList = class ExtensionsList2 extends Disposable {
  static {
    __name(this, "ExtensionsList");
  }
  constructor(parent, viewId, options, extensionsViewState, extensionsWorkbenchService, viewDescriptorService, layoutService, notificationService, contextMenuService, contextKeyService, instantiationService) {
    super();
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.contextMenuActionRunner = this._register(new ActionRunner());
    this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && notificationService.error(error)));
    const delegate = new Delegate();
    const renderer = instantiationService.createInstance(Renderer, extensionsViewState, {
      hoverOptions: {
        position: /* @__PURE__ */ __name(() => {
          const viewLocation = viewDescriptorService.getViewLocationById(viewId);
          if (viewLocation === 0) {
            return layoutService.getSideBarPosition() === 0 ? 1 : 0;
          }
          if (viewLocation === 2) {
            return layoutService.getSideBarPosition() === 0 ? 0 : 1;
          }
          return 1;
        }, "position")
      }
    });
    this.list = instantiationService.createInstance(WorkbenchPagedList, `${viewId}-Extensions`, parent, delegate, [renderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(extension) {
          return getAriaLabelForExtension(extension);
        },
        getWidgetAriaLabel() {
          return localize("extensions", "Extensions");
        }
      },
      overrideStyles: getLocationBasedViewColors(viewDescriptorService.getViewLocationById(viewId)).listOverrideStyles,
      openOnSingleClick: true,
      ...options
    });
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
    this._register(this.list);
    this._register(Event.debounce(Event.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options2) => {
      this.openExtension(options2.element, { sideByside: options2.sideBySide, ...options2.editorOptions });
    }));
  }
  setModel(model) {
    this.list.model = new DelayedPagedModel(model);
  }
  layout(height, width) {
    this.list.layout(height, width);
  }
  openExtension(extension, options) {
    extension = this.extensionsWorkbenchService.local.filter((e) => areSameExtensions(e.identifier, extension.identifier))[0] || extension;
    this.extensionsWorkbenchService.open(extension, options);
  }
  async onContextMenu(e) {
    if (e.element) {
      const disposables = new DisposableStore();
      const manageExtensionAction = disposables.add(this.instantiationService.createInstance(ManageExtensionAction));
      const extension = e.element ? this.extensionsWorkbenchService.local.find((local) => areSameExtensions(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element : e.element;
      manageExtensionAction.extension = extension;
      let groups = [];
      if (manageExtensionAction.enabled) {
        groups = await manageExtensionAction.getActionGroups();
      } else if (extension) {
        groups = await getContextMenuActions(extension, this.contextKeyService, this.instantiationService);
        groups.forEach((group) => group.forEach((extensionAction) => {
          if (extensionAction instanceof ExtensionAction) {
            extensionAction.extension = extension;
          }
        }));
      }
      const actions = [];
      for (const menuActions of groups) {
        for (const menuAction of menuActions) {
          actions.push(menuAction);
          if (isDisposable(menuAction)) {
            disposables.add(menuAction);
          }
        }
        actions.push(new Separator());
      }
      actions.pop();
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
        actionRunner: this.contextMenuActionRunner,
        onHide: /* @__PURE__ */ __name(() => disposables.dispose(), "onHide")
      });
    }
  }
};
ExtensionsList = __decorate([
  __param(4, IExtensionsWorkbenchService),
  __param(5, IViewDescriptorService),
  __param(6, IWorkbenchLayoutService),
  __param(7, INotificationService),
  __param(8, IContextMenuService),
  __param(9, IContextKeyService),
  __param(10, IInstantiationService)
], ExtensionsList);
let ExtensionsGridView = class ExtensionsGridView2 extends Disposable {
  static {
    __name(this, "ExtensionsGridView");
  }
  constructor(parent, delegate, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.element = dom.append(parent, dom.$(".extensions-grid-view"));
    this.renderer = this.instantiationService.createInstance(Renderer, { onFocus: Event.None, onBlur: Event.None, filters: {} }, { hoverOptions: { position() {
      return 2;
    } } });
    this.delegate = delegate;
    this.disposableStore = this._register(new DisposableStore());
  }
  setExtensions(extensions) {
    this.disposableStore.clear();
    extensions.forEach((e, index) => this.renderExtension(e, index));
  }
  renderExtension(extension, index) {
    const extensionContainer = dom.append(this.element, dom.$(".extension-container"));
    extensionContainer.style.height = `${this.delegate.getHeight()}px`;
    extensionContainer.setAttribute("tabindex", "0");
    const template = this.renderer.renderTemplate(extensionContainer);
    this.disposableStore.add(toDisposable(() => this.renderer.disposeTemplate(template)));
    const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
    openExtensionAction.extension = extension;
    template.name.setAttribute("tabindex", "0");
    const handleEvent = /* @__PURE__ */ __name((e) => {
      if (e instanceof StandardKeyboardEvent && e.keyCode !== 3) {
        return;
      }
      openExtensionAction.run(e.ctrlKey || e.metaKey);
      e.stopPropagation();
      e.preventDefault();
    }, "handleEvent");
    this.disposableStore.add(dom.addDisposableListener(template.name, dom.EventType.CLICK, (e) => handleEvent(new StandardMouseEvent(dom.getWindow(template.name), e))));
    this.disposableStore.add(dom.addDisposableListener(template.name, dom.EventType.KEY_DOWN, (e) => handleEvent(new StandardKeyboardEvent(e))));
    this.disposableStore.add(dom.addDisposableListener(extensionContainer, dom.EventType.KEY_DOWN, (e) => handleEvent(new StandardKeyboardEvent(e))));
    this.renderer.renderElement(extension, index, template);
  }
};
ExtensionsGridView = __decorate([
  __param(2, IInstantiationService)
], ExtensionsGridView);
class AsyncDataSource {
  static {
    __name(this, "AsyncDataSource");
  }
  hasChildren({ hasChildren }) {
    return hasChildren;
  }
  getChildren(extensionData) {
    return extensionData.getChildren();
  }
}
class VirualDelegate {
  static {
    __name(this, "VirualDelegate");
  }
  getHeight(element) {
    return 62;
  }
  getTemplateId({ extension }) {
    return extension ? ExtensionRenderer.TEMPLATE_ID : UnknownExtensionRenderer.TEMPLATE_ID;
  }
}
let ExtensionRenderer = class ExtensionRenderer2 {
  static {
    __name(this, "ExtensionRenderer");
  }
  static {
    ExtensionRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "extension-template";
  }
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  get templateId() {
    return ExtensionRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    container.classList.add("extension");
    const icon = dom.append(container, dom.$("img.icon"));
    const details = dom.append(container, dom.$(".details"));
    const header = dom.append(details, dom.$(".header"));
    const name = dom.append(header, dom.$("span.name"));
    const openExtensionAction = this.instantiationService.createInstance(OpenExtensionAction);
    const extensionDisposables = [dom.addDisposableListener(name, "click", (e) => {
      openExtensionAction.run(e.ctrlKey || e.metaKey);
      e.stopPropagation();
      e.preventDefault();
    })];
    const identifier = dom.append(header, dom.$("span.identifier"));
    const footer = dom.append(details, dom.$(".footer"));
    const author = dom.append(footer, dom.$(".author"));
    return {
      icon,
      name,
      identifier,
      author,
      extensionDisposables,
      set extensionData(extensionData) {
        openExtensionAction.extension = extensionData.extension;
      }
    };
  }
  renderElement(node, index, data) {
    const extension = node.element.extension;
    data.extensionDisposables.push(dom.addDisposableListener(data.icon, "error", () => data.icon.src = extension.iconUrlFallback, { once: true }));
    data.icon.src = extension.iconUrl;
    if (!data.icon.complete) {
      data.icon.style.visibility = "hidden";
      data.icon.onload = () => data.icon.style.visibility = "inherit";
    } else {
      data.icon.style.visibility = "inherit";
    }
    data.name.textContent = extension.displayName;
    data.identifier.textContent = extension.identifier.id;
    data.author.textContent = extension.publisherDisplayName;
    data.extensionData = node.element;
  }
  disposeTemplate(templateData) {
    templateData.extensionDisposables = dispose(templateData.extensionDisposables);
  }
};
ExtensionRenderer = ExtensionRenderer_1 = __decorate([
  __param(0, IInstantiationService)
], ExtensionRenderer);
class UnknownExtensionRenderer {
  static {
    __name(this, "UnknownExtensionRenderer");
  }
  static {
    this.TEMPLATE_ID = "unknown-extension-template";
  }
  get templateId() {
    return UnknownExtensionRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const messageContainer = dom.append(container, dom.$("div.unknown-extension"));
    dom.append(messageContainer, dom.$("span.error-marker")).textContent = localize("error", "Error");
    dom.append(messageContainer, dom.$("span.message")).textContent = localize("Unknown Extension", "Unknown Extension:");
    const identifier = dom.append(messageContainer, dom.$("span.message"));
    return { identifier };
  }
  renderElement(node, index, data) {
    data.identifier.textContent = node.element.extension.identifier.id;
  }
  disposeTemplate(data) {
  }
}
let OpenExtensionAction = class OpenExtensionAction2 extends Action {
  static {
    __name(this, "OpenExtensionAction");
  }
  constructor(extensionsWorkdbenchService) {
    super("extensions.action.openExtension", "");
    this.extensionsWorkdbenchService = extensionsWorkdbenchService;
  }
  set extension(extension) {
    this._extension = extension;
  }
  run(sideByside) {
    if (this._extension) {
      return this.extensionsWorkdbenchService.open(this._extension, { sideByside });
    }
    return Promise.resolve();
  }
};
OpenExtensionAction = __decorate([
  __param(0, IExtensionsWorkbenchService)
], OpenExtensionAction);
let ExtensionsTree = class ExtensionsTree2 extends WorkbenchAsyncDataTree {
  static {
    __name(this, "ExtensionsTree");
  }
  constructor(input, container, overrideStyles, contextKeyService, listService, instantiationService, configurationService, extensionsWorkdbenchService) {
    const delegate = new VirualDelegate();
    const dataSource = new AsyncDataSource();
    const renderers = [instantiationService.createInstance(ExtensionRenderer), instantiationService.createInstance(UnknownExtensionRenderer)];
    const identityProvider = {
      getId({ extension, parent }) {
        return parent ? this.getId(parent) + "/" + extension.identifier.id : extension.identifier.id;
      }
    };
    super("ExtensionsTree", container, delegate, renderers, dataSource, {
      indent: 40,
      identityProvider,
      multipleSelectionSupport: false,
      overrideStyles,
      accessibilityProvider: {
        getAriaLabel(extensionData) {
          return getAriaLabelForExtension(extensionData.extension);
        },
        getWidgetAriaLabel() {
          return localize("extensions", "Extensions");
        }
      }
    }, instantiationService, contextKeyService, listService, configurationService);
    this.setInput(input);
    this.disposables.add(this.onDidChangeSelection((event) => {
      if (dom.isKeyboardEvent(event.browserEvent)) {
        extensionsWorkdbenchService.open(event.elements[0].extension, { sideByside: false });
      }
    }));
  }
};
ExtensionsTree = __decorate([
  __param(3, IContextKeyService),
  __param(4, IListService),
  __param(5, IInstantiationService),
  __param(6, IConfigurationService),
  __param(7, IExtensionsWorkbenchService)
], ExtensionsTree);
class ExtensionData {
  static {
    __name(this, "ExtensionData");
  }
  constructor(extension, parent, getChildrenExtensionIds, extensionsWorkbenchService) {
    this.extension = extension;
    this.parent = parent;
    this.getChildrenExtensionIds = getChildrenExtensionIds;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.childrenExtensionIds = this.getChildrenExtensionIds(extension);
  }
  get hasChildren() {
    return isNonEmptyArray(this.childrenExtensionIds);
  }
  async getChildren() {
    if (this.hasChildren) {
      const result = await getExtensions(this.childrenExtensionIds, this.extensionsWorkbenchService);
      return result.map((extension) => new ExtensionData(extension, this, this.getChildrenExtensionIds, this.extensionsWorkbenchService));
    }
    return null;
  }
}
async function getExtensions(extensions, extensionsWorkbenchService) {
  const localById = extensionsWorkbenchService.local.reduce((result2, e) => {
    result2.set(e.identifier.id.toLowerCase(), e);
    return result2;
  }, /* @__PURE__ */ new Map());
  const result = [];
  const toQuery = [];
  for (const extensionId of extensions) {
    const id = extensionId.toLowerCase();
    const local = localById.get(id);
    if (local) {
      result.push(local);
    } else {
      toQuery.push(id);
    }
  }
  if (toQuery.length) {
    const galleryResult = await extensionsWorkbenchService.getExtensions(toQuery.map((id) => ({ id })), CancellationToken.None);
    result.push(...galleryResult);
  }
  return result;
}
__name(getExtensions, "getExtensions");
registerThemingParticipant((theme, collector) => {
  const focusBackground = theme.getColor(listFocusBackground);
  if (focusBackground) {
    collector.addRule(`.extensions-grid-view .extension-container:focus { background-color: ${focusBackground}; outline: none; }`);
  }
  const focusForeground = theme.getColor(listFocusForeground);
  if (focusForeground) {
    collector.addRule(`.extensions-grid-view .extension-container:focus { color: ${focusForeground}; }`);
  }
  const foregroundColor = theme.getColor(foreground);
  const editorBackgroundColor = theme.getColor(editorBackground);
  if (foregroundColor && editorBackgroundColor) {
    const authorForeground = foregroundColor.transparent(0.9).makeOpaque(editorBackgroundColor);
    collector.addRule(`.extensions-grid-view .extension-container:not(.disabled) .author { color: ${authorForeground}; }`);
    const disabledExtensionForeground = foregroundColor.transparent(0.5).makeOpaque(editorBackgroundColor);
    collector.addRule(`.extensions-grid-view .extension-container.disabled { color: ${disabledExtensionForeground}; }`);
  }
});
export {
  ExtensionData,
  ExtensionsGridView,
  ExtensionsList,
  ExtensionsTree,
  getExtensions
};
//# sourceMappingURL=extensionsViewer.js.map
