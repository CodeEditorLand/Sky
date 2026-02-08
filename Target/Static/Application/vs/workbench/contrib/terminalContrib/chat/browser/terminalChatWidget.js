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
import { Dimension, getActiveWindow, trackFocus } from "../../../../../base/browser/dom.js";
import { createCancelablePromise, DeferredPromise } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { MicrotaskDelay } from "../../../../../base/common/symbols.js";
import { localize } from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IChatWidgetService } from "../../../chat/browser/chat.js";
import { IChatAgentService } from "../../../chat/common/participants/chatAgents.js";
import { isCellTextEditOperationArray } from "../../../chat/common/model/chatModel.js";
import { ChatMode } from "../../../chat/common/chatModes.js";
import { IChatService } from "../../../chat/common/chatService/chatService.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
import { InlineChatWidget } from "../../../inlineChat/browser/inlineChatWidget.js";
import { MENU_INLINE_CHAT_WIDGET_SECONDARY } from "../../../inlineChat/common/inlineChat.js";
import { TerminalStickyScrollContribution } from "../../stickyScroll/browser/terminalStickyScrollContribution.js";
import "./media/terminalChatWidget.css";
import { MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR, MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from "./terminalChat.js";
var Constants;
(function(Constants2) {
  Constants2[Constants2["HorizontalMargin"] = 10] = "HorizontalMargin";
  Constants2[Constants2["VerticalMargin"] = 30] = "VerticalMargin";
  Constants2[Constants2["RightPadding"] = 12] = "RightPadding";
  Constants2[Constants2["MaxHeight"] = 480] = "MaxHeight";
  Constants2[Constants2["MaxHeightPercentageOfViewport"] = 0.75] = "MaxHeightPercentageOfViewport";
})(Constants || (Constants = {}));
var Message;
(function(Message2) {
  Message2[Message2["None"] = 0] = "None";
  Message2[Message2["AcceptSession"] = 1] = "AcceptSession";
  Message2[Message2["CancelSession"] = 2] = "CancelSession";
  Message2[Message2["PauseSession"] = 4] = "PauseSession";
  Message2[Message2["CancelRequest"] = 8] = "CancelRequest";
  Message2[Message2["CancelInput"] = 16] = "CancelInput";
  Message2[Message2["AcceptInput"] = 32] = "AcceptInput";
  Message2[Message2["ReturnInput"] = 64] = "ReturnInput";
})(Message || (Message = {}));
let TerminalChatWidget = class TerminalChatWidget2 extends Disposable {
  static {
    __name(this, "TerminalChatWidget");
  }
  get inlineChatWidget() {
    return this._inlineChatWidget;
  }
  get lastResponseContent() {
    return this._lastResponseContent;
  }
  constructor(_terminalElement, _instance, _xterm, contextKeyService, _chatService, _storageService, instantiationService, _chatAgentService, _chatWidgetService) {
    super();
    this._terminalElement = _terminalElement;
    this._instance = _instance;
    this._xterm = _xterm;
    this._chatService = _chatService;
    this._storageService = _storageService;
    this._chatAgentService = _chatAgentService;
    this._chatWidgetService = _chatWidgetService;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._messages = this._store.add(new Emitter());
    this._viewStateStorageKey = "terminal-inline-chat-view-state";
    this._terminalAgentName = "terminal";
    this._model = this._register(new MutableDisposable());
    this._sessionDisposables = this._register(new MutableDisposable());
    this._requestInProgress = observableValue(this, false);
    this.requestInProgress = this._requestInProgress;
    this._focusedContextKey = TerminalChatContextKeys.focused.bindTo(contextKeyService);
    this._visibleContextKey = TerminalChatContextKeys.visible.bindTo(contextKeyService);
    this._requestActiveContextKey = TerminalChatContextKeys.requestActive.bindTo(contextKeyService);
    this._responseContainsCodeBlockContextKey = TerminalChatContextKeys.responseContainsCodeBlock.bindTo(contextKeyService);
    this._responseContainsMulitpleCodeBlocksContextKey = TerminalChatContextKeys.responseContainsMultipleCodeBlocks.bindTo(contextKeyService);
    this._container = document.createElement("div");
    this._container.classList.add("terminal-inline-chat");
    this._terminalElement.appendChild(this._container);
    this._inlineChatWidget = instantiationService.createInstance(InlineChatWidget, {
      location: ChatAgentLocation.Terminal,
      resolveData: /* @__PURE__ */ __name(() => {
        return void 0;
      }, "resolveData")
    }, {
      statusMenuId: {
        menu: MENU_TERMINAL_CHAT_WIDGET_STATUS,
        options: {
          buttonConfigProvider: /* @__PURE__ */ __name((action) => ({
            showLabel: action.id !== "workbench.action.terminal.chat.rerunRequest",
            showIcon: action.id === "workbench.action.terminal.chat.rerunRequest",
            isSecondary: action.id !== "workbench.action.terminal.chat.runCommand" && action.id !== "workbench.action.terminal.chat.runFirstCommand"
            /* TerminalChatCommandId.RunFirstCommand */
          }), "buttonConfigProvider")
        }
      },
      secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
      chatWidgetViewOptions: {
        menus: {
          telemetrySource: "terminal-inline-chat",
          executeToolbar: MenuId.ChatExecute,
          inputSideToolbar: MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR
        },
        defaultMode: ChatMode.Ask
      }
    });
    this._register(this._inlineChatWidget.chatWidget.onDidChangeViewModel(() => this._saveViewState()));
    this._register(Event.any(this._inlineChatWidget.onDidChangeHeight, this._instance.onDimensionsChanged, this._inlineChatWidget.chatWidget.onDidChangeContentHeight, Event.fromObservableLight(this._inlineChatWidget.chatWidget.input.selectedLanguageModel), Event.debounce(this._xterm.raw.onCursorMove, () => void 0, MicrotaskDelay))(() => this._relayout()));
    const observer = new ResizeObserver(() => this._relayout());
    observer.observe(this._terminalElement);
    this._register(toDisposable(() => observer.disconnect()));
    this._resetPlaceholder();
    this._container.appendChild(this._inlineChatWidget.domNode);
    this._focusTracker = this._register(trackFocus(this._container));
    this._register(this._focusTracker.onDidFocus(() => this._focusedContextKey.set(true)));
    this._register(this._focusTracker.onDidBlur(() => this._focusedContextKey.set(false)));
    this._register(autorun((r) => {
      const isBusy = this._inlineChatWidget.requestInProgress.read(r);
      this._container.classList.toggle("busy", isBusy);
      this._inlineChatWidget.toggleStatus(!!this._inlineChatWidget.responseContent);
      if (isBusy || !this._inlineChatWidget.responseContent) {
        this._responseContainsCodeBlockContextKey.set(false);
        this._responseContainsMulitpleCodeBlocksContextKey.set(false);
      } else {
        Promise.all([
          this._inlineChatWidget.getCodeBlockInfo(0),
          this._inlineChatWidget.getCodeBlockInfo(1)
        ]).then(([firstCodeBlock, secondCodeBlock]) => {
          this._responseContainsCodeBlockContextKey.set(!!firstCodeBlock);
          this._responseContainsMulitpleCodeBlocksContextKey.set(!!secondCodeBlock);
          this._inlineChatWidget.updateToolbar(true);
        });
      }
    }));
    this.hide();
  }
  _relayout() {
    if (this._dimension) {
      this._doLayout();
    }
  }
  _doLayout() {
    const xtermElement = this._xterm.raw.element;
    if (!xtermElement) {
      return;
    }
    const style = getActiveWindow().getComputedStyle(xtermElement);
    const xtermLeftPadding = parseInt(style.paddingLeft);
    const width = xtermElement.clientWidth - xtermLeftPadding - 12;
    if (width === 0) {
      return;
    }
    const terminalViewportHeight = this._getTerminalViewportHeight();
    const widgetAllowedPercentBasedHeight = (terminalViewportHeight ?? 0) * 0.75;
    const height = Math.max(Math.min(480, this._inlineChatWidget.contentHeight, widgetAllowedPercentBasedHeight), this._inlineChatWidget.minHeight);
    if (height === 0) {
      return;
    }
    this._dimension = new Dimension(width, height);
    this._inlineChatWidget.layout(this._dimension);
    this._inlineChatWidget.domNode.style.paddingLeft = `${xtermLeftPadding}px`;
    this._updateXtermViewportPosition();
  }
  _resetPlaceholder() {
    const defaultAgent = this._chatAgentService.getDefaultAgent(ChatAgentLocation.Terminal);
    this.inlineChatWidget.placeholder = defaultAgent?.description ?? localize("askAboutCommands", "Ask about commands");
  }
  async reveal() {
    await this._createSession();
    this._doLayout();
    this._container.classList.remove("hide");
    this._visibleContextKey.set(true);
    this._resetPlaceholder();
    this._inlineChatWidget.focus();
    this._instance.scrollToBottom();
  }
  _getTerminalCursorTop() {
    const font = this._instance.xterm?.getFont();
    if (!font?.charHeight) {
      return;
    }
    const terminalWrapperHeight = this._getTerminalViewportHeight() ?? 0;
    const cellHeight = font.charHeight * font.lineHeight;
    const topPadding = terminalWrapperHeight - this._instance.rows * cellHeight;
    const cursorY = (this._instance.xterm?.raw.buffer.active.cursorY ?? 0) + 1;
    return topPadding + cursorY * cellHeight;
  }
  _updateXtermViewportPosition() {
    const top = this._getTerminalCursorTop();
    if (!top) {
      return;
    }
    this._container.style.top = `${top}px`;
    const terminalViewportHeight = this._getTerminalViewportHeight();
    if (!terminalViewportHeight) {
      return;
    }
    const widgetAllowedPercentBasedHeight = terminalViewportHeight * 0.75;
    const height = Math.max(Math.min(480, this._inlineChatWidget.contentHeight, widgetAllowedPercentBasedHeight), this._inlineChatWidget.minHeight);
    if (top > terminalViewportHeight - height && terminalViewportHeight - height > 0) {
      this._setTerminalViewportOffset(top - (terminalViewportHeight - height));
    } else {
      this._setTerminalViewportOffset(void 0);
    }
  }
  _getTerminalViewportHeight() {
    return this._terminalElement.clientHeight;
  }
  hide() {
    this._container.classList.add("hide");
    this._inlineChatWidget.reset();
    this._resetPlaceholder();
    this._inlineChatWidget.updateToolbar(false);
    this._visibleContextKey.set(false);
    this._inlineChatWidget.value = "";
    this._instance.focus();
    this._setTerminalViewportOffset(void 0);
    this._onDidHide.fire();
  }
  _setTerminalViewportOffset(offset) {
    if (offset === void 0 || this._container.classList.contains("hide")) {
      this._terminalElement.style.position = "";
      this._terminalElement.style.bottom = "";
      TerminalStickyScrollContribution.get(this._instance)?.hideUnlock();
    } else {
      this._terminalElement.style.position = "relative";
      this._terminalElement.style.bottom = `${offset}px`;
      TerminalStickyScrollContribution.get(this._instance)?.hideLock();
    }
  }
  focus() {
    this.inlineChatWidget.focus();
  }
  hasFocus() {
    return this._inlineChatWidget.hasFocus();
  }
  setValue(value) {
    this._inlineChatWidget.value = value ?? "";
  }
  async acceptCommand(shouldExecute) {
    const code = await this.inlineChatWidget.getCodeBlockInfo(0);
    if (!code) {
      return;
    }
    const value = code.getValue();
    this._instance.runCommand(value, shouldExecute);
    this.clear();
  }
  get focusTracker() {
    return this._focusTracker;
  }
  async _createSession() {
    this._sessionCtor = createCancelablePromise(async (token) => {
      if (!this._model.value) {
        const modelRef = this._chatService.startSession(ChatAgentLocation.Terminal);
        this._model.value = modelRef;
        const model = modelRef.object;
        this._inlineChatWidget.setChatModel(model);
        this._resetPlaceholder();
      }
    });
    this._sessionDisposables.value = toDisposable(() => this._sessionCtor?.cancel());
  }
  _saveViewState() {
    const viewState = this._inlineChatWidget.chatWidget.getViewState();
    if (viewState) {
      this._storageService.store(
        this._viewStateStorageKey,
        JSON.stringify(viewState),
        0,
        0
        /* StorageTarget.USER */
      );
    }
  }
  clear() {
    this.cancel();
    this._model.clear();
    this._responseContainsCodeBlockContextKey.reset();
    this._requestActiveContextKey.reset();
    this.hide();
    this.setValue(void 0);
  }
  async acceptInput(query, options) {
    if (!this._model.value) {
      await this.reveal();
    }
    this._messages.fire(
      32
      /* Message.AcceptInput */
    );
    const lastInput = this._inlineChatWidget.value;
    if (!lastInput) {
      return;
    }
    this._activeRequestCts?.cancel();
    this._activeRequestCts = new CancellationTokenSource();
    const store = new DisposableStore();
    this._requestActiveContextKey.set(true);
    const response = await this._inlineChatWidget.chatWidget.acceptInput(lastInput, { isVoiceInput: options?.isVoiceInput });
    this._currentRequestId = response?.requestId;
    const responsePromise = new DeferredPromise();
    try {
      this._requestActiveContextKey.set(true);
      if (response) {
        store.add(response.onDidChange(async () => {
          if (response.isCanceled) {
            this._requestActiveContextKey.set(false);
            responsePromise.complete(void 0);
            return;
          }
          if (response.isComplete) {
            this._requestActiveContextKey.set(false);
            this._requestActiveContextKey.set(false);
            const firstCodeBlock = await this._inlineChatWidget.getCodeBlockInfo(0);
            const secondCodeBlock = await this._inlineChatWidget.getCodeBlockInfo(1);
            this._responseContainsCodeBlockContextKey.set(!!firstCodeBlock);
            this._responseContainsMulitpleCodeBlocksContextKey.set(!!secondCodeBlock);
            this._inlineChatWidget.updateToolbar(true);
            responsePromise.complete(response);
          }
        }));
      }
      await responsePromise.p;
      this._lastResponseContent = response?.response.getMarkdown();
      return response;
    } catch {
      this._lastResponseContent = void 0;
      return;
    } finally {
      store.dispose();
    }
  }
  cancel() {
    this._sessionCtor?.cancel();
    this._sessionCtor = void 0;
    this._activeRequestCts?.cancel();
    this._requestActiveContextKey.set(false);
    const model = this._inlineChatWidget.getChatModel();
    if (!model?.sessionResource) {
      return;
    }
    this._chatService.cancelCurrentRequestForSession(model?.sessionResource);
  }
  async viewInChat() {
    const widget = await this._chatWidgetService.revealWidget();
    const currentRequest = this._inlineChatWidget.chatWidget.viewModel?.model.getRequests().find((r) => r.id === this._currentRequestId);
    if (!widget || !currentRequest?.response) {
      return;
    }
    const message = [];
    for (const item of currentRequest.response.response.value) {
      if (item.kind === "textEditGroup") {
        for (const group of item.edits) {
          message.push({
            kind: "textEdit",
            edits: group,
            uri: item.uri
          });
        }
      } else if (item.kind === "notebookEditGroup") {
        for (const group of item.edits) {
          if (isCellTextEditOperationArray(group)) {
            message.push({
              kind: "textEdit",
              edits: group.map((e) => e.edit),
              uri: group[0].uri
            });
          } else {
            message.push({
              kind: "notebookEdit",
              edits: group,
              uri: item.uri
            });
          }
        }
      } else {
        message.push(item);
      }
    }
    this._chatService.addCompleteRequest(widget.viewModel.sessionResource, `@${this._terminalAgentName} ${currentRequest.message.text}`, currentRequest.variableData, currentRequest.attempt, {
      message,
      result: currentRequest.response.result,
      followups: currentRequest.response.followups
    });
    widget.focusResponseItem();
    this.hide();
  }
};
TerminalChatWidget = __decorate([
  __param(3, IContextKeyService),
  __param(4, IChatService),
  __param(5, IStorageService),
  __param(6, IInstantiationService),
  __param(7, IChatAgentService),
  __param(8, IChatWidgetService)
], TerminalChatWidget);
export {
  TerminalChatWidget
};
//# sourceMappingURL=terminalChatWidget.js.map
