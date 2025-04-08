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
import * as dom from "../../../../../base/browser/dom.js";
import { IListRenderer, IListVirtualDelegate } from "../../../../../base/browser/ui/list/list.js";
import { coalesce } from "../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Event } from "../../../../../base/common/event.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { matchesSomeScheme, Schemas } from "../../../../../base/common/network.js";
import { basename } from "../../../../../base/common/path.js";
import { basenameOrAuthority, isEqualAuthority } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../../nls.js";
import { getFlatContextMenuActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { Action2, IMenuService, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { FileKind } from "../../../../../platform/files/common/files.js";
import { IInstantiationService, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { WorkbenchList } from "../../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import { IResourceLabel, ResourceLabels } from "../../../../browser/labels.js";
import { ColorScheme } from "../../../../browser/web.api.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { SETTINGS_AUTHORITY } from "../../../../services/preferences/common/preferences.js";
import { createFileIconThemableTreeContainerScope } from "../../../files/browser/views/explorerView.js";
import { ExplorerFolderContext } from "../../../files/common/files.js";
import { chatEditingWidgetFileStateContextKey, ModifiedFileEntryState } from "../../common/chatEditingService.js";
import { ChatResponseReferencePartStatusKind, IChatContentReference, IChatWarningMessage } from "../../common/chatService.js";
import { IChatVariablesService } from "../../common/chatVariables.js";
import { IChatRendererContent, IChatResponseViewModel } from "../../common/chatViewModel.js";
import { ChatTreeItem, IChatWidgetService } from "../chat.js";
import { ChatCollapsibleContentPart } from "./chatCollapsibleContentPart.js";
import { IDisposableReference, ResourcePool } from "./chatCollections.js";
import { IChatContentPartRenderContext } from "./chatContentParts.js";
const $ = dom.$;
let ChatCollapsibleListContentPart = class extends ChatCollapsibleContentPart {
  constructor(data, labelOverride, context, contentReferencesListPool, openerService, menuService, instantiationService, contextMenuService) {
    super(labelOverride ?? (data.length > 1 ? localize("usedReferencesPlural", "Used {0} references", data.length) : localize("usedReferencesSingular", "Used {0} reference", 1)), context);
    this.data = data;
    this.contentReferencesListPool = contentReferencesListPool;
    this.openerService = openerService;
    this.menuService = menuService;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
  }
  static {
    __name(this, "ChatCollapsibleListContentPart");
  }
  initContent() {
    const ref = this._register(this.contentReferencesListPool.get());
    const list = ref.object;
    this._register(list.onDidOpen((e) => {
      if (e.element && "reference" in e.element && typeof e.element.reference === "object") {
        const uriOrLocation = "variableName" in e.element.reference ? e.element.reference.value : e.element.reference;
        const uri = URI.isUri(uriOrLocation) ? uriOrLocation : uriOrLocation?.uri;
        if (uri) {
          this.openerService.open(
            uri,
            {
              fromUserGesture: true,
              editorOptions: {
                ...e.editorOptions,
                ...{
                  selection: uriOrLocation && "range" in uriOrLocation ? uriOrLocation.range : void 0
                }
              }
            }
          );
        }
      }
    }));
    this._register(list.onContextMenu((e) => {
      dom.EventHelper.stop(e.browserEvent, true);
      const uri = e.element && getResourceForElement(e.element);
      if (!uri) {
        return;
      }
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => {
          const menu = this.menuService.getMenuActions(MenuId.ChatAttachmentsContext, list.contextKeyService, { shouldForwardArgs: true, arg: uri });
          return getFlatContextMenuActions(menu);
        }, "getActions")
      });
    }));
    const resourceContextKey = this._register(this.instantiationService.createInstance(ResourceContextKey));
    this._register(list.onDidChangeFocus((e) => {
      resourceContextKey.reset();
      const element = e.elements.length ? e.elements[0] : void 0;
      const uri = element && getResourceForElement(element);
      resourceContextKey.set(uri ?? null);
    }));
    const maxItemsShown = 6;
    const itemsShown = Math.min(this.data.length, maxItemsShown);
    const height = itemsShown * 22;
    list.layout(height);
    list.getHTMLElement().style.height = `${height}px`;
    list.splice(0, list.length, this.data);
    return list.getHTMLElement().parentElement;
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "references" && other.references.length === this.data.length && !!followingContent.length === this.hasFollowingContent;
  }
};
ChatCollapsibleListContentPart = __decorateClass([
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextMenuService)
], ChatCollapsibleListContentPart);
let ChatUsedReferencesListContentPart = class extends ChatCollapsibleListContentPart {
  constructor(data, labelOverride, context, contentReferencesListPool, options, openerService, menuService, instantiationService, contextMenuService) {
    super(data, labelOverride, context, contentReferencesListPool, openerService, menuService, instantiationService, contextMenuService);
    this.options = options;
    if (data.length === 0) {
      dom.hide(this.domNode);
    }
  }
  static {
    __name(this, "ChatUsedReferencesListContentPart");
  }
  isExpanded() {
    const element = this.context.element;
    return element.usedReferencesExpanded ?? !!(this.options.expandedWhenEmptyResponse && element.response.value.length === 0);
  }
  setExpanded(value) {
    const element = this.context.element;
    element.usedReferencesExpanded = !this.isExpanded();
  }
};
ChatUsedReferencesListContentPart = __decorateClass([
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IContextMenuService)
], ChatUsedReferencesListContentPart);
let CollapsibleListPool = class extends Disposable {
  constructor(_onDidChangeVisibility, menuId, instantiationService, themeService, labelService) {
    super();
    this._onDidChangeVisibility = _onDidChangeVisibility;
    this.menuId = menuId;
    this.instantiationService = instantiationService;
    this.themeService = themeService;
    this.labelService = labelService;
    this._pool = this._register(new ResourcePool(() => this.listFactory()));
  }
  static {
    __name(this, "CollapsibleListPool");
  }
  _pool;
  get inUse() {
    return this._pool.inUse;
  }
  listFactory() {
    const resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility }));
    const container = $(".chat-used-context-list");
    this._register(createFileIconThemableTreeContainerScope(container, this.themeService));
    const list = this.instantiationService.createInstance(
      WorkbenchList,
      "ChatListRenderer",
      container,
      new CollapsibleListDelegate(),
      [this.instantiationService.createInstance(CollapsibleListRenderer, resourceLabels, this.menuId)],
      {
        alwaysConsumeMouseWheel: false,
        accessibilityProvider: {
          getAriaLabel: /* @__PURE__ */ __name((element) => {
            if (element.kind === "warning") {
              return element.content.value;
            }
            const reference = element.reference;
            if (typeof reference === "string") {
              return reference;
            } else if ("variableName" in reference) {
              return reference.variableName;
            } else if (URI.isUri(reference)) {
              return basename(reference.path);
            } else {
              return basename(reference.uri.path);
            }
          }, "getAriaLabel"),
          getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("chatCollapsibleList", "Collapsible Chat List"), "getWidgetAriaLabel")
        },
        dnd: {
          getDragURI: /* @__PURE__ */ __name((element) => getResourceForElement(element)?.toString() ?? null, "getDragURI"),
          getDragLabel: /* @__PURE__ */ __name((elements, originalEvent) => {
            const uris = coalesce(elements.map(getResourceForElement));
            if (!uris.length) {
              return void 0;
            } else if (uris.length === 1) {
              return this.labelService.getUriLabel(uris[0], { relative: true });
            } else {
              return `${uris.length}`;
            }
          }, "getDragLabel"),
          dispose: /* @__PURE__ */ __name(() => {
          }, "dispose"),
          onDragOver: /* @__PURE__ */ __name(() => false, "onDragOver"),
          drop: /* @__PURE__ */ __name(() => {
          }, "drop"),
          onDragStart: /* @__PURE__ */ __name((data, originalEvent) => {
            try {
              const elements = data.getData();
              const uris = coalesce(elements.map(getResourceForElement));
              this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, uris, originalEvent));
            } catch {
            }
          }, "onDragStart")
        }
      }
    );
    return list;
  }
  get() {
    const object = this._pool.get();
    let stale = false;
    return {
      object,
      isStale: /* @__PURE__ */ __name(() => stale, "isStale"),
      dispose: /* @__PURE__ */ __name(() => {
        stale = true;
        this._pool.release(object);
      }, "dispose")
    };
  }
};
CollapsibleListPool = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, ILabelService)
], CollapsibleListPool);
class CollapsibleListDelegate {
  static {
    __name(this, "CollapsibleListDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return CollapsibleListRenderer.TEMPLATE_ID;
  }
}
let CollapsibleListRenderer = class {
  constructor(labels, menuId, themeService, productService, instantiationService, contextKeyService) {
    this.labels = labels;
    this.menuId = menuId;
    this.themeService = themeService;
    this.productService = productService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "CollapsibleListRenderer");
  }
  static TEMPLATE_ID = "chatCollapsibleListRenderer";
  templateId = CollapsibleListRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true, supportIcons: true }));
    let toolbar;
    let actionBarContainer;
    let contextKeyService;
    if (this.menuId) {
      actionBarContainer = $(".chat-collapsible-list-action-bar");
      contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(actionBarContainer));
      const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
      toolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, this.menuId, { menuOptions: { shouldForwardArgs: true, arg: void 0 } }));
      label.element.appendChild(actionBarContainer);
    }
    return { templateDisposables, label, toolbar, actionBarContainer, contextKeyService };
  }
  getReferenceIcon(data) {
    if (ThemeIcon.isThemeIcon(data.iconPath)) {
      return data.iconPath;
    } else {
      return this.themeService.getColorTheme().type === ColorScheme.DARK && data.iconPath?.dark ? data.iconPath?.dark : data.iconPath?.light;
    }
  }
  renderElement(data, index, templateData, height) {
    if (data.kind === "warning") {
      templateData.label.setResource({ name: data.content.value }, { icon: Codicon.warning });
      return;
    }
    const reference = data.reference;
    const icon = this.getReferenceIcon(data);
    templateData.label.element.style.display = "flex";
    let arg;
    if (typeof reference === "object" && "variableName" in reference) {
      if (reference.value) {
        const uri = URI.isUri(reference.value) ? reference.value : reference.value.uri;
        templateData.label.setResource(
          {
            resource: uri,
            name: basenameOrAuthority(uri),
            description: `#${reference.variableName}`,
            range: "range" in reference.value ? reference.value.range : void 0
          },
          { icon, title: data.options?.status?.description ?? data.title }
        );
      } else if (reference.variableName.startsWith("kernelVariable")) {
        const variable = reference.variableName.split(":")[1];
        const asVariableName = `${variable}`;
        const label = `Kernel variable`;
        templateData.label.setLabel(label, asVariableName, { title: data.options?.status?.description });
      } else {
        templateData.label.setLabel("Unknown variable type");
      }
    } else if (typeof reference === "string") {
      templateData.label.setLabel(reference, void 0, { iconPath: URI.isUri(icon) ? icon : void 0, title: data.options?.status?.description ?? data.title });
    } else {
      const uri = "uri" in reference ? reference.uri : reference;
      arg = uri;
      const extraClasses = data.excluded ? ["excluded"] : [];
      if (uri.scheme === "https" && isEqualAuthority(uri.authority, "github.com") && uri.path.includes("/tree/")) {
        const label = uri.path.split("/").slice(1, 3).join("/");
        const description = uri.path.split("/").slice(5).join("/");
        templateData.label.setResource({ resource: uri, name: label, description }, { icon: Codicon.github, title: data.title, strikethrough: data.excluded, extraClasses });
      } else if (uri.scheme === this.productService.urlProtocol && isEqualAuthority(uri.authority, SETTINGS_AUTHORITY)) {
        const settingId = uri.path.substring(1);
        templateData.label.setResource({ resource: uri, name: settingId }, { icon: Codicon.settingsGear, title: localize("setting.hover", "Open setting '{0}'", settingId), strikethrough: data.excluded, extraClasses });
      } else if (matchesSomeScheme(uri, Schemas.mailto, Schemas.http, Schemas.https)) {
        templateData.label.setResource({ resource: uri, name: uri.toString() }, { icon: icon ?? Codicon.globe, title: data.options?.status?.description ?? data.title ?? uri.toString(), strikethrough: data.excluded, extraClasses });
      } else {
        templateData.label.setFile(uri, {
          fileKind: FileKind.FILE,
          // Should not have this live-updating data on a historical reference
          fileDecorations: void 0,
          range: "range" in reference ? reference.range : void 0,
          title: data.options?.status?.description ?? data.title,
          strikethrough: data.excluded,
          extraClasses
        });
      }
    }
    for (const selector of [".monaco-icon-suffix-container", ".monaco-icon-name-container"]) {
      const element = templateData.label.element.querySelector(selector);
      if (element) {
        if (data.options?.status?.kind === ChatResponseReferencePartStatusKind.Omitted || data.options?.status?.kind === ChatResponseReferencePartStatusKind.Partial) {
          element.classList.add("warning");
        } else {
          element.classList.remove("warning");
        }
      }
    }
    if (data.state !== void 0) {
      if (templateData.actionBarContainer) {
        if (data.state === ModifiedFileEntryState.Modified && !templateData.actionBarContainer.classList.contains("modified")) {
          templateData.actionBarContainer.classList.add("modified");
          templateData.label.element.querySelector(".monaco-icon-name-container")?.classList.add("modified");
        } else if (data.state !== ModifiedFileEntryState.Modified) {
          templateData.actionBarContainer.classList.remove("modified");
          templateData.label.element.querySelector(".monaco-icon-name-container")?.classList.remove("modified");
        }
      }
      if (templateData.toolbar) {
        templateData.toolbar.context = arg;
      }
      if (templateData.contextKeyService) {
        if (data.state !== void 0) {
          chatEditingWidgetFileStateContextKey.bindTo(templateData.contextKeyService).set(data.state);
        }
      }
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};
CollapsibleListRenderer = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], CollapsibleListRenderer);
function getResourceForElement(element) {
  if (element.kind === "warning") {
    return null;
  }
  const { reference } = element;
  if (typeof reference === "string" || "variableName" in reference) {
    return null;
  } else if (URI.isUri(reference)) {
    return reference;
  } else {
    return reference.uri;
  }
}
__name(getResourceForElement, "getResourceForElement");
registerAction2(class AddToChatAction extends Action2 {
  static {
    __name(this, "AddToChatAction");
  }
  static id = "workbench.action.chat.addToChatAction";
  constructor() {
    super({
      id: AddToChatAction.id,
      title: {
        ...localize2("addToChat", "Add File to Chat")
      },
      f1: false,
      menu: [{
        id: MenuId.ChatAttachmentsContext,
        group: "chat",
        order: 1,
        when: ContextKeyExpr.and(ResourceContextKey.IsFileSystemResource, ExplorerFolderContext.negate())
      }]
    });
  }
  async run(accessor, resource) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const variablesService = accessor.get(IChatVariablesService);
    if (!resource) {
      return;
    }
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    variablesService.attachContext("file", resource, widget.location);
  }
});
registerAction2(class OpenChatReferenceLinkAction extends Action2 {
  static {
    __name(this, "OpenChatReferenceLinkAction");
  }
  static id = "workbench.action.chat.copyLink";
  constructor() {
    super({
      id: OpenChatReferenceLinkAction.id,
      title: {
        ...localize2("copyLink", "Copy Link")
      },
      f1: false,
      menu: [{
        id: MenuId.ChatAttachmentsContext,
        group: "chat",
        order: 0,
        when: ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.http), ResourceContextKey.Scheme.isEqualTo(Schemas.https))
      }]
    });
  }
  async run(accessor, resource) {
    await accessor.get(IClipboardService).writeResources([resource]);
  }
});
export {
  $,
  ChatCollapsibleListContentPart,
  ChatUsedReferencesListContentPart,
  CollapsibleListPool
};
//# sourceMappingURL=chatReferencesContentPart.js.map
