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
var HistoryItemRenderer_1, HistoryItemLoadMoreRenderer_1;
import "./media/scm.css";
import * as platform from "../../../../base/common/platform.js";
import { $, append, h, reset } from "../../../../base/browser/dom.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { fromNow, safeIntl } from "../../../../base/common/date.js";
import { createMatches } from "../../../../base/common/filters.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, autorunWithStore, derived, observableValue, waitForState, constObservable, latestChangedValue, observableFromEvent, runOnChange, observableSignal } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService, WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { asCssVariable, foreground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ViewAction, ViewPane, ViewPaneShowActions } from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { renderSCMHistoryItemGraph, toISCMHistoryItemViewModelArray, SWIMLANE_WIDTH, renderSCMHistoryGraphPlaceholder, historyItemHoverDeletionsForeground, historyItemHoverLabelForeground, historyItemHoverAdditionsForeground, historyItemHoverDefaultLabelForeground, historyItemHoverDefaultLabelBackground } from "./scmHistory.js";
import { getHistoryItemEditorTitle, getProviderKey, isSCMHistoryItemLoadMoreTreeElement, isSCMHistoryItemViewModelTreeElement, isSCMRepository } from "./util.js";
import { HISTORY_VIEW_PANE_ID, ISCMService, ISCMViewService } from "../common/scm.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { Action2, IMenuService, isIMenuItem, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Sequencer, Throttler } from "../../../../base/common/async.js";
import { URI } from "../../../../base/common/uri.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import { delta, groupBy } from "../../../../base/common/arrays.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { ContextKeys } from "./scmViewPane.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { clamp } from "../../../../base/common/numbers.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { compare } from "../../../../base/common/strings.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { groupBy as groupBy2 } from "../../../../base/common/collections.js";
import { getFlatContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
const PICK_REPOSITORY_ACTION_ID = "workbench.scm.action.graph.pickRepository";
const PICK_HISTORY_ITEM_REFS_ACTION_ID = "workbench.scm.action.graph.pickHistoryItemRefs";
class SCMRepositoryActionViewItem extends ActionViewItem {
  static {
    __name(this, "SCMRepositoryActionViewItem");
  }
  constructor(_repository, action, options) {
    super(null, action, { ...options, icon: false, label: true });
    this._repository = _repository;
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.classList.add("scm-graph-repository-picker");
      const icon = $(".icon");
      icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.repo));
      const name = $(".name");
      name.textContent = this._repository.provider.name;
      reset(this.label, icon, name);
    }
  }
  getTooltip() {
    return this._repository.provider.name;
  }
}
class SCMHistoryItemRefsActionViewItem extends ActionViewItem {
  static {
    __name(this, "SCMHistoryItemRefsActionViewItem");
  }
  constructor(_repository, _historyItemsFilter, action, options) {
    super(null, action, { ...options, icon: false, label: true });
    this._repository = _repository;
    this._historyItemsFilter = _historyItemsFilter;
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.classList.add("scm-graph-history-item-picker");
      const icon = $(".icon");
      icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.gitBranch));
      const name = $(".name");
      if (this._historyItemsFilter === "all") {
        name.textContent = localize("all", "All");
      } else if (this._historyItemsFilter === "auto") {
        name.textContent = localize("auto", "Auto");
      } else if (this._historyItemsFilter.length === 1) {
        name.textContent = this._historyItemsFilter[0].name;
      } else {
        name.textContent = localize("items", "{0} Items", this._historyItemsFilter.length);
      }
      reset(this.label, icon, name);
    }
  }
  getTooltip() {
    if (this._historyItemsFilter === "all") {
      return localize("allHistoryItemRefs", "All history item references");
    } else if (this._historyItemsFilter === "auto") {
      const historyProvider = this._repository.provider.historyProvider.get();
      return [
        historyProvider?.historyItemRef.get()?.name,
        historyProvider?.historyItemRemoteRef.get()?.name,
        historyProvider?.historyItemBaseRef.get()?.name
      ].filter((ref) => !!ref).join(", ");
    } else if (this._historyItemsFilter.length === 1) {
      return this._historyItemsFilter[0].name;
    } else {
      return this._historyItemsFilter.map((ref) => ref.name).join(", ");
    }
  }
}
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: PICK_REPOSITORY_ACTION_ID,
      title: localize("repositoryPicker", "Repository Picker"),
      viewId: HISTORY_VIEW_PANE_ID,
      f1: false,
      menu: {
        id: MenuId.SCMHistoryTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.has("scm.providerCount"), ContextKeyExpr.greater("scm.providerCount", 1)),
        group: "navigation",
        order: 0
      }
    });
  }
  async runInView(_, view) {
    view.pickRepository();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: PICK_HISTORY_ITEM_REFS_ACTION_ID,
      title: localize("referencePicker", "History Item Reference Picker"),
      icon: Codicon.gitBranch,
      viewId: HISTORY_VIEW_PANE_ID,
      precondition: ContextKeys.SCMHistoryItemCount.notEqualsTo(0),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryTitle,
        group: "navigation",
        order: 1
      }
    });
  }
  async runInView(_, view) {
    view.pickHistoryItemRef();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "workbench.scm.action.graph.revealCurrentHistoryItem",
      title: localize("goToCurrentHistoryItem", "Go to Current History Item"),
      icon: Codicon.target,
      viewId: HISTORY_VIEW_PANE_ID,
      precondition: ContextKeyExpr.and(ContextKeys.SCMHistoryItemCount.notEqualsTo(0), ContextKeys.SCMCurrentHistoryItemRefInFilter.isEqualTo(true)),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryTitle,
        group: "navigation",
        order: 2
      }
    });
  }
  async runInView(_, view) {
    view.revealCurrentHistoryItem();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "workbench.scm.action.graph.refresh",
      title: localize("refreshGraph", "Refresh"),
      viewId: HISTORY_VIEW_PANE_ID,
      f1: false,
      icon: Codicon.refresh,
      menu: {
        id: MenuId.SCMHistoryTitle,
        group: "navigation",
        order: 1e3
      }
    });
  }
  async runInView(_, view) {
    view.refresh();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.viewChanges",
      title: localize("openChanges", "Open Changes"),
      f1: false,
      menu: [
        {
          id: MenuId.SCMHistoryItemContext,
          when: ContextKeyExpr.equals("config.multiDiffEditor.experimental.enabled", true),
          group: "0_view",
          order: 1
        }
      ]
    });
  }
  async run(accessor, provider, ...historyItems) {
    const commandService = accessor.get(ICommandService);
    if (!provider || historyItems.length === 0) {
      return;
    }
    const historyItem = historyItems[0];
    const historyItemLast = historyItems[historyItems.length - 1];
    const historyProvider = provider.historyProvider.get();
    if (historyItems.length > 1) {
      const ancestor = await historyProvider?.resolveHistoryItemRefsCommonAncestor([historyItem.id, historyItemLast.id]);
      if (!ancestor || ancestor !== historyItem.id && ancestor !== historyItemLast.id) {
        return;
      }
    }
    const historyItemParentId = historyItemLast.parentIds.length > 0 ? historyItemLast.parentIds[0] : void 0;
    const historyItemChanges = await historyProvider?.provideHistoryItemChanges(historyItem.id, historyItemParentId);
    if (!historyItemChanges?.length) {
      return;
    }
    const title = historyItems.length === 1 ? getHistoryItemEditorTitle(historyItem) : localize("historyItemChangesEditorTitle", "All Changes ({0} \u2194 {1})", historyItemLast.displayId ?? historyItemLast.id, historyItem.displayId ?? historyItem.id);
    const rootUri = provider.rootUri;
    const path = rootUri ? rootUri.path : provider.label;
    const multiDiffSourceUri = URI.from({ scheme: "scm-history-item", path: `${path}/${historyItemParentId}..${historyItem.id}` }, true);
    commandService.executeCommand("_workbench.openMultiDiffEditor", { title, multiDiffSourceUri, resources: historyItemChanges });
  }
});
class ListDelegate {
  static {
    __name(this, "ListDelegate");
  }
  getHeight() {
    return 22;
  }
  getTemplateId(element) {
    if (isSCMHistoryItemViewModelTreeElement(element)) {
      return HistoryItemRenderer.TEMPLATE_ID;
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      return HistoryItemLoadMoreRenderer.TEMPLATE_ID;
    } else {
      throw new Error("Unknown element");
    }
  }
}
let HistoryItemRenderer = class HistoryItemRenderer2 {
  static {
    __name(this, "HistoryItemRenderer");
  }
  static {
    HistoryItemRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "history-item";
  }
  get templateId() {
    return HistoryItemRenderer_1.TEMPLATE_ID;
  }
  constructor(hoverDelegate, _clipboardService, _configurationService, _contextKeyService, _hoverService, _menuService, _themeService) {
    this.hoverDelegate = hoverDelegate;
    this._clipboardService = _clipboardService;
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._hoverService = _hoverService;
    this._menuService = _menuService;
    this._themeService = _themeService;
    this._badgesConfig = observableConfigValue("scm.graph.badges", "filter", this._configurationService);
  }
  renderTemplate(container) {
    container.parentElement.parentElement.querySelector(".monaco-tl-twistie").classList.add("force-no-twistie");
    const element = append(container, $(".history-item"));
    const graphContainer = append(element, $(".graph-container"));
    const iconLabel = new IconLabel(element, { supportIcons: true, supportHighlights: true, supportDescriptionHighlights: true });
    const labelContainer = append(element, $(".label-container"));
    element.appendChild(labelContainer);
    return { element, graphContainer, label: iconLabel, labelContainer, elementDisposables: new DisposableStore(), disposables: new DisposableStore() };
  }
  renderElement(node, index, templateData, height) {
    const provider = node.element.repository.provider;
    const historyItemViewModel = node.element.historyItemViewModel;
    const historyItem = historyItemViewModel.historyItem;
    const historyItemHover = this._hoverService.setupManagedHover(this.hoverDelegate, templateData.element, this._getHoverContent(node.element), {
      actions: this._getHoverActions(provider, historyItem)
    });
    templateData.elementDisposables.add(historyItemHover);
    templateData.graphContainer.textContent = "";
    templateData.graphContainer.classList.toggle("current", historyItemViewModel.isCurrent);
    templateData.graphContainer.appendChild(renderSCMHistoryItemGraph(historyItemViewModel));
    const historyItemRef = provider.historyProvider.get()?.historyItemRef?.get();
    const extraClasses = historyItemRef?.revision === historyItem.id ? ["history-item-current"] : [];
    const [matches, descriptionMatches] = this._processMatches(historyItemViewModel, node.filterData);
    templateData.label.setLabel(historyItem.subject, historyItem.author, { matches, descriptionMatches, extraClasses });
    this._renderBadges(historyItem, templateData);
  }
  _renderBadges(historyItem, templateData) {
    templateData.elementDisposables.add(autorun((reader) => {
      const labelConfig = this._badgesConfig.read(reader);
      templateData.labelContainer.textContent = "";
      const references = historyItem.references ? historyItem.references.slice(0) : [];
      if (references.length > 0 && references[0].color) {
        this._renderBadge([references[0]], true, templateData);
        references.splice(0, 1);
      }
      const historyItemRefsByColor = groupBy2(references, (ref) => ref.color ? ref.color : "");
      for (const [key, historyItemRefs] of Object.entries(historyItemRefsByColor)) {
        if (key === "" && labelConfig !== "all") {
          continue;
        }
        const historyItemRefByIconId = groupBy2(historyItemRefs, (ref) => ThemeIcon.isThemeIcon(ref.icon) ? ref.icon.id : "");
        for (const [key2, historyItemRefs2] of Object.entries(historyItemRefByIconId)) {
          if (key2 === "") {
            continue;
          }
          this._renderBadge(historyItemRefs2, false, templateData);
        }
      }
    }));
  }
  _renderBadge(historyItemRefs, showDescription, templateData) {
    if (historyItemRefs.length === 0 || !ThemeIcon.isThemeIcon(historyItemRefs[0].icon)) {
      return;
    }
    const elements = h("div.label", {
      style: {
        color: historyItemRefs[0].color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(foreground),
        backgroundColor: historyItemRefs[0].color ? asCssVariable(historyItemRefs[0].color) : asCssVariable(historyItemHoverDefaultLabelBackground)
      }
    }, [
      h("div.count@count", {
        style: {
          display: historyItemRefs.length > 1 ? "" : "none"
        }
      }),
      h("div.icon@icon"),
      h("div.description@description", {
        style: {
          display: showDescription ? "" : "none"
        }
      })
    ]);
    elements.count.textContent = historyItemRefs.length > 1 ? historyItemRefs.length.toString() : "";
    elements.icon.classList.add(...ThemeIcon.asClassNameArray(historyItemRefs[0].icon));
    elements.description.textContent = showDescription ? historyItemRefs[0].name : "";
    append(templateData.labelContainer, elements.root);
  }
  _getHoverActions(provider, historyItem) {
    const actions = this._menuService.getMenuActions(MenuId.SCMHistoryItemHover, this._contextKeyService, {
      arg: provider,
      shouldForwardArgs: true
    }).flatMap((item) => item[1]);
    return [
      {
        commandId: "workbench.scm.action.graph.copyHistoryItemId",
        iconClass: "codicon.codicon-copy",
        label: historyItem.displayId ?? historyItem.id,
        run: /* @__PURE__ */ __name(() => this._clipboardService.writeText(historyItem.id), "run")
      },
      ...actions.map((action) => {
        const iconClass = ThemeIcon.isThemeIcon(action.item.icon) ? ThemeIcon.asClassNameArray(action.item.icon).join(".") : void 0;
        return {
          commandId: action.id,
          label: action.label,
          iconClass,
          run: /* @__PURE__ */ __name(() => action.run(historyItem), "run")
        };
      })
    ];
  }
  _getHoverContent(element) {
    const colorTheme = this._themeService.getColorTheme();
    const historyItem = element.historyItemViewModel.historyItem;
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    if (historyItem.author) {
      const icon = URI.isUri(historyItem.authorIcon) ? `![${historyItem.author}](${historyItem.authorIcon.toString()}|width=20,height=20)` : ThemeIcon.isThemeIcon(historyItem.authorIcon) ? `$(${historyItem.authorIcon.id})` : "$(account)";
      if (historyItem.authorEmail) {
        const emailTitle = localize("emailLinkTitle", "Email");
        markdown.appendMarkdown(`${icon} [**${historyItem.author}**](mailto:${historyItem.authorEmail} "${emailTitle} ${historyItem.author}")`);
      } else {
        markdown.appendMarkdown(`${icon} **${historyItem.author}**`);
      }
      if (historyItem.timestamp) {
        const dateFormatter = safeIntl.DateTimeFormat(platform.language, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" });
        markdown.appendMarkdown(`, $(history) ${fromNow(historyItem.timestamp, true, true)} (${dateFormatter.format(historyItem.timestamp)})`);
      }
      markdown.appendMarkdown("\n\n");
    }
    markdown.appendMarkdown(`${historyItem.message.replace(/\r\n|\r|\n/g, "\n\n")}

`);
    if (historyItem.statistics) {
      markdown.appendMarkdown(`---

`);
      markdown.appendMarkdown(`<span>${historyItem.statistics.files === 1 ? localize("fileChanged", "{0} file changed", historyItem.statistics.files) : localize("filesChanged", "{0} files changed", historyItem.statistics.files)}</span>`);
      if (historyItem.statistics.insertions) {
        const additionsForegroundColor = colorTheme.getColor(historyItemHoverAdditionsForeground);
        markdown.appendMarkdown(`,&nbsp;<span style="color:${additionsForegroundColor};">${historyItem.statistics.insertions === 1 ? localize("insertion", "{0} insertion{1}", historyItem.statistics.insertions, "(+)") : localize("insertions", "{0} insertions{1}", historyItem.statistics.insertions, "(+)")}</span>`);
      }
      if (historyItem.statistics.deletions) {
        const deletionsForegroundColor = colorTheme.getColor(historyItemHoverDeletionsForeground);
        markdown.appendMarkdown(`,&nbsp;<span style="color:${deletionsForegroundColor};">${historyItem.statistics.deletions === 1 ? localize("deletion", "{0} deletion{1}", historyItem.statistics.deletions, "(-)") : localize("deletions", "{0} deletions{1}", historyItem.statistics.deletions, "(-)")}</span>`);
      }
    }
    if ((historyItem.references ?? []).length > 0) {
      markdown.appendMarkdown(`

---

`);
      markdown.appendMarkdown((historyItem.references ?? []).map((ref) => {
        const labelIconId = ThemeIcon.isThemeIcon(ref.icon) ? ref.icon.id : "";
        const labelBackgroundColor = ref.color ? asCssVariable(ref.color) : asCssVariable(historyItemHoverDefaultLabelBackground);
        const labelForegroundColor = ref.color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(historyItemHoverDefaultLabelForeground);
        return `<span style="color:${labelForegroundColor};background-color:${labelBackgroundColor};border-radius:10px;">&nbsp;$(${labelIconId})&nbsp;${ref.name}&nbsp;&nbsp;</span>`;
      }).join("&nbsp;&nbsp;"));
    }
    return { markdown, markdownNotSupportedFallback: historyItem.message };
  }
  _processMatches(historyItemViewModel, filterData) {
    if (!filterData) {
      return [void 0, void 0];
    }
    return [
      historyItemViewModel.historyItem.message === filterData.label ? createMatches(filterData.score) : void 0,
      historyItemViewModel.historyItem.author === filterData.label ? createMatches(filterData.score) : void 0
    ];
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
HistoryItemRenderer = HistoryItemRenderer_1 = __decorate([
  __param(1, IClipboardService),
  __param(2, IConfigurationService),
  __param(3, IContextKeyService),
  __param(4, IHoverService),
  __param(5, IMenuService),
  __param(6, IThemeService)
], HistoryItemRenderer);
let HistoryItemLoadMoreRenderer = class HistoryItemLoadMoreRenderer2 {
  static {
    __name(this, "HistoryItemLoadMoreRenderer");
  }
  static {
    HistoryItemLoadMoreRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "historyItemLoadMore";
  }
  get templateId() {
    return HistoryItemLoadMoreRenderer_1.TEMPLATE_ID;
  }
  constructor(_isLoadingMore, _loadMoreCallback, _configurationService) {
    this._isLoadingMore = _isLoadingMore;
    this._loadMoreCallback = _loadMoreCallback;
    this._configurationService = _configurationService;
  }
  renderTemplate(container) {
    container.parentElement.parentElement.querySelector(".monaco-tl-twistie").classList.add("force-no-twistie");
    const element = append(container, $(".history-item-load-more"));
    const graphPlaceholder = append(element, $(".graph-placeholder"));
    const historyItemPlaceholderContainer = append(element, $(".history-item-placeholder"));
    const historyItemPlaceholderLabel = new IconLabel(historyItemPlaceholderContainer, { supportIcons: true });
    return { element, graphPlaceholder, historyItemPlaceholderContainer, historyItemPlaceholderLabel, elementDisposables: new DisposableStore(), disposables: new DisposableStore() };
  }
  renderElement(element, index, templateData, height) {
    templateData.graphPlaceholder.textContent = "";
    templateData.graphPlaceholder.style.width = `${SWIMLANE_WIDTH * (element.element.graphColumns.length + 1)}px`;
    templateData.graphPlaceholder.appendChild(renderSCMHistoryGraphPlaceholder(element.element.graphColumns));
    const pageOnScroll = this._configurationService.getValue("scm.graph.pageOnScroll") === true;
    templateData.historyItemPlaceholderContainer.classList.toggle("shimmer", pageOnScroll);
    if (pageOnScroll) {
      templateData.historyItemPlaceholderLabel.setLabel("");
      this._loadMoreCallback();
    } else {
      templateData.elementDisposables.add(autorun((reader) => {
        const isLoadingMore = this._isLoadingMore.read(reader);
        const icon = `$(${isLoadingMore ? "loading~spin" : "fold-down"})`;
        templateData.historyItemPlaceholderLabel.setLabel(localize("loadMore", "{0} Load More...", icon));
      }));
    }
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
HistoryItemLoadMoreRenderer = HistoryItemLoadMoreRenderer_1 = __decorate([
  __param(2, IConfigurationService)
], HistoryItemLoadMoreRenderer);
let HistoryItemHoverDelegate = class HistoryItemHoverDelegate2 extends WorkbenchHoverDelegate {
  static {
    __name(this, "HistoryItemHoverDelegate");
  }
  constructor(_viewContainerLocation, layoutService, configurationService, hoverService) {
    super("element", { instantHover: true }, () => this.getHoverOptions(), configurationService, hoverService);
    this._viewContainerLocation = _viewContainerLocation;
    this.layoutService = layoutService;
  }
  getHoverOptions() {
    const sideBarPosition = this.layoutService.getSideBarPosition();
    let hoverPosition;
    if (this._viewContainerLocation === 0) {
      hoverPosition = sideBarPosition === 0 ? 1 : 0;
    } else if (this._viewContainerLocation === 2) {
      hoverPosition = sideBarPosition === 0 ? 0 : 1;
    } else {
      hoverPosition = 1;
    }
    return { additionalClasses: ["history-item-hover"], position: { hoverPosition, forcePosition: true } };
  }
};
HistoryItemHoverDelegate = __decorate([
  __param(1, IWorkbenchLayoutService),
  __param(2, IConfigurationService),
  __param(3, IHoverService)
], HistoryItemHoverDelegate);
let SCMHistoryViewPaneActionRunner = class SCMHistoryViewPaneActionRunner2 extends ActionRunner {
  static {
    __name(this, "SCMHistoryViewPaneActionRunner");
  }
  constructor(_progressService) {
    super();
    this._progressService = _progressService;
  }
  runAction(action, context) {
    return this._progressService.withProgress({ location: HISTORY_VIEW_PANE_ID }, async () => await super.runAction(action, context));
  }
};
SCMHistoryViewPaneActionRunner = __decorate([
  __param(0, IProgressService)
], SCMHistoryViewPaneActionRunner);
class SCMHistoryTreeAccessibilityProvider {
  static {
    __name(this, "SCMHistoryTreeAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("scm history", "Source Control History");
  }
  getAriaLabel(element) {
    if (isSCMRepository(element)) {
      return `${element.provider.name} ${element.provider.label}`;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      const historyItem = element.historyItemViewModel.historyItem;
      return `${stripIcons(historyItem.message).trim()}${historyItem.author ? `, ${historyItem.author}` : ""}`;
    } else {
      return "";
    }
  }
}
class SCMHistoryTreeIdentityProvider {
  static {
    __name(this, "SCMHistoryTreeIdentityProvider");
  }
  getId(element) {
    if (isSCMRepository(element)) {
      const provider = element.provider;
      return `repo:${provider.id}`;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      const provider = element.repository.provider;
      const historyItem = element.historyItemViewModel.historyItem;
      return `historyItem:${provider.id}/${historyItem.id}/${historyItem.parentIds.join(",")}`;
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      const provider = element.repository.provider;
      return `historyItemLoadMore:${provider.id}}`;
    } else {
      throw new Error("Invalid tree element");
    }
  }
}
class SCMHistoryTreeKeyboardNavigationLabelProvider {
  static {
    __name(this, "SCMHistoryTreeKeyboardNavigationLabelProvider");
  }
  getKeyboardNavigationLabel(element) {
    if (isSCMRepository(element)) {
      return void 0;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      return [element.historyItemViewModel.historyItem.message, element.historyItemViewModel.historyItem.author];
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      return "";
    } else {
      throw new Error("Invalid tree element");
    }
  }
}
class SCMHistoryTreeDataSource extends Disposable {
  static {
    __name(this, "SCMHistoryTreeDataSource");
  }
  async getChildren(inputOrElement) {
    if (!(inputOrElement instanceof SCMHistoryViewModel)) {
      return [];
    }
    const children = [];
    const historyItems = await inputOrElement.getHistoryItems();
    children.push(...historyItems);
    const repository = inputOrElement.repository.get();
    const lastHistoryItem = historyItems.at(-1);
    if (repository && lastHistoryItem && lastHistoryItem.historyItemViewModel.outputSwimlanes.length > 0) {
      children.push({
        repository,
        graphColumns: lastHistoryItem.historyItemViewModel.outputSwimlanes,
        type: "historyItemLoadMore"
      });
    }
    return children;
  }
  hasChildren(inputOrElement) {
    return inputOrElement instanceof SCMHistoryViewModel;
  }
}
let SCMHistoryViewModel = class SCMHistoryViewModel2 extends Disposable {
  static {
    __name(this, "SCMHistoryViewModel");
  }
  constructor(_configurationService, _contextKeyService, _extensionService, _scmService, _scmViewService, _storageService) {
    super();
    this._configurationService = _configurationService;
    this._contextKeyService = _contextKeyService;
    this._extensionService = _extensionService;
    this._scmService = _scmService;
    this._scmViewService = _scmViewService;
    this._storageService = _storageService;
    this._selectedRepository = observableValue(this, "auto");
    this.onDidChangeHistoryItemsFilter = observableSignal(this);
    this.isViewModelEmpty = observableValue(this, false);
    this._repositoryState = /* @__PURE__ */ new Map();
    this._repositoryFilterState = /* @__PURE__ */ new Map();
    this._repositoryFilterState = this._loadHistoryItemsFilterState();
    this._extensionService.onWillStop(this._saveHistoryItemsFilterState, this, this._store);
    this._storageService.onWillSaveState(this._saveHistoryItemsFilterState, this, this._store);
    this._scmHistoryItemCountCtx = ContextKeys.SCMHistoryItemCount.bindTo(this._contextKeyService);
    const firstRepository = this._scmService.repositoryCount > 0 ? constObservable(Iterable.first(this._scmService.repositories)) : observableFromEvent(this, Event.once(this._scmService.onDidAddRepository), (repository) => repository);
    const graphRepository = derived((reader) => {
      const selectedRepository = this._selectedRepository.read(reader);
      if (selectedRepository !== "auto") {
        return selectedRepository;
      }
      return this._scmViewService.activeRepository.read(reader);
    });
    this.repository = latestChangedValue(this, [firstRepository, graphRepository]);
    const closedRepository = observableFromEvent(this, this._scmService.onDidRemoveRepository, (repository) => repository);
    this._register(autorun((reader) => {
      const repository = closedRepository.read(reader);
      if (!repository) {
        return;
      }
      if (this.repository.get() === repository) {
        this._selectedRepository.set(Iterable.first(this._scmService.repositories) ?? "auto", void 0);
      }
      this._repositoryState.delete(repository);
    }));
  }
  clearRepositoryState() {
    const repository = this.repository.get();
    if (!repository) {
      return;
    }
    this._repositoryState.delete(repository);
  }
  getHistoryItemsFilter() {
    const repository = this.repository.get();
    if (!repository) {
      return;
    }
    const filterState = this._repositoryFilterState.get(getProviderKey(repository.provider)) ?? "auto";
    if (filterState === "all" || filterState === "auto") {
      return filterState;
    }
    const repositoryState = this._repositoryState.get(repository);
    return repositoryState?.historyItemsFilter;
  }
  getCurrentHistoryItemTreeElement() {
    const repository = this.repository.get();
    if (!repository) {
      return void 0;
    }
    const state = this._repositoryState.get(repository);
    if (!state) {
      return void 0;
    }
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemRef = historyProvider?.historyItemRef.get();
    return state.viewModels.find((viewModel) => viewModel.historyItemViewModel.historyItem.id === historyItemRef?.revision);
  }
  loadMore(cursor) {
    const repository = this.repository.get();
    if (!repository) {
      return;
    }
    const state = this._repositoryState.get(repository);
    if (!state) {
      return;
    }
    this._repositoryState.set(repository, { ...state, loadMore: cursor ?? true });
  }
  async getHistoryItems() {
    const repository = this.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    if (!repository || !historyProvider) {
      this._scmHistoryItemCountCtx.set(0);
      this.isViewModelEmpty.set(true, void 0);
      return [];
    }
    let state = this._repositoryState.get(repository);
    if (!state || state.loadMore !== false) {
      const historyItems = state?.viewModels.map((vm) => vm.historyItemViewModel.historyItem) ?? [];
      const historyItemRefs = state?.historyItemsFilter ?? await this._resolveHistoryItemFilter(repository, historyProvider);
      const limit = clamp(this._configurationService.getValue("scm.graph.pageSize"), 1, 1e3);
      const historyItemRefIds = historyItemRefs.map((ref) => ref.revision ?? ref.id);
      do {
        historyItems.push(...await historyProvider.provideHistoryItems({
          historyItemRefs: historyItemRefIds,
          limit,
          skip: historyItems.length
        }) ?? []);
      } while (typeof state?.loadMore === "string" && !historyItems.find((item) => item.id === state?.loadMore));
      const colorMap = this._getGraphColorMap(historyItemRefs);
      const viewModels = toISCMHistoryItemViewModelArray(historyItems, colorMap, historyProvider.historyItemRef.get()).map((historyItemViewModel) => ({
        repository,
        historyItemViewModel,
        type: "historyItemViewModel"
      }));
      state = { historyItemsFilter: historyItemRefs, viewModels, loadMore: false };
      this._repositoryState.set(repository, state);
      this._scmHistoryItemCountCtx.set(viewModels.length);
      this.isViewModelEmpty.set(viewModels.length === 0, void 0);
    }
    return state.viewModels;
  }
  setRepository(repository) {
    this._selectedRepository.set(repository, void 0);
  }
  setHistoryItemsFilter(filter) {
    const repository = this.repository.get();
    if (!repository) {
      return;
    }
    if (filter !== "auto") {
      this._repositoryFilterState.set(getProviderKey(repository.provider), filter);
    } else {
      this._repositoryFilterState.delete(getProviderKey(repository.provider));
    }
    this._saveHistoryItemsFilterState();
    this.onDidChangeHistoryItemsFilter.trigger(void 0);
  }
  _getGraphColorMap(historyItemRefs) {
    const repository = this.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemRef = historyProvider?.historyItemRef.get();
    const historyItemRemoteRef = historyProvider?.historyItemRemoteRef.get();
    const historyItemBaseRef = historyProvider?.historyItemBaseRef.get();
    const colorMap = /* @__PURE__ */ new Map();
    if (historyItemRef) {
      colorMap.set(historyItemRef.id, historyItemRef.color);
      if (historyItemRemoteRef) {
        colorMap.set(historyItemRemoteRef.id, historyItemRemoteRef.color);
      }
      if (historyItemBaseRef) {
        colorMap.set(historyItemBaseRef.id, historyItemBaseRef.color);
      }
    }
    for (const ref of historyItemRefs) {
      if (!colorMap.has(ref.id)) {
        colorMap.set(ref.id, void 0);
      }
    }
    return colorMap;
  }
  async _resolveHistoryItemFilter(repository, historyProvider) {
    const historyItemRefs = [];
    const historyItemsFilter = this._repositoryFilterState.get(getProviderKey(repository.provider)) ?? "auto";
    switch (historyItemsFilter) {
      case "all":
        historyItemRefs.push(...await historyProvider.provideHistoryItemRefs() ?? []);
        break;
      case "auto":
        historyItemRefs.push(...[
          historyProvider.historyItemRef.get(),
          historyProvider.historyItemRemoteRef.get(),
          historyProvider.historyItemBaseRef.get()
        ].filter((ref) => !!ref));
        break;
      default: {
        const refs = (await historyProvider.provideHistoryItemRefs(historyItemsFilter) ?? []).filter((ref) => historyItemsFilter.some((filter) => filter === ref.id));
        if (refs.length === 0) {
          historyItemRefs.push(...[
            historyProvider.historyItemRef.get(),
            historyProvider.historyItemRemoteRef.get(),
            historyProvider.historyItemBaseRef.get()
          ].filter((ref) => !!ref));
          this._repositoryFilterState.delete(getProviderKey(repository.provider));
        } else {
          historyItemRefs.push(...refs);
          this._repositoryFilterState.set(getProviderKey(repository.provider), refs.map((ref) => ref.id));
        }
        this._saveHistoryItemsFilterState();
        break;
      }
    }
    return historyItemRefs;
  }
  _loadHistoryItemsFilterState() {
    try {
      const filterData = this._storageService.get(
        "scm.graphView.referencesFilter",
        1
        /* StorageScope.WORKSPACE */
      );
      if (filterData) {
        return new Map(JSON.parse(filterData));
      }
    } catch {
    }
    return /* @__PURE__ */ new Map();
  }
  _saveHistoryItemsFilterState() {
    const filter = Array.from(this._repositoryFilterState.entries());
    this._storageService.store(
      "scm.graphView.referencesFilter",
      JSON.stringify(filter),
      1,
      0
      /* StorageTarget.USER */
    );
  }
  dispose() {
    this._repositoryState.clear();
    super.dispose();
  }
};
SCMHistoryViewModel = __decorate([
  __param(0, IConfigurationService),
  __param(1, IContextKeyService),
  __param(2, IExtensionService),
  __param(3, ISCMService),
  __param(4, ISCMViewService),
  __param(5, IStorageService)
], SCMHistoryViewModel);
let RepositoryPicker = class RepositoryPicker2 {
  static {
    __name(this, "RepositoryPicker");
  }
  constructor(_quickInputService, _scmViewService) {
    this._quickInputService = _quickInputService;
    this._scmViewService = _scmViewService;
    this._autoQuickPickItem = {
      label: localize("auto", "Auto"),
      description: localize("activeRepository", "Show the source control graph for the active repository"),
      repository: "auto"
    };
  }
  async pickRepository() {
    const picks = [
      this._autoQuickPickItem,
      { type: "separator" }
    ];
    picks.push(...this._scmViewService.repositories.map((r) => ({
      label: r.provider.name,
      description: r.provider.rootUri?.fsPath,
      iconClass: ThemeIcon.asClassName(Codicon.repo),
      repository: r
    })));
    return this._quickInputService.pick(picks, {
      placeHolder: localize("scmGraphRepository", "Select the repository to view, type to filter all repositories")
    });
  }
};
RepositoryPicker = __decorate([
  __param(0, IQuickInputService),
  __param(1, ISCMViewService)
], RepositoryPicker);
let HistoryItemRefPicker = class HistoryItemRefPicker2 extends Disposable {
  static {
    __name(this, "HistoryItemRefPicker");
  }
  constructor(_historyProvider, _historyItemsFilter, _quickInputService) {
    super();
    this._historyProvider = _historyProvider;
    this._historyItemsFilter = _historyItemsFilter;
    this._quickInputService = _quickInputService;
    this._allQuickPickItem = {
      id: "all",
      label: localize("all", "All"),
      description: localize("allHistoryItemRefs", "All history item references"),
      historyItemRef: "all"
    };
    this._autoQuickPickItem = {
      id: "auto",
      label: localize("auto", "Auto"),
      description: localize("currentHistoryItemRef", "Current history item reference(s)"),
      historyItemRef: "auto"
    };
  }
  async pickHistoryItemRef() {
    const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
    this._store.add(quickPick);
    quickPick.placeholder = localize("scmGraphHistoryItemRef", "Select one/more history item references to view, type to filter");
    quickPick.canSelectMany = true;
    quickPick.hideCheckAll = true;
    quickPick.busy = true;
    quickPick.show();
    const items = await this._createQuickPickItems();
    let selectedItems = [];
    if (this._historyItemsFilter === "all") {
      selectedItems.push(this._allQuickPickItem);
    } else if (this._historyItemsFilter === "auto") {
      selectedItems.push(this._autoQuickPickItem);
    } else {
      let index = 0;
      while (index < items.length) {
        if (items[index].type === "separator") {
          index++;
          continue;
        }
        if (this._historyItemsFilter.some((ref) => ref.id === items[index].id)) {
          const item = items.splice(index, 1);
          selectedItems.push(...item);
        } else {
          index++;
        }
      }
      items.splice(2, 0, { type: "separator" }, ...selectedItems);
    }
    quickPick.items = items;
    quickPick.selectedItems = selectedItems;
    quickPick.busy = false;
    return new Promise((resolve) => {
      this._store.add(quickPick.onDidChangeSelection((items2) => {
        const { added } = delta(selectedItems, items2, (a, b) => compare(a.id ?? "", b.id ?? ""));
        if (added.length > 0) {
          if (added[0].historyItemRef === "all" || added[0].historyItemRef === "auto") {
            quickPick.selectedItems = [added[0]];
          } else {
            quickPick.selectedItems = [...quickPick.selectedItems.filter((i) => i.historyItemRef !== "all" && i.historyItemRef !== "auto")];
          }
        }
        selectedItems = [...quickPick.selectedItems];
      }));
      this._store.add(quickPick.onDidAccept(() => {
        if (selectedItems.length === 0) {
          resolve(void 0);
        } else if (selectedItems.length === 1 && selectedItems[0].historyItemRef === "all") {
          resolve("all");
        } else if (selectedItems.length === 1 && selectedItems[0].historyItemRef === "auto") {
          resolve("auto");
        } else {
          resolve(selectedItems.map((item) => item.historyItemRef.id));
        }
        quickPick.hide();
      }));
      this._store.add(quickPick.onDidHide(() => {
        resolve(void 0);
        this.dispose();
      }));
    });
  }
  async _createQuickPickItems() {
    const picks = [
      this._allQuickPickItem,
      this._autoQuickPickItem
    ];
    const historyItemRefs = await this._historyProvider.provideHistoryItemRefs() ?? [];
    const historyItemRefsByCategory = groupBy(historyItemRefs, (a, b) => compare(a.category ?? "", b.category ?? ""));
    for (const refs of historyItemRefsByCategory) {
      if (refs.length === 0) {
        continue;
      }
      picks.push({ type: "separator", label: refs[0].category });
      picks.push(...refs.map((ref) => {
        return {
          id: ref.id,
          label: ref.name,
          description: ref.description,
          iconClass: ThemeIcon.isThemeIcon(ref.icon) ? ThemeIcon.asClassName(ref.icon) : void 0,
          historyItemRef: ref
        };
      }));
    }
    return picks;
  }
};
HistoryItemRefPicker = __decorate([
  __param(2, IQuickInputService)
], HistoryItemRefPicker);
let SCMHistoryViewPane = class SCMHistoryViewPane2 extends ViewPane {
  static {
    __name(this, "SCMHistoryViewPane");
  }
  constructor(options, _commandService, _instantiationService, _menuService, _progressService, configurationService, contextMenuService, keybindingService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, hoverService) {
    super({
      ...options,
      titleMenuId: MenuId.SCMHistoryTitle,
      showActions: ViewPaneShowActions.WhenExpanded
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._menuService = _menuService;
    this._progressService = _progressService;
    this._repositoryIsLoadingMore = observableValue(this, false);
    this._repositoryOutdated = observableValue(this, false);
    this._visibilityDisposables = new DisposableStore();
    this._treeOperationSequencer = new Sequencer();
    this._treeLoadMoreSequencer = new Sequencer();
    this._updateChildrenThrottler = new Throttler();
    this._contextMenuDisposables = new MutableDisposable();
    this._scmProviderCtx = ContextKeys.SCMProvider.bindTo(this.scopedContextKeyService);
    this._scmCurrentHistoryItemRefHasRemote = ContextKeys.SCMCurrentHistoryItemRefHasRemote.bindTo(this.scopedContextKeyService);
    this._scmCurrentHistoryItemRefInFilter = ContextKeys.SCMCurrentHistoryItemRefInFilter.bindTo(this.scopedContextKeyService);
    this._actionRunner = this.instantiationService.createInstance(SCMHistoryViewPaneActionRunner);
    this._register(this._actionRunner);
    this._register(this._updateChildrenThrottler);
  }
  renderHeaderTitle(container) {
    super.renderHeaderTitle(container, this.title);
    const element = h("div.scm-graph-view-badge-container", [
      h("div.scm-graph-view-badge.monaco-count-badge.long@badge")
    ]);
    element.badge.textContent = "Outdated";
    container.appendChild(element.root);
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element.root, {
      markdown: {
        value: localize("scmGraphViewOutdated", "Please refresh the graph using the refresh action ($(refresh))."),
        supportThemeIcons: true
      },
      markdownNotSupportedFallback: void 0
    }));
    this._register(autorun((reader) => {
      const outdated = this._repositoryOutdated.read(reader);
      element.root.style.display = outdated ? "" : "none";
    }));
  }
  renderBody(container) {
    super.renderBody(container);
    this._treeContainer = append(container, $(".scm-view.scm-history-view"));
    this._treeContainer.classList.add("file-icon-themable-tree");
    this._createTree(this._treeContainer);
    this.onDidChangeBodyVisibility(async (visible) => {
      if (!visible) {
        this._visibilityDisposables.clear();
        return;
      }
      this._treeViewModel = this.instantiationService.createInstance(SCMHistoryViewModel);
      this._visibilityDisposables.add(this._treeViewModel);
      const firstRepositoryInitialized = derived(this, (reader) => {
        const repository = this._treeViewModel.repository.read(reader);
        const historyProvider = repository?.provider.historyProvider.read(reader);
        const historyItemRef = historyProvider?.historyItemRef.read(reader);
        return historyItemRef !== void 0 ? true : void 0;
      });
      await waitForState(firstRepositoryInitialized);
      await this._progressService.withProgress({ location: this.id }, async () => {
        await this._treeOperationSequencer.queue(async () => {
          await this._tree.setInput(this._treeViewModel);
          this._tree.scrollTop = 0;
        });
      });
      this._visibilityDisposables.add(autorun((reader) => {
        this._treeViewModel.isViewModelEmpty.read(reader);
        this._onDidChangeViewWelcomeState.fire();
      }));
      let isFirstRun = true;
      this._visibilityDisposables.add(autorunWithStore((reader, store) => {
        const repository = this._treeViewModel.repository.read(reader);
        const historyProvider = repository?.provider.historyProvider.read(reader);
        if (!repository || !historyProvider) {
          return;
        }
        const historyItemRefId = derived((reader2) => {
          return historyProvider.historyItemRef.read(reader2)?.id;
        });
        store.add(runOnChange(historyItemRefId, async (historyItemRefIdValue) => {
          await this.refresh();
          this._scmCurrentHistoryItemRefInFilter.set(this._isCurrentHistoryItemInFilter(historyItemRefIdValue));
        }));
        store.add(runOnChange(historyProvider.historyItemRefChanges, (changes) => {
          if (changes.silent) {
            if (this._tree.scrollTop === 0) {
              this.refresh();
              return;
            }
            this._repositoryOutdated.set(true, void 0);
            return;
          }
          this.refresh();
        }));
        store.add(runOnChange(this._treeViewModel.onDidChangeHistoryItemsFilter, async () => {
          await this.refresh();
          this._scmCurrentHistoryItemRefInFilter.set(this._isCurrentHistoryItemInFilter(historyItemRefId.get()));
        }));
        store.add(autorun((reader2) => {
          this._scmCurrentHistoryItemRefHasRemote.set(!!historyProvider.historyItemRemoteRef.read(reader2));
        }));
        this._scmProviderCtx.set(repository.provider.contextValue);
        this._scmCurrentHistoryItemRefInFilter.set(this._isCurrentHistoryItemInFilter(historyItemRefId.get()));
        if (!isFirstRun) {
          this.refresh();
        }
        isFirstRun = false;
      }));
    }, this, this._store);
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._tree.layout(height, width);
  }
  getActionRunner() {
    return this._actionRunner;
  }
  getActionsContext() {
    return this._treeViewModel?.repository.get()?.provider;
  }
  createActionViewItem(action, options) {
    if (action.id === PICK_REPOSITORY_ACTION_ID) {
      const repository = this._treeViewModel?.repository.get();
      if (repository) {
        return new SCMRepositoryActionViewItem(repository, action, options);
      }
    } else if (action.id === PICK_HISTORY_ITEM_REFS_ACTION_ID) {
      const repository = this._treeViewModel?.repository.get();
      const historyItemsFilter = this._treeViewModel?.getHistoryItemsFilter();
      if (repository && historyItemsFilter) {
        return new SCMHistoryItemRefsActionViewItem(repository, historyItemsFilter, action, options);
      }
    }
    return super.createActionViewItem(action, options);
  }
  focus() {
    super.focus();
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    this._tree.focusFirst(fakeKeyboardEvent);
    this._tree.domFocus();
  }
  shouldShowWelcome() {
    return this._treeViewModel?.isViewModelEmpty.get() === true;
  }
  async refresh() {
    this._treeViewModel.clearRepositoryState();
    await this._updateChildren();
    this.updateActions();
    this._repositoryOutdated.set(false, void 0);
    this._tree.scrollTop = 0;
  }
  async pickRepository() {
    const picker = this._instantiationService.createInstance(RepositoryPicker);
    const result = await picker.pickRepository();
    if (result) {
      this._treeViewModel.setRepository(result.repository);
    }
  }
  async pickHistoryItemRef() {
    const repository = this._treeViewModel.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemsFilter = this._treeViewModel.getHistoryItemsFilter();
    if (!historyProvider || !historyItemsFilter) {
      return;
    }
    const picker = this._instantiationService.createInstance(HistoryItemRefPicker, historyProvider, historyItemsFilter);
    const result = await picker.pickHistoryItemRef();
    if (result) {
      this._treeViewModel.setHistoryItemsFilter(result);
    }
  }
  async revealCurrentHistoryItem() {
    const repository = this._treeViewModel.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemRef = historyProvider?.historyItemRef.get();
    if (!repository || !historyItemRef?.id || !historyItemRef?.revision) {
      return;
    }
    if (!this._isCurrentHistoryItemInFilter(historyItemRef.id)) {
      return;
    }
    const revealTreeNode = /* @__PURE__ */ __name(() => {
      const historyItemTreeElement = this._treeViewModel.getCurrentHistoryItemTreeElement();
      if (historyItemTreeElement && this._tree.hasNode(historyItemTreeElement)) {
        this._tree.reveal(historyItemTreeElement, 0.5);
        this._tree.setSelection([historyItemTreeElement]);
        this._tree.setFocus([historyItemTreeElement]);
        return true;
      }
      return false;
    }, "revealTreeNode");
    if (revealTreeNode()) {
      return;
    }
    await this._loadMore(historyItemRef.revision);
    revealTreeNode();
  }
  _createTree(container) {
    this._treeIdentityProvider = new SCMHistoryTreeIdentityProvider();
    const historyItemHoverDelegate = this.instantiationService.createInstance(HistoryItemHoverDelegate, this.viewDescriptorService.getViewLocationById(this.id));
    this._register(historyItemHoverDelegate);
    this._treeDataSource = this.instantiationService.createInstance(SCMHistoryTreeDataSource);
    this._register(this._treeDataSource);
    this._tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, "SCM History Tree", container, new ListDelegate(), [
      this.instantiationService.createInstance(HistoryItemRenderer, historyItemHoverDelegate),
      this.instantiationService.createInstance(HistoryItemLoadMoreRenderer, this._repositoryIsLoadingMore, () => this._loadMore())
    ], this._treeDataSource, {
      accessibilityProvider: new SCMHistoryTreeAccessibilityProvider(),
      identityProvider: this._treeIdentityProvider,
      collapseByDefault: /* @__PURE__ */ __name((e) => false, "collapseByDefault"),
      keyboardNavigationLabelProvider: new SCMHistoryTreeKeyboardNavigationLabelProvider(),
      horizontalScrolling: false,
      multipleSelectionSupport: false
    });
    this._register(this._tree);
    this._tree.onDidOpen(this._onDidOpen, this, this._store);
    this._tree.onContextMenu(this._onContextMenu, this, this._store);
  }
  _isCurrentHistoryItemInFilter(historyItemRefId) {
    if (!historyItemRefId) {
      return false;
    }
    const historyItemFilter = this._treeViewModel.getHistoryItemsFilter();
    if (historyItemFilter === "all" || historyItemFilter === "auto") {
      return true;
    }
    return Array.isArray(historyItemFilter) && !!historyItemFilter.find((ref) => ref.id === historyItemRefId);
  }
  async _onDidOpen(e) {
    if (!e.element) {
      return;
    } else if (isSCMHistoryItemViewModelTreeElement(e.element)) {
      const historyItem = e.element.historyItemViewModel.historyItem;
      const historyItemParentId = historyItem.parentIds.length > 0 ? historyItem.parentIds[0] : void 0;
      const historyProvider = e.element.repository.provider.historyProvider.get();
      const historyItemChanges = await historyProvider?.provideHistoryItemChanges(historyItem.id, historyItemParentId);
      if (historyItemChanges) {
        const title = getHistoryItemEditorTitle(historyItem);
        const rootUri = e.element.repository.provider.rootUri;
        const path = rootUri ? rootUri.path : e.element.repository.provider.label;
        const multiDiffSourceUri = URI.from({ scheme: "scm-history-item", path: `${path}/${historyItemParentId}..${historyItem.id}` }, true);
        await this._commandService.executeCommand("_workbench.openMultiDiffEditor", { title, multiDiffSourceUri, resources: historyItemChanges });
      }
    } else if (isSCMHistoryItemLoadMoreTreeElement(e.element)) {
      const pageOnScroll = this.configurationService.getValue("scm.graph.pageOnScroll") === true;
      if (!pageOnScroll) {
        this._loadMore();
        this._tree.setSelection([]);
      }
    }
  }
  _onContextMenu(e) {
    const element = e.element;
    if (!element || !isSCMHistoryItemViewModelTreeElement(element)) {
      return;
    }
    this._contextMenuDisposables.value = new DisposableStore();
    const historyItemRefMenuItems = MenuRegistry.getMenuItems(MenuId.SCMHistoryItemRefContext).filter((item) => isIMenuItem(item));
    if (historyItemRefMenuItems.length > 0 && element.historyItemViewModel.historyItem.references?.length) {
      const historyItemRefActions = /* @__PURE__ */ new Map();
      for (const ref of element.historyItemViewModel.historyItem.references) {
        const contextKeyService = this.scopedContextKeyService.createOverlay([
          ["scmHistoryItemRef", ref.id]
        ]);
        const menuActions = this._menuService.getMenuActions(MenuId.SCMHistoryItemRefContext, contextKeyService);
        for (const action of menuActions.flatMap((a) => a[1])) {
          if (!historyItemRefActions.has(action.id)) {
            historyItemRefActions.set(action.id, []);
          }
          historyItemRefActions.get(action.id).push(ref);
        }
      }
      for (const historyItemRefMenuItem of historyItemRefMenuItems) {
        const actionId = historyItemRefMenuItem.command.id;
        if (!historyItemRefActions.has(actionId)) {
          continue;
        }
        this._contextMenuDisposables.value.add(MenuRegistry.appendMenuItem(MenuId.SCMHistoryItemContext, {
          title: historyItemRefMenuItem.command.title,
          submenu: MenuId.for(actionId),
          group: historyItemRefMenuItem?.group,
          order: historyItemRefMenuItem?.order
        }));
        for (const historyItemRef of historyItemRefActions.get(actionId) ?? []) {
          this._contextMenuDisposables.value.add(registerAction2(class extends Action2 {
            constructor() {
              super({
                id: `${actionId}.${historyItemRef.id}`,
                title: historyItemRef.name,
                menu: {
                  id: MenuId.for(actionId),
                  group: historyItemRef.category
                }
              });
            }
            run(accessor, ...args) {
              const commandService = accessor.get(ICommandService);
              commandService.executeCommand(actionId, ...args, historyItemRef.id);
            }
          }));
        }
      }
    }
    const historyItemMenuActions = this._menuService.getMenuActions(MenuId.SCMHistoryItemContext, this.scopedContextKeyService, {
      arg: element.repository.provider,
      shouldForwardArgs: true
    });
    this.contextMenuService.showContextMenu({
      contextKeyService: this.scopedContextKeyService,
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => getFlatContextMenuActions(historyItemMenuActions), "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => element.historyItemViewModel.historyItem, "getActionsContext")
    });
  }
  async _loadMore(cursor) {
    return this._treeLoadMoreSequencer.queue(async () => {
      if (this._repositoryIsLoadingMore.get()) {
        return;
      }
      this._repositoryIsLoadingMore.set(true, void 0);
      this._treeViewModel.loadMore(cursor);
      await this._updateChildren();
      this._repositoryIsLoadingMore.set(false, void 0);
    });
  }
  _updateChildren() {
    return this._updateChildrenThrottler.queue(() => this._treeOperationSequencer.queue(async () => {
      await this._progressService.withProgress({ location: this.id }, async () => {
        await this._tree.updateChildren(void 0, void 0, void 0, {
          // diffIdentityProvider: this._treeIdentityProvider
        });
      });
    }));
  }
  dispose() {
    this._contextMenuDisposables.dispose();
    this._visibilityDisposables.dispose();
    super.dispose();
  }
};
SCMHistoryViewPane = __decorate([
  __param(1, ICommandService),
  __param(2, IInstantiationService),
  __param(3, IMenuService),
  __param(4, IProgressService),
  __param(5, IConfigurationService),
  __param(6, IContextMenuService),
  __param(7, IKeybindingService),
  __param(8, IInstantiationService),
  __param(9, IViewDescriptorService),
  __param(10, IContextKeyService),
  __param(11, IOpenerService),
  __param(12, IThemeService),
  __param(13, IHoverService)
], SCMHistoryViewPane);
export {
  SCMHistoryViewPane
};
//# sourceMappingURL=scmHistoryViewPane.js.map
