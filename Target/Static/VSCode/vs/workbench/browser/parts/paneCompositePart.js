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
import "./media/paneCompositePart.css";
import { Event } from "../../../base/common/event.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IProgressIndicator } from "../../../platform/progress/common/progress.js";
import { Extensions, PaneComposite, PaneCompositeDescriptor, PaneCompositeRegistry } from "../panecomposite.js";
import { IPaneComposite } from "../../common/panecomposite.js";
import { IViewDescriptorService, ViewContainerLocation } from "../../common/views.js";
import { DisposableStore, MutableDisposable } from "../../../base/common/lifecycle.js";
import { IView } from "../../../base/browser/ui/grid/grid.js";
import { IWorkbenchLayoutService, Parts } from "../../services/layout/browser/layoutService.js";
import { CompositePart, ICompositeTitleLabel } from "./compositePart.js";
import { IPaneCompositeBarOptions, PaneCompositeBar } from "./paneCompositeBar.js";
import { Dimension, EventHelper, trackFocus, $, addDisposableListener, EventType, prepend, getWindow } from "../../../base/browser/dom.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { IContextKey, IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { IComposite } from "../../common/composite.js";
import { localize } from "../../../nls.js";
import { CompositeDragAndDropObserver, toggleDropEffect } from "../dnd.js";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "../../common/theme.js";
import { IPartOptions } from "../part.js";
import { CompositeMenuActions } from "../actions.js";
import { IMenuService, MenuId } from "../../../platform/actions/common/actions.js";
import { ActionsOrientation, prepareActions } from "../../../base/browser/ui/actionbar/actionbar.js";
import { Gesture, EventType as GestureEventType } from "../../../base/browser/touch.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { IAction, SubmenuAction } from "../../../base/common/actions.js";
import { Composite } from "../composite.js";
import { ViewsSubMenu } from "./views/viewPaneContainer.js";
import { getActionBarActions } from "../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import { HiddenItemStrategy, WorkbenchToolBar } from "../../../platform/actions/browser/toolbar.js";
import { DeferredPromise } from "../../../base/common/async.js";
var CompositeBarPosition = /* @__PURE__ */ ((CompositeBarPosition2) => {
  CompositeBarPosition2[CompositeBarPosition2["TOP"] = 0] = "TOP";
  CompositeBarPosition2[CompositeBarPosition2["TITLE"] = 1] = "TITLE";
  CompositeBarPosition2[CompositeBarPosition2["BOTTOM"] = 2] = "BOTTOM";
  return CompositeBarPosition2;
})(CompositeBarPosition || {});
let AbstractPaneCompositePart = class extends CompositePart {
  constructor(partId, partOptions, activePaneCompositeSettingsKey, activePaneContextKey, paneFocusContextKey, nameForTelemetry, compositeCSSClass, titleForegroundColor, titleBorderColor, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService) {
    let location = ViewContainerLocation.Sidebar;
    let registryId = Extensions.Viewlets;
    let globalActionsMenuId = MenuId.SidebarTitle;
    if (partId === Parts.PANEL_PART) {
      location = ViewContainerLocation.Panel;
      registryId = Extensions.Panels;
      globalActionsMenuId = MenuId.PanelTitle;
    } else if (partId === Parts.AUXILIARYBAR_PART) {
      location = ViewContainerLocation.AuxiliaryBar;
      registryId = Extensions.Auxiliary;
      globalActionsMenuId = MenuId.AuxiliaryBarTitle;
    }
    super(
      notificationService,
      storageService,
      contextMenuService,
      layoutService,
      keybindingService,
      hoverService,
      instantiationService,
      themeService,
      Registry.as(registryId),
      activePaneCompositeSettingsKey,
      viewDescriptorService.getDefaultViewContainer(location)?.id || "",
      nameForTelemetry,
      compositeCSSClass,
      titleForegroundColor,
      titleBorderColor,
      partId,
      partOptions
    );
    this.partId = partId;
    this.activePaneContextKey = activePaneContextKey;
    this.paneFocusContextKey = paneFocusContextKey;
    this.viewDescriptorService = viewDescriptorService;
    this.contextKeyService = contextKeyService;
    this.extensionService = extensionService;
    this.menuService = menuService;
    this.location = location;
    this.globalActions = this._register(this.instantiationService.createInstance(CompositeMenuActions, globalActionsMenuId, void 0, void 0));
    this.registerListeners();
  }
  static {
    __name(this, "AbstractPaneCompositePart");
  }
  static MIN_COMPOSITE_BAR_WIDTH = 50;
  get snap() {
    return this.layoutService.isVisible(this.partId) || !!this.paneCompositeBar.value?.getVisiblePaneCompositeIds().length;
  }
  get onDidPaneCompositeOpen() {
    return Event.map(this.onDidCompositeOpen.event, (compositeEvent) => compositeEvent.composite);
  }
  onDidPaneCompositeClose = this.onDidCompositeClose.event;
  location;
  titleContainer;
  headerFooterCompositeBarContainer;
  headerFooterCompositeBarDispoables = this._register(new DisposableStore());
  paneCompositeBarContainer;
  paneCompositeBar = this._register(new MutableDisposable());
  compositeBarPosition = void 0;
  emptyPaneMessageElement;
  globalToolBar;
  globalActions;
  blockOpening = void 0;
  contentDimension;
  registerListeners() {
    this._register(this.onDidPaneCompositeOpen((composite) => this.onDidOpen(composite)));
    this._register(this.onDidPaneCompositeClose(this.onDidClose, this));
    this._register(this.globalActions.onDidChange(() => this.updateGlobalToolbarActions()));
    this._register(this.registry.onDidDeregister((viewletDescriptor) => {
      const activeContainers = this.viewDescriptorService.getViewContainersByLocation(this.location).filter((container) => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
      if (activeContainers.length) {
        if (this.getActiveComposite()?.getId() === viewletDescriptor.id) {
          const defaultViewletId = this.viewDescriptorService.getDefaultViewContainer(this.location)?.id;
          const containerToOpen = activeContainers.filter((c) => c.id === defaultViewletId)[0] || activeContainers[0];
          this.doOpenPaneComposite(containerToOpen.id);
        }
      } else {
        this.layoutService.setPartHidden(true, this.partId);
      }
      this.removeComposite(viewletDescriptor.id);
    }));
    this._register(this.extensionService.onDidRegisterExtensions(() => {
      this.layoutCompositeBar();
    }));
  }
  onDidOpen(composite) {
    this.activePaneContextKey.set(composite.getId());
  }
  onDidClose(composite) {
    const id = composite.getId();
    if (this.activePaneContextKey.get() === id) {
      this.activePaneContextKey.reset();
    }
  }
  showComposite(composite) {
    super.showComposite(composite);
    this.layoutCompositeBar();
    this.layoutEmptyMessage();
  }
  hideActiveComposite() {
    const composite = super.hideActiveComposite();
    this.layoutCompositeBar();
    this.layoutEmptyMessage();
    return composite;
  }
  create(parent) {
    this.element = parent;
    this.element.classList.add("pane-composite-part");
    super.create(parent);
    const contentArea = this.getContentArea();
    if (contentArea) {
      this.createEmptyPaneMessage(contentArea);
    }
    this.updateCompositeBar();
    const focusTracker = this._register(trackFocus(parent));
    this._register(focusTracker.onDidFocus(() => this.paneFocusContextKey.set(true)));
    this._register(focusTracker.onDidBlur(() => this.paneFocusContextKey.set(false)));
  }
  createEmptyPaneMessage(parent) {
    this.emptyPaneMessageElement = $(".empty-pane-message-area");
    const messageElement = $(".empty-pane-message");
    messageElement.innerText = localize("pane.emptyMessage", "Drag a view here to display.");
    this.emptyPaneMessageElement.appendChild(messageElement);
    parent.appendChild(this.emptyPaneMessageElement);
    const setDropBackgroundFeedback = /* @__PURE__ */ __name((visible) => {
      const updateActivityBarBackground = !this.getActiveComposite() || !visible;
      const backgroundColor = visible ? this.theme.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND)?.toString() || "" : "";
      if (this.titleContainer && updateActivityBarBackground) {
        this.titleContainer.style.backgroundColor = backgroundColor;
      }
      if (this.headerFooterCompositeBarContainer && updateActivityBarBackground) {
        this.headerFooterCompositeBarContainer.style.backgroundColor = backgroundColor;
      }
      this.emptyPaneMessageElement.style.backgroundColor = backgroundColor;
    }, "setDropBackgroundFeedback");
    this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(this.element, {
      onDragOver: /* @__PURE__ */ __name((e) => {
        EventHelper.stop(e.eventData, true);
        if (this.paneCompositeBar.value) {
          const validDropTarget = this.paneCompositeBar.value.dndHandler.onDragEnter(e.dragAndDropData, void 0, e.eventData);
          toggleDropEffect(e.eventData.dataTransfer, "move", validDropTarget);
        }
      }, "onDragOver"),
      onDragEnter: /* @__PURE__ */ __name((e) => {
        EventHelper.stop(e.eventData, true);
        if (this.paneCompositeBar.value) {
          const validDropTarget = this.paneCompositeBar.value.dndHandler.onDragEnter(e.dragAndDropData, void 0, e.eventData);
          setDropBackgroundFeedback(validDropTarget);
        }
      }, "onDragEnter"),
      onDragLeave: /* @__PURE__ */ __name((e) => {
        EventHelper.stop(e.eventData, true);
        setDropBackgroundFeedback(false);
      }, "onDragLeave"),
      onDragEnd: /* @__PURE__ */ __name((e) => {
        EventHelper.stop(e.eventData, true);
        setDropBackgroundFeedback(false);
      }, "onDragEnd"),
      onDrop: /* @__PURE__ */ __name((e) => {
        EventHelper.stop(e.eventData, true);
        setDropBackgroundFeedback(false);
        if (this.paneCompositeBar.value) {
          this.paneCompositeBar.value.dndHandler.drop(e.dragAndDropData, void 0, e.eventData);
        } else {
          const dragData = e.dragAndDropData.getData();
          if (dragData.type === "composite") {
            const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
            this.viewDescriptorService.moveViewContainerToLocation(currentContainer, this.location, void 0, "dnd");
            this.openPaneComposite(currentContainer.id, true);
          } else if (dragData.type === "view") {
            const viewToMove = this.viewDescriptorService.getViewDescriptorById(dragData.id);
            if (viewToMove && viewToMove.canMoveView) {
              this.viewDescriptorService.moveViewToLocation(viewToMove, this.location, "dnd");
              const newContainer = this.viewDescriptorService.getViewContainerByViewId(viewToMove.id);
              this.openPaneComposite(newContainer.id, true).then((composite) => {
                composite?.openView(viewToMove.id, true);
              });
            }
          }
        }
      }, "onDrop")
    }));
  }
  createTitleArea(parent) {
    const titleArea = super.createTitleArea(parent);
    this._register(addDisposableListener(titleArea, EventType.CONTEXT_MENU, (e) => {
      this.onTitleAreaContextMenu(new StandardMouseEvent(getWindow(titleArea), e));
    }));
    this._register(Gesture.addTarget(titleArea));
    this._register(addDisposableListener(titleArea, GestureEventType.Contextmenu, (e) => {
      this.onTitleAreaContextMenu(new StandardMouseEvent(getWindow(titleArea), e));
    }));
    const globalTitleActionsContainer = titleArea.appendChild($(".global-actions"));
    this.globalToolBar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, globalTitleActionsContainer, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => this.actionViewItemProvider(action, options), "actionViewItemProvider"),
      orientation: ActionsOrientation.HORIZONTAL,
      getKeyBinding: /* @__PURE__ */ __name((action) => this.keybindingService.lookupKeybinding(action.id), "getKeyBinding"),
      anchorAlignmentProvider: /* @__PURE__ */ __name(() => this.getTitleAreaDropDownAnchorAlignment(), "anchorAlignmentProvider"),
      toggleMenuTitle: localize("moreActions", "More Actions..."),
      hoverDelegate: this.toolbarHoverDelegate,
      hiddenItemStrategy: HiddenItemStrategy.NoHide
    }));
    this.updateGlobalToolbarActions();
    return titleArea;
  }
  createTitleLabel(parent) {
    this.titleContainer = parent;
    const titleLabel = super.createTitleLabel(parent);
    this.titleLabelElement.draggable = true;
    const draggedItemProvider = /* @__PURE__ */ __name(() => {
      const activeViewlet = this.getActivePaneComposite();
      return { type: "composite", id: activeViewlet.getId() };
    }, "draggedItemProvider");
    this._register(CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.titleLabelElement, draggedItemProvider, {}));
    return titleLabel;
  }
  updateCompositeBar(updateCompositeBarOption = false) {
    const wasCompositeBarVisible = this.compositeBarPosition !== void 0;
    const isCompositeBarVisible = this.shouldShowCompositeBar();
    const previousPosition = this.compositeBarPosition;
    const newPosition = isCompositeBarVisible ? this.getCompositeBarPosition() : void 0;
    if (!updateCompositeBarOption && previousPosition === newPosition) {
      return;
    }
    if (wasCompositeBarVisible) {
      const previousCompositeBarContainer = previousPosition === 1 /* TITLE */ ? this.titleContainer : this.headerFooterCompositeBarContainer;
      if (!this.paneCompositeBarContainer || !this.paneCompositeBar.value || !previousCompositeBarContainer) {
        throw new Error("Composite bar containers should exist when removing the previous composite bar");
      }
      this.paneCompositeBarContainer.remove();
      this.paneCompositeBarContainer = void 0;
      this.paneCompositeBar.value = void 0;
      previousCompositeBarContainer.classList.remove("has-composite-bar");
      if (previousPosition === 0 /* TOP */) {
        this.removeFooterHeaderArea(true);
      } else if (previousPosition === 2 /* BOTTOM */) {
        this.removeFooterHeaderArea(false);
      }
    }
    let newCompositeBarContainer;
    switch (newPosition) {
      case 0 /* TOP */:
        newCompositeBarContainer = this.createHeaderArea();
        break;
      case 1 /* TITLE */:
        newCompositeBarContainer = this.titleContainer;
        break;
      case 2 /* BOTTOM */:
        newCompositeBarContainer = this.createFooterArea();
        break;
    }
    if (isCompositeBarVisible) {
      if (this.paneCompositeBarContainer || this.paneCompositeBar.value || !newCompositeBarContainer) {
        throw new Error("Invalid composite bar state when creating the new composite bar");
      }
      newCompositeBarContainer.classList.add("has-composite-bar");
      this.paneCompositeBarContainer = prepend(newCompositeBarContainer, $(".composite-bar-container"));
      this.paneCompositeBar.value = this.createCompositeBar();
      this.paneCompositeBar.value.create(this.paneCompositeBarContainer);
      if (newPosition === 0 /* TOP */) {
        this.setHeaderArea(newCompositeBarContainer);
      } else if (newPosition === 2 /* BOTTOM */) {
        this.setFooterArea(newCompositeBarContainer);
      }
    }
    this.compositeBarPosition = newPosition;
    if (updateCompositeBarOption) {
      this.layoutCompositeBar();
    }
  }
  createHeaderArea() {
    const headerArea = super.createHeaderArea();
    return this.createHeaderFooterCompositeBarArea(headerArea);
  }
  createFooterArea() {
    const footerArea = super.createFooterArea();
    return this.createHeaderFooterCompositeBarArea(footerArea);
  }
  createHeaderFooterCompositeBarArea(area) {
    if (this.headerFooterCompositeBarContainer) {
      throw new Error("Header or Footer composite bar already exists");
    }
    this.headerFooterCompositeBarContainer = area;
    this.headerFooterCompositeBarDispoables.add(addDisposableListener(area, EventType.CONTEXT_MENU, (e) => {
      this.onCompositeBarAreaContextMenu(new StandardMouseEvent(getWindow(area), e));
    }));
    this.headerFooterCompositeBarDispoables.add(Gesture.addTarget(area));
    this.headerFooterCompositeBarDispoables.add(addDisposableListener(area, GestureEventType.Contextmenu, (e) => {
      this.onCompositeBarAreaContextMenu(new StandardMouseEvent(getWindow(area), e));
    }));
    return area;
  }
  removeFooterHeaderArea(header) {
    this.headerFooterCompositeBarContainer = void 0;
    this.headerFooterCompositeBarDispoables.clear();
    if (header) {
      this.removeHeaderArea();
    } else {
      this.removeFooterArea();
    }
  }
  createCompositeBar() {
    return this.instantiationService.createInstance(PaneCompositeBar, this.getCompositeBarOptions(), this.partId, this);
  }
  onTitleAreaUpdate(compositeId) {
    super.onTitleAreaUpdate(compositeId);
    this.layoutCompositeBar();
  }
  async openPaneComposite(id, focus) {
    if (typeof id === "string" && this.getPaneComposite(id)) {
      return this.doOpenPaneComposite(id, focus);
    }
    await this.extensionService.whenInstalledExtensionsRegistered();
    if (typeof id === "string" && this.getPaneComposite(id)) {
      return this.doOpenPaneComposite(id, focus);
    }
    return void 0;
  }
  async doOpenPaneComposite(id, focus) {
    if (this.blockOpening) {
      return this.blockOpening.p;
    }
    let blockOpening;
    if (!this.layoutService.isVisible(this.partId)) {
      try {
        blockOpening = this.blockOpening = new DeferredPromise();
        this.layoutService.setPartHidden(false, this.partId);
      } finally {
        this.blockOpening = void 0;
      }
    }
    try {
      const result = this.openComposite(id, focus);
      blockOpening?.complete(result);
      return result;
    } catch (error) {
      blockOpening?.error(error);
      throw error;
    }
  }
  getPaneComposite(id) {
    return this.registry.getPaneComposite(id);
  }
  getPaneComposites() {
    return this.registry.getPaneComposites().sort((v1, v2) => {
      if (typeof v1.order !== "number") {
        return 1;
      }
      if (typeof v2.order !== "number") {
        return -1;
      }
      return v1.order - v2.order;
    });
  }
  getPinnedPaneCompositeIds() {
    return this.paneCompositeBar.value?.getPinnedPaneCompositeIds() ?? [];
  }
  getVisiblePaneCompositeIds() {
    return this.paneCompositeBar.value?.getVisiblePaneCompositeIds() ?? [];
  }
  getPaneCompositeIds() {
    return this.paneCompositeBar.value?.getPaneCompositeIds() ?? [];
  }
  getActivePaneComposite() {
    return this.getActiveComposite();
  }
  getLastActivePaneCompositeId() {
    return this.getLastActiveCompositeId();
  }
  hideActivePaneComposite() {
    if (this.layoutService.isVisible(this.partId)) {
      this.layoutService.setPartHidden(true, this.partId);
    }
    this.hideActiveComposite();
  }
  focusCompositeBar() {
    this.paneCompositeBar.value?.focus();
  }
  layout(width, height, top, left) {
    if (!this.layoutService.isVisible(this.partId)) {
      return;
    }
    this.contentDimension = new Dimension(width, height);
    super.layout(this.contentDimension.width, this.contentDimension.height, top, left);
    this.layoutCompositeBar();
    this.layoutEmptyMessage();
  }
  layoutCompositeBar() {
    if (this.contentDimension && this.dimension && this.paneCompositeBar.value) {
      const padding = this.compositeBarPosition === 1 /* TITLE */ ? 16 : 8;
      const borderWidth = this.partId === Parts.PANEL_PART ? 0 : 1;
      let availableWidth = this.contentDimension.width - padding - borderWidth;
      availableWidth = Math.max(AbstractPaneCompositePart.MIN_COMPOSITE_BAR_WIDTH, availableWidth - this.getToolbarWidth());
      this.paneCompositeBar.value.layout(availableWidth, this.dimension.height);
    }
  }
  layoutEmptyMessage() {
    const visible = !this.getActiveComposite();
    this.element.classList.toggle("empty", visible);
    if (visible) {
      this.titleLabel?.updateTitle("", "");
    }
  }
  updateGlobalToolbarActions() {
    const primaryActions = this.globalActions.getPrimaryActions();
    const secondaryActions = this.globalActions.getSecondaryActions();
    this.globalToolBar?.setActions(prepareActions(primaryActions), prepareActions(secondaryActions));
  }
  getToolbarWidth() {
    if (!this.toolBar || this.compositeBarPosition !== 1 /* TITLE */) {
      return 0;
    }
    const activePane = this.getActivePaneComposite();
    if (!activePane) {
      return 0;
    }
    const toolBarWidth = this.toolBar.getItemsWidth() + this.toolBar.getItemsLength() * 4;
    const globalToolBarWidth = this.globalToolBar ? this.globalToolBar.getItemsWidth() + this.globalToolBar.getItemsLength() * 4 : 0;
    return toolBarWidth + globalToolBarWidth + 5;
  }
  onTitleAreaContextMenu(event) {
    if (this.shouldShowCompositeBar() && this.getCompositeBarPosition() === 1 /* TITLE */) {
      return this.onCompositeBarContextMenu(event);
    } else {
      const activePaneComposite = this.getActivePaneComposite();
      const activePaneCompositeActions = activePaneComposite ? activePaneComposite.getContextMenuActions() : [];
      if (activePaneCompositeActions.length) {
        this.contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => activePaneCompositeActions, "getActions"),
          getActionViewItem: /* @__PURE__ */ __name((action, options) => this.actionViewItemProvider(action, options), "getActionViewItem"),
          actionRunner: activePaneComposite.getActionRunner(),
          skipTelemetry: true
        });
      }
    }
  }
  onCompositeBarAreaContextMenu(event) {
    return this.onCompositeBarContextMenu(event);
  }
  onCompositeBarContextMenu(event) {
    if (this.paneCompositeBar.value) {
      const actions = [...this.paneCompositeBar.value.getContextMenuActions()];
      if (actions.length) {
        this.contextMenuService.showContextMenu({
          getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
          getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
          skipTelemetry: true
        });
      }
    }
  }
  getViewsSubmenuAction() {
    const viewPaneContainer = this.getActivePaneComposite()?.getViewPaneContainer();
    if (viewPaneContainer) {
      const disposables = new DisposableStore();
      const scopedContextKeyService = disposables.add(this.contextKeyService.createScoped(this.element));
      scopedContextKeyService.createKey("viewContainer", viewPaneContainer.viewContainer.id);
      const menu = this.menuService.getMenuActions(ViewsSubMenu, scopedContextKeyService, { shouldForwardArgs: true, renderShortTitle: true });
      const viewsActions = getActionBarActions(menu, () => true).primary;
      disposables.dispose();
      return viewsActions.length > 1 && viewsActions.some((a) => a.enabled) ? new SubmenuAction("views", localize("views", "Views"), viewsActions) : void 0;
    }
    return void 0;
  }
};
AbstractPaneCompositePart = __decorateClass([
  __decorateParam(9, INotificationService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, IWorkbenchLayoutService),
  __decorateParam(13, IKeybindingService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IInstantiationService),
  __decorateParam(16, IThemeService),
  __decorateParam(17, IViewDescriptorService),
  __decorateParam(18, IContextKeyService),
  __decorateParam(19, IExtensionService),
  __decorateParam(20, IMenuService)
], AbstractPaneCompositePart);
export {
  AbstractPaneCompositePart,
  CompositeBarPosition
};
//# sourceMappingURL=paneCompositePart.js.map
