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
import { localize } from "../../../../nls.js";
import { IDisposable, dispose, Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { Action } from "../../../../base/common/actions.js";
import { IExtensionsWorkbenchService, IExtension } from "../common/extensions.js";
import { Event } from "../../../../base/common/event.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IListService, WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { registerThemingParticipant, IColorTheme, ICssStyleCollector } from "../../../../platform/theme/common/themeService.js";
import { IAsyncDataSource, ITreeNode } from "../../../../base/browser/ui/tree/tree.js";
import { IListVirtualDelegate, IListRenderer } from "../../../../base/browser/ui/list/list.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { Delegate, Renderer } from "./extensionsList.js";
import { listFocusForeground, listFocusBackground, foreground, editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { IListStyles } from "../../../../base/browser/ui/list/listWidget.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { IStyleOverride } from "../../../../platform/theme/browser/defaultStyles.js";
import { getAriaLabelForExtension } from "./extensionsViews.js";
let ExtensionsGridView = class extends Disposable {
  constructor(parent, delegate, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.element = dom.append(parent, dom.$(".extensions-grid-view"));
    this.renderer = this.instantiationService.createInstance(Renderer, { onFocus: Event.None, onBlur: Event.None, filters: {} }, { hoverOptions: { position() {
      return HoverPosition.BELOW;
    } } });
    this.delegate = delegate;
    this.disposableStore = this._register(new DisposableStore());
  }
  static {
    __name(this, "ExtensionsGridView");
  }
  element;
  renderer;
  delegate;
  disposableStore;
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
      if (e instanceof StandardKeyboardEvent && e.keyCode !== KeyCode.Enter) {
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
ExtensionsGridView = __decorateClass([
  __decorateParam(2, IInstantiationService)
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
let ExtensionRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ExtensionRenderer");
  }
  static TEMPLATE_ID = "extension-template";
  get templateId() {
    return ExtensionRenderer.TEMPLATE_ID;
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
ExtensionRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ExtensionRenderer);
class UnknownExtensionRenderer {
  static {
    __name(this, "UnknownExtensionRenderer");
  }
  static TEMPLATE_ID = "unknown-extension-template";
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
let OpenExtensionAction = class extends Action {
  constructor(extensionsWorkdbenchService) {
    super("extensions.action.openExtension", "");
    this.extensionsWorkdbenchService = extensionsWorkdbenchService;
  }
  static {
    __name(this, "OpenExtensionAction");
  }
  _extension;
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
OpenExtensionAction = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], OpenExtensionAction);
let ExtensionsTree = class extends WorkbenchAsyncDataTree {
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
    super(
      "ExtensionsTree",
      container,
      delegate,
      renderers,
      dataSource,
      {
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
      },
      instantiationService,
      contextKeyService,
      listService,
      configurationService
    );
    this.setInput(input);
    this.disposables.add(this.onDidChangeSelection((event) => {
      if (dom.isKeyboardEvent(event.browserEvent)) {
        extensionsWorkdbenchService.open(event.elements[0].extension, { sideByside: false });
      }
    }));
  }
};
ExtensionsTree = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IListService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionsWorkbenchService)
], ExtensionsTree);
class ExtensionData {
  static {
    __name(this, "ExtensionData");
  }
  extension;
  parent;
  getChildrenExtensionIds;
  childrenExtensionIds;
  extensionsWorkbenchService;
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
  ExtensionsTree,
  getExtensions
};
//# sourceMappingURL=extensionsViewer.js.map
