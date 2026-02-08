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
import { h } from "../../../../../../../base/browser/dom.js";
import { ActionBar } from "../../../../../../../base/browser/ui/actionbar/actionbar.js";
import { isMarkdownString, MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ChatConfiguration } from "../../../../common/constants.js";
import { migrateLegacyTerminalToolSpecificData } from "../../../../common/chat.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
import { IChatWidgetService } from "../../../chat.js";
import { ChatQueryTitlePart } from "../chatConfirmationWidget.js";
import { ChatMarkdownContentPart } from "../chatMarkdownContentPart.js";
import { ChatProgressSubPart } from "../chatProgressContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
import { TerminalToolAutoExpand } from "./terminalToolAutoExpand.js";
import { ChatCollapsibleContentPart } from "../chatCollapsibleContentPart.js";
import "../media/chatTerminalToolProgressPart.css";
import { Action } from "../../../../../../../base/common/actions.js";
import { timeout } from "../../../../../../../base/common/async.js";
import { ITerminalChatService, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalService } from "../../../../../terminal/browser/terminal.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { ThemeIcon } from "../../../../../../../base/common/themables.js";
import { getTerminalCommandDecorationState, getTerminalCommandDecorationTooltip } from "../../../../../terminal/browser/xterm/decorationStyles.js";
import * as dom from "../../../../../../../base/browser/dom.js";
import { DomScrollableElement } from "../../../../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { localize } from "../../../../../../../nls.js";
import { IHoverService } from "../../../../../../../platform/hover/browser/hover.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { stripIcons } from "../../../../../../../base/common/iconLabels.js";
import { IAccessibleViewService } from "../../../../../../../platform/accessibility/browser/accessibleView.js";
import { IContextKeyService } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../../../common/actions/chatContextKeys.js";
import { IKeybindingService } from "../../../../../../../platform/keybinding/common/keybinding.js";
import { DetachedTerminalCommandMirror, DetachedTerminalSnapshotMirror } from "../../../../../terminal/browser/chatTerminalCommandMirror.js";
import { TerminalLocation } from "../../../../../../../platform/terminal/common/terminal.js";
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { ITelemetryService } from "../../../../../../../platform/telemetry/common/telemetry.js";
import { isNumber } from "../../../../../../../base/common/types.js";
import { removeAnsiEscapeCodes } from "../../../../../../../base/common/strings.js";
import { PANEL_BACKGROUND } from "../../../../../../common/theme.js";
import { editorBackground } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../../../../platform/theme/common/themeService.js";
const MIN_OUTPUT_ROWS = 1;
const MAX_OUTPUT_ROWS = 10;
const expandedStateByInvocation = /* @__PURE__ */ new WeakMap();
let TerminalCommandDecoration = class TerminalCommandDecoration2 extends Disposable {
  static {
    __name(this, "TerminalCommandDecoration");
  }
  constructor(_options, _hoverService) {
    super();
    this._options = _options;
    this._hoverService = _hoverService;
    const decorationElements = h("span.chat-terminal-command-decoration@decoration", { role: "img", tabIndex: 0 });
    this._element = decorationElements.decoration;
    this._attachElementToContainer();
  }
  _attachElementToContainer() {
    const container = this._options.getCommandBlock();
    if (!container) {
      return;
    }
    const decoration = this._element;
    if (!decoration.isConnected || decoration.parentElement !== container) {
      const icon = this._options.getIconElement();
      if (icon && icon.parentElement === container) {
        icon.insertAdjacentElement("afterend", decoration);
      } else {
        container.insertBefore(decoration, container.firstElementChild ?? null);
      }
    }
    this._register(this._hoverService.setupDelayedHover(decoration, () => ({
      content: this._getHoverText()
    })));
    this._attachInteractionHandlers(decoration);
  }
  _getHoverText() {
    const command = this._options.getResolvedCommand();
    const storedState = this._options.terminalData.terminalCommandState;
    return getTerminalCommandDecorationTooltip(command, storedState) || "";
  }
  update(command) {
    this._attachElementToContainer();
    const decoration = this._element;
    const resolvedCommand = command ?? this._options.getResolvedCommand();
    this._apply(decoration, resolvedCommand);
  }
  _apply(decoration, command) {
    const terminalData = this._options.terminalData;
    let storedState = terminalData.terminalCommandState;
    if (command) {
      const existingState = terminalData.terminalCommandState ?? {};
      terminalData.terminalCommandState = {
        ...existingState,
        exitCode: command.exitCode,
        timestamp: command.timestamp ?? existingState.timestamp,
        duration: command.duration ?? existingState.duration
      };
      storedState = terminalData.terminalCommandState;
    } else if (!storedState) {
      const now = Date.now();
      terminalData.terminalCommandState = { exitCode: void 0, timestamp: now };
      storedState = terminalData.terminalCommandState;
    }
    const decorationState = getTerminalCommandDecorationState(command, storedState);
    const tooltip = getTerminalCommandDecorationTooltip(command, storedState);
    decoration.className = `chat-terminal-command-decoration ${"terminal-command-decoration"}`;
    decoration.classList.add(
      "codicon"
      /* DecorationSelector.Codicon */
    );
    for (const className of decorationState.classNames) {
      decoration.classList.add(className);
    }
    decoration.classList.add(...ThemeIcon.asClassNameArray(decorationState.icon));
    const isInteractive = !decoration.classList.contains(
      "default"
      /* DecorationSelector.Default */
    );
    decoration.tabIndex = isInteractive ? 0 : -1;
    if (isInteractive) {
      decoration.removeAttribute("aria-disabled");
    } else {
      decoration.setAttribute("aria-disabled", "true");
    }
    const hoverText = tooltip || decorationState.hoverMessage;
    if (hoverText) {
      decoration.setAttribute("aria-label", hoverText);
    } else {
      decoration.removeAttribute("aria-label");
    }
  }
  _attachInteractionHandlers(decoration) {
    if (this._interactionElement === decoration) {
      return;
    }
    this._interactionElement = decoration;
  }
};
TerminalCommandDecoration = __decorate([
  __param(1, IHoverService)
], TerminalCommandDecoration);
let ChatTerminalToolProgressPart = class ChatTerminalToolProgressPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatTerminalToolProgressPart");
  }
  get codeblocks() {
    return this.markdownPart?.codeblocks ?? [];
  }
  get elementIndex() {
    return this._elementIndex;
  }
  get contentIndex() {
    return this._contentIndex;
  }
  constructor(toolInvocation, terminalData, context, renderer, editorPool, currentWidthDelegate, codeBlockStartIndex, codeBlockModelCollection, _instantiationService, _terminalChatService, _terminalService, _contextKeyService, _chatWidgetService, _keybindingService, _configurationService) {
    super(toolInvocation);
    this._instantiationService = _instantiationService;
    this._terminalChatService = _terminalChatService;
    this._terminalService = _terminalService;
    this._contextKeyService = _contextKeyService;
    this._chatWidgetService = _chatWidgetService;
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
    this._showOutputAction = this._register(new MutableDisposable());
    this._showOutputActionAdded = false;
    this._focusAction = this._register(new MutableDisposable());
    this._continueInBackgroundAction = this._register(new MutableDisposable());
    this._userToggledOutput = false;
    this._isInThinkingContainer = false;
    this._elementIndex = context.elementIndex;
    this._contentIndex = context.contentIndex;
    this._sessionResource = context.element.sessionResource;
    terminalData = migrateLegacyTerminalToolSpecificData(terminalData);
    this._terminalData = terminalData;
    this._terminalCommandUri = terminalData.terminalCommandUri ? URI.revive(terminalData.terminalCommandUri) : void 0;
    this._storedCommandId = this._terminalCommandUri ? new URLSearchParams(this._terminalCommandUri.query ?? "").get("command") ?? void 0 : void 0;
    this._isSerializedInvocation = toolInvocation.kind === "toolInvocationSerialized";
    const elements = h(".chat-terminal-content-part@container", [
      h(".chat-terminal-content-title@title", [
        h(".chat-terminal-command-block@commandBlock")
      ]),
      h(".chat-terminal-content-message@message")
    ]);
    this._titleElement = elements.title;
    const command = (terminalData.commandLine.forDisplay ?? terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original).trimStart();
    this._commandText = command;
    this._terminalOutputContextKey = ChatContextKeys.inChatTerminalToolOutput.bindTo(this._contextKeyService);
    this._decoration = this._register(this._instantiationService.createInstance(TerminalCommandDecoration, {
      terminalData: this._terminalData,
      getCommandBlock: /* @__PURE__ */ __name(() => elements.commandBlock, "getCommandBlock"),
      getIconElement: /* @__PURE__ */ __name(() => void 0, "getIconElement"),
      getResolvedCommand: /* @__PURE__ */ __name(() => this._getResolvedCommand(), "getResolvedCommand")
    }));
    const displayCommand = terminalData.presentationOverrides?.commandLine ?? command;
    const displayLanguage = terminalData.presentationOverrides?.language ?? terminalData.language;
    const titlePart = this._register(_instantiationService.createInstance(ChatQueryTitlePart, elements.commandBlock, new MarkdownString([
      `\`\`\`${displayLanguage}`,
      `${displayCommand.replaceAll("```", "\\`\\`\\`")}`,
      `\`\`\``
    ].join("\n"), { supportThemeIcons: true }), void 0));
    this._register(titlePart.onDidChangeHeight(() => {
      this._decoration.update();
    }));
    this._outputView = this._register(this._instantiationService.createInstance(ChatTerminalToolOutputSection, () => this._ensureTerminalInstance(), () => this._getResolvedCommand(), () => this._terminalData.terminalCommandOutput, () => this._commandText, () => this._terminalData.terminalTheme));
    elements.container.append(this._outputView.domNode);
    this._register(this._outputView.onDidFocus(() => this._handleOutputFocus()));
    this._register(this._outputView.onDidBlur((e) => this._handleOutputBlur(e)));
    this._register(toDisposable(() => this._handleDispose()));
    this._register(this._keybindingService.onDidUpdateKeybindings(() => {
      this._focusAction.value?.refreshKeybindingTooltip();
      this._showOutputAction.value?.refreshKeybindingTooltip();
    }));
    const actionBarEl = h(".chat-terminal-action-bar@actionBar");
    elements.title.append(actionBarEl.root);
    this._actionBar = this._register(new ActionBar(actionBarEl.actionBar, {}));
    this._initializeTerminalActions();
    this._terminalService.whenConnected.then(() => this._initializeTerminalActions());
    let pastTenseMessage;
    if (toolInvocation.pastTenseMessage) {
      pastTenseMessage = `${typeof toolInvocation.pastTenseMessage === "string" ? toolInvocation.pastTenseMessage : toolInvocation.pastTenseMessage.value}`;
    }
    const markdownContent = new MarkdownString(pastTenseMessage, {
      supportThemeIcons: true,
      isTrusted: isMarkdownString(toolInvocation.pastTenseMessage) ? toolInvocation.pastTenseMessage.isTrusted : false
    });
    const chatMarkdownContent = {
      kind: "markdownContent",
      content: markdownContent
    };
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on"
      }
    };
    const markdownOptions = {
      codeBlockRenderOptions,
      accessibilityOptions: pastTenseMessage ? {
        statusMessage: localize("terminalToolCommand", "{0}", stripIcons(pastTenseMessage))
      } : void 0
    };
    this.markdownPart = this._register(_instantiationService.createInstance(ChatMarkdownContentPart, chatMarkdownContent, context, editorPool, false, codeBlockStartIndex, renderer, {}, currentWidthDelegate(), codeBlockModelCollection, markdownOptions));
    elements.message.append(this.markdownPart.domNode);
    const progressPart = this._register(_instantiationService.createInstance(ChatProgressSubPart, elements.container, this.getIcon(), terminalData.autoApproveInfo));
    this._decoration.update();
    const terminalToolsInThinking = this._configurationService.getValue(ChatConfiguration.TerminalToolsInThinking);
    const requiresConfirmation = toolInvocation.kind === "toolInvocation" && IChatToolInvocation.getConfirmationMessages(toolInvocation);
    if (terminalToolsInThinking && !requiresConfirmation) {
      this._isInThinkingContainer = true;
      this.domNode = this._createCollapsibleWrapper(progressPart.domNode, command, toolInvocation, context);
    } else {
      this.domNode = progressPart.domNode;
    }
    const hasStoredOutput = !!terminalData.terminalCommandOutput;
    if (expandedStateByInvocation.get(toolInvocation) || this._isInThinkingContainer && IChatToolInvocation.isComplete(toolInvocation) && hasStoredOutput) {
      void this._toggleOutput(true);
    }
    this._register(this._terminalChatService.registerProgressPart(this));
  }
  _createCollapsibleWrapper(contentElement, commandText, toolInvocation, context) {
    const maxCommandLength = 50;
    const truncatedCommand = commandText.length > maxCommandLength ? commandText.substring(0, maxCommandLength) + "..." : commandText;
    const isComplete = IChatToolInvocation.isComplete(toolInvocation);
    const autoExpandFailures = this._configurationService.getValue(ChatConfiguration.AutoExpandToolFailures);
    const hasError = autoExpandFailures && this._terminalData.terminalCommandState?.exitCode !== void 0 && this._terminalData.terminalCommandState.exitCode !== 0;
    const initialExpanded = !isComplete || hasError;
    const wrapper = this._register(this._instantiationService.createInstance(ChatTerminalThinkingCollapsibleWrapper, truncatedCommand, contentElement, context, initialExpanded, isComplete));
    this._thinkingCollapsibleWrapper = wrapper;
    return wrapper.domNode;
  }
  expandCollapsibleWrapper() {
    this._thinkingCollapsibleWrapper?.expand();
  }
  markCollapsibleWrapperComplete() {
    this._thinkingCollapsibleWrapper?.markComplete();
  }
  async _initializeTerminalActions() {
    if (this._store.isDisposed) {
      return;
    }
    const terminalToolSessionId = this._terminalData.terminalToolSessionId;
    if (!terminalToolSessionId) {
      this._addActions();
      return;
    }
    const attachInstance = /* @__PURE__ */ __name(async (instance) => {
      if (this._store.isDisposed) {
        return;
      }
      if (!instance) {
        if (this._isSerializedInvocation) {
          this._clearCommandAssociation();
        }
        this._addActions(void 0, terminalToolSessionId);
        return;
      }
      const isNewInstance = this._terminalInstance !== instance;
      if (isNewInstance) {
        this._terminalInstance = instance;
        this._registerInstanceListener(instance);
      }
      this._addActions(instance, terminalToolSessionId);
    }, "attachInstance");
    const initialInstance = await this._terminalChatService.getTerminalInstanceByToolSessionId(terminalToolSessionId);
    await attachInstance(initialInstance);
    if (!initialInstance) {
      this._addActions(void 0, terminalToolSessionId);
    }
    if (this._store.isDisposed) {
      return;
    }
    if (!this._terminalSessionRegistration) {
      const listener = this._terminalChatService.onDidRegisterTerminalInstanceWithToolSession(async (instance) => {
        const registeredInstance = await this._terminalChatService.getTerminalInstanceByToolSessionId(terminalToolSessionId);
        if (instance !== registeredInstance) {
          return;
        }
        this._terminalSessionRegistration?.dispose();
        this._terminalSessionRegistration = void 0;
        await attachInstance(instance);
      });
      this._terminalSessionRegistration = this._store.add(listener);
    }
    this._store.add(this._terminalChatService.onDidContinueInBackground((sessionId) => {
      if (sessionId === terminalToolSessionId) {
        this._terminalData.didContinueInBackground = true;
        this._removeContinueInBackgroundAction();
      }
    }));
  }
  _addActions(terminalInstance, terminalToolSessionId) {
    if (this._store.isDisposed) {
      return;
    }
    const actionBar = this._actionBar;
    this._removeFocusAction();
    const resolvedCommand = this._getResolvedCommand(terminalInstance);
    this._removeContinueInBackgroundAction();
    if (terminalInstance) {
      const isTerminalHidden = terminalInstance && terminalToolSessionId ? this._terminalChatService.isBackgroundTerminal(terminalToolSessionId) : false;
      const focusAction = this._instantiationService.createInstance(FocusChatInstanceAction, terminalInstance, resolvedCommand, this._terminalCommandUri, this._storedCommandId, isTerminalHidden);
      this._focusAction.value = focusAction;
      actionBar.push(focusAction, { icon: true, label: false, index: 0 });
      if (terminalToolSessionId && !this._terminalData.isBackground && !this._terminalData.didContinueInBackground) {
        const isStillRunning = resolvedCommand?.exitCode === void 0 && this._terminalData.terminalCommandState?.exitCode === void 0;
        if (isStillRunning) {
          const continueAction = this._instantiationService.createInstance(ContinueInBackgroundAction, terminalToolSessionId);
          this._continueInBackgroundAction.value = continueAction;
          actionBar.push(continueAction, { icon: true, label: false, index: 0 });
        }
      }
    }
    this._ensureShowOutputAction(resolvedCommand);
    this._decoration.update(resolvedCommand);
  }
  _getResolvedCommand(instance) {
    const target = instance ?? this._terminalInstance;
    if (!target) {
      return void 0;
    }
    return this._resolveCommand(target);
  }
  _ensureShowOutputAction(command) {
    if (this._store.isDisposed) {
      return;
    }
    if (this._isInThinkingContainer) {
      return;
    }
    const resolvedCommand = command ?? this._getResolvedCommand();
    const hasSnapshot = !!this._terminalData.terminalCommandOutput;
    if (!resolvedCommand && !hasSnapshot) {
      return;
    }
    let showOutputAction = this._showOutputAction.value;
    if (!showOutputAction) {
      showOutputAction = this._instantiationService.createInstance(ToggleChatTerminalOutputAction, () => this._toggleOutputFromAction());
      this._showOutputAction.value = showOutputAction;
      const autoExpandFailures = this._configurationService.getValue(ChatConfiguration.AutoExpandToolFailures);
      const exitCode = resolvedCommand?.exitCode ?? this._terminalData.terminalCommandState?.exitCode;
      if (exitCode !== void 0 && exitCode !== 0 && autoExpandFailures) {
        this._toggleOutput(true);
      }
    }
    showOutputAction.syncPresentation(this._outputView.isExpanded);
    const actionBar = this._actionBar;
    if (this._showOutputActionAdded) {
      const existingIndex = actionBar.viewItems.findIndex((item) => item.action === showOutputAction);
      if (existingIndex >= 0 && existingIndex !== actionBar.length() - 1) {
        actionBar.pull(existingIndex);
        this._showOutputActionAdded = false;
      } else if (existingIndex >= 0) {
        return;
      }
    }
    if (this._showOutputActionAdded) {
      return;
    }
    actionBar.push([showOutputAction], { icon: true, label: false });
    this._showOutputActionAdded = true;
  }
  _clearCommandAssociation(options) {
    this._terminalCommandUri = void 0;
    this._storedCommandId = void 0;
    if (options?.clearPersistentData) {
      if (this._terminalData.terminalCommandUri) {
        delete this._terminalData.terminalCommandUri;
      }
      if (this._terminalData.terminalToolSessionId) {
        delete this._terminalData.terminalToolSessionId;
      }
    }
    this._decoration.update();
  }
  _registerInstanceListener(terminalInstance) {
    const commandDetectionListener = this._register(new MutableDisposable());
    const tryResolveCommand = /* @__PURE__ */ __name(async () => {
      const resolvedCommand = this._resolveCommand(terminalInstance);
      this._addActions(terminalInstance, this._terminalData.terminalToolSessionId);
      return resolvedCommand;
    }, "tryResolveCommand");
    const attachCommandDetection = /* @__PURE__ */ __name(async (commandDetection) => {
      commandDetectionListener.clear();
      if (!commandDetection) {
        await tryResolveCommand();
        return;
      }
      const store = new DisposableStore();
      let receivedDataCount = 0;
      const hasRealOutput = /* @__PURE__ */ __name(() => {
        if (this._terminalData.terminalCommandOutput?.text?.trim()) {
          return true;
        }
        const command = this._getResolvedCommand(terminalInstance);
        if (!command?.executedMarker || terminalInstance.isDisposed) {
          return false;
        }
        const buffer = terminalInstance.xterm?.raw.buffer.active;
        if (!buffer) {
          return false;
        }
        const cursorLine = buffer.baseY + buffer.cursorY;
        if (cursorLine > command.executedMarker.line) {
          return true;
        }
        return receivedDataCount > 2;
      }, "hasRealOutput");
      const autoExpand = store.add(new TerminalToolAutoExpand({
        commandDetection,
        onWillData: terminalInstance.onWillData,
        shouldAutoExpand: /* @__PURE__ */ __name(() => !this._outputView.isExpanded && !this._userToggledOutput && !this._store.isDisposed && !expandedStateByInvocation.get(this.toolInvocation), "shouldAutoExpand"),
        hasRealOutput
      }));
      store.add(autoExpand.onDidRequestExpand(() => {
        if (this._isInThinkingContainer) {
          this.expandCollapsibleWrapper();
        }
        this._toggleOutput(true);
      }));
      store.add(terminalInstance.onWillData(() => {
        receivedDataCount++;
      }));
      store.add(commandDetection.onCommandExecuted(() => {
        this._addActions(terminalInstance, this._terminalData.terminalToolSessionId);
      }));
      store.add(commandDetection.onCommandFinished(() => {
        this._addActions(terminalInstance, this._terminalData.terminalToolSessionId);
        const resolvedCommand = this._getResolvedCommand(terminalInstance);
        this.markCollapsibleWrapperComplete();
        if (resolvedCommand?.exitCode === 0 && this._outputView.isExpanded && !this._userToggledOutput) {
          this._toggleOutput(false);
        }
        const autoExpandFailures = this._configurationService.getValue(ChatConfiguration.AutoExpandToolFailures);
        if (autoExpandFailures && resolvedCommand?.exitCode !== void 0 && resolvedCommand.exitCode !== 0 && this._thinkingCollapsibleWrapper) {
          this.expandCollapsibleWrapper();
        }
        if (resolvedCommand?.endMarker) {
          commandDetectionListener.clear();
        }
      }));
      commandDetectionListener.value = store;
      const resolvedImmediately = await tryResolveCommand();
      if (resolvedImmediately?.endMarker) {
        commandDetectionListener.clear();
        this.markCollapsibleWrapperComplete();
        if (resolvedImmediately.exitCode === 0 && this._outputView.isExpanded && !this._userToggledOutput) {
          this._toggleOutput(false);
        }
        const autoExpandFailures = this._configurationService.getValue(ChatConfiguration.AutoExpandToolFailures);
        if (autoExpandFailures && resolvedImmediately.exitCode !== void 0 && resolvedImmediately.exitCode !== 0 && this._thinkingCollapsibleWrapper) {
          this.expandCollapsibleWrapper();
        }
        return;
      }
    }, "attachCommandDetection");
    attachCommandDetection(terminalInstance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    ));
    this._register(terminalInstance.capabilities.onDidAddCommandDetectionCapability((cd) => attachCommandDetection(cd)));
    const instanceListener = this._register(terminalInstance.onDisposed(() => {
      if (this._terminalInstance === terminalInstance) {
        this._terminalInstance = void 0;
      }
      this._clearCommandAssociation({ clearPersistentData: true });
      commandDetectionListener.clear();
      if (!this._store.isDisposed) {
        this._actionBar.clear();
      }
      this._removeFocusAction();
      this._showOutputActionAdded = false;
      this._showOutputAction.clear();
      this._addActions(void 0, this._terminalData.terminalToolSessionId);
      instanceListener.dispose();
    }));
  }
  _removeFocusAction() {
    if (this._store.isDisposed) {
      return;
    }
    const actionBar = this._actionBar;
    const focusAction = this._focusAction.value;
    if (actionBar && focusAction) {
      const existingIndex = actionBar.viewItems.findIndex((item) => item.action === focusAction);
      if (existingIndex >= 0) {
        actionBar.pull(existingIndex);
      }
    }
    this._focusAction.clear();
  }
  _removeContinueInBackgroundAction() {
    if (this._store.isDisposed) {
      return;
    }
    const actionBar = this._actionBar;
    const continueAction = this._continueInBackgroundAction.value;
    if (actionBar && continueAction) {
      const existingIndex = actionBar.viewItems.findIndex((item) => item.action === continueAction);
      if (existingIndex >= 0) {
        actionBar.pull(existingIndex);
      }
    }
    this._continueInBackgroundAction.clear();
  }
  async _toggleOutput(expanded) {
    const didChange = await this._outputView.toggle(expanded);
    const isExpanded = this._outputView.isExpanded;
    this._titleElement.classList.toggle("chat-terminal-content-title-no-bottom-radius", isExpanded);
    this._showOutputAction.value?.syncPresentation(isExpanded);
    if (didChange) {
      expandedStateByInvocation.set(this.toolInvocation, isExpanded);
    }
    return didChange;
  }
  async _ensureTerminalInstance() {
    if (this._terminalInstance?.isDisposed) {
      this._terminalInstance = void 0;
    }
    if (!this._terminalInstance && this._terminalData.terminalToolSessionId) {
      this._terminalInstance = await this._terminalChatService.getTerminalInstanceByToolSessionId(this._terminalData.terminalToolSessionId);
      if (this._terminalInstance?.isDisposed) {
        this._terminalInstance = void 0;
      }
    }
    return this._terminalInstance;
  }
  _handleOutputFocus() {
    this._terminalOutputContextKey.set(true);
    this._terminalChatService.setFocusedProgressPart(this);
    this._outputView.updateAriaLabel();
  }
  _handleOutputBlur(event) {
    const nextTarget = event.relatedTarget;
    if (this._outputView.containsElement(nextTarget)) {
      return;
    }
    this._terminalOutputContextKey.reset();
    this._terminalChatService.clearFocusedProgressPart(this);
  }
  _handleDispose() {
    this._terminalOutputContextKey.reset();
    this._terminalChatService.clearFocusedProgressPart(this);
  }
  getCommandAndOutputAsText() {
    return this._outputView.getCommandAndOutputAsText();
  }
  focusOutput() {
    this._outputView.focus();
  }
  _focusChatInput() {
    const widget = this._chatWidgetService.getWidgetBySessionResource(this._sessionResource);
    widget?.focusInput();
  }
  async focusTerminal() {
    if (this._focusAction.value) {
      await this._focusAction.value.run();
      return;
    }
    if (this._terminalCommandUri) {
      this._terminalService.openResource(this._terminalCommandUri);
    }
  }
  async toggleOutputFromKeyboard() {
    this._userToggledOutput = true;
    if (!this._outputView.isExpanded) {
      await this._toggleOutput(true);
      this.focusOutput();
      return;
    }
    await this._collapseOutputAndFocusInput();
  }
  async _toggleOutputFromAction() {
    this._userToggledOutput = true;
    if (!this._outputView.isExpanded) {
      await this._toggleOutput(true);
      return;
    }
    await this._toggleOutput(false);
  }
  async _collapseOutputAndFocusInput() {
    if (this._outputView.isExpanded) {
      await this._toggleOutput(false);
    }
    this._focusChatInput();
  }
  _resolveCommand(instance) {
    if (instance.isDisposed) {
      return void 0;
    }
    const commandDetection = instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (!commandDetection) {
      return void 0;
    }
    const targetId = this._terminalData.terminalCommandId;
    if (!targetId) {
      return void 0;
    }
    const commands = commandDetection.commands;
    if (commands && commands.length > 0) {
      const fromHistory = commands.find((c) => c.id === targetId);
      if (fromHistory) {
        return fromHistory;
      }
    }
    const executing = commandDetection.executingCommandObject;
    if (executing && executing.id === targetId) {
      return executing;
    }
    return void 0;
  }
};
ChatTerminalToolProgressPart = __decorate([
  __param(8, IInstantiationService),
  __param(9, ITerminalChatService),
  __param(10, ITerminalService),
  __param(11, IContextKeyService),
  __param(12, IChatWidgetService),
  __param(13, IKeybindingService),
  __param(14, IConfigurationService)
], ChatTerminalToolProgressPart);
let ChatTerminalToolOutputSection = class ChatTerminalToolOutputSection2 extends Disposable {
  static {
    __name(this, "ChatTerminalToolOutputSection");
  }
  get isExpanded() {
    return this.domNode.classList.contains("expanded");
  }
  get onDidFocus() {
    return this._onDidFocusEmitter.event;
  }
  get onDidBlur() {
    return this._onDidBlurEmitter.event;
  }
  constructor(_ensureTerminalInstance, _resolveCommand, _getTerminalCommandOutput, _getCommandText, _getStoredTheme, _accessibleViewService, _instantiationService, _terminalConfigurationService, _themeService, _contextKeyService) {
    super();
    this._ensureTerminalInstance = _ensureTerminalInstance;
    this._resolveCommand = _resolveCommand;
    this._getTerminalCommandOutput = _getTerminalCommandOutput;
    this._getCommandText = _getCommandText;
    this._getStoredTheme = _getStoredTheme;
    this._accessibleViewService = _accessibleViewService;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._themeService = _themeService;
    this._contextKeyService = _contextKeyService;
    this._isAtBottom = true;
    this._isProgrammaticScroll = false;
    this._onDidFocusEmitter = this._register(new Emitter());
    this._onDidBlurEmitter = this._register(new Emitter());
    const containerElements = h(".chat-terminal-output-container@container", [
      h(".chat-terminal-output-body@body", [
        h(".chat-terminal-output-content@content", [
          h(".chat-terminal-output-terminal@terminal"),
          h(".chat-terminal-output-empty@empty")
        ])
      ])
    ]);
    this.domNode = containerElements.container;
    this.domNode.classList.add("collapsed");
    this._outputBody = containerElements.body;
    this._contentContainer = containerElements.content;
    this._terminalContainer = containerElements.terminal;
    this._emptyElement = containerElements.empty;
    this._contentContainer.appendChild(this._emptyElement);
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.FOCUS_IN, () => this._onDidFocusEmitter.fire()));
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.FOCUS_OUT, (event) => this._onDidBlurEmitter.fire(event)));
    const resizeObserver = new ResizeObserver(() => this._handleResize());
    resizeObserver.observe(this.domNode);
    this._register(toDisposable(() => resizeObserver.disconnect()));
    this._applyBackgroundColor();
    this._register(this._themeService.onDidColorThemeChange(() => this._applyBackgroundColor()));
  }
  async toggle(expanded) {
    const currentlyExpanded = this.isExpanded;
    if (expanded === currentlyExpanded) {
      if (expanded) {
        await this._updateTerminalContent();
      }
      return false;
    }
    if (!expanded) {
      this._setExpanded(false);
      this._isAtBottom = true;
      return true;
    }
    if (!this._scrollableContainer) {
      await this._createScrollableContainer();
    }
    await this._updateTerminalContent();
    this._setExpanded(true);
    this._layoutOutput();
    this._scrollOutputToBottom();
    this._scheduleOutputRelayout();
    return true;
  }
  focus() {
    this._scrollableContainer?.getDomNode().focus();
  }
  containsElement(element) {
    return !!element && this.domNode.contains(element);
  }
  updateAriaLabel() {
    if (!this._scrollableContainer) {
      return;
    }
    const command = this._resolveCommand();
    const commandText = command?.command ?? this._getCommandText();
    if (!commandText) {
      return;
    }
    const ariaLabel = localize("chatTerminalOutputAriaLabel", "Terminal output for {0}", commandText);
    const scrollableDomNode = this._scrollableContainer.getDomNode();
    scrollableDomNode.setAttribute("role", "region");
    const accessibleViewHint = this._accessibleViewService.getOpenAriaHint(
      "accessibility.verbosity.terminalChatOutput"
      /* AccessibilityVerbositySettingId.TerminalChatOutput */
    );
    const label = accessibleViewHint ? ariaLabel + ", " + accessibleViewHint : ariaLabel;
    scrollableDomNode.setAttribute("aria-label", label);
  }
  getCommandAndOutputAsText() {
    const command = this._resolveCommand();
    const commandText = command?.command ?? this._getCommandText();
    if (!commandText) {
      return void 0;
    }
    const commandHeader = localize("chatTerminalOutputAccessibleViewHeader", "Command: {0}", commandText);
    if (command) {
      const rawOutput = command.getOutput();
      if (!rawOutput || rawOutput.trim().length === 0) {
        return `${commandHeader}
${localize("chat.terminalOutputEmpty", "No output was produced by the command.")}`;
      }
      const lines = rawOutput.split("\n");
      return `${commandHeader}
${lines.join("\n").trimEnd()}`;
    }
    const snapshot = this._getTerminalCommandOutput();
    if (!snapshot) {
      return `${commandHeader}
${localize("chatTerminalOutputUnavailable", "Command output is no longer available.")}`;
    }
    const plain = removeAnsiEscapeCodes(snapshot.text ?? "");
    if (!plain.trim().length) {
      return `${commandHeader}
${localize("chat.terminalOutputEmpty", "No output was produced by the command.")}`;
    }
    let outputText = plain.trimEnd();
    if (snapshot.truncated) {
      outputText += `
${localize("chatTerminalOutputTruncated", "Output truncated.")}`;
    }
    return `${commandHeader}
${outputText}`;
  }
  _setExpanded(expanded) {
    this.domNode.classList.toggle("expanded", expanded);
    this.domNode.classList.toggle("collapsed", !expanded);
  }
  async _createScrollableContainer() {
    this._scrollableContainer = this._register(new DomScrollableElement(this._outputBody, {
      vertical: 2,
      horizontal: 2,
      handleMouseWheel: true
    }));
    const scrollableDomNode = this._scrollableContainer.getDomNode();
    scrollableDomNode.tabIndex = 0;
    this.domNode.appendChild(scrollableDomNode);
    this.updateAriaLabel();
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.MOUSE_ENTER, () => {
      this._scrollableContainer?.updateOptions({
        horizontal: 1
        /* ScrollbarVisibility.Auto */
      });
    }));
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.MOUSE_LEAVE, () => {
      this._scrollableContainer?.updateOptions({
        horizontal: 2
        /* ScrollbarVisibility.Hidden */
      });
    }));
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.FOCUS_IN, () => {
      this._scrollableContainer?.updateOptions({
        horizontal: 1
        /* ScrollbarVisibility.Auto */
      });
    }));
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.FOCUS_OUT, () => {
      this._scrollableContainer?.updateOptions({
        horizontal: 2
        /* ScrollbarVisibility.Hidden */
      });
    }));
    this._register(this._scrollableContainer.onScroll(() => {
      if (this._isProgrammaticScroll) {
        return;
      }
      this._isAtBottom = this._computeIsAtBottom();
    }));
  }
  async _updateTerminalContent() {
    const liveTerminalInstance = await this._resolveLiveTerminal();
    const command = liveTerminalInstance ? this._resolveCommand() : void 0;
    const snapshot = this._getTerminalCommandOutput();
    if (liveTerminalInstance && command) {
      const handled = await this._renderLiveOutput(liveTerminalInstance, command);
      if (handled) {
        return;
      }
    }
    this._disposeLiveMirror();
    if (snapshot) {
      await this._renderSnapshotOutput(snapshot);
      return;
    }
    this._renderUnavailableMessage(liveTerminalInstance);
  }
  async _renderLiveOutput(liveTerminalInstance, command) {
    if (this._mirror) {
      return true;
    }
    await liveTerminalInstance.xtermReadyPromise;
    if (this._store.isDisposed || liveTerminalInstance.isDisposed || !liveTerminalInstance.xterm) {
      this._disposeLiveMirror();
      return false;
    }
    const mirror = this._register(this._instantiationService.createInstance(DetachedTerminalCommandMirror, liveTerminalInstance.xterm, command));
    this._mirror = mirror;
    this._register(mirror.onDidUpdate((result2) => {
      if (result2.lineCount && result2.lineCount > 0) {
        this._hideEmptyMessage();
      }
      this._layoutOutput(result2.lineCount);
      if (this._isAtBottom) {
        this._scrollOutputToBottom();
      }
    }));
    this._register(mirror.onDidInput((data) => {
      if (!liveTerminalInstance.isDisposed) {
        liveTerminalInstance.sendText(data, false);
      }
    }));
    await mirror.attach(this._terminalContainer);
    let result = await mirror.renderCommand();
    let commandFinished = !!command.endMarker;
    let hasOutput = result && result.lineCount && result.lineCount > 0;
    if (!hasOutput) {
      const maxRetries = 10;
      for (let retry = 0; retry < maxRetries && !hasOutput; retry++) {
        await timeout(100);
        if (this._store.isDisposed) {
          return true;
        }
        result = await mirror.renderCommand();
        hasOutput = result && result.lineCount && result.lineCount > 0;
        commandFinished = !!command.endMarker;
        if (commandFinished) {
          break;
        }
      }
    }
    if (!hasOutput) {
      if (commandFinished) {
        this._showEmptyMessage(localize("chat.terminalOutputEmpty", "No output was produced by the command."));
      }
    } else {
      this._hideEmptyMessage();
    }
    this._layoutOutput(result?.lineCount ?? 0);
    return true;
  }
  async _renderSnapshotOutput(snapshot) {
    if (this._snapshotMirror) {
      this._layoutOutput(snapshot.lineCount ?? 0);
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    dom.clearNode(this._terminalContainer);
    this._snapshotMirror = this._register(this._instantiationService.createInstance(DetachedTerminalSnapshotMirror, snapshot, this._getStoredTheme));
    await this._snapshotMirror.attach(this._terminalContainer);
    this._snapshotMirror.setOutput(snapshot);
    const result = await this._snapshotMirror.render();
    const hasText = !!snapshot.text && snapshot.text.length > 0;
    if (hasText) {
      this._hideEmptyMessage();
    } else {
      this._showEmptyMessage(localize("chat.terminalOutputEmpty", "No output was produced by the command."));
    }
    const lineCount = result?.lineCount ?? snapshot.lineCount ?? 0;
    this._layoutOutput(lineCount);
  }
  _renderUnavailableMessage(liveTerminalInstance) {
    dom.clearNode(this._terminalContainer);
    this._lastRenderedLineCount = void 0;
    if (!liveTerminalInstance) {
      this._showEmptyMessage(localize("chat.terminalOutputTerminalMissing", "Terminal is no longer available."));
    } else {
      this._showEmptyMessage(localize("chat.terminalOutputCommandMissing", "Command information is not available."));
    }
  }
  async _resolveLiveTerminal() {
    const instance = await this._ensureTerminalInstance();
    return instance && !instance.isDisposed ? instance : void 0;
  }
  _showEmptyMessage(message) {
    this._emptyElement.textContent = message;
    this._terminalContainer.classList.add("chat-terminal-output-terminal-no-output");
    this.domNode.classList.add("chat-terminal-output-container-no-output");
  }
  _hideEmptyMessage() {
    this._emptyElement.textContent = "";
    this._terminalContainer.classList.remove("chat-terminal-output-terminal-no-output");
    this.domNode.classList.remove("chat-terminal-output-container-no-output");
  }
  _disposeLiveMirror() {
    if (this._mirror) {
      this._mirror.dispose();
      this._mirror = void 0;
    }
  }
  _scheduleOutputRelayout() {
    dom.getActiveWindow().requestAnimationFrame(() => {
      this._layoutOutput();
      this._scrollOutputToBottom();
    });
  }
  _handleResize() {
    if (!this._scrollableContainer) {
      return;
    }
    if (this.isExpanded) {
      this._layoutOutput();
      this._scrollOutputToBottom();
    } else {
      this._scrollableContainer.scanDomNode();
    }
  }
  _layoutOutput(lineCount) {
    if (!this._scrollableContainer) {
      return;
    }
    if (lineCount !== void 0) {
      this._lastRenderedLineCount = lineCount;
    } else {
      lineCount = this._lastRenderedLineCount;
    }
    this._scrollableContainer.scanDomNode();
    if (!this.isExpanded || lineCount === void 0) {
      return;
    }
    const scrollableDomNode = this._scrollableContainer.getDomNode();
    const rowHeight = this._computeRowHeightPx();
    const padding = this._getOutputPadding();
    const minHeight = rowHeight * MIN_OUTPUT_ROWS + padding;
    const maxHeight = rowHeight * MAX_OUTPUT_ROWS + padding;
    const contentHeight = this._getOutputContentHeight(lineCount, rowHeight, padding);
    const clampedHeight = Math.min(contentHeight, maxHeight);
    const measuredBodyHeight = Math.max(this._outputBody.clientHeight, minHeight);
    const appliedHeight = Math.min(clampedHeight, measuredBodyHeight);
    scrollableDomNode.style.height = appliedHeight < maxHeight ? `${appliedHeight}px` : "";
    this._scrollableContainer.scanDomNode();
  }
  _computeIsAtBottom() {
    if (!this._scrollableContainer) {
      return true;
    }
    const dimensions = this._scrollableContainer.getScrollDimensions();
    const scrollPosition = this._scrollableContainer.getScrollPosition();
    const threshold = 5;
    return scrollPosition.scrollTop >= dimensions.scrollHeight - dimensions.height - threshold;
  }
  _scrollOutputToBottom() {
    if (!this._scrollableContainer) {
      return;
    }
    this._isProgrammaticScroll = true;
    const dimensions = this._scrollableContainer.getScrollDimensions();
    this._scrollableContainer.setScrollPosition({ scrollTop: dimensions.scrollHeight });
    this._isProgrammaticScroll = false;
  }
  _getOutputContentHeight(lineCount, rowHeight, padding) {
    const contentRows = Math.max(lineCount, MIN_OUTPUT_ROWS);
    const adjustedRows = contentRows + 1;
    return adjustedRows * rowHeight + padding;
  }
  _getOutputPadding() {
    const style = dom.getComputedStyle(this._outputBody);
    const paddingTop = Number.parseFloat(style.paddingTop || "0");
    const paddingBottom = Number.parseFloat(style.paddingBottom || "0");
    return paddingTop + paddingBottom;
  }
  _computeRowHeightPx() {
    const window = dom.getActiveWindow();
    const font = this._terminalConfigurationService.getFont(window);
    const hasCharHeight = isNumber(font.charHeight) && font.charHeight > 0;
    const hasFontSize = isNumber(font.fontSize) && font.fontSize > 0;
    const hasLineHeight = isNumber(font.lineHeight) && font.lineHeight > 0;
    const charHeight = (hasCharHeight ? font.charHeight : hasFontSize ? font.fontSize : 1) ?? 1;
    const lineHeight = hasLineHeight ? font.lineHeight : 1;
    const rowHeight = Math.ceil(charHeight * lineHeight);
    return Math.max(rowHeight, 1);
  }
  _applyBackgroundColor() {
    const theme = this._themeService.getColorTheme();
    const isInEditor = ChatContextKeys.inChatEditor.getValue(this._contextKeyService);
    const backgroundColor = theme.getColor(isInEditor ? editorBackground : PANEL_BACKGROUND);
    if (backgroundColor) {
      this.domNode.style.backgroundColor = backgroundColor.toString();
    }
  }
};
ChatTerminalToolOutputSection = __decorate([
  __param(5, IAccessibleViewService),
  __param(6, IInstantiationService),
  __param(7, ITerminalConfigurationService),
  __param(8, IThemeService),
  __param(9, IContextKeyService)
], ChatTerminalToolOutputSection);
let ToggleChatTerminalOutputAction = class ToggleChatTerminalOutputAction2 extends Action {
  static {
    __name(this, "ToggleChatTerminalOutputAction");
  }
  constructor(_toggle, _keybindingService, _telemetryService) {
    super("workbench.action.terminal.chat.toggleChatTerminalOutput", localize("showTerminalOutput", "Show Output"), ThemeIcon.asClassName(Codicon.chevronRight), true);
    this._toggle = _toggle;
    this._keybindingService = _keybindingService;
    this._telemetryService = _telemetryService;
    this._expanded = false;
    this._updateTooltip();
  }
  async run() {
    this._telemetryService.publicLog2("terminal/chatToggleOutput", {
      previousExpanded: this._expanded
    });
    await this._toggle();
  }
  syncPresentation(expanded) {
    this._expanded = expanded;
    this._updatePresentation();
    this._updateTooltip();
  }
  refreshKeybindingTooltip() {
    this._updateTooltip();
  }
  _updatePresentation() {
    if (this._expanded) {
      this.label = localize("hideTerminalOutput", "Hide Output");
      this.class = ThemeIcon.asClassName(Codicon.chevronDown);
    } else {
      this.label = localize("showTerminalOutput", "Show Output");
      this.class = ThemeIcon.asClassName(Codicon.chevronRight);
    }
  }
  _updateTooltip() {
    this.tooltip = this._keybindingService.appendKeybinding(
      this.label,
      "workbench.action.terminal.chat.focusMostRecentChatTerminalOutput"
      /* TerminalContribCommandId.FocusMostRecentChatTerminalOutput */
    );
  }
};
ToggleChatTerminalOutputAction = __decorate([
  __param(1, IKeybindingService),
  __param(2, ITelemetryService)
], ToggleChatTerminalOutputAction);
let FocusChatInstanceAction = class FocusChatInstanceAction2 extends Action {
  static {
    __name(this, "FocusChatInstanceAction");
  }
  constructor(_instance, _command, _commandUri, _commandId, isTerminalHidden, _terminalService, _terminalEditorService, _terminalGroupService, _keybindingService, _telemetryService) {
    super("workbench.action.terminal.chat.focusChatInstance", isTerminalHidden ? localize("showTerminal", "Show and Focus Terminal") : localize("focusTerminal", "Focus Terminal"), ThemeIcon.asClassName(Codicon.openInProduct), true);
    this._instance = _instance;
    this._command = _command;
    this._commandUri = _commandUri;
    this._commandId = _commandId;
    this._terminalService = _terminalService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._keybindingService = _keybindingService;
    this._telemetryService = _telemetryService;
    this._updateTooltip();
  }
  async run() {
    this.label = this._instance?.shellLaunchConfig.hideFromUser ? localize("showAndFocusTerminal", "Show and Focus Terminal") : localize("focusTerminal", "Focus Terminal");
    this._updateTooltip();
    let target = "none";
    let location = "panel";
    if (this._instance) {
      target = "instance";
      location = this._instance.target === TerminalLocation.Editor ? "editor" : "panel";
    } else if (this._commandUri) {
      target = "commandUri";
    }
    this._telemetryService.publicLog2("terminal/chatFocusInstance", {
      target,
      location
    });
    if (this._instance) {
      this._terminalService.setActiveInstance(this._instance);
      if (this._instance.target === TerminalLocation.Editor) {
        this._terminalEditorService.openEditor(this._instance);
      } else {
        await this._terminalGroupService.showPanel(true);
      }
      this._terminalService.setActiveInstance(this._instance);
      await this._instance.focusWhenReady(true);
      const command = this._resolveCommand();
      if (command) {
        this._instance.xterm?.markTracker.revealCommand(command);
      }
      return;
    }
    if (this._commandUri) {
      this._terminalService.openResource(this._commandUri);
    }
  }
  refreshKeybindingTooltip() {
    this._updateTooltip();
  }
  _resolveCommand() {
    if (this._command && !this._command.endMarker?.isDisposed) {
      return this._command;
    }
    if (!this._instance || !this._commandId) {
      return this._command;
    }
    const commandDetection = this._instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    const resolved = commandDetection?.commands.find((c) => c.id === this._commandId);
    if (resolved) {
      this._command = resolved;
    }
    return this._command;
  }
  _updateTooltip() {
    this.tooltip = this._keybindingService.appendKeybinding(
      this.label,
      "workbench.action.terminal.chat.focusMostRecentChatTerminal"
      /* TerminalContribCommandId.FocusMostRecentChatTerminal */
    );
  }
};
FocusChatInstanceAction = __decorate([
  __param(5, ITerminalService),
  __param(6, ITerminalEditorService),
  __param(7, ITerminalGroupService),
  __param(8, IKeybindingService),
  __param(9, ITelemetryService)
], FocusChatInstanceAction);
let ContinueInBackgroundAction = class ContinueInBackgroundAction2 extends Action {
  static {
    __name(this, "ContinueInBackgroundAction");
  }
  constructor(_terminalToolSessionId, _terminalChatService) {
    super("workbench.action.terminal.chat.continueInBackground", localize("continueInBackground", "Continue in Background"), ThemeIcon.asClassName(Codicon.debugContinue), true);
    this._terminalToolSessionId = _terminalToolSessionId;
    this._terminalChatService = _terminalChatService;
  }
  async run() {
    this._terminalChatService.continueInBackground(this._terminalToolSessionId);
  }
};
ContinueInBackgroundAction = __decorate([
  __param(1, ITerminalChatService)
], ContinueInBackgroundAction);
let ChatTerminalThinkingCollapsibleWrapper = class ChatTerminalThinkingCollapsibleWrapper2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatTerminalThinkingCollapsibleWrapper");
  }
  constructor(commandText, contentElement, context, initialExpanded, isComplete, hoverService) {
    const title = isComplete ? `Ran \`${commandText}\`` : `Running \`${commandText}\``;
    super(title, context, void 0, hoverService);
    this._terminalContentElement = contentElement;
    this._commandText = commandText;
    this._isComplete = isComplete;
    this.domNode.classList.add("chat-terminal-thinking-collapsible");
    this._setCodeFormattedTitle();
    this.setExpanded(initialExpanded);
  }
  _setCodeFormattedTitle() {
    if (!this._collapseButton) {
      return;
    }
    const labelElement = this._collapseButton.labelElement;
    labelElement.textContent = "";
    const prefixText = this._isComplete ? localize("chat.terminal.ran.prefix", "Ran ") : localize("chat.terminal.running.prefix", "Running ");
    const ranText = document.createTextNode(prefixText);
    const codeElement = document.createElement("code");
    codeElement.textContent = this._commandText;
    labelElement.appendChild(ranText);
    labelElement.appendChild(codeElement);
  }
  markComplete() {
    if (this._isComplete) {
      return;
    }
    this._isComplete = true;
    this._setCodeFormattedTitle();
  }
  initContent() {
    const listWrapper = dom.$(".chat-used-context-list.chat-terminal-thinking-content");
    listWrapper.appendChild(this._terminalContentElement);
    return listWrapper;
  }
  expand() {
    this.setExpanded(true);
  }
  hasSameContent(_other, _followingContent, _element) {
    return false;
  }
};
ChatTerminalThinkingCollapsibleWrapper = __decorate([
  __param(5, IHoverService)
], ChatTerminalThinkingCollapsibleWrapper);
export {
  ChatTerminalToolProgressPart,
  ContinueInBackgroundAction,
  FocusChatInstanceAction,
  ToggleChatTerminalOutputAction
};
//# sourceMappingURL=chatTerminalToolProgressPart.js.map
