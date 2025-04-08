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
import * as dom from "../../../../../base/browser/dom.js";
import { AutoOpenBarrier } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { localize2 } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { GeneralShellType, TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalContribution, ITerminalInstance, IXtermTerminal } from "../../../terminal/browser/terminal.js";
import { registerActiveInstanceAction, registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { TerminalSuggestCommandId } from "../common/terminal.suggest.js";
import { terminalSuggestConfigSection, TerminalSuggestSettingId } from "../common/terminalSuggestConfiguration.js";
import { ITerminalCompletionService, TerminalCompletionService } from "./terminalCompletionService.js";
import { InstantiationType, registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { SuggestAddon } from "./terminalSuggestAddon.js";
import { TerminalClipboardContribution } from "../../clipboard/browser/terminal.clipboard.contribution.js";
import { PwshCompletionProviderAddon } from "./pwshCompletionProviderAddon.js";
import { SimpleSuggestContext } from "../../../../services/suggest/browser/simpleSuggestWidget.js";
import { SuggestDetailsClassName } from "../../../../services/suggest/browser/simpleSuggestWidgetDetails.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import "./terminalSymbolIcons.js";
registerSingleton(ITerminalCompletionService, TerminalCompletionService, InstantiationType.Delayed);
let TerminalSuggestContribution = class extends DisposableStore {
  constructor(_ctx, _contextKeyService, _configurationService, _instantiationService, _terminalCompletionService) {
    super();
    this._ctx = _ctx;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalCompletionService = _terminalCompletionService;
    this.add(toDisposable(() => {
      this._addon?.dispose();
      this._pwshAddon?.dispose();
    }));
    this._terminalSuggestWidgetVisibleContextKey = TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
    this.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TerminalSuggestSettingId.Enabled)) {
        const completionsEnabled = this._configurationService.getValue(terminalSuggestConfigSection).enabled;
        if (!completionsEnabled) {
          this._addon.clear();
          this._pwshAddon.clear();
        }
        const xtermRaw = this._ctx.instance.xterm?.raw;
        if (!!xtermRaw && completionsEnabled) {
          this._loadAddons(xtermRaw);
        }
      }
    }));
  }
  static {
    __name(this, "TerminalSuggestContribution");
  }
  static ID = "terminal.suggest";
  static get(instance) {
    return instance.getContribution(TerminalSuggestContribution.ID);
  }
  _addon = new MutableDisposable();
  _pwshAddon = new MutableDisposable();
  _terminalSuggestWidgetVisibleContextKey;
  get addon() {
    return this._addon.value;
  }
  get pwshAddon() {
    return this._pwshAddon.value;
  }
  xtermOpen(xterm) {
    const config = this._configurationService.getValue(terminalSuggestConfigSection);
    const enabled = config.enabled;
    if (!enabled) {
      return;
    }
    this._loadAddons(xterm.raw);
    this.add(Event.runAndSubscribe(this._ctx.instance.onDidChangeShellType, async () => {
      this._refreshAddons();
    }));
  }
  async _loadPwshCompletionAddon(xterm) {
    if (this._ctx.instance.shellType !== GeneralShellType.PowerShell || this._ctx.instance.shellLaunchConfig.executable?.endsWith("WindowsPowerShell\\v1.0\\powershell.exe")) {
      this._pwshAddon.clear();
      return;
    }
    await this._ctx.instance.processReady;
    const processTraits = this._ctx.processManager.processTraits;
    if (processTraits?.windowsPty && (processTraits.windowsPty.backend !== "conpty" || processTraits?.windowsPty.buildNumber <= 19045)) {
      return;
    }
    const pwshCompletionProviderAddon = this._pwshAddon.value = this._instantiationService.createInstance(PwshCompletionProviderAddon, this._ctx.instance.capabilities);
    xterm.loadAddon(pwshCompletionProviderAddon);
    this.add(pwshCompletionProviderAddon);
    this.add(pwshCompletionProviderAddon.onDidRequestSendText((text) => {
      this._ctx.instance.sendText(text, false);
    }));
    this.add(this._terminalCompletionService.registerTerminalCompletionProvider("builtinPwsh", pwshCompletionProviderAddon.id, pwshCompletionProviderAddon));
    if (!isWindows) {
      let barrier;
      if (pwshCompletionProviderAddon) {
        this.add(pwshCompletionProviderAddon.onDidRequestSendText(() => {
          barrier = new AutoOpenBarrier(2e3);
          this._ctx.instance.pauseInputEvents(barrier);
        }));
      }
      if (this._pwshAddon.value) {
        this.add(this._pwshAddon.value.onDidReceiveCompletions(() => {
          barrier?.open();
          barrier = void 0;
        }));
      } else {
        throw Error("no addon");
      }
    }
  }
  _loadAddons(xterm) {
    if (this._addon.value) {
      return;
    }
    const addon = this._addon.value = this._instantiationService.createInstance(SuggestAddon, this._ctx.instance.shellType, this._ctx.instance.capabilities, this._terminalSuggestWidgetVisibleContextKey);
    xterm.loadAddon(addon);
    this._loadPwshCompletionAddon(xterm);
    if (this._ctx.instance.target === TerminalLocation.Editor) {
      addon.setContainerWithOverflow(xterm.element);
    } else {
      addon.setContainerWithOverflow(dom.findParentWithClass(xterm.element, "panel"));
    }
    addon.setScreen(xterm.element.querySelector(".xterm-screen"));
    this.add(dom.addDisposableListener(this._ctx.instance.domElement, dom.EventType.FOCUS_OUT, (e) => {
      const focusedElement = e.relatedTarget;
      if (focusedElement?.classList.contains(SuggestDetailsClassName)) {
        return;
      }
      addon.hideSuggestWidget(true);
    }));
    this.add(addon.onAcceptedCompletion(async (text) => {
      this._ctx.instance.focus();
      this._ctx.instance.sendText(text, false);
    }));
    const clipboardContrib = TerminalClipboardContribution.get(this._ctx.instance);
    this.add(clipboardContrib.onWillPaste(() => addon.isPasting = true));
    this.add(clipboardContrib.onDidPaste(() => {
      setTimeout(() => addon.isPasting = false, 100);
    }));
    if (!isWindows) {
      let barrier;
      this.add(addon.onDidReceiveCompletions(() => {
        barrier?.open();
        barrier = void 0;
      }));
    }
  }
  _refreshAddons() {
    const addon = this._addon.value;
    if (!addon) {
      return;
    }
    addon.shellType = this._ctx.instance.shellType;
    if (!this._ctx.instance.xterm?.raw) {
      return;
    }
    this._loadPwshCompletionAddon(this._ctx.instance.xterm.raw);
  }
};
TerminalSuggestContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITerminalCompletionService)
], TerminalSuggestContribution);
registerTerminalContribution(TerminalSuggestContribution.ID, TerminalSuggestContribution);
registerTerminalAction({
  id: TerminalSuggestCommandId.ConfigureSettings,
  title: localize2("workbench.action.terminal.configureSuggestSettings", "Configure"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Comma,
    weight: KeybindingWeight.WorkbenchContrib
  },
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 1
  },
  run: /* @__PURE__ */ __name((c, accessor) => accessor.get(IPreferencesService).openSettings({ query: terminalSuggestConfigSection }), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.RequestCompletions,
  title: localize2("workbench.action.terminal.requestCompletions", "Request Completions"),
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyCode.Space,
    mac: { primary: KeyMod.WinCtrl | KeyCode.Space },
    weight: KeybindingWeight.WorkbenchContrib + 1,
    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.suggestWidgetVisible.negate(), ContextKeyExpr.equals(`config.${TerminalSuggestSettingId.Enabled}`, true))
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.requestCompletions(true), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.ResetWidgetSize,
  title: localize2("workbench.action.terminal.resetSuggestWidgetSize", "Reset Suggest Widget Size"),
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.resetWidgetSize(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.SelectPrevSuggestion,
  title: localize2("workbench.action.terminal.selectPrevSuggestion", "Select the Previous Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Up is bound to other workbench keybindings that this needs to beat
    primary: KeyCode.UpArrow,
    weight: KeybindingWeight.WorkbenchContrib + 1,
    when: ContextKeyExpr.or(SimpleSuggestContext.HasNavigated, ContextKeyExpr.equals(`config.${TerminalSuggestSettingId.UpArrowNavigatesHistory}`, false))
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousSuggestion(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.SelectPrevPageSuggestion,
  title: localize2("workbench.action.terminal.selectPrevPageSuggestion", "Select the Previous Page Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Up is bound to other workbench keybindings that this needs to beat
    primary: KeyCode.PageUp,
    weight: KeybindingWeight.WorkbenchContrib + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousPageSuggestion(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.SelectNextSuggestion,
  title: localize2("workbench.action.terminal.selectNextSuggestion", "Select the Next Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    primary: KeyCode.DownArrow,
    weight: KeybindingWeight.WorkbenchContrib + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextSuggestion(), "run")
});
registerActiveInstanceAction({
  id: "terminalSuggestToggleExplainMode",
  title: localize2("workbench.action.terminal.suggestToggleExplainMode", "Suggest Toggle Explain Modes"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    weight: KeybindingWeight.WorkbenchContrib + 1,
    primary: KeyMod.CtrlCmd | KeyCode.Slash
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleExplainMode(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.ToggleDetailsFocus,
  title: localize2("workbench.action.terminal.suggestToggleDetailsFocus", "Suggest Toggle Suggestion Focus"),
  f1: false,
  // HACK: This does not work with a precondition of `TerminalContextKeys.suggestWidgetVisible`, so make sure to not override the editor's keybinding
  precondition: EditorContextKeys.textInputFocus.negate(),
  keybinding: {
    weight: KeybindingWeight.WorkbenchContrib,
    primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.Space,
    mac: { primary: KeyMod.WinCtrl | KeyMod.Alt | KeyCode.Space }
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleSuggestionFocus(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.ToggleDetails,
  title: localize2("workbench.action.terminal.suggestToggleDetails", "Suggest Toggle Details"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen, TerminalContextKeys.focus, TerminalContextKeys.suggestWidgetVisible, SimpleSuggestContext.HasFocusedSuggestion),
  keybinding: {
    // HACK: Force weight to be higher than that to start terminal chat
    weight: KeybindingWeight.ExternalExtension + 2,
    primary: KeyMod.CtrlCmd | KeyCode.Space,
    secondary: [KeyMod.CtrlCmd | KeyCode.KeyI],
    mac: { primary: KeyMod.WinCtrl | KeyCode.Space, secondary: [KeyMod.CtrlCmd | KeyCode.KeyI] }
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleSuggestionDetails(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.SelectNextPageSuggestion,
  title: localize2("workbench.action.terminal.selectNextPageSuggestion", "Select the Next Page Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    primary: KeyCode.PageDown,
    weight: KeybindingWeight.WorkbenchContrib + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextPageSuggestion(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.AcceptSelectedSuggestion,
  title: localize2("workbench.action.terminal.acceptSelectedSuggestion", "Insert"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: KeyCode.Tab,
    // Tab is bound to other workbench keybindings that this needs to beat
    weight: KeybindingWeight.WorkbenchContrib + 1
  },
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    order: 1,
    group: "left"
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.AcceptSelectedSuggestionEnter,
  title: localize2("workbench.action.terminal.acceptSelectedSuggestionEnter", "Accept Selected Suggestion (Enter)"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: KeyCode.Enter,
    // Enter is bound to other workbench keybindings that this needs to beat
    weight: KeybindingWeight.WorkbenchContrib + 1,
    when: ContextKeyExpr.notEquals(`config.${TerminalSuggestSettingId.RunOnEnter}`, "ignore")
  },
  run: /* @__PURE__ */ __name(async (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(void 0, true), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.HideSuggestWidget,
  title: localize2("workbench.action.terminal.hideSuggestWidget", "Hide Suggest Widget"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: KeyCode.Escape,
    // Escape is bound to other workbench keybindings that this needs to beat
    weight: KeybindingWeight.WorkbenchContrib + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget(true), "run")
});
registerActiveInstanceAction({
  id: TerminalSuggestCommandId.HideSuggestWidgetAndNavigateHistory,
  title: localize2("workbench.action.terminal.hideSuggestWidgetAndNavigateHistory", "Hide Suggest Widget and Navigate History"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: KeyCode.UpArrow,
    when: ContextKeyExpr.and(SimpleSuggestContext.HasNavigated.negate(), ContextKeyExpr.equals(`config.${TerminalSuggestSettingId.UpArrowNavigatesHistory}`, true)),
    weight: KeybindingWeight.WorkbenchContrib + 2
  },
  run: /* @__PURE__ */ __name((activeInstance) => {
    TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget(true);
    activeInstance.sendText("\x1B[A", false);
  }, "run")
});
//# sourceMappingURL=terminal.suggest.contribution.js.map
