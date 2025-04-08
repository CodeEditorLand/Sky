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
import { h, n } from "../../../../../base/browser/dom.js";
import { renderMarkdown } from "../../../../../base/browser/markdownRenderer.js";
import { ActionViewItem } from "../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { KeybindingLabel, unthemedKeybindingLabelOptions } from "../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { Action, IAction, Separator } from "../../../../../base/common/actions.js";
import { equals } from "../../../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { createHotClass } from "../../../../../base/common/hotReloadHelpers.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, autorun, autorunWithStore, derived, derivedObservableWithCache, derivedWithStore, observableFromEvent } from "../../../../../base/common/observable.js";
import { OS } from "../../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { MenuEntryActionViewItem, getActionBarActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuWorkbenchToolBarOptions, WorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { IMenuService, MenuId, MenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../../browser/editorBrowser.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import { Command, InlineCompletionTriggerKind, InlineCompletionWarning } from "../../../../common/languages.js";
import { PositionAffinity } from "../../../../common/model.js";
import { showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId } from "../controller/commandIds.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import "./inlineCompletionsHintsWidget.css";
let InlineCompletionsHintsWidget = class extends Disposable {
  constructor(editor, model, instantiationService) {
    super();
    this.editor = editor;
    this.model = model;
    this.instantiationService = instantiationService;
    this._register(autorunWithStore((reader, store) => {
      const model2 = this.model.read(reader);
      if (!model2 || !this.alwaysShowToolbar.read(reader)) {
        return;
      }
      const contentWidgetValue = derivedWithStore((reader2, store2) => {
        const contentWidget = store2.add(this.instantiationService.createInstance(
          InlineSuggestionHintsContentWidget.hot.read(reader2),
          this.editor,
          true,
          this.position,
          model2.selectedInlineCompletionIndex,
          model2.inlineCompletionsCount,
          model2.activeCommands,
          model2.warning,
          () => {
          }
        ));
        editor.addContentWidget(contentWidget);
        store2.add(toDisposable(() => editor.removeContentWidget(contentWidget)));
        store2.add(autorun((reader3) => {
          const position = this.position.read(reader3);
          if (!position) {
            return;
          }
          if (model2.lastTriggerKind.read(reader3) !== InlineCompletionTriggerKind.Explicit) {
            model2.triggerExplicitly();
          }
        }));
        return contentWidget;
      });
      const hadPosition = derivedObservableWithCache(this, (reader2, lastValue) => !!this.position.read(reader2) || !!lastValue);
      store.add(autorun((reader2) => {
        if (hadPosition.read(reader2)) {
          contentWidgetValue.read(reader2);
        }
      }));
    }));
  }
  static {
    __name(this, "InlineCompletionsHintsWidget");
  }
  alwaysShowToolbar = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.inlineSuggest).showToolbar === "always");
  sessionPosition = void 0;
  position = derived(this, (reader) => {
    const ghostText = this.model.read(reader)?.primaryGhostText.read(reader);
    if (!this.alwaysShowToolbar.read(reader) || !ghostText || ghostText.parts.length === 0) {
      this.sessionPosition = void 0;
      return null;
    }
    const firstColumn = ghostText.parts[0].column;
    if (this.sessionPosition && this.sessionPosition.lineNumber !== ghostText.lineNumber) {
      this.sessionPosition = void 0;
    }
    const position = new Position(ghostText.lineNumber, Math.min(firstColumn, this.sessionPosition?.column ?? Number.MAX_SAFE_INTEGER));
    this.sessionPosition = position;
    return position;
  });
};
InlineCompletionsHintsWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], InlineCompletionsHintsWidget);
const inlineSuggestionHintsNextIcon = registerIcon("inline-suggestion-hints-next", Codicon.chevronRight, localize("parameterHintsNextIcon", "Icon for show next parameter hint."));
const inlineSuggestionHintsPreviousIcon = registerIcon("inline-suggestion-hints-previous", Codicon.chevronLeft, localize("parameterHintsPreviousIcon", "Icon for show previous parameter hint."));
let InlineSuggestionHintsContentWidget = class extends Disposable {
  constructor(editor, withBorder, _position, _currentSuggestionIdx, _suggestionCount, _extraCommands, _warning, _relayout, _commandService, instantiationService, keybindingService, _contextKeyService, _menuService) {
    super();
    this.editor = editor;
    this.withBorder = withBorder;
    this._position = _position;
    this._currentSuggestionIdx = _currentSuggestionIdx;
    this._suggestionCount = _suggestionCount;
    this._extraCommands = _extraCommands;
    this._warning = _warning;
    this._relayout = _relayout;
    this._commandService = _commandService;
    this.keybindingService = keybindingService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._register(autorun((reader) => {
      this._warningMessageContentNode.read(reader);
      this._warningMessageNode.readEffect(reader);
      this._relayout();
    }));
    this.toolBar = this._register(instantiationService.createInstance(CustomizedMenuWorkbenchToolBar, this.nodes.toolBar, MenuId.InlineSuggestionToolbar, {
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name((g) => g.startsWith("primary"), "primaryGroup") },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction) {
          return instantiationService.createInstance(StatusBarViewItem, action, void 0);
        }
        if (action === this.availableSuggestionCountAction) {
          const a = new ActionViewItemWithClassName(void 0, action, { label: true, icon: false });
          a.setClass("availableSuggestionCount");
          return a;
        }
        return void 0;
      }, "actionViewItemProvider"),
      telemetrySource: "InlineSuggestionToolbar"
    }));
    this.toolBar.setPrependedPrimaryActions([
      this.previousAction,
      this.availableSuggestionCountAction,
      this.nextAction
    ]);
    this._register(this.toolBar.onDidChangeDropdownVisibility((e) => {
      InlineSuggestionHintsContentWidget._dropDownVisible = e;
    }));
    this._register(autorun((reader) => {
      this._position.read(reader);
      this.editor.layoutContentWidget(this);
    }));
    this._register(autorun((reader) => {
      const suggestionCount = this._suggestionCount.read(reader);
      const currentSuggestionIdx = this._currentSuggestionIdx.read(reader);
      if (suggestionCount !== void 0) {
        this.clearAvailableSuggestionCountLabelDebounced.cancel();
        this.availableSuggestionCountAction.label = `${currentSuggestionIdx + 1}/${suggestionCount}`;
      } else {
        this.clearAvailableSuggestionCountLabelDebounced.schedule();
      }
      if (suggestionCount !== void 0 && suggestionCount > 1) {
        this.disableButtonsDebounced.cancel();
        this.previousAction.enabled = this.nextAction.enabled = true;
      } else {
        this.disableButtonsDebounced.schedule();
      }
    }));
    this._register(autorun((reader) => {
      const extraCommands = this._extraCommands.read(reader);
      const extraActions = extraCommands.map((c) => ({
        class: void 0,
        id: c.id,
        enabled: true,
        tooltip: c.tooltip || "",
        label: c.title,
        run: /* @__PURE__ */ __name((event) => {
          return this._commandService.executeCommand(c.id);
        }, "run")
      }));
      for (const [_, group] of this.inlineCompletionsActionsMenus.getActions()) {
        for (const action of group) {
          if (action instanceof MenuItemAction) {
            extraActions.push(action);
          }
        }
      }
      if (extraActions.length > 0) {
        extraActions.unshift(new Separator());
      }
      this.toolBar.setAdditionalSecondaryActions(extraActions);
    }));
  }
  static {
    __name(this, "InlineSuggestionHintsContentWidget");
  }
  static hot = createHotClass(InlineSuggestionHintsContentWidget);
  static _dropDownVisible = false;
  static get dropDownVisible() {
    return this._dropDownVisible;
  }
  static id = 0;
  id = `InlineSuggestionHintsContentWidget${InlineSuggestionHintsContentWidget.id++}`;
  allowEditorOverflow = true;
  suppressMouseDown = false;
  _warningMessageContentNode = derivedWithStore((reader, store) => {
    const warning = this._warning.read(reader);
    if (!warning) {
      return void 0;
    }
    if (typeof warning.message === "string") {
      return warning.message;
    }
    const markdownElement = store.add(renderMarkdown(warning.message));
    return markdownElement.element;
  });
  _warningMessageNode = n.div({
    class: "warningMessage",
    style: {
      maxWidth: 400,
      margin: 4,
      marginBottom: 4,
      display: derived((reader) => this._warning.read(reader) ? "block" : "none")
    }
  }, [
    this._warningMessageContentNode
  ]).keepUpdated(this._store);
  nodes = h("div.inlineSuggestionsHints", { className: this.withBorder ? "monaco-hover monaco-hover-content" : "" }, [
    this._warningMessageNode.element,
    h("div@toolBar")
  ]);
  createCommandAction(commandId, label, iconClassName) {
    const action = new Action(
      commandId,
      label,
      iconClassName,
      true,
      () => this._commandService.executeCommand(commandId)
    );
    const kb = this.keybindingService.lookupKeybinding(commandId, this._contextKeyService);
    let tooltip = label;
    if (kb) {
      tooltip = localize({ key: "content", comment: ["A label", "A keybinding"] }, "{0} ({1})", label, kb.getLabel());
    }
    action.tooltip = tooltip;
    return action;
  }
  previousAction = this._register(this.createCommandAction(showPreviousInlineSuggestionActionId, localize("previous", "Previous"), ThemeIcon.asClassName(inlineSuggestionHintsPreviousIcon)));
  availableSuggestionCountAction = this._register(new Action("inlineSuggestionHints.availableSuggestionCount", "", void 0, false));
  nextAction = this._register(this.createCommandAction(showNextInlineSuggestionActionId, localize("next", "Next"), ThemeIcon.asClassName(inlineSuggestionHintsNextIcon)));
  toolBar;
  // TODO@hediet: deprecate MenuId.InlineCompletionsActions
  inlineCompletionsActionsMenus = this._register(this._menuService.createMenu(
    MenuId.InlineCompletionsActions,
    this._contextKeyService
  ));
  clearAvailableSuggestionCountLabelDebounced = this._register(new RunOnceScheduler(() => {
    this.availableSuggestionCountAction.label = "";
  }, 100));
  disableButtonsDebounced = this._register(new RunOnceScheduler(() => {
    this.previousAction.enabled = this.nextAction.enabled = false;
  }, 100));
  getId() {
    return this.id;
  }
  getDomNode() {
    return this.nodes.root;
  }
  getPosition() {
    return {
      position: this._position.get(),
      preference: [ContentWidgetPositionPreference.ABOVE, ContentWidgetPositionPreference.BELOW],
      positionAffinity: PositionAffinity.LeftOfInjectedText
    };
  }
};
InlineSuggestionHintsContentWidget = __decorateClass([
  __decorateParam(8, ICommandService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IMenuService)
], InlineSuggestionHintsContentWidget);
class ActionViewItemWithClassName extends ActionViewItem {
  static {
    __name(this, "ActionViewItemWithClassName");
  }
  _className = void 0;
  setClass(className) {
    this._className = className;
  }
  render(container) {
    super.render(container);
    if (this._className) {
      container.classList.add(this._className);
    }
  }
  updateTooltip() {
  }
}
class StatusBarViewItem extends MenuEntryActionViewItem {
  static {
    __name(this, "StatusBarViewItem");
  }
  updateLabel() {
    const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService, true);
    if (!kb) {
      return super.updateLabel();
    }
    if (this.label) {
      const div = h("div.keybinding").root;
      const k = this._register(new KeybindingLabel(div, OS, { disableTitle: true, ...unthemedKeybindingLabelOptions }));
      k.set(kb);
      this.label.textContent = this._action.label;
      this.label.appendChild(div);
      this.label.classList.add("inlineSuggestionStatusBarItemLabel");
    }
  }
  updateTooltip() {
  }
}
let CustomizedMenuWorkbenchToolBar = class extends WorkbenchToolBar {
  constructor(container, menuId, options2, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService) {
    super(container, { resetMenu: menuId, ...options2 }, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this.menuId = menuId;
    this.options2 = options2;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this._store.add(this.menu.onDidChange(() => this.updateToolbar()));
    this.updateToolbar();
  }
  static {
    __name(this, "CustomizedMenuWorkbenchToolBar");
  }
  menu = this._store.add(this.menuService.createMenu(this.menuId, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
  additionalActions = [];
  prependedPrimaryActions = [];
  additionalPrimaryActions = [];
  updateToolbar() {
    const { primary, secondary } = getActionBarActions(
      this.menu.getActions(this.options2?.menuOptions),
      this.options2?.toolbarOptions?.primaryGroup,
      this.options2?.toolbarOptions?.shouldInlineSubmenu,
      this.options2?.toolbarOptions?.useSeparatorsInPrimaryActions
    );
    secondary.push(...this.additionalActions);
    primary.unshift(...this.prependedPrimaryActions);
    primary.push(...this.additionalPrimaryActions);
    this.setActions(primary, secondary);
  }
  setPrependedPrimaryActions(actions) {
    if (equals(this.prependedPrimaryActions, actions, (a, b) => a === b)) {
      return;
    }
    this.prependedPrimaryActions = actions;
    this.updateToolbar();
  }
  setAdditionalPrimaryActions(actions) {
    if (equals(this.additionalPrimaryActions, actions, (a, b) => a === b)) {
      return;
    }
    this.additionalPrimaryActions = actions;
    this.updateToolbar();
  }
  setAdditionalSecondaryActions(actions) {
    if (equals(this.additionalActions, actions, (a, b) => a === b)) {
      return;
    }
    this.additionalActions = actions;
    this.updateToolbar();
  }
};
CustomizedMenuWorkbenchToolBar = __decorateClass([
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ITelemetryService)
], CustomizedMenuWorkbenchToolBar);
export {
  CustomizedMenuWorkbenchToolBar,
  InlineCompletionsHintsWidget,
  InlineSuggestionHintsContentWidget
};
//# sourceMappingURL=inlineCompletionsHintsWidget.js.map
