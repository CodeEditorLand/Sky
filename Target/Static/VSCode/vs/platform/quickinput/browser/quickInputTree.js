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
import * as dom from "../../../base/browser/dom.js";
import * as cssJs from "../../../base/browser/cssValue.js";
import { Emitter, Event, EventBufferer, IValueWithChangeEvent } from "../../../base/common/event.js";
import { IHoverDelegate } from "../../../base/browser/ui/hover/hoverDelegate.js";
import { IListVirtualDelegate } from "../../../base/browser/ui/list/list.js";
import { IObjectTreeElement, ITreeNode, ITreeRenderer, TreeVisibility } from "../../../base/browser/ui/tree/tree.js";
import { localize } from "../../../nls.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { WorkbenchObjectTree } from "../../list/browser/listService.js";
import { IThemeService } from "../../theme/common/themeService.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { IQuickPickItem, IQuickPickItemButtonEvent, IQuickPickSeparator, IQuickPickSeparatorButtonEvent, QuickPickItem, QuickPickFocus } from "../common/quickInput.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IMatch } from "../../../base/common/filters.js";
import { IListAccessibilityProvider, IListStyles } from "../../../base/browser/ui/list/listWidget.js";
import { AriaRole } from "../../../base/browser/ui/aria/aria.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import { OS } from "../../../base/common/platform.js";
import { memoize } from "../../../base/common/decorators.js";
import { IIconLabelValueOptions, IconLabel } from "../../../base/browser/ui/iconLabel/iconLabel.js";
import { KeybindingLabel } from "../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { ActionBar } from "../../../base/browser/ui/actionbar/actionbar.js";
import { isDark } from "../../theme/common/theme.js";
import { URI } from "../../../base/common/uri.js";
import { quickInputButtonToAction } from "./quickInputUtils.js";
import { Lazy } from "../../../base/common/lazy.js";
import { IParsedLabelWithIcons, getCodiconAriaLabel, matchesFuzzyIconAware, parseLabelWithIcons } from "../../../base/common/iconLabels.js";
import { HoverPosition } from "../../../base/browser/ui/hover/hoverWidget.js";
import { compareAnything } from "../../../base/common/comparers.js";
import { escape, ltrim } from "../../../base/common/strings.js";
import { RenderIndentGuides } from "../../../base/browser/ui/tree/abstractTree.js";
import { ThrottledDelayer } from "../../../base/common/async.js";
import { isCancellationError } from "../../../base/common/errors.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.js";
import { observableValue, observableValueOpts, transaction } from "../../../base/common/observable.js";
import { equals } from "../../../base/common/arrays.js";
const $ = dom.$;
class BaseQuickPickItemElement {
  constructor(index, hasCheckbox, mainItem) {
    this.index = index;
    this.hasCheckbox = hasCheckbox;
    this._init = new Lazy(() => {
      const saneLabel = mainItem.label ?? "";
      const saneSortLabel = parseLabelWithIcons(saneLabel).text.trim();
      const saneAriaLabel = mainItem.ariaLabel || [saneLabel, this.saneDescription, this.saneDetail].map((s) => getCodiconAriaLabel(s)).filter((s) => !!s).join(", ");
      return {
        saneLabel,
        saneSortLabel,
        saneAriaLabel
      };
    });
    this._saneDescription = mainItem.description;
    this._saneTooltip = mainItem.tooltip;
  }
  static {
    __name(this, "BaseQuickPickItemElement");
  }
  _init;
  // #region Lazy Getters
  get saneLabel() {
    return this._init.value.saneLabel;
  }
  get saneSortLabel() {
    return this._init.value.saneSortLabel;
  }
  get saneAriaLabel() {
    return this._init.value.saneAriaLabel;
  }
  // #endregion
  // #region Getters and Setters
  _element;
  get element() {
    return this._element;
  }
  set element(value) {
    this._element = value;
  }
  _hidden = false;
  get hidden() {
    return this._hidden;
  }
  set hidden(value) {
    this._hidden = value;
  }
  _saneDescription;
  get saneDescription() {
    return this._saneDescription;
  }
  set saneDescription(value) {
    this._saneDescription = value;
  }
  _saneDetail;
  get saneDetail() {
    return this._saneDetail;
  }
  set saneDetail(value) {
    this._saneDetail = value;
  }
  _saneTooltip;
  get saneTooltip() {
    return this._saneTooltip;
  }
  set saneTooltip(value) {
    this._saneTooltip = value;
  }
  _labelHighlights;
  get labelHighlights() {
    return this._labelHighlights;
  }
  set labelHighlights(value) {
    this._labelHighlights = value;
  }
  _descriptionHighlights;
  get descriptionHighlights() {
    return this._descriptionHighlights;
  }
  set descriptionHighlights(value) {
    this._descriptionHighlights = value;
  }
  _detailHighlights;
  get detailHighlights() {
    return this._detailHighlights;
  }
  set detailHighlights(value) {
    this._detailHighlights = value;
  }
}
class QuickPickItemElement extends BaseQuickPickItemElement {
  constructor(index, hasCheckbox, fireButtonTriggered, _onChecked, item, _separator) {
    super(index, hasCheckbox, item);
    this.fireButtonTriggered = fireButtonTriggered;
    this._onChecked = _onChecked;
    this.item = item;
    this._separator = _separator;
    this.onChecked = hasCheckbox ? Event.map(Event.filter(this._onChecked.event, (e) => e.element === this), (e) => e.checked) : Event.None;
    this._saneDetail = item.detail;
    this._labelHighlights = item.highlights?.label;
    this._descriptionHighlights = item.highlights?.description;
    this._detailHighlights = item.highlights?.detail;
  }
  static {
    __name(this, "QuickPickItemElement");
  }
  onChecked;
  get separator() {
    return this._separator;
  }
  set separator(value) {
    this._separator = value;
  }
  _checked = false;
  get checked() {
    return this._checked;
  }
  set checked(value) {
    if (value !== this._checked) {
      this._checked = value;
      this._onChecked.fire({ element: this, checked: value });
    }
  }
  get checkboxDisabled() {
    return !!this.item.disabled;
  }
}
var QuickPickSeparatorFocusReason = /* @__PURE__ */ ((QuickPickSeparatorFocusReason2) => {
  QuickPickSeparatorFocusReason2[QuickPickSeparatorFocusReason2["NONE"] = 0] = "NONE";
  QuickPickSeparatorFocusReason2[QuickPickSeparatorFocusReason2["MOUSE_HOVER"] = 1] = "MOUSE_HOVER";
  QuickPickSeparatorFocusReason2[QuickPickSeparatorFocusReason2["ACTIVE_ITEM"] = 2] = "ACTIVE_ITEM";
  return QuickPickSeparatorFocusReason2;
})(QuickPickSeparatorFocusReason || {});
class QuickPickSeparatorElement extends BaseQuickPickItemElement {
  constructor(index, fireSeparatorButtonTriggered, separator) {
    super(index, false, separator);
    this.fireSeparatorButtonTriggered = fireSeparatorButtonTriggered;
    this.separator = separator;
  }
  static {
    __name(this, "QuickPickSeparatorElement");
  }
  children = new Array();
  /**
   * If this item is >0, it means that there is some item in the list that is either:
   * * hovered over
   * * active
   */
  focusInsideSeparator = 0 /* NONE */;
}
class QuickInputItemDelegate {
  static {
    __name(this, "QuickInputItemDelegate");
  }
  getHeight(element) {
    if (element instanceof QuickPickSeparatorElement) {
      return 30;
    }
    return element.saneDetail ? 44 : 22;
  }
  getTemplateId(element) {
    if (element instanceof QuickPickItemElement) {
      return QuickPickItemElementRenderer.ID;
    } else {
      return QuickPickSeparatorElementRenderer.ID;
    }
  }
}
class QuickInputAccessibilityProvider {
  static {
    __name(this, "QuickInputAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("quickInput", "Quick Input");
  }
  getAriaLabel(element) {
    return element.separator?.label ? `${element.saneAriaLabel}, ${element.separator.label}` : element.saneAriaLabel;
  }
  getWidgetRole() {
    return "listbox";
  }
  getRole(element) {
    return element.hasCheckbox ? "checkbox" : "option";
  }
  isChecked(element) {
    if (!element.hasCheckbox || !(element instanceof QuickPickItemElement)) {
      return void 0;
    }
    return {
      get value() {
        return element.checked;
      },
      onDidChange: /* @__PURE__ */ __name((e) => element.onChecked(() => e()), "onDidChange")
    };
  }
}
class BaseQuickInputListRenderer {
  constructor(hoverDelegate) {
    this.hoverDelegate = hoverDelegate;
  }
  static {
    __name(this, "BaseQuickInputListRenderer");
  }
  // TODO: only do the common stuff here and have a subclass handle their specific stuff
  renderTemplate(container) {
    const data = /* @__PURE__ */ Object.create(null);
    data.toDisposeElement = new DisposableStore();
    data.toDisposeTemplate = new DisposableStore();
    data.entry = dom.append(container, $(".quick-input-list-entry"));
    const label = dom.append(data.entry, $("label.quick-input-list-label"));
    data.toDisposeTemplate.add(dom.addStandardDisposableListener(label, dom.EventType.CLICK, (e) => {
      if (!data.checkbox.offsetParent) {
        e.preventDefault();
      }
    }));
    data.checkbox = dom.append(label, $("input.quick-input-list-checkbox"));
    data.checkbox.type = "checkbox";
    const rows = dom.append(label, $(".quick-input-list-rows"));
    const row1 = dom.append(rows, $(".quick-input-list-row"));
    const row2 = dom.append(rows, $(".quick-input-list-row"));
    data.label = new IconLabel(row1, { supportHighlights: true, supportDescriptionHighlights: true, supportIcons: true, hoverDelegate: this.hoverDelegate });
    data.toDisposeTemplate.add(data.label);
    data.icon = dom.prepend(data.label.element, $(".quick-input-list-icon"));
    const keybindingContainer = dom.append(row1, $(".quick-input-list-entry-keybinding"));
    data.keybinding = new KeybindingLabel(keybindingContainer, OS);
    data.toDisposeTemplate.add(data.keybinding);
    const detailContainer = dom.append(row2, $(".quick-input-list-label-meta"));
    data.detail = new IconLabel(detailContainer, { supportHighlights: true, supportIcons: true, hoverDelegate: this.hoverDelegate });
    data.toDisposeTemplate.add(data.detail);
    data.separator = dom.append(data.entry, $(".quick-input-list-separator"));
    data.actionBar = new ActionBar(data.entry, this.hoverDelegate ? { hoverDelegate: this.hoverDelegate } : void 0);
    data.actionBar.domNode.classList.add("quick-input-list-entry-action-bar");
    data.toDisposeTemplate.add(data.actionBar);
    return data;
  }
  disposeTemplate(data) {
    data.toDisposeElement.dispose();
    data.toDisposeTemplate.dispose();
  }
  disposeElement(_element, _index, data) {
    data.toDisposeElement.clear();
    data.actionBar.clear();
  }
}
let QuickPickItemElementRenderer = class extends BaseQuickInputListRenderer {
  constructor(hoverDelegate, themeService) {
    super(hoverDelegate);
    this.themeService = themeService;
  }
  static {
    __name(this, "QuickPickItemElementRenderer");
  }
  static ID = "quickpickitem";
  // Follow what we do in the separator renderer
  _itemsWithSeparatorsFrequency = /* @__PURE__ */ new Map();
  get templateId() {
    return QuickPickItemElementRenderer.ID;
  }
  renderTemplate(container) {
    const data = super.renderTemplate(container);
    data.toDisposeTemplate.add(dom.addStandardDisposableListener(data.checkbox, dom.EventType.CHANGE, (e) => {
      data.element.checked = data.checkbox.checked;
    }));
    return data;
  }
  renderElement(node, index, data) {
    const element = node.element;
    data.element = element;
    element.element = data.entry ?? void 0;
    const mainItem = element.item;
    element.element.classList.toggle("indented", Boolean(mainItem.indented));
    element.element.classList.toggle("not-pickable", element.item.pickable === false);
    data.checkbox.checked = element.checked;
    data.toDisposeElement.add(element.onChecked((checked) => data.checkbox.checked = checked));
    data.checkbox.disabled = element.checkboxDisabled;
    const { labelHighlights, descriptionHighlights, detailHighlights } = element;
    if (mainItem.iconPath) {
      const icon = isDark(this.themeService.getColorTheme().type) ? mainItem.iconPath.dark : mainItem.iconPath.light ?? mainItem.iconPath.dark;
      const iconUrl = URI.revive(icon);
      data.icon.className = "quick-input-list-icon";
      data.icon.style.backgroundImage = cssJs.asCSSUrl(iconUrl);
    } else {
      data.icon.style.backgroundImage = "";
      data.icon.className = mainItem.iconClass ? `quick-input-list-icon ${mainItem.iconClass}` : "";
    }
    let descriptionTitle;
    if (!element.saneTooltip && element.saneDescription) {
      descriptionTitle = {
        markdown: {
          value: escape(element.saneDescription),
          supportThemeIcons: true
        },
        markdownNotSupportedFallback: element.saneDescription
      };
    }
    const options = {
      matches: labelHighlights || [],
      // If we have a tooltip, we want that to be shown and not any other hover
      descriptionTitle,
      descriptionMatches: descriptionHighlights || [],
      labelEscapeNewLines: true
    };
    options.extraClasses = mainItem.iconClasses;
    options.italic = mainItem.italic;
    options.strikethrough = mainItem.strikethrough;
    data.entry.classList.remove("quick-input-list-separator-as-item");
    data.label.setLabel(element.saneLabel, element.saneDescription, options);
    data.keybinding.set(mainItem.keybinding);
    if (element.saneDetail) {
      let title;
      if (!element.saneTooltip) {
        title = {
          markdown: {
            value: escape(element.saneDetail),
            supportThemeIcons: true
          },
          markdownNotSupportedFallback: element.saneDetail
        };
      }
      data.detail.element.style.display = "";
      data.detail.setLabel(element.saneDetail, void 0, {
        matches: detailHighlights,
        title,
        labelEscapeNewLines: true
      });
    } else {
      data.detail.element.style.display = "none";
    }
    if (element.separator?.label) {
      data.separator.textContent = element.separator.label;
      data.separator.style.display = "";
      this.addItemWithSeparator(element);
    } else {
      data.separator.style.display = "none";
    }
    data.entry.classList.toggle("quick-input-list-separator-border", !!element.separator);
    const buttons = mainItem.buttons;
    if (buttons && buttons.length) {
      data.actionBar.push(buttons.map((button, index2) => quickInputButtonToAction(
        button,
        `id-${index2}`,
        () => element.fireButtonTriggered({ button, item: element.item })
      )), { icon: true, label: false });
      data.entry.classList.add("has-actions");
    } else {
      data.entry.classList.remove("has-actions");
    }
  }
  disposeElement(element, _index, data) {
    this.removeItemWithSeparator(element.element);
    super.disposeElement(element, _index, data);
  }
  isItemWithSeparatorVisible(item) {
    return this._itemsWithSeparatorsFrequency.has(item);
  }
  addItemWithSeparator(item) {
    this._itemsWithSeparatorsFrequency.set(item, (this._itemsWithSeparatorsFrequency.get(item) || 0) + 1);
  }
  removeItemWithSeparator(item) {
    const frequency = this._itemsWithSeparatorsFrequency.get(item) || 0;
    if (frequency > 1) {
      this._itemsWithSeparatorsFrequency.set(item, frequency - 1);
    } else {
      this._itemsWithSeparatorsFrequency.delete(item);
    }
  }
};
QuickPickItemElementRenderer = __decorateClass([
  __decorateParam(1, IThemeService)
], QuickPickItemElementRenderer);
class QuickPickSeparatorElementRenderer extends BaseQuickInputListRenderer {
  static {
    __name(this, "QuickPickSeparatorElementRenderer");
  }
  static ID = "quickpickseparator";
  // This is a frequency map because sticky scroll re-uses the same renderer to render a second
  // instance of the same separator.
  _visibleSeparatorsFrequency = /* @__PURE__ */ new Map();
  get templateId() {
    return QuickPickSeparatorElementRenderer.ID;
  }
  get visibleSeparators() {
    return [...this._visibleSeparatorsFrequency.keys()];
  }
  isSeparatorVisible(separator) {
    return this._visibleSeparatorsFrequency.has(separator);
  }
  renderTemplate(container) {
    const data = super.renderTemplate(container);
    data.checkbox.style.display = "none";
    return data;
  }
  renderElement(node, index, data) {
    const element = node.element;
    data.element = element;
    element.element = data.entry ?? void 0;
    element.element.classList.toggle("focus-inside", !!element.focusInsideSeparator);
    const mainItem = element.separator;
    const { labelHighlights, descriptionHighlights } = element;
    data.icon.style.backgroundImage = "";
    data.icon.className = "";
    let descriptionTitle;
    if (!element.saneTooltip && element.saneDescription) {
      descriptionTitle = {
        markdown: {
          value: escape(element.saneDescription),
          supportThemeIcons: true
        },
        markdownNotSupportedFallback: element.saneDescription
      };
    }
    const options = {
      matches: labelHighlights || [],
      // If we have a tooltip, we want that to be shown and not any other hover
      descriptionTitle,
      descriptionMatches: descriptionHighlights || [],
      labelEscapeNewLines: true
    };
    data.entry.classList.add("quick-input-list-separator-as-item");
    data.label.setLabel(element.saneLabel, element.saneDescription, options);
    data.separator.style.display = "none";
    data.entry.classList.add("quick-input-list-separator-border");
    const buttons = mainItem.buttons;
    if (buttons && buttons.length) {
      data.actionBar.push(buttons.map((button, index2) => quickInputButtonToAction(
        button,
        `id-${index2}`,
        () => element.fireSeparatorButtonTriggered({ button, separator: element.separator })
      )), { icon: true, label: false });
      data.entry.classList.add("has-actions");
    } else {
      data.entry.classList.remove("has-actions");
    }
    this.addSeparator(element);
  }
  disposeElement(element, _index, data) {
    this.removeSeparator(element.element);
    if (!this.isSeparatorVisible(element.element)) {
      element.element.element?.classList.remove("focus-inside");
    }
    super.disposeElement(element, _index, data);
  }
  addSeparator(separator) {
    this._visibleSeparatorsFrequency.set(separator, (this._visibleSeparatorsFrequency.get(separator) || 0) + 1);
  }
  removeSeparator(separator) {
    const frequency = this._visibleSeparatorsFrequency.get(separator) || 0;
    if (frequency > 1) {
      this._visibleSeparatorsFrequency.set(separator, frequency - 1);
    } else {
      this._visibleSeparatorsFrequency.delete(separator);
    }
  }
}
let QuickInputTree = class extends Disposable {
  constructor(parent, hoverDelegate, linkOpenerDelegate, id, instantiationService, accessibilityService) {
    super();
    this.parent = parent;
    this.hoverDelegate = hoverDelegate;
    this.linkOpenerDelegate = linkOpenerDelegate;
    this.accessibilityService = accessibilityService;
    this._container = dom.append(this.parent, $(".quick-input-list"));
    this._separatorRenderer = new QuickPickSeparatorElementRenderer(hoverDelegate);
    this._itemRenderer = instantiationService.createInstance(QuickPickItemElementRenderer, hoverDelegate);
    this._tree = this._register(instantiationService.createInstance(
      WorkbenchObjectTree,
      "QuickInput",
      this._container,
      new QuickInputItemDelegate(),
      [this._itemRenderer, this._separatorRenderer],
      {
        filter: {
          filter(element) {
            return element.hidden ? TreeVisibility.Hidden : element instanceof QuickPickSeparatorElement ? TreeVisibility.Recurse : TreeVisibility.Visible;
          }
        },
        sorter: {
          compare: /* @__PURE__ */ __name((element, otherElement) => {
            if (!this.sortByLabel || !this._lastQueryString) {
              return 0;
            }
            const normalizedSearchValue = this._lastQueryString.toLowerCase();
            return compareEntries(element, otherElement, normalizedSearchValue);
          }, "compare")
        },
        accessibilityProvider: new QuickInputAccessibilityProvider(),
        setRowLineHeight: false,
        multipleSelectionSupport: false,
        hideTwistiesOfChildlessElements: true,
        renderIndentGuides: RenderIndentGuides.None,
        findWidgetEnabled: false,
        indent: 0,
        horizontalScrolling: false,
        allowNonCollapsibleParents: true,
        alwaysConsumeMouseWheel: true
      }
    ));
    this._tree.getHTMLElement().id = id;
    this._registerListeners();
  }
  static {
    __name(this, "QuickInputTree");
  }
  //#region QuickInputTree Events
  _onKeyDown = new Emitter();
  /**
   * Event that is fired when the tree receives a keydown.
  */
  onKeyDown = this._onKeyDown.event;
  _onLeave = new Emitter();
  /**
   * Event that is fired when the tree would no longer have focus.
  */
  onLeave = this._onLeave.event;
  _visibleCountObservable = observableValue("VisibleCount", 0);
  onChangedVisibleCount = Event.fromObservable(this._visibleCountObservable, this._store);
  _allVisibleCheckedObservable = observableValue("AllVisibleChecked", false);
  onChangedAllVisibleChecked = Event.fromObservable(this._allVisibleCheckedObservable, this._store);
  _checkedCountObservable = observableValue("CheckedCount", 0);
  onChangedCheckedCount = Event.fromObservable(this._checkedCountObservable, this._store);
  _checkedElementsObservable = observableValueOpts({ equalsFn: equals }, new Array());
  onChangedCheckedElements = Event.fromObservable(this._checkedElementsObservable, this._store);
  _onButtonTriggered = new Emitter();
  onButtonTriggered = this._onButtonTriggered.event;
  _onSeparatorButtonTriggered = new Emitter();
  onSeparatorButtonTriggered = this._onSeparatorButtonTriggered.event;
  _elementChecked = new Emitter();
  _elementCheckedEventBufferer = new EventBufferer();
  //#endregion
  _hasCheckboxes = false;
  _container;
  _tree;
  _separatorRenderer;
  _itemRenderer;
  _inputElements = new Array();
  _elementTree = new Array();
  _itemElements = new Array();
  // Elements that apply to the current set of elements
  _elementDisposable = this._register(new DisposableStore());
  _lastHover;
  _lastQueryString;
  get onDidChangeFocus() {
    return Event.map(
      this._tree.onDidChangeFocus,
      (e) => e.elements.filter((e2) => e2 instanceof QuickPickItemElement).map((e2) => e2.item),
      this._store
    );
  }
  get onDidChangeSelection() {
    return Event.map(
      this._tree.onDidChangeSelection,
      (e) => ({
        items: e.elements.filter((e2) => e2 instanceof QuickPickItemElement).map((e2) => e2.item),
        event: e.browserEvent
      }),
      this._store
    );
  }
  get displayed() {
    return this._container.style.display !== "none";
  }
  set displayed(value) {
    this._container.style.display = value ? "" : "none";
  }
  get scrollTop() {
    return this._tree.scrollTop;
  }
  set scrollTop(scrollTop) {
    this._tree.scrollTop = scrollTop;
  }
  get ariaLabel() {
    return this._tree.ariaLabel;
  }
  set ariaLabel(label) {
    this._tree.ariaLabel = label ?? "";
  }
  set enabled(value) {
    this._tree.getHTMLElement().style.pointerEvents = value ? "" : "none";
  }
  _matchOnDescription = false;
  get matchOnDescription() {
    return this._matchOnDescription;
  }
  set matchOnDescription(value) {
    this._matchOnDescription = value;
  }
  _matchOnDetail = false;
  get matchOnDetail() {
    return this._matchOnDetail;
  }
  set matchOnDetail(value) {
    this._matchOnDetail = value;
  }
  _matchOnLabel = true;
  get matchOnLabel() {
    return this._matchOnLabel;
  }
  set matchOnLabel(value) {
    this._matchOnLabel = value;
  }
  _matchOnLabelMode = "fuzzy";
  get matchOnLabelMode() {
    return this._matchOnLabelMode;
  }
  set matchOnLabelMode(value) {
    this._matchOnLabelMode = value;
  }
  _matchOnMeta = true;
  get matchOnMeta() {
    return this._matchOnMeta;
  }
  set matchOnMeta(value) {
    this._matchOnMeta = value;
  }
  _sortByLabel = true;
  get sortByLabel() {
    return this._sortByLabel;
  }
  set sortByLabel(value) {
    this._sortByLabel = value;
  }
  _shouldLoop = true;
  get shouldLoop() {
    return this._shouldLoop;
  }
  set shouldLoop(value) {
    this._shouldLoop = value;
  }
  //#endregion
  //#region register listeners
  _registerListeners() {
    this._registerOnKeyDown();
    this._registerOnContainerClick();
    this._registerOnMouseMiddleClick();
    this._registerOnTreeModelChanged();
    this._registerOnElementChecked();
    this._registerOnContextMenu();
    this._registerHoverListeners();
    this._registerSelectionChangeListener();
    this._registerSeparatorActionShowingListeners();
  }
  _registerOnKeyDown() {
    this._register(this._tree.onKeyDown((e) => {
      const event = new StandardKeyboardEvent(e);
      switch (event.keyCode) {
        case KeyCode.Space:
          this.toggleCheckbox();
          break;
      }
      this._onKeyDown.fire(event);
    }));
  }
  _registerOnContainerClick() {
    this._register(dom.addDisposableListener(this._container, dom.EventType.CLICK, (e) => {
      if (e.x || e.y) {
        this._onLeave.fire();
      }
    }));
  }
  _registerOnMouseMiddleClick() {
    this._register(dom.addDisposableListener(this._container, dom.EventType.AUXCLICK, (e) => {
      if (e.button === 1) {
        this._onLeave.fire();
      }
    }));
  }
  _registerOnTreeModelChanged() {
    this._register(this._tree.onDidChangeModel(() => {
      const visibleCount = this._itemElements.filter((e) => !e.hidden).length;
      this._visibleCountObservable.set(visibleCount, void 0);
      if (this._hasCheckboxes) {
        this._updateCheckedObservables();
      }
    }));
  }
  _registerOnElementChecked() {
    this._register(this._elementCheckedEventBufferer.wrapEvent(this._elementChecked.event, (_, e) => e)((_) => this._updateCheckedObservables()));
  }
  _registerOnContextMenu() {
    this._register(this._tree.onContextMenu((e) => {
      if (e.element) {
        e.browserEvent.preventDefault();
        this._tree.setSelection([e.element]);
      }
    }));
  }
  _registerHoverListeners() {
    const delayer = this._register(new ThrottledDelayer(typeof this.hoverDelegate.delay === "function" ? this.hoverDelegate.delay() : this.hoverDelegate.delay));
    this._register(this._tree.onMouseOver(async (e) => {
      if (dom.isHTMLAnchorElement(e.browserEvent.target)) {
        delayer.cancel();
        return;
      }
      if (
        // anchors are an exception as called out above so we skip them here
        !dom.isHTMLAnchorElement(e.browserEvent.relatedTarget) && // check if the mouse is still over the same element
        dom.isAncestor(e.browserEvent.relatedTarget, e.element?.element)
      ) {
        return;
      }
      try {
        await delayer.trigger(async () => {
          if (e.element instanceof QuickPickItemElement) {
            this.showHover(e.element);
          }
        });
      } catch (e2) {
        if (!isCancellationError(e2)) {
          throw e2;
        }
      }
    }));
    this._register(this._tree.onMouseOut((e) => {
      if (dom.isAncestor(e.browserEvent.relatedTarget, e.element?.element)) {
        return;
      }
      delayer.cancel();
    }));
  }
  /**
   * Register's focus change and mouse events so that we can track when items inside of a
   * separator's section are focused or hovered so that we can display the separator's actions
   */
  _registerSeparatorActionShowingListeners() {
    this._register(this._tree.onDidChangeFocus((e) => {
      const parent = e.elements[0] ? this._tree.getParentElement(e.elements[0]) : null;
      for (const separator of this._separatorRenderer.visibleSeparators) {
        const value = separator === parent;
        const currentActive = !!(separator.focusInsideSeparator & 2 /* ACTIVE_ITEM */);
        if (currentActive !== value) {
          if (value) {
            separator.focusInsideSeparator |= 2 /* ACTIVE_ITEM */;
          } else {
            separator.focusInsideSeparator &= ~2 /* ACTIVE_ITEM */;
          }
          this._tree.rerender(separator);
        }
      }
    }));
    this._register(this._tree.onMouseOver((e) => {
      const parent = e.element ? this._tree.getParentElement(e.element) : null;
      for (const separator of this._separatorRenderer.visibleSeparators) {
        if (separator !== parent) {
          continue;
        }
        const currentMouse = !!(separator.focusInsideSeparator & 1 /* MOUSE_HOVER */);
        if (!currentMouse) {
          separator.focusInsideSeparator |= 1 /* MOUSE_HOVER */;
          this._tree.rerender(separator);
        }
      }
    }));
    this._register(this._tree.onMouseOut((e) => {
      const parent = e.element ? this._tree.getParentElement(e.element) : null;
      for (const separator of this._separatorRenderer.visibleSeparators) {
        if (separator !== parent) {
          continue;
        }
        const currentMouse = !!(separator.focusInsideSeparator & 1 /* MOUSE_HOVER */);
        if (currentMouse) {
          separator.focusInsideSeparator &= ~1 /* MOUSE_HOVER */;
          this._tree.rerender(separator);
        }
      }
    }));
  }
  _registerSelectionChangeListener() {
    this._register(this._tree.onDidChangeSelection((e) => {
      const elementsWithoutSeparators = e.elements.filter((e2) => e2 instanceof QuickPickItemElement);
      if (elementsWithoutSeparators.length !== e.elements.length) {
        if (e.elements.length === 1 && e.elements[0] instanceof QuickPickSeparatorElement) {
          this._tree.setFocus([e.elements[0].children[0]]);
          this._tree.reveal(e.elements[0], 0);
        }
        this._tree.setSelection(elementsWithoutSeparators);
      }
    }));
  }
  //#endregion
  //#region public methods
  setAllVisibleChecked(checked) {
    this._elementCheckedEventBufferer.bufferEvents(() => {
      this._itemElements.forEach((element) => {
        if (!element.hidden && !element.checkboxDisabled && element.item.pickable !== false) {
          element.checked = checked;
        }
      });
    });
  }
  setElements(inputElements) {
    this._elementDisposable.clear();
    this._lastQueryString = void 0;
    this._inputElements = inputElements;
    this._hasCheckboxes = this.parent.classList.contains("show-checkboxes");
    let currentSeparatorElement;
    this._itemElements = new Array();
    this._elementTree = inputElements.reduce((result, item, index) => {
      let element;
      if (item.type === "separator") {
        if (!item.buttons) {
          return result;
        }
        currentSeparatorElement = new QuickPickSeparatorElement(
          index,
          (e) => this._onSeparatorButtonTriggered.fire(e),
          item
        );
        element = currentSeparatorElement;
      } else {
        const previous = index > 0 ? inputElements[index - 1] : void 0;
        let separator;
        if (previous && previous.type === "separator" && !previous.buttons) {
          currentSeparatorElement = void 0;
          separator = previous;
        }
        const qpi = new QuickPickItemElement(
          index,
          this._hasCheckboxes,
          (e) => this._onButtonTriggered.fire(e),
          this._elementChecked,
          item,
          separator
        );
        this._itemElements.push(qpi);
        if (currentSeparatorElement) {
          currentSeparatorElement.children.push(qpi);
          return result;
        }
        element = qpi;
      }
      result.push(element);
      return result;
    }, new Array());
    this._setElementsToTree(this._elementTree);
    if (this.accessibilityService.isScreenReaderOptimized()) {
      setTimeout(() => {
        const focusedElement = this._tree.getHTMLElement().querySelector(`.monaco-list-row.focused`);
        const parent = focusedElement?.parentNode;
        if (focusedElement && parent) {
          const nextSibling = focusedElement.nextSibling;
          focusedElement.remove();
          parent.insertBefore(focusedElement, nextSibling);
        }
      }, 0);
    }
  }
  setFocusedElements(items) {
    const elements = items.map((item) => this._itemElements.find((e) => e.item === item)).filter((e) => !!e).filter((e) => !e.hidden);
    this._tree.setFocus(elements);
    if (items.length > 0) {
      const focused = this._tree.getFocus()[0];
      if (focused) {
        this._tree.reveal(focused);
      }
    }
  }
  getActiveDescendant() {
    return this._tree.getHTMLElement().getAttribute("aria-activedescendant");
  }
  setSelectedElements(items) {
    const elements = items.map((item) => this._itemElements.find((e) => e.item === item)).filter((e) => !!e);
    this._tree.setSelection(elements);
  }
  getCheckedElements() {
    return this._itemElements.filter((e) => e.checked).map((e) => e.item);
  }
  setCheckedElements(items) {
    this._elementCheckedEventBufferer.bufferEvents(() => {
      const checked = /* @__PURE__ */ new Set();
      for (const item of items) {
        checked.add(item);
      }
      for (const element of this._itemElements) {
        element.checked = checked.has(element.item);
      }
    });
  }
  focus(what) {
    if (!this._itemElements.length) {
      return;
    }
    if (what === QuickPickFocus.Second && this._itemElements.length < 2) {
      what = QuickPickFocus.First;
    }
    switch (what) {
      case QuickPickFocus.First:
        this._tree.scrollTop = 0;
        this._tree.focusFirst(void 0, (e) => e.element instanceof QuickPickItemElement);
        break;
      case QuickPickFocus.Second: {
        this._tree.scrollTop = 0;
        let isSecondItem = false;
        this._tree.focusFirst(void 0, (e) => {
          if (!(e.element instanceof QuickPickItemElement)) {
            return false;
          }
          if (isSecondItem) {
            return true;
          }
          isSecondItem = !isSecondItem;
          return false;
        });
        break;
      }
      case QuickPickFocus.Last:
        this._tree.scrollTop = this._tree.scrollHeight;
        this._tree.focusLast(void 0, (e) => e.element instanceof QuickPickItemElement);
        break;
      case QuickPickFocus.Next: {
        const prevFocus = this._tree.getFocus();
        this._tree.focusNext(void 0, this._shouldLoop, void 0, (e) => {
          if (!(e.element instanceof QuickPickItemElement)) {
            return false;
          }
          this._tree.reveal(e.element);
          return true;
        });
        const currentFocus = this._tree.getFocus();
        if (prevFocus.length && prevFocus[0] === currentFocus[0]) {
          this._onLeave.fire();
        }
        break;
      }
      case QuickPickFocus.Previous: {
        const prevFocus = this._tree.getFocus();
        this._tree.focusPrevious(void 0, this._shouldLoop, void 0, (e) => {
          if (!(e.element instanceof QuickPickItemElement)) {
            return false;
          }
          const parent = this._tree.getParentElement(e.element);
          if (parent === null || parent.children[0] !== e.element) {
            this._tree.reveal(e.element);
          } else {
            this._tree.reveal(parent);
          }
          return true;
        });
        const currentFocus = this._tree.getFocus();
        if (prevFocus.length && prevFocus[0] === currentFocus[0]) {
          this._onLeave.fire();
        }
        break;
      }
      case QuickPickFocus.NextPage:
        this._tree.focusNextPage(void 0, (e) => {
          if (!(e.element instanceof QuickPickItemElement)) {
            return false;
          }
          this._tree.reveal(e.element);
          return true;
        });
        break;
      case QuickPickFocus.PreviousPage:
        this._tree.focusPreviousPage(void 0, (e) => {
          if (!(e.element instanceof QuickPickItemElement)) {
            return false;
          }
          const parent = this._tree.getParentElement(e.element);
          if (parent === null || parent.children[0] !== e.element) {
            this._tree.reveal(e.element);
          } else {
            this._tree.reveal(parent);
          }
          return true;
        });
        break;
      case QuickPickFocus.NextSeparator: {
        let foundSeparatorAsItem = false;
        const before = this._tree.getFocus()[0];
        this._tree.focusNext(void 0, true, void 0, (e) => {
          if (foundSeparatorAsItem) {
            return true;
          }
          if (e.element instanceof QuickPickSeparatorElement) {
            foundSeparatorAsItem = true;
            if (this._separatorRenderer.isSeparatorVisible(e.element)) {
              this._tree.reveal(e.element.children[0]);
            } else {
              this._tree.reveal(e.element, 0);
            }
          } else if (e.element instanceof QuickPickItemElement) {
            if (e.element.separator) {
              if (this._itemRenderer.isItemWithSeparatorVisible(e.element)) {
                this._tree.reveal(e.element);
              } else {
                this._tree.reveal(e.element, 0);
              }
              return true;
            } else if (e.element === this._elementTree[0]) {
              this._tree.reveal(e.element, 0);
              return true;
            }
          }
          return false;
        });
        const after = this._tree.getFocus()[0];
        if (before === after) {
          this._tree.scrollTop = this._tree.scrollHeight;
          this._tree.focusLast(void 0, (e) => e.element instanceof QuickPickItemElement);
        }
        break;
      }
      case QuickPickFocus.PreviousSeparator: {
        let focusElement;
        let foundSeparator = !!this._tree.getFocus()[0]?.separator;
        this._tree.focusPrevious(void 0, true, void 0, (e) => {
          if (e.element instanceof QuickPickSeparatorElement) {
            if (foundSeparator) {
              if (!focusElement) {
                if (this._separatorRenderer.isSeparatorVisible(e.element)) {
                  this._tree.reveal(e.element);
                } else {
                  this._tree.reveal(e.element, 0);
                }
                focusElement = e.element.children[0];
              }
            } else {
              foundSeparator = true;
            }
          } else if (e.element instanceof QuickPickItemElement) {
            if (!focusElement) {
              if (e.element.separator) {
                if (this._itemRenderer.isItemWithSeparatorVisible(e.element)) {
                  this._tree.reveal(e.element);
                } else {
                  this._tree.reveal(e.element, 0);
                }
                focusElement = e.element;
              } else if (e.element === this._elementTree[0]) {
                this._tree.reveal(e.element, 0);
                return true;
              }
            }
          }
          return false;
        });
        if (focusElement) {
          this._tree.setFocus([focusElement]);
        }
        break;
      }
    }
  }
  clearFocus() {
    this._tree.setFocus([]);
  }
  domFocus() {
    this._tree.domFocus();
  }
  layout(maxHeight) {
    this._tree.getHTMLElement().style.maxHeight = maxHeight ? `${// Make sure height aligns with list item heights
    Math.floor(maxHeight / 44) * 44 + 6}px` : "";
    this._tree.layout();
  }
  filter(query) {
    this._lastQueryString = query;
    if (!(this._sortByLabel || this._matchOnLabel || this._matchOnDescription || this._matchOnDetail)) {
      this._tree.layout();
      return false;
    }
    const queryWithWhitespace = query;
    query = query.trim();
    if (!query || !(this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
      this._itemElements.forEach((element) => {
        element.labelHighlights = void 0;
        element.descriptionHighlights = void 0;
        element.detailHighlights = void 0;
        element.hidden = false;
        const previous = element.index && this._inputElements[element.index - 1];
        if (element.item) {
          element.separator = previous && previous.type === "separator" && !previous.buttons ? previous : void 0;
        }
      });
    } else {
      let currentSeparator;
      this._itemElements.forEach((element) => {
        let labelHighlights;
        if (this.matchOnLabelMode === "fuzzy") {
          labelHighlights = this.matchOnLabel ? matchesFuzzyIconAware(query, parseLabelWithIcons(element.saneLabel)) ?? void 0 : void 0;
        } else {
          labelHighlights = this.matchOnLabel ? matchesContiguousIconAware(queryWithWhitespace, parseLabelWithIcons(element.saneLabel)) ?? void 0 : void 0;
        }
        const descriptionHighlights = this.matchOnDescription ? matchesFuzzyIconAware(query, parseLabelWithIcons(element.saneDescription || "")) ?? void 0 : void 0;
        const detailHighlights = this.matchOnDetail ? matchesFuzzyIconAware(query, parseLabelWithIcons(element.saneDetail || "")) ?? void 0 : void 0;
        if (labelHighlights || descriptionHighlights || detailHighlights) {
          element.labelHighlights = labelHighlights;
          element.descriptionHighlights = descriptionHighlights;
          element.detailHighlights = detailHighlights;
          element.hidden = false;
        } else {
          element.labelHighlights = void 0;
          element.descriptionHighlights = void 0;
          element.detailHighlights = void 0;
          element.hidden = element.item ? !element.item.alwaysShow : true;
        }
        if (element.item) {
          element.separator = void 0;
        } else if (element.separator) {
          element.hidden = true;
        }
        if (!this.sortByLabel) {
          const previous = element.index && this._inputElements[element.index - 1] || void 0;
          if (previous?.type === "separator" && !previous.buttons) {
            currentSeparator = previous;
          }
          if (currentSeparator && !element.hidden) {
            element.separator = currentSeparator;
            currentSeparator = void 0;
          }
        }
      });
    }
    this._setElementsToTree(
      this._sortByLabel && query ? this._itemElements : this._elementTree
    );
    this._tree.layout();
    return true;
  }
  toggleCheckbox() {
    this._elementCheckedEventBufferer.bufferEvents(() => {
      const elements = this._tree.getFocus().filter((e) => e instanceof QuickPickItemElement);
      const allChecked = this._allVisibleChecked(elements);
      for (const element of elements) {
        if (!element.checkboxDisabled) {
          element.checked = !allChecked;
        }
      }
    });
  }
  style(styles) {
    this._tree.style(styles);
  }
  toggleHover() {
    const focused = this._tree.getFocus()[0];
    if (!focused?.saneTooltip || !(focused instanceof QuickPickItemElement)) {
      return;
    }
    if (this._lastHover && !this._lastHover.isDisposed) {
      this._lastHover.dispose();
      return;
    }
    this.showHover(focused);
    const store = new DisposableStore();
    store.add(this._tree.onDidChangeFocus((e) => {
      if (e.elements[0] instanceof QuickPickItemElement) {
        this.showHover(e.elements[0]);
      }
    }));
    if (this._lastHover) {
      store.add(this._lastHover);
    }
    this._elementDisposable.add(store);
  }
  //#endregion
  //#region private methods
  _setElementsToTree(elements) {
    const treeElements = new Array();
    for (const element of elements) {
      if (element instanceof QuickPickSeparatorElement) {
        treeElements.push({
          element,
          collapsible: false,
          collapsed: false,
          children: element.children.map((e) => ({
            element: e,
            collapsible: false,
            collapsed: false
          }))
        });
      } else {
        treeElements.push({
          element,
          collapsible: false,
          collapsed: false
        });
      }
    }
    this._tree.setChildren(null, treeElements);
  }
  _allVisibleChecked(elements, whenNoneVisible = true) {
    for (let i = 0, n = elements.length; i < n; i++) {
      const element = elements[i];
      if (!element.hidden && element.item.pickable !== false) {
        if (!element.checked) {
          return false;
        } else {
          whenNoneVisible = true;
        }
      }
    }
    return whenNoneVisible;
  }
  _updateCheckedObservables() {
    transaction((tx) => {
      this._allVisibleCheckedObservable.set(this._allVisibleChecked(this._itemElements, false), tx);
      const checkedCount = this._itemElements.filter((element) => element.checked).length;
      this._checkedCountObservable.set(checkedCount, tx);
      this._checkedElementsObservable.set(this.getCheckedElements(), tx);
    });
  }
  /**
   * Disposes of the hover and shows a new one for the given index if it has a tooltip.
   * @param element The element to show the hover for
   */
  showHover(element) {
    if (this._lastHover && !this._lastHover.isDisposed) {
      this.hoverDelegate.onDidHideHover?.();
      this._lastHover?.dispose();
    }
    if (!element.element || !element.saneTooltip) {
      return;
    }
    this._lastHover = this.hoverDelegate.showHover({
      content: element.saneTooltip,
      target: element.element,
      linkHandler: /* @__PURE__ */ __name((url) => {
        this.linkOpenerDelegate(url);
      }, "linkHandler"),
      appearance: {
        showPointer: true
      },
      container: this._container,
      position: {
        hoverPosition: HoverPosition.RIGHT
      }
    }, false);
  }
};
__decorateClass([
  memoize
], QuickInputTree.prototype, "onDidChangeFocus", 1);
__decorateClass([
  memoize
], QuickInputTree.prototype, "onDidChangeSelection", 1);
QuickInputTree = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IAccessibilityService)
], QuickInputTree);
function matchesContiguousIconAware(query, target) {
  const { text, iconOffsets } = target;
  if (!iconOffsets || iconOffsets.length === 0) {
    return matchesContiguous(query, text);
  }
  const wordToMatchAgainstWithoutIconsTrimmed = ltrim(text, " ");
  const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
  const matches = matchesContiguous(query, wordToMatchAgainstWithoutIconsTrimmed);
  if (matches) {
    for (const match of matches) {
      const iconOffset = iconOffsets[match.start + leadingWhitespaceOffset] + leadingWhitespaceOffset;
      match.start += iconOffset;
      match.end += iconOffset;
    }
  }
  return matches;
}
__name(matchesContiguousIconAware, "matchesContiguousIconAware");
function matchesContiguous(word, wordToMatchAgainst) {
  const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
  if (matchIndex !== -1) {
    return [{ start: matchIndex, end: matchIndex + word.length }];
  }
  return null;
}
__name(matchesContiguous, "matchesContiguous");
function compareEntries(elementA, elementB, lookFor) {
  const labelHighlightsA = elementA.labelHighlights || [];
  const labelHighlightsB = elementB.labelHighlights || [];
  if (labelHighlightsA.length && !labelHighlightsB.length) {
    return -1;
  }
  if (!labelHighlightsA.length && labelHighlightsB.length) {
    return 1;
  }
  if (labelHighlightsA.length === 0 && labelHighlightsB.length === 0) {
    return 0;
  }
  return compareAnything(elementA.saneSortLabel, elementB.saneSortLabel, lookFor);
}
__name(compareEntries, "compareEntries");
export {
  QuickInputTree
};
//# sourceMappingURL=quickInputTree.js.map
