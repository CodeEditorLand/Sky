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
var ChatWidget_1;
import "./media/chat.css";
import "./media/chatAgentHover.css";
import "./media/chatViewWelcome.css";
import * as dom from "../../../../../base/browser/dom.js";
import { status } from "../../../../../base/browser/ui/aria/aria.js";
import { disposableTimeout, timeout } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { hash } from "../../../../../base/common/hash.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore, MutableDisposable, thenIfNotDisposed } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { IsSessionsWindowContext } from "../../../../common/contextkeys.js";
import { filter } from "../../../../../base/common/objects.js";
import { autorun, derived, observableFromEvent, observableValue } from "../../../../../base/common/observable.js";
import { basename, extUri, isEqual } from "../../../../../base/common/resources.js";
import { MicrotaskDelay } from "../../../../../base/common/symbols.js";
import { isDefined } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { OffsetRange } from "../../../../../editor/common/core/ranges/offsetRange.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { localize } from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { bindContextKey } from "../../../../../platform/observable/common/platformObservableUtils.js";
import product from "../../../../../platform/product/common/product.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { checkModeOption } from "../../common/chat.js";
import { IChatAgentService } from "../../common/participants/chatAgents.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { applyingChatEditsFailedContextKey, decidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, IChatEditingService, inChatEditingSessionContextKey } from "../../common/editing/chatEditingService.js";
import { IChatLayoutService } from "../../common/widget/chatLayoutService.js";
import { ChatMode, getModeNameForTelemetry, IChatModeService } from "../../common/chatModes.js";
import { chatAgentLeader, ChatRequestAgentPart, ChatRequestDynamicVariablePart, ChatRequestSlashPromptPart, ChatRequestToolPart, ChatRequestToolSetPart, chatSubcommandLeader, formatChatQuestion, IParsedChatRequest } from "../../common/requestParser/chatParserTypes.js";
import { ChatRequestParser } from "../../common/requestParser/chatRequestParser.js";
import { ChatSendResult, IChatService } from "../../common/chatService/chatService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { IChatSlashCommandService } from "../../common/participants/chatSlashCommands.js";
import { IChatTodoListService } from "../../common/tools/chatTodoListService.js";
import { isPromptFileVariableEntry, isPromptTextVariableEntry, isWorkspaceVariableEntry, PromptFileVariableKind, toPromptFileVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { ChatViewModel, isRequestVM, isResponseVM } from "../../common/model/chatViewModel.js";
import { CodeBlockModelCollection } from "../../common/widget/codeBlockModelCollection.js";
import { ChatConfiguration, ChatModeKind } from "../../common/constants.js";
import { ILanguageModelToolsService, isToolSet } from "../../common/tools/languageModelToolsService.js";
import { ComputeAutomaticInstructions } from "../../common/promptSyntax/computeAutomaticInstructions.js";
import { IPromptsService, PromptsStorage } from "../../common/promptSyntax/service/promptsService.js";
import { GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID, handleModeSwitch } from "../actions/chatActions.js";
import { IChatAccessibilityService, IChatWidgetService, isIChatResourceViewContext, isIChatViewViewContext } from "../chat.js";
import { IChatAttachmentResolveService } from "../attachments/chatAttachmentResolveService.js";
import { ChatDynamicVariableModel } from "../attachments/chatDynamicVariables.js";
import { ChatSuggestNextWidget } from "./chatContentParts/chatSuggestNextWidget.js";
import { ChatInputPart } from "./input/chatInputPart.js";
import { ChatListWidget } from "./chatListWidget.js";
import { ChatEditorOptions } from "./chatOptions.js";
import { ChatViewWelcomePart } from "../viewsWelcome/chatViewWelcomeController.js";
import { IChatTipService } from "../chatTipService.js";
import { ChatTipContentPart } from "./chatContentParts/chatTipContentPart.js";
import { ChatContentMarkdownRenderer } from "./chatContentMarkdownRenderer.js";
import { IAgentSessionsService } from "../agentSessions/agentSessionsService.js";
import { IChatDebugService } from "../../common/chatDebugService.js";
const $ = dom.$;
function isQuickChat(widget) {
  return isIChatResourceViewContext(widget.viewContext) && Boolean(widget.viewContext.isQuickChat);
}
__name(isQuickChat, "isQuickChat");
function isInlineChat(widget) {
  return isIChatResourceViewContext(widget.viewContext) && Boolean(widget.viewContext.isInlineChat);
}
__name(isInlineChat, "isInlineChat");
const supportsAllAttachments = {
  supportsFileAttachments: true,
  supportsToolAttachments: true,
  supportsMCPAttachments: true,
  supportsImageAttachments: true,
  supportsSearchResultAttachments: true,
  supportsInstructionAttachments: true,
  supportsSourceControlAttachments: true,
  supportsProblemAttachments: true,
  supportsSymbolAttachments: true,
  supportsTerminalAttachments: true,
  supportsPromptAttachments: true
};
const DISCLAIMER = localize("chatDisclaimer", "AI responses may be inaccurate");
let ChatWidget = class ChatWidget2 extends Disposable {
  static {
    __name(this, "ChatWidget");
  }
  static {
    ChatWidget_1 = this;
  }
  static {
    this.CONTRIBS = [];
  }
  get domNode() {
    return this.container;
  }
  get visible() {
    return this._visible;
  }
  set viewModel(viewModel) {
    if (this._viewModel === viewModel) {
      return;
    }
    const previousSessionResource = this._viewModel?.sessionResource;
    this.viewModelDisposables.clear();
    this._viewModel = viewModel;
    if (viewModel) {
      this.viewModelDisposables.add(viewModel);
      this.logService.debug("ChatWidget#setViewModel: have viewModel");
      if (viewModel.model.requestInProgress.get()) {
        this.chatAccessibilityService.acceptRequest(viewModel.sessionResource, true);
      }
    } else {
      this.logService.debug("ChatWidget#setViewModel: no viewModel");
    }
    this._onDidChangeViewModel.fire({ previousSessionResource, currentSessionResource: this._viewModel?.sessionResource });
  }
  get viewModel() {
    return this._viewModel;
  }
  get parsedInput() {
    if (this.parsedChatRequest === void 0) {
      if (!this.viewModel) {
        return { text: "", parts: [] };
      }
      this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionResource, this.getInput(), this.location, {
        selectedAgent: this._lastSelectedAgent,
        mode: this.input.currentModeKind,
        attachmentCapabilities: this.attachmentCapabilities,
        forcedAgent: this._lockedAgent?.id ? this.chatAgentService.getAgent(this._lockedAgent.id) : void 0
      });
      this._onDidChangeParsedInput.fire();
    }
    return this.parsedChatRequest;
  }
  get scopedContextKeyService() {
    return this.contextKeyService;
  }
  get location() {
    return this._location.location;
  }
  get supportsChangingModes() {
    return !!this.viewOptions.supportsChangingModes;
  }
  get locationData() {
    return this._location.resolveData?.();
  }
  constructor(location, viewContext, viewOptions, styles, codeEditorService, configurationService, dialogService, contextKeyService, instantiationService, chatService, chatAgentService, chatWidgetService, chatAccessibilityService, logService, themeService, chatSlashCommandService, chatEditingService, telemetryService, promptsService, toolsService, chatModeService, chatLayoutService, chatEntitlementService, chatSessionsService, agentSessionsService, chatTodoListService, lifecycleService, chatAttachmentResolveService, chatTipService, chatDebugService) {
    super();
    this.viewOptions = viewOptions;
    this.styles = styles;
    this.codeEditorService = codeEditorService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.chatWidgetService = chatWidgetService;
    this.chatAccessibilityService = chatAccessibilityService;
    this.logService = logService;
    this.themeService = themeService;
    this.chatSlashCommandService = chatSlashCommandService;
    this.telemetryService = telemetryService;
    this.promptsService = promptsService;
    this.toolsService = toolsService;
    this.chatModeService = chatModeService;
    this.chatLayoutService = chatLayoutService;
    this.chatEntitlementService = chatEntitlementService;
    this.chatSessionsService = chatSessionsService;
    this.agentSessionsService = agentSessionsService;
    this.chatTodoListService = chatTodoListService;
    this.lifecycleService = lifecycleService;
    this.chatAttachmentResolveService = chatAttachmentResolveService;
    this.chatTipService = chatTipService;
    this.chatDebugService = chatDebugService;
    this._onDidSubmitAgent = this._register(new Emitter());
    this.onDidSubmitAgent = this._onDidSubmitAgent.event;
    this._onDidChangeAgent = this._register(new Emitter());
    this.onDidChangeAgent = this._onDidChangeAgent.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidChangeViewModel = this._register(new Emitter());
    this.onDidChangeViewModel = this._onDidChangeViewModel.event;
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this._onDidAcceptInput = this._register(new Emitter());
    this.onDidAcceptInput = this._onDidAcceptInput.event;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._onDidShow = this._register(new Emitter());
    this.onDidShow = this._onDidShow.event;
    this._onDidChangeParsedInput = this._register(new Emitter());
    this.onDidChangeParsedInput = this._onDidChangeParsedInput.event;
    this._onDidChangeActiveInputEditor = this._register(new Emitter());
    this.onDidChangeActiveInputEditor = this._onDidChangeActiveInputEditor.event;
    this._onWillMaybeChangeHeight = this._register(new Emitter());
    this.onWillMaybeChangeHeight = this._onWillMaybeChangeHeight.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidChangeEmptyState = this._register(new Emitter());
    this.onDidChangeEmptyState = this._onDidChangeEmptyState.event;
    this.contribs = [];
    this.visibilityTimeoutDisposable = this._register(new MutableDisposable());
    this.visibilityAnimationFrameDisposable = this._register(new MutableDisposable());
    this.inputPartDisposable = this._register(new MutableDisposable());
    this.inlineInputPartDisposable = this._register(new MutableDisposable());
    this.recentlyRestoredCheckpoint = false;
    this.welcomePart = this._register(new MutableDisposable());
    this._gettingStartedTipPart = this._register(new MutableDisposable());
    this.visibleChangeCount = 0;
    this._visible = false;
    this._isRenderingWelcome = false;
    this._attachmentCapabilities = supportsAllAttachments;
    this.viewModelDisposables = this._register(new DisposableStore());
    this._editingSession = observableValue(this, void 0);
    this._viewModelObs = observableFromEvent(this, this.onDidChangeViewModel, () => this.viewModel);
    this._lockedToCodingAgentContextKey = ChatContextKeys.lockedToCodingAgent.bindTo(this.contextKeyService);
    this._agentSupportsAttachmentsContextKey = ChatContextKeys.agentSupportsAttachments.bindTo(this.contextKeyService);
    this._sessionIsEmptyContextKey = ChatContextKeys.chatSessionIsEmpty.bindTo(this.contextKeyService);
    this._hasPendingRequestsContextKey = ChatContextKeys.hasPendingRequests.bindTo(this.contextKeyService);
    this._sessionHasDebugDataContextKey = ChatContextKeys.chatSessionHasDebugData.bindTo(this.contextKeyService);
    this._register(this.chatDebugService.onDidAddEvent((e) => {
      const sessionResource = this.viewModel?.sessionResource;
      if (sessionResource && e.sessionResource.toString() === sessionResource.toString()) {
        this._sessionHasDebugDataContextKey.set(true);
      }
    }));
    this.viewContext = viewContext ?? {};
    const viewModelObs = this._viewModelObs;
    if (typeof location === "object") {
      this._location = location;
    } else {
      this._location = { location };
    }
    ChatContextKeys.inChatSession.bindTo(contextKeyService).set(true);
    ChatContextKeys.location.bindTo(contextKeyService).set(this._location.location);
    ChatContextKeys.inQuickChat.bindTo(contextKeyService).set(isQuickChat(this));
    this.agentInInput = ChatContextKeys.inputHasAgent.bindTo(contextKeyService);
    this.requestInProgress = ChatContextKeys.requestInProgress.bindTo(contextKeyService);
    this._register(this.chatEntitlementService.onDidChangeAnonymous(() => this.renderWelcomeViewContentIfNeeded()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.tips.enabled")) {
        if (!this.configurationService.getValue("chat.tips.enabled")) {
          if (this.inputPart) {
            this._gettingStartedTipPartRef = void 0;
            this._gettingStartedTipPart.clear();
            const tipContainer = this.inputPart.gettingStartedTipContainerElement;
            dom.clearNode(tipContainer);
            dom.setVisibility(false, tipContainer);
          }
        } else {
          this.updateChatViewVisibility();
        }
      }
    }));
    this._register(bindContextKey(decidedChatEditingResourceContextKey, contextKeyService, (reader) => {
      const currentSession = this._editingSession.read(reader);
      if (!currentSession) {
        return;
      }
      const entries = currentSession.entries.read(reader);
      const decidedEntries = entries.filter(
        (entry) => entry.state.read(reader) !== 0
        /* ModifiedFileEntryState.Modified */
      );
      return decidedEntries.map((entry) => entry.entryId);
    }));
    this._register(bindContextKey(hasUndecidedChatEditingResourceContextKey, contextKeyService, (reader) => {
      const currentSession = this._editingSession.read(reader);
      const entries = currentSession?.entries.read(reader) ?? [];
      const decidedEntries = entries.filter(
        (entry) => entry.state.read(reader) === 0
        /* ModifiedFileEntryState.Modified */
      );
      return decidedEntries.length > 0;
    }));
    this._register(bindContextKey(hasAppliedChatEditsContextKey, contextKeyService, (reader) => {
      const currentSession = this._editingSession.read(reader);
      if (!currentSession) {
        return false;
      }
      const entries = currentSession.entries.read(reader);
      return entries.length > 0;
    }));
    this._register(bindContextKey(inChatEditingSessionContextKey, contextKeyService, (reader) => {
      return this._editingSession.read(reader) !== null;
    }));
    this._register(bindContextKey(ChatContextKeys.chatEditingCanUndo, contextKeyService, (r) => {
      return this._editingSession.read(r)?.canUndo.read(r) || false;
    }));
    this._register(bindContextKey(ChatContextKeys.chatEditingCanRedo, contextKeyService, (r) => {
      return this._editingSession.read(r)?.canRedo.read(r) || false;
    }));
    this._register(bindContextKey(applyingChatEditsFailedContextKey, contextKeyService, (r) => {
      const chatModel = viewModelObs.read(r)?.model;
      const editingSession = this._editingSession.read(r);
      if (!editingSession || !chatModel) {
        return false;
      }
      const lastResponse = observableFromEvent(this, chatModel.onDidChange, () => chatModel.getRequests().at(-1)?.response).read(r);
      return lastResponse?.result?.errorDetails && !lastResponse?.result?.errorDetails.responseIsIncomplete;
    }));
    this._codeBlockModelCollection = this._register(instantiationService.createInstance(CodeBlockModelCollection, void 0));
    this.chatSuggestNextWidget = this._register(this.instantiationService.createInstance(ChatSuggestNextWidget));
    this._register(autorun((r) => {
      const viewModel = viewModelObs.read(r);
      const sessions = chatEditingService.editingSessionsObs.read(r);
      const session = sessions.find((candidate) => isEqual(candidate.chatSessionResource, viewModel?.sessionResource));
      this._editingSession.set(void 0, void 0);
      this.renderChatEditingSessionState();
      if (!session) {
        return;
      }
      const entries = session.entries.read(r);
      for (const entry of entries) {
        entry.state.read(r);
      }
      this._editingSession.set(session, void 0);
      r.store.add(session.onDidDispose(() => {
        this._editingSession.set(void 0, void 0);
        this.renderChatEditingSessionState();
      }));
      r.store.add(this.inputEditor.onDidChangeModelContent(() => {
        if (this.getInput() === "") {
          this.refreshParsedInput();
        }
      }));
      this.renderChatEditingSessionState();
    }));
    this._register(this.codeEditorService.registerCodeEditorOpenHandler(async (input, _source, _sideBySide) => {
      const resource = input.resource;
      if (resource.scheme !== Schemas.vscodeChatCodeBlock) {
        return null;
      }
      const responseId = resource.path.split("/").at(1);
      if (!responseId) {
        return null;
      }
      const item = this.viewModel?.getItems().find((item2) => item2.id === responseId);
      if (!item) {
        return null;
      }
      this.reveal(item);
      await timeout(0);
      for (const codeBlockPart of this.listWidget.editorsInUse()) {
        if (extUri.isEqual(codeBlockPart.uri, resource, true)) {
          const editor = codeBlockPart.editor;
          let relativeTop = 0;
          const editorDomNode = editor.getDomNode();
          if (editorDomNode) {
            const row = dom.findParentWithClass(editorDomNode, "monaco-list-row");
            if (row) {
              relativeTop = dom.getTopLeftOffset(editorDomNode).top - dom.getTopLeftOffset(row).top;
            }
          }
          if (input.options?.selection) {
            const editorSelectionTopOffset = editor.getTopForPosition(input.options.selection.startLineNumber, input.options.selection.startColumn);
            relativeTop += editorSelectionTopOffset;
            editor.focus();
            editor.setSelection({
              startLineNumber: input.options.selection.startLineNumber,
              startColumn: input.options.selection.startColumn,
              endLineNumber: input.options.selection.endLineNumber ?? input.options.selection.startLineNumber,
              endColumn: input.options.selection.endColumn ?? input.options.selection.startColumn
            });
          }
          this.reveal(item, relativeTop);
          return editor;
        }
      }
      return null;
    }));
    this._register(this.onDidChangeParsedInput(() => this.updateChatInputContext()));
    this._register(this.chatTodoListService.onDidUpdateTodos((sessionResource) => {
      if (isEqual(this.viewModel?.sessionResource, sessionResource)) {
        this.inputPart.renderChatTodoListWidget(sessionResource);
      }
    }));
  }
  set lastSelectedAgent(agent) {
    this.parsedChatRequest = void 0;
    this._lastSelectedAgent = agent;
    this._updateAgentCapabilitiesContextKeys(agent);
    this._onDidChangeParsedInput.fire();
  }
  get lastSelectedAgent() {
    return this._lastSelectedAgent;
  }
  _updateAgentCapabilitiesContextKeys(agent) {
    const capabilities = agent?.capabilities ?? (this._lockedAgent ? this.chatSessionsService.getCapabilitiesForSessionType(this._lockedAgent.id) : void 0);
    this._attachmentCapabilities = capabilities ?? supportsAllAttachments;
    const supportsAttachments = Object.keys(filter(this._attachmentCapabilities, (key, value) => value === true)).length > 0;
    this._agentSupportsAttachmentsContextKey.set(supportsAttachments);
  }
  get supportsFileReferences() {
    return !!this.viewOptions.supportsFileReferences;
  }
  get attachmentCapabilities() {
    return this._attachmentCapabilities;
  }
  /**
   * Either the inline input (when editing) or the main input part
   */
  get input() {
    return this.viewModel?.editing && this.configurationService.getValue("chat.editRequests") !== "input" ? this.inlineInputPart : this.inputPart;
  }
  /**
   * The main input part at the buttom of the chat widget. Use `input` to get the active input (main or inline editing part).
   */
  get inputPart() {
    return this.inputPartDisposable.value;
  }
  get inlineInputPart() {
    return this.inlineInputPartDisposable.value;
  }
  get inputEditor() {
    return this.input.inputEditor;
  }
  get contentHeight() {
    return this.input.height.get() + this.listWidget.contentHeight + this.chatSuggestNextWidget.height;
  }
  get scrollTop() {
    return this.listWidget.scrollTop;
  }
  set scrollTop(value) {
    this.listWidget.scrollTop = value;
  }
  get attachmentModel() {
    return this.input.attachmentModel;
  }
  render(parent) {
    const viewId = isIChatViewViewContext(this.viewContext) ? this.viewContext.viewId : void 0;
    this.editorOptions = this._register(this.instantiationService.createInstance(ChatEditorOptions, viewId, this.styles.listForeground, this.styles.inputEditorBackground, this.styles.resultEditorBackground));
    const renderInputOnTop = this.viewOptions.renderInputOnTop ?? false;
    const renderFollowups = this.viewOptions.renderFollowups ?? !renderInputOnTop;
    const renderStyle = this.viewOptions.renderStyle;
    const renderInputToolbarBelowInput = this.viewOptions.renderInputToolbarBelowInput ?? false;
    this.container = dom.append(parent, $(".interactive-session"));
    this.welcomeMessageContainer = dom.append(this.container, $(".chat-welcome-view-container", { style: "display: none" }));
    this._register(dom.addStandardDisposableListener(this.welcomeMessageContainer, dom.EventType.CLICK, () => this.focusInput()));
    this._register(this.chatSuggestNextWidget.onDidChangeHeight(() => {
      if (this.bodyDimension) {
        this.layout(this.bodyDimension.height, this.bodyDimension.width);
      }
    }));
    this._register(this.chatSuggestNextWidget.onDidSelectPrompt(({ handoff, agentId }) => {
      this.handleNextPromptSelection(handoff, agentId);
    }));
    if (renderInputOnTop) {
      this.createInput(this.container, { renderFollowups, renderStyle, renderInputToolbarBelowInput });
      this.listContainer = dom.append(this.container, $(`.interactive-list`));
    } else {
      this.listContainer = dom.append(this.container, $(`.interactive-list`));
      dom.append(this.container, this.chatSuggestNextWidget.domNode);
      this.createInput(this.container, { renderFollowups, renderStyle, renderInputToolbarBelowInput });
    }
    this.renderWelcomeViewContentIfNeeded();
    this.createList(this.listContainer, { editable: !isInlineChat(this) && !isQuickChat(this), ...this.viewOptions.rendererOptions, renderStyle });
    this._register(dom.addDisposableListener(parent, dom.EventType.MOUSE_WHEEL, (e) => {
      this.listWidget.delegateScrollFromMouseWheelEvent(e);
    }));
    this._register(autorun((reader) => {
      const fontFamily = this.chatLayoutService.fontFamily.read(reader);
      const fontSize = this.chatLayoutService.fontSize.read(reader);
      this.container.style.setProperty("--vscode-chat-font-family", fontFamily);
      this.container.style.fontSize = `${fontSize}px`;
      if (this.visible) {
        this.listWidget.rerender();
      }
    }));
    this._register(Event.runAndSubscribe(this.editorOptions.onDidChange, () => this.onDidStyleChange()));
    if (this.viewModel) {
      this.onDidChangeItems();
      this.listWidget.scrollToEnd();
    }
    this.contribs = ChatWidget_1.CONTRIBS.map((contrib) => {
      try {
        return this._register(this.instantiationService.createInstance(contrib, this));
      } catch (err) {
        this.logService.error("Failed to instantiate chat widget contrib", toErrorMessage(err));
        return void 0;
      }
    }).filter(isDefined);
    this._register(this.chatWidgetService.register(this));
    const parsedInput = observableFromEvent(this.onDidChangeParsedInput, () => this.parsedInput);
    this._register(autorun((r) => {
      const input = parsedInput.read(r);
      const newPromptAttachments = /* @__PURE__ */ new Map();
      const oldPromptAttachments = /* @__PURE__ */ new Set();
      for (const attachment of this.attachmentModel.attachments) {
        if (attachment.range) {
          oldPromptAttachments.add(attachment.id);
        }
      }
      for (const part of input.parts) {
        if (part instanceof ChatRequestToolPart || part instanceof ChatRequestToolSetPart || part instanceof ChatRequestDynamicVariablePart) {
          const entry = part.toVariableEntry();
          newPromptAttachments.set(entry.id, entry);
          oldPromptAttachments.delete(entry.id);
        }
      }
      this.attachmentModel.updateContext(oldPromptAttachments, newPromptAttachments.values());
    }));
    if (!this.focusedInputDOM) {
      this.focusedInputDOM = this.container.appendChild(dom.$(".focused-input-dom"));
    }
  }
  focusInput() {
    this.input.focus();
    this._onDidFocus.fire();
  }
  focusTodosView() {
    if (!this.input.hasVisibleTodos()) {
      return false;
    }
    return this.input.focusTodoList();
  }
  toggleTodosViewFocus() {
    if (!this.input.hasVisibleTodos()) {
      return false;
    }
    if (this.input.isTodoListFocused()) {
      this.focusInput();
      return true;
    }
    return this.input.focusTodoList();
  }
  focusQuestionCarousel() {
    if (!this.input.questionCarousel) {
      return false;
    }
    return this.input.focusQuestionCarousel();
  }
  toggleQuestionCarouselFocus() {
    if (!this.input.questionCarousel) {
      return false;
    }
    if (this.input.isQuestionCarouselFocused()) {
      this.focusInput();
      return true;
    }
    return this.input.focusQuestionCarousel();
  }
  navigateToPreviousQuestion() {
    if (!this.input.questionCarousel) {
      return false;
    }
    return this.input.navigateToPreviousQuestion();
  }
  navigateToNextQuestion() {
    if (!this.input.questionCarousel) {
      return false;
    }
    return this.input.navigateToNextQuestion();
  }
  toggleTipFocus() {
    if (this._gettingStartedTipPartRef?.hasFocus()) {
      this.focusInput();
      return true;
    }
    if (!this._gettingStartedTipPartRef) {
      return false;
    }
    this._gettingStartedTipPartRef.focus();
    return true;
  }
  hasInputFocus() {
    return this.input.hasFocus();
  }
  refreshParsedInput() {
    if (!this.viewModel) {
      return;
    }
    const previous = this.parsedChatRequest;
    this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionResource, this.getInput(), this.location, { selectedAgent: this._lastSelectedAgent, mode: this.input.currentModeKind, attachmentCapabilities: this.attachmentCapabilities });
    if (!previous || !IParsedChatRequest.equals(previous, this.parsedChatRequest)) {
      this._onDidChangeParsedInput.fire();
    }
  }
  getSibling(item, type) {
    if (!isResponseVM(item)) {
      return;
    }
    const items = this.viewModel?.getItems();
    if (!items) {
      return;
    }
    const responseItems = items.filter((i) => isResponseVM(i));
    const targetIndex = responseItems.indexOf(item);
    if (targetIndex === void 0) {
      return;
    }
    const indexToFocus = type === "next" ? targetIndex + 1 : targetIndex - 1;
    if (indexToFocus < 0 || indexToFocus > responseItems.length - 1) {
      return;
    }
    return responseItems[indexToFocus];
  }
  async clear() {
    this.logService.debug("ChatWidget#clear");
    if (this._dynamicMessageLayoutData) {
      this._dynamicMessageLayoutData.enabled = true;
    }
    if (this.viewModel?.editing) {
      this.finishedEditing();
    }
    if (this.viewModel) {
      this.viewModel.resetInputPlaceholder();
    }
    if (this._lockedAgent) {
      this.lockToCodingAgent(this._lockedAgent.name, this._lockedAgent.displayName, this._lockedAgent.id);
    } else {
      this.unlockFromCodingAgent();
    }
    this.inputPart.clearTodoListWidget(this.viewModel?.sessionResource, true);
    this.chatSuggestNextWidget.hide();
    await this.viewOptions.clear?.();
  }
  onDidChangeItems(skipDynamicLayout) {
    if (this._visible || !this.viewModel) {
      const items = this.viewModel?.getItems() ?? [];
      if (items.length > 0) {
        this.updateChatViewVisibility();
      } else {
        this.renderWelcomeViewContentIfNeeded();
      }
      this._onWillMaybeChangeHeight.fire();
      this.listWidget.setVisibleChangeCount(this.visibleChangeCount);
      this.listWidget.refresh();
      if (!skipDynamicLayout && this._dynamicMessageLayoutData) {
        this.layoutDynamicChatTreeItemMode();
      }
      this.renderFollowups();
    }
  }
  /**
   * Updates the DOM visibility of welcome view and chat list immediately
   */
  updateChatViewVisibility() {
    if (this.viewModel) {
      const isStandardLayout = this.viewOptions.renderStyle !== "compact" && this.viewOptions.renderStyle !== "minimal";
      const numItems = this.viewModel.getItems().length;
      dom.setVisibility(numItems === 0, this.welcomeMessageContainer);
      dom.setVisibility(numItems !== 0, this.listContainer);
      if (isStandardLayout && this.inputPart) {
        const tipContainer = this.inputPart.gettingStartedTipContainerElement;
        if (numItems === 0) {
          this.renderGettingStartedTipIfNeeded();
        } else {
          this._gettingStartedTipPartRef = void 0;
          this._gettingStartedTipPart.clear();
          dom.clearNode(tipContainer);
          dom.setVisibility(false, tipContainer);
        }
      }
    }
    this.container.classList.toggle("chat-view-getting-started-disabled", this.chatEntitlementService.sentiment.installed);
    this._onDidChangeEmptyState.fire();
  }
  isEmpty() {
    return (this.viewModel?.getItems().length ?? 0) === 0;
  }
  /**
   * Renders the welcome view content when needed.
   */
  renderWelcomeViewContentIfNeeded() {
    if (this._isRenderingWelcome) {
      return;
    }
    this._isRenderingWelcome = true;
    try {
      if (this.viewOptions.renderStyle === "compact" || this.viewOptions.renderStyle === "minimal" || this.lifecycleService.willShutdown) {
        return;
      }
      const numItems = this.viewModel?.getItems().length ?? 0;
      if (!numItems) {
        const defaultAgent = this.chatAgentService.getDefaultAgent(this.location, this.input.currentModeKind);
        let additionalMessage;
        if (this.chatEntitlementService.anonymous && !this.chatEntitlementService.sentiment.installed) {
          const providers = product.defaultChatAgent.provider;
          additionalMessage = new MarkdownString(localize({ key: "settings", comment: ['{Locked="]({2})"}', '{Locked="]({3})"}'] }, "By continuing with {0} Copilot, you agree to {1}'s [Terms]({2}) and [Privacy Statement]({3}).", providers.default.name, providers.default.name, product.defaultChatAgent.termsStatementUrl, product.defaultChatAgent.privacyStatementUrl), { isTrusted: true });
        } else {
          additionalMessage = defaultAgent?.metadata.additionalWelcomeMessage;
        }
        if (!additionalMessage && !this._lockedAgent) {
          additionalMessage = this._getGenerateInstructionsMessage();
        }
        const welcomeContent = this.getWelcomeViewContent(additionalMessage);
        if (!this.welcomePart.value || this.welcomePart.value.needsRerender(welcomeContent)) {
          dom.clearNode(this.welcomeMessageContainer);
          this.welcomePart.value = this.instantiationService.createInstance(ChatViewWelcomePart, welcomeContent, {
            location: this.location,
            isWidgetAgentWelcomeViewContent: this.input?.currentModeKind === ChatModeKind.Agent
          });
          dom.append(this.welcomeMessageContainer, this.welcomePart.value.element);
        }
      }
      this.updateChatViewVisibility();
    } finally {
      this._isRenderingWelcome = false;
    }
  }
  renderGettingStartedTipIfNeeded() {
    if (!this.inputPart) {
      return;
    }
    const tipContainer = this.inputPart.gettingStartedTipContainerElement;
    if (this._gettingStartedTipPart.value) {
      dom.setVisibility(true, tipContainer);
      return;
    }
    const tip = this.chatTipService.getWelcomeTip(this.contextKeyService);
    if (!tip) {
      dom.setVisibility(false, tipContainer);
      return;
    }
    const store = new DisposableStore();
    const renderer = this.instantiationService.createInstance(ChatContentMarkdownRenderer);
    const tipPart = store.add(this.instantiationService.createInstance(ChatTipContentPart, tip, renderer));
    tipContainer.appendChild(tipPart.domNode);
    this._gettingStartedTipPartRef = tipPart;
    store.add(tipPart.onDidHide(() => {
      tipPart.domNode.remove();
      this._gettingStartedTipPartRef = void 0;
      this._gettingStartedTipPart.clear();
      dom.setVisibility(false, tipContainer);
      this.focusInput();
    }));
    this._gettingStartedTipPart.value = store;
    dom.setVisibility(true, tipContainer);
  }
  _getGenerateInstructionsMessage() {
    if (!this._instructionFilesCheckPromise) {
      this._instructionFilesCheckPromise = this._checkForAgentInstructionFiles();
      this._register(thenIfNotDisposed(this._instructionFilesCheckPromise, (hasFiles) => {
        this._instructionFilesExist = hasFiles;
        const hasViewModelItems = this.viewModel?.getItems().length ?? 0;
        if (hasViewModelItems === 0) {
          this.renderWelcomeViewContentIfNeeded();
        }
      }));
    }
    if (this._instructionFilesExist === true) {
      return new MarkdownString("");
    } else if (this._instructionFilesExist === false) {
      return new MarkdownString(localize("chatWidget.instructions", "[Generate Agent Instructions]({0}) to onboard AI onto your codebase.", `command:${GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID}`), { isTrusted: { enabledCommands: [GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID] } });
    }
    return new MarkdownString("");
  }
  /**
   * Checks if any agent instruction files (.github/copilot-instructions.md or AGENTS.md) exist in the workspace.
   * Used to determine whether to show the "Generate Agent Instructions" hint.
   *
   * @returns true if instruction files exist OR if instruction features are disabled (to hide the hint)
   */
  async _checkForAgentInstructionFiles() {
    try {
      return (await this.promptsService.listAgentInstructions(CancellationToken.None)).length > 0;
    } catch (error) {
      this.logService.warn("[ChatWidget] Error checking for instruction files:", error);
      return false;
    }
  }
  getWelcomeViewContent(additionalMessage) {
    if (this.isLockedToCodingAgent) {
      const providerIcon = this._lockedAgent ? this.chatSessionsService.getIconForSessionType(this._lockedAgent.id) : void 0;
      const providerTitle = this._lockedAgent ? this.chatSessionsService.getWelcomeTitleForSessionType(this._lockedAgent.id) : void 0;
      const providerMessage = this._lockedAgent ? this.chatSessionsService.getWelcomeMessageForSessionType(this._lockedAgent.id) : void 0;
      const message = providerMessage ? new MarkdownString(providerMessage) : this._lockedAgent?.prefix === "@copilot " ? new MarkdownString(localize("copilotCodingAgentMessage", "This chat session will be forwarded to the {0} [coding agent]({1}) where work is completed in the background. ", this._lockedAgent.prefix, "https://aka.ms/coding-agent-docs") + DISCLAIMER, { isTrusted: true }) : new MarkdownString(localize("genericCodingAgentMessage", "This chat session will be forwarded to the {0} coding agent where work is completed in the background. ", this._lockedAgent?.prefix) + DISCLAIMER);
      return {
        title: providerTitle ?? localize("codingAgentTitle", "Delegate to {0}", this._lockedAgent?.prefix),
        message,
        icon: providerIcon ?? Codicon.sendToRemoteAgent,
        additionalMessage,
        useLargeIcon: !!providerIcon
      };
    }
    let title;
    if (this.input.currentModeKind === ChatModeKind.Ask) {
      title = localize("chatDescription", "Ask about your code");
    } else if (this.input.currentModeKind === ChatModeKind.Edit) {
      title = localize("editsTitle", "Edit in context");
    } else {
      title = localize("agentTitle", "Build with Agent");
    }
    return {
      title,
      message: new MarkdownString(DISCLAIMER),
      icon: Codicon.chatSparkle,
      additionalMessage
    };
  }
  async renderChatEditingSessionState() {
    if (!this.input) {
      return;
    }
    this.input.renderChatEditingSessionState(this._editingSession.get() ?? null);
  }
  async renderFollowups() {
    const lastItem = this.listWidget.lastItem;
    if (lastItem && isResponseVM(lastItem) && lastItem.isComplete) {
      this.input.renderFollowups(lastItem.replyFollowups, lastItem);
    } else {
      this.input.renderFollowups(void 0, void 0);
    }
  }
  renderChatSuggestNextWidget() {
    if (this.lifecycleService.willShutdown) {
      return;
    }
    if (this.isLockedToCodingAgent) {
      this.chatSuggestNextWidget.hide();
      return;
    }
    const items = this.viewModel?.getItems() ?? [];
    if (!items.length) {
      return;
    }
    const lastItem = items[items.length - 1];
    const lastResponseComplete = lastItem && isResponseVM(lastItem) && lastItem.isComplete;
    if (!lastResponseComplete) {
      return;
    }
    const currentMode = this.input.currentModeObs.get();
    const handoffs = currentMode?.handOffs?.get();
    const shouldShow = currentMode && handoffs && handoffs.length > 0;
    if (shouldShow) {
      const wasHidden = this.chatSuggestNextWidget.domNode.style.display === "none";
      this.chatSuggestNextWidget.render(currentMode);
      if (wasHidden) {
        this.telemetryService.publicLog2("chat.handoffWidgetShown", {
          agent: getModeNameForTelemetry(currentMode),
          handoffCount: handoffs.length
        });
      }
    } else {
      this.chatSuggestNextWidget.hide();
    }
    if (this.bodyDimension) {
      this.layout(this.bodyDimension.height, this.bodyDimension.width);
    }
  }
  handleNextPromptSelection(handoff, agentId) {
    this.chatSuggestNextWidget.hide();
    const promptToUse = handoff.prompt;
    const currentMode = this.input.currentModeObs.get();
    const toMode = handoff.agent ? this.chatModeService.findModeByName(handoff.agent) : void 0;
    this.telemetryService.publicLog2("chat.handoffClicked", {
      fromAgent: getModeNameForTelemetry(currentMode),
      toAgent: agentId || (toMode ? getModeNameForTelemetry(toMode) : ""),
      hasPrompt: Boolean(promptToUse),
      autoSend: Boolean(handoff.send)
    });
    if (agentId) {
      this.input.setValue(`@${agentId} ${promptToUse}`, false);
      this.input.focus();
      this.acceptInput().catch((e) => this.logService.error("Failed to handle handoff continueOn", e));
    } else if (handoff.agent) {
      this._switchToAgentByName(handoff.agent);
      if (handoff.model) {
        this.input.switchModelByQualifiedName([handoff.model]);
      }
      this.input.setValue(promptToUse, false);
      this.input.focus();
      if (handoff.send) {
        this.acceptInput();
      }
    }
  }
  async handleDelegationExitIfNeeded(sourceAgent, targetAgent) {
    if (!this._shouldExitAfterDelegation(sourceAgent, targetAgent)) {
      return;
    }
    this.logService.debug(`[Delegation] Will exit after delegation: sourceAgent=${sourceAgent?.id}, targetAgent=${targetAgent?.id}`);
    try {
      await this._handleDelegationExit();
    } catch (e) {
      this.logService.error("[Delegation] Failed to handle delegation exit", e);
    }
  }
  _shouldExitAfterDelegation(sourceAgent, targetAgent) {
    if (!targetAgent) {
      this.logService.debug("[Delegation] _shouldExitAfterDelegation: false (no targetAgent)");
      return false;
    }
    if (!this.configurationService.getValue(ChatConfiguration.ExitAfterDelegation)) {
      this.logService.debug("[Delegation] _shouldExitAfterDelegation: false (ExitAfterDelegation config disabled)");
      return false;
    }
    if (sourceAgent && sourceAgent.id === targetAgent.id) {
      this.logService.debug("[Delegation] _shouldExitAfterDelegation: false (source and target agents are the same)");
      return false;
    }
    if (!isIChatViewViewContext(this.viewContext)) {
      this.logService.debug("[Delegation] _shouldExitAfterDelegation: false (not in chat view context)");
      return false;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(targetAgent.id);
    if (!contribution) {
      this.logService.debug(`[Delegation] _shouldExitAfterDelegation: false (no contribution found for targetAgent.id=${targetAgent.id})`);
      return false;
    }
    if (contribution.canDelegate !== true) {
      this.logService.debug(`[Delegation] _shouldExitAfterDelegation: false (contribution.canDelegate=${contribution.canDelegate}, expected true)`);
      return false;
    }
    this.logService.debug("[Delegation] _shouldExitAfterDelegation: true");
    return true;
  }
  /**
   * Handles the exit of the panel chat when a delegation to another session occurs.
   * Waits for the response to complete and any pending confirmations to be resolved,
   * then clears the widget unless the final message is an error.
   */
  async _handleDelegationExit() {
    const viewModel = this.viewModel;
    if (!viewModel) {
      this.logService.debug("[Delegation] _handleDelegationExit: no viewModel, returning");
      return;
    }
    const parentSessionResource = viewModel.sessionResource;
    this.logService.debug(`[Delegation] _handleDelegationExit: parentSessionResource=${parentSessionResource.toString()}`);
    const checkIfShouldClear = /* @__PURE__ */ __name(() => {
      const items = viewModel.getItems();
      const lastItem = items[items.length - 1];
      if (lastItem && isResponseVM(lastItem) && lastItem.model && lastItem.isComplete && !lastItem.model.isPendingConfirmation.get()) {
        const hasError = Boolean(lastItem.result?.errorDetails);
        return !hasError;
      }
      return false;
    }, "checkIfShouldClear");
    if (checkIfShouldClear()) {
      this.logService.debug("[Delegation] Response complete, archiving session before clearing");
      await this.archiveLocalParentSession(parentSessionResource);
      await this.clear();
      return;
    }
    this.logService.debug("[Delegation] Waiting for response to complete...");
    const shouldClear = await new Promise((resolve) => {
      const disposable = viewModel.onDidChange(() => {
        const result = checkIfShouldClear();
        if (result) {
          cleanup();
          resolve(true);
        }
      });
      const timeout2 = setTimeout(() => {
        this.logService.debug("[Delegation] Timeout waiting for response to complete");
        cleanup();
        resolve(false);
      }, 3e4);
      const cleanup = /* @__PURE__ */ __name(() => {
        clearTimeout(timeout2);
        disposable.dispose();
      }, "cleanup");
    });
    if (shouldClear) {
      this.logService.debug("[Delegation] Response completed, archiving session before clearing");
      await this.archiveLocalParentSession(parentSessionResource);
      await this.clear();
    } else {
      this.logService.debug("[Delegation] Not clearing (timeout or error)");
    }
  }
  async archiveLocalParentSession(sessionResource) {
    if (sessionResource.scheme !== Schemas.vscodeLocalChatSession && !IsSessionsWindowContext.getValue(this.contextKeyService)) {
      return;
    }
    this.logService.debug(`[Delegation] archiveLocalParentSession: archiving session ${sessionResource.toString()}`);
    await this.chatService.getSession(sessionResource)?.editingSession?.accept();
    const session = this.agentSessionsService.getSession(sessionResource);
    if (session) {
      session.setArchived(true);
      this.logService.debug("[Delegation] archiveLocalParentSession: session archived successfully");
    } else {
      this.logService.warn(`[Delegation] archiveLocalParentSession: session not found in agentSessionsService for ${sessionResource.toString()}`);
    }
  }
  setVisible(visible) {
    const wasVisible = this._visible;
    this._visible = visible;
    this.visibleChangeCount++;
    this.listWidget.setVisible(visible);
    this.input.setVisible(visible);
    if (visible) {
      if (!wasVisible) {
        this.visibilityTimeoutDisposable.value = disposableTimeout(() => {
          if (this._visible) {
            this.onDidChangeItems(true);
          }
        }, 0);
        this.visibilityAnimationFrameDisposable.value = dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
          this._onDidShow.fire();
        });
      }
    } else if (wasVisible) {
      this._onDidHide.fire();
    }
  }
  createList(listContainer, options) {
    const overflowWidgetsContainer = document.createElement("div");
    overflowWidgetsContainer.classList.add("chat-overflow-widget-container", "monaco-editor");
    listContainer.append(overflowWidgetsContainer);
    this.listWidget = this._register(this.instantiationService.createInstance(ChatListWidget, listContainer, {
      rendererOptions: options,
      renderStyle: this.viewOptions.renderStyle,
      defaultElementHeight: this.viewOptions.defaultElementHeight ?? 200,
      overflowWidgetsDomNode: overflowWidgetsContainer,
      styles: {
        listForeground: this.styles.listForeground,
        listBackground: this.styles.listBackground
      },
      currentChatMode: /* @__PURE__ */ __name(() => this.input.currentModeKind, "currentChatMode"),
      filter: this.viewOptions.filter ? { filter: this.viewOptions.filter.bind(this.viewOptions) } : void 0,
      codeBlockModelCollection: this._codeBlockModelCollection,
      viewModel: this.viewModel,
      editorOptions: this.editorOptions,
      location: this.location,
      getCurrentLanguageModelId: /* @__PURE__ */ __name(() => this.input.currentLanguageModel, "getCurrentLanguageModelId"),
      getCurrentModeInfo: /* @__PURE__ */ __name(() => this.input.currentModeInfo, "getCurrentModeInfo")
    }));
    this._register(this.listWidget.onDidClickRequest(async (item) => {
      this.clickedRequest(item);
    }));
    this._register(this.listWidget.onDidRerender((item) => {
      if (isRequestVM(item.currentElement) && this.configurationService.getValue("chat.editRequests") !== "input") {
        if (!item.rowContainer.contains(this.inputContainer)) {
          item.rowContainer.appendChild(this.inputContainer);
        }
        this.input.focus();
      }
    }));
    this._register(this.listWidget.onDidDispose(() => {
      this.focusedInputDOM.appendChild(this.inputContainer);
      this.input.focus();
    }));
    this._register(this.listWidget.onDidFocusOutside(() => {
      this.finishedEditing();
    }));
    this._register(this.listWidget.onDidClickFollowup((item) => {
      this.acceptInput(item.message);
    }));
    this._register(this.listWidget.onDidChangeContentHeight(() => {
      this._onDidChangeContentHeight.fire();
    }));
    this._register(this.listWidget.onDidFocus(() => {
      this._onDidFocus.fire();
    }));
    this._register(this.listWidget.onDidScroll(() => {
      this._onDidScroll.fire();
    }));
  }
  startEditing(requestId) {
    const editedRequest = this.listWidget.getTemplateDataForRequestId(requestId);
    if (editedRequest) {
      this.clickedRequest(editedRequest);
    }
  }
  clickedRequest(item) {
    const currentElement = item.currentElement;
    if (isRequestVM(currentElement) && !this.viewModel?.editing) {
      const requests = this.viewModel?.model.getRequests();
      if (!requests || !this.viewModel?.sessionResource) {
        return;
      }
      if (this.viewModel?.model.checkpoint) {
        this.recentlyRestoredCheckpoint = true;
      }
      this.viewModel?.model.setCheckpoint(currentElement.id);
      const currentContext = [];
      const addedContextIds = /* @__PURE__ */ new Set();
      const addToContext = /* @__PURE__ */ __name((entry) => {
        const dedupKey = entry.range ? `${entry.id}:${entry.range.start}-${entry.range.endExclusive}` : entry.id;
        if (addedContextIds.has(dedupKey) || isWorkspaceVariableEntry(entry)) {
          return;
        }
        if ((isPromptFileVariableEntry(entry) || isPromptTextVariableEntry(entry)) && entry.automaticallyAdded) {
          return;
        }
        addedContextIds.add(dedupKey);
        currentContext.push(entry);
      }, "addToContext");
      for (let i = requests.length - 1; i >= 0; i -= 1) {
        const request = requests[i];
        if (request.id === currentElement.id) {
          request.setShouldBeBlocked(false);
          request.attachedContext?.forEach(addToContext);
        }
      }
      currentElement.variables.forEach(addToContext);
      this.viewModel?.setEditing(currentElement);
      if (item?.contextKeyService) {
        ChatContextKeys.currentlyEditing.bindTo(item.contextKeyService).set(true);
      }
      const isEditingSentRequest = currentElement.pendingKind === void 0 ? "s" : "qs";
      const isInput = this.configurationService.getValue("chat.editRequests") === "input";
      this.inputPart?.setEditing(!!this.viewModel?.editing && isInput, isEditingSentRequest);
      if (!isInput) {
        const rowContainer = item.rowContainer;
        this.inputContainer = dom.$(".chat-edit-input-container");
        rowContainer.appendChild(this.inputContainer);
        this.createInput(this.inputContainer);
        this.input.setChatMode(this.inputPart.currentModeObs.get().id);
        this.input.setEditing(true, isEditingSentRequest);
        this._onDidChangeActiveInputEditor.fire();
      } else {
        this.inputPart.element.classList.add("editing");
      }
      this.inputPart.toggleChatInputOverlay(!isInput);
      if (currentContext.length > 0) {
        this.input.attachmentModel.addContext(...currentContext);
      }
      this.inputPart.dnd.setDisabledOverlay(!isInput);
      this.input.renderAttachedContext();
      this.input.setValue(currentElement.messageText, false);
      const dynamicVariableModel = this.getContrib(ChatDynamicVariableModel.ID);
      const editorModel = this.input.inputEditor.getModel();
      if (dynamicVariableModel && editorModel) {
        const modelTextLength = editorModel.getValueLength();
        for (const entry of currentContext) {
          if (entry.range) {
            if (entry.range.start >= entry.range.endExclusive) {
              continue;
            }
            if (entry.range.start < 0 || entry.range.endExclusive > modelTextLength) {
              continue;
            }
            const startPos = editorModel.getPositionAt(entry.range.start);
            const endPos = editorModel.getPositionAt(entry.range.endExclusive);
            dynamicVariableModel.addReference({
              id: entry.id,
              range: new Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
              data: entry.value,
              fullName: entry.fullName,
              icon: entry.icon,
              modelDescription: entry.modelDescription,
              isFile: entry.kind === "file",
              isDirectory: entry.kind === "directory"
            });
          }
        }
      }
      this.listWidget.suppressAutoScroll = true;
      this.onDidChangeItems();
      this.input.inputEditor.focus();
      this._register(this.inputPart.onDidClickOverlay(() => {
        if (this.viewModel?.editing && this.configurationService.getValue("chat.editRequests") !== "input") {
          this.finishedEditing();
        }
      }));
      if (!isInput) {
        this._register(this.inlineInputPart.inputEditor.onDidChangeModelContent(() => {
          this.listWidget.scrollToCurrentItem(currentElement);
        }));
        this._register(this.inlineInputPart.inputEditor.onDidChangeCursorSelection((e) => {
          this.listWidget.scrollToCurrentItem(currentElement);
        }));
      }
    }
    this.telemetryService.publicLog2("chat.startEditingRequests", {
      editRequestType: this.configurationService.getValue("chat.editRequests")
    });
  }
  finishedEditing(completedEdit) {
    this.listWidget.suppressAutoScroll = false;
    const editedRequest = this.listWidget.getTemplateDataForRequestId(this.viewModel?.editing?.id);
    if (this.recentlyRestoredCheckpoint) {
      this.recentlyRestoredCheckpoint = false;
    } else {
      this.viewModel?.model.setCheckpoint(void 0);
    }
    this.inputPart.dnd.setDisabledOverlay(false);
    if (editedRequest?.contextKeyService) {
      ChatContextKeys.currentlyEditing.bindTo(editedRequest.contextKeyService).set(false);
    }
    const isInput = this.configurationService.getValue("chat.editRequests") === "input";
    if (!isInput) {
      this.inputPart.setChatMode(this.input.currentModeObs.get().id);
      const currentModel = this.input.selectedLanguageModel.get();
      if (currentModel) {
        this.inputPart.switchModel(currentModel.metadata);
      }
      this.inputPart?.toggleChatInputOverlay(false);
      try {
        if (editedRequest?.rowContainer?.contains(this.inputContainer)) {
          editedRequest.rowContainer.removeChild(this.inputContainer);
        } else if (this.inputContainer.parentElement) {
          this.inputContainer.parentElement.removeChild(this.inputContainer);
        }
      } catch (e) {
        this.logService.error("Error occurred while finishing editing:", e);
      }
      this.inputContainer = dom.$(".empty-chat-state");
      this.input.dispose();
    }
    if (isInput) {
      this.inputPart.element.classList.remove("editing");
    }
    this.viewModel?.setEditing(void 0);
    this.inputPart?.setEditing(false, void 0);
    if (!isInput) {
      this._onDidChangeActiveInputEditor.fire();
    }
    this.onDidChangeItems();
    this.telemetryService.publicLog2("chat.editRequestsFinished", {
      editRequestType: this.configurationService.getValue("chat.editRequests"),
      editCanceled: !completedEdit
    });
    this.inputPart.focus();
  }
  getWidgetViewKindTag() {
    if (!this.viewContext) {
      return "editor";
    } else if (isIChatViewViewContext(this.viewContext)) {
      return "view";
    } else {
      return "quick";
    }
  }
  createInput(container, options) {
    const commonConfig = {
      renderFollowups: options?.renderFollowups ?? true,
      renderStyle: options?.renderStyle === "minimal" ? "compact" : options?.renderStyle,
      renderInputToolbarBelowInput: options?.renderInputToolbarBelowInput ?? false,
      menus: {
        executeToolbar: MenuId.ChatExecute,
        telemetrySource: "chatWidget",
        ...this.viewOptions.menus
      },
      editorOverflowWidgetsDomNode: this.viewOptions.editorOverflowWidgetsDomNode,
      enableImplicitContext: this.viewOptions.enableImplicitContext,
      renderWorkingSet: this.viewOptions.enableWorkingSet === "explicit",
      supportsChangingModes: this.viewOptions.supportsChangingModes,
      dndContainer: this.viewOptions.dndContainer,
      widgetViewKindTag: this.getWidgetViewKindTag(),
      defaultMode: this.viewOptions.defaultMode,
      sessionTypePickerDelegate: this.viewOptions.sessionTypePickerDelegate,
      workspacePickerDelegate: this.viewOptions.workspacePickerDelegate
    };
    if (this.viewModel?.editing) {
      const editedRequest = this.listWidget.getTemplateDataForRequestId(this.viewModel?.editing?.id);
      const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, editedRequest?.contextKeyService])));
      this.inlineInputPartDisposable.value = scopedInstantiationService.createInstance(ChatInputPart, this.location, commonConfig, this.styles, true);
    } else {
      this.inputPartDisposable.value = this.instantiationService.createInstance(ChatInputPart, this.location, commonConfig, this.styles, false);
      this._register(autorun((reader) => {
        this.inputPart.height.read(reader);
        if (!this.listWidget) {
          return;
        }
        if (this.bodyDimension) {
          this.layout(this.bodyDimension.height, this.bodyDimension.width);
        }
        this._onDidChangeContentHeight.fire();
      }));
    }
    this.input.render(container, "", this);
    if (this.bodyDimension?.width) {
      this.input.layout(this.bodyDimension.width);
    }
    this._register(this.input.onDidLoadInputState(() => {
      this.refreshParsedInput();
    }));
    this._register(this.input.onDidFocus(() => this._onDidFocus.fire()));
    this._register(this.input.onDidAcceptFollowup((e) => {
      if (!this.viewModel) {
        return;
      }
      let msg = "";
      if (e.followup.agentId && e.followup.agentId !== this.chatAgentService.getDefaultAgent(this.location, this.input.currentModeKind)?.id) {
        const agent = this.chatAgentService.getAgent(e.followup.agentId);
        if (!agent) {
          return;
        }
        this.lastSelectedAgent = agent;
        msg = `${chatAgentLeader}${agent.name} `;
        if (e.followup.subCommand) {
          msg += `${chatSubcommandLeader}${e.followup.subCommand} `;
        }
      } else if (!e.followup.agentId && e.followup.subCommand && this.chatSlashCommandService.hasCommand(e.followup.subCommand)) {
        msg = `${chatSubcommandLeader}${e.followup.subCommand} `;
      }
      msg += e.followup.message;
      this.acceptInput(msg);
      if (!e.response) {
        return;
      }
      this.chatService.notifyUserAction({
        sessionResource: this.viewModel.sessionResource,
        requestId: e.response.requestId,
        agentId: e.response.agent?.id,
        command: e.response.slashCommand?.name,
        result: e.response.result,
        action: {
          kind: "followUp",
          followup: e.followup
        }
      });
    }));
    this._register(this.inputEditor.onDidChangeModelContent(() => {
      this.parsedChatRequest = void 0;
      this.updateChatInputContext();
    }));
    this._register(this.chatAgentService.onDidChangeAgents(() => {
      this.parsedChatRequest = void 0;
      this.renderWelcomeViewContentIfNeeded();
    }));
    this._register(this.input.onDidChangeCurrentChatMode(() => {
      this.renderWelcomeViewContentIfNeeded();
      this.refreshParsedInput();
      this.renderFollowups();
      this.renderChatSuggestNextWidget();
    }));
    let previousModelIdentifier;
    this._register(autorun((reader) => {
      const modelIdentifier = this.inputPart.selectedLanguageModel.read(reader)?.identifier;
      if (previousModelIdentifier === void 0) {
        previousModelIdentifier = modelIdentifier;
        return;
      }
      if (previousModelIdentifier === modelIdentifier) {
        return;
      }
      previousModelIdentifier = modelIdentifier;
      if (!this._gettingStartedTipPartRef) {
        return;
      }
      this.chatTipService.getWelcomeTip(this.contextKeyService);
    }));
    this._register(autorun((r) => {
      const toolSetIds = /* @__PURE__ */ new Set();
      const toolIds = /* @__PURE__ */ new Set();
      for (const [entry, enabled] of this.input.selectedToolsModel.entriesMap.read(r)) {
        if (enabled) {
          if (isToolSet(entry)) {
            toolSetIds.add(entry.id);
          } else {
            toolIds.add(entry.id);
          }
        }
      }
      const disabledTools = this.input.attachmentModel.attachments.filter((a) => a.kind === "tool" && !toolIds.has(a.id) || a.kind === "toolset" && !toolSetIds.has(a.id)).map((a) => a.id);
      this.input.attachmentModel.updateContext(disabledTools, Iterable.empty());
      this.refreshParsedInput();
    }));
  }
  onDidStyleChange() {
    this.container.style.setProperty("--vscode-interactive-result-editor-background-color", this.editorOptions.configuration.resultEditor.backgroundColor?.toString() ?? "");
    this.container.style.setProperty("--vscode-interactive-session-foreground", this.editorOptions.configuration.foreground?.toString() ?? "");
    this.container.style.setProperty("--vscode-chat-list-background", this.themeService.getColorTheme().getColor(this.styles.listBackground)?.toString() ?? "");
  }
  setModel(model) {
    if (!this.container) {
      throw new Error("Call render() before setModel()");
    }
    if (!model) {
      if (this.viewModel?.editing) {
        this.finishedEditing();
      }
      this.viewModel = void 0;
      this.onDidChangeItems();
      this._hasPendingRequestsContextKey.set(false);
      return;
    }
    if (isEqual(model.sessionResource, this.viewModel?.sessionResource)) {
      return;
    }
    if (this.viewModel?.editing) {
      this.finishedEditing();
    }
    this.inputPart.clearTodoListWidget(model.sessionResource, false);
    this.chatSuggestNextWidget.hide();
    this.chatTipService.resetSession();
    this._gettingStartedTipPartRef = void 0;
    this._gettingStartedTipPart.clear();
    const tipContainer = this.inputPart.gettingStartedTipContainerElement;
    dom.clearNode(tipContainer);
    dom.setVisibility(false, tipContainer);
    this._codeBlockModelCollection.clear();
    this.viewModel = this.instantiationService.createInstance(ChatViewModel, model, this._codeBlockModelCollection, void 0);
    this.inputPart.setInputModel(model.inputModel, model.getRequests().length === 0);
    this.listWidget.setViewModel(this.viewModel);
    if (this._lockedAgent) {
      let placeholder = this.chatSessionsService.getInputPlaceholderForSessionType(this._lockedAgent.id);
      if (!placeholder) {
        placeholder = localize("chat.input.placeholder.lockedToAgent", "Chat with {0}", this._lockedAgent.id);
      }
      this.viewModel.setInputPlaceholder(placeholder);
      this.inputEditor.updateOptions({ placeholder });
    } else if (this.viewModel.inputPlaceholder) {
      this.inputEditor.updateOptions({ placeholder: this.viewModel.inputPlaceholder });
    }
    const renderImmediately = this.configurationService.getValue("chat.experimental.renderMarkdownImmediately");
    const delay = renderImmediately ? MicrotaskDelay : 0;
    this.viewModelDisposables.add(Event.runAndSubscribe(Event.accumulate(this.viewModel.onDidChange, delay), ((events) => {
      if (!this.viewModel || this._store.isDisposed) {
        return;
      }
      this.requestInProgress.set(this.viewModel.model.requestInProgress.get());
      if (events?.some((e) => e?.kind === "changePlaceholder")) {
        this.inputEditor.updateOptions({ placeholder: this.viewModel.inputPlaceholder });
      }
      this.onDidChangeItems();
      if (events?.some((e) => e?.kind === "addRequest") && this.visible) {
        this.listWidget.scrollToEnd();
      }
    })));
    this.viewModelDisposables.add(this.viewModel.onDidDisposeModel(() => {
      if (this.viewModel?.editing) {
        this.finishedEditing();
      }
      this.viewModel = void 0;
      this.onDidChangeItems();
    }));
    this._sessionIsEmptyContextKey.set(model.getRequests().length === 0);
    this._sessionHasDebugDataContextKey.set(this.chatDebugService.getEvents(model.sessionResource).length > 0);
    let lastSteeringCount = 0;
    const updatePendingRequestKeys = /* @__PURE__ */ __name((announceSteering) => {
      const pendingRequests = model.getPendingRequests();
      const pendingCount = pendingRequests.length;
      this._hasPendingRequestsContextKey.set(pendingCount > 0);
      const steeringCount = pendingRequests.filter(
        (pending) => pending.kind === "steering"
        /* ChatRequestQueueKind.Steering */
      ).length;
      if (announceSteering && steeringCount > 0 && lastSteeringCount === 0) {
        status(localize("chat.pendingRequests.steeringQueued", "Steering"));
      }
      lastSteeringCount = steeringCount;
    }, "updatePendingRequestKeys");
    updatePendingRequestKeys(false);
    this.viewModelDisposables.add(model.onDidChangePendingRequests(() => updatePendingRequestKeys(true)));
    this.refreshParsedInput();
    this.viewModelDisposables.add(model.onDidChange((e) => {
      if (e.kind === "setAgent") {
        this._onDidChangeAgent.fire({ agent: e.agent, slashCommand: e.command });
        this._updateAgentCapabilitiesContextKeys(e.agent);
      }
      if (e.kind === "addRequest") {
        this.inputPart.clearTodoListWidget(this.viewModel?.sessionResource, false);
        this._sessionIsEmptyContextKey.set(false);
      }
      if (e.kind === "removeRequest") {
        this.inputPart.clearTodoListWidget(this.viewModel?.sessionResource, true);
        this.chatSuggestNextWidget.hide();
        this._sessionIsEmptyContextKey.set((this.viewModel?.model.getRequests().length ?? 0) === 0);
      }
      if (e.kind === "completedRequest") {
        const lastRequest = this.viewModel?.model.getRequests().at(-1);
        const wasCancelled = lastRequest?.response?.isCanceled ?? false;
        if (wasCancelled) {
          this.inputPart.clearTodoListWidget(this.viewModel?.sessionResource, true);
        }
        this.renderChatSuggestNextWidget();
        if (this.visible && this.viewModel?.sessionResource) {
          this.agentSessionsService.getSession(this.viewModel.sessionResource)?.setRead(true);
        }
      }
    }));
    if (this.listWidget && this.visible) {
      this.onDidChangeItems();
      this.listWidget.scrollToEnd();
    }
    this.updateChatInputContext();
    this.input.renderChatTodoListWidget(this.viewModel.sessionResource);
  }
  getFocus() {
    return this.listWidget.getFocus()[0] ?? void 0;
  }
  reveal(item, relativeTop) {
    this.listWidget.reveal(item, relativeTop);
  }
  focus(item) {
    if (!this.listWidget.hasElement(item)) {
      return;
    }
    this.listWidget.focusItem(item);
  }
  setInputPlaceholder(placeholder) {
    this.viewModel?.setInputPlaceholder(placeholder);
  }
  resetInputPlaceholder() {
    this.viewModel?.resetInputPlaceholder();
  }
  setInput(value = "") {
    this.input.setValue(value, false);
    this.refreshParsedInput();
  }
  getInput() {
    return this.input.inputEditor.getValue();
  }
  getContrib(id) {
    return this.contribs.find((c) => c.id === id);
  }
  // Coding agent locking methods
  lockToCodingAgent(name, displayName, agentId) {
    this._lockedAgent = {
      id: agentId,
      name,
      prefix: `@${name} `,
      displayName
    };
    this._lockedToCodingAgentContextKey.set(true);
    this.renderWelcomeViewContentIfNeeded();
    const agent = this.chatAgentService.getAgent(agentId);
    this._updateAgentCapabilitiesContextKeys(agent);
    this.listWidget?.updateRendererOptions({ restorable: false, editable: false, noFooter: true, progressMessageAtBottomOfResponse: true });
    if (this.visible) {
      this.listWidget?.rerender();
    }
  }
  unlockFromCodingAgent() {
    this._lockedAgent = void 0;
    this._lockedToCodingAgentContextKey.set(false);
    this._updateAgentCapabilitiesContextKeys(void 0);
    this.renderWelcomeViewContentIfNeeded();
    if (this.viewModel) {
      this.viewModel.resetInputPlaceholder();
    }
    this.inputEditor?.updateOptions({ placeholder: void 0 });
    this.listWidget?.updateRendererOptions({ restorable: true, editable: true, noFooter: false, progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "progressMessageAtBottomOfResponse") });
    if (this.visible) {
      this.listWidget?.rerender();
    }
  }
  get isLockedToCodingAgent() {
    return !!this._lockedAgent;
  }
  get lockedAgentId() {
    return this._lockedAgent?.id;
  }
  logInputHistory() {
    this.input.logInputHistory();
  }
  async acceptInput(query, options) {
    return this._acceptInput(query ? { query } : void 0, options);
  }
  async rerunLastRequest() {
    if (!this.viewModel) {
      return;
    }
    const sessionResource = this.viewModel.sessionResource;
    const lastRequest = this.chatService.getSession(sessionResource)?.getRequests().at(-1);
    if (!lastRequest) {
      return;
    }
    const options = {
      attempt: lastRequest.attempt + 1,
      location: this.location,
      userSelectedModelId: this.input.currentLanguageModel
    };
    return await this.chatService.resendRequest(lastRequest, options);
  }
  async _applyPromptFileIfSet(requestInput) {
    const agentSlashPromptPart = this.parsedInput.parts.find((r) => r instanceof ChatRequestSlashPromptPart);
    if (!agentSlashPromptPart) {
      return;
    }
    const slashCommand = await this.promptsService.resolvePromptSlashCommand(agentSlashPromptPart.name, CancellationToken.None);
    if (!slashCommand) {
      return;
    }
    const parseResult = slashCommand.parsedPromptFile;
    const refs = parseResult.body?.variableReferences.map(({ name, offset }) => ({ name, range: new OffsetRange(offset, offset + name.length + 1) })) ?? [];
    const toolReferences = this.toolsService.toToolReferences(refs);
    requestInput.attachedContext.insertFirst(toPromptFileVariableEntry(parseResult.uri, PromptFileVariableKind.PromptFile, void 0, true, toolReferences));
    requestInput.input = this.parsedInput.parts.filter((part) => !(part instanceof ChatRequestSlashPromptPart)).map((part) => part.text).join("").trim();
    const promptPath = slashCommand.promptPath;
    const promptRunEvent = {
      storage: promptPath.storage
    };
    if (promptPath.storage === PromptsStorage.extension) {
      promptRunEvent.extensionId = promptPath.extension.identifier.value;
      promptRunEvent.promptName = slashCommand.name;
    } else {
      promptRunEvent.promptNameHash = hash(slashCommand.name).toString(16);
    }
    this.telemetryService.publicLog2("chat.promptRun", promptRunEvent);
    const input = requestInput.input.trim();
    requestInput.input = `Follow instructions in [${basename(parseResult.uri)}](${parseResult.uri.toString()}).`;
    if (input) {
      requestInput.input += `
${input}`;
    }
    if (parseResult.header) {
      await this._applyPromptMetadata(parseResult.header, requestInput);
    }
  }
  async _acceptInput(query, options = {}) {
    if (!query && this.input.generating) {
      const generatingAutoSubmitWindow = 500;
      const start = Date.now();
      await this.input.generating;
      if (Date.now() - start > generatingAutoSubmitWindow) {
        return;
      }
    }
    while (!this._viewModel && !this._store.isDisposed) {
      await Event.toPromise(this.onDidChangeViewModel, this._store);
    }
    if (!this.viewModel) {
      return;
    }
    if (this.viewOptions.submitHandler) {
      const inputValue = !query ? this.getInput() : query.query;
      const handled = await this.viewOptions.submitHandler(inputValue, this.input.currentModeKind);
      if (handled) {
        return;
      }
    }
    this._onDidAcceptInput.fire();
    this.listWidget.setScrollLock(this.isLockedToCodingAgent || !!checkModeOption(this.input.currentModeKind, this.viewOptions.autoScroll));
    const editorValue = this.getInput();
    const requestInputs = {
      input: !query ? editorValue : query.query,
      attachedContext: options?.enableImplicitContext === false ? this.input.getAttachedContext(this.viewModel.sessionResource) : this.input.getAttachedAndImplicitContext(this.viewModel.sessionResource)
    };
    const isUserQuery = !query;
    const isEditing = this.viewModel?.editing;
    if (isEditing) {
      const editingPendingRequest = this.viewModel.editing.pendingKind;
      if (editingPendingRequest !== void 0) {
        const editingRequestId = this.viewModel.editing.id;
        this.chatService.removePendingRequest(this.viewModel.sessionResource, editingRequestId);
        options.queue ??= editingPendingRequest;
      } else {
        this.chatService.cancelCurrentRequestForSession(this.viewModel.sessionResource, "acceptInput-editing");
        options.queue = void 0;
      }
      this.finishedEditing(true);
      this.viewModel.model?.setCheckpoint(void 0);
    }
    const model = this.viewModel.model;
    const requestInProgress = model.requestInProgress.get();
    if (options.alwaysQueue) {
      options.queue ??= "queued";
    }
    if (model.requestNeedsInput.get() && !model.getPendingRequests().length) {
      this.chatService.cancelCurrentRequestForSession(this.viewModel.sessionResource, "acceptInput-needsInput");
      options.queue ??= "queued";
    }
    if (requestInProgress) {
      options.queue ??= "queued";
    }
    if (!options.alwaysQueue && !requestInProgress && !isEditing && !await this.confirmPendingRequestsBeforeSend(model, options)) {
      return;
    }
    await this._applyPromptFileIfSet(requestInputs);
    await this._autoAttachInstructions(requestInputs);
    if (this.viewOptions.enableWorkingSet !== void 0 && this.input.currentModeKind === ChatModeKind.Edit && !this.chatService.edits2Enabled) {
      const uniqueWorkingSetEntries = new ResourceSet();
      const editingSessionAttachedContext = requestInputs.attachedContext;
      const previousRequests = this.viewModel.model.getRequests();
      for (const request of previousRequests) {
        for (const variable of request.variableData.variables) {
          if (URI.isUri(variable.value) && variable.kind === "file") {
            const uri = variable.value;
            if (!uniqueWorkingSetEntries.has(uri)) {
              editingSessionAttachedContext.add(variable);
              uniqueWorkingSetEntries.add(variable.value);
            }
          }
        }
      }
      requestInputs.attachedContext = editingSessionAttachedContext;
      this.telemetryService.publicLog2("chatEditing/workingSetSize", { originalSize: uniqueWorkingSetEntries.size, actualSize: uniqueWorkingSetEntries.size });
    }
    this.input.validateAgentMode();
    if (this.viewModel.model.checkpoint) {
      const requests = this.viewModel.model.getRequests();
      for (let i = requests.length - 1; i >= 0; i -= 1) {
        const request = requests[i];
        if (request.shouldBeBlocked) {
          this.chatService.removeRequest(this.viewModel.sessionResource, request.id);
        }
      }
    }
    const resolvedImageVariables = await this._resolveDirectoryImageAttachments(requestInputs.attachedContext.asArray());
    const submittedSessionResource = this.viewModel.sessionResource;
    const result = await this.chatService.sendRequest(this.viewModel.sessionResource, requestInputs.input, {
      userSelectedModelId: this.input.currentLanguageModel,
      location: this.location,
      locationData: this._location.resolveData?.(),
      parserContext: { selectedAgent: this._lastSelectedAgent, mode: this.input.currentModeKind, attachmentCapabilities: this._lastSelectedAgent?.capabilities ?? this.attachmentCapabilities },
      attachedContext: requestInputs.attachedContext.asArray(),
      resolvedVariables: resolvedImageVariables,
      noCommandDetection: options?.noCommandDetection,
      ...this.getModeRequestOptions(),
      modeInfo: this.input.currentModeInfo,
      agentIdSilent: this._lockedAgent?.id,
      queue: options?.queue,
      pauseQueue: options?.alwaysQueue
    });
    if (ChatSendResult.isRejected(result)) {
      return;
    }
    this.updateChatViewVisibility();
    this.input.acceptInput(options?.storeToHistory ?? isUserQuery);
    const sent = ChatSendResult.isQueued(result) ? await result.deferred : result;
    if (!ChatSendResult.isSent(sent)) {
      return;
    }
    this._onDidSubmitAgent.fire({ agent: sent.data.agent, slashCommand: sent.data.slashCommand });
    this.handleDelegationExitIfNeeded(this._lockedAgent, sent.data.agent);
    sent.data.responseCreatedPromise.then(() => {
      this.chatAccessibilityService.acceptRequest(submittedSessionResource);
      sent.data.responseCompletePromise.then(() => {
        const responses = this.viewModel?.getItems().filter(isResponseVM);
        const lastResponse = responses?.[responses.length - 1];
        this.chatAccessibilityService.acceptResponse(this, this.container, lastResponse, submittedSessionResource, options?.isVoiceInput);
        if (lastResponse?.result?.nextQuestion) {
          const { prompt, participant, command } = lastResponse.result.nextQuestion;
          const question = formatChatQuestion(this.chatAgentService, this.location, prompt, participant, command);
          if (question) {
            this.input.setValue(question, false);
          }
        }
      });
    });
    return sent.data.responseCreatedPromise;
  }
  // Resolve images from directory attachments to send as additional variables.
  async _resolveDirectoryImageAttachments(attachments) {
    const imagePromises = [];
    for (const attachment of attachments) {
      if (attachment.kind === "directory" && URI.isUri(attachment.value)) {
        imagePromises.push(this.chatAttachmentResolveService.resolveDirectoryImages(attachment.value));
      }
    }
    if (imagePromises.length === 0) {
      return [];
    }
    const resolved = await Promise.all(imagePromises);
    return resolved.flat();
  }
  async confirmPendingRequestsBeforeSend(model, options) {
    if (options.queue) {
      return true;
    }
    const hasPendingRequests = model.getPendingRequests().length > 0;
    if (!hasPendingRequests) {
      return true;
    }
    const promptResult = await this.dialogService.prompt({
      type: "question",
      message: localize("chat.pendingRequests.prompt.message", "You already have pending requests."),
      detail: localize("chat.pendingRequests.prompt.detail", "Do you want to keep them in the queue or remove them before sending this message?"),
      buttons: [
        {
          label: localize("chat.pendingRequests.prompt.keep", "Keep Pending Requests"),
          run: /* @__PURE__ */ __name(() => "keep", "run")
        },
        {
          label: localize("chat.pendingRequests.prompt.remove", "Remove Pending Requests"),
          run: /* @__PURE__ */ __name(() => "remove", "run")
        }
      ],
      cancelButton: true
    });
    if (!promptResult.result) {
      return false;
    }
    if (promptResult.result === "remove") {
      for (const pendingRequest of [...model.getPendingRequests()]) {
        this.chatService.removePendingRequest(model.sessionResource, pendingRequest.request.id);
      }
    }
    return true;
  }
  getModeRequestOptions() {
    const sessionResource = this.viewModel?.sessionResource;
    const userSelectedTools = this.input.selectedToolsModel.userSelectedTools;
    let lastToolsSnapshot = userSelectedTools.get();
    const scopedTools = derived((reader) => {
      const activeSession = this._viewModelObs.read(reader)?.sessionResource;
      if (isEqual(activeSession, sessionResource)) {
        const tools = userSelectedTools.read(reader);
        lastToolsSnapshot = tools;
        return tools;
      }
      return lastToolsSnapshot;
    });
    return {
      modeInfo: this.input.currentModeInfo,
      userSelectedTools: scopedTools
    };
  }
  getCodeBlockInfosForResponse(response) {
    return this.listWidget.getCodeBlockInfosForResponse(response);
  }
  getCodeBlockInfoForEditor(uri) {
    return this.listWidget.getCodeBlockInfoForEditor(uri);
  }
  getFileTreeInfosForResponse(response) {
    return this.listWidget.getFileTreeInfosForResponse(response);
  }
  getLastFocusedFileTreeForResponse(response) {
    return this.listWidget.getLastFocusedFileTreeForResponse(response);
  }
  focusResponseItem(lastFocused) {
    this.listWidget.focusLastItem(lastFocused);
  }
  layout(height, width) {
    width = Math.min(width, this.viewOptions.renderStyle === "minimal" ? width : 950);
    this.bodyDimension = new dom.Dimension(width, height);
    if (this.viewModel?.editing) {
      this.inlineInputPart?.layout(width);
    }
    this.inputPart.layout(width);
    const inputHeight = this.inputPart.height.get();
    const chatSuggestNextWidgetHeight = this.chatSuggestNextWidget.height;
    const lastElementVisible = this.listWidget.isScrolledToBottom;
    const lastItem = this.listWidget.lastItem;
    const contentHeight = Math.max(0, height - inputHeight - chatSuggestNextWidgetHeight);
    this.listWidget.layout(contentHeight, width);
    this.welcomeMessageContainer.style.height = `${contentHeight}px`;
    const lastResponseIsRendering = isResponseVM(lastItem) && lastItem.renderData;
    if (lastElementVisible && (!lastResponseIsRendering || checkModeOption(this.input.currentModeKind, this.viewOptions.autoScroll))) {
      this.listWidget.scrollToEnd();
    }
    this.listContainer.style.height = `${contentHeight}px`;
    this._onDidChangeHeight.fire(height);
  }
  // An alternative to layout, this allows you to specify the number of ChatTreeItems
  // you want to show, and the max height of the container. It will then layout the
  // tree to show that many items.
  // TODO@TylerLeonhardt: This could use some refactoring to make it clear which layout strategy is being used
  setDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
    this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
    this._register(this.listWidget.onDidChangeItemHeight(() => this.layoutDynamicChatTreeItemMode()));
    const mutableDisposable = this._register(new MutableDisposable());
    this._register(this.listWidget.onDidScroll((e) => {
      if (!this._dynamicMessageLayoutData?.enabled) {
        return;
      }
      mutableDisposable.value = dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
        if (!e.scrollTopChanged || e.heightChanged || e.scrollHeightChanged) {
          return;
        }
        const renderHeight = e.height;
        const diff = e.scrollHeight - renderHeight - e.scrollTop;
        if (diff === 0) {
          return;
        }
        const possibleMaxHeight = this._dynamicMessageLayoutData?.maxHeight ?? maxHeight;
        const width = this.bodyDimension?.width ?? this.container.offsetWidth;
        this.input.layout(width);
        const inputPartHeight = this.input.height.get();
        const chatSuggestNextWidgetHeight = this.chatSuggestNextWidget.height;
        const newHeight = Math.min(renderHeight + diff, possibleMaxHeight - inputPartHeight - chatSuggestNextWidgetHeight);
        this.layout(newHeight + inputPartHeight + chatSuggestNextWidgetHeight, width);
      });
    }));
  }
  updateDynamicChatTreeItemLayout(numOfChatTreeItems, maxHeight) {
    this._dynamicMessageLayoutData = { numOfMessages: numOfChatTreeItems, maxHeight, enabled: true };
    let hasChanged = false;
    let height = this.bodyDimension.height;
    let width = this.bodyDimension.width;
    if (maxHeight < this.bodyDimension.height) {
      height = maxHeight;
      hasChanged = true;
    }
    const containerWidth = this.container.offsetWidth;
    if (this.bodyDimension?.width !== containerWidth) {
      width = containerWidth;
      hasChanged = true;
    }
    if (hasChanged) {
      this.layout(height, width);
    }
  }
  get isDynamicChatTreeItemLayoutEnabled() {
    return this._dynamicMessageLayoutData?.enabled ?? false;
  }
  set isDynamicChatTreeItemLayoutEnabled(value) {
    if (!this._dynamicMessageLayoutData) {
      return;
    }
    this._dynamicMessageLayoutData.enabled = value;
  }
  layoutDynamicChatTreeItemMode() {
    if (!this.viewModel || !this._dynamicMessageLayoutData?.enabled) {
      return;
    }
    const width = this.bodyDimension?.width ?? this.container.offsetWidth;
    this.input.layout(width);
    const inputHeight = this.input.height.get();
    const chatSuggestNextWidgetHeight = this.chatSuggestNextWidget.height;
    const totalMessages = this.viewModel.getItems();
    const messages = totalMessages.slice(-this._dynamicMessageLayoutData.numOfMessages);
    const needsRerender = messages.some((m) => m.currentRenderedHeight === void 0);
    const listHeight = needsRerender ? this._dynamicMessageLayoutData.maxHeight : messages.reduce((acc, message) => acc + message.currentRenderedHeight, 0);
    this.layout(Math.min(
      // we add an additional 18px in order to show that there is scrollable content
      inputHeight + chatSuggestNextWidgetHeight + listHeight + (totalMessages.length > 2 ? 18 : 0),
      this._dynamicMessageLayoutData.maxHeight
    ), width);
    if (needsRerender || !listHeight) {
      this.listWidget.scrollToEnd();
    }
  }
  saveState() {
  }
  getViewState() {
    return this.input.getCurrentInputState();
  }
  updateChatInputContext() {
    const currentAgent = this.parsedInput.parts.find((part) => part instanceof ChatRequestAgentPart);
    this.agentInInput.set(!!currentAgent);
  }
  async _switchToAgentByName(agentName) {
    const currentAgent = this.input.currentModeObs.get();
    if (agentName !== currentAgent.name.get()) {
      const agent = this.chatModeService.findModeByName(agentName);
      if (agent) {
        if (currentAgent.kind !== agent.kind) {
          const chatModeCheck = await this.instantiationService.invokeFunction(handleModeSwitch, currentAgent.kind, agent.kind, this.viewModel?.model.getRequests().length ?? 0, this.viewModel?.model);
          if (!chatModeCheck) {
            return;
          }
          if (chatModeCheck.needToClearSession) {
            await this.clear();
          }
        }
        this.input.setChatMode(agent.id);
      }
    }
  }
  async _applyPromptMetadata({ agent, tools, model }, requestInput) {
    if (tools !== void 0 && !agent && this.input.currentModeKind !== ChatModeKind.Agent) {
      agent = ChatMode.Agent.name.get();
    }
    if (agent) {
      this._switchToAgentByName(agent);
    }
    if (tools !== void 0 && this.input.currentModeKind === ChatModeKind.Agent) {
      const enablementMap = this.toolsService.toToolAndToolSetEnablementMap(tools, this.input.selectedLanguageModel.get()?.metadata);
      this.input.selectedToolsModel.set(enablementMap, true);
    }
    if (model !== void 0) {
      this.input.switchModelByQualifiedName(model);
    }
  }
  /**
   * Adds additional instructions to the context
   * - instructions that have a 'applyTo' pattern that matches the current input
   * - instructions referenced in the copilot settings 'copilot-instructions'
   * - instructions referenced in an already included instruction file
   */
  async _autoAttachInstructions({ attachedContext }) {
    this.logService.debug(`ChatWidget#_autoAttachInstructions: prompt files are always enabled`);
    const enabledTools = this.input.currentModeKind === ChatModeKind.Agent ? this.input.selectedToolsModel.userSelectedTools.get() : void 0;
    const enabledSubAgents = this.input.currentModeKind === ChatModeKind.Agent ? this.input.currentModeObs.get().agents?.get() : void 0;
    const sessionResource = this._viewModel?.model.sessionResource;
    const computer = this.instantiationService.createInstance(ComputeAutomaticInstructions, this.input.currentModeKind, enabledTools, enabledSubAgents, sessionResource);
    await computer.collect(attachedContext, CancellationToken.None);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.listWidget.delegateScrollFromMouseWheelEvent(browserEvent);
  }
};
ChatWidget = ChatWidget_1 = __decorate([
  __param(4, ICodeEditorService),
  __param(5, IConfigurationService),
  __param(6, IDialogService),
  __param(7, IContextKeyService),
  __param(8, IInstantiationService),
  __param(9, IChatService),
  __param(10, IChatAgentService),
  __param(11, IChatWidgetService),
  __param(12, IChatAccessibilityService),
  __param(13, ILogService),
  __param(14, IThemeService),
  __param(15, IChatSlashCommandService),
  __param(16, IChatEditingService),
  __param(17, ITelemetryService),
  __param(18, IPromptsService),
  __param(19, ILanguageModelToolsService),
  __param(20, IChatModeService),
  __param(21, IChatLayoutService),
  __param(22, IChatEntitlementService),
  __param(23, IChatSessionsService),
  __param(24, IAgentSessionsService),
  __param(25, IChatTodoListService),
  __param(26, ILifecycleService),
  __param(27, IChatAttachmentResolveService),
  __param(28, IChatTipService),
  __param(29, IChatDebugService)
], ChatWidget);
export {
  ChatWidget,
  isQuickChat
};
//# sourceMappingURL=chatWidget.js.map
