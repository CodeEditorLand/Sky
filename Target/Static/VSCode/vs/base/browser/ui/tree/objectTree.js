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
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from "../list/list.js";
import { AbstractTree, IAbstractTreeOptions, IAbstractTreeOptionsUpdate, IStickyScrollDelegate, StickyScrollNode } from "./abstractTree.js";
import { CompressibleObjectTreeModel, ElementMapper, ICompressedTreeElement, ICompressedTreeNode } from "./compressedObjectTreeModel.js";
import { IObjectTreeModel, ObjectTreeModel } from "./objectTreeModel.js";
import { ICollapseStateChangeEvent, IObjectTreeElement, ITreeModel, ITreeNode, ITreeRenderer, ITreeSorter } from "./tree.js";
import { memoize } from "../../../common/decorators.js";
import { Event } from "../../../common/event.js";
import { Iterable } from "../../../common/iterator.js";
class ObjectTree extends AbstractTree {
  constructor(user, container, delegate, renderers, options = {}) {
    super(user, container, delegate, renderers, options);
    this.user = user;
  }
  static {
    __name(this, "ObjectTree");
  }
  get onDidChangeCollapseState() {
    return this.model.onDidChangeCollapseState;
  }
  setChildren(element, children = Iterable.empty(), options) {
    this.model.setChildren(element, children, options);
  }
  rerender(element) {
    if (element === void 0) {
      this.view.rerender();
      return;
    }
    this.model.rerender(element);
  }
  updateElementHeight(element, height) {
    const elementIndex = this.model.getListIndex(element);
    if (elementIndex === -1) {
      return;
    }
    this.view.updateElementHeight(elementIndex, height);
  }
  resort(element, recursive = true) {
    this.model.resort(element, recursive);
  }
  hasElement(element) {
    return this.model.has(element);
  }
  createModel(user, options) {
    return new ObjectTreeModel(user, options);
  }
}
class CompressibleRenderer {
  constructor(_compressedTreeNodeProvider, stickyScrollDelegate, renderer) {
    this._compressedTreeNodeProvider = _compressedTreeNodeProvider;
    this.stickyScrollDelegate = stickyScrollDelegate;
    this.renderer = renderer;
    this.templateId = renderer.templateId;
    if (renderer.onDidChangeTwistieState) {
      this.onDidChangeTwistieState = renderer.onDidChangeTwistieState;
    }
  }
  static {
    __name(this, "CompressibleRenderer");
  }
  templateId;
  onDidChangeTwistieState;
  get compressedTreeNodeProvider() {
    return this._compressedTreeNodeProvider();
  }
  renderTemplate(container) {
    const data = this.renderer.renderTemplate(container);
    return { compressedTreeNode: void 0, data };
  }
  renderElement(node, index, templateData, height) {
    let compressedTreeNode = this.stickyScrollDelegate.getCompressedNode(node);
    if (!compressedTreeNode) {
      compressedTreeNode = this.compressedTreeNodeProvider.getCompressedTreeNode(node.element);
    }
    if (compressedTreeNode.element.elements.length === 1) {
      templateData.compressedTreeNode = void 0;
      this.renderer.renderElement(node, index, templateData.data, height);
    } else {
      templateData.compressedTreeNode = compressedTreeNode;
      this.renderer.renderCompressedElements(compressedTreeNode, index, templateData.data, height);
    }
  }
  disposeElement(node, index, templateData, height) {
    if (templateData.compressedTreeNode) {
      this.renderer.disposeCompressedElements?.(templateData.compressedTreeNode, index, templateData.data, height);
    } else {
      this.renderer.disposeElement?.(node, index, templateData.data, height);
    }
  }
  disposeTemplate(templateData) {
    this.renderer.disposeTemplate(templateData.data);
  }
  renderTwistie(element, twistieElement) {
    if (this.renderer.renderTwistie) {
      return this.renderer.renderTwistie(element, twistieElement);
    }
    return false;
  }
}
__decorateClass([
  memoize
], CompressibleRenderer.prototype, "compressedTreeNodeProvider", 1);
class CompressibleStickyScrollDelegate {
  constructor(modelProvider) {
    this.modelProvider = modelProvider;
  }
  static {
    __name(this, "CompressibleStickyScrollDelegate");
  }
  compressedStickyNodes = /* @__PURE__ */ new Map();
  getCompressedNode(node) {
    return this.compressedStickyNodes.get(node);
  }
  constrainStickyScrollNodes(stickyNodes, stickyScrollMaxItemCount, maxWidgetHeight) {
    this.compressedStickyNodes.clear();
    if (stickyNodes.length === 0) {
      return [];
    }
    for (let i = 0; i < stickyNodes.length; i++) {
      const stickyNode = stickyNodes[i];
      const stickyNodeBottom = stickyNode.position + stickyNode.height;
      const followingReachesMaxHeight = i + 1 < stickyNodes.length && stickyNodeBottom + stickyNodes[i + 1].height > maxWidgetHeight;
      if (followingReachesMaxHeight || i >= stickyScrollMaxItemCount - 1 && stickyScrollMaxItemCount < stickyNodes.length) {
        const uncompressedStickyNodes = stickyNodes.slice(0, i);
        const overflowingStickyNodes = stickyNodes.slice(i);
        const compressedStickyNode = this.compressStickyNodes(overflowingStickyNodes);
        return [...uncompressedStickyNodes, compressedStickyNode];
      }
    }
    return stickyNodes;
  }
  compressStickyNodes(stickyNodes) {
    if (stickyNodes.length === 0) {
      throw new Error("Can't compress empty sticky nodes");
    }
    const compressionModel = this.modelProvider();
    if (!compressionModel.isCompressionEnabled()) {
      return stickyNodes[0];
    }
    const elements = [];
    for (let i = 0; i < stickyNodes.length; i++) {
      const stickyNode = stickyNodes[i];
      const compressedNode2 = compressionModel.getCompressedTreeNode(stickyNode.node.element);
      if (compressedNode2.element) {
        if (i !== 0 && compressedNode2.element.incompressible) {
          break;
        }
        elements.push(...compressedNode2.element.elements);
      }
    }
    if (elements.length < 2) {
      return stickyNodes[0];
    }
    const lastStickyNode = stickyNodes[stickyNodes.length - 1];
    const compressedElement = { elements, incompressible: false };
    const compressedNode = { ...lastStickyNode.node, children: [], element: compressedElement };
    const stickyTreeNode = new Proxy(stickyNodes[0].node, {});
    const compressedStickyNode = {
      node: stickyTreeNode,
      startIndex: stickyNodes[0].startIndex,
      endIndex: lastStickyNode.endIndex,
      position: stickyNodes[0].position,
      height: stickyNodes[0].height
    };
    this.compressedStickyNodes.set(stickyTreeNode, compressedNode);
    return compressedStickyNode;
  }
}
function asObjectTreeOptions(compressedTreeNodeProvider, options) {
  return options && {
    ...options,
    keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
      getKeyboardNavigationLabel(e) {
        let compressedTreeNode;
        try {
          compressedTreeNode = compressedTreeNodeProvider().getCompressedTreeNode(e);
        } catch {
          return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e);
        }
        if (compressedTreeNode.element.elements.length === 1) {
          return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(e);
        } else {
          return options.keyboardNavigationLabelProvider.getCompressedNodeKeyboardNavigationLabel(compressedTreeNode.element.elements);
        }
      }
    }
  };
}
__name(asObjectTreeOptions, "asObjectTreeOptions");
class CompressibleObjectTree extends ObjectTree {
  static {
    __name(this, "CompressibleObjectTree");
  }
  constructor(user, container, delegate, renderers, options = {}) {
    const compressedTreeNodeProvider = /* @__PURE__ */ __name(() => this, "compressedTreeNodeProvider");
    const stickyScrollDelegate = new CompressibleStickyScrollDelegate(() => this.model);
    const compressibleRenderers = renderers.map((r) => new CompressibleRenderer(compressedTreeNodeProvider, stickyScrollDelegate, r));
    super(user, container, delegate, compressibleRenderers, { ...asObjectTreeOptions(compressedTreeNodeProvider, options), stickyScrollDelegate });
  }
  setChildren(element, children = Iterable.empty(), options) {
    this.model.setChildren(element, children, options);
  }
  createModel(user, options) {
    return new CompressibleObjectTreeModel(user, options);
  }
  updateOptions(optionsUpdate = {}) {
    super.updateOptions(optionsUpdate);
    if (typeof optionsUpdate.compressionEnabled !== "undefined") {
      this.model.setCompressionEnabled(optionsUpdate.compressionEnabled);
    }
  }
  getCompressedTreeNode(element = null) {
    return this.model.getCompressedTreeNode(element);
  }
}
export {
  CompressibleObjectTree,
  ObjectTree
};
//# sourceMappingURL=objectTree.js.map
