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
import * as dom from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { WorkbenchObjectTree } from "../../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { asCssVariable, buttonSecondaryBackground, buttonSecondaryForeground, buttonSecondaryHoverBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { katexContainerClassName } from "../../../markdown/common/markedKatexExtension.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatConfiguration, ChatModeKind } from "../../common/constants.js";
import { isRequestVM, isResponseVM } from "../../common/model/chatViewModel.js";
import { CodeBlockModelCollection } from "../../common/widget/codeBlockModelCollection.js";
import { ChatAccessibilityProvider } from "../accessibility/chatAccessibilityProvider.js";
import { IChatAccessibilityService } from "../chat.js";
import { ChatListDelegate, ChatListItemRenderer } from "./chatListRenderer.js";
import { ChatEditorOptions } from "./chatOptions.js";
import { ChatPendingDragController } from "./chatPendingDragAndDrop.js";
let ChatListWidget = class ChatListWidget2 extends Disposable {
  static {
    __name(this, "ChatListWidget");
  }
  /**
   * Event fired when a request item is clicked.
   */
  get onDidClickRequest() {
    return this._renderer.onDidClickRequest;
  }
  /**
   * Event fired when an item is re-rendered.
   */
  get onDidRerender() {
    return this._renderer.onDidRerender;
  }
  /**
   * Event fired when a template is disposed.
   */
  get onDidDispose() {
    return this._renderer.onDidDispose;
  }
  /**
   * Event fired when focus moves outside the editing area.
   */
  get onDidFocusOutside() {
    return this._renderer.onDidFocusOutside;
  }
  //#endregion
  //#region Properties
  get domNode() {
    return this._container;
  }
  get scrollTop() {
    return this._tree.scrollTop;
  }
  set scrollTop(value) {
    this._tree.scrollTop = value;
  }
  get scrollHeight() {
    return this._tree.scrollHeight;
  }
  get renderHeight() {
    return this._tree.renderHeight;
  }
  get contentHeight() {
    return this._tree.contentHeight;
  }
  /**
   * Whether the list is scrolled to the bottom.
   */
  get isScrolledToBottom() {
    return this._tree.scrollTop + this._tree.renderHeight >= this._tree.scrollHeight - 2;
  }
  /**
   * The last item in the list.
   */
  get lastItem() {
    return this._lastItem;
  }
  //#endregion
  constructor(container, options, instantiationService, contextKeyService, chatService, contextMenuService, logService, configurationService, chatAccessibilityService) {
    super();
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.chatService = chatService;
    this.contextMenuService = contextMenuService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.chatAccessibilityService = chatAccessibilityService;
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidClickFollowup = this._register(new Emitter());
    this.onDidClickFollowup = this._onDidClickFollowup.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidChangeItemHeight = this._register(new Emitter());
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
    this._visible = true;
    this._mostRecentlyFocusedItemIndex = -1;
    this._scrollLock = true;
    this._suppressAutoScroll = false;
    this._settingChangeCounter = 0;
    this._visibleChangeCount = 0;
    this._bodyDimension = null;
    this._previousLastItemMinHeight = null;
    this._viewModel = options.viewModel;
    this._codeBlockModelCollection = options.codeBlockModelCollection ?? this._register(this.instantiationService.createInstance(CodeBlockModelCollection, "chatListWidget"));
    this._location = options.location;
    this._getCurrentLanguageModelId = options.getCurrentLanguageModelId;
    this._getCurrentModeInfo = options.getCurrentModeInfo;
    this._lastItemIdContextKey = ChatContextKeys.lastItemId.bindTo(this.contextKeyService);
    this._container = container;
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.contextKeyService])));
    this._renderStyle = options.renderStyle;
    const overflowWidgetsContainer = options.overflowWidgetsDomNode ?? document.createElement("div");
    if (!options.overflowWidgetsDomNode) {
      overflowWidgetsContainer.classList.add("chat-overflow-widget-container", "monaco-editor");
      this._container.append(overflowWidgetsContainer);
      this._register(toDisposable(() => overflowWidgetsContainer.remove()));
    }
    const editorOptions = options.editorOptions ?? this._register(scopedInstantiationService.createInstance(ChatEditorOptions, options.viewId, "foreground", options.inputEditorBackground ?? "chat.requestEditor.background", options.resultEditorBackground ?? "chat.responseEditor.background"));
    const delegate = scopedInstantiationService.createInstance(ChatListDelegate, options.defaultElementHeight ?? 200);
    const rendererDelegate = {
      getListLength: /* @__PURE__ */ __name(() => this._tree.getNode(null).visibleChildrenCount, "getListLength"),
      onDidScroll: this.onDidScroll,
      container: this._container,
      currentChatMode: options.currentChatMode ?? (() => ChatModeKind.Ask)
    };
    this._renderer = this._register(scopedInstantiationService.createInstance(ChatListItemRenderer, editorOptions, options.rendererOptions ?? {}, rendererDelegate, this._codeBlockModelCollection, overflowWidgetsContainer, this._viewModel));
    this._register(this._renderer.onDidClickFollowup((item) => {
      this._onDidClickFollowup.fire(item);
    }));
    this._register(this._renderer.onDidChangeItemHeight((e) => {
      this._updateElementHeight(e.element, e.height);
      const secondToLastItem = this._viewModel?.getItems().at(-2);
      if (e.element.id === secondToLastItem?.id) {
        this.updateLastItemMinHeight();
      }
      this._onDidChangeItemHeight.fire(e);
    }));
    this._register(this._renderer.onDidClickRerunWithAgentOrCommandDetection((e) => {
      const request = this.chatService.getSession(e.sessionResource)?.getRequests().find((candidate) => candidate.id === e.requestId);
      if (request) {
        const sendOptions = {
          noCommandDetection: true,
          attempt: request.attempt + 1,
          location: this._location,
          userSelectedModelId: this._getCurrentLanguageModelId?.(),
          modeInfo: this._getCurrentModeInfo?.()
        };
        this.chatAccessibilityService.acceptRequest(e.sessionResource);
        this.chatService.resendRequest(request, sendOptions).catch((e2) => this.logService.error("FAILED to rerun request", e2));
      }
    }));
    this._renderer.pendingDragController = this._register(scopedInstantiationService.createInstance(ChatPendingDragController, this._container, () => this._viewModel));
    const styles = options.styles ?? {};
    this._tree = this._register(scopedInstantiationService.createInstance(WorkbenchObjectTree, "ChatList", this._container, delegate, [this._renderer], {
      identityProvider: { getId: /* @__PURE__ */ __name((e) => e.id, "getId") },
      horizontalScrolling: false,
      alwaysConsumeMouseWheel: false,
      supportDynamicHeights: true,
      hideTwistiesOfChildlessElements: true,
      accessibilityProvider: this.instantiationService.createInstance(ChatAccessibilityProvider),
      keyboardNavigationLabelProvider: {
        getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => isRequestVM(e) ? e.message : isResponseVM(e) ? e.response.value : "", "getKeyboardNavigationLabel")
      },
      setRowLineHeight: false,
      scrollToActiveElement: true,
      filter: options.filter,
      overrideStyles: {
        listFocusBackground: styles.listBackground,
        listInactiveFocusBackground: styles.listBackground,
        listActiveSelectionBackground: styles.listBackground,
        listFocusAndSelectionBackground: styles.listBackground,
        listInactiveSelectionBackground: styles.listBackground,
        listHoverBackground: styles.listBackground,
        listBackground: styles.listBackground,
        listFocusForeground: styles.listForeground,
        listHoverForeground: styles.listForeground,
        listInactiveFocusForeground: styles.listForeground,
        listInactiveSelectionForeground: styles.listForeground,
        listActiveSelectionForeground: styles.listForeground,
        listFocusAndSelectionForeground: styles.listForeground,
        listActiveSelectionIconForeground: void 0,
        listInactiveSelectionIconForeground: void 0
      }
    }));
    this._scrollDownButton = this._register(new Button(this._container, {
      buttonBackground: asCssVariable(buttonSecondaryBackground),
      buttonForeground: asCssVariable(buttonSecondaryForeground),
      buttonHoverBackground: asCssVariable(buttonSecondaryHoverBackground),
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0,
      supportIcons: true
    }));
    this._scrollDownButton.element.classList.add("chat-scroll-down");
    this._scrollDownButton.label = `$(${Codicon.chevronDown.id})`;
    this._scrollDownButton.element.style.display = "none";
    this._register(this._scrollDownButton.onDidClick(() => {
      this.setScrollLock(true);
      this.scrollToEnd();
    }));
    this._register(this._tree.onDidChangeContentHeight(() => {
      this._onDidChangeContentHeight.fire();
    }));
    this._register(this._tree.onDidFocus(() => {
      this._onDidFocus.fire();
    }));
    this._register(this._tree.onDidChangeFocus(() => {
      const focused = this.getFocus();
      if (focused && focused.length > 0) {
        const focusedItem = focused[0];
        const items = this.getItems();
        const idx = items.findIndex((i) => i === focusedItem);
        if (idx !== -1) {
          this._mostRecentlyFocusedItemIndex = idx;
        }
      }
    }));
    this._register(this._tree.onDidScroll((e) => {
      this._onDidScroll.fire(e);
      this.updateScrollDownButtonVisibility();
    }));
    this._register(this._tree.onContextMenu((e) => {
      this.handleContextMenu(e);
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.EditRequests) || e.affectsConfiguration(ChatConfiguration.CheckpointsEnabled)) {
        this._settingChangeCounter++;
        this.refresh();
      }
    }));
  }
  //#region Internal event handlers
  /**
   * Update scroll-down button visibility based on scroll position and scroll lock.
   */
  updateScrollDownButtonVisibility() {
    const show = !this.isScrolledToBottom && !this._scrollLock;
    this._scrollDownButton.element.style.display = show ? "" : "none";
  }
  /**
   * Handle context menu events.
   */
  handleContextMenu(e) {
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
    const selected = e.element;
    const target = e.browserEvent.target;
    const isKatexElement = target.closest(`.${katexContainerClassName}`) !== null;
    const scopedContextKeyService = this.contextKeyService.createOverlay([
      [ChatContextKeys.responseIsFiltered.key, isResponseVM(selected) && !!selected.errorDetails?.responseIsFiltered],
      [ChatContextKeys.isKatexMathElement.key, isKatexElement]
    ]);
    this.contextMenuService.showContextMenu({
      menuId: MenuId.ChatContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: scopedContextKeyService,
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActionsContext: /* @__PURE__ */ __name(() => selected, "getActionsContext")
    });
  }
  //#endregion
  //#region ViewModel methods
  /**
   * Set the view model for the list to render.
   */
  setViewModel(viewModel) {
    this._viewModel = viewModel;
    this._renderer.updateViewModel(viewModel);
  }
  /**
   * Refresh the list from the current view model.
   * Uses internal state for diff identity calculation.
   */
  refresh() {
    if (!this._viewModel) {
      this._tree.setChildren(null, []);
      this._lastItem = void 0;
      this._lastItemIdContextKey.set([]);
      return;
    }
    const items = this._viewModel.getItems();
    this._lastItem = items.at(-1);
    this._lastItemIdContextKey.set(this._lastItem ? [this._lastItem.id] : []);
    const treeItems = items.map((item) => ({
      element: item,
      collapsed: false,
      collapsible: false
    }));
    const editing = this._viewModel.editing;
    this._withPersistedAutoScroll(() => {
      this._tree.setChildren(null, treeItems, {
        diffIdentityProvider: {
          getId: /* @__PURE__ */ __name((element) => {
            const baseId = isRequestVM(element) || isResponseVM(element) ? element.dataId : element.id;
            const disablement = isRequestVM(element) || isResponseVM(element) ? element.shouldBeRemovedOnSend : void 0;
            const isEditTarget = isRequestVM(element) && editing?.id === element.id;
            const isBlocked = isRequestVM(element) || isResponseVM(element) ? element.shouldBeBlocked.get() : false;
            return baseId + // If a response is in the process of progressive rendering, we need to ensure that it will
            // be re-rendered so progressive rendering is restarted, even if the model wasn't updated.
            `${isResponseVM(element) && element.renderData ? `_${this._visibleChangeCount}` : ""}` + // Re-render once content references are loaded
            (isResponseVM(element) ? `_${element.contentReferences.length}` : "") + // Re-render if element becomes hidden due to undo/redo
            `_${disablement ? `${disablement.afterUndoStop || "1"}` : "0"}_${isEditTarget ? "edit" : ""}_${isBlocked ? "blocked" : ""}` + // Re-render requests when editing starts/stops (for hover button visibility, click handlers)
            (isRequestVM(element) ? `_${editing ? "1" : "0"}` : "") + // Re-render all if invoked by setting change
            `_setting${this._settingChangeCounter}` + // Rerender request if we got new content references in the response
            // since this may change how we render the corresponding attachments in the request
            (isRequestVM(element) && element.contentReferences ? `_${element.contentReferences?.length}` : "");
          }, "getId")
        }
      });
    });
  }
  /**
   * Set scroll lock state.
   */
  setScrollLock(value) {
    this._scrollLock = value;
    this.updateScrollDownButtonVisibility();
  }
  /**
   * Get scroll lock state.
   */
  get scrollLock() {
    return this._scrollLock;
  }
  /**
   * Set the visible change count (for diff identity).
   */
  setVisibleChangeCount(value) {
    this._visibleChangeCount = value;
  }
  /**
   * Scroll to reveal an element if editing.
   */
  scrollToCurrentItem(currentElement) {
    if (!this._viewModel?.editing || !currentElement) {
      return;
    }
    if (!this._tree.hasElement(currentElement)) {
      return;
    }
    const relativeTop = this._tree.getRelativeTop(currentElement);
    if (relativeTop === null || relativeTop < 0 || relativeTop > 1) {
      this._tree.reveal(currentElement, 0);
    }
  }
  //#endregion
  //#region Tree methods
  /**
   * Rerender the tree.
   */
  rerender() {
    this._tree.rerender();
  }
  getItems() {
    const items = [];
    const root = this._tree.getNode(null);
    for (const child of root.children) {
      if (child.element) {
        items.push(child.element);
      }
    }
    return items;
  }
  /**
   * Delegate scroll events from a mouse wheel event to the tree.
   */
  delegateScrollFromMouseWheelEvent(event) {
    this._tree.delegateScrollFromMouseWheelEvent(event);
  }
  /**
   * Whether the tree has a specific element.
   */
  hasElement(element) {
    return this._tree.hasElement(element);
  }
  /**
   * Update the height of an element.
   */
  _updateElementHeight(element, height) {
    if (this._tree.hasElement(element) && this._visible) {
      this._withPersistedAutoScroll(() => {
        this._tree.updateElementHeight(element, height);
      });
    }
  }
  /**
   * Scroll to reveal an element.
   */
  reveal(element, relativeTop) {
    this._tree.reveal(element, relativeTop);
  }
  /**
   * Get the focused elements.
   */
  getFocus() {
    return this._tree.getFocus().filter((e) => e !== null);
  }
  /**
   * Set the focused elements.
   */
  setFocus(elements) {
    this._tree.setFocus(elements);
  }
  focusItem(item) {
    if (!this.hasElement(item)) {
      return;
    }
    this._tree.setFocus([item]);
    this._tree.domFocus();
  }
  /**
   * Focus the last item in the list. Returns the index of the focused item.
   * @param useMostRecentlyFocusedIndex If true, use the mostRecentlyFocusedIndex if valid
   */
  focusLastItem(useMostRecentlyFocusedIndex) {
    const items = this.getItems();
    if (items.length === 0) {
      return -1;
    }
    let focusIndex;
    if (useMostRecentlyFocusedIndex && this._mostRecentlyFocusedItemIndex >= 0 && this._mostRecentlyFocusedItemIndex < items.length) {
      focusIndex = this._mostRecentlyFocusedItemIndex;
    } else {
      focusIndex = items.length - 1;
    }
    this._tree.setFocus([items[focusIndex]]);
    this._tree.domFocus();
    return focusIndex;
  }
  /**
   * Scroll the list to reveal the last item.
   */
  scrollToEnd() {
    if (this._lastItem) {
      const offset = Math.max(this._lastItem.currentRenderedHeight ?? 0, 1e6);
      if (this._tree.hasElement(this._lastItem)) {
        this._tree.reveal(this._lastItem, offset);
      }
    }
  }
  /**
   * Suppress auto-scroll behavior temporarily. While suppressed,
   * _withPersistedAutoScroll will not scroll to bottom after operations.
   */
  set suppressAutoScroll(value) {
    this._suppressAutoScroll = value;
  }
  _withPersistedAutoScroll(fn) {
    if (this._suppressAutoScroll) {
      fn();
      return;
    }
    const wasScrolledToBottom = this.isScrolledToBottom;
    fn();
    if (wasScrolledToBottom) {
      this.scrollToEnd();
    }
  }
  /**
   * Focus the list.
   */
  focus() {
    this._tree.domFocus();
  }
  /**
   * Get the DOM focus state.
   */
  isDOMFocused() {
    return this._tree.isDOMFocused();
  }
  //#endregion
  //#region Renderer methods
  /**
   * Get code block info for a response.
   */
  getCodeBlockInfosForResponse(response) {
    return this._renderer.getCodeBlockInfosForResponse(response);
  }
  /**
   * Get code block info by URI.
   */
  getCodeBlockInfoForEditor(uri) {
    return this._renderer.getCodeBlockInfoForEditor(uri);
  }
  /**
   * Get file tree info for a response.
   */
  getFileTreeInfosForResponse(response) {
    return this._renderer.getFileTreeInfosForResponse(response);
  }
  /**
   * Get the last focused file tree for a response.
   */
  getLastFocusedFileTreeForResponse(response) {
    return this._renderer.getLastFocusedFileTreeForResponse(response);
  }
  /**
   * Get editors currently in use.
   */
  editorsInUse() {
    return this._renderer.editorsInUse();
  }
  /**
   * Get template data for a request ID.
   */
  getTemplateDataForRequestId(requestId) {
    if (!requestId) {
      return void 0;
    }
    return this._renderer.getTemplateDataForRequestId(requestId);
  }
  /**
   * Update renderer options.
   */
  updateRendererOptions(options) {
    this._renderer.updateOptions(options);
  }
  /**
   * Set the visibility of the list.
   */
  setVisible(visible) {
    this._visible = visible;
    this._renderer.setVisible(visible);
  }
  /**
   * Layout the list.
   */
  layout(height, width) {
    this._bodyDimension = new dom.Dimension(width ?? this._container.clientWidth, height);
    this.updateLastItemMinHeight();
    this._tree.layout(height, width);
    this._renderer.layout(width ?? this._container.clientWidth);
  }
  updateLastItemMinHeight() {
    if (!this._bodyDimension) {
      return;
    }
    const contentHeight = this._bodyDimension.height;
    if (this._renderStyle === "compact" || this._renderStyle === "minimal") {
      this._container.style.removeProperty("--chat-current-response-min-height");
    } else {
      const secondToLastItem = this._viewModel?.getItems().at(-2);
      const maxRequestShownHeight = 200;
      const secondToLastItemHeight = Math.min(isRequestVM(secondToLastItem) || isResponseVM(secondToLastItem) ? secondToLastItem.currentRenderedHeight ?? 150 : 150, maxRequestShownHeight);
      const lastItemMinHeight = Math.max(contentHeight - (secondToLastItemHeight + 10), 0);
      this._container.style.setProperty("--chat-current-response-min-height", lastItemMinHeight + "px");
      if (lastItemMinHeight !== this._previousLastItemMinHeight) {
        this._previousLastItemMinHeight = lastItemMinHeight;
        const lastItem = this._viewModel?.getItems().at(-1);
        if (lastItem && this._visible && this._tree.hasElement(lastItem)) {
          this._updateElementHeight(lastItem, void 0);
        }
      }
    }
  }
};
ChatListWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IContextKeyService),
  __param(4, IChatService),
  __param(5, IContextMenuService),
  __param(6, ILogService),
  __param(7, IConfigurationService),
  __param(8, IChatAccessibilityService)
], ChatListWidget);
export {
  ChatListWidget
};
//# sourceMappingURL=chatListWidget.js.map
