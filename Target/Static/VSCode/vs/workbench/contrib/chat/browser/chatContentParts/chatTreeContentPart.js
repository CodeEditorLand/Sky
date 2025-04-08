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
import { IListVirtualDelegate } from "../../../../../base/browser/ui/list/list.js";
import { ITreeCompressionDelegate } from "../../../../../base/browser/ui/tree/asyncDataTree.js";
import { ICompressedTreeNode } from "../../../../../base/browser/ui/tree/compressedObjectTreeModel.js";
import { ICompressibleTreeRenderer } from "../../../../../base/browser/ui/tree/objectTree.js";
import { IAsyncDataSource, ITreeNode } from "../../../../../base/browser/ui/tree/tree.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { FileKind, FileType } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchCompressibleAsyncDataTree } from "../../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IResourceLabel, ResourceLabels } from "../../../../browser/labels.js";
import { ChatTreeItem } from "../chat.js";
import { IDisposableReference, ResourcePool } from "./chatCollections.js";
import { IChatContentPart } from "./chatContentParts.js";
import { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import { IChatResponseProgressFileTreeData } from "../../common/chatService.js";
import { createFileIconThemableTreeContainerScope } from "../../../files/browser/views/explorerView.js";
import { IFilesConfiguration } from "../../../files/common/files.js";
const $ = dom.$;
let ChatTreeContentPart = class extends Disposable {
  constructor(data, element, treePool, treeDataIndex, openerService) {
    super();
    this.openerService = openerService;
    const ref = this._register(treePool.get());
    this.tree = ref.object;
    this.onDidFocus = this.tree.onDidFocus;
    this._register(this.tree.onDidOpen((e) => {
      if (e.element && !("children" in e.element)) {
        this.openerService.open(e.element.uri);
      }
    }));
    this._register(this.tree.onDidChangeCollapseState(() => {
      this._onDidChangeHeight.fire();
    }));
    this._register(this.tree.onContextMenu((e) => {
      e.browserEvent.preventDefault();
      e.browserEvent.stopPropagation();
    }));
    this.tree.setInput(data).then(() => {
      if (!ref.isStale()) {
        this.tree.layout();
        this._onDidChangeHeight.fire();
      }
    });
    this.domNode = this.tree.getHTMLElement().parentElement;
  }
  static {
    __name(this, "ChatTreeContentPart");
  }
  domNode;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  onDidFocus;
  tree;
  domFocus() {
    this.tree.domFocus();
  }
  hasSameContent(other) {
    return other.kind === "treeData";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatTreeContentPart = __decorateClass([
  __decorateParam(4, IOpenerService)
], ChatTreeContentPart);
let TreePool = class extends Disposable {
  constructor(_onDidChangeVisibility, instantiationService, configService, themeService) {
    super();
    this._onDidChangeVisibility = _onDidChangeVisibility;
    this.instantiationService = instantiationService;
    this.configService = configService;
    this.themeService = themeService;
    this._pool = this._register(new ResourcePool(() => this.treeFactory()));
  }
  static {
    __name(this, "TreePool");
  }
  _pool;
  get inUse() {
    return this._pool.inUse;
  }
  treeFactory() {
    const resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility }));
    const container = $(".interactive-response-progress-tree");
    this._register(createFileIconThemableTreeContainerScope(container, this.themeService));
    const tree = this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "ChatListRenderer",
      container,
      new ChatListTreeDelegate(),
      new ChatListTreeCompressionDelegate(),
      [new ChatListTreeRenderer(resourceLabels, this.configService.getValue("explorer.decorations"))],
      new ChatListTreeDataSource(),
      {
        collapseByDefault: /* @__PURE__ */ __name(() => false, "collapseByDefault"),
        expandOnlyOnTwistieClick: /* @__PURE__ */ __name(() => false, "expandOnlyOnTwistieClick"),
        identityProvider: {
          getId: /* @__PURE__ */ __name((e) => e.uri.toString(), "getId")
        },
        accessibilityProvider: {
          getAriaLabel: /* @__PURE__ */ __name((element) => element.label, "getAriaLabel"),
          getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("treeAriaLabel", "File Tree"), "getWidgetAriaLabel")
        },
        alwaysConsumeMouseWheel: false
      }
    );
    return tree;
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
TreePool = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IThemeService)
], TreePool);
class ChatListTreeDelegate {
  static {
    __name(this, "ChatListTreeDelegate");
  }
  static ITEM_HEIGHT = 22;
  getHeight(element) {
    return ChatListTreeDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return "chatListTreeTemplate";
  }
}
class ChatListTreeCompressionDelegate {
  static {
    __name(this, "ChatListTreeCompressionDelegate");
  }
  isIncompressible(element) {
    return !element.children;
  }
}
class ChatListTreeRenderer {
  constructor(labels, decorations) {
    this.labels = labels;
    this.decorations = decorations;
  }
  static {
    __name(this, "ChatListTreeRenderer");
  }
  templateId = "chatListTreeTemplate";
  renderCompressedElements(element, index, templateData, height) {
    templateData.label.element.style.display = "flex";
    const label = element.element.elements.map((e) => e.label);
    templateData.label.setResource({ resource: element.element.elements[0].uri, name: label }, {
      title: element.element.elements[0].label,
      fileKind: element.children ? FileKind.FOLDER : FileKind.FILE,
      extraClasses: ["explorer-item"],
      fileDecorations: this.decorations
    });
  }
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    const label = templateDisposables.add(this.labels.create(container, { supportHighlights: true }));
    return { templateDisposables, label };
  }
  renderElement(element, index, templateData, height) {
    templateData.label.element.style.display = "flex";
    if (!element.children.length && element.element.type !== FileType.Directory) {
      templateData.label.setFile(element.element.uri, {
        fileKind: FileKind.FILE,
        hidePath: true,
        fileDecorations: this.decorations
      });
    } else {
      templateData.label.setResource({ resource: element.element.uri, name: element.element.label }, {
        title: element.element.label,
        fileKind: FileKind.FOLDER,
        fileDecorations: this.decorations
      });
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
}
class ChatListTreeDataSource {
  static {
    __name(this, "ChatListTreeDataSource");
  }
  hasChildren(element) {
    return !!element.children;
  }
  async getChildren(element) {
    return element.children ?? [];
  }
}
export {
  ChatTreeContentPart,
  TreePool
};
//# sourceMappingURL=chatTreeContentPart.js.map
