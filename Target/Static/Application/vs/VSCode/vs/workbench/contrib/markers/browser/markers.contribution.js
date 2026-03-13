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
import "./markersFileDecorations.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { localize, localize2 } from "../../../../nls.js";
import { Marker, RelatedInformation, ResourceMarkers } from "./markersModel.js";
import { MarkersView } from "./markersView.js";
import { MenuId, registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Markers, MarkersContextKeys } from "../common/markers.js";
import Messages from "./messages.js";
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { Extensions as ViewContainerExtensions } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { getVisbileViewContextKey, FocusedViewContext } from "../../../common/contextkeys.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ViewAction } from "../../../browser/parts/views/viewPane.js";
import { IActivityService, NumberBadge } from "../../../services/activity/common/activity.js";
import { viewFilterSubmenu } from "../../../browser/parts/views/viewFilter.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { problemsConfigurationNodeBase } from "../../../common/configuration.js";
import { MarkerChatContextContribution } from "./markersChatContext.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ProblemsAccessibilityHelp } from "./markersAccessibilityHelp.js";
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_OPEN_ACTION_ID,
  weight: 200,
  when: ContextKeyExpr.and(MarkersContextKeys.MarkerFocusContextKey),
  primary: 3,
  mac: {
    primary: 3,
    secondary: [
      2048 | 18
      /* KeyCode.DownArrow */
    ]
  },
  handler: /* @__PURE__ */ __name((accessor, args) => {
    const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
    markersView.openFileAtElement(markersView.getFocusElement(), false, false, true);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_OPEN_SIDE_ACTION_ID,
  weight: 200,
  when: ContextKeyExpr.and(MarkersContextKeys.MarkerFocusContextKey),
  primary: 2048 | 3,
  mac: {
    primary: 256 | 3
    /* KeyCode.Enter */
  },
  handler: /* @__PURE__ */ __name((accessor, args) => {
    const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
    markersView.openFileAtElement(markersView.getFocusElement(), false, true, true);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_SHOW_PANEL_ID,
  weight: 200,
  when: void 0,
  primary: void 0,
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    await accessor.get(IViewsService).openView(Markers.MARKERS_VIEW_ID);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: Markers.MARKER_SHOW_QUICK_FIX,
  weight: 200,
  when: MarkersContextKeys.MarkerFocusContextKey,
  primary: 2048 | 89,
  handler: /* @__PURE__ */ __name((accessor, args) => {
    const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
    const focusedElement = markersView.getFocusElement();
    if (focusedElement instanceof Marker) {
      markersView.showQuickFixes(focusedElement);
    }
  }, "handler")
});
Registry.as(Extensions.Configuration).registerConfiguration({
  ...problemsConfigurationNodeBase,
  "properties": {
    "problems.autoReveal": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,
      "type": "boolean",
      "default": true
    },
    "problems.defaultViewMode": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE,
      "type": "string",
      "default": "tree",
      "enum": ["table", "tree"]
    },
    "problems.showCurrentInStatus": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS,
      "type": "boolean",
      "default": false
    },
    "problems.sortOrder": {
      "description": Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER,
      "type": "string",
      "default": "severity",
      "enum": ["severity", "position"],
      "enumDescriptions": [
        Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY,
        Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION
      ]
    }
  }
});
const markersViewIcon = registerIcon("markers-view-icon", Codicon.warning, localize("markersViewIcon", "View icon of the markers view."));
const VIEW_CONTAINER = Registry.as(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
  id: Markers.MARKERS_CONTAINER_ID,
  title: Messages.MARKERS_PANEL_TITLE_PROBLEMS,
  icon: markersViewIcon,
  hideIfEmpty: true,
  order: 0,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [Markers.MARKERS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: Markers.MARKERS_VIEW_STORAGE_ID
}, 1, { doNotRegisterOpenCommand: true });
Registry.as(ViewContainerExtensions.ViewsRegistry).registerViews([{
  id: Markers.MARKERS_VIEW_ID,
  containerIcon: markersViewIcon,
  name: Messages.MARKERS_PANEL_TITLE_PROBLEMS,
  canToggleVisibility: true,
  canMoveView: true,
  ctorDescriptor: new SyncDescriptor(MarkersView),
  openCommandActionDescriptor: {
    id: "workbench.actions.view.problems",
    mnemonicTitle: localize({ key: "miMarker", comment: ["&& denotes a mnemonic"] }, "&&Problems"),
    keybindings: {
      primary: 2048 | 1024 | 43
      /* KeyCode.KeyM */
    },
    order: 0
  }
}], VIEW_CONTAINER);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.table.${Markers.MARKERS_VIEW_ID}.viewAsTree`,
      title: localize("viewAsTree", "View as Tree"),
      metadata: {
        description: localize2("viewAsTreeDescription", "Show the problems view as a tree.")
      },
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo(
          "table"
          /* MarkersViewMode.Table */
        )),
        group: "navigation",
        order: 3
      },
      icon: Codicon.listTree,
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.setViewMode(
      "tree"
      /* MarkersViewMode.Tree */
    );
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.table.${Markers.MARKERS_VIEW_ID}.viewAsTable`,
      title: localize("viewAsTable", "View as Table"),
      metadata: {
        description: localize2("viewAsTableDescription", "Show the problems view as a table.")
      },
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo(
          "tree"
          /* MarkersViewMode.Tree */
        )),
        group: "navigation",
        order: 3
      },
      icon: Codicon.listFlat,
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.setViewMode(
      "table"
      /* MarkersViewMode.Table */
    );
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleErrors`,
      title: localize("show errors", "Show Errors"),
      metadata: {
        description: localize2("toggleErrorsDescription", "Show or hide errors in the problems view.")
      },
      category: localize("problems", "Problems"),
      toggled: MarkersContextKeys.ShowErrorsFilterContextKey,
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 1
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showErrors = !view.filters.showErrors;
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleWarnings`,
      title: localize("show warnings", "Show Warnings"),
      metadata: {
        description: localize2("toggleWarningsDescription", "Show or hide warnings in the problems view.")
      },
      category: localize("problems", "Problems"),
      toggled: MarkersContextKeys.ShowWarningsFilterContextKey,
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 2
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showWarnings = !view.filters.showWarnings;
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleInfos`,
      title: localize("show infos", "Show Infos"),
      category: localize("problems", "Problems"),
      toggled: MarkersContextKeys.ShowInfoFilterContextKey,
      metadata: {
        description: localize2("toggleInfosDescription", "Show or hide infos in the problems view.")
      },
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 3
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showInfos = !view.filters.showInfos;
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleActiveFile`,
      title: localize("show active file", "Show Active File Only"),
      metadata: {
        description: localize2("toggleActiveFileDescription", "Show or hide problems (errors, warnings, info) only from the active file in the problems view.")
      },
      category: localize("problems", "Problems"),
      toggled: MarkersContextKeys.ShowActiveFileFilterContextKey,
      menu: {
        id: viewFilterSubmenu,
        group: "2_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 1
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.activeFile = !view.filters.activeFile;
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleExcludedFiles`,
      title: localize("show excluded files", "Show Excluded Files"),
      metadata: {
        description: localize2("toggleExcludedFilesDescription", "Show or hide excluded files in the problems view.")
      },
      category: localize("problems", "Problems"),
      toggled: MarkersContextKeys.ShowExcludedFilesFilterContextKey.negate(),
      menu: {
        id: viewFilterSubmenu,
        group: "2_filter",
        when: ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID),
        order: 2
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.excludedFiles = !view.filters.excludedFiles;
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.problems.focus",
      title: Messages.MARKERS_PANEL_SHOW_LABEL,
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IViewsService).openView(Markers.MARKERS_VIEW_ID, true);
  }
});
class MarkersViewAction extends ViewAction {
  static {
    __name(this, "MarkersViewAction");
  }
  getSelectedMarkers(markersView) {
    const selection = markersView.getFocusedSelectedElements() || markersView.getAllResourceMarkers();
    const markers = [];
    const addMarker = /* @__PURE__ */ __name((marker) => {
      if (!markers.includes(marker)) {
        markers.push(marker);
      }
    }, "addMarker");
    for (const selected of selection) {
      if (selected instanceof ResourceMarkers) {
        selected.markers.forEach(addMarker);
      } else if (selected instanceof Marker) {
        addMarker(selected);
      }
    }
    return markers;
  }
}
registerAction2(class extends MarkersViewAction {
  constructor() {
    const when = ContextKeyExpr.and(FocusedViewContext.isEqualTo(Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersTreeVisibilityContextKey, MarkersContextKeys.RelatedInformationFocusContextKey.toNegated());
    super({
      id: Markers.MARKER_COPY_ACTION_ID,
      title: localize2("copyMarker", "Copy"),
      menu: {
        id: MenuId.ProblemsPanelContext,
        when,
        group: "navigation"
      },
      keybinding: {
        weight: 200,
        primary: 2048 | 33,
        when
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    const clipboardService = serviceAccessor.get(IClipboardService);
    const markers = this.getSelectedMarkers(markersView);
    if (markers.length) {
      await clipboardService.writeText(`[${markers}]`);
    }
  }
});
registerAction2(class extends MarkersViewAction {
  constructor() {
    super({
      id: Markers.MARKER_COPY_MESSAGE_ACTION_ID,
      title: localize2("copyMessage", "Copy Message"),
      menu: {
        id: MenuId.ProblemsPanelContext,
        when: MarkersContextKeys.MarkerFocusContextKey,
        group: "navigation"
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    const clipboardService = serviceAccessor.get(IClipboardService);
    const markers = this.getSelectedMarkers(markersView);
    if (markers.length) {
      await clipboardService.writeText(markers.map((m) => m.marker.message).join("\n"));
    }
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,
      title: localize2("copyMessage", "Copy Message"),
      menu: {
        id: MenuId.ProblemsPanelContext,
        when: MarkersContextKeys.RelatedInformationFocusContextKey,
        group: "navigation"
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    const clipboardService = serviceAccessor.get(IClipboardService);
    const element = markersView.getFocusElement();
    if (element instanceof RelatedInformation) {
      await clipboardService.writeText(element.raw.message);
    }
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.FOCUS_PROBLEMS_FROM_FILTER,
      title: localize("focusProblemsList", "Focus problems view"),
      keybinding: {
        when: MarkersContextKeys.MarkerViewFilterFocusContextKey,
        weight: 200,
        primary: 2048 | 18
        /* KeyCode.DownArrow */
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.focus();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_FOCUS_FILTER,
      title: localize("focusProblemsFilter", "Focus problems filter"),
      keybinding: {
        when: FocusedViewContext.isEqualTo(Markers.MARKERS_VIEW_ID),
        weight: 200,
        primary: 2048 | 36
        /* KeyCode.KeyF */
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.focusFilter();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,
      title: localize2("show multiline", "Show message in multiple lines"),
      category: localize("problems", "Problems"),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.has(getVisbileViewContextKey(Markers.MARKERS_VIEW_ID))
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.setMultiline(true);
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,
      title: localize2("show singleline", "Show message in single line"),
      category: localize("problems", "Problems"),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.has(getVisbileViewContextKey(Markers.MARKERS_VIEW_ID))
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.setMultiline(false);
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: Markers.MARKERS_VIEW_CLEAR_FILTER_TEXT,
      title: localize("clearFiltersText", "Clear filters text"),
      category: localize("problems", "Problems"),
      keybinding: {
        when: MarkersContextKeys.MarkerViewFilterFocusContextKey,
        weight: 200,
        primary: 9
        /* KeyCode.Escape */
      },
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, markersView) {
    markersView.clearFilterText();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.treeView.${Markers.MARKERS_VIEW_ID}.collapseAll`,
      title: localize("collapseAll", "Collapse All"),
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo(
          "tree"
          /* MarkersViewMode.Tree */
        )),
        group: "navigation",
        order: 2
      },
      icon: Codicon.collapseAll,
      viewId: Markers.MARKERS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    return view.collapseAll();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: Markers.TOGGLE_MARKERS_VIEW_ACTION_ID,
      title: Messages.MARKERS_PANEL_TOGGLE_LABEL
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    if (viewsService.isViewVisible(Markers.MARKERS_VIEW_ID)) {
      viewsService.closeView(Markers.MARKERS_VIEW_ID);
    } else {
      viewsService.openView(Markers.MARKERS_VIEW_ID, true);
    }
  }
});
let MarkersStatusBarContributions = class MarkersStatusBarContributions2 extends Disposable {
  static {
    __name(this, "MarkersStatusBarContributions");
  }
  constructor(markerService, statusbarService, configurationService) {
    super();
    this.markerService = markerService;
    this.statusbarService = statusbarService;
    this.configurationService = configurationService;
    this.markersStatusItem = this._register(this.statusbarService.addEntry(
      this.getMarkersItem(),
      "status.problems",
      0,
      50
      /* Medium Priority */
    ));
    const addStatusBarEntry = /* @__PURE__ */ __name(() => {
      this.markersStatusItemOff = this.statusbarService.addEntry(this.getMarkersItemTurnedOff(), "status.problemsVisibility", 0, 49);
    }, "addStatusBarEntry");
    let config = this.configurationService.getValue("problems.visibility");
    if (!config) {
      addStatusBarEntry();
    }
    this._register(this.markerService.onMarkerChanged(() => {
      this.markersStatusItem.update(this.getMarkersItem());
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("problems.visibility")) {
        this.markersStatusItem.update(this.getMarkersItem());
        config = this.configurationService.getValue("problems.visibility");
        if (!config && !this.markersStatusItemOff) {
          addStatusBarEntry();
        } else if (config && this.markersStatusItemOff) {
          this.markersStatusItemOff.dispose();
          this.markersStatusItemOff = void 0;
        }
      }
    }));
  }
  getMarkersItem() {
    const markersStatistics = this.markerService.getStatistics();
    const tooltip = this.getMarkersTooltip(markersStatistics);
    return {
      name: localize("status.problems", "Problems"),
      text: this.getMarkersText(markersStatistics),
      ariaLabel: tooltip,
      tooltip,
      command: "workbench.actions.view.toggleProblems"
    };
  }
  getMarkersItemTurnedOff() {
    this.statusbarService.updateEntryVisibility("status.problemsVisibility", true);
    const openSettingsCommand = "workbench.action.openSettings";
    const configureSettingsLabel = "@id:problems.visibility";
    const tooltip = localize("status.problemsVisibilityOff", "Problems are turned off. Click to open settings.");
    return {
      name: localize("status.problemsVisibility", "Problems Visibility"),
      text: "$(whole-word)",
      ariaLabel: tooltip,
      tooltip,
      kind: "warning",
      command: { title: openSettingsCommand, arguments: [configureSettingsLabel], id: openSettingsCommand }
    };
  }
  getMarkersTooltip(stats) {
    const errorTitle = /* @__PURE__ */ __name((n) => localize("totalErrors", "Errors: {0}", n), "errorTitle");
    const warningTitle = /* @__PURE__ */ __name((n) => localize("totalWarnings", "Warnings: {0}", n), "warningTitle");
    const infoTitle = /* @__PURE__ */ __name((n) => localize("totalInfos", "Infos: {0}", n), "infoTitle");
    const titles = [];
    if (stats.errors > 0) {
      titles.push(errorTitle(stats.errors));
    }
    if (stats.warnings > 0) {
      titles.push(warningTitle(stats.warnings));
    }
    if (stats.infos > 0) {
      titles.push(infoTitle(stats.infos));
    }
    if (titles.length === 0) {
      return localize("noProblems", "No Problems");
    }
    return titles.join(", ");
  }
  getMarkersText(stats) {
    const problemsText = [];
    problemsText.push("$(error) " + this.packNumber(stats.errors));
    problemsText.push("$(warning) " + this.packNumber(stats.warnings));
    if (stats.infos > 0) {
      problemsText.push("$(info) " + this.packNumber(stats.infos));
    }
    return problemsText.join(" ");
  }
  packNumber(n) {
    const manyProblems = localize("manyProblems", "10K+");
    return n > 9999 ? manyProblems : n > 999 ? n.toString().charAt(0) + "K" : n.toString();
  }
};
MarkersStatusBarContributions = __decorate([
  __param(0, IMarkerService),
  __param(1, IStatusbarService),
  __param(2, IConfigurationService)
], MarkersStatusBarContributions);
workbenchRegistry.registerWorkbenchContribution(
  MarkersStatusBarContributions,
  3
  /* LifecyclePhase.Restored */
);
registerWorkbenchContribution2(
  MarkerChatContextContribution.ID,
  MarkerChatContextContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
let ActivityUpdater = class ActivityUpdater2 extends Disposable {
  static {
    __name(this, "ActivityUpdater");
  }
  constructor(activityService, markerService) {
    super();
    this.activityService = activityService;
    this.markerService = markerService;
    this.activity = this._register(new MutableDisposable());
    this._register(this.markerService.onMarkerChanged(() => this.updateBadge()));
    this.updateBadge();
  }
  updateBadge() {
    const { errors, warnings, infos } = this.markerService.getStatistics();
    const total = errors + warnings + infos;
    if (total > 0) {
      const message = localize("totalProblems", "Total {0} Problems", total);
      this.activity.value = this.activityService.showViewActivity(Markers.MARKERS_VIEW_ID, { badge: new NumberBadge(total, () => message) });
    } else {
      this.activity.value = void 0;
    }
  }
};
ActivityUpdater = __decorate([
  __param(0, IActivityService),
  __param(1, IMarkerService)
], ActivityUpdater);
workbenchRegistry.registerWorkbenchContribution(
  ActivityUpdater,
  3
  /* LifecyclePhase.Restored */
);
AccessibleViewRegistry.register(new ProblemsAccessibilityHelp());
//# sourceMappingURL=markers.contribution.js.map
