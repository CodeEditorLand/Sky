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
var TerminalSuggestContribution_1, TerminalSuggestProvidersConfigurationManager_1;
import * as dom from "../../../../../base/browser/dom.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore, MutableDisposable, toDisposable, Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { localize2 } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { registerActiveInstanceAction, registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { terminalSuggestConfigSection, registerTerminalSuggestProvidersConfiguration } from "../common/terminalSuggestConfiguration.js";
import { ITerminalCompletionService, TerminalCompletionService } from "./terminalCompletionService.js";
import { ITerminalContributionService } from "../../../terminal/common/terminalExtensionPoints.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { SuggestAddon } from "./terminalSuggestAddon.js";
import { TerminalClipboardContribution } from "../../clipboard/browser/terminal.clipboard.contribution.js";
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
import { getTerminalLspSupportedLanguageObj } from "./lspTerminalUtil.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { Codicon } from "../../../../../base/common/codicons.js";
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
  get lspAddons() {
    return Array.from(this._lspAddons.values());
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
    this._lspAddons = this.add(new DisposableMap());
    this._lspModelProvider = new MutableDisposable();
    this.add(toDisposable(() => {
      this._addon?.dispose();
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
          this._lspAddons.clearAndDisposeAll();
        }
        const xtermRaw = this._ctx.instance.xterm?.raw;
        if (!!xtermRaw && completionsEnabled) {
          this._loadAddons(xtermRaw);
        }
      }
    }));
    TerminalSuggestProvidersConfigurationManager.initialize(this._instantiationService);
    this.add(this._ctx.instance.onDidChangeTarget((target) => {
      this._updateContainerForTarget(target);
    }));
    this.add(this._ctx.instance.onDidFocus(() => {
      const xtermRaw = this._ctx.instance.xterm?.raw;
      if (xtermRaw) {
        this._prepareAddonLayout(xtermRaw);
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
  async _loadLspCompletionAddon(xterm) {
    let lspTerminalObj = void 0;
    if (!this._ctx.instance.shellType || !(lspTerminalObj = getTerminalLspSupportedLanguageObj(this._ctx.instance.shellType))) {
      this._lspAddons.clearAndDisposeAll();
      return;
    }
    const virtualTerminalDocumentUri = createTerminalLanguageVirtualUri(this._ctx.instance.instanceId, lspTerminalObj.extension);
    this._lspModelProvider.value = this._instantiationService.createInstance(LspTerminalModelContentProvider, this._ctx.instance.capabilities, this._ctx.instance.instanceId, virtualTerminalDocumentUri, this._ctx.instance.shellType);
    this.add(this._lspModelProvider.value);
    const textVirtualModel = await this._textModelService.createModelReference(virtualTerminalDocumentUri);
    this.add(textVirtualModel);
    const virtualProviders = this._languageFeaturesService.completionProvider.all(textVirtualModel.object.textEditorModel);
    const filteredProviders = virtualProviders.filter((p) => p._debugDisplayName !== "wordbasedCompletions");
    for (const provider of filteredProviders) {
      const lspCompletionProviderAddon = this._instantiationService.createInstance(LspCompletionProviderAddon, provider, textVirtualModel, this._lspModelProvider.value);
      this._lspAddons.set(provider._debugDisplayName, lspCompletionProviderAddon);
      xterm.loadAddon(lspCompletionProviderAddon);
      this.add(this._terminalCompletionService.registerTerminalCompletionProvider("lsp", lspCompletionProviderAddon.id, lspCompletionProviderAddon, ...lspCompletionProviderAddon.triggerCharacters ?? []));
    }
  }
  _loadAddons(xterm) {
    if (this._addon.value) {
      return;
    }
    const addon = this._addon.value = this._instantiationService.createInstance(SuggestAddon, this._ctx.instance.sessionId, this._ctx.instance.shellType, this._ctx.instance.capabilities, this._terminalSuggestWidgetVisibleContextKey);
    xterm.loadAddon(addon);
    this._loadLspCompletionAddon(xterm);
    this._prepareAddonLayout(xterm);
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
  }
  _updateContainerForTarget(target) {
    const addon = this._addon.value;
    if (!addon || !this._ctx.instance.xterm?.raw) {
      return;
    }
    this._prepareAddonLayout(this._ctx.instance.xterm.raw);
  }
  async _prepareAddonLayout(xterm) {
    const addon = this._addon.value;
    if (!addon || this.isDisposed) {
      return;
    }
    const xtermElement = xterm.element ?? await this._waitForXtermElement(xterm);
    if (!xtermElement || this.isDisposed || addon !== this._addon.value) {
      return;
    }
    const container = this._resolveAddonContainer(xtermElement);
    addon.setContainerWithOverflow(container);
    const screenElement = xtermElement?.querySelector(".xterm-screen");
    if (dom.isHTMLElement(screenElement)) {
      addon.setScreen(screenElement);
    }
  }
  async _waitForXtermElement(xterm) {
    if (xterm.element) {
      return xterm.element;
    }
    await Promise.race([
      Event.toPromise(Event.filter(this._ctx.instance.onDidChangeVisibility, (visible) => visible)),
      Event.toPromise(this._ctx.instance.onDisposed)
    ]);
    if (this.isDisposed || this._ctx.instance.isDisposed) {
      return void 0;
    }
    return xterm.element ?? void 0;
  }
  _resolveAddonContainer(xtermElement) {
    if (this._ctx.instance.target === TerminalLocation.Editor) {
      return xtermElement;
    }
    return dom.findParentWithClass(xtermElement, "panel") ?? xtermElement;
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
  id: "workbench.action.terminal.changeSelectionModeNever",
  title: localize2("workbench.action.terminal.changeSelectionMode.never", "Selection Mode: None"),
  tooltip: localize2("workbench.action.terminal.changeSelectionMode.never.tooltip", "Do not select the top suggestion until down is pressed, at which point Tab or Enter will accept the suggestion. Activate to change."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible, ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode"}`, "never")),
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode"}`, "never"), ContextKeyExpr.or(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}`, true), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters"}`, true)))
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.selectionMode", "partial");
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.changeSelectionModePartial",
  title: localize2("workbench.action.terminal.changeSelectionMode.partial", "Selection Mode: Partial (Tab)"),
  tooltip: localize2("workbench.action.terminal.changeSelectionMode.partial.tooltip", "Partially select the top suggestion, Tab will accept a suggestion when visible. Activate to change."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible, ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode"}`, "partial")),
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode"}`, "partial"), ContextKeyExpr.or(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}`, true), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters"}`, true)))
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.selectionMode", "always");
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.changeSelectionModeAlways",
  title: localize2("workbench.action.terminal.changeSelectionMode.always", "Selection Mode: Always (Tab or Enter)"),
  tooltip: localize2("workbench.action.terminal.changeSelectionMode.always.tooltip", "Always select the top suggestion, Tab or Enter will accept a suggestion when visible. Activate to change."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.selectionMode"}`, "always"), ContextKeyExpr.or(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}`, true), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters"}`, true)))
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.selectionMode", "never");
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.doNotShowSuggestOnType",
  title: localize2("workbench.action.terminal.doNotShowSuggestOnType", "Don't show IntelliSense unless triggered explicitly. This disables the quick suggestions and suggest on trigger characters settings."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.eye,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 1,
    when: ContextKeyExpr.and(ContextKeyExpr.or(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}.commands`, "on"), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}.arguments`, "on")), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters"}`, true))
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.quickSuggestions", { commands: "off", arguments: "off", unknown: "off" });
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.suggestOnTriggerCharacters", false);
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.showSuggestOnType",
  title: localize2("workbench.action.terminal.showSuggestOnType", "Show IntelliSense while typing. This enables the quick suggestions for commands and arguments, and suggest on trigger characters settings."),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.eyeClosed,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 1,
    when: ContextKeyExpr.or(ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}.commands`, "off"), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.quickSuggestions"}.arguments`, "off")), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.suggestOnTriggerCharacters"}`, false))
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.quickSuggestions", { commands: "on", arguments: "on", unknown: "off" });
    accessor.get(IConfigurationService).updateValue("terminal.integrated.suggest.suggestOnTriggerCharacters", true);
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.suggestLearnMore",
  title: localize2("workbench.action.terminal.learnMore", "Learn More"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.question,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 2
  },
  run: /* @__PURE__ */ __name((c, accessor) => {
    accessor.get(IOpenerService).open("https://aka.ms/vscode-terminal-intellisense");
  }, "run")
});
registerTerminalAction({
  id: "workbench.action.terminal.configureSuggestSettings",
  title: localize2("workbench.action.terminal.configureSuggestSettings", "Configure"),
  f1: false,
  precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
  icon: Codicon.gear,
  menu: {
    id: MenuId.MenubarTerminalSuggestStatusMenu,
    group: "right",
    order: 3
  },
  run: /* @__PURE__ */ __name((c, accessor) => accessor.get(IPreferencesService).openSettings({ query: terminalSuggestConfigSection }), "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.triggerSuggest",
  title: localize2("workbench.action.terminal.triggerSuggest", "Trigger Suggest"),
  f1: false,
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
      weight: 200 + 2,
      when: ContextKeyExpr.and(SimpleSuggestContext.HasFocusedSuggestion)
    },
    {
      primary: 3,
      // Enter accepts when: explicitly invoked (ctrl+space), OR not in partial mode, OR not first suggestion, OR user has navigated
      when: ContextKeyExpr.and(SimpleSuggestContext.HasFocusedSuggestion, ContextKeyExpr.or(SimpleSuggestContext.ExplicitlyInvoked, ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.selectionMode"}`, "partial"), SimpleSuggestContext.FirstSuggestionFocused.toNegated(), SimpleSuggestContext.HasNavigated)),
      weight: 200 + 1
    }
  ],
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
let TerminalSuggestProvidersConfigurationManager = class TerminalSuggestProvidersConfigurationManager2 extends Disposable {
  static {
    __name(this, "TerminalSuggestProvidersConfigurationManager");
  }
  static {
    TerminalSuggestProvidersConfigurationManager_1 = this;
  }
  static initialize(instantiationService) {
    if (!this._instance) {
      this._instance = instantiationService.createInstance(TerminalSuggestProvidersConfigurationManager_1);
    }
  }
  constructor(_terminalCompletionService, _terminalContributionService) {
    super();
    this._terminalCompletionService = _terminalCompletionService;
    this._terminalContributionService = _terminalContributionService;
    this._register(this._terminalCompletionService.onDidChangeProviders(() => {
      this._updateConfiguration();
    }));
    this._register(this._terminalContributionService.onDidChangeTerminalCompletionProviders(() => {
      this._updateConfiguration();
    }));
    this._updateConfiguration();
  }
  _updateConfiguration() {
    const providers = /* @__PURE__ */ new Map();
    this._terminalContributionService.terminalCompletionProviders.forEach((o) => providers.set(o.extensionIdentifier, { ...o, id: o.extensionIdentifier }));
    for (const { id } of this._terminalCompletionService.providers) {
      if (id && !providers.has(id)) {
        providers.set(id, { id });
      }
    }
    registerTerminalSuggestProvidersConfiguration(providers);
  }
};
TerminalSuggestProvidersConfigurationManager = TerminalSuggestProvidersConfigurationManager_1 = __decorate([
  __param(0, ITerminalCompletionService),
  __param(1, ITerminalContributionService)
], TerminalSuggestProvidersConfigurationManager);
//# sourceMappingURL=terminal.suggest.contribution.js.map
