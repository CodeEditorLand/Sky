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
var StatusbarPart_1, AuxiliaryStatusbarPart_1;
import "./media/statusbarpart.css";
import { localize } from "../../../../nls.js";
import { Disposable, DisposableStore, disposeIfDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { MultiWindowParts, Part } from "../../part.js";
import { EventType as TouchEventType, Gesture } from "../../../../base/browser/touch.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStatusbarService, isStatusbarEntryLocation, isStatusbarEntryPriority } from "../../../services/statusbar/browser/statusbar.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { Separator, toAction } from "../../../../base/common/actions.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { STATUS_BAR_BACKGROUND, STATUS_BAR_FOREGROUND, STATUS_BAR_NO_FOLDER_BACKGROUND, STATUS_BAR_ITEM_HOVER_BACKGROUND, STATUS_BAR_BORDER, STATUS_BAR_NO_FOLDER_FOREGROUND, STATUS_BAR_NO_FOLDER_BORDER, STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND, STATUS_BAR_ITEM_FOCUS_BORDER, STATUS_BAR_FOCUS_BORDER } from "../../../common/theme.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { contrastBorder, activeContrastBorder } from "../../../../platform/theme/common/colorRegistry.js";
import { EventHelper, addDisposableListener, EventType, clearNode, getWindow, isHTMLElement, $ } from "../../../../base/browser/dom.js";
import { createStyleSheet } from "../../../../base/browser/domStylesheets.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { equals } from "../../../../base/common/arrays.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { ToggleStatusbarVisibilityAction } from "../../actions/layoutActions.js";
import { assertReturnsDefined } from "../../../../base/common/types.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { isHighContrast } from "../../../../platform/theme/common/theme.js";
import { hash } from "../../../../base/common/hash.js";
import { WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { HideStatusbarEntryAction, ManageExtensionAction, ToggleStatusbarEntryVisibilityAction } from "./statusbarActions.js";
import { StatusbarViewModel } from "./statusbarModel.js";
import { StatusbarEntryItem } from "./statusbarItem.js";
import { StatusBarFocused } from "../../../common/contextkeys.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { isManagedHoverTooltipHTMLElement, isManagedHoverTooltipMarkdownString } from "../../../../base/browser/ui/hover/hover.js";
let StatusbarPart = class StatusbarPart2 extends Part {
  static {
    __name(this, "StatusbarPart");
  }
  static {
    StatusbarPart_1 = this;
  }
  static {
    this.HEIGHT = 22;
  }
  constructor(id, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService) {
    super(id, { hasTitle: false }, themeService, storageService, layoutService);
    this.instantiationService = instantiationService;
    this.contextService = contextService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = StatusbarPart_1.HEIGHT;
    this.maximumHeight = StatusbarPart_1.HEIGHT;
    this.pendingEntries = [];
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.onDidOverrideEntry = this._register(new Emitter());
    this.entryOverrides = /* @__PURE__ */ new Map();
    this.compactEntriesDisposable = this._register(new MutableDisposable());
    this.styleOverrides = /* @__PURE__ */ new Set();
    this.viewModel = this._register(new StatusbarViewModel(storageService));
    this.onDidChangeEntryVisibility = this.viewModel.onDidChangeEntryVisibility;
    this.hoverDelegate = this._register(this.instantiationService.createInstance(WorkbenchHoverDelegate, "element", {
      instantHover: true,
      dynamicDelay(content) {
        if (typeof content === "function" || isHTMLElement(content) || isManagedHoverTooltipMarkdownString(content) && typeof content.markdown === "function" || isManagedHoverTooltipHTMLElement(content)) {
          return 500;
        }
        return void 0;
      }
    }, (_, focus) => ({
      persistence: {
        hideOnKeyDown: true,
        sticky: focus
      },
      appearance: {
        maxHeightRatio: 0.9
      }
    })));
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.onDidChangeEntryVisibility(() => this.updateCompactEntries()));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateStyles()));
  }
  overrideEntry(id, override) {
    this.entryOverrides.set(id, override);
    this.onDidOverrideEntry.fire(id);
    return toDisposable(() => {
      const currentOverride = this.entryOverrides.get(id);
      if (currentOverride === override) {
        this.entryOverrides.delete(id);
        this.onDidOverrideEntry.fire(id);
      }
    });
  }
  withEntryOverride(entry, id) {
    const override = this.entryOverrides.get(id);
    if (override) {
      entry = { ...entry, ...override };
    }
    return entry;
  }
  addEntry(entry, id, alignment, priorityOrLocation = 0) {
    let priority;
    if (isStatusbarEntryPriority(priorityOrLocation)) {
      priority = priorityOrLocation;
    } else {
      priority = {
        primary: priorityOrLocation,
        secondary: hash(id)
        // derive from identifier to accomplish uniqueness
      };
    }
    if (!this.element) {
      return this.doAddPendingEntry(entry, id, alignment, priority);
    }
    return this.doAddEntry(entry, id, alignment, priority);
  }
  doAddPendingEntry(entry, id, alignment, priority) {
    const pendingEntry = { entry, id, alignment, priority };
    this.pendingEntries.push(pendingEntry);
    const accessor = {
      update: /* @__PURE__ */ __name((entry2) => {
        if (pendingEntry.accessor) {
          pendingEntry.accessor.update(entry2);
        } else {
          pendingEntry.entry = entry2;
        }
      }, "update"),
      dispose: /* @__PURE__ */ __name(() => {
        if (pendingEntry.accessor) {
          pendingEntry.accessor.dispose();
        } else {
          this.pendingEntries = this.pendingEntries.filter((entry2) => entry2 !== pendingEntry);
        }
      }, "dispose")
    };
    return accessor;
  }
  doAddEntry(entry, id, alignment, priority) {
    const disposables = new DisposableStore();
    const itemContainer = this.doCreateStatusItem(id, alignment);
    const item = disposables.add(this.instantiationService.createInstance(StatusbarEntryItem, itemContainer, this.withEntryOverride(entry, id), this.hoverDelegate));
    const viewModelEntry = new class {
      constructor() {
        this.id = id;
        this.extensionId = entry.extensionId;
        this.alignment = alignment;
        this.priority = priority;
        this.container = itemContainer;
        this.labelContainer = item.labelContainer;
      }
      get name() {
        return item.name;
      }
      get hasCommand() {
        return item.hasCommand;
      }
    }();
    const { needsFullRefresh } = this.doAddOrRemoveModelEntry(viewModelEntry, true);
    if (needsFullRefresh) {
      this.appendStatusbarEntries();
    } else {
      this.appendStatusbarEntry(viewModelEntry);
    }
    let lastEntry = entry;
    const accessor = {
      update: /* @__PURE__ */ __name((entry2) => {
        lastEntry = entry2;
        item.update(this.withEntryOverride(entry2, id));
      }, "update"),
      dispose: /* @__PURE__ */ __name(() => {
        const { needsFullRefresh: needsFullRefresh2 } = this.doAddOrRemoveModelEntry(viewModelEntry, false);
        if (needsFullRefresh2) {
          this.appendStatusbarEntries();
        } else {
          itemContainer.remove();
          this.updateCompactEntries();
        }
        disposables.dispose();
      }, "dispose")
    };
    disposables.add(this.onDidOverrideEntry.event((overrideEntryId) => {
      if (overrideEntryId === id) {
        accessor.update(lastEntry);
      }
    }));
    return accessor;
  }
  doCreateStatusItem(id, alignment, ...extraClasses) {
    const itemContainer = $(".statusbar-item", { id });
    if (extraClasses) {
      itemContainer.classList.add(...extraClasses);
    }
    if (alignment === 1) {
      itemContainer.classList.add("right");
    } else {
      itemContainer.classList.add("left");
    }
    return itemContainer;
  }
  doAddOrRemoveModelEntry(entry, add) {
    const entriesBefore = this.viewModel.entries;
    if (add) {
      this.viewModel.add(entry);
    } else {
      this.viewModel.remove(entry);
    }
    const entriesAfter = this.viewModel.entries;
    if (add) {
      entriesBefore.splice(entriesAfter.indexOf(entry), 0, entry);
    } else {
      entriesBefore.splice(entriesBefore.indexOf(entry), 1);
    }
    const needsFullRefresh = !equals(entriesBefore, entriesAfter);
    return { needsFullRefresh };
  }
  isEntryVisible(id) {
    return !this.viewModel.isHidden(id);
  }
  updateEntryVisibility(id, visible) {
    if (visible) {
      this.viewModel.show(id);
    } else {
      this.viewModel.hide(id);
    }
  }
  focusNextEntry() {
    this.viewModel.focusNextEntry();
  }
  focusPreviousEntry() {
    this.viewModel.focusPreviousEntry();
  }
  isEntryFocused() {
    return this.viewModel.isEntryFocused();
  }
  focus(preserveEntryFocus = true) {
    this.getContainer()?.focus();
    const lastFocusedEntry = this.viewModel.lastFocusedEntry;
    if (preserveEntryFocus && lastFocusedEntry) {
      setTimeout(() => lastFocusedEntry.labelContainer.focus(), 0);
    }
  }
  createContentArea(parent) {
    this.element = parent;
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
    StatusBarFocused.bindTo(scopedContextKeyService).set(true);
    this.leftItemsContainer = $(".left-items.items-container");
    this.element.appendChild(this.leftItemsContainer);
    this.element.tabIndex = 0;
    this.rightItemsContainer = $(".right-items.items-container");
    this.element.appendChild(this.rightItemsContainer);
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e) => this.showContextMenu(e)));
    this._register(Gesture.addTarget(parent));
    this._register(addDisposableListener(parent, TouchEventType.Contextmenu, (e) => this.showContextMenu(e)));
    this.createInitialStatusbarEntries();
    return this.element;
  }
  createInitialStatusbarEntries() {
    this.appendStatusbarEntries();
    while (this.pendingEntries.length) {
      const pending = this.pendingEntries.shift();
      if (pending) {
        pending.accessor = this.addEntry(pending.entry, pending.id, pending.alignment, pending.priority.primary);
      }
    }
  }
  appendStatusbarEntries() {
    const leftItemsContainer = assertReturnsDefined(this.leftItemsContainer);
    const rightItemsContainer = assertReturnsDefined(this.rightItemsContainer);
    clearNode(leftItemsContainer);
    clearNode(rightItemsContainer);
    for (const entry of [
      ...this.viewModel.getEntries(
        0
        /* StatusbarAlignment.LEFT */
      ),
      ...this.viewModel.getEntries(
        1
        /* StatusbarAlignment.RIGHT */
      ).reverse()
      // reversing due to flex: row-reverse
    ]) {
      const target = entry.alignment === 0 ? leftItemsContainer : rightItemsContainer;
      target.appendChild(entry.container);
    }
    this.updateCompactEntries();
  }
  appendStatusbarEntry(entry) {
    const entries = this.viewModel.getEntries(entry.alignment);
    if (entry.alignment === 1) {
      entries.reverse();
    }
    const target = assertReturnsDefined(entry.alignment === 0 ? this.leftItemsContainer : this.rightItemsContainer);
    const index = entries.indexOf(entry);
    if (index + 1 === entries.length) {
      target.appendChild(entry.container);
    } else {
      target.insertBefore(entry.container, entries[index + 1].container);
    }
    this.updateCompactEntries();
  }
  updateCompactEntries() {
    const entries = this.viewModel.entries;
    const mapIdToVisibleEntry = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      if (!this.viewModel.isHidden(entry.id)) {
        mapIdToVisibleEntry.set(entry.id, entry);
      }
      entry.container.classList.remove("compact-left", "compact-right");
    }
    const compactEntryGroups = /* @__PURE__ */ new Map();
    for (const entry of mapIdToVisibleEntry.values()) {
      if (isStatusbarEntryLocation(entry.priority.primary) && // entry references another entry as location
      entry.priority.primary.compact) {
        const locationId = entry.priority.primary.location.id;
        const location = mapIdToVisibleEntry.get(locationId);
        if (!location) {
          continue;
        }
        let compactEntryGroup = compactEntryGroups.get(locationId);
        if (!compactEntryGroup) {
          for (const group of compactEntryGroups.values()) {
            if (group.has(locationId)) {
              compactEntryGroup = group;
              break;
            }
          }
          if (!compactEntryGroup) {
            compactEntryGroup = /* @__PURE__ */ new Map();
            compactEntryGroups.set(locationId, compactEntryGroup);
          }
        }
        compactEntryGroup.set(entry.id, entry);
        compactEntryGroup.set(location.id, location);
        if (entry.priority.primary.alignment === 0) {
          location.container.classList.add("compact-left");
          entry.container.classList.add("compact-right");
        } else {
          location.container.classList.add("compact-right");
          entry.container.classList.add("compact-left");
        }
      }
    }
    const statusBarItemHoverBackground = this.getColor(STATUS_BAR_ITEM_HOVER_BACKGROUND);
    const statusBarItemCompactHoverBackground = this.getColor(STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND);
    this.compactEntriesDisposable.value = new DisposableStore();
    if (statusBarItemHoverBackground && statusBarItemCompactHoverBackground && !isHighContrast(this.theme.type)) {
      for (const [, compactEntryGroup] of compactEntryGroups) {
        for (const compactEntry of compactEntryGroup.values()) {
          if (!compactEntry.hasCommand) {
            continue;
          }
          this.compactEntriesDisposable.value.add(addDisposableListener(compactEntry.labelContainer, EventType.MOUSE_OVER, () => {
            compactEntryGroup.forEach((compactEntry2) => compactEntry2.labelContainer.style.backgroundColor = statusBarItemHoverBackground);
            compactEntry.labelContainer.style.backgroundColor = statusBarItemCompactHoverBackground;
          }));
          this.compactEntriesDisposable.value.add(addDisposableListener(compactEntry.labelContainer, EventType.MOUSE_OUT, () => {
            compactEntryGroup.forEach((compactEntry2) => compactEntry2.labelContainer.style.backgroundColor = "");
          }));
        }
      }
    }
  }
  showContextMenu(e) {
    EventHelper.stop(e, true);
    const event = new StandardMouseEvent(getWindow(this.element), e);
    let actions = void 0;
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => {
        actions = this.getContextMenuActions(event);
        return actions;
      }, "getActions"),
      onHide: /* @__PURE__ */ __name(() => {
        if (actions) {
          disposeIfDisposable(actions);
        }
      }, "onHide")
    });
  }
  getContextMenuActions(event) {
    const actions = [];
    actions.push(toAction({ id: ToggleStatusbarVisibilityAction.ID, label: localize("hideStatusBar", "Hide Status Bar"), run: /* @__PURE__ */ __name(() => this.instantiationService.invokeFunction((accessor) => new ToggleStatusbarVisibilityAction().run(accessor)), "run") }));
    actions.push(new Separator());
    const handledEntries = /* @__PURE__ */ new Set();
    for (const entry of this.viewModel.entries) {
      if (!handledEntries.has(entry.id)) {
        actions.push(new ToggleStatusbarEntryVisibilityAction(entry.id, entry.name, this.viewModel));
        handledEntries.add(entry.id);
      }
    }
    let statusEntryUnderMouse = void 0;
    for (let element = event.target; element; element = element.parentElement) {
      const entry = this.viewModel.findEntry(element);
      if (entry) {
        statusEntryUnderMouse = entry;
        break;
      }
    }
    if (statusEntryUnderMouse) {
      actions.push(new Separator());
      if (statusEntryUnderMouse.extensionId) {
        actions.push(this.instantiationService.createInstance(ManageExtensionAction, statusEntryUnderMouse.extensionId));
      }
      actions.push(new HideStatusbarEntryAction(statusEntryUnderMouse.id, statusEntryUnderMouse.name, this.viewModel));
    }
    return actions;
  }
  updateStyles() {
    super.updateStyles();
    const container = assertReturnsDefined(this.getContainer());
    const styleOverride = [...this.styleOverrides].sort((a, b) => a.priority - b.priority)[0];
    const backgroundColor = this.getColor(styleOverride?.background ?? (this.contextService.getWorkbenchState() !== 1 ? STATUS_BAR_BACKGROUND : STATUS_BAR_NO_FOLDER_BACKGROUND)) || "";
    container.style.backgroundColor = backgroundColor;
    const foregroundColor = this.getColor(styleOverride?.foreground ?? (this.contextService.getWorkbenchState() !== 1 ? STATUS_BAR_FOREGROUND : STATUS_BAR_NO_FOLDER_FOREGROUND)) || "";
    container.style.color = foregroundColor;
    const itemBorderColor = this.getColor(STATUS_BAR_ITEM_FOCUS_BORDER);
    this.updateCompactEntries();
    const borderColor = this.getColor(styleOverride?.border ?? (this.contextService.getWorkbenchState() !== 1 ? STATUS_BAR_BORDER : STATUS_BAR_NO_FOLDER_BORDER)) || this.getColor(contrastBorder);
    if (borderColor) {
      container.classList.add("status-border-top");
      container.style.setProperty("--status-border-top-color", borderColor);
    } else {
      container.classList.remove("status-border-top");
      container.style.removeProperty("--status-border-top-color");
    }
    const statusBarFocusColor = this.getColor(STATUS_BAR_FOCUS_BORDER);
    if (!this.styleElement) {
      this.styleElement = createStyleSheet(container);
    }
    this.styleElement.textContent = `

				/* Status bar focus outline */
				.monaco-workbench .part.statusbar:focus {
					outline-color: ${statusBarFocusColor};
				}

				/* Status bar item focus outline */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item a:focus-visible {
					outline: 1px solid ${this.getColor(activeContrastBorder) ?? itemBorderColor};
					outline-offset: ${borderColor ? "-2px" : "-1px"};
				}

				/* Notification Beak */
				.monaco-workbench .part.statusbar > .items-container > .statusbar-item.has-beak > .status-bar-item-beak-container:before {
					border-bottom-color: ${borderColor ?? backgroundColor};
				}
			`;
  }
  layout(width, height, top, left) {
    super.layout(width, height, top, left);
    super.layoutContents(width, height);
  }
  overrideStyle(style) {
    this.styleOverrides.add(style);
    this.updateStyles();
    return toDisposable(() => {
      this.styleOverrides.delete(style);
      this.updateStyles();
    });
  }
  toJSON() {
    return {
      type: "workbench.parts.statusbar"
      /* Parts.STATUSBAR_PART */
    };
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};
StatusbarPart = StatusbarPart_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, IThemeService),
  __param(3, IWorkspaceContextService),
  __param(4, IStorageService),
  __param(5, IWorkbenchLayoutService),
  __param(6, IContextMenuService),
  __param(7, IContextKeyService)
], StatusbarPart);
let MainStatusbarPart = class MainStatusbarPart2 extends StatusbarPart {
  static {
    __name(this, "MainStatusbarPart");
  }
  constructor(instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService) {
    super("workbench.parts.statusbar", instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService);
  }
};
MainStatusbarPart = __decorate([
  __param(0, IInstantiationService),
  __param(1, IThemeService),
  __param(2, IWorkspaceContextService),
  __param(3, IStorageService),
  __param(4, IWorkbenchLayoutService),
  __param(5, IContextMenuService),
  __param(6, IContextKeyService)
], MainStatusbarPart);
let AuxiliaryStatusbarPart = class AuxiliaryStatusbarPart2 extends StatusbarPart {
  static {
    __name(this, "AuxiliaryStatusbarPart");
  }
  static {
    AuxiliaryStatusbarPart_1 = this;
  }
  static {
    this.COUNTER = 1;
  }
  constructor(container, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService) {
    const id = AuxiliaryStatusbarPart_1.COUNTER++;
    super(`workbench.parts.auxiliaryStatus.${id}`, instantiationService, themeService, contextService, storageService, layoutService, contextMenuService, contextKeyService);
    this.container = container;
    this.height = StatusbarPart.HEIGHT;
  }
};
AuxiliaryStatusbarPart = AuxiliaryStatusbarPart_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, IThemeService),
  __param(3, IWorkspaceContextService),
  __param(4, IStorageService),
  __param(5, IWorkbenchLayoutService),
  __param(6, IContextMenuService),
  __param(7, IContextKeyService)
], AuxiliaryStatusbarPart);
let StatusbarService = class StatusbarService2 extends MultiWindowParts {
  static {
    __name(this, "StatusbarService");
  }
  constructor(instantiationService, storageService, themeService) {
    super("workbench.statusBarService", themeService, storageService);
    this.instantiationService = instantiationService;
    this._onDidCreateAuxiliaryStatusbarPart = this._register(new Emitter());
    this.onDidCreateAuxiliaryStatusbarPart = this._onDidCreateAuxiliaryStatusbarPart.event;
    this.mainPart = this._register(this.instantiationService.createInstance(MainStatusbarPart));
    this._register(this.registerPart(this.mainPart));
    this.onDidChangeEntryVisibility = this.mainPart.onDidChangeEntryVisibility;
  }
  //#region Auxiliary Statusbar Parts
  createAuxiliaryStatusbarPart(container, instantiationService) {
    const statusbarPartContainer = $("footer.part.statusbar", {
      "role": "status",
      "aria-live": "off",
      "tabIndex": "0"
    });
    statusbarPartContainer.style.position = "relative";
    container.appendChild(statusbarPartContainer);
    const statusbarPart = instantiationService.createInstance(AuxiliaryStatusbarPart, statusbarPartContainer);
    const disposable = this.registerPart(statusbarPart);
    statusbarPart.create(statusbarPartContainer);
    Event.once(statusbarPart.onWillDispose)(() => disposable.dispose());
    this._onDidCreateAuxiliaryStatusbarPart.fire(statusbarPart);
    return statusbarPart;
  }
  createScoped(statusbarEntryContainer, disposables) {
    return disposables.add(this.instantiationService.createInstance(ScopedStatusbarService, statusbarEntryContainer));
  }
  addEntry(entry, id, alignment, priorityOrLocation = 0) {
    if (entry.showInAllWindows) {
      return this.doAddEntryToAllWindows(entry, id, alignment, priorityOrLocation);
    }
    return this.mainPart.addEntry(entry, id, alignment, priorityOrLocation);
  }
  doAddEntryToAllWindows(originalEntry, id, alignment, priorityOrLocation = 0) {
    const entryDisposables = new DisposableStore();
    const accessors = /* @__PURE__ */ new Set();
    let entry = originalEntry;
    function addEntry(part) {
      const partDisposables = new DisposableStore();
      partDisposables.add(part.onWillDispose(() => partDisposables.dispose()));
      const accessor = partDisposables.add(part.addEntry(entry, id, alignment, priorityOrLocation));
      accessors.add(accessor);
      partDisposables.add(toDisposable(() => accessors.delete(accessor)));
      entryDisposables.add(partDisposables);
      partDisposables.add(toDisposable(() => entryDisposables.delete(partDisposables)));
    }
    __name(addEntry, "addEntry");
    for (const part of this.parts) {
      addEntry(part);
    }
    entryDisposables.add(this.onDidCreateAuxiliaryStatusbarPart((part) => addEntry(part)));
    return {
      update: /* @__PURE__ */ __name((updatedEntry) => {
        entry = updatedEntry;
        for (const update of accessors) {
          update.update(updatedEntry);
        }
      }, "update"),
      dispose: /* @__PURE__ */ __name(() => entryDisposables.dispose(), "dispose")
    };
  }
  isEntryVisible(id) {
    return this.mainPart.isEntryVisible(id);
  }
  updateEntryVisibility(id, visible) {
    for (const part of this.parts) {
      part.updateEntryVisibility(id, visible);
    }
  }
  overrideEntry(id, override) {
    const disposables = new DisposableStore();
    for (const part of this.parts) {
      disposables.add(part.overrideEntry(id, override));
    }
    return disposables;
  }
  focus(preserveEntryFocus) {
    this.activePart.focus(preserveEntryFocus);
  }
  focusNextEntry() {
    this.activePart.focusNextEntry();
  }
  focusPreviousEntry() {
    this.activePart.focusPreviousEntry();
  }
  isEntryFocused() {
    return this.activePart.isEntryFocused();
  }
  overrideStyle(style) {
    const disposables = new DisposableStore();
    for (const part of this.parts) {
      disposables.add(part.overrideStyle(style));
    }
    return disposables;
  }
};
StatusbarService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IStorageService),
  __param(2, IThemeService)
], StatusbarService);
let ScopedStatusbarService = class ScopedStatusbarService2 extends Disposable {
  static {
    __name(this, "ScopedStatusbarService");
  }
  constructor(statusbarEntryContainer, statusbarService) {
    super();
    this.statusbarEntryContainer = statusbarEntryContainer;
    this.statusbarService = statusbarService;
    this.onDidChangeEntryVisibility = this.statusbarEntryContainer.onDidChangeEntryVisibility;
  }
  createAuxiliaryStatusbarPart(container, instantiationService) {
    return this.statusbarService.createAuxiliaryStatusbarPart(container, instantiationService);
  }
  createScoped(statusbarEntryContainer, disposables) {
    return this.statusbarService.createScoped(statusbarEntryContainer, disposables);
  }
  getPart() {
    return this.statusbarEntryContainer;
  }
  addEntry(entry, id, alignment, priorityOrLocation = 0) {
    return this.statusbarEntryContainer.addEntry(entry, id, alignment, priorityOrLocation);
  }
  isEntryVisible(id) {
    return this.statusbarEntryContainer.isEntryVisible(id);
  }
  updateEntryVisibility(id, visible) {
    this.statusbarEntryContainer.updateEntryVisibility(id, visible);
  }
  overrideEntry(id, override) {
    return this.statusbarEntryContainer.overrideEntry(id, override);
  }
  focus(preserveEntryFocus) {
    this.statusbarEntryContainer.focus(preserveEntryFocus);
  }
  focusNextEntry() {
    this.statusbarEntryContainer.focusNextEntry();
  }
  focusPreviousEntry() {
    this.statusbarEntryContainer.focusPreviousEntry();
  }
  isEntryFocused() {
    return this.statusbarEntryContainer.isEntryFocused();
  }
  overrideStyle(style) {
    return this.statusbarEntryContainer.overrideStyle(style);
  }
};
ScopedStatusbarService = __decorate([
  __param(1, IStatusbarService)
], ScopedStatusbarService);
registerSingleton(
  IStatusbarService,
  StatusbarService,
  0
  /* InstantiationType.Eager */
);
export {
  AuxiliaryStatusbarPart,
  MainStatusbarPart,
  ScopedStatusbarService,
  StatusbarService
};
//# sourceMappingURL=statusbarPart.js.map
