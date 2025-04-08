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
import { Delayer } from "../../../../base/common/async.js";
import * as DOM from "../../../../base/browser/dom.js";
import { IAction } from "../../../../base/common/actions.js";
import { HistoryInputBox } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import { badgeBackground, badgeForeground, contrastBorder, asCssVariable } from "../../../../platform/theme/common/colorRegistry.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ContextScopedHistoryInputBox } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { showHistoryKeybindingHint } from "../../../../platform/history/browser/historyWidgetKeybindingHint.js";
import { MenuId, MenuRegistry, SubmenuItemAction } from "../../../../platform/actions/common/actions.js";
import { HiddenItemStrategy, MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { SubmenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Widget } from "../../../../base/browser/ui/widget.js";
import { Emitter } from "../../../../base/common/event.js";
import { defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
const viewFilterMenu = new MenuId("menu.view.filter");
const viewFilterSubmenu = new MenuId("submenu.view.filter");
MenuRegistry.appendMenuItem(viewFilterMenu, {
  submenu: viewFilterSubmenu,
  title: localize("more filters", "More Filters..."),
  group: "navigation",
  icon: Codicon.filter
});
class MoreFiltersActionViewItem extends SubmenuEntryActionViewItem {
  static {
    __name(this, "MoreFiltersActionViewItem");
  }
  _checked = false;
  set checked(checked) {
    if (this._checked !== checked) {
      this._checked = checked;
      this.updateChecked();
    }
  }
  updateChecked() {
    if (this.element) {
      this.element.classList.toggle("checked", this._checked);
    }
  }
  render(container) {
    super.render(container);
    this.updateChecked();
  }
}
let FilterWidget = class extends Widget {
  constructor(options, instantiationService, contextViewService, contextKeyService, keybindingService) {
    super();
    this.options = options;
    this.instantiationService = instantiationService;
    this.contextViewService = contextViewService;
    this.keybindingService = keybindingService;
    this.delayedFilterUpdate = new Delayer(300);
    this._register(toDisposable(() => this.delayedFilterUpdate.cancel()));
    if (options.focusContextKey) {
      this.focusContextKey = new RawContextKey(options.focusContextKey, false).bindTo(contextKeyService);
    }
    this.element = DOM.$(".viewpane-filter");
    [this.filterInputBox, this.focusTracker] = this.createInput(this.element);
    this._register(this.filterInputBox);
    this._register(this.focusTracker);
    const controlsContainer = DOM.append(this.element, DOM.$(".viewpane-filter-controls"));
    this.filterBadge = this.createBadge(controlsContainer);
    this.toolbar = this._register(this.createToolBar(controlsContainer));
    this.adjustInputBox();
  }
  static {
    __name(this, "FilterWidget");
  }
  element;
  delayedFilterUpdate;
  filterInputBox;
  filterBadge;
  toolbar;
  focusContextKey;
  _onDidChangeFilterText = this._register(new Emitter());
  onDidChangeFilterText = this._onDidChangeFilterText.event;
  moreFiltersActionViewItem;
  isMoreFiltersChecked = false;
  lastWidth;
  focusTracker;
  get onDidFocus() {
    return this.focusTracker.onDidFocus;
  }
  get onDidBlur() {
    return this.focusTracker.onDidBlur;
  }
  hasFocus() {
    return this.filterInputBox.hasFocus();
  }
  focus() {
    this.filterInputBox.focus();
  }
  blur() {
    this.filterInputBox.blur();
  }
  updateBadge(message) {
    this.filterBadge.classList.toggle("hidden", !message);
    this.filterBadge.textContent = message || "";
    this.adjustInputBox();
  }
  setFilterText(filterText) {
    this.filterInputBox.value = filterText;
  }
  getFilterText() {
    return this.filterInputBox.value;
  }
  getHistory() {
    return this.filterInputBox.getHistory();
  }
  layout(width) {
    this.element.parentElement?.classList.toggle("grow", width > 700);
    this.element.classList.toggle("small", width < 400);
    this.adjustInputBox();
    this.lastWidth = width;
  }
  relayout() {
    if (this.lastWidth) {
      this.layout(this.lastWidth);
    }
  }
  checkMoreFilters(checked) {
    this.isMoreFiltersChecked = checked;
    if (this.moreFiltersActionViewItem) {
      this.moreFiltersActionViewItem.checked = checked;
    }
  }
  createInput(container) {
    const history = this.options.history || [];
    const inputBox = this._register(this.instantiationService.createInstance(ContextScopedHistoryInputBox, container, this.contextViewService, {
      placeholder: this.options.placeholder,
      ariaLabel: this.options.ariaLabel,
      history: new Set(history),
      showHistoryHint: /* @__PURE__ */ __name(() => showHistoryKeybindingHint(this.keybindingService), "showHistoryHint"),
      inputBoxStyles: defaultInputBoxStyles
    }));
    if (this.options.text) {
      inputBox.value = this.options.text;
    }
    this._register(inputBox.onDidChange((filter) => this.delayedFilterUpdate.trigger(() => this.onDidInputChange(inputBox))));
    this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => this.onInputKeyDown(e, inputBox)));
    this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, this.handleKeyboardEvent));
    this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_UP, this.handleKeyboardEvent));
    this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.CLICK, (e) => {
      e.stopPropagation();
      e.preventDefault();
    }));
    const focusTracker = this._register(DOM.trackFocus(inputBox.inputElement));
    if (this.focusContextKey) {
      this._register(focusTracker.onDidFocus(() => this.focusContextKey.set(true)));
      this._register(focusTracker.onDidBlur(() => this.focusContextKey.set(false)));
      this._register(toDisposable(() => this.focusContextKey.reset()));
    }
    return [inputBox, focusTracker];
  }
  createBadge(container) {
    const filterBadge = DOM.append(container, DOM.$(".viewpane-filter-badge.hidden"));
    filterBadge.style.backgroundColor = asCssVariable(badgeBackground);
    filterBadge.style.color = asCssVariable(badgeForeground);
    filterBadge.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    return filterBadge;
  }
  createToolBar(container) {
    return this.instantiationService.createInstance(
      MenuWorkbenchToolBar,
      container,
      viewFilterMenu,
      {
        hiddenItemStrategy: HiddenItemStrategy.NoHide,
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (action instanceof SubmenuItemAction && action.item.submenu.id === viewFilterSubmenu.id) {
            this.moreFiltersActionViewItem = this.instantiationService.createInstance(MoreFiltersActionViewItem, action, options);
            this.moreFiltersActionViewItem.checked = this.isMoreFiltersChecked;
            return this.moreFiltersActionViewItem;
          }
          return void 0;
        }, "actionViewItemProvider")
      }
    );
  }
  onDidInputChange(inputbox) {
    inputbox.addToHistory();
    this._onDidChangeFilterText.fire(inputbox.value);
  }
  adjustInputBox() {
    this.filterInputBox.inputElement.style.paddingRight = this.element.classList.contains("small") || this.filterBadge.classList.contains("hidden") ? "25px" : "150px";
  }
  // Action toolbar is swallowing some keys for action items which should not be for an input box
  handleKeyboardEvent(event) {
    if (event.equals(KeyCode.Space) || event.equals(KeyCode.LeftArrow) || event.equals(KeyCode.RightArrow) || event.equals(KeyCode.Home) || event.equals(KeyCode.End)) {
      event.stopPropagation();
    }
  }
  onInputKeyDown(event, filterInputBox) {
    let handled = false;
    if (event.equals(KeyCode.Tab) && !this.toolbar.isEmpty()) {
      this.toolbar.focus();
      handled = true;
    }
    if (handled) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
};
FilterWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService)
], FilterWidget);
export {
  FilterWidget,
  viewFilterSubmenu
};
//# sourceMappingURL=viewFilter.js.map
