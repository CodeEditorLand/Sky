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
var QuickDiffEditorController_1;
import * as nls from "../../../../nls.js";
import * as dom from "../../../../base/browser/dom.js";
import * as domStylesheetsJs from "../../../../base/browser/domStylesheets.js";
import { Action, ActionRunner } from "../../../../base/common/actions.js";
import { Event } from "../../../../base/common/event.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { SelectActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { defaultSelectBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { peekViewBorder, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground, PeekViewWidget } from "../../../../editor/contrib/peekView/browser/peekView.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { IMenuService, MenuId, MenuItemAction, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { EditorAction, registerEditorAction } from "../../../../editor/browser/editorExtensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { EmbeddedDiffEditorWidget } from "../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { IQuickDiffModelService } from "./quickDiffModel.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { rot } from "../../../../base/common/numbers.js";
import { ChangeType, getChangeHeight, getChangeType, getChangeTypeColor, getModifiedEndLineNumber, IQuickDiffService, lineIntersectsChange } from "../common/quickDiff.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { TextCompareEditorActiveContext } from "../../../common/contextkeys.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { basename } from "../../../../base/common/resources.js";
import { Position } from "../../../../editor/common/core/position.js";
import { getFlatActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { gotoNextLocation, gotoPreviousLocation } from "../../../../platform/theme/common/iconRegistry.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Color } from "../../../../base/common/color.js";
import { getOuterEditor } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { quickDiffDecorationCount } from "./quickDiffDecorator.js";
const isQuickDiffVisible = new RawContextKey("dirtyDiffVisible", false);
let QuickDiffPickerViewItem = class QuickDiffPickerViewItem2 extends SelectActionViewItem {
  static {
    __name(this, "QuickDiffPickerViewItem");
  }
  constructor(action, contextViewService, themeService) {
    const styles = { ...defaultSelectBoxStyles };
    const theme = themeService.getColorTheme();
    const editorBackgroundColor = theme.getColor(editorBackground);
    const peekTitleColor = theme.getColor(peekViewTitleBackground);
    const opaqueTitleColor = peekTitleColor?.makeOpaque(editorBackgroundColor) ?? editorBackgroundColor;
    styles.selectBackground = opaqueTitleColor.lighten(0.6).toString();
    super(null, action, [], 0, contextViewService, styles, { ariaLabel: nls.localize("remotes", "Switch quick diff base") });
    this.optionsItems = [];
  }
  setSelection(providers, provider) {
    this.optionsItems = providers.map((provider2) => ({ provider: provider2, text: provider2 }));
    const index = this.optionsItems.findIndex((item) => item.provider === provider);
    this.setOptions(this.optionsItems, index);
  }
  getActionContext(_, index) {
    return this.optionsItems[index];
  }
  render(container) {
    super.render(container);
    this.setFocusable(true);
  }
};
QuickDiffPickerViewItem = __decorate([
  __param(1, IContextViewService),
  __param(2, IThemeService)
], QuickDiffPickerViewItem);
class QuickDiffPickerBaseAction extends Action {
  static {
    __name(this, "QuickDiffPickerBaseAction");
  }
  static {
    this.ID = "quickDiff.base.switch";
  }
  static {
    this.LABEL = nls.localize("quickDiff.base.switch", "Switch Quick Diff Base");
  }
  constructor(callback) {
    super(QuickDiffPickerBaseAction.ID, QuickDiffPickerBaseAction.LABEL, void 0, void 0);
    this.callback = callback;
  }
  async run(event) {
    return this.callback(event);
  }
}
class QuickDiffWidgetActionRunner extends ActionRunner {
  static {
    __name(this, "QuickDiffWidgetActionRunner");
  }
  runAction(action, context) {
    if (action instanceof MenuItemAction) {
      return action.run(...context);
    }
    return super.runAction(action, context);
  }
}
let QuickDiffWidgetEditorAction = class QuickDiffWidgetEditorAction2 extends Action {
  static {
    __name(this, "QuickDiffWidgetEditorAction");
  }
  constructor(editor, action, cssClass, keybindingService, instantiationService) {
    const keybinding = keybindingService.lookupKeybinding(action.id);
    const label = action.label + (keybinding ? ` (${keybinding.getLabel()})` : "");
    super(action.id, label, cssClass);
    this.instantiationService = instantiationService;
    this.action = action;
    this.editor = editor;
  }
  run() {
    return Promise.resolve(this.instantiationService.invokeFunction((accessor) => this.action.run(accessor, this.editor, null)));
  }
};
QuickDiffWidgetEditorAction = __decorate([
  __param(3, IKeybindingService),
  __param(4, IInstantiationService)
], QuickDiffWidgetEditorAction);
let QuickDiffWidget = class QuickDiffWidget2 extends PeekViewWidget {
  static {
    __name(this, "QuickDiffWidget");
  }
  constructor(editor, model, themeService, instantiationService, menuService, contextKeyService, quickDiffService) {
    super(editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true, className: "dirty-diff" }, instantiationService);
    this.model = model;
    this.themeService = themeService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.quickDiffService = quickDiffService;
    this._index = 0;
    this._provider = "";
    this.height = void 0;
    this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
    this._applyTheme(themeService.getColorTheme());
    if (!Iterable.isEmpty(this.model.originalTextModels)) {
      contextKeyService = contextKeyService.createOverlay([
        ["originalResourceScheme", Iterable.first(this.model.originalTextModels)?.uri.scheme],
        ["originalResourceSchemes", Iterable.map(this.model.originalTextModels, (textModel) => textModel.uri.scheme)]
      ]);
    }
    this.create();
    if (editor.hasModel()) {
      this.title = basename(editor.getModel().uri);
    } else {
      this.title = "";
    }
    this.setTitle(this.title);
  }
  get provider() {
    return this._provider;
  }
  get index() {
    return this._index;
  }
  get visibleRange() {
    const visibleRanges = this.diffEditor.getModifiedEditor().getVisibleRanges();
    return visibleRanges.length >= 0 ? visibleRanges[0] : void 0;
  }
  showChange(index, usePosition = true) {
    const labeledChange = this.model.changes[index];
    const change = labeledChange.change;
    this._index = index;
    this.contextKeyService.createKey("originalResource", this.model.changes[index].original.toString());
    this.contextKeyService.createKey("originalResourceScheme", this.model.changes[index].original.scheme);
    this.updateActions();
    this._provider = labeledChange.label;
    this.change = change;
    if (Iterable.isEmpty(this.model.originalTextModels)) {
      return;
    }
    const onFirstDiffUpdate = Event.once(this.diffEditor.onDidUpdateDiff);
    onFirstDiffUpdate(() => setTimeout(() => this.revealChange(change), 0));
    const diffEditorModel = this.model.getDiffEditorModel(labeledChange.original);
    if (!diffEditorModel) {
      return;
    }
    this.diffEditor.setModel(diffEditorModel);
    const position = new Position(getModifiedEndLineNumber(change), 1);
    const lineHeight = this.editor.getOption(
      68
      /* EditorOption.lineHeight */
    );
    const editorHeight = this.editor.getLayoutInfo().height;
    const editorHeightInLines = Math.floor(editorHeight / lineHeight);
    const height = Math.min(getChangeHeight(change) + /* padding */
    8, Math.floor(editorHeightInLines / 3));
    this.updateDropdown(labeledChange.label);
    this.renderTitle(labeledChange.label);
    const changeType = getChangeType(change);
    const changeTypeColor = getChangeTypeColor(this.themeService.getColorTheme(), changeType);
    this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
    const providerSpecificChanges = [];
    let contextIndex = index;
    for (const change2 of this.model.changes) {
      if (change2.label === this.model.changes[this._index].label) {
        providerSpecificChanges.push(change2.change);
        if (labeledChange === change2) {
          contextIndex = providerSpecificChanges.length - 1;
        }
      }
    }
    this._actionbarWidget.context = [diffEditorModel.modified.uri, providerSpecificChanges, contextIndex];
    if (usePosition) {
      this.show(position, height);
      this.editor.setPosition(position);
      this.editor.focus();
    }
  }
  renderTitle(label) {
    const providerChanges = this.model.quickDiffChanges.get(label);
    const providerIndex = providerChanges.indexOf(this._index);
    let detail;
    if (!this.shouldUseDropdown()) {
      detail = this.model.changes.length > 1 ? nls.localize("changes", "{0} - {1} of {2} changes", label, providerIndex + 1, providerChanges.length) : nls.localize("change", "{0} - {1} of {2} change", label, providerIndex + 1, providerChanges.length);
      this.dropdownContainer.style.display = "none";
    } else {
      detail = this.model.changes.length > 1 ? nls.localize("multiChanges", "{0} of {1} changes", providerIndex + 1, providerChanges.length) : nls.localize("multiChange", "{0} of {1} change", providerIndex + 1, providerChanges.length);
      this.dropdownContainer.style.display = "inherit";
    }
    this.setTitle(this.title, detail);
  }
  switchQuickDiff(event) {
    const newProvider = event?.provider;
    if (newProvider === this.model.changes[this._index].label) {
      return;
    }
    let closestGreaterIndex = this._index < this.model.changes.length - 1 ? this._index + 1 : 0;
    for (let i = closestGreaterIndex; i !== this._index; i < this.model.changes.length - 1 ? i++ : i = 0) {
      if (this.model.changes[i].label === newProvider) {
        closestGreaterIndex = i;
        break;
      }
    }
    let closestLesserIndex = this._index > 0 ? this._index - 1 : this.model.changes.length - 1;
    for (let i = closestLesserIndex; i !== this._index; i > 0 ? i-- : i = this.model.changes.length - 1) {
      if (this.model.changes[i].label === newProvider) {
        closestLesserIndex = i;
        break;
      }
    }
    const closestIndex = Math.abs(this.model.changes[closestGreaterIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber) < Math.abs(this.model.changes[closestLesserIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber) ? closestGreaterIndex : closestLesserIndex;
    this.showChange(closestIndex, false);
  }
  shouldUseDropdown() {
    const quickDiffs = this.getQuickDiffsContainingChange();
    return quickDiffs.length > 1;
  }
  updateActions() {
    if (!this._actionbarWidget) {
      return;
    }
    const previous = this.instantiationService.createInstance(QuickDiffWidgetEditorAction, this.editor, new ShowPreviousChangeAction(this.editor), ThemeIcon.asClassName(gotoPreviousLocation));
    const next = this.instantiationService.createInstance(QuickDiffWidgetEditorAction, this.editor, new ShowNextChangeAction(this.editor), ThemeIcon.asClassName(gotoNextLocation));
    this._disposables.add(previous);
    this._disposables.add(next);
    if (this.menu) {
      this.menu.dispose();
    }
    this.menu = this.menuService.createMenu(MenuId.SCMChangeContext, this.contextKeyService);
    const actions = getFlatActionBarActions(this.menu.getActions({ shouldForwardArgs: true }));
    this._actionbarWidget.clear();
    this._actionbarWidget.push(actions.reverse(), { label: false, icon: true });
    this._actionbarWidget.push([next, previous], { label: false, icon: true });
    this._actionbarWidget.push(this._disposables.add(new Action("peekview.close", nls.localize("label.close", "Close"), ThemeIcon.asClassName(Codicon.close), true, () => this.dispose())), { label: false, icon: true });
  }
  updateDropdown(label) {
    const quickDiffs = this.getQuickDiffsContainingChange();
    this.dropdown?.setSelection(quickDiffs.map((quickDiff) => quickDiff.label), label);
  }
  getQuickDiffsContainingChange() {
    const change = this.model.changes[this._index];
    const quickDiffsWithChange = this.model.changes.filter((c) => change.change2.modified.overlapOrTouch(c.change2.modified)).map((c) => c.providerId);
    return this.model.quickDiffs.filter((quickDiff) => quickDiffsWithChange.includes(quickDiff.id) && this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id));
  }
  _fillHead(container) {
    super._fillHead(container, true);
    this.dropdownContainer = dom.prepend(this._titleElement, dom.$(".dropdown"));
    this.dropdown = this.instantiationService.createInstance(QuickDiffPickerViewItem, new QuickDiffPickerBaseAction((event) => this.switchQuickDiff(event)));
    this.dropdown.render(this.dropdownContainer);
  }
  _getActionBarOptions() {
    const actionRunner = new QuickDiffWidgetActionRunner();
    this._disposables.add(actionRunner);
    this._disposables.add(actionRunner.onDidRun((e) => {
      if (!(e.action instanceof QuickDiffWidgetEditorAction) && !e.error) {
        this.dispose();
      }
    }));
    return {
      ...super._getActionBarOptions(),
      actionRunner
    };
  }
  _fillBody(container) {
    const options = {
      scrollBeyondLastLine: true,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false
      },
      overviewRulerLanes: 2,
      fixedOverflowWidgets: true,
      minimap: { enabled: false },
      renderSideBySide: false,
      readOnly: false,
      renderIndicators: false,
      diffAlgorithm: "advanced",
      ignoreTrimWhitespace: false,
      stickyScroll: { enabled: false }
    };
    this.diffEditor = this.instantiationService.createInstance(EmbeddedDiffEditorWidget, container, options, {}, this.editor);
    this._disposables.add(this.diffEditor);
  }
  _onWidth(width) {
    if (typeof this.height === "undefined") {
      return;
    }
    this.diffEditor.layout({ height: this.height, width });
  }
  _doLayoutBody(height, width) {
    super._doLayoutBody(height, width);
    this.diffEditor.layout({ height, width });
    if (typeof this.height === "undefined" && this.change) {
      this.revealChange(this.change);
    }
    this.height = height;
  }
  revealChange(change) {
    let start, end;
    if (change.modifiedEndLineNumber === 0) {
      start = change.modifiedStartLineNumber;
      end = change.modifiedStartLineNumber + 1;
    } else if (change.originalEndLineNumber > 0) {
      start = change.modifiedStartLineNumber - 1;
      end = change.modifiedEndLineNumber + 1;
    } else {
      start = change.modifiedStartLineNumber;
      end = change.modifiedEndLineNumber;
    }
    this.diffEditor.revealLinesInCenter(
      start,
      end,
      1
      /* ScrollType.Immediate */
    );
  }
  _applyTheme(theme) {
    const borderColor = theme.getColor(peekViewBorder) || Color.transparent;
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor,
      headerBackgroundColor: theme.getColor(peekViewTitleBackground) || Color.transparent,
      primaryHeadingColor: theme.getColor(peekViewTitleForeground),
      secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
    });
  }
  revealRange(range) {
    this.editor.revealLineInCenterIfOutsideViewport(
      range.endLineNumber,
      0
      /* ScrollType.Smooth */
    );
  }
  hasFocus() {
    return this.diffEditor.hasTextFocus();
  }
  dispose() {
    super.dispose();
    this.menu?.dispose();
  }
};
QuickDiffWidget = __decorate([
  __param(2, IThemeService),
  __param(3, IInstantiationService),
  __param(4, IMenuService),
  __param(5, IContextKeyService),
  __param(6, IQuickDiffService)
], QuickDiffWidget);
let QuickDiffEditorController = class QuickDiffEditorController2 extends Disposable {
  static {
    __name(this, "QuickDiffEditorController");
  }
  static {
    QuickDiffEditorController_1 = this;
  }
  static {
    this.ID = "editor.contrib.quickdiff";
  }
  static get(editor) {
    return editor.getContribution(QuickDiffEditorController_1.ID);
  }
  constructor(editor, contextKeyService, configurationService, quickDiffModelService, instantiationService) {
    super();
    this.editor = editor;
    this.configurationService = configurationService;
    this.quickDiffModelService = quickDiffModelService;
    this.instantiationService = instantiationService;
    this.model = null;
    this.widget = null;
    this.session = Disposable.None;
    this.mouseDownInfo = null;
    this.enabled = false;
    this.gutterActionDisposables = new DisposableStore();
    this.enabled = !contextKeyService.getContextKeyValue("isInDiffEditor");
    this.stylesheet = domStylesheetsJs.createStyleSheet(void 0, void 0, this._store);
    if (this.enabled) {
      this.isQuickDiffVisible = isQuickDiffVisible.bindTo(contextKeyService);
      this._register(editor.onDidChangeModel(() => this.close()));
      const onDidChangeGutterAction = Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.diffDecorationsGutterAction"));
      this._register(onDidChangeGutterAction(this.onDidChangeGutterAction, this));
      this.onDidChangeGutterAction();
    }
  }
  onDidChangeGutterAction() {
    const gutterAction = this.configurationService.getValue("scm.diffDecorationsGutterAction");
    this.gutterActionDisposables.clear();
    if (gutterAction === "diff") {
      this.gutterActionDisposables.add(this.editor.onMouseDown((e) => this.onEditorMouseDown(e)));
      this.gutterActionDisposables.add(this.editor.onMouseUp((e) => this.onEditorMouseUp(e)));
      this.stylesheet.textContent = `
				.monaco-editor .dirty-diff-glyph {
					cursor: pointer;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-glyph:hover::before {
					height: 100%;
					width: 6px;
					left: -6px;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-deleted:hover::after {
					bottom: 0;
					border-top-width: 0;
					border-bottom-width: 0;
				}
			`;
    } else {
      this.stylesheet.textContent = ``;
    }
  }
  canNavigate() {
    return !this.widget || this.widget?.index === -1 || !!this.model && this.model.changes.length > 1;
  }
  refresh() {
    this.widget?.showChange(this.widget.index, false);
  }
  next(lineNumber) {
    if (!this.assertWidget()) {
      return;
    }
    if (!this.widget || !this.model) {
      return;
    }
    let index;
    if (this.editor.hasModel() && (typeof lineNumber === "number" || !this.widget.provider)) {
      index = this.model.findNextClosestChange(typeof lineNumber === "number" ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
    } else {
      const providerChanges = this.model.quickDiffChanges.get(this.widget.provider) ?? this.model.quickDiffChanges.values().next().value;
      const mapIndex = providerChanges.findIndex((value) => value === this.widget.index);
      index = providerChanges[rot(mapIndex + 1, providerChanges.length)];
    }
    this.widget.showChange(index);
  }
  previous(lineNumber) {
    if (!this.assertWidget()) {
      return;
    }
    if (!this.widget || !this.model) {
      return;
    }
    let index;
    if (this.editor.hasModel() && typeof lineNumber === "number") {
      index = this.model.findPreviousClosestChange(typeof lineNumber === "number" ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
    } else {
      const providerChanges = this.model.quickDiffChanges.get(this.widget.provider) ?? this.model.quickDiffChanges.values().next().value;
      const mapIndex = providerChanges.findIndex((value) => value === this.widget.index);
      index = providerChanges[rot(mapIndex - 1, providerChanges.length)];
    }
    this.widget.showChange(index);
  }
  close() {
    this.session.dispose();
    this.session = Disposable.None;
  }
  assertWidget() {
    if (!this.enabled) {
      return false;
    }
    if (this.widget) {
      if (!this.model || this.model.changes.length === 0) {
        this.close();
        return false;
      }
      return true;
    }
    const editorModel = this.editor.getModel();
    if (!editorModel) {
      return false;
    }
    const modelRef = this.quickDiffModelService.createQuickDiffModelReference(editorModel.uri);
    if (!modelRef) {
      return false;
    }
    if (modelRef.object.changes.length === 0) {
      modelRef.dispose();
      return false;
    }
    this.model = modelRef.object;
    this.widget = this.instantiationService.createInstance(QuickDiffWidget, this.editor, this.model);
    this.isQuickDiffVisible.set(true);
    const disposables = new DisposableStore();
    disposables.add(Event.once(this.widget.onDidClose)(this.close, this));
    const onDidModelChange = Event.chain(this.model.onDidChange, ($) => $.filter((e) => e.diff.length > 0).map((e) => e.diff));
    onDidModelChange(this.onDidModelChange, this, disposables);
    disposables.add(modelRef);
    disposables.add(this.widget);
    disposables.add(toDisposable(() => {
      this.model = null;
      this.widget = null;
      this.isQuickDiffVisible.set(false);
      this.editor.focus();
    }));
    this.session = disposables;
    return true;
  }
  onDidModelChange(splices) {
    if (!this.model || !this.widget || this.widget.hasFocus()) {
      return;
    }
    for (const splice of splices) {
      if (splice.start <= this.widget.index) {
        this.next();
        return;
      }
    }
    this.refresh();
  }
  onEditorMouseDown(e) {
    this.mouseDownInfo = null;
    const range = e.target.range;
    if (!range) {
      return;
    }
    if (!e.event.leftButton) {
      return;
    }
    if (e.target.type !== 4) {
      return;
    }
    if (!e.target.element) {
      return;
    }
    if (e.target.element.className.indexOf("dirty-diff-glyph") < 0) {
      return;
    }
    const data = e.target.detail;
    const offsetLeftInGutter = e.target.element.offsetLeft;
    const gutterOffsetX = data.offsetX - offsetLeftInGutter;
    if (gutterOffsetX < -3 || gutterOffsetX > 3) {
      return;
    }
    this.mouseDownInfo = { lineNumber: range.startLineNumber };
  }
  onEditorMouseUp(e) {
    if (!this.mouseDownInfo) {
      return;
    }
    const { lineNumber } = this.mouseDownInfo;
    this.mouseDownInfo = null;
    const range = e.target.range;
    if (!range || range.startLineNumber !== lineNumber) {
      return;
    }
    if (e.target.type !== 4) {
      return;
    }
    const editorModel = this.editor.getModel();
    if (!editorModel) {
      return;
    }
    const modelRef = this.quickDiffModelService.createQuickDiffModelReference(editorModel.uri);
    if (!modelRef) {
      return;
    }
    try {
      const index = modelRef.object.changes.findIndex((change) => lineIntersectsChange(lineNumber, change.change));
      if (index < 0) {
        return;
      }
      if (index === this.widget?.index) {
        this.close();
      } else {
        this.next(lineNumber);
      }
    } finally {
      modelRef.dispose();
    }
  }
  dispose() {
    this.gutterActionDisposables.dispose();
    super.dispose();
  }
};
QuickDiffEditorController = QuickDiffEditorController_1 = __decorate([
  __param(1, IContextKeyService),
  __param(2, IConfigurationService),
  __param(3, IQuickDiffModelService),
  __param(4, IInstantiationService)
], QuickDiffEditorController);
class ShowPreviousChangeAction extends EditorAction {
  static {
    __name(this, "ShowPreviousChangeAction");
  }
  constructor(outerEditor) {
    super({
      id: "editor.action.dirtydiff.previous",
      label: nls.localize2("show previous change", "Show Previous Change"),
      precondition: TextCompareEditorActiveContext.toNegated(),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 | 512 | 61,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
    this.outerEditor = outerEditor;
  }
  run(accessor) {
    const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
    if (!outerEditor) {
      return;
    }
    const controller = QuickDiffEditorController.get(outerEditor);
    if (!controller) {
      return;
    }
    if (!controller.canNavigate()) {
      return;
    }
    controller.previous();
  }
}
registerEditorAction(ShowPreviousChangeAction);
class ShowNextChangeAction extends EditorAction {
  static {
    __name(this, "ShowNextChangeAction");
  }
  constructor(outerEditor) {
    super({
      id: "editor.action.dirtydiff.next",
      label: nls.localize2("show next change", "Show Next Change"),
      precondition: TextCompareEditorActiveContext.toNegated(),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 512 | 61,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
    this.outerEditor = outerEditor;
  }
  run(accessor) {
    const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
    if (!outerEditor) {
      return;
    }
    const controller = QuickDiffEditorController.get(outerEditor);
    if (!controller) {
      return;
    }
    if (!controller.canNavigate()) {
      return;
    }
    controller.next();
  }
}
registerEditorAction(ShowNextChangeAction);
class GotoPreviousChangeAction extends EditorAction {
  static {
    __name(this, "GotoPreviousChangeAction");
  }
  constructor() {
    super({
      id: "workbench.action.editor.previousChange",
      label: nls.localize2("move to previous change", "Go to Previous Change"),
      precondition: ContextKeyExpr.and(TextCompareEditorActiveContext.toNegated(), quickDiffDecorationCount.notEqualsTo(0)),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 | 512 | 63,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  async run(accessor) {
    const outerEditor = getOuterEditorFromDiffEditor(accessor);
    const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
    const accessibilityService = accessor.get(IAccessibilityService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const quickDiffModelService = accessor.get(IQuickDiffModelService);
    if (!outerEditor || !outerEditor.hasModel()) {
      return;
    }
    const modelRef = quickDiffModelService.createQuickDiffModelReference(outerEditor.getModel().uri);
    try {
      if (!modelRef || modelRef.object.changes.length === 0) {
        return;
      }
      const lineNumber = outerEditor.getPosition().lineNumber;
      const index = modelRef.object.findPreviousClosestChange(lineNumber, false);
      const change = modelRef.object.changes[index];
      await playAccessibilitySymbolForChange(change.change, accessibilitySignalService);
      setPositionAndSelection(change.change, outerEditor, accessibilityService, codeEditorService);
    } finally {
      modelRef?.dispose();
    }
  }
}
registerEditorAction(GotoPreviousChangeAction);
class GotoNextChangeAction extends EditorAction {
  static {
    __name(this, "GotoNextChangeAction");
  }
  constructor() {
    super({
      id: "workbench.action.editor.nextChange",
      label: nls.localize2("move to next change", "Go to Next Change"),
      precondition: ContextKeyExpr.and(TextCompareEditorActiveContext.toNegated(), quickDiffDecorationCount.notEqualsTo(0)),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 512 | 63,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  async run(accessor) {
    const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
    const outerEditor = getOuterEditorFromDiffEditor(accessor);
    const accessibilityService = accessor.get(IAccessibilityService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const quickDiffModelService = accessor.get(IQuickDiffModelService);
    if (!outerEditor || !outerEditor.hasModel()) {
      return;
    }
    const modelRef = quickDiffModelService.createQuickDiffModelReference(outerEditor.getModel().uri);
    try {
      if (!modelRef || modelRef.object.changes.length === 0) {
        return;
      }
      const lineNumber = outerEditor.getPosition().lineNumber;
      const index = modelRef.object.findNextClosestChange(lineNumber, false);
      const change = modelRef.object.changes[index].change;
      await playAccessibilitySymbolForChange(change, accessibilitySignalService);
      setPositionAndSelection(change, outerEditor, accessibilityService, codeEditorService);
    } finally {
      modelRef?.dispose();
    }
  }
}
registerEditorAction(GotoNextChangeAction);
MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "7_change_nav",
  command: {
    id: "editor.action.dirtydiff.next",
    title: nls.localize({ key: "miGotoNextChange", comment: ["&& denotes a mnemonic"] }, "Next &&Change")
  },
  order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "7_change_nav",
  command: {
    id: "editor.action.dirtydiff.previous",
    title: nls.localize({ key: "miGotoPreviousChange", comment: ["&& denotes a mnemonic"] }, "Previous &&Change")
  },
  order: 2
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "closeQuickDiff",
  weight: 100 + 50,
  primary: 9,
  secondary: [
    1024 | 9
    /* KeyCode.Escape */
  ],
  when: ContextKeyExpr.and(isQuickDiffVisible),
  handler: /* @__PURE__ */ __name((accessor) => {
    const outerEditor = getOuterEditorFromDiffEditor(accessor);
    if (!outerEditor) {
      return;
    }
    const controller = QuickDiffEditorController.get(outerEditor);
    if (!controller) {
      return;
    }
    controller.close();
  }, "handler")
});
function setPositionAndSelection(change, editor, accessibilityService, codeEditorService) {
  const position = new Position(change.modifiedStartLineNumber, 1);
  editor.setPosition(position);
  editor.revealPositionInCenter(position);
  if (accessibilityService.isScreenReaderOptimized()) {
    editor.setSelection({ startLineNumber: change.modifiedStartLineNumber, startColumn: 0, endLineNumber: change.modifiedStartLineNumber, endColumn: Number.MAX_VALUE });
    codeEditorService.getActiveCodeEditor()?.writeScreenReaderContent("diff-navigation");
  }
}
__name(setPositionAndSelection, "setPositionAndSelection");
async function playAccessibilitySymbolForChange(change, accessibilitySignalService) {
  const changeType = getChangeType(change);
  switch (changeType) {
    case ChangeType.Add:
      accessibilitySignalService.playSignal(AccessibilitySignal.diffLineInserted, { allowManyInParallel: true, source: "quickDiffDecoration" });
      break;
    case ChangeType.Delete:
      accessibilitySignalService.playSignal(AccessibilitySignal.diffLineDeleted, { allowManyInParallel: true, source: "quickDiffDecoration" });
      break;
    case ChangeType.Modify:
      accessibilitySignalService.playSignal(AccessibilitySignal.diffLineModified, { allowManyInParallel: true, source: "quickDiffDecoration" });
      break;
  }
}
__name(playAccessibilitySymbolForChange, "playAccessibilitySymbolForChange");
function getOuterEditorFromDiffEditor(accessor) {
  const diffEditors = accessor.get(ICodeEditorService).listDiffEditors();
  for (const diffEditor of diffEditors) {
    if (diffEditor.hasTextFocus() && diffEditor instanceof EmbeddedDiffEditorWidget) {
      return diffEditor.getParentEditor();
    }
  }
  return getOuterEditor(accessor);
}
__name(getOuterEditorFromDiffEditor, "getOuterEditorFromDiffEditor");
export {
  GotoNextChangeAction,
  GotoPreviousChangeAction,
  QuickDiffEditorController,
  QuickDiffPickerBaseAction,
  QuickDiffPickerViewItem,
  ShowNextChangeAction,
  ShowPreviousChangeAction,
  isQuickDiffVisible
};
//# sourceMappingURL=quickDiffWidget.js.map
