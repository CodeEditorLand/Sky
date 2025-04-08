var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../nls.js";
import { basename } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { CheckboxUpdate, DataTransferDTO, ExtHostTreeViewsShape, MainThreadTreeViewsShape } from "./extHost.protocol.js";
import { ITreeItem, TreeViewItemHandleArg, ITreeItemLabel, IRevealOptions, TreeCommand, TreeViewPaneHandleArg, ITreeItemCheckboxState, NoTreeViewError } from "../../common/views.js";
import { ExtHostCommands, CommandsConverter } from "./extHostCommands.js";
import { asPromise } from "../../../base/common/async.js";
import * as extHostTypes from "./extHostTypes.js";
import { isUndefinedOrNull, isString } from "../../../base/common/types.js";
import { equals, coalesce } from "../../../base/common/arrays.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { MarkdownString, ViewBadge, DataTransfer } from "./extHostTypeConverters.js";
import { IMarkdownString, isMarkdownString } from "../../../base/common/htmlContent.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { ITreeViewsDnDService, TreeViewsDnDService } from "../../../editor/common/services/treeViewsDnd.js";
import { IAccessibilityInformation } from "../../../platform/accessibility/common/accessibility.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
function toTreeItemLabel(label, extension) {
  if (isString(label)) {
    return { label };
  }
  if (label && typeof label === "object" && typeof label.label === "string") {
    let highlights = void 0;
    if (Array.isArray(label.highlights)) {
      highlights = label.highlights.filter((highlight) => highlight.length === 2 && typeof highlight[0] === "number" && typeof highlight[1] === "number");
      highlights = highlights.length ? highlights : void 0;
    }
    return { label: label.label, highlights };
  }
  return void 0;
}
__name(toTreeItemLabel, "toTreeItemLabel");
class ExtHostTreeViews extends Disposable {
  constructor(_proxy, commands, logService) {
    super();
    this._proxy = _proxy;
    this.commands = commands;
    this.logService = logService;
    function isTreeViewConvertableItem(arg) {
      return arg && arg.$treeViewId && (arg.$treeItemHandle || arg.$selectedTreeItems || arg.$focusedTreeItem);
    }
    __name(isTreeViewConvertableItem, "isTreeViewConvertableItem");
    commands.registerArgumentProcessor({
      processArgument: /* @__PURE__ */ __name((arg) => {
        if (isTreeViewConvertableItem(arg)) {
          return this.convertArgument(arg);
        } else if (Array.isArray(arg) && arg.length > 0) {
          return arg.map((item) => {
            if (isTreeViewConvertableItem(item)) {
              return this.convertArgument(item);
            }
            return item;
          });
        }
        return arg;
      }, "processArgument")
    });
  }
  static {
    __name(this, "ExtHostTreeViews");
  }
  treeViews = /* @__PURE__ */ new Map();
  treeDragAndDropService = new TreeViewsDnDService();
  registerTreeDataProvider(id, treeDataProvider, extension) {
    const treeView = this.createTreeView(id, { treeDataProvider }, extension);
    return { dispose: /* @__PURE__ */ __name(() => treeView.dispose(), "dispose") };
  }
  createTreeView(viewId, options, extension) {
    if (!options || !options.treeDataProvider) {
      throw new Error("Options with treeDataProvider is mandatory");
    }
    const dropMimeTypes = options.dragAndDropController?.dropMimeTypes ?? [];
    const dragMimeTypes = options.dragAndDropController?.dragMimeTypes ?? [];
    const hasHandleDrag = !!options.dragAndDropController?.handleDrag;
    const hasHandleDrop = !!options.dragAndDropController?.handleDrop;
    const treeView = this.createExtHostTreeView(viewId, options, extension);
    const proxyOptions = { showCollapseAll: !!options.showCollapseAll, canSelectMany: !!options.canSelectMany, dropMimeTypes, dragMimeTypes, hasHandleDrag, hasHandleDrop, manuallyManageCheckboxes: !!options.manageCheckboxStateManually };
    const registerPromise = this._proxy.$registerTreeViewDataProvider(viewId, proxyOptions);
    const view = {
      get onDidCollapseElement() {
        return treeView.onDidCollapseElement;
      },
      get onDidExpandElement() {
        return treeView.onDidExpandElement;
      },
      get selection() {
        return treeView.selectedElements;
      },
      get onDidChangeSelection() {
        return treeView.onDidChangeSelection;
      },
      get activeItem() {
        checkProposedApiEnabled(extension, "treeViewActiveItem");
        return treeView.focusedElement;
      },
      get onDidChangeActiveItem() {
        checkProposedApiEnabled(extension, "treeViewActiveItem");
        return treeView.onDidChangeActiveItem;
      },
      get visible() {
        return treeView.visible;
      },
      get onDidChangeVisibility() {
        return treeView.onDidChangeVisibility;
      },
      get onDidChangeCheckboxState() {
        return treeView.onDidChangeCheckboxState;
      },
      get message() {
        return treeView.message;
      },
      set message(message) {
        if (isMarkdownString(message)) {
          checkProposedApiEnabled(extension, "treeViewMarkdownMessage");
        }
        treeView.message = message;
      },
      get title() {
        return treeView.title;
      },
      set title(title) {
        treeView.title = title;
      },
      get description() {
        return treeView.description;
      },
      set description(description) {
        treeView.description = description;
      },
      get badge() {
        return treeView.badge;
      },
      set badge(badge) {
        if (badge !== void 0 && extHostTypes.ViewBadge.isViewBadge(badge)) {
          treeView.badge = {
            value: Math.floor(Math.abs(badge.value)),
            tooltip: badge.tooltip
          };
        } else if (badge === void 0) {
          treeView.badge = void 0;
        }
      },
      reveal: /* @__PURE__ */ __name((element, options2) => {
        return treeView.reveal(element, options2);
      }, "reveal"),
      dispose: /* @__PURE__ */ __name(async () => {
        await registerPromise;
        this.treeViews.delete(viewId);
        treeView.dispose();
      }, "dispose")
    };
    this._register(view);
    return view;
  }
  async $getChildren(treeViewId, treeItemHandles) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      return Promise.reject(new NoTreeViewError(treeViewId));
    }
    if (!treeItemHandles) {
      const children = await treeView.getChildren();
      return children ? [[0, ...children]] : void 0;
    }
    const result = [];
    for (let i = 0; i < treeItemHandles.length; i++) {
      const treeItemHandle = treeItemHandles[i];
      const children = await treeView.getChildren(treeItemHandle);
      if (children) {
        result.push([i, ...children]);
      }
    }
    return result;
  }
  async $handleDrop(destinationViewId, requestId, treeDataTransferDTO, targetItemHandle, token, operationUuid, sourceViewId, sourceTreeItemHandles) {
    const treeView = this.treeViews.get(destinationViewId);
    if (!treeView) {
      return Promise.reject(new NoTreeViewError(destinationViewId));
    }
    const treeDataTransfer = DataTransfer.toDataTransfer(treeDataTransferDTO, async (dataItemIndex) => {
      return (await this._proxy.$resolveDropFileData(destinationViewId, requestId, dataItemIndex)).buffer;
    });
    if (sourceViewId === destinationViewId && sourceTreeItemHandles) {
      await this.addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid);
    }
    return treeView.onDrop(treeDataTransfer, targetItemHandle, token);
  }
  async addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid) {
    const existingTransferOperation = this.treeDragAndDropService.removeDragOperationTransfer(operationUuid);
    if (existingTransferOperation) {
      (await existingTransferOperation)?.forEach((value, key) => {
        if (value) {
          treeDataTransfer.set(key, value);
        }
      });
    } else if (operationUuid && treeView.handleDrag) {
      const willDropPromise = treeView.handleDrag(sourceTreeItemHandles, treeDataTransfer, token);
      this.treeDragAndDropService.addDragOperationTransfer(operationUuid, willDropPromise);
      await willDropPromise;
    }
    return treeDataTransfer;
  }
  async $handleDrag(sourceViewId, sourceTreeItemHandles, operationUuid, token) {
    const treeView = this.treeViews.get(sourceViewId);
    if (!treeView) {
      return Promise.reject(new NoTreeViewError(sourceViewId));
    }
    const treeDataTransfer = await this.addAdditionalTransferItems(new extHostTypes.DataTransfer(), treeView, sourceTreeItemHandles, token, operationUuid);
    if (!treeDataTransfer || token.isCancellationRequested) {
      return;
    }
    return DataTransfer.from(treeDataTransfer);
  }
  async $hasResolve(treeViewId) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      throw new NoTreeViewError(treeViewId);
    }
    return treeView.hasResolve;
  }
  $resolve(treeViewId, treeItemHandle, token) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      throw new NoTreeViewError(treeViewId);
    }
    return treeView.resolveTreeItem(treeItemHandle, token);
  }
  $setExpanded(treeViewId, treeItemHandle, expanded) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      throw new NoTreeViewError(treeViewId);
    }
    treeView.setExpanded(treeItemHandle, expanded);
  }
  $setSelectionAndFocus(treeViewId, selectedHandles, focusedHandle) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      throw new NoTreeViewError(treeViewId);
    }
    treeView.setSelectionAndFocus(selectedHandles, focusedHandle);
  }
  $setVisible(treeViewId, isVisible) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      if (!isVisible) {
        return;
      }
      throw new NoTreeViewError(treeViewId);
    }
    treeView.setVisible(isVisible);
  }
  $changeCheckboxState(treeViewId, checkboxUpdate) {
    const treeView = this.treeViews.get(treeViewId);
    if (!treeView) {
      throw new NoTreeViewError(treeViewId);
    }
    treeView.setCheckboxState(checkboxUpdate);
  }
  createExtHostTreeView(id, options, extension) {
    const treeView = this._register(new ExtHostTreeView(id, options, this._proxy, this.commands.converter, this.logService, extension));
    this.treeViews.set(id, treeView);
    return treeView;
  }
  convertArgument(arg) {
    const treeView = this.treeViews.get(arg.$treeViewId);
    if (treeView && "$treeItemHandle" in arg) {
      return treeView.getExtensionElement(arg.$treeItemHandle);
    }
    if (treeView && "$focusedTreeItem" in arg && arg.$focusedTreeItem) {
      return treeView.focusedElement;
    }
    return null;
  }
}
class ExtHostTreeView extends Disposable {
  constructor(viewId, options, proxy, commands, logService, extension) {
    super();
    this.viewId = viewId;
    this.proxy = proxy;
    this.commands = commands;
    this.logService = logService;
    this.extension = extension;
    if (extension.contributes && extension.contributes.views) {
      for (const location in extension.contributes.views) {
        for (const view of extension.contributes.views[location]) {
          if (view.id === viewId) {
            this._title = view.name;
          }
        }
      }
    }
    this.dataProvider = options.treeDataProvider;
    this.dndController = options.dragAndDropController;
    if (this.dataProvider.onDidChangeTreeData) {
      this._register(this.dataProvider.onDidChangeTreeData((elementOrElements) => {
        if (Array.isArray(elementOrElements) && elementOrElements.length === 0) {
          return;
        }
        this._onDidChangeData.fire({ message: false, element: elementOrElements });
      }));
    }
    let refreshingPromise;
    let promiseCallback;
    const onDidChangeData = Event.debounce(this._onDidChangeData.event, (result, current) => {
      if (!result) {
        result = { message: false, elements: [] };
      }
      if (current.element !== false) {
        if (!refreshingPromise) {
          refreshingPromise = new Promise((c) => promiseCallback = c);
          this.refreshPromise = this.refreshPromise.then(() => refreshingPromise);
        }
        if (Array.isArray(current.element)) {
          result.elements.push(...current.element);
        } else {
          result.elements.push(current.element);
        }
      }
      if (current.message) {
        result.message = true;
      }
      return result;
    }, 200, true);
    this._register(onDidChangeData(({ message, elements }) => {
      if (elements.length) {
        this.refreshQueue = this.refreshQueue.then(() => {
          const _promiseCallback = promiseCallback;
          refreshingPromise = null;
          return this.refresh(elements).then(() => _promiseCallback());
        });
      }
      if (message) {
        this.proxy.$setMessage(this.viewId, MarkdownString.fromStrict(this._message) ?? "");
      }
    }));
  }
  static {
    __name(this, "ExtHostTreeView");
  }
  static LABEL_HANDLE_PREFIX = "0";
  static ID_HANDLE_PREFIX = "1";
  dataProvider;
  dndController;
  roots = void 0;
  elements = /* @__PURE__ */ new Map();
  nodes = /* @__PURE__ */ new Map();
  _visible = false;
  get visible() {
    return this._visible;
  }
  _selectedHandles = [];
  get selectedElements() {
    return this._selectedHandles.map((handle) => this.getExtensionElement(handle)).filter((element) => !isUndefinedOrNull(element));
  }
  _focusedHandle = void 0;
  get focusedElement() {
    return this._focusedHandle ? this.getExtensionElement(this._focusedHandle) : void 0;
  }
  _onDidExpandElement = this._register(new Emitter());
  onDidExpandElement = this._onDidExpandElement.event;
  _onDidCollapseElement = this._register(new Emitter());
  onDidCollapseElement = this._onDidCollapseElement.event;
  _onDidChangeSelection = this._register(new Emitter());
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onDidChangeActiveItem = this._register(new Emitter());
  onDidChangeActiveItem = this._onDidChangeActiveItem.event;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  _onDidChangeCheckboxState = this._register(new Emitter());
  onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
  _onDidChangeData = this._register(new Emitter());
  refreshPromise = Promise.resolve();
  refreshQueue = Promise.resolve();
  async getChildren(parentHandle) {
    const parentElement = parentHandle ? this.getExtensionElement(parentHandle) : void 0;
    if (parentHandle && !parentElement) {
      this.logService.error(`No tree item with id '${parentHandle}' found.`);
      return Promise.resolve([]);
    }
    let childrenNodes = this.getChildrenNodes(parentHandle);
    if (!childrenNodes) {
      childrenNodes = await this.fetchChildrenNodes(parentElement);
    }
    return childrenNodes ? childrenNodes.map((n) => n.item) : void 0;
  }
  getExtensionElement(treeItemHandle) {
    return this.elements.get(treeItemHandle);
  }
  reveal(element, options) {
    options = options ? options : { select: true, focus: false };
    const select = isUndefinedOrNull(options.select) ? true : options.select;
    const focus = isUndefinedOrNull(options.focus) ? false : options.focus;
    const expand = isUndefinedOrNull(options.expand) ? false : options.expand;
    if (typeof this.dataProvider.getParent !== "function") {
      return Promise.reject(new Error(`Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`));
    }
    if (element) {
      return this.refreshPromise.then(() => this.resolveUnknownParentChain(element)).then((parentChain) => this.resolveTreeNode(element, parentChain[parentChain.length - 1]).then((treeNode) => this.proxy.$reveal(this.viewId, { item: treeNode.item, parentChain: parentChain.map((p) => p.item) }, { select, focus, expand })), (error) => this.logService.error(error));
    } else {
      return this.proxy.$reveal(this.viewId, void 0, { select, focus, expand });
    }
  }
  _message = "";
  get message() {
    return this._message;
  }
  set message(message) {
    this._message = message;
    this._onDidChangeData.fire({ message: true, element: false });
  }
  _title = "";
  get title() {
    return this._title;
  }
  set title(title) {
    this._title = title;
    this.proxy.$setTitle(this.viewId, title, this._description);
  }
  _description;
  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
    this.proxy.$setTitle(this.viewId, this._title, description);
  }
  _badge;
  get badge() {
    return this._badge;
  }
  set badge(badge) {
    if (this._badge?.value === badge?.value && this._badge?.tooltip === badge?.tooltip) {
      return;
    }
    this._badge = ViewBadge.from(badge);
    this.proxy.$setBadge(this.viewId, badge);
  }
  setExpanded(treeItemHandle, expanded) {
    const element = this.getExtensionElement(treeItemHandle);
    if (element) {
      if (expanded) {
        this._onDidExpandElement.fire(Object.freeze({ element }));
      } else {
        this._onDidCollapseElement.fire(Object.freeze({ element }));
      }
    }
  }
  setSelectionAndFocus(selectedHandles, focusedHandle) {
    const changedSelection = !equals(this._selectedHandles, selectedHandles);
    this._selectedHandles = selectedHandles;
    const changedFocus = this._focusedHandle !== focusedHandle;
    this._focusedHandle = focusedHandle;
    if (changedSelection) {
      this._onDidChangeSelection.fire(Object.freeze({ selection: this.selectedElements }));
    }
    if (changedFocus) {
      this._onDidChangeActiveItem.fire(Object.freeze({ activeItem: this.focusedElement }));
    }
  }
  setVisible(visible) {
    if (visible !== this._visible) {
      this._visible = visible;
      this._onDidChangeVisibility.fire(Object.freeze({ visible: this._visible }));
    }
  }
  async setCheckboxState(checkboxUpdates) {
    const items = (await Promise.all(checkboxUpdates.map(async (checkboxUpdate) => {
      const extensionItem = this.getExtensionElement(checkboxUpdate.treeItemHandle);
      if (extensionItem) {
        return {
          extensionItem,
          treeItem: await this.dataProvider.getTreeItem(extensionItem),
          newState: checkboxUpdate.newState ? extHostTypes.TreeItemCheckboxState.Checked : extHostTypes.TreeItemCheckboxState.Unchecked
        };
      }
      return Promise.resolve(void 0);
    }))).filter((item) => item !== void 0);
    items.forEach((item) => {
      item.treeItem.checkboxState = item.newState ? extHostTypes.TreeItemCheckboxState.Checked : extHostTypes.TreeItemCheckboxState.Unchecked;
    });
    this._onDidChangeCheckboxState.fire({ items: items.map((item) => [item.extensionItem, item.newState]) });
  }
  async handleDrag(sourceTreeItemHandles, treeDataTransfer, token) {
    const extensionTreeItems = [];
    for (const sourceHandle of sourceTreeItemHandles) {
      const extensionItem = this.getExtensionElement(sourceHandle);
      if (extensionItem) {
        extensionTreeItems.push(extensionItem);
      }
    }
    if (!this.dndController?.handleDrag || extensionTreeItems.length === 0) {
      return;
    }
    await this.dndController.handleDrag(extensionTreeItems, treeDataTransfer, token);
    return treeDataTransfer;
  }
  get hasHandleDrag() {
    return !!this.dndController?.handleDrag;
  }
  async onDrop(treeDataTransfer, targetHandleOrNode, token) {
    const target = targetHandleOrNode ? this.getExtensionElement(targetHandleOrNode) : void 0;
    if (!target && targetHandleOrNode || !this.dndController?.handleDrop) {
      return;
    }
    return asPromise(() => this.dndController?.handleDrop ? this.dndController.handleDrop(target, treeDataTransfer, token) : void 0);
  }
  get hasResolve() {
    return !!this.dataProvider.resolveTreeItem;
  }
  async resolveTreeItem(treeItemHandle, token) {
    if (!this.dataProvider.resolveTreeItem) {
      return;
    }
    const element = this.elements.get(treeItemHandle);
    if (element) {
      const node = this.nodes.get(element);
      if (node) {
        const resolve = await this.dataProvider.resolveTreeItem(node.extensionItem, element, token) ?? node.extensionItem;
        this.validateTreeItem(resolve);
        node.item.tooltip = this.getTooltip(resolve.tooltip);
        node.item.command = this.getCommand(node.disposableStore, resolve.command);
        return node.item;
      }
    }
    return;
  }
  resolveUnknownParentChain(element) {
    return this.resolveParent(element).then((parent) => {
      if (!parent) {
        return Promise.resolve([]);
      }
      return this.resolveUnknownParentChain(parent).then((result) => this.resolveTreeNode(parent, result[result.length - 1]).then((parentNode) => {
        result.push(parentNode);
        return result;
      }));
    });
  }
  resolveParent(element) {
    const node = this.nodes.get(element);
    if (node) {
      return Promise.resolve(node.parent ? this.elements.get(node.parent.item.handle) : void 0);
    }
    return asPromise(() => this.dataProvider.getParent(element));
  }
  resolveTreeNode(element, parent) {
    const node = this.nodes.get(element);
    if (node) {
      return Promise.resolve(node);
    }
    return asPromise(() => this.dataProvider.getTreeItem(element)).then((extTreeItem) => this.createHandle(element, extTreeItem, parent, true)).then((handle) => this.getChildren(parent ? parent.item.handle : void 0).then(() => {
      const cachedElement = this.getExtensionElement(handle);
      if (cachedElement) {
        const node2 = this.nodes.get(cachedElement);
        if (node2) {
          return Promise.resolve(node2);
        }
      }
      throw new Error(`Cannot resolve tree item for element ${handle} from extension ${this.extension.identifier.value}`);
    }));
  }
  getChildrenNodes(parentNodeOrHandle) {
    if (parentNodeOrHandle) {
      let parentNode;
      if (typeof parentNodeOrHandle === "string") {
        const parentElement = this.getExtensionElement(parentNodeOrHandle);
        parentNode = parentElement ? this.nodes.get(parentElement) : void 0;
      } else {
        parentNode = parentNodeOrHandle;
      }
      return parentNode ? parentNode.children || void 0 : void 0;
    }
    return this.roots;
  }
  async fetchChildrenNodes(parentElement) {
    this.clearChildren(parentElement);
    const cts = new CancellationTokenSource(this._refreshCancellationSource.token);
    try {
      const parentNode = parentElement ? this.nodes.get(parentElement) : void 0;
      const elements = await this.dataProvider.getChildren(parentElement);
      if (cts.token.isCancellationRequested) {
        return void 0;
      }
      const coalescedElements = coalesce(elements || []);
      const treeItems = await Promise.all(coalesce(coalescedElements).map((element) => {
        return this.dataProvider.getTreeItem(element);
      }));
      if (cts.token.isCancellationRequested) {
        return void 0;
      }
      const items = treeItems.map((item, index) => item ? this.createAndRegisterTreeNode(coalescedElements[index], item, parentNode) : null);
      return coalesce(items);
    } finally {
      cts.dispose();
    }
  }
  _refreshCancellationSource = new CancellationTokenSource();
  refresh(elements) {
    const hasRoot = elements.some((element) => !element);
    if (hasRoot) {
      this._refreshCancellationSource.dispose(true);
      this._refreshCancellationSource = new CancellationTokenSource();
      this.clearAll();
      return this.proxy.$refresh(this.viewId);
    } else {
      const handlesToRefresh = this.getHandlesToRefresh(elements);
      if (handlesToRefresh.length) {
        return this.refreshHandles(handlesToRefresh);
      }
    }
    return Promise.resolve(void 0);
  }
  getHandlesToRefresh(elements) {
    const elementsToUpdate = /* @__PURE__ */ new Set();
    const elementNodes = elements.map((element) => this.nodes.get(element));
    for (const elementNode of elementNodes) {
      if (elementNode && !elementsToUpdate.has(elementNode.item.handle)) {
        let currentNode = elementNode;
        while (currentNode && currentNode.parent && elementNodes.findIndex((node) => currentNode && currentNode.parent && node && node.item.handle === currentNode.parent.item.handle) === -1) {
          const parentElement = this.elements.get(currentNode.parent.item.handle);
          currentNode = parentElement ? this.nodes.get(parentElement) : void 0;
        }
        if (currentNode && !currentNode.parent) {
          elementsToUpdate.add(elementNode.item.handle);
        }
      }
    }
    const handlesToUpdate = [];
    elementsToUpdate.forEach((handle) => {
      const element = this.elements.get(handle);
      if (element) {
        const node = this.nodes.get(element);
        if (node && (!node.parent || !elementsToUpdate.has(node.parent.item.handle))) {
          handlesToUpdate.push(handle);
        }
      }
    });
    return handlesToUpdate;
  }
  refreshHandles(itemHandles) {
    const itemsToRefresh = {};
    return Promise.all(itemHandles.map((treeItemHandle) => this.refreshNode(treeItemHandle).then((node) => {
      if (node) {
        itemsToRefresh[treeItemHandle] = node.item;
      }
    }))).then(() => Object.keys(itemsToRefresh).length ? this.proxy.$refresh(this.viewId, itemsToRefresh) : void 0);
  }
  refreshNode(treeItemHandle) {
    const extElement = this.getExtensionElement(treeItemHandle);
    if (extElement) {
      const existing = this.nodes.get(extElement);
      if (existing) {
        this.clearChildren(extElement);
        return asPromise(() => this.dataProvider.getTreeItem(extElement)).then((extTreeItem) => {
          if (extTreeItem) {
            const newNode = this.createTreeNode(extElement, extTreeItem, existing.parent);
            this.updateNodeCache(extElement, newNode, existing, existing.parent);
            existing.dispose();
            return newNode;
          }
          return null;
        });
      }
    }
    return Promise.resolve(null);
  }
  createAndRegisterTreeNode(element, extTreeItem, parentNode) {
    const node = this.createTreeNode(element, extTreeItem, parentNode);
    if (extTreeItem.id && this.elements.has(node.item.handle)) {
      throw new Error(localize("treeView.duplicateElement", "Element with id {0} is already registered", extTreeItem.id));
    }
    this.addNodeToCache(element, node);
    this.addNodeToParentCache(node, parentNode);
    return node;
  }
  getTooltip(tooltip) {
    if (extHostTypes.MarkdownString.isMarkdownString(tooltip)) {
      return MarkdownString.from(tooltip);
    }
    return tooltip;
  }
  getCommand(disposable, command) {
    return command ? { ...this.commands.toInternal(command, disposable), originalId: command.command } : void 0;
  }
  getCheckbox(extensionTreeItem) {
    if (extensionTreeItem.checkboxState === void 0) {
      return void 0;
    }
    let checkboxState;
    let tooltip = void 0;
    let accessibilityInformation = void 0;
    if (typeof extensionTreeItem.checkboxState === "number") {
      checkboxState = extensionTreeItem.checkboxState;
    } else {
      checkboxState = extensionTreeItem.checkboxState.state;
      tooltip = extensionTreeItem.checkboxState.tooltip;
      accessibilityInformation = extensionTreeItem.checkboxState.accessibilityInformation;
    }
    return { isChecked: checkboxState === extHostTypes.TreeItemCheckboxState.Checked, tooltip, accessibilityInformation };
  }
  validateTreeItem(extensionTreeItem) {
    if (!extHostTypes.TreeItem.isTreeItem(extensionTreeItem, this.extension)) {
      throw new Error(`Extension ${this.extension.identifier.value} has provided an invalid tree item.`);
    }
  }
  createTreeNode(element, extensionTreeItem, parent) {
    this.validateTreeItem(extensionTreeItem);
    const disposableStore = this._register(new DisposableStore());
    const handle = this.createHandle(element, extensionTreeItem, parent);
    const icon = this.getLightIconPath(extensionTreeItem);
    const item = {
      handle,
      parentHandle: parent ? parent.item.handle : void 0,
      label: toTreeItemLabel(extensionTreeItem.label, this.extension),
      description: extensionTreeItem.description,
      resourceUri: extensionTreeItem.resourceUri,
      tooltip: this.getTooltip(extensionTreeItem.tooltip),
      command: this.getCommand(disposableStore, extensionTreeItem.command),
      contextValue: extensionTreeItem.contextValue,
      icon,
      iconDark: this.getDarkIconPath(extensionTreeItem) || icon,
      themeIcon: this.getThemeIcon(extensionTreeItem),
      collapsibleState: isUndefinedOrNull(extensionTreeItem.collapsibleState) ? extHostTypes.TreeItemCollapsibleState.None : extensionTreeItem.collapsibleState,
      accessibilityInformation: extensionTreeItem.accessibilityInformation,
      checkbox: this.getCheckbox(extensionTreeItem)
    };
    return {
      item,
      extensionItem: extensionTreeItem,
      parent,
      children: void 0,
      disposableStore,
      dispose() {
        disposableStore.dispose();
      }
    };
  }
  getThemeIcon(extensionTreeItem) {
    return extensionTreeItem.iconPath instanceof extHostTypes.ThemeIcon ? extensionTreeItem.iconPath : void 0;
  }
  createHandle(element, { id, label, resourceUri }, parent, returnFirst) {
    if (id) {
      return `${ExtHostTreeView.ID_HANDLE_PREFIX}/${id}`;
    }
    const treeItemLabel = toTreeItemLabel(label, this.extension);
    const prefix = parent ? parent.item.handle : ExtHostTreeView.LABEL_HANDLE_PREFIX;
    let elementId = treeItemLabel ? treeItemLabel.label : resourceUri ? basename(resourceUri) : "";
    elementId = elementId.indexOf("/") !== -1 ? elementId.replace("/", "//") : elementId;
    const existingHandle = this.nodes.has(element) ? this.nodes.get(element).item.handle : void 0;
    const childrenNodes = this.getChildrenNodes(parent) || [];
    let handle;
    let counter = 0;
    do {
      handle = `${prefix}/${counter}:${elementId}`;
      if (returnFirst || !this.elements.has(handle) || existingHandle === handle) {
        break;
      }
      counter++;
    } while (counter <= childrenNodes.length);
    return handle;
  }
  getLightIconPath(extensionTreeItem) {
    if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof extHostTypes.ThemeIcon)) {
      if (typeof extensionTreeItem.iconPath === "string" || URI.isUri(extensionTreeItem.iconPath)) {
        return this.getIconPath(extensionTreeItem.iconPath);
      }
      return this.getIconPath(extensionTreeItem.iconPath.light);
    }
    return void 0;
  }
  getDarkIconPath(extensionTreeItem) {
    if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof extHostTypes.ThemeIcon) && extensionTreeItem.iconPath.dark) {
      return this.getIconPath(extensionTreeItem.iconPath.dark);
    }
    return void 0;
  }
  getIconPath(iconPath) {
    if (URI.isUri(iconPath)) {
      return iconPath;
    }
    return URI.file(iconPath);
  }
  addNodeToCache(element, node) {
    this.elements.set(node.item.handle, element);
    this.nodes.set(element, node);
  }
  updateNodeCache(element, newNode, existing, parentNode) {
    this.elements.delete(newNode.item.handle);
    this.nodes.delete(element);
    if (newNode.item.handle !== existing.item.handle) {
      this.elements.delete(existing.item.handle);
    }
    this.addNodeToCache(element, newNode);
    const childrenNodes = this.getChildrenNodes(parentNode) || [];
    const childNode = childrenNodes.filter((c) => c.item.handle === existing.item.handle)[0];
    if (childNode) {
      childrenNodes.splice(childrenNodes.indexOf(childNode), 1, newNode);
    }
  }
  addNodeToParentCache(node, parentNode) {
    if (parentNode) {
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(node);
    } else {
      if (!this.roots) {
        this.roots = [];
      }
      this.roots.push(node);
    }
  }
  clearChildren(parentElement) {
    if (parentElement) {
      const node = this.nodes.get(parentElement);
      if (node) {
        if (node.children) {
          for (const child of node.children) {
            const childElement = this.elements.get(child.item.handle);
            if (childElement) {
              this.clear(childElement);
            }
          }
        }
        node.children = void 0;
      }
    } else {
      this.clearAll();
    }
  }
  clear(element) {
    const node = this.nodes.get(element);
    if (node) {
      if (node.children) {
        for (const child of node.children) {
          const childElement = this.elements.get(child.item.handle);
          if (childElement) {
            this.clear(childElement);
          }
        }
      }
      this.nodes.delete(element);
      this.elements.delete(node.item.handle);
      node.dispose();
    }
  }
  clearAll() {
    this.roots = void 0;
    this.elements.clear();
    this.nodes.forEach((node) => node.dispose());
    this.nodes.clear();
  }
  dispose() {
    super.dispose();
    this._refreshCancellationSource.dispose();
    this.clearAll();
    this.proxy.$disposeTree(this.viewId);
  }
}
export {
  ExtHostTreeViews
};
//# sourceMappingURL=extHostTreeViews.js.map
