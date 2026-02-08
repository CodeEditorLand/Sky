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
import { n } from "../../../../../../../base/browser/dom.js";
import { ActionBar } from "../../../../../../../base/browser/ui/actionbar/actionbar.js";
import { renderIcon } from "../../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { KeybindingLabel } from "../../../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { autorun, constObservable, derived, observableFromEvent, observableValue } from "../../../../../../../base/common/observable.js";
import { OS } from "../../../../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../../../../base/common/themables.js";
import { localize } from "../../../../../../../nls.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { nativeHoverDelegate } from "../../../../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.js";
import { defaultKeybindingLabelStyles } from "../../../../../../../platform/theme/browser/defaultStyles.js";
import { asCssVariable, descriptionForeground, editorActionListForeground, editorHoverBorder } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { hideInlineCompletionId, inlineSuggestCommitAlternativeActionId, inlineSuggestCommitId, toggleShowCollapsedId } from "../../../controller/commandIds.js";
let GutterIndicatorMenuContent = class GutterIndicatorMenuContent2 {
  static {
    __name(this, "GutterIndicatorMenuContent");
  }
  constructor(_editorObs, _data, _close, _contextKeyService, _keybindingService, _commandService) {
    this._editorObs = _editorObs;
    this._data = _data;
    this._close = _close;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    this._inlineEditsShowCollapsed = this._editorObs.getOption(
      71
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.showCollapsed);
  }
  toDisposableLiveElement() {
    return this._createHoverContent().toDisposableLiveElement();
  }
  _createHoverContent() {
    const activeElement = observableValue("active", void 0);
    const createOptionArgs = /* @__PURE__ */ __name((options) => {
      return {
        title: options.title,
        icon: options.icon,
        keybinding: typeof options.commandId === "string" ? this._getKeybinding(options.commandArgs ? void 0 : options.commandId) : derived(this, (reader) => typeof options.commandId === "string" ? void 0 : this._getKeybinding(options.commandArgs ? void 0 : options.commandId.read(reader)).read(reader)),
        isActive: activeElement.map((v) => v === options.id),
        onHoverChange: /* @__PURE__ */ __name((v) => activeElement.set(v ? options.id : void 0, void 0), "onHoverChange"),
        onAction: /* @__PURE__ */ __name(() => {
          this._close(true);
          return this._commandService.executeCommand(typeof options.commandId === "string" ? options.commandId : options.commandId.get(), ...options.commandArgs ?? []);
        }, "onAction")
      };
    }, "createOptionArgs");
    const title = header(this._data.displayName);
    const gotoAndAccept = option(createOptionArgs({
      id: "gotoAndAccept",
      title: localize("gotoAndAccept", "Go To / Accept"),
      icon: Codicon.check,
      commandId: inlineSuggestCommitId
    }));
    const reject = option(createOptionArgs({
      id: "reject",
      title: localize("reject", "Reject"),
      icon: Codicon.close,
      commandId: hideInlineCompletionId
    }));
    const alternativeCommand = this._data.alternativeAction ? option(createOptionArgs({
      id: "alternativeCommand",
      title: this._data.alternativeAction.command.title,
      icon: this._data.alternativeAction.icon,
      commandId: inlineSuggestCommitAlternativeActionId
    })) : void 0;
    const extensionCommands = this._data.extensionCommands.map((c, idx) => option(createOptionArgs({
      id: c.command.id + "_" + idx,
      title: c.command.title,
      icon: c.icon ?? Codicon.symbolEvent,
      commandId: c.command.id,
      commandArgs: c.command.arguments
    })));
    const showModelEnabled = false;
    const modelOptions = showModelEnabled ? this._data.modelInfo?.models.map((m) => option({
      title: m.name,
      icon: m.id === this._data.modelInfo?.currentModelId ? Codicon.check : Codicon.circle,
      keybinding: constObservable(void 0),
      isActive: activeElement.map((v) => v === "model_" + m.id),
      onHoverChange: /* @__PURE__ */ __name((v) => activeElement.set(v ? "model_" + m.id : void 0, void 0), "onHoverChange"),
      onAction: /* @__PURE__ */ __name(() => {
        this._close(true);
        this._data.setModelId?.(m.id);
      }, "onAction")
    })) ?? [] : [];
    const toggleCollapsedMode = this._inlineEditsShowCollapsed.map((showCollapsed) => showCollapsed ? option(createOptionArgs({
      id: "showExpanded",
      title: localize("showExpanded", "Show Expanded"),
      icon: Codicon.expandAll,
      commandId: toggleShowCollapsedId
    })) : option(createOptionArgs({
      id: "showCollapsed",
      title: localize("showCollapsed", "Show Collapsed"),
      icon: Codicon.collapseAll,
      commandId: toggleShowCollapsedId
    })));
    const snooze = option(createOptionArgs({
      id: "snooze",
      title: localize("snooze", "Snooze"),
      icon: Codicon.bellSlash,
      commandId: "editor.action.inlineSuggest.snooze"
    }));
    const settings = option(createOptionArgs({
      id: "settings",
      title: localize("settings", "Settings"),
      icon: Codicon.gear,
      commandId: "workbench.action.openSettings",
      commandArgs: ["@tag:nextEditSuggestions"]
    }));
    const actions = this._data.action ? [this._data.action] : [];
    const actionBarFooter = actions.length > 0 ? actionBar(actions.map((action) => ({
      id: action.id,
      label: action.title + "...",
      enabled: true,
      run: /* @__PURE__ */ __name(() => this._commandService.executeCommand(action.id, ...action.arguments ?? []), "run"),
      class: void 0,
      tooltip: action.tooltip ?? action.title
    })), {
      hoverDelegate: nativeHoverDelegate
      /* unable to show hover inside another hover */
    }) : void 0;
    return hoverContent([
      title,
      gotoAndAccept,
      alternativeCommand,
      reject,
      toggleCollapsedMode,
      modelOptions.length ? separator() : void 0,
      ...modelOptions,
      extensionCommands.length ? separator() : void 0,
      snooze,
      settings,
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
GutterIndicatorMenuContent = __decorate([
  __param(3, IContextKeyService),
  __param(4, IKeybindingService),
  __param(5, ICommandService)
], GutterIndicatorMenuContent);
function hoverContent(content) {
  return n.div({
    class: "content",
    style: {
      margin: 4,
      minWidth: 180
    }
  }, content);
}
__name(hoverContent, "hoverContent");
function header(title) {
  return n.div({
    class: "header",
    style: {
      color: asCssVariable(descriptionForeground),
      fontSize: "13px",
      fontWeight: "600",
      padding: "0 4px",
      lineHeight: 28
    }
  }, [title]);
}
__name(header, "header");
function option(props) {
  return derived({ name: "inlineEdits.option" }, (_reader) => n.div({
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
      style: { marginLeft: "auto" },
      ref: /* @__PURE__ */ __name((elem) => {
        const keybindingLabel = _reader.store.add(new KeybindingLabel(elem, OS, {
          disableTitle: true,
          ...defaultKeybindingLabelStyles,
          keybindingLabelShadow: void 0,
          keybindingLabelForeground: asCssVariable(descriptionForeground),
          keybindingLabelBackground: "transparent",
          keybindingLabelBorder: "transparent",
          keybindingLabelBottomBorder: void 0
        }));
        _reader.store.add(autorun((reader) => {
          keybindingLabel.set(props.keybinding.read(reader));
        }));
      }, "ref")
    })
  ]));
}
__name(option, "option");
function actionBar(actions, options) {
  return derived({ name: "inlineEdits.actionBar" }, (_reader) => n.div({
    class: ["action-widget-action-bar"],
    style: {
      padding: "3px 24px"
    }
  }, [
    n.div({
      ref: /* @__PURE__ */ __name((elem) => {
        const actionBar2 = _reader.store.add(new ActionBar(elem, options));
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
      padding: "2px 0"
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
