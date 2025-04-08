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
import "./media/paneviewlet.css";
import * as nls from "../../../../nls.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { asCssVariable, foreground } from "../../../../platform/theme/common/colorRegistry.js";
import { after, append, $, trackFocus, EventType, addDisposableListener, Dimension, reset, isAncestorOfActiveElement, isActiveElement } from "../../../../base/browser/dom.js";
import { createCSSRule } from "../../../../base/browser/domStylesheets.js";
import { asCssValueWithDefault, asCSSUrl } from "../../../../base/browser/cssValue.js";
import { DisposableMap, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { Action, IAction, IActionRunner } from "../../../../base/common/actions.js";
import { ActionsOrientation, IActionViewItem, prepareActions } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IPaneOptions, Pane, IPaneStyles } from "../../../../base/browser/ui/splitview/paneview.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Extensions as ViewContainerExtensions, IView, IViewDescriptorService, ViewContainerLocation, IViewsRegistry, IViewContentDescriptor, defaultViewIcon, ViewContainerLocationToString } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { assertIsDefined, PartialExcept } from "../../../../base/common/types.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { MenuId, Action2, IAction2Options, SubmenuItemAction } from "../../../../platform/actions/common/actions.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { Orientation } from "../../../../base/browser/ui/sash/sash.js";
import { ProgressBar } from "../../../../base/browser/ui/progressbar/progressbar.js";
import { AbstractProgressScope, ScopedProgressIndicator } from "../../../services/progress/browser/progressIndicator.js";
import { IProgressIndicator } from "../../../../platform/progress/common/progress.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { ScrollbarVisibility } from "../../../../base/common/scrollable.js";
import { URI } from "../../../../base/common/uri.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { CompositeMenuActions } from "../../actions.js";
import { IDropdownMenuActionViewItemOptions } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { FilterWidget, IFilterWidgetOptions } from "./viewFilter.js";
import { BaseActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { defaultButtonStyles, defaultProgressBarStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IListStyles } from "../../../../base/browser/ui/list/listWidget.js";
import { PANEL_BACKGROUND, PANEL_SECTION_DRAG_AND_DROP_BACKGROUND, PANEL_STICKY_SCROLL_BACKGROUND, PANEL_STICKY_SCROLL_BORDER, PANEL_STICKY_SCROLL_SHADOW, SIDE_BAR_BACKGROUND, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, SIDE_BAR_STICKY_SCROLL_BACKGROUND, SIDE_BAR_STICKY_SCROLL_BORDER, SIDE_BAR_STICKY_SCROLL_SHADOW } from "../../../common/theme.js";
import { IAccessibleViewInformationService } from "../../../services/accessibility/common/accessibleViewInformationService.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
var ViewPaneShowActions = /* @__PURE__ */ ((ViewPaneShowActions2) => {
  ViewPaneShowActions2[ViewPaneShowActions2["Default"] = 0] = "Default";
  ViewPaneShowActions2[ViewPaneShowActions2["WhenExpanded"] = 1] = "WhenExpanded";
  ViewPaneShowActions2[ViewPaneShowActions2["Always"] = 2] = "Always";
  return ViewPaneShowActions2;
})(ViewPaneShowActions || {});
const VIEWPANE_FILTER_ACTION = new Action("viewpane.action.filter");
const viewPaneContainerExpandedIcon = registerIcon("view-pane-container-expanded", Codicon.chevronDown, nls.localize("viewPaneContainerExpandedIcon", "Icon for an expanded view pane container."));
const viewPaneContainerCollapsedIcon = registerIcon("view-pane-container-collapsed", Codicon.chevronRight, nls.localize("viewPaneContainerCollapsedIcon", "Icon for a collapsed view pane container."));
const viewsRegistry = Registry.as(ViewContainerExtensions.ViewsRegistry);
let ViewWelcomeController = class {
  constructor(container, delegate, instantiationService, openerService, contextKeyService, lifecycleService) {
    this.container = container;
    this.delegate = delegate;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.contextKeyService = contextKeyService;
    this.disposables.add(Event.runAndSubscribe(this.delegate.onDidChangeViewWelcomeState, () => this.onDidChangeViewWelcomeState()));
    this.disposables.add(lifecycleService.onWillShutdown(() => this.dispose()));
  }
  static {
    __name(this, "ViewWelcomeController");
  }
  defaultItem;
  items = [];
  get enabled() {
    return this._enabled;
  }
  _enabled = false;
  element;
  scrollableElement;
  disposables = new DisposableStore();
  enabledDisposables = this.disposables.add(new DisposableStore());
  renderDisposables = this.disposables.add(new DisposableStore());
  layout(height, width) {
    if (!this._enabled) {
      return;
    }
    this.element.style.height = `${height}px`;
    this.element.style.width = `${width}px`;
    this.element.classList.toggle("wide", width > 640);
    this.scrollableElement.scanDomNode();
  }
  focus() {
    if (!this._enabled) {
      return;
    }
    this.element.focus();
  }
  onDidChangeViewWelcomeState() {
    const enabled = this.delegate.shouldShowWelcome();
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    if (!enabled) {
      this.enabledDisposables.clear();
      return;
    }
    this.container.classList.add("welcome");
    const viewWelcomeContainer = append(this.container, $(".welcome-view"));
    this.element = $(".welcome-view-content", { tabIndex: 0 });
    this.scrollableElement = new DomScrollableElement(this.element, { alwaysConsumeMouseWheel: true, horizontal: ScrollbarVisibility.Hidden, vertical: ScrollbarVisibility.Visible });
    append(viewWelcomeContainer, this.scrollableElement.getDomNode());
    this.enabledDisposables.add(toDisposable(() => {
      this.container.classList.remove("welcome");
      this.scrollableElement.dispose();
      viewWelcomeContainer.remove();
      this.scrollableElement = void 0;
      this.element = void 0;
    }));
    this.contextKeyService.onDidChangeContext(this.onDidChangeContext, this, this.enabledDisposables);
    Event.chain(viewsRegistry.onDidChangeViewWelcomeContent, ($2) => $2.filter((id) => id === this.delegate.id))(this.onDidChangeViewWelcomeContent, this, this.enabledDisposables);
    this.onDidChangeViewWelcomeContent();
  }
  onDidChangeViewWelcomeContent() {
    const descriptors = viewsRegistry.getViewWelcomeContent(this.delegate.id);
    this.items = [];
    for (const descriptor of descriptors) {
      if (descriptor.when === "default") {
        this.defaultItem = { descriptor, visible: true };
      } else {
        const visible = descriptor.when ? this.contextKeyService.contextMatchesRules(descriptor.when) : true;
        this.items.push({ descriptor, visible });
      }
    }
    this.render();
  }
  onDidChangeContext() {
    let didChange = false;
    for (const item of this.items) {
      if (!item.descriptor.when || item.descriptor.when === "default") {
        continue;
      }
      const visible = this.contextKeyService.contextMatchesRules(item.descriptor.when);
      if (item.visible === visible) {
        continue;
      }
      item.visible = visible;
      didChange = true;
    }
    if (didChange) {
      this.render();
    }
  }
  render() {
    this.renderDisposables.clear();
    this.element.innerText = "";
    const contents = this.getContentDescriptors();
    if (contents.length === 0) {
      this.container.classList.remove("welcome");
      this.scrollableElement.scanDomNode();
      return;
    }
    let buttonsCount = 0;
    for (const { content, precondition, renderSecondaryButtons } of contents) {
      const lines = content.split("\n");
      for (let line of lines) {
        line = line.trim();
        if (!line) {
          continue;
        }
        const linkedText = parseLinkedText(line);
        if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== "string") {
          const node = linkedText.nodes[0];
          const buttonContainer = append(this.element, $(".button-container"));
          const button = new Button(buttonContainer, { title: node.title, supportIcons: true, secondary: renderSecondaryButtons && buttonsCount > 0 ? true : false, ...defaultButtonStyles });
          button.label = node.label;
          button.onDidClick((_) => {
            this.openerService.open(node.href, { allowCommands: true });
          }, null, this.renderDisposables);
          this.renderDisposables.add(button);
          buttonsCount++;
          if (precondition) {
            const updateEnablement = /* @__PURE__ */ __name(() => button.enabled = this.contextKeyService.contextMatchesRules(precondition), "updateEnablement");
            updateEnablement();
            const keys = new Set(precondition.keys());
            const onDidChangeContext = Event.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(keys));
            onDidChangeContext(updateEnablement, null, this.renderDisposables);
          }
        } else {
          const p = append(this.element, $("p"));
          for (const node of linkedText.nodes) {
            if (typeof node === "string") {
              append(p, ...renderLabelWithIcons(node));
            } else {
              const link = this.renderDisposables.add(this.instantiationService.createInstance(Link, p, node, {}));
              if (precondition && node.href.startsWith("command:")) {
                const updateEnablement = /* @__PURE__ */ __name(() => link.enabled = this.contextKeyService.contextMatchesRules(precondition), "updateEnablement");
                updateEnablement();
                const keys = new Set(precondition.keys());
                const onDidChangeContext = Event.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(keys));
                onDidChangeContext(updateEnablement, null, this.renderDisposables);
              }
            }
          }
        }
      }
    }
    this.container.classList.add("welcome");
    this.scrollableElement.scanDomNode();
  }
  getContentDescriptors() {
    const visibleItems = this.items.filter((v) => v.visible);
    if (visibleItems.length === 0 && this.defaultItem) {
      return [this.defaultItem.descriptor];
    }
    return visibleItems.map((v) => v.descriptor);
  }
  dispose() {
    this.disposables.dispose();
  }
};
ViewWelcomeController = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, ILifecycleService)
], ViewWelcomeController);
let ViewPane = class extends Pane {
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewInformationService) {
    super({ ...options, ...{ orientation: viewDescriptorService.getViewLocationById(options.id) === ViewContainerLocation.Panel ? Orientation.HORIZONTAL : Orientation.VERTICAL } });
    this.keybindingService = keybindingService;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.viewDescriptorService = viewDescriptorService;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.accessibleViewInformationService = accessibleViewInformationService;
    this.id = options.id;
    this._title = options.title;
    this._titleDescription = options.titleDescription;
    this._singleViewPaneContainerTitle = options.singleViewPaneContainerTitle;
    this.showActions = options.showActions ?? 0 /* Default */;
    this.scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
    this.scopedContextKeyService.createKey("view", this.id);
    const viewLocationKey = this.scopedContextKeyService.createKey("viewLocation", ViewContainerLocationToString(viewDescriptorService.getViewLocationById(this.id)));
    this._register(Event.filter(viewDescriptorService.onDidChangeLocation, (e) => e.views.some((view) => view.id === this.id))(() => viewLocationKey.set(ViewContainerLocationToString(viewDescriptorService.getViewLocationById(this.id)))));
    const childInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this.menuActions = this._register(childInstantiationService.createInstance(CompositeMenuActions, options.titleMenuId ?? MenuId.ViewTitle, MenuId.ViewTitleContext, { shouldForwardArgs: !options.donotForwardArgs, renderShortTitle: true }));
    this._register(this.menuActions.onDidChange(() => this.updateActions()));
  }
  static {
    __name(this, "ViewPane");
  }
  static AlwaysShowActionsConfig = "workbench.view.alwaysShowHeaderActions";
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  _onDidChangeBodyVisibility = this._register(new Emitter());
  onDidChangeBodyVisibility = this._onDidChangeBodyVisibility.event;
  _onDidChangeTitleArea = this._register(new Emitter());
  onDidChangeTitleArea = this._onDidChangeTitleArea.event;
  _onDidChangeViewWelcomeState = this._register(new Emitter());
  onDidChangeViewWelcomeState = this._onDidChangeViewWelcomeState.event;
  _isVisible = false;
  id;
  _title;
  get title() {
    return this._title;
  }
  _titleDescription;
  get titleDescription() {
    return this._titleDescription;
  }
  _singleViewPaneContainerTitle;
  get singleViewPaneContainerTitle() {
    return this._singleViewPaneContainerTitle;
  }
  menuActions;
  progressBar;
  progressIndicator;
  toolbar;
  showActions;
  headerContainer;
  titleContainer;
  titleContainerHover;
  titleDescriptionContainer;
  titleDescriptionContainerHover;
  iconContainer;
  iconContainerHover;
  twistiesContainer;
  viewWelcomeController;
  headerActionViewItems = this._register(new DisposableMap());
  scopedContextKeyService;
  get headerVisible() {
    return super.headerVisible;
  }
  set headerVisible(visible) {
    super.headerVisible = visible;
    this.element.classList.toggle("merged-header", !visible);
  }
  setVisible(visible) {
    if (this._isVisible !== visible) {
      this._isVisible = visible;
      if (this.isExpanded()) {
        this._onDidChangeBodyVisibility.fire(visible);
      }
    }
  }
  isVisible() {
    return this._isVisible;
  }
  isBodyVisible() {
    return this._isVisible && this.isExpanded();
  }
  setExpanded(expanded) {
    const changed = super.setExpanded(expanded);
    if (changed) {
      this._onDidChangeBodyVisibility.fire(expanded);
    }
    this.updateTwistyIcon();
    return changed;
  }
  render() {
    super.render();
    const focusTracker = trackFocus(this.element);
    this._register(focusTracker);
    this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
    this._register(focusTracker.onDidBlur(() => this._onDidBlur.fire()));
  }
  renderHeader(container) {
    this.headerContainer = container;
    this.twistiesContainer = append(container, $(`.twisty-container${ThemeIcon.asCSSSelector(this.getTwistyIcon(this.isExpanded()))}`));
    this.renderHeaderTitle(container, this.title);
    const actions = append(container, $(".actions"));
    actions.classList.toggle("show-always", this.showActions === 2 /* Always */);
    actions.classList.toggle("show-expanded", this.showActions === 1 /* WhenExpanded */);
    this.toolbar = this.instantiationService.createInstance(WorkbenchToolBar, actions, {
      orientation: ActionsOrientation.HORIZONTAL,
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        const item = this.createActionViewItem(action, options);
        if (item) {
          this.headerActionViewItems.set(item.action.id, item);
        }
        return item;
      }, "actionViewItemProvider"),
      ariaLabel: nls.localize("viewToolbarAriaLabel", "{0} actions", this.title),
      getKeyBinding: /* @__PURE__ */ __name((action) => this.keybindingService.lookupKeybinding(action.id), "getKeyBinding"),
      renderDropdownAsChildElement: true,
      actionRunner: this.getActionRunner(),
      resetMenu: this.menuActions.menuId
    });
    this._register(this.toolbar);
    this.setActions();
    this._register(addDisposableListener(actions, EventType.CLICK, (e) => e.preventDefault()));
    const viewContainerModel = this.viewDescriptorService.getViewContainerByViewId(this.id);
    if (viewContainerModel) {
      this._register(this.viewDescriptorService.getViewContainerModel(viewContainerModel).onDidChangeContainerInfo(({ title }) => this.updateTitle(this.title)));
    } else {
      console.error(`View container model not found for view ${this.id}`);
    }
    const onDidRelevantConfigurationChange = Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(ViewPane.AlwaysShowActionsConfig));
    this._register(onDidRelevantConfigurationChange(this.updateActionsVisibility, this));
    this.updateActionsVisibility();
  }
  updateHeader() {
    super.updateHeader();
    this.updateTwistyIcon();
  }
  updateTwistyIcon() {
    if (this.twistiesContainer) {
      this.twistiesContainer.classList.remove(...ThemeIcon.asClassNameArray(this.getTwistyIcon(!this._expanded)));
      this.twistiesContainer.classList.add(...ThemeIcon.asClassNameArray(this.getTwistyIcon(this._expanded)));
    }
  }
  getTwistyIcon(expanded) {
    return expanded ? viewPaneContainerExpandedIcon : viewPaneContainerCollapsedIcon;
  }
  style(styles) {
    super.style(styles);
    const icon = this.getIcon();
    if (this.iconContainer) {
      const fgColor = asCssValueWithDefault(styles.headerForeground, asCssVariable(foreground));
      if (URI.isUri(icon)) {
        this.iconContainer.style.backgroundColor = fgColor;
        this.iconContainer.style.color = "";
      } else {
        this.iconContainer.style.color = fgColor;
        this.iconContainer.style.backgroundColor = "";
      }
    }
  }
  getIcon() {
    return this.viewDescriptorService.getViewDescriptorById(this.id)?.containerIcon || defaultViewIcon;
  }
  renderHeaderTitle(container, title) {
    this.iconContainer = append(container, $(".icon", void 0));
    const icon = this.getIcon();
    let cssClass = void 0;
    if (URI.isUri(icon)) {
      cssClass = `view-${this.id.replace(/[\.\:]/g, "-")}`;
      const iconClass = `.pane-header .icon.${cssClass}`;
      createCSSRule(iconClass, `
				mask: ${asCSSUrl(icon)} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${asCSSUrl(icon)} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
			`);
    } else if (ThemeIcon.isThemeIcon(icon)) {
      cssClass = ThemeIcon.asClassName(icon);
    }
    if (cssClass) {
      this.iconContainer.classList.add(...cssClass.split(" "));
    }
    const calculatedTitle = this.calculateTitle(title);
    this.titleContainer = append(container, $("h3.title", {}, calculatedTitle));
    this.titleContainerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.titleContainer, calculatedTitle));
    if (this._titleDescription) {
      this.setTitleDescription(this._titleDescription);
    }
    this.iconContainerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.iconContainer, calculatedTitle));
    this.iconContainer.setAttribute("aria-label", this._getAriaLabel(calculatedTitle, this._titleDescription));
  }
  _getAriaLabel(title, description) {
    const viewHasAccessibilityHelpContent = this.viewDescriptorService.getViewDescriptorById(this.id)?.accessibilityHelpContent;
    const accessibleViewHasShownForView = this.accessibleViewInformationService?.hasShownAccessibleView(this.id);
    if (!viewHasAccessibilityHelpContent || accessibleViewHasShownForView) {
      if (description) {
        return `${title} - ${description}`;
      } else {
        return title;
      }
    }
    return nls.localize("viewAccessibilityHelp", "Use Alt+F1 for accessibility help {0}", title);
  }
  updateTitle(title) {
    const calculatedTitle = this.calculateTitle(title);
    if (this.titleContainer) {
      this.titleContainer.textContent = calculatedTitle;
      this.titleContainerHover?.update(calculatedTitle);
    }
    this.updateAriaHeaderLabel(calculatedTitle, this._titleDescription);
    this._title = title;
    this._onDidChangeTitleArea.fire();
  }
  updateAriaHeaderLabel(title, description) {
    const ariaLabel = this._getAriaLabel(title, description);
    if (this.iconContainer) {
      this.iconContainerHover?.update(title);
      this.iconContainer.setAttribute("aria-label", ariaLabel);
    }
    this.ariaHeaderLabel = this.getAriaHeaderLabel(ariaLabel);
  }
  setTitleDescription(description) {
    if (this.titleDescriptionContainer) {
      this.titleDescriptionContainer.textContent = description ?? "";
      this.titleDescriptionContainerHover?.update(description ?? "");
    } else if (description && this.titleContainer) {
      this.titleDescriptionContainer = after(this.titleContainer, $("span.description", {}, description));
      this.titleDescriptionContainerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.titleDescriptionContainer, description));
    }
  }
  updateTitleDescription(description) {
    this.setTitleDescription(description);
    this.updateAriaHeaderLabel(this._title, description);
    this._titleDescription = description;
    this._onDidChangeTitleArea.fire();
  }
  calculateTitle(title) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(this.id);
    const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
    const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(this.id);
    const isDefault = this.viewDescriptorService.getDefaultContainerById(this.id) === viewContainer;
    if (!isDefault && viewDescriptor?.containerTitle && model.title !== viewDescriptor.containerTitle) {
      return `${viewDescriptor.containerTitle}: ${title}`;
    }
    return title;
  }
  renderBody(container) {
    this.viewWelcomeController = this._register(this.instantiationService.createInstance(ViewWelcomeController, container, this));
  }
  layoutBody(height, width) {
    this.viewWelcomeController.layout(height, width);
  }
  onDidScrollRoot() {
  }
  getProgressIndicator() {
    if (this.progressBar === void 0) {
      this.progressBar = this._register(new ProgressBar(this.element, defaultProgressBarStyles));
      this.progressBar.hide();
    }
    if (this.progressIndicator === void 0) {
      const that = this;
      this.progressIndicator = this._register(new ScopedProgressIndicator(assertIsDefined(this.progressBar), new class extends AbstractProgressScope {
        constructor() {
          super(that.id, that.isBodyVisible());
          this._register(that.onDidChangeBodyVisibility((isVisible) => isVisible ? this.onScopeOpened(that.id) : this.onScopeClosed(that.id)));
        }
      }()));
    }
    return this.progressIndicator;
  }
  getProgressLocation() {
    return this.viewDescriptorService.getViewContainerByViewId(this.id).id;
  }
  getLocationBasedColors() {
    return getLocationBasedViewColors(this.viewDescriptorService.getViewLocationById(this.id));
  }
  focus() {
    if (this.viewWelcomeController.enabled) {
      this.viewWelcomeController.focus();
    } else if (this.element) {
      this.element.focus();
    }
    if (isActiveElement(this.element) || isAncestorOfActiveElement(this.element)) {
      this._onDidFocus.fire();
    }
  }
  setActions() {
    if (this.toolbar) {
      const primaryActions = [...this.menuActions.getPrimaryActions()];
      if (this.shouldShowFilterInHeader()) {
        primaryActions.unshift(VIEWPANE_FILTER_ACTION);
      }
      this.toolbar.setActions(prepareActions(primaryActions), prepareActions(this.menuActions.getSecondaryActions()));
      this.toolbar.context = this.getActionsContext();
    }
  }
  updateActionsVisibility() {
    if (!this.headerContainer) {
      return;
    }
    const shouldAlwaysShowActions = this.configurationService.getValue("workbench.view.alwaysShowHeaderActions");
    this.headerContainer.classList.toggle("actions-always-visible", shouldAlwaysShowActions);
  }
  updateActions() {
    this.setActions();
    this._onDidChangeTitleArea.fire();
  }
  createActionViewItem(action, options) {
    if (action.id === VIEWPANE_FILTER_ACTION.id) {
      const that = this;
      return new class extends BaseActionViewItem {
        constructor() {
          super(null, action);
        }
        setFocusable() {
        }
        get trapsArrowNavigation() {
          return true;
        }
        render(container) {
          container.classList.add("viewpane-filter-container");
          const filter = that.getFilterWidget();
          append(container, filter.element);
          filter.relayout();
        }
      }();
    }
    return createActionViewItem(this.instantiationService, action, { ...options, ...{ menuAsChild: action instanceof SubmenuItemAction } });
  }
  getActionsContext() {
    return void 0;
  }
  getActionRunner() {
    return void 0;
  }
  getOptimalWidth() {
    return 0;
  }
  saveState() {
  }
  shouldShowWelcome() {
    return false;
  }
  getFilterWidget() {
    return void 0;
  }
  shouldShowFilterInHeader() {
    return false;
  }
};
ViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], ViewPane);
let FilterViewPane = class extends ViewPane {
  static {
    __name(this, "FilterViewPane");
  }
  filterWidget;
  dimension;
  filterContainer;
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewService);
    const childInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this.filterWidget = this._register(childInstantiationService.createInstance(FilterWidget, options.filterOptions));
  }
  getFilterWidget() {
    return this.filterWidget;
  }
  renderBody(container) {
    super.renderBody(container);
    this.filterContainer = append(container, $(".viewpane-filter-container"));
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.dimension = new Dimension(width, height);
    const wasFilterShownInHeader = !this.filterContainer?.hasChildNodes();
    const shouldShowFilterInHeader = this.shouldShowFilterInHeader();
    if (wasFilterShownInHeader !== shouldShowFilterInHeader) {
      if (shouldShowFilterInHeader) {
        reset(this.filterContainer);
      }
      this.updateActions();
      if (!shouldShowFilterInHeader) {
        append(this.filterContainer, this.filterWidget.element);
      }
    }
    if (!shouldShowFilterInHeader) {
      height = height - 44;
    }
    this.filterWidget.layout(width);
    this.layoutBodyContent(height, width);
  }
  shouldShowFilterInHeader() {
    return !(this.dimension && this.dimension.width < 600 && this.dimension.height > 100);
  }
};
FilterViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], FilterViewPane);
function getLocationBasedViewColors(location) {
  let background, overlayBackground, stickyScrollBackground, stickyScrollBorder, stickyScrollShadow;
  switch (location) {
    case ViewContainerLocation.Panel:
      background = PANEL_BACKGROUND;
      overlayBackground = PANEL_SECTION_DRAG_AND_DROP_BACKGROUND;
      stickyScrollBackground = PANEL_STICKY_SCROLL_BACKGROUND;
      stickyScrollBorder = PANEL_STICKY_SCROLL_BORDER;
      stickyScrollShadow = PANEL_STICKY_SCROLL_SHADOW;
      break;
    case ViewContainerLocation.Sidebar:
    case ViewContainerLocation.AuxiliaryBar:
    default:
      background = SIDE_BAR_BACKGROUND;
      overlayBackground = SIDE_BAR_DRAG_AND_DROP_BACKGROUND;
      stickyScrollBackground = SIDE_BAR_STICKY_SCROLL_BACKGROUND;
      stickyScrollBorder = SIDE_BAR_STICKY_SCROLL_BORDER;
      stickyScrollShadow = SIDE_BAR_STICKY_SCROLL_SHADOW;
  }
  return {
    background,
    overlayBackground,
    listOverrideStyles: {
      listBackground: background,
      treeStickyScrollBackground: stickyScrollBackground,
      treeStickyScrollBorder: stickyScrollBorder,
      treeStickyScrollShadow: stickyScrollShadow
    }
  };
}
__name(getLocationBasedViewColors, "getLocationBasedViewColors");
class ViewAction extends Action2 {
  static {
    __name(this, "ViewAction");
  }
  desc;
  constructor(desc) {
    super(desc);
    this.desc = desc;
  }
  run(accessor, ...args) {
    const view = accessor.get(IViewsService).getActiveViewWithId(this.desc.viewId);
    if (view) {
      return this.runInView(accessor, view, ...args);
    }
    return void 0;
  }
}
export {
  FilterViewPane,
  VIEWPANE_FILTER_ACTION,
  ViewAction,
  ViewPane,
  ViewPaneShowActions,
  getLocationBasedViewColors
};
//# sourceMappingURL=viewPane.js.map
