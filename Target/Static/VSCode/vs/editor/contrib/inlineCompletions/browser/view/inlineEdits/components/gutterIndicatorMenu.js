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
import { ChildNode, LiveElement, n } from "../../../../../../../base/browser/dom.js";
import { ActionBar, IActionBarOptions } from "../../../../../../../base/browser/ui/actionbar/actionbar.js";
import { renderIcon } from "../../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { KeybindingLabel, unthemedKeybindingLabelOptions } from "../../../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { IAction } from "../../../../../../../base/common/actions.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { ResolvedKeybinding } from "../../../../../../../base/common/keybindings.js";
import { IObservable, autorun, constObservable, derived, derivedWithStore, observableFromEvent, observableValue } from "../../../../../../../base/common/observable.js";
import { OS } from "../../../../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../../../../base/common/themables.js";
import { localize } from "../../../../../../../nls.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { nativeHoverDelegate } from "../../../../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.js";
import { asCssVariable, descriptionForeground, editorActionListForeground, editorHoverBorder } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { ObservableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { EditorOption } from "../../../../../../common/config/editorOptions.js";
import { hideInlineCompletionId, inlineSuggestCommitId, jumpToNextInlineEditId, toggleShowCollapsedId } from "../../../controller/commandIds.js";
import { IInlineEditModel, InlineEditTabAction } from "../inlineEditsViewInterface.js";
import { FirstFnArg } from "../utils/utils.js";
let GutterIndicatorMenuContent = class {
  constructor(_model, _close, _editorObs, _contextKeyService, _keybindingService, _commandService) {
    this._model = _model;
    this._close = _close;
    this._editorObs = _editorObs;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    this._inlineEditsShowCollapsed = this._editorObs.getOption(EditorOption.inlineSuggest).map((s) => s.edits.showCollapsed);
  }
  static {
    __name(this, "GutterIndicatorMenuContent");
  }
  _inlineEditsShowCollapsed;
  toDisposableLiveElement() {
    return this._createHoverContent().toDisposableLiveElement();
  }
  _createHoverContent() {
    const activeElement = observableValue("active", void 0);
    const createOptionArgs = /* @__PURE__ */ __name((options) => {
      return {
        title: options.title,
        icon: options.icon,
        keybinding: typeof options.commandId === "string" ? this._getKeybinding(options.commandArgs ? void 0 : options.commandId) : derived((reader) => typeof options.commandId === "string" ? void 0 : this._getKeybinding(options.commandArgs ? void 0 : options.commandId.read(reader)).read(reader)),
        isActive: activeElement.map((v) => v === options.id),
        onHoverChange: /* @__PURE__ */ __name((v) => activeElement.set(v ? options.id : void 0, void 0), "onHoverChange"),
        onAction: /* @__PURE__ */ __name(() => {
          this._close(true);
          return this._commandService.executeCommand(typeof options.commandId === "string" ? options.commandId : options.commandId.get(), ...options.commandArgs ?? []);
        }, "onAction")
      };
    }, "createOptionArgs");
    const title = header(this._model.displayName);
    const gotoAndAccept = option(createOptionArgs({
      id: "gotoAndAccept",
      title: `${localize("goto", "Go To")} / ${localize("accept", "Accept")}`,
      icon: this._model.tabAction.map((action) => action === InlineEditTabAction.Accept ? Codicon.check : Codicon.arrowRight),
      commandId: this._model.tabAction.map((action) => action === InlineEditTabAction.Accept ? inlineSuggestCommitId : jumpToNextInlineEditId)
    }));
    const reject = option(createOptionArgs({
      id: "reject",
      title: localize("reject", "Reject"),
      icon: Codicon.close,
      commandId: hideInlineCompletionId
    }));
    const extensionCommands = this._model.extensionCommands.map((c, idx) => option(createOptionArgs({ id: c.id + "_" + idx, title: c.title, icon: Codicon.symbolEvent, commandId: c.id, commandArgs: c.arguments })));
    const toggleCollapsedMode = this._inlineEditsShowCollapsed.map(
      (showCollapsed) => showCollapsed ? option(createOptionArgs({
        id: "showExpanded",
        title: localize("showExpanded", "Show Expanded"),
        icon: Codicon.expandAll,
        commandId: toggleShowCollapsedId
      })) : option(createOptionArgs({
        id: "showCollapsed",
        title: localize("showCollapsed", "Show Collapsed"),
        icon: Codicon.collapseAll,
        commandId: toggleShowCollapsedId
      }))
    );
    const settings = option(createOptionArgs({
      id: "settings",
      title: localize("settings", "Settings"),
      icon: Codicon.gear,
      commandId: "workbench.action.openSettings",
      commandArgs: ["@tag:nextEditSuggestions"]
    }));
    const actions = this._model.action ? [this._model.action] : [];
    const actionBarFooter = actions.length > 0 ? actionBar(
      actions.map((action) => ({
        id: action.id,
        label: action.title,
        enabled: true,
        run: /* @__PURE__ */ __name(() => this._commandService.executeCommand(action.id, ...action.arguments ?? []), "run"),
        class: void 0,
        tooltip: action.tooltip ?? action.title
      })),
      {
        hoverDelegate: nativeHoverDelegate
        /* unable to show hover inside another hover */
      }
    ) : void 0;
    return hoverContent([
      title,
      gotoAndAccept,
      reject,
      toggleCollapsedMode,
      settings,
      extensionCommands.length ? separator() : void 0,
      ...extensionCommands,
      actionBarFooter ? separator() : void 0,
      actionBarFooter
    ]);
  }
  _getKeybinding(commandId) {
    if (!commandId) {
      return constObservable(void 0);
    }
    return observableFromEvent(this._contextKeyService.onDidChangeContext, () => this._keybindingService.lookupKeybinding(commandId));
  }
};
GutterIndicatorMenuContent = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ICommandService)
], GutterIndicatorMenuContent);
function hoverContent(content) {
  return n.div({
    class: "content",
    style: {
      margin: 4,
      minWidth: 150
    }
  }, content);
}
__name(hoverContent, "hoverContent");
function header(title) {
  return n.div({
    class: "header",
    style: {
      color: asCssVariable(descriptionForeground),
      fontSize: "12px",
      fontWeight: "600",
      padding: "0 10px",
      lineHeight: 26
    }
  }, [title]);
}
__name(header, "header");
function option(props) {
  return derivedWithStore((_reader, store) => n.div({
    class: ["monaco-menu-option", props.isActive?.map((v) => v && "active")],
    onmouseenter: /* @__PURE__ */ __name(() => props.onHoverChange?.(true), "onmouseenter"),
    onmouseleave: /* @__PURE__ */ __name(() => props.onHoverChange?.(false), "onmouseleave"),
    onclick: props.onAction,
    onkeydown: /* @__PURE__ */ __name((e) => {
      if (e.key === "Enter") {
        props.onAction?.();
      }
    }, "onkeydown"),
    tabIndex: 0,
    style: {
      borderRadius: 3
      // same as hover widget border radius
    }
  }, [
    n.elem("span", {
      style: {
        fontSize: 16,
        display: "flex"
      }
    }, [ThemeIcon.isThemeIcon(props.icon) ? renderIcon(props.icon) : props.icon.map((icon) => renderIcon(icon))]),
    n.elem("span", {}, [props.title]),
    n.div({
      style: { marginLeft: "auto", opacity: "0.6" },
      ref: /* @__PURE__ */ __name((elem) => {
        const keybindingLabel = store.add(new KeybindingLabel(elem, OS, { disableTitle: true, ...unthemedKeybindingLabelOptions }));
        store.add(autorun((reader) => {
          keybindingLabel.set(props.keybinding.read(reader));
        }));
      }, "ref")
    })
  ]));
}
__name(option, "option");
function actionBar(actions, options) {
  return derivedWithStore((_reader, store) => n.div({
    class: ["action-widget-action-bar"],
    style: {
      padding: "0 10px"
    }
  }, [
    n.div({
      ref: /* @__PURE__ */ __name((elem) => {
        const actionBar2 = store.add(new ActionBar(elem, options));
        actionBar2.push(actions, { icon: false, label: true });
      }, "ref")
    })
  ]));
}
__name(actionBar, "actionBar");
function separator() {
  return n.div({
    id: "inline-edit-gutter-indicator-menu-separator",
    class: "menu-separator",
    style: {
      color: asCssVariable(editorActionListForeground),
      padding: "4px 0"
    }
  }, n.div({
    style: {
      borderBottom: `1px solid ${asCssVariable(editorHoverBorder)}`
    }
  }));
}
__name(separator, "separator");
export {
  GutterIndicatorMenuContent
};
//# sourceMappingURL=gutterIndicatorMenu.js.map
