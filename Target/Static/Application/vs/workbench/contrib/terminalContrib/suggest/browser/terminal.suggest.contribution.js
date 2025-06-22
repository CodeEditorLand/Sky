var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { AutoOpenBarrier } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { isLinux, isWindows } from "../../../../../base/common/platform.js";
import { localize2 } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { registerActiveInstanceAction, registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { terminalSuggestConfigSection } from "../common/terminalSuggestConfiguration.js";
import { ITerminalCompletionService, TerminalCompletionService } from "./terminalCompletionService.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { SuggestAddon } from "./terminalSuggestAddon.js";
import { TerminalClipboardContribution } from "../../clipboard/browser/terminal.clipboard.contribution.js";
import { PwshCompletionProviderAddon } from "./pwshCompletionProviderAddon.js";
import { SimpleSuggestContext } from "../../../../services/suggest/browser/simpleSuggestWidget.js";
import { SuggestDetailsClassName } from "../../../../services/suggest/browser/simpleSuggestWidgetDetails.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import "./terminalSymbolIcons.js";
import { LspCompletionProviderAddon } from "./lspCompletionProviderAddon.js";
import { createTerminalLanguageVirtualUri, LspTerminalModelContentProvider } from "./lspTerminalModelContentProvider.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { env } from "../../../../../base/common/process.js";
import { PYLANCE_DEBUG_DISPLAY_NAME } from "./lspTerminalUtil.js";
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
var TerminalSuggestContribution_1;
registerSingleton(
  ITerminalCompletionService,
  TerminalCompletionService,
  1
  /* InstantiationType.Delayed */
);
let TerminalSuggestContribution = class TerminalSuggestContribution2 extends DisposableStore {
  static {
    __name(this, "TerminalSuggestContribution");
  }
  static {
    TerminalSuggestContribution_1 = this;
  }
  static {
    this.ID = "terminal.suggest";
  }
  static get(instance) {
    return instance.getContribution(TerminalSuggestContribution_1.ID);
  }
  get addon() {
    return this._addon.value;
  }
  get pwshAddon() {
    return this._pwshAddon.value;
  }
  get lspAddon() {
    return this._lspAddon.value;
  }
  constructor(_ctx, _contextKeyService, _configurationService, _instantiationService, _terminalCompletionService, _textModelService, _languageFeaturesService) {
    super();
    this._ctx = _ctx;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._terminalCompletionService = _terminalCompletionService;
    this._textModelService = _textModelService;
    this._languageFeaturesService = _languageFeaturesService;
    this._addon = new MutableDisposable();
    this._pwshAddon = new MutableDisposable();
    this._lspAddon = new MutableDisposable();
    this._lspModelProvider = new MutableDisposable();
    this.add(toDisposable(() => {
      this._addon?.dispose();
      this._pwshAddon?.dispose();
      this._lspAddon?.dispose();
      this._lspModelProvider?.value?.dispose();
      this._lspModelProvider?.dispose();
    }));
    this._terminalSuggestWidgetVisibleContextKey = TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
    this.add(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.suggest.enabled"
        /* TerminalSuggestSettingId.Enabled */
      )) {
        const completionsEnabled = this._configurationService.getValue(terminalSuggestConfigSection).enabled;
        if (!completionsEnabled) {
          this._addon.clear();
          this._pwshAddon.clear();
          this._lspAddon.clear();
        }
        const xtermRaw = this._ctx.instance.xterm?.raw;
        if (!!xtermRaw && completionsEnabled) {
          this._loadAddons(xtermRaw);
        }
      }
    }));
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
      this._lspModelProvider.value?.shellTypeChanged(this._ctx.instance.shellType);
    }));
  }
  async _loadPwshCompletionAddon(xterm) {
    if (this._ctx.instance.shellType !== "pwsh" || this._ctx.instance.shellLaunchConfig.executable?.endsWith("WindowsPowerShell\\v1.0\\powershell.exe")) {
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
  // TODO: Eventually support multiple LSP providers for [non-Python REPLs](https://github.com/microsoft/vscode/issues/249479)
  async _loadLspCompletionAddon(xterm) {
    const isWsl = isLinux && (!!env["WSL_DISTRO_NAME"] || !!env["WSL_INTEROP"]);
    if (isWindows || isWsl) {
      return;
    }
    if (this._ctx.instance.shellType !== "python") {
      this._lspAddon.clear();
      return;
    }
    const virtualTerminalDocumentUri = createTerminalLanguageVirtualUri(this._ctx.instance.instanceId, "py");
    this._lspModelProvider.value = this._instantiationService.createInstance(LspTerminalModelContentProvider, this._ctx.instance.capabilities, this._ctx.instance.instanceId, virtualTerminalDocumentUri, this._ctx.instance.shellType);
    this.add(this._lspModelProvider.value);
    const textVirtualModel = await this._textModelService.createModelReference(virtualTerminalDocumentUri);
    this.add(textVirtualModel);
    const virtualProviders = this._languageFeaturesService.completionProvider.all(textVirtualModel.object.textEditorModel);
    const provider = virtualProviders.find((p) => p._debugDisplayName === PYLANCE_DEBUG_DISPLAY_NAME);
    if (provider) {
      const lspCompletionProviderAddon = this._lspAddon.value = this._instantiationService.createInstance(LspCompletionProviderAddon, provider, textVirtualModel, this._lspModelProvider.value);
      xterm.loadAddon(lspCompletionProviderAddon);
      this.add(lspCompletionProviderAddon);
      this.add(this._terminalCompletionService.registerTerminalCompletionProvider("lsp", lspCompletionProviderAddon.id, lspCompletionProviderAddon, ...lspCompletionProviderAddon.triggerCharacters ?? []));
    }
  }
  _loadAddons(xterm) {
    if (this._addon.value) {
      return;
    }
    const addon = this._addon.value = this._instantiationService.createInstance(SuggestAddon, this._ctx.instance.shellType, this._ctx.instance.capabilities, this._terminalSuggestWidgetVisibleContextKey);
    xterm.loadAddon(addon);
    this._loadPwshCompletionAddon(xterm);
    this._loadLspCompletionAddon(xterm);
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
    this._loadLspCompletionAddon(this._ctx.instance.xterm.raw);
    this._loadPwshCompletionAddon(this._ctx.instance.xterm.raw);
  }
};
TerminalSuggestContribution = TerminalSuggestContribution_1 = __decorate([
  __param(1, IContextKeyService),
  __param(2, IConfigurationService),
  __param(3, IInstantiationService),
  __param(4, ITerminalCompletionService),
  __param(5, ITextModelService),
  __param(6, ILanguageFeaturesService)
], TerminalSuggestContribution);
registerTerminalContribution(TerminalSuggestContribution.ID, TerminalSuggestContribution);
registerTerminalAction({
  id: "workbench.action.terminal.configureSuggestSettings",
  title: localize2("workbench.action.terminal.configureSuggestSettings", "Configure"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 2048 | 1024 | 87,
    weight: 200
    /* KeybindingWeight.WorkbenchContrib */
  },
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 1
  },
  run: /* @__PURE__ */ __name((c, accessor) => accessor.get(IPreferencesService).openSettings({ query: terminalSuggestConfigSection }), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.requestCompletions",
  title: localize2("workbench.action.terminal.requestCompletions", "Request Completions"),
  keybinding: {
    primary: 2048 | 10,
    mac: {
      primary: 256 | 10
      /* KeyCode.Space */
    },
    weight: 200 + 1,
    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.suggestWidgetVisible.negate(), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.enabled"}`, true))
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.requestCompletions(true), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.resetSuggestWidgetSize",
  title: localize2("workbench.action.terminal.resetSuggestWidgetSize", "Reset Suggest Widget Size"),
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.resetWidgetSize(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.selectPrevSuggestion",
  title: localize2("workbench.action.terminal.selectPrevSuggestion", "Select the Previous Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Up is bound to other workbench keybindings that this needs to beat
    primary: 16,
    weight: 200 + 1,
    when: ContextKeyExpr.or(SimpleSuggestContext.HasNavigated, ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.upArrowNavigatesHistory"}`, false))
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousSuggestion(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.selectPrevPageSuggestion",
  title: localize2("workbench.action.terminal.selectPrevPageSuggestion", "Select the Previous Page Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Up is bound to other workbench keybindings that this needs to beat
    primary: 11,
    weight: 200 + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousPageSuggestion(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.selectNextSuggestion",
  title: localize2("workbench.action.terminal.selectNextSuggestion", "Select the Next Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    primary: 18,
    weight: 200 + 1
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
    weight: 200 + 1,
    primary: 2048 | 90
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleExplainMode(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.suggestToggleDetailsFocus",
  title: localize2("workbench.action.terminal.suggestToggleDetailsFocus", "Suggest Toggle Suggestion Focus"),
  f1: false,
  // HACK: This does not work with a precondition of `TerminalContextKeys.suggestWidgetVisible`, so make sure to not override the editor's keybinding
  precondition: EditorContextKeys.textInputFocus.negate(),
  keybinding: {
    weight: 200,
    primary: 2048 | 512 | 10,
    mac: {
      primary: 256 | 512 | 10
      /* KeyCode.Space */
    }
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleSuggestionFocus(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.suggestToggleDetails",
  title: localize2("workbench.action.terminal.suggestToggleDetails", "Suggest Toggle Details"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen, TerminalContextKeys.focus, TerminalContextKeys.suggestWidgetVisible, SimpleSuggestContext.HasFocusedSuggestion),
  keybinding: {
    // HACK: Force weight to be higher than that to start terminal chat
    weight: 400 + 2,
    primary: 2048 | 10,
    secondary: [
      2048 | 39
      /* KeyCode.KeyI */
    ],
    mac: { primary: 256 | 10, secondary: [
      2048 | 39
      /* KeyCode.KeyI */
    ] }
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.toggleSuggestionDetails(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.selectNextPageSuggestion",
  title: localize2("workbench.action.terminal.selectNextPageSuggestion", "Select the Next Page Suggestion"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    // Down is bound to other workbench keybindings that this needs to beat
    primary: 12,
    weight: 200 + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextPageSuggestion(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.acceptSelectedSuggestion",
  title: localize2("workbench.action.terminal.acceptSelectedSuggestion", "Insert"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: [
    {
      primary: 2,
      // Tab is bound to other workbench keybindings that this needs to beat
      weight: 200 + 1
    },
    {
      primary: 3,
      when: ContextKeyExpr.or(ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.selectionMode"}`, "partial"), ContextKeyExpr.or(SimpleSuggestContext.FirstSuggestionFocused.toNegated(), SimpleSuggestContext.HasNavigated)),
      weight: 200 + 1
    }
  ],
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    order: 1,
    group: "left"
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.acceptSelectedSuggestionEnter",
  title: localize2("workbench.action.terminal.acceptSelectedSuggestionEnter", "Accept Selected Suggestion (Enter)"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 3,
    // Enter is bound to other workbench keybindings that this needs to beat
    weight: 200 + 1,
    when: ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.runOnEnter"}`, "never")
  },
  run: /* @__PURE__ */ __name(async (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(void 0, true), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.hideSuggestWidget",
  title: localize2("workbench.action.terminal.hideSuggestWidget", "Hide Suggest Widget"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 9,
    // Escape is bound to other workbench keybindings that this needs to beat
    weight: 200 + 1
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget(true), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.hideSuggestWidgetAndNavigateHistory",
  title: localize2("workbench.action.terminal.hideSuggestWidgetAndNavigateHistory", "Hide Suggest Widget and Navigate History"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  keybinding: {
    primary: 16,
    when: ContextKeyExpr.and(SimpleSuggestContext.HasNavigated.negate(), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.upArrowNavigatesHistory"}`, true)),
    weight: 200 + 2
  },
  run: /* @__PURE__ */ __name((activeInstance) => {
    TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget(true);
    activeInstance.sendText("\x1B[A", false);
  }, "run")
});
//# sourceMappingURL=terminal.suggest.contribution.js.map
