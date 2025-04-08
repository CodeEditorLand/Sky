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
import * as DOM from "../../../../base/browser/dom.js";
import { Action, IAction } from "../../../../base/common/actions.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import Messages from "./messages.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Marker } from "./markersModel.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ActionViewItem, IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { MarkersContextKeys } from "../common/markers.js";
import "./markersViewActions.css";
class MarkersFilters extends Disposable {
  static {
    __name(this, "MarkersFilters");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  constructor(options, contextKeyService) {
    super();
    this._excludedFiles = MarkersContextKeys.ShowExcludedFilesFilterContextKey.bindTo(contextKeyService);
    this._excludedFiles.set(options.excludedFiles);
    this._activeFile = MarkersContextKeys.ShowActiveFileFilterContextKey.bindTo(contextKeyService);
    this._activeFile.set(options.activeFile);
    this._showWarnings = MarkersContextKeys.ShowWarningsFilterContextKey.bindTo(contextKeyService);
    this._showWarnings.set(options.showWarnings);
    this._showInfos = MarkersContextKeys.ShowInfoFilterContextKey.bindTo(contextKeyService);
    this._showInfos.set(options.showInfos);
    this._showErrors = MarkersContextKeys.ShowErrorsFilterContextKey.bindTo(contextKeyService);
    this._showErrors.set(options.showErrors);
    this.filterHistory = options.filterHistory;
  }
  filterHistory;
  _excludedFiles;
  get excludedFiles() {
    return !!this._excludedFiles.get();
  }
  set excludedFiles(filesExclude) {
    if (this._excludedFiles.get() !== filesExclude) {
      this._excludedFiles.set(filesExclude);
      this._onDidChange.fire({ excludedFiles: true });
    }
  }
  _activeFile;
  get activeFile() {
    return !!this._activeFile.get();
  }
  set activeFile(activeFile) {
    if (this._activeFile.get() !== activeFile) {
      this._activeFile.set(activeFile);
      this._onDidChange.fire({ activeFile: true });
    }
  }
  _showWarnings;
  get showWarnings() {
    return !!this._showWarnings.get();
  }
  set showWarnings(showWarnings) {
    if (this._showWarnings.get() !== showWarnings) {
      this._showWarnings.set(showWarnings);
      this._onDidChange.fire({ showWarnings: true });
    }
  }
  _showErrors;
  get showErrors() {
    return !!this._showErrors.get();
  }
  set showErrors(showErrors) {
    if (this._showErrors.get() !== showErrors) {
      this._showErrors.set(showErrors);
      this._onDidChange.fire({ showErrors: true });
    }
  }
  _showInfos;
  get showInfos() {
    return !!this._showInfos.get();
  }
  set showInfos(showInfos) {
    if (this._showInfos.get() !== showInfos) {
      this._showInfos.set(showInfos);
      this._onDidChange.fire({ showInfos: true });
    }
  }
}
class QuickFixAction extends Action {
  constructor(marker) {
    super(QuickFixAction.ID, Messages.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX, QuickFixAction.CLASS, false);
    this.marker = marker;
  }
  static {
    __name(this, "QuickFixAction");
  }
  static ID = "workbench.actions.problems.quickfix";
  static CLASS = "markers-panel-action-quickfix " + ThemeIcon.asClassName(Codicon.lightBulb);
  static AUTO_FIX_CLASS = QuickFixAction.CLASS + " autofixable";
  _onShowQuickFixes = this._register(new Emitter());
  onShowQuickFixes = this._onShowQuickFixes.event;
  _quickFixes = [];
  get quickFixes() {
    return this._quickFixes;
  }
  set quickFixes(quickFixes) {
    this._quickFixes = quickFixes;
    this.enabled = this._quickFixes.length > 0;
  }
  autoFixable(autofixable) {
    this.class = autofixable ? QuickFixAction.AUTO_FIX_CLASS : QuickFixAction.CLASS;
  }
  run() {
    this._onShowQuickFixes.fire();
    return Promise.resolve();
  }
}
let QuickFixActionViewItem = class extends ActionViewItem {
  constructor(action, options, contextMenuService) {
    super(null, action, { ...options, icon: true, label: false });
    this.contextMenuService = contextMenuService;
  }
  static {
    __name(this, "QuickFixActionViewItem");
  }
  onClick(event) {
    DOM.EventHelper.stop(event, true);
    this.showQuickFixes();
  }
  showQuickFixes() {
    if (!this.element) {
      return;
    }
    if (!this.isEnabled()) {
      return;
    }
    const elementPosition = DOM.getDomNodePagePosition(this.element);
    const quickFixes = this.action.quickFixes;
    if (quickFixes.length) {
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => ({ x: elementPosition.left + 10, y: elementPosition.top + elementPosition.height + 4 }), "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => quickFixes, "getActions")
      });
    }
  }
};
QuickFixActionViewItem = __decorateClass([
  __decorateParam(2, IContextMenuService)
], QuickFixActionViewItem);
export {
  MarkersFilters,
  QuickFixAction,
  QuickFixActionViewItem
};
//# sourceMappingURL=markersViewActions.js.map
