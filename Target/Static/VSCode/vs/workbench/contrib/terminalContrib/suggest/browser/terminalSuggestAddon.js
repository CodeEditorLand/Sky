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
import { Emitter, Event } from "../../../../../base/common/event.js";
import { combinedDisposable, Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { sep } from "../../../../../base/common/path.js";
import { commonPrefixLength } from "../../../../../base/common/strings.js";
import { editorSuggestWidgetSelectedBackground } from "../../../../../editor/contrib/suggest/browser/suggestWidget.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../../platform/storage/common/storage.js";
import { TerminalCapability } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { getListStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { activeContrastBorder } from "../../../../../platform/theme/common/colorRegistry.js";
import { TerminalStorageKeys } from "../../../terminal/common/terminalStorageKeys.js";
import { terminalSuggestConfigSection, TerminalSuggestSettingId } from "../common/terminalSuggestConfiguration.js";
import { LineContext } from "../../../../services/suggest/browser/simpleCompletionModel.js";
import { ISimpleSelectedSuggestion, SimpleSuggestWidget } from "../../../../services/suggest/browser/simpleSuggestWidget.js";
import { ITerminalCompletionService } from "./terminalCompletionService.js";
import { TerminalSettingId, TerminalShellType } from "../../../../../platform/terminal/common/terminal.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { ISimpleSuggestWidgetFontInfo } from "../../../../services/suggest/browser/simpleSuggestWidgetRenderer.js";
import { ITerminalConfigurationService } from "../../../terminal/browser/terminal.js";
import { GOLDEN_LINE_HEIGHT_RATIO, MINIMUM_LINE_HEIGHT } from "../../../../../editor/common/config/fontInfo.js";
import { TerminalCompletionModel } from "./terminalCompletionModel.js";
import { TerminalCompletionItem, TerminalCompletionItemKind } from "./terminalCompletionItem.js";
import { IntervalTimer, TimeoutTimer } from "../../../../../base/common/async.js";
import { localize } from "../../../../../nls.js";
import { TerminalSuggestTelemetry } from "./terminalSuggestTelemetry.js";
import { terminalSymbolAliasIcon, terminalSymbolArgumentIcon, terminalSymbolEnumMember, terminalSymbolFileIcon, terminalSymbolFlagIcon, terminalSymbolInlineSuggestionIcon, terminalSymbolMethodIcon, terminalSymbolOptionIcon, terminalSymbolFolderIcon } from "./terminalSymbolIcons.js";
let SuggestAddon = class extends Disposable {
  constructor(shellType, _capabilities, _terminalSuggestWidgetVisibleContextKey, _terminalCompletionService, _configurationService, _instantiationService, _extensionService, _terminalConfigurationService) {
    super();
    this._capabilities = _capabilities;
    this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
    this._terminalCompletionService = _terminalCompletionService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._extensionService = _extensionService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this.shellType = shellType;
    if (this.shellType) {
      this._shellTypeInit = Promise.resolve();
    } else {
      const intervalTimer = this._register(new IntervalTimer());
      const timeoutTimer = this._register(new TimeoutTimer());
      this._shellTypeInit = new Promise((r) => {
        intervalTimer.cancelAndSet(() => {
          if (this.shellType) {
            r();
          }
        }, 50);
        timeoutTimer.cancelAndSet(r, 5e3);
      }).then(() => {
        this._store.delete(intervalTimer);
        this._store.delete(timeoutTimer);
      });
    }
    this._register(Event.runAndSubscribe(Event.any(
      this._capabilities.onDidAddCapabilityType,
      this._capabilities.onDidRemoveCapabilityType
    ), () => {
      const commandDetection = this._capabilities.get(TerminalCapability.CommandDetection);
      if (commandDetection) {
        if (this._promptInputModel !== commandDetection.promptInputModel) {
          this._promptInputModel = commandDetection.promptInputModel;
          this._suggestTelemetry = this._register(this._instantiationService.createInstance(TerminalSuggestTelemetry, commandDetection, this._promptInputModel));
          this._promptInputModelSubscriptions.value = combinedDisposable(
            this._promptInputModel.onDidChangeInput((e) => this._sync(e)),
            this._promptInputModel.onDidFinishInput(() => {
              this.hideSuggestWidget(true);
            })
          );
          if (this._shouldSyncWhenReady) {
            this._sync(this._promptInputModel);
            this._shouldSyncWhenReady = false;
          }
        }
      } else {
        this._promptInputModel = void 0;
      }
    }));
    this._register(this._terminalConfigurationService.onConfigChanged(() => this._cachedFontInfo = void 0));
    this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, (e) => {
      if (!e || e.affectsConfiguration(TerminalSuggestSettingId.InlineSuggestion)) {
        const value = this._configurationService.getValue(terminalSuggestConfigSection).inlineSuggestion;
        this._inlineCompletionItem.isInvalid = value === "off";
        switch (value) {
          case "alwaysOnTopExceptExactMatch": {
            this._inlineCompletion.kind = TerminalCompletionItemKind.InlineSuggestion;
            break;
          }
          case "alwaysOnTop":
          default: {
            this._inlineCompletion.kind = TerminalCompletionItemKind.InlineSuggestionAlwaysOnTop;
            break;
          }
        }
        this._model?.forceRefilterAll();
      }
    }));
  }
  static {
    __name(this, "SuggestAddon");
  }
  _terminal;
  _promptInputModel;
  _promptInputModelSubscriptions = this._register(new MutableDisposable());
  _mostRecentPromptInputState;
  _currentPromptInputState;
  _model;
  _container;
  _screen;
  _suggestWidget;
  _cachedFontInfo;
  _enableWidget = true;
  _pathSeparator = sep;
  _isFilteringDirectories = false;
  // TODO: Remove these in favor of prompt input state
  _leadingLineContent;
  _cursorIndexDelta = 0;
  _requestedCompletionsIndex = 0;
  _lastUserData;
  static lastAcceptedCompletionTimestamp = 0;
  _lastUserDataTimestamp = 0;
  _cancellationTokenSource;
  isPasting = false;
  shellType;
  _shellTypeInit;
  _onBell = this._register(new Emitter());
  onBell = this._onBell.event;
  _onAcceptedCompletion = this._register(new Emitter());
  onAcceptedCompletion = this._onAcceptedCompletion.event;
  _onDidReceiveCompletions = this._register(new Emitter());
  onDidReceiveCompletions = this._onDidReceiveCompletions.event;
  _onDidFontConfigurationChange = this._register(new Emitter());
  onDidFontConfigurationChange = this._onDidFontConfigurationChange.event;
  _kindToIconMap = /* @__PURE__ */ new Map([
    [TerminalCompletionItemKind.File, terminalSymbolFileIcon],
    [TerminalCompletionItemKind.Folder, terminalSymbolFolderIcon],
    [TerminalCompletionItemKind.Method, terminalSymbolMethodIcon],
    [TerminalCompletionItemKind.Alias, terminalSymbolAliasIcon],
    [TerminalCompletionItemKind.Argument, terminalSymbolArgumentIcon],
    [TerminalCompletionItemKind.Option, terminalSymbolOptionIcon],
    [TerminalCompletionItemKind.OptionValue, terminalSymbolEnumMember],
    [TerminalCompletionItemKind.Flag, terminalSymbolFlagIcon],
    [TerminalCompletionItemKind.InlineSuggestion, terminalSymbolInlineSuggestionIcon],
    [TerminalCompletionItemKind.InlineSuggestionAlwaysOnTop, terminalSymbolInlineSuggestionIcon]
  ]);
  _kindToKindLabelMap = /* @__PURE__ */ new Map([
    [TerminalCompletionItemKind.File, localize("file", "File")],
    [TerminalCompletionItemKind.Folder, localize("folder", "Folder")],
    [TerminalCompletionItemKind.Method, localize("method", "Method")],
    [TerminalCompletionItemKind.Alias, localize("alias", "Alias")],
    [TerminalCompletionItemKind.Argument, localize("argument", "Argument")],
    [TerminalCompletionItemKind.Option, localize("option", "Option")],
    [TerminalCompletionItemKind.OptionValue, localize("optionValue", "Option Value")],
    [TerminalCompletionItemKind.Flag, localize("flag", "Flag")],
    [TerminalCompletionItemKind.InlineSuggestion, localize("inlineSuggestion", "Inline Suggestion")],
    [TerminalCompletionItemKind.InlineSuggestionAlwaysOnTop, localize("inlineSuggestionAlwaysOnTop", "Inline Suggestion")]
  ]);
  _inlineCompletion = {
    label: "",
    // Right arrow is used to accept the completion. This is a common keybinding in pwsh, zsh
    // and fish.
    inputData: "\x1B[C",
    replacementIndex: 0,
    replacementLength: 0,
    provider: "core",
    detail: "Inline suggestion",
    kind: TerminalCompletionItemKind.InlineSuggestion,
    kindLabel: "Inline suggestion",
    icon: this._kindToIconMap.get(TerminalCompletionItemKind.InlineSuggestion)
  };
  _inlineCompletionItem = new TerminalCompletionItem(this._inlineCompletion);
  _shouldSyncWhenReady = false;
  _suggestTelemetry;
  activate(xterm) {
    this._terminal = xterm;
    this._register(xterm.onKey(async (e) => {
      this._lastUserData = e.key;
      this._lastUserDataTimestamp = Date.now();
    }));
    this._register(xterm.onScroll(() => this.hideSuggestWidget(true)));
  }
  async _handleCompletionProviders(terminal, token, explicitlyInvoked) {
    if (!terminal?.element || !this._enableWidget || !this._promptInputModel) {
      return;
    }
    if (!dom.isAncestorOfActiveElement(terminal.element)) {
      return;
    }
    await this._shellTypeInit;
    if (!this.shellType) {
      return;
    }
    let doNotRequestExtensionCompletions = false;
    if (this._lastUserDataTimestamp < SuggestAddon.lastAcceptedCompletionTimestamp) {
      doNotRequestExtensionCompletions = true;
    }
    if (!doNotRequestExtensionCompletions) {
      await this._extensionService.activateByEvent("onTerminalCompletionsRequested");
    }
    this._currentPromptInputState = {
      value: this._promptInputModel.value,
      prefix: this._promptInputModel.prefix,
      suffix: this._promptInputModel.suffix,
      cursorIndex: this._promptInputModel.cursorIndex,
      ghostTextIndex: this._promptInputModel.ghostTextIndex
    };
    this._requestedCompletionsIndex = this._currentPromptInputState.cursorIndex;
    const quickSuggestionsConfig = this._configurationService.getValue(terminalSuggestConfigSection).quickSuggestions;
    const allowFallbackCompletions = explicitlyInvoked || quickSuggestionsConfig.unknown === "on";
    const providedCompletions = await this._terminalCompletionService.provideCompletions(this._currentPromptInputState.prefix, this._currentPromptInputState.cursorIndex, allowFallbackCompletions, this.shellType, this._capabilities, token, doNotRequestExtensionCompletions);
    if (token.isCancellationRequested) {
      return;
    }
    this._onDidReceiveCompletions.fire();
    this._cursorIndexDelta = this._promptInputModel.cursorIndex - this._requestedCompletionsIndex;
    this._leadingLineContent = this._promptInputModel.prefix.substring(0, this._requestedCompletionsIndex + this._cursorIndexDelta);
    const completions = providedCompletions?.flat() || [];
    if (!explicitlyInvoked && !completions.length) {
      this.hideSuggestWidget(true);
      return;
    }
    const firstChar = this._leadingLineContent.length === 0 ? "" : this._leadingLineContent[0];
    if (this._leadingLineContent.includes(" ") || firstChar === "[") {
      this._leadingLineContent = this._promptInputModel.prefix;
    }
    let normalizedLeadingLineContent = this._leadingLineContent;
    this._isFilteringDirectories = completions.some((e) => e.kind === TerminalCompletionItemKind.Folder);
    if (this._isFilteringDirectories) {
      const firstDir = completions.find((e) => e.kind === TerminalCompletionItemKind.Folder);
      const textLabel = typeof firstDir?.label === "string" ? firstDir.label : firstDir?.label.label;
      this._pathSeparator = textLabel?.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
      normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
    }
    this._refreshInlineCompletion(completions);
    for (const completion of completions) {
      if (!completion.icon && completion.kind !== void 0) {
        completion.icon = this._kindToIconMap.get(completion.kind);
        completion.kindLabel = this._kindToKindLabelMap.get(completion.kind);
      }
    }
    const lineContext = new LineContext(normalizedLeadingLineContent, this._cursorIndexDelta);
    const model = new TerminalCompletionModel(
      [
        ...completions.filter((c) => !!c.label).map((c) => new TerminalCompletionItem(c)),
        this._inlineCompletionItem
      ],
      lineContext
    );
    if (token.isCancellationRequested) {
      return;
    }
    this._showCompletions(model, explicitlyInvoked);
  }
  setContainerWithOverflow(container) {
    this._container = container;
  }
  setScreen(screen) {
    this._screen = screen;
  }
  toggleExplainMode() {
    this._suggestWidget?.toggleExplainMode();
  }
  toggleSuggestionFocus() {
    this._suggestWidget?.toggleDetailsFocus();
  }
  toggleSuggestionDetails() {
    this._suggestWidget?.toggleDetails();
  }
  resetWidgetSize() {
    this._suggestWidget?.resetWidgetSize();
  }
  async requestCompletions(explicitlyInvoked) {
    if (!this._promptInputModel) {
      this._shouldSyncWhenReady = true;
      return;
    }
    if (this.isPasting) {
      return;
    }
    if (this._cancellationTokenSource) {
      this._cancellationTokenSource.cancel();
      this._cancellationTokenSource.dispose();
    }
    this._cancellationTokenSource = new CancellationTokenSource();
    const token = this._cancellationTokenSource.token;
    await this._handleCompletionProviders(this._terminal, token, explicitlyInvoked);
  }
  _addPropertiesToInlineCompletionItem(completions) {
    const inlineCompletionLabel = (typeof this._inlineCompletionItem.completion.label === "string" ? this._inlineCompletionItem.completion.label : this._inlineCompletionItem.completion.label.label).trim();
    const inlineCompletionMatchIndex = completions.findIndex((c) => typeof c.label === "string" ? c.label === inlineCompletionLabel : c.label.label === inlineCompletionLabel);
    if (inlineCompletionMatchIndex !== -1) {
      const richCompletionMatchingInline = completions.splice(inlineCompletionMatchIndex, 1)[0];
      this._inlineCompletionItem.completion.label = richCompletionMatchingInline.label;
      this._inlineCompletionItem.completion.detail = richCompletionMatchingInline.detail;
      this._inlineCompletionItem.completion.documentation = richCompletionMatchingInline.documentation;
    } else if (this._inlineCompletionItem.completion) {
      this._inlineCompletionItem.completion.detail = void 0;
      this._inlineCompletionItem.completion.documentation = void 0;
    }
  }
  _requestTriggerCharQuickSuggestCompletions() {
    if (!this._wasLastInputVerticalArrowKey()) {
      if (!this._wasLastInputIncludedEscape() || this._terminalSuggestWidgetVisibleContextKey.get()) {
        this.requestCompletions();
        return true;
      }
    }
    return false;
  }
  _wasLastInputRightArrowKey() {
    return !!this._lastUserData?.match(/^\x1b[\[O]?C$/);
  }
  _wasLastInputVerticalArrowKey() {
    return !!this._lastUserData?.match(/^\x1b[\[O]?[A-B]$/);
  }
  /**
   * Whether the last input included the escape character. Typically this will mean it was more
   * than just a simple character, such as arrow keys, home, end, etc.
   */
  _wasLastInputIncludedEscape() {
    return !!this._lastUserData?.includes("\x1B");
  }
  _wasLastInputArrowKey() {
    return !!this._lastUserData?.match(/^\x1b[\[O]?[A-D]$/);
  }
  _sync(promptInputState) {
    const config = this._configurationService.getValue(terminalSuggestConfigSection);
    {
      let sent = false;
      if (!this._mostRecentPromptInputState || promptInputState.cursorIndex > this._mostRecentPromptInputState.cursorIndex) {
        if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
          const commandLineHasSpace = promptInputState.prefix.trim().match(/\s/);
          if (!commandLineHasSpace && config.quickSuggestions.commands !== "off" || commandLineHasSpace && config.quickSuggestions.arguments !== "off") {
            if (promptInputState.prefix.match(/[^\s]$/)) {
              sent = this._requestTriggerCharQuickSuggestCompletions();
            }
          }
        }
        if (config.suggestOnTriggerCharacters && !sent) {
          const prefix = promptInputState.prefix;
          if (
            // Only trigger on `-` if it's after a space. This is required to not clear
            // completions when typing the `-` in `git cherry-pick`
            prefix?.match(/\s[\-]$/) || // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
            // with git branches in particular
            this._isFilteringDirectories && prefix?.match(/[\\\/]$/)
          ) {
            sent = this._requestTriggerCharQuickSuggestCompletions();
          }
          if (!sent) {
            for (const provider of this._terminalCompletionService.providers) {
              if (!provider.triggerCharacters) {
                continue;
              }
              for (const char of provider.triggerCharacters) {
                if (prefix?.endsWith(char)) {
                  sent = this._requestTriggerCharQuickSuggestCompletions();
                  break;
                }
              }
            }
          }
        }
      }
      if (this._mostRecentPromptInputState && promptInputState.cursorIndex < this._mostRecentPromptInputState.cursorIndex && promptInputState.cursorIndex > 0) {
        if (this._terminalSuggestWidgetVisibleContextKey.get()) {
          if (config.suggestOnTriggerCharacters && !sent && this._mostRecentPromptInputState.cursorIndex > 0) {
            const char = this._mostRecentPromptInputState.value[this._mostRecentPromptInputState.cursorIndex - 1];
            if (
              // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
              // with git branches in particular
              this._isFilteringDirectories && char.match(/[\\\/]$/)
            ) {
              sent = this._requestTriggerCharQuickSuggestCompletions();
            }
          }
        }
      }
    }
    if (this._wasLastInputRightArrowKey() && this._mostRecentPromptInputState?.ghostTextIndex !== -1 && promptInputState.ghostTextIndex === -1 && this._mostRecentPromptInputState?.value === promptInputState.value) {
      this.hideSuggestWidget(false);
    }
    this._mostRecentPromptInputState = promptInputState;
    if (!this._promptInputModel || !this._terminal || !this._suggestWidget || this._leadingLineContent === void 0) {
      return;
    }
    const previousPromptInputState = this._currentPromptInputState;
    this._currentPromptInputState = promptInputState;
    if (this._currentPromptInputState.cursorIndex > 1 && this._currentPromptInputState.value.at(this._currentPromptInputState.cursorIndex - 1) === " ") {
      if (!this._wasLastInputArrowKey()) {
        this.hideSuggestWidget(false);
        return;
      }
    }
    if (this._currentPromptInputState && this._currentPromptInputState.cursorIndex < this._leadingLineContent.length) {
      if (this._currentPromptInputState.cursorIndex <= 0 || previousPromptInputState?.value[this._currentPromptInputState.cursorIndex]?.match(/[\\\/\s]/)) {
        this.hideSuggestWidget(false);
        return;
      }
    }
    if (this._terminalSuggestWidgetVisibleContextKey.get()) {
      this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - this._requestedCompletionsIndex;
      let normalizedLeadingLineContent = this._currentPromptInputState.value.substring(0, this._requestedCompletionsIndex + this._cursorIndexDelta);
      if (this._isFilteringDirectories) {
        normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
      }
      const lineContext = new LineContext(normalizedLeadingLineContent, this._cursorIndexDelta);
      this._suggestWidget.setLineContext(lineContext);
    }
    this._refreshInlineCompletion(this._model?.items.map((i) => i.completion) || []);
    if (!this._suggestWidget.hasCompletions()) {
      this.hideSuggestWidget(false);
      return;
    }
    const dimensions = this._getTerminalDimensions();
    if (!dimensions.width || !dimensions.height) {
      return;
    }
    const xtermBox = this._screen.getBoundingClientRect();
    this._suggestWidget.showSuggestions(0, false, true, {
      left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
      top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
      height: dimensions.height
    });
  }
  _refreshInlineCompletion(completions) {
    const oldIsInvalid = this._inlineCompletionItem.isInvalid;
    if (!this._currentPromptInputState || this._currentPromptInputState.ghostTextIndex === -1) {
      this._inlineCompletionItem.isInvalid = true;
    } else {
      this._inlineCompletionItem.isInvalid = false;
      const spaceIndex = this._currentPromptInputState.value.lastIndexOf(" ", this._currentPromptInputState.ghostTextIndex - 1);
      const replacementIndex = spaceIndex === -1 ? 0 : spaceIndex + 1;
      const suggestion = this._currentPromptInputState.value.substring(replacementIndex);
      this._inlineCompletion.label = suggestion;
      this._inlineCompletion.replacementIndex = replacementIndex;
      this._inlineCompletion.replacementLength = this._currentPromptInputState.cursorIndex - replacementIndex - this._cursorIndexDelta;
      this._addPropertiesToInlineCompletionItem(completions);
      const x = new TerminalCompletionItem(this._inlineCompletion);
      this._inlineCompletionItem.idx = x.idx;
      this._inlineCompletionItem.score = x.score;
      this._inlineCompletionItem.labelLow = x.labelLow;
      this._inlineCompletionItem.textLabel = x.textLabel;
      this._inlineCompletionItem.fileExtLow = x.fileExtLow;
      this._inlineCompletionItem.labelLowExcludeFileExt = x.labelLowExcludeFileExt;
      this._inlineCompletionItem.labelLowNormalizedPath = x.labelLowNormalizedPath;
      this._inlineCompletionItem.underscorePenalty = x.underscorePenalty;
      this._inlineCompletionItem.word = x.word;
      this._model?.forceRefilterAll();
    }
    if (this._inlineCompletionItem.isInvalid !== oldIsInvalid) {
      this._model?.forceRefilterAll();
    }
  }
  _getTerminalDimensions() {
    const cssCellDims = this._terminal._core._renderService.dimensions.css.cell;
    return {
      width: cssCellDims.width,
      height: cssCellDims.height
    };
  }
  _getFontInfo() {
    if (this._cachedFontInfo) {
      return this._cachedFontInfo;
    }
    const core = this._terminal._core;
    const font = this._terminalConfigurationService.getFont(dom.getActiveWindow(), core);
    let lineHeight = font.lineHeight;
    const fontSize = font.fontSize;
    const fontFamily = font.fontFamily;
    const letterSpacing = font.letterSpacing;
    const fontWeight = this._configurationService.getValue("editor.fontWeight");
    if (lineHeight <= 1) {
      lineHeight = GOLDEN_LINE_HEIGHT_RATIO * fontSize;
    } else if (lineHeight < MINIMUM_LINE_HEIGHT) {
      lineHeight = lineHeight * fontSize;
    }
    lineHeight = Math.round(lineHeight);
    if (lineHeight < MINIMUM_LINE_HEIGHT) {
      lineHeight = MINIMUM_LINE_HEIGHT;
    }
    const fontInfo = {
      fontSize,
      lineHeight,
      fontWeight: fontWeight.toString(),
      letterSpacing,
      fontFamily
    };
    this._cachedFontInfo = fontInfo;
    return fontInfo;
  }
  _getAdvancedExplainModeDetails() {
    return `promptInputModel: ${this._promptInputModel?.getCombinedString()}`;
  }
  _showCompletions(model, explicitlyInvoked) {
    if (!this._terminal?.element) {
      return;
    }
    const suggestWidget = this._ensureSuggestWidget(this._terminal);
    suggestWidget.setCompletionModel(model);
    this._register(suggestWidget.onDidFocus(() => this._terminal?.focus()));
    if (!this._promptInputModel || !explicitlyInvoked && model.items.length === 0) {
      return;
    }
    this._model = model;
    const dimensions = this._getTerminalDimensions();
    if (!dimensions.width || !dimensions.height) {
      return;
    }
    const xtermBox = this._screen.getBoundingClientRect();
    suggestWidget.showSuggestions(0, false, !explicitlyInvoked, {
      left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
      top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
      height: dimensions.height
    });
  }
  _ensureSuggestWidget(terminal) {
    if (!this._suggestWidget) {
      this._suggestWidget = this._register(this._instantiationService.createInstance(
        SimpleSuggestWidget,
        this._container,
        this._instantiationService.createInstance(PersistedWidgetSize),
        {
          statusBarMenuId: MenuId.MenubarTerminalSuggestStatusMenu,
          showStatusBarSettingId: TerminalSuggestSettingId.ShowStatusBar
        },
        this._getFontInfo.bind(this),
        this._onDidFontConfigurationChange.event.bind(this),
        this._getAdvancedExplainModeDetails.bind(this)
      ));
      this._suggestWidget.list.style(getListStyles({
        listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
        listInactiveFocusOutline: activeContrastBorder
      }));
      this._register(this._suggestWidget.onDidSelect(async (e) => this.acceptSelectedSuggestion(e)));
      this._register(this._suggestWidget.onDidHide(() => this._terminalSuggestWidgetVisibleContextKey.reset()));
      this._register(this._suggestWidget.onDidShow(() => this._terminalSuggestWidgetVisibleContextKey.set(true)));
      this._register(this._configurationService.onDidChangeConfiguration(
        (e) => {
          if (e.affectsConfiguration(TerminalSettingId.FontFamily) || e.affectsConfiguration(TerminalSettingId.FontSize) || e.affectsConfiguration(TerminalSettingId.LineHeight) || e.affectsConfiguration(TerminalSettingId.FontFamily) || e.affectsConfiguration("editor.fontSize") || e.affectsConfiguration("editor.fontFamily")) {
            this._onDidFontConfigurationChange.fire();
          }
        }
      ));
      const element = this._terminal?.element?.querySelector(".xterm-helper-textarea");
      if (element) {
        this._register(dom.addDisposableListener(dom.getActiveDocument(), "click", (event) => {
          const target = event.target;
          if (this._terminal?.element?.contains(target)) {
            this._suggestWidget?.hide();
          }
        }));
      }
      this._register(this._suggestWidget.onDidBlurDetails((e) => {
        const elt = e.relatedTarget;
        if (this._terminal?.element?.contains(elt)) {
          return;
        }
        this._suggestWidget?.hide();
      }));
      this._terminalSuggestWidgetVisibleContextKey.set(false);
    }
    return this._suggestWidget;
  }
  selectPreviousSuggestion() {
    this._suggestWidget?.selectPrevious();
  }
  selectPreviousPageSuggestion() {
    this._suggestWidget?.selectPreviousPage();
  }
  selectNextSuggestion() {
    this._suggestWidget?.selectNext();
  }
  selectNextPageSuggestion() {
    this._suggestWidget?.selectNextPage();
  }
  acceptSelectedSuggestion(suggestion, respectRunOnEnter) {
    if (!suggestion) {
      suggestion = this._suggestWidget?.getFocusedItem();
    }
    const initialPromptInputState = this._mostRecentPromptInputState;
    if (!suggestion || !initialPromptInputState || this._leadingLineContent === void 0 || !this._model) {
      this._suggestTelemetry?.acceptCompletion(void 0, this._mostRecentPromptInputState?.value);
      return;
    }
    SuggestAddon.lastAcceptedCompletionTimestamp = Date.now();
    this._suggestWidget?.hide();
    const currentPromptInputState = this._currentPromptInputState ?? initialPromptInputState;
    const replacementText = currentPromptInputState.value.substring(suggestion.item.completion.replacementIndex, currentPromptInputState.cursorIndex);
    let rightSideReplacementText = "";
    if (
      // The line didn't end with ghost text
      (currentPromptInputState.ghostTextIndex === -1 || currentPromptInputState.ghostTextIndex > currentPromptInputState.cursorIndex) && // There is more than one charatcer
      currentPromptInputState.value.length > currentPromptInputState.cursorIndex + 1 && // THe next character is not a space
      currentPromptInputState.value.at(currentPromptInputState.cursorIndex) !== " "
    ) {
      const spaceIndex = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, currentPromptInputState.ghostTextIndex === -1 ? void 0 : currentPromptInputState.ghostTextIndex).indexOf(" ");
      rightSideReplacementText = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, spaceIndex === -1 ? void 0 : currentPromptInputState.cursorIndex + spaceIndex);
    }
    const completion = suggestion.item.completion;
    let resultSequence = completion.inputData;
    if (resultSequence === void 0) {
      let completionText = typeof completion.label === "string" ? completion.label : completion.label.label;
      if ((completion.kind === TerminalCompletionItemKind.Folder || completion.isFileOverride) && completionText.includes(" ")) {
        completionText = completionText.replaceAll(" ", "\\ ");
      }
      let runOnEnter = false;
      if (respectRunOnEnter) {
        const runOnEnterConfig = this._configurationService.getValue(terminalSuggestConfigSection).runOnEnter;
        switch (runOnEnterConfig) {
          case "always": {
            runOnEnter = true;
            break;
          }
          case "exactMatch": {
            runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
            break;
          }
          case "exactMatchIgnoreExtension": {
            runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
            if (completion.isFileOverride) {
              runOnEnter ||= replacementText.toLowerCase() === completionText.toLowerCase().replace(/\.[^\.]+$/, "");
            }
            break;
          }
        }
      }
      const commonPrefixLen = commonPrefixLength(replacementText, completionText);
      const commonPrefix = replacementText.substring(replacementText.length - 1 - commonPrefixLen, replacementText.length - 1);
      const completionSuffix = completionText.substring(commonPrefixLen);
      if (currentPromptInputState.suffix.length > 0 && currentPromptInputState.prefix.endsWith(commonPrefix) && currentPromptInputState.suffix.startsWith(completionSuffix)) {
        resultSequence = "\x1BOC".repeat(completionText.length - commonPrefixLen);
      } else {
        resultSequence = [
          // Backspace (left) to remove all additional input
          "\x7F".repeat(replacementText.length - commonPrefixLen),
          // Delete (right) to remove any additional text in the same word
          "\x1B[3~".repeat(rightSideReplacementText.length),
          // Write the completion
          completionSuffix,
          // Run on enter if needed
          runOnEnter ? "\r" : ""
        ].join("");
      }
    }
    if (completion.kind === TerminalCompletionItemKind.Folder) {
      SuggestAddon.lastAcceptedCompletionTimestamp = 0;
    }
    this._onAcceptedCompletion.fire(resultSequence);
    this._suggestTelemetry?.acceptCompletion(completion, this._mostRecentPromptInputState?.value);
    this.hideSuggestWidget(true);
  }
  hideSuggestWidget(cancelAnyRequest) {
    if (cancelAnyRequest) {
      this._cancellationTokenSource?.cancel();
      this._cancellationTokenSource = void 0;
    }
    this._currentPromptInputState = void 0;
    this._leadingLineContent = void 0;
    this._suggestWidget?.hide();
  }
};
SuggestAddon = __decorateClass([
  __decorateParam(3, ITerminalCompletionService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, ITerminalConfigurationService)
], SuggestAddon);
let PersistedWidgetSize = class {
  constructor(_storageService) {
    this._storageService = _storageService;
  }
  static {
    __name(this, "PersistedWidgetSize");
  }
  _key = TerminalStorageKeys.TerminalSuggestSize;
  restore() {
    const raw = this._storageService.get(this._key, StorageScope.PROFILE) ?? "";
    try {
      const obj = JSON.parse(raw);
      if (dom.Dimension.is(obj)) {
        return dom.Dimension.lift(obj);
      }
    } catch {
    }
    return void 0;
  }
  store(size) {
    this._storageService.store(this._key, JSON.stringify(size), StorageScope.PROFILE, StorageTarget.MACHINE);
  }
  reset() {
    this._storageService.remove(this._key, StorageScope.PROFILE);
  }
};
PersistedWidgetSize = __decorateClass([
  __decorateParam(0, IStorageService)
], PersistedWidgetSize);
function normalizePathSeparator(path, sep2) {
  if (sep2 === "/") {
    return path.replaceAll("\\", "/");
  }
  return path.replaceAll("/", "\\");
}
__name(normalizePathSeparator, "normalizePathSeparator");
export {
  SuggestAddon,
  normalizePathSeparator
};
//# sourceMappingURL=terminalSuggestAddon.js.map
