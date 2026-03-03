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
import * as dom from "../../../base/browser/dom.js";
import { renderMarkdown } from "../../../base/browser/markdownRenderer.js";
import { ActionBar } from "../../../base/browser/ui/actionbar/actionbar.js";
import { getAnchorRect } from "../../../base/browser/ui/contextview/contextview.js";
import { KeybindingLabel } from "../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { List } from "../../../base/browser/ui/list/listWidget.js";
import { toAction } from "../../../base/common/actions.js";
import { CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Codicon } from "../../../base/common/codicons.js";
import { MarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../base/common/lifecycle.js";
import { OS } from "../../../base/common/platform.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { URI } from "../../../base/common/uri.js";
import "./actionWidget.css";
import { localize } from "../../../nls.js";
import { IContextViewService } from "../../contextview/browser/contextView.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { IOpenerService } from "../../opener/common/opener.js";
import { defaultListStyles } from "../../theme/browser/defaultStyles.js";
import { asCssVariable } from "../../theme/common/colorRegistry.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
import { IHoverService } from "../../hover/browser/hover.js";
const acceptSelectedActionCommand = "acceptSelectedCodeAction";
const previewSelectedActionCommand = "previewSelectedCodeAction";
var ActionListItemKind;
(function(ActionListItemKind2) {
  ActionListItemKind2["Action"] = "action";
  ActionListItemKind2["Header"] = "header";
  ActionListItemKind2["Separator"] = "separator";
})(ActionListItemKind || (ActionListItemKind = {}));
class HeaderRenderer {
  static {
    __name(this, "HeaderRenderer");
  }
  get templateId() {
    return "header";
  }
  renderTemplate(container) {
    container.classList.add("group-header");
    const text = document.createElement("span");
    container.append(text);
    return { container, text };
  }
  renderElement(element, _index, templateData) {
    templateData.text.textContent = element.group?.title ?? element.label ?? "";
  }
  disposeTemplate(_templateData) {
  }
}
class SeparatorRenderer {
  static {
    __name(this, "SeparatorRenderer");
  }
  get templateId() {
    return "separator";
  }
  renderTemplate(container) {
    container.classList.add("separator");
    const text = document.createElement("span");
    container.append(text);
    return { container, text };
  }
  renderElement(element, _index, templateData) {
    templateData.text.textContent = element.label ?? "";
  }
  disposeTemplate(_templateData) {
  }
}
let ActionItemRenderer = class ActionItemRenderer2 {
  static {
    __name(this, "ActionItemRenderer");
  }
  get templateId() {
    return "action";
  }
  constructor(_supportsPreview, _onRemoveItem, _keybindingService, _openerService) {
    this._supportsPreview = _supportsPreview;
    this._onRemoveItem = _onRemoveItem;
    this._keybindingService = _keybindingService;
    this._openerService = _openerService;
  }
  renderTemplate(container) {
    container.classList.add(this.templateId);
    const icon = document.createElement("div");
    icon.className = "icon";
    container.append(icon);
    const text = document.createElement("span");
    text.className = "title";
    container.append(text);
    const badge = document.createElement("span");
    badge.className = "action-item-badge";
    container.append(badge);
    const description = document.createElement("span");
    description.className = "description";
    container.append(description);
    const keybinding = new KeybindingLabel(container, OS);
    const toolbar = document.createElement("div");
    toolbar.className = "action-list-item-toolbar";
    container.append(toolbar);
    const elementDisposables = new DisposableStore();
    return { container, icon, text, badge, description, keybinding, toolbar, elementDisposables };
  }
  renderElement(element, _index, data) {
    data.elementDisposables.clear();
    if (element.group?.icon) {
      data.icon.className = ThemeIcon.asClassName(element.group.icon);
      if (element.group.icon.color) {
        data.icon.style.color = asCssVariable(element.group.icon.color.id);
      }
    } else {
      data.icon.className = ThemeIcon.asClassName(Codicon.lightBulb);
      data.icon.style.color = "var(--vscode-editorLightBulb-foreground)";
    }
    if (!element.item || !element.label) {
      return;
    }
    dom.setVisibility(!element.hideIcon, data.icon);
    if (data.previousClassName) {
      data.container.classList.remove(data.previousClassName);
    }
    data.container.classList.toggle("action-list-custom", !!element.className);
    if (element.className) {
      data.container.classList.add(element.className);
    }
    data.previousClassName = element.className;
    data.text.textContent = stripNewlines(element.label);
    if (element.badge) {
      data.badge.textContent = element.badge;
      data.badge.style.display = "";
    } else {
      data.badge.textContent = "";
      data.badge.style.display = "none";
    }
    if (element.keybinding) {
      data.description.textContent = element.keybinding.getLabel();
      data.description.style.display = "inline";
      data.description.style.letterSpacing = "0.5px";
    } else if (element.description) {
      dom.clearNode(data.description);
      if (typeof element.description === "string") {
        data.description.textContent = stripNewlines(element.description);
      } else {
        const rendered = renderMarkdown(element.description, {
          actionHandler: /* @__PURE__ */ __name((content) => {
            this._openerService.open(URI.parse(content), { allowCommands: true });
          }, "actionHandler")
        });
        data.elementDisposables.add(rendered);
        data.description.appendChild(rendered.element);
      }
      data.description.style.display = "inline";
    } else {
      data.description.textContent = "";
      data.description.style.display = "none";
    }
    const actionTitle = this._keybindingService.lookupKeybinding(acceptSelectedActionCommand)?.getLabel();
    const previewTitle = this._keybindingService.lookupKeybinding(previewSelectedActionCommand)?.getLabel();
    data.container.classList.toggle("option-disabled", !!element.disabled);
    if (element.hover !== void 0) {
      data.container.title = "";
    } else if (element.tooltip) {
      data.container.title = element.tooltip;
    } else if (element.disabled) {
      data.container.title = element.label;
    } else if (actionTitle && previewTitle) {
      if (this._supportsPreview && element.canPreview) {
        data.container.title = localize({ key: "label-preview", comment: ['placeholders are keybindings, e.g "F2 to Apply, Shift+F2 to Preview"'] }, "{0} to Apply, {1} to Preview", actionTitle, previewTitle);
      } else {
        data.container.title = localize({ key: "label", comment: ['placeholder is a keybinding, e.g "F2 to Apply"'] }, "{0} to Apply", actionTitle);
      }
    } else {
      data.container.title = "";
    }
    dom.clearNode(data.toolbar);
    const toolbarActions = [...element.toolbarActions ?? []];
    if (element.onRemove) {
      toolbarActions.push(toAction({
        id: "actionList.remove",
        label: localize("actionList.remove", "Remove"),
        class: ThemeIcon.asClassName(Codicon.close),
        run: /* @__PURE__ */ __name(() => {
          element.onRemove();
          this._onRemoveItem?.(element);
        }, "run")
      }));
    }
    data.container.classList.toggle("has-toolbar", toolbarActions.length > 0);
    if (toolbarActions.length > 0) {
      const actionBar = new ActionBar(data.toolbar);
      data.elementDisposables.add(actionBar);
      actionBar.push(toolbarActions, { icon: true, label: false });
    }
  }
  disposeTemplate(templateData) {
    templateData.keybinding.dispose();
    templateData.elementDisposables.dispose();
  }
};
ActionItemRenderer = __decorate([
  __param(2, IKeybindingService),
  __param(3, IOpenerService)
], ActionItemRenderer);
class AcceptSelectedEvent extends UIEvent {
  static {
    __name(this, "AcceptSelectedEvent");
  }
  constructor() {
    super("acceptSelectedAction");
  }
}
class PreviewSelectedEvent extends UIEvent {
  static {
    __name(this, "PreviewSelectedEvent");
  }
  constructor() {
    super("previewSelectedAction");
  }
}
function getKeyboardNavigationLabel(item) {
  if (item.kind === "action") {
    return item.label;
  }
  return void 0;
}
__name(getKeyboardNavigationLabel, "getKeyboardNavigationLabel");
let ActionList = class ActionList2 extends Disposable {
  static {
    __name(this, "ActionList");
  }
  /**
   * Returns the resolved anchor position after the first layout.
   * Used by the context view delegate to lock the dropdown direction.
   */
  get anchorPosition() {
    if (this._showAbove === void 0) {
      return void 0;
    }
    return this._showAbove ? 1 : 0;
  }
  constructor(user, preview, items, _delegate, accessibilityProvider, _options, _anchor, _contextViewService, _keybindingService, _layoutService, _hoverService, _openerService) {
    super();
    this._delegate = _delegate;
    this._options = _options;
    this._anchor = _anchor;
    this._contextViewService = _contextViewService;
    this._keybindingService = _keybindingService;
    this._layoutService = _layoutService;
    this._hoverService = _hoverService;
    this._openerService = _openerService;
    this._actionLineHeight = 24;
    this._headerLineHeight = 24;
    this._separatorLineHeight = 8;
    this.cts = this._register(new CancellationTokenSource());
    this._hover = this._register(new MutableDisposable());
    this._collapsedSections = /* @__PURE__ */ new Set();
    this._filterText = "";
    this._suppressHover = false;
    this._lastMinWidth = 0;
    this._hasLaidOut = false;
    this.domNode = document.createElement("div");
    this.domNode.classList.add("actionList");
    if (this._options?.collapsedByDefault) {
      for (const section of this._options.collapsedByDefault) {
        this._collapsedSections.add(section);
      }
    }
    const virtualDelegate = {
      getHeight: /* @__PURE__ */ __name((element) => {
        switch (element.kind) {
          case "header":
            return this._headerLineHeight;
          case "separator":
            return this._separatorLineHeight;
          default:
            return this._actionLineHeight;
        }
      }, "getHeight"),
      getTemplateId: /* @__PURE__ */ __name((element) => element.kind, "getTemplateId")
    };
    this._list = this._register(new List(user, this.domNode, virtualDelegate, [
      new ActionItemRenderer(preview, (item) => this._removeItem(item), this._keybindingService, this._openerService),
      new HeaderRenderer(),
      new SeparatorRenderer()
    ], {
      keyboardSupport: false,
      typeNavigationEnabled: !this._options?.showFilter,
      keyboardNavigationLabelProvider: { getKeyboardNavigationLabel },
      accessibilityProvider: {
        getAriaLabel: /* @__PURE__ */ __name((element) => {
          if (element.kind === "action") {
            let label = element.label ? stripNewlines(element?.label) : "";
            if (element.description) {
              const descText = typeof element.description === "string" ? element.description : element.description.value;
              label = label + ", " + stripNewlines(descText);
            }
            if (element.disabled) {
              label = localize({ key: "customQuickFixWidget.labels", comment: [`Action widget labels for accessibility.`] }, "{0}, Disabled Reason: {1}", label, element.disabled);
            }
            return label;
          }
          return null;
        }, "getAriaLabel"),
        getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize({ key: "customQuickFixWidget", comment: [`An action widget option`] }, "Action Widget"), "getWidgetAriaLabel"),
        getRole: /* @__PURE__ */ __name((e) => {
          switch (e.kind) {
            case "action":
              return "option";
            case "separator":
              return "separator";
            default:
              return "separator";
          }
        }, "getRole"),
        getWidgetRole: /* @__PURE__ */ __name(() => "listbox", "getWidgetRole"),
        ...accessibilityProvider
      }
    }));
    this._list.style(defaultListStyles);
    this._register(this._list.onMouseClick((e) => this.onListClick(e)));
    this._register(this._list.onMouseOver((e) => this.onListHover(e)));
    this._register(this._list.onDidChangeFocus(() => this.onFocus()));
    this._register(this._list.onDidChangeSelection((e) => this.onListSelection(e)));
    this._allMenuItems = [...items];
    if (this._options?.showFilter) {
      this._filterContainer = document.createElement("div");
      this._filterContainer.className = "action-list-filter";
      this._filterInput = document.createElement("input");
      this._filterInput.type = "text";
      this._filterInput.className = "action-list-filter-input";
      this._filterInput.placeholder = this._options?.filterPlaceholder ?? localize("actionList.filter.placeholder", "Search...");
      this._filterInput.setAttribute("aria-label", localize("actionList.filter.ariaLabel", "Filter items"));
      this._filterContainer.appendChild(this._filterInput);
      this._register(dom.addDisposableListener(this._filterInput, "input", () => {
        this._filterText = this._filterInput.value;
        this._applyFilter();
      }));
    }
    this._applyFilter();
    if (this._list.length) {
      this._focusCheckedOrFirst();
    }
    if (this._filterInput) {
      this._register(dom.addDisposableListener(this.domNode, "keydown", (e) => {
        if (this._filterInput && !dom.isActiveElement(this._filterInput) && e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this._filterInput.focus();
          this._filterInput.value = e.key;
          this._filterText = e.key;
          this._applyFilter();
          e.preventDefault();
          e.stopPropagation();
        }
      }));
    }
  }
  _toggleSection(section) {
    if (this._collapsedSections.has(section)) {
      this._collapsedSections.delete(section);
    } else {
      this._collapsedSections.add(section);
    }
    this._applyFilter();
  }
  _applyFilter() {
    const filterLower = this._filterText.toLowerCase();
    const isFiltering = filterLower.length > 0;
    const visible = [];
    const focusedIndexes = this._list.getFocus();
    let focusedItem;
    if (focusedIndexes.length > 0) {
      focusedItem = this._list.element(focusedIndexes[0]);
    }
    for (const item of this._allMenuItems) {
      if (item.kind === "header") {
        if (isFiltering) {
          continue;
        }
        visible.push(item);
        continue;
      }
      if (item.kind === "separator") {
        if (isFiltering) {
          continue;
        }
        if (item.section && this._collapsedSections.has(item.section)) {
          continue;
        }
        visible.push(item);
        continue;
      }
      if (isFiltering) {
        if (item.showAlways) {
          visible.push(item);
          continue;
        }
        if (item.isSectionToggle) {
          continue;
        }
        const label = (item.label ?? "").toLowerCase();
        const descValue = typeof item.description === "string" ? item.description : item.description?.value ?? "";
        const desc = descValue.toLowerCase();
        if (label.includes(filterLower) || desc.includes(filterLower)) {
          visible.push(item);
        }
      } else {
        if (item.isSectionToggle && item.section) {
          const collapsed = this._collapsedSections.has(item.section);
          visible.push({
            ...item,
            group: { ...item.group, icon: collapsed ? Codicon.chevronRight : Codicon.chevronDown }
          });
          continue;
        }
        if (item.section && this._collapsedSections.has(item.section)) {
          continue;
        }
        visible.push(item);
      }
    }
    const filterInputHasFocus = this._filterInput && dom.isActiveElement(this._filterInput);
    this._list.splice(0, this._list.length, visible);
    if (this._hasLaidOut) {
      this.layout(this._lastMinWidth);
      if (filterInputHasFocus) {
        this._filterInput?.focus();
        this._focusCheckedOrFirst();
      } else {
        this._list.domFocus();
        if (focusedItem) {
          const focusedItemId = focusedItem.item?.id;
          if (focusedItemId) {
            for (let i = 0; i < this._list.length; i++) {
              const el = this._list.element(i);
              if (el.item?.id === focusedItemId) {
                this._list.setFocus([i]);
                this._list.reveal(i);
                break;
              }
            }
          }
        }
      }
      this._contextViewService.layout();
    }
  }
  /**
   * Returns the filter container element, if filter is enabled.
   * The caller is responsible for appending it to the widget DOM.
   */
  get filterContainer() {
    return this._filterContainer;
  }
  get filterInput() {
    return this._filterInput;
  }
  focusCondition(element) {
    return !element.disabled && element.kind === "action";
  }
  focus() {
    if (this._filterInput && this._options?.focusFilterOnOpen) {
      this._filterInput.focus();
      this._focusCheckedOrFirst();
      return;
    }
    this._list.domFocus();
    this._focusCheckedOrFirst();
  }
  _focusCheckedOrFirst() {
    this._suppressHover = true;
    try {
      for (let i = 0; i < this._list.length; i++) {
        const element = this._list.element(i);
        if (element.kind === "action" && element.item?.checked) {
          this._list.setFocus([i]);
          this._list.reveal(i);
          return;
        }
      }
      this._list.focusFirst(void 0, this.focusCondition);
      const focused = this._list.getFocus();
      if (focused.length > 0) {
        this._list.reveal(focused[0]);
      }
    } finally {
      this._suppressHover = false;
    }
  }
  hide(didCancel) {
    this._delegate.onHide(didCancel);
    this.cts.cancel();
    this._hover.clear();
    this._contextViewService.hideContextView();
  }
  clearFilter() {
    if (this._filterInput && this._filterText) {
      this._filterInput.value = "";
      this._filterText = "";
      this._applyFilter();
      return true;
    }
    return false;
  }
  hasDynamicHeight() {
    if (this._options?.showFilter) {
      return true;
    }
    return this._allMenuItems.some((item) => item.isSectionToggle);
  }
  computeHeight() {
    const visibleCount = this._list.length;
    let listHeight = 0;
    for (let i = 0; i < visibleCount; i++) {
      const element = this._list.element(i);
      switch (element.kind) {
        case "header":
          listHeight += this._headerLineHeight;
          break;
        case "separator":
          listHeight += this._separatorLineHeight;
          break;
        default:
          listHeight += this._actionLineHeight;
          break;
      }
    }
    const filterHeight = this._filterContainer ? 36 : 0;
    const padding = 10;
    const targetWindow = dom.getWindow(this.domNode);
    let availableHeight;
    if (this.hasDynamicHeight()) {
      const viewportHeight = targetWindow.innerHeight;
      const anchorRect = getAnchorRect(this._anchor);
      const anchorTopInViewport = anchorRect.top - targetWindow.pageYOffset;
      const spaceBelow = viewportHeight - anchorTopInViewport - anchorRect.height - padding;
      const spaceAbove = anchorTopInViewport - padding;
      if (this._showAbove === void 0) {
        let fullHeight = filterHeight;
        for (const item of this._allMenuItems) {
          switch (item.kind) {
            case "header":
              fullHeight += this._headerLineHeight;
              break;
            case "separator":
              fullHeight += this._separatorLineHeight;
              break;
            default:
              fullHeight += this._actionLineHeight;
              break;
          }
        }
        this._showAbove = fullHeight > spaceBelow && spaceAbove > spaceBelow;
      }
      availableHeight = this._showAbove ? spaceAbove : spaceBelow;
    } else {
      const windowHeight = this._layoutService.getContainer(targetWindow).clientHeight;
      const widgetTop = this.domNode.getBoundingClientRect().top;
      availableHeight = widgetTop > 0 ? windowHeight - widgetTop - padding : windowHeight * 0.7;
    }
    const viewportMaxHeight = Math.floor(targetWindow.innerHeight * 0.4);
    const maxHeight = Math.min(Math.max(availableHeight, this._actionLineHeight * 3 + filterHeight), viewportMaxHeight);
    const height = Math.min(listHeight + filterHeight, maxHeight);
    return height - filterHeight;
  }
  computeMaxWidth(minWidth) {
    const visibleCount = this._list.length;
    const effectiveMinWidth = Math.max(minWidth, this._options?.minWidth ?? 0);
    let maxWidth = effectiveMinWidth;
    const totalItemCount = this._allMenuItems.length;
    if (totalItemCount >= 50) {
      return Math.max(380, effectiveMinWidth);
    }
    if (this._cachedMaxWidth !== void 0) {
      return this._cachedMaxWidth;
    }
    if (totalItemCount > visibleCount) {
      const visibleItems = [];
      for (let i = 0; i < visibleCount; i++) {
        visibleItems.push(this._list.element(i));
      }
      const allItems = [...this._allMenuItems];
      this._list.splice(0, visibleCount, allItems);
      let allItemsHeight = 0;
      for (const item of allItems) {
        switch (item.kind) {
          case "header":
            allItemsHeight += this._headerLineHeight;
            break;
          case "separator":
            allItemsHeight += this._separatorLineHeight;
            break;
          default:
            allItemsHeight += this._actionLineHeight;
            break;
        }
      }
      this._list.layout(allItemsHeight);
      const itemWidths2 = [];
      for (let i = 0; i < allItems.length; i++) {
        const element = this._getRowElement(i);
        if (element) {
          element.style.width = "auto";
          const width = element.getBoundingClientRect().width;
          element.style.width = "";
          itemWidths2.push(width + this._computeToolbarWidth(allItems[i]));
        }
      }
      maxWidth = Math.max(...itemWidths2, effectiveMinWidth);
      this._list.splice(0, allItems.length, visibleItems);
      return maxWidth;
    }
    const itemWidths = [];
    for (let i = 0; i < visibleCount; i++) {
      const element = this._getRowElement(i);
      if (element) {
        element.style.width = "auto";
        const width = element.getBoundingClientRect().width;
        element.style.width = "";
        itemWidths.push(width + this._computeToolbarWidth(this._list.element(i)));
      }
    }
    return Math.max(...itemWidths, effectiveMinWidth);
  }
  layout(minWidth) {
    this._hasLaidOut = true;
    this._lastMinWidth = minWidth;
    const listHeight = this.computeHeight();
    this._list.layout(listHeight);
    this._cachedMaxWidth = this.computeMaxWidth(minWidth);
    this._list.layout(listHeight, this._cachedMaxWidth);
    this.domNode.style.height = `${listHeight}px`;
    if (this._filterContainer && this._filterContainer.parentElement) {
      this._filterContainer.parentElement.insertBefore(this._filterContainer, this.domNode);
    }
    return this._cachedMaxWidth;
  }
  focusPrevious() {
    if (this._filterInput && dom.isActiveElement(this._filterInput)) {
      this._list.domFocus();
      const current = this._list.getFocus();
      if (current.length > 0) {
        this._list.focusPrevious(1, false, void 0, this.focusCondition);
        const focused2 = this._list.getFocus();
        if (focused2.length > 0 && focused2[0] >= current[0]) {
          this._filterInput.focus();
        } else if (focused2.length > 0) {
          this._list.reveal(focused2[0]);
        }
      } else {
        this._list.focusLast(void 0, this.focusCondition);
        const focused2 = this._list.getFocus();
        if (focused2.length > 0) {
          this._list.reveal(focused2[0]);
        }
      }
      return;
    }
    const previousFocus = this._list.getFocus();
    this._list.focusPrevious(1, true, void 0, this.focusCondition);
    const focused = this._list.getFocus();
    if (focused.length > 0) {
      if (this._filterInput && previousFocus.length > 0 && focused[0] > previousFocus[0]) {
        this._list.setFocus([]);
        this._filterInput.focus();
        return;
      }
      this._list.reveal(focused[0]);
    }
  }
  focusNext() {
    if (this._filterInput && dom.isActiveElement(this._filterInput)) {
      this._list.domFocus();
      const current = this._list.getFocus();
      if (current.length > 0) {
        this._list.focusNext(1, false, void 0, this.focusCondition);
        const focused2 = this._list.getFocus();
        if (focused2.length > 0) {
          this._list.reveal(focused2[0]);
        }
      } else {
        this._list.focusFirst(void 0, this.focusCondition);
        const focused2 = this._list.getFocus();
        if (focused2.length > 0) {
          this._list.reveal(focused2[0]);
        }
      }
      return;
    }
    const previousFocus = this._list.getFocus();
    this._list.focusNext(1, true, void 0, this.focusCondition);
    const focused = this._list.getFocus();
    if (focused.length > 0) {
      if (this._filterInput && previousFocus.length > 0 && focused[0] < previousFocus[0]) {
        this._list.setFocus([]);
        this._filterInput.focus();
        return;
      }
      this._list.reveal(focused[0]);
    }
  }
  collapseFocusedSection() {
    const section = this._getFocusedSection();
    if (section && !this._collapsedSections.has(section)) {
      this._toggleSection(section);
    }
  }
  expandFocusedSection() {
    const section = this._getFocusedSection();
    if (section && this._collapsedSections.has(section)) {
      this._toggleSection(section);
    }
  }
  toggleFocusedSection() {
    const focused = this._list.getFocus();
    if (focused.length === 0) {
      return false;
    }
    const element = this._list.element(focused[0]);
    if (element.isSectionToggle && element.section) {
      this._toggleSection(element.section);
      return true;
    }
    return false;
  }
  _getFocusedSection() {
    const focused = this._list.getFocus();
    if (focused.length === 0) {
      return void 0;
    }
    const element = this._list.element(focused[0]);
    if (element.isSectionToggle && element.section) {
      return element.section;
    }
    return element.section;
  }
  acceptSelected(preview) {
    const focused = this._list.getFocus();
    if (focused.length === 0) {
      return;
    }
    const focusIndex = focused[0];
    const element = this._list.element(focusIndex);
    if (!this.focusCondition(element)) {
      return;
    }
    const event = preview ? new PreviewSelectedEvent() : new AcceptSelectedEvent();
    this._list.setSelection([focusIndex], event);
  }
  onListSelection(e) {
    if (!e.elements.length) {
      return;
    }
    const element = e.elements[0];
    if (element.isSectionToggle) {
      this._list.setSelection([]);
      return;
    }
    if (element.item && this.focusCondition(element)) {
      this._delegate.onSelect(element.item, e.browserEvent instanceof PreviewSelectedEvent);
    } else {
      this._list.setSelection([]);
    }
  }
  onFocus() {
    const focused = this._list.getFocus();
    if (focused.length === 0) {
      return;
    }
    const focusIndex = focused[0];
    const element = this._list.element(focusIndex);
    this._delegate.onFocus?.(element.item);
    if (!this._suppressHover) {
      this._showHoverForElement(element, focusIndex);
    }
  }
  _removeItem(item) {
    const index = this._allMenuItems.indexOf(item);
    if (index >= 0) {
      this._allMenuItems.splice(index, 1);
      this._applyFilter();
    }
  }
  _computeToolbarWidth(item) {
    let actionCount = item.toolbarActions?.length ?? 0;
    if (item.onRemove) {
      actionCount++;
    }
    if (actionCount === 0) {
      return 0;
    }
    const actionButtonWidth = 22;
    return actionCount * actionButtonWidth + 6;
  }
  _getRowElement(index) {
    return this.domNode.ownerDocument.getElementById(this._list.getElementID(index));
  }
  _showHoverForElement(element, index) {
    let newHover;
    if (element.hover?.content) {
      const rowElement = this._getRowElement(index);
      if (rowElement) {
        const markdown = typeof element.hover.content === "string" ? new MarkdownString(element.hover.content) : element.hover.content;
        newHover = this._hoverService.showDelayedHover({
          content: markdown ?? "",
          target: rowElement,
          additionalClasses: ["action-widget-hover"],
          position: {
            hoverPosition: 0,
            forcePosition: false,
            ...element.hover.position
          },
          appearance: {
            showPointer: true
          }
        }, { groupId: `actionListHover` });
      }
    }
    this._hover.value = newHover;
  }
  async onListHover(e) {
    const element = e.element;
    if (element && element.item && this.focusCondition(element)) {
      const isHoveringToolbar = dom.isHTMLElement(e.browserEvent.target) && e.browserEvent.target.closest(".action-list-item-toolbar") !== null;
      if (isHoveringToolbar) {
        this._list.setFocus([]);
        return;
      }
      this._list.setFocus(typeof e.index === "number" ? [e.index] : []);
      if (this._delegate.onHover && !element.disabled && element.kind === "action") {
        const result = await this._delegate.onHover(element.item, this.cts.token);
        const canPreview = result ? result.canPreview : void 0;
        if (canPreview !== element.canPreview) {
          element.canPreview = canPreview;
          if (typeof e.index === "number") {
            this._list.splice(e.index, 1, [element]);
            this._list.setFocus([e.index]);
          }
        }
      }
    } else if (element && element.hover?.content && typeof e.index === "number") {
      this._showHoverForElement(element, e.index);
    }
  }
  onListClick(e) {
    if (e.element && e.element.isSectionToggle && e.element.section) {
      const section = e.element.section;
      queueMicrotask(() => this._toggleSection(section));
      return;
    }
    if (e.element && this.focusCondition(e.element)) {
      this._list.setFocus([]);
    }
  }
};
ActionList = __decorate([
  __param(7, IContextViewService),
  __param(8, IKeybindingService),
  __param(9, ILayoutService),
  __param(10, IHoverService),
  __param(11, IOpenerService)
], ActionList);
function stripNewlines(str) {
  return str.replace(/\r\n|\r|\n/g, " ");
}
__name(stripNewlines, "stripNewlines");
export {
  ActionList,
  ActionListItemKind,
  acceptSelectedActionCommand,
  previewSelectedActionCommand
};
//# sourceMappingURL=actionList.js.map
