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
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { disposableTimeout, timeout } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore, MutableDisposable, thenIfNotDisposed } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { filter } from "../../../../../base/common/objects.js";
import { autorun, observableFromEvent, observableValue } from "../../../../../base/common/observable.js";
import { basename, extUri, isEqual } from "../../../../../base/common/resources.js";
import { MicrotaskDelay } from "../../../../../base/common/symbols.js";
import { isDefined } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { OffsetRange } from "../../../../../editor/common/core/ranges/offsetRange.js";
import { localize } from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { WorkbenchObjectTree } from "../../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { bindContextKey } from "../../../../../platform/observable/common/platformObservableUtils.js";
import product from "../../../../../platform/product/common/product.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { buttonSecondaryBackground, buttonSecondaryForeground, buttonSecondaryHoverBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable } from "../../../../../platform/theme/common/colorUtils.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { EditorResourceAccessor } from "../../../../common/editor.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { katexContainerClassName } from "../../../markdown/common/markedKatexExtension.js";
import { checkModeOption } from "../../common/chat.js";
import { IChatAgentService } from "../../common/participants/chatAgents.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { applyingChatEditsFailedContextKey, decidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, IChatEditingService, inChatEditingSessionContextKey } from "../../common/editing/chatEditingService.js";
import { IChatLayoutService } from "../../common/widget/chatLayoutService.js";
import { ChatMode, IChatModeService } from "../../common/chatModes.js";
import { chatAgentLeader, ChatRequestAgentPart, ChatRequestDynamicVariablePart, ChatRequestSlashPromptPart, ChatRequestToolPart, ChatRequestToolSetPart, chatSubcommandLeader, formatChatQuestion, IParsedChatRequest } from "../../common/requestParser/chatParserTypes.js";
import { ChatRequestParser } from "../../common/requestParser/chatRequestParser.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { IChatSlashCommandService } from "../../common/participants/chatSlashCommands.js";
import { IChatTodoListService } from "../../common/tools/chatTodoListService.js";
import { isPromptFileVariableEntry, isPromptTextVariableEntry, isWorkspaceVariableEntry, PromptFileVariableKind, toPromptFileVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { ChatViewModel, isRequestVM, isResponseVM } from "../../common/model/chatViewModel.js";
import { CodeBlockModelCollection } from "../../common/widget/codeBlockModelCollection.js";
import { ChatConfiguration, ChatModeKind } from "../../common/constants.js";
import { ILanguageModelToolsService, ToolSet } from "../../common/tools/languageModelToolsService.js";
import { ComputeAutomaticInstructions } from "../../common/promptSyntax/computeAutomaticInstructions.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { Target } from "../../common/promptSyntax/promptFileParser.js";
import { IPromptsService } from "../../common/promptSyntax/service/promptsService.js";
import { handleModeSwitch } from "../actions/chatActions.js";
import { IChatAccessibilityService, IChatWidgetService, isIChatResourceViewContext, isIChatViewViewContext } from "../chat.js";
import { ChatAccessibilityProvider } from "../accessibility/chatAccessibilityProvider.js";
import { ChatSuggestNextWidget } from "./chatContentParts/chatSuggestNextWidget.js";
import { ChatInputPart } from "./input/chatInputPart.js";
import { ChatListDelegate, ChatListItemRenderer } from "./chatListRenderer.js";
import { ChatEditorOptions } from "./chatOptions.js";
import { ChatViewWelcomePart } from "../viewsWelcome/chatViewWelcomeController.js";
import { IAgentSessionsService } from "../agentSessions/agentSessionsService.js";
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
  supportsTerminalAttachments: true
};
const DISCLAIMER = localize("chatDisclaimer", "AI responses may be inaccurate.");
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
    this.currentRequest = void 0;
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
  constructor(location, viewContext, viewOptions, styles, codeEditorService, editorService, configurationService, contextKeyService, instantiationService, chatService, chatAgentService, chatWidgetService, contextMenuService, chatAccessibilityService, logService, themeService, chatSlashCommandService, chatEditingService, telemetryService, promptsService, toolsService, chatModeService, chatLayoutService, chatEntitlementService, chatSessionsService, agentSessionsService, chatTodoListService, contextService, lifecycleService) {
    super();
    this.viewOptions = viewOptions;
    this.styles = styles;
    this.codeEditorService = codeEditorService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.chatWidgetService = chatWidgetService;
    this.contextMenuService = contextMenuService;
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
    this.contextService = contextService;
    this.lifecycleService = lifecycleService;
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
    this._onWillMaybeChangeHeight = new Emitter();
    this.onWillMaybeChangeHeight = this._onWillMaybeChangeHeight.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidChangeContentHeight = new Emitter();
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidChangeEmptyState = this._register(new Emitter());
    this.onDidChangeEmptyState = this._onDidChangeEmptyState.event;
    this.contribs = [];
    this.visibilityTimeoutDisposable = this._register(new MutableDisposable());
    this.visibilityAnimationFrameDisposable = this._register(new MutableDisposable());
    this.scrollAnimationFrameDisposable = this._register(new MutableDisposable());
    this.inputPartDisposable = this._register(new MutableDisposable());
    this.inlineInputPartDisposable = this._register(new MutableDisposable());
    this.recentlyRestoredCheckpoint = false;
    this.settingChangeCounter = 0;
    this.welcomePart = this._register(new MutableDisposable());
    this.visibleChangeCount = 0;
    this._visible = false;
    this.previousTreeScrollHeight = 0;
    this.scrollLock = true;
    this._isRenderingWelcome = false;
    this._attachmentCapabilities = supportsAllAttachments;
    this.promptDescriptionsCache = /* @__PURE__ */ new Map();
    this.promptUriCache = /* @__PURE__ */ new Map();
    this._isLoadingPromptDescriptions = false;
    this._mostRecentlyFocusedItemIndex = -1;
    this.viewModelDisposables = this._register(new DisposableStore());
    this._editingSession = observableValue(this, void 0);
    this._lockedToCodingAgentContextKey = ChatContextKeys.lockedToCodingAgent.bindTo(this.contextKeyService);
    this._agentSupportsAttachmentsContextKey = ChatContextKeys.agentSupportsAttachments.bindTo(this.contextKeyService);
    this._sessionIsEmptyContextKey = ChatContextKeys.chatSessionIsEmpty.bindTo(this.contextKeyService);
    this.viewContext = viewContext ?? {};
    const viewModelObs = observableFromEvent(this, this.onDidChangeViewModel, () => this.viewModel);
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
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.renderRelatedFiles")) {
        this.input.renderChatRelatedFiles();
      }
      if (e.affectsConfiguration(ChatConfiguration.EditRequests) || e.affectsConfiguration(ChatConfiguration.CheckpointsEnabled)) {
        this.settingChangeCounter++;
        this.onDidChangeItems();
      }
    }));
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
    this._register(codeEditorService.registerCodeEditorOpenHandler(async (input, _source, _sideBySide) => {
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
      for (const codeBlockPart of this.renderer.editorsInUse()) {
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
  get input() {
    return this.viewModel?.editing && this.configurationService.getValue("chat.editRequests") !== "input" ? this.inlineInputPart : this.inputPart;
  }
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
    return this.input.inputPartHeight.get() + this.tree.contentHeight + this.chatSuggestNextWidget.height;
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
    const scrollDownButton = this._register(new Button(this.listContainer, {
      supportIcons: true,
      buttonBackground: asCssVariable(buttonSecondaryBackground),
      buttonForeground: asCssVariable(buttonSecondaryForeground),
      buttonHoverBackground: asCssVariable(buttonSecondaryHoverBackground)
    }));
    scrollDownButton.element.classList.add("chat-scroll-down");
    scrollDownButton.label = `$(${Codicon.chevronDown.id})`;
    scrollDownButton.setTitle(localize("scrollDownButtonLabel", "Scroll down"));
    this._register(scrollDownButton.onDidClick(() => {
      this.scrollLock = true;
      this.scrollToEnd();
    }));
    this._register(autorun((reader) => {
      const fontFamily = this.chatLayoutService.fontFamily.read(reader);
      const fontSize = this.chatLayoutService.fontSize.read(reader);
      this.container.style.setProperty("--vscode-chat-font-family", fontFamily);
      this.container.style.fontSize = `${fontSize}px`;
      if (this.visible) {
        this.tree.rerender();
      }
    }));
    this._register(Event.runAndSubscribe(this.editorOptions.onDidChange, () => this.onDidStyleChange()));
    if (this.viewModel) {
      this.onDidChangeItems();
      this.scrollToEnd();
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
  scrollToEnd() {
    if (this.lastItem) {
      const offset = Math.max(this.lastItem.currentRenderedHeight ?? 0, 1e6);
      if (this.tree.hasElement(this.lastItem)) {
        this.tree.reveal(this.lastItem, offset);
      }
    }
  }
  focusInput() {
    this.input.focus();
    this._onDidFocus.fire();
  }
  hasInputFocus() {
    return this.input.hasFocus();
  }
  refreshParsedInput() {
    if (!this.viewModel) {
      return;
    }
    const previous = this.parsedChatRequest;
    this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionResource, this.getInput(), this.location, { selectedAgent: this._lastSelectedAgent, mode: this.input.currentModeKind });
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
      const treeItems = (this.viewModel?.getItems() ?? []).map((item) => {
        return {
          element: item,
          collapsed: false,
          collapsible: false
        };
      });
      if (treeItems.length > 0) {
        this.updateChatViewVisibility();
      } else {
        this.renderWelcomeViewContentIfNeeded();
      }
      this._onWillMaybeChangeHeight.fire();
      this.lastItem = treeItems.at(-1)?.element;
      ChatContextKeys.lastItemId.bindTo(this.contextKeyService).set(this.lastItem ? [this.lastItem.id] : []);
      this.tree.setChildren(null, treeItems, {
        diffIdentityProvider: {
          getId: /* @__PURE__ */ __name((element) => {
            return element.dataId + // Ensure re-rendering an element once slash commands are loaded, so the colorization can be applied.
            `${isRequestVM(element)}${isResponseVM(element) && element.renderData ? `_${this.visibleChangeCount}` : ""}` + // Re-render once content references are loaded
            (isResponseVM(element) ? `_${element.contentReferences.length}` : "") + // Re-render if element becomes hidden due to undo/redo
            `_${element.shouldBeRemovedOnSend ? `${element.shouldBeRemovedOnSend.afterUndoStop || "1"}` : "0"}_${this.viewModel?.editing ? "1" : "0"}_${this.viewModel?.model.checkpoint ? "1" : "0"}_setting${this.settingChangeCounter || "0"}` + // Rerender request if we got new content references in the response
            // since this may change how we render the corresponding attachments in the request
            (isRequestVM(element) && element.contentReferences ? `_${element.contentReferences?.length}` : "");
          }, "getId")
        }
      });
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
    if (!this.viewModel) {
      return;
    }
    const numItems = this.viewModel.getItems().length;
    dom.setVisibility(numItems === 0, this.welcomeMessageContainer);
    dom.setVisibility(numItems !== 0, this.listContainer);
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
      const generateInstructionsCommand = "workbench.action.chat.generateInstructions";
      return new MarkdownString(localize("chatWidget.instructions", "[Generate Agent Instructions]({0}) to onboard AI onto your codebase.", `command:${generateInstructionsCommand}`), { isTrusted: { enabledCommands: [generateInstructionsCommand] } });
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
      const useCopilotInstructionsFiles = this.configurationService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES);
      const useAgentMd = this.configurationService.getValue(PromptsConfig.USE_AGENT_MD);
      if (!useCopilotInstructionsFiles && !useAgentMd) {
        return true;
      }
      return (await this.promptsService.listCopilotInstructionsMDs(CancellationToken.None)).length > 0 || // Note: only checking for AGENTS.md files at the root folder, not ones in subfolders.
      (await this.promptsService.listAgentMDs(CancellationToken.None, false)).length > 0;
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
      additionalMessage,
      suggestedPrompts: this.getPromptFileSuggestions()
    };
  }
  getPromptFileSuggestions() {
    if (!this.chatEntitlementService.sentiment.installed) {
      const isEmpty = this.contextService.getWorkbenchState() === 1;
      if (isEmpty) {
        return [
          {
            icon: Codicon.vscode,
            label: localize("chatWidget.suggestedPrompts.gettingStarted", "Ask @vscode"),
            prompt: localize("chatWidget.suggestedPrompts.gettingStartedPrompt", "@vscode How do I change the theme to light mode?")
          },
          {
            icon: Codicon.newFolder,
            label: localize("chatWidget.suggestedPrompts.newProject", "Create Project"),
            prompt: localize("chatWidget.suggestedPrompts.newProjectPrompt", "Create a #new Hello World project in TypeScript")
          }
        ];
      } else {
        return [
          {
            icon: Codicon.debugAlt,
            label: localize("chatWidget.suggestedPrompts.buildWorkspace", "Build Workspace"),
            prompt: localize("chatWidget.suggestedPrompts.buildWorkspacePrompt", "How do I build this workspace?")
          },
          {
            icon: Codicon.gear,
            label: localize("chatWidget.suggestedPrompts.findConfig", "Show Config"),
            prompt: localize("chatWidget.suggestedPrompts.findConfigPrompt", "Where is the configuration for this project defined?")
          }
        ];
      }
    }
    const activeEditor = this.editorService.activeEditor;
    const resource = activeEditor ? EditorResourceAccessor.getOriginalUri(activeEditor) : void 0;
    const suggestions = PromptsConfig.getPromptFilesRecommendationsValue(this.configurationService, resource);
    if (!suggestions) {
      return [];
    }
    const result = [];
    const promptsToLoad = [];
    for (const [promptName] of Object.entries(suggestions)) {
      const description = this.promptDescriptionsCache.get(promptName);
      if (description === void 0) {
        promptsToLoad.push(promptName);
      }
    }
    if (promptsToLoad.length > 0 && !this._isLoadingPromptDescriptions) {
      this.loadPromptDescriptions(promptsToLoad);
      return [];
    }
    const promptsWithScores = [];
    for (const [promptName, condition] of Object.entries(suggestions)) {
      let score = 0;
      if (typeof condition === "boolean") {
        score = condition ? 1 : 0;
      } else if (typeof condition === "string") {
        try {
          const whenClause = ContextKeyExpr.deserialize(condition);
          if (whenClause) {
            const allEditors = this.codeEditorService.listCodeEditors();
            if (allEditors.length > 0) {
              score = allEditors.reduce((count, editor) => {
                try {
                  const editorContext = this.contextKeyService.getContext(editor.getDomNode());
                  return count + (whenClause.evaluate(editorContext) ? 1 : 0);
                } catch (error) {
                  this.logService.warn("Failed to evaluate when clause for editor:", error);
                  return count;
                }
              }, 0);
            } else {
              score = this.contextKeyService.contextMatchesRules(whenClause) ? 1 : 0;
            }
          } else {
            score = 0;
          }
        } catch (error) {
          this.logService.warn("Failed to parse when clause for prompt file suggestion:", condition, error);
          score = 0;
        }
      }
      if (score > 0) {
        promptsWithScores.push({ promptName, condition, score });
      }
    }
    promptsWithScores.sort((a, b) => b.score - a.score);
    const topPrompts = promptsWithScores.slice(0, 5);
    for (const { promptName } of topPrompts) {
      const description = this.promptDescriptionsCache.get(promptName);
      const commandLabel = localize("chatWidget.promptFile.commandLabel", "{0}", promptName);
      const uri = this.promptUriCache.get(promptName);
      const descriptionText = description?.trim() ? description : void 0;
      result.push({
        icon: Codicon.run,
        label: commandLabel,
        description: descriptionText,
        prompt: `/${promptName} `,
        uri
      });
    }
    return result;
  }
  async loadPromptDescriptions(promptNames) {
    if (this._store.isDisposed) {
      return;
    }
    this._isLoadingPromptDescriptions = true;
    try {
      const promptCommands = await this.promptsService.getPromptSlashCommands(CancellationToken.None);
      let cacheUpdated = false;
      for (const promptCommand of promptCommands) {
        if (promptNames.includes(promptCommand.name)) {
          const description = promptCommand.description;
          if (description) {
            this.promptDescriptionsCache.set(promptCommand.name, description);
            cacheUpdated = true;
          } else {
            this.promptDescriptionsCache.set(promptCommand.name, "");
            cacheUpdated = true;
          }
        }
      }
      if (cacheUpdated) {
        this.renderWelcomeViewContentIfNeeded();
      }
    } catch (error) {
      this.logService.warn("Failed to load specific prompt descriptions:", error);
    } finally {
      this._isLoadingPromptDescriptions = false;
    }
  }
  async renderChatEditingSessionState() {
    if (!this.input) {
      return;
    }
    this.input.renderChatEditingSessionState(this._editingSession.get() ?? null);
  }
  async renderFollowups() {
    if (this.lastItem && isResponseVM(this.lastItem) && this.lastItem.isComplete) {
      this.input.renderFollowups(this.lastItem.replyFollowups, this.lastItem);
    } else {
      this.input.renderFollowups(void 0, void 0);
    }
    if (this.bodyDimension) {
      this.layout(this.bodyDimension.height, this.bodyDimension.width);
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
          agent: currentMode.id,
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
    const fromAgent = currentMode?.id ?? "";
    this.telemetryService.publicLog2("chat.handoffClicked", {
      fromAgent,
      toAgent: agentId || handoff.agent || "",
      hasPrompt: Boolean(promptToUse),
      autoSend: Boolean(handoff.send)
    });
    if (agentId) {
      this.input.setValue(`@${agentId} ${promptToUse}`, false);
      this.input.focus();
      this.acceptInput().catch((e) => this.logService.error("Failed to handle handoff continueOn", e));
    } else if (handoff.agent) {
      this._switchToAgentByName(handoff.agent);
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
    try {
      await this._handleDelegationExit();
    } catch (e) {
      this.logService.error("Failed to handle delegation exit", e);
    }
  }
  _shouldExitAfterDelegation(sourceAgent, targetAgent) {
    if (!targetAgent) {
      return false;
    }
    if (!this.configurationService.getValue(ChatConfiguration.ExitAfterDelegation)) {
      return false;
    }
    if (sourceAgent && sourceAgent.id === targetAgent.id) {
      return false;
    }
    if (!isIChatViewViewContext(this.viewContext)) {
      return false;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(targetAgent.id);
    if (!contribution) {
      return false;
    }
    if (contribution.canDelegate !== true) {
      return false;
    }
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
      return;
    }
    const parentSessionResource = viewModel.sessionResource;
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
      await this.clear();
      this.archiveLocalParentSession(parentSessionResource);
      return;
    }
    const shouldClear = await new Promise((resolve) => {
      const disposable = viewModel.onDidChange(() => {
        const result = checkIfShouldClear();
        if (result) {
          cleanup();
          resolve(true);
        }
      });
      const timeout2 = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 3e4);
      const cleanup = /* @__PURE__ */ __name(() => {
        clearTimeout(timeout2);
        disposable.dispose();
      }, "cleanup");
    });
    if (shouldClear) {
      await this.clear();
      this.archiveLocalParentSession(parentSessionResource);
    }
  }
  async archiveLocalParentSession(sessionResource) {
    if (sessionResource.scheme !== Schemas.vscodeLocalChatSession) {
      return;
    }
    await this.chatService.getSession(sessionResource)?.editingSession?.accept();
    const session = this.agentSessionsService.getSession(sessionResource);
    session?.setArchived(true);
  }
  setVisible(visible) {
    const wasVisible = this._visible;
    this._visible = visible;
    this.visibleChangeCount++;
    this.renderer.setVisible(visible);
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
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.contextKeyService])));
    const delegate = scopedInstantiationService.createInstance(ChatListDelegate, this.viewOptions.defaultElementHeight ?? 200);
    const rendererDelegate = {
      getListLength: /* @__PURE__ */ __name(() => this.tree.getNode(null).visibleChildrenCount, "getListLength"),
      onDidScroll: this.onDidScroll,
      container: listContainer,
      currentChatMode: /* @__PURE__ */ __name(() => this.input.currentModeKind, "currentChatMode")
    };
    const overflowWidgetsContainer = document.createElement("div");
    overflowWidgetsContainer.classList.add("chat-overflow-widget-container", "monaco-editor");
    listContainer.append(overflowWidgetsContainer);
    this.renderer = this._register(scopedInstantiationService.createInstance(ChatListItemRenderer, this.editorOptions, options, rendererDelegate, this._codeBlockModelCollection, overflowWidgetsContainer, this.viewModel));
    this._register(this.renderer.onDidClickRequest(async (item) => {
      this.clickedRequest(item);
    }));
    this._register(this.renderer.onDidRerender((item) => {
      if (isRequestVM(item.currentElement) && this.configurationService.getValue("chat.editRequests") !== "input") {
        if (!item.rowContainer.contains(this.inputContainer)) {
          item.rowContainer.appendChild(this.inputContainer);
        }
        this.input.focus();
      }
    }));
    this._register(this.renderer.onDidDispose((item) => {
      this.focusedInputDOM.appendChild(this.inputContainer);
      this.input.focus();
    }));
    this._register(this.renderer.onDidFocusOutside(() => {
      this.finishedEditing();
    }));
    this._register(this.renderer.onDidClickFollowup((item) => {
      this.acceptInput(item.message);
    }));
    this._register(this.renderer.onDidClickRerunWithAgentOrCommandDetection((e) => {
      const request = this.chatService.getSession(e.sessionResource)?.getRequests().find((candidate) => candidate.id === e.requestId);
      if (request) {
        const options2 = {
          noCommandDetection: true,
          attempt: request.attempt + 1,
          location: this.location,
          userSelectedModelId: this.input.currentLanguageModel,
          modeInfo: this.input.currentModeInfo
        };
        this.chatService.resendRequest(request, options2).catch((e2) => this.logService.error("FAILED to rerun request", e2));
      }
    }));
    this.tree = this._register(scopedInstantiationService.createInstance(WorkbenchObjectTree, "Chat", listContainer, delegate, [this.renderer], {
      identityProvider: { getId: /* @__PURE__ */ __name((e) => e.id, "getId") },
      horizontalScrolling: false,
      alwaysConsumeMouseWheel: false,
      supportDynamicHeights: true,
      hideTwistiesOfChildlessElements: true,
      accessibilityProvider: this.instantiationService.createInstance(ChatAccessibilityProvider),
      keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => isRequestVM(e) ? e.message : isResponseVM(e) ? e.response.value : "", "getKeyboardNavigationLabel") },
      // TODO
      setRowLineHeight: false,
      filter: this.viewOptions.filter ? { filter: this.viewOptions.filter.bind(this.viewOptions) } : void 0,
      scrollToActiveElement: true,
      overrideStyles: {
        listFocusBackground: this.styles.listBackground,
        listInactiveFocusBackground: this.styles.listBackground,
        listActiveSelectionBackground: this.styles.listBackground,
        listFocusAndSelectionBackground: this.styles.listBackground,
        listInactiveSelectionBackground: this.styles.listBackground,
        listHoverBackground: this.styles.listBackground,
        listBackground: this.styles.listBackground,
        listFocusForeground: this.styles.listForeground,
        listHoverForeground: this.styles.listForeground,
        listInactiveFocusForeground: this.styles.listForeground,
        listInactiveSelectionForeground: this.styles.listForeground,
        listActiveSelectionForeground: this.styles.listForeground,
        listFocusAndSelectionForeground: this.styles.listForeground,
        listActiveSelectionIconForeground: void 0,
        listInactiveSelectionIconForeground: void 0
      }
    }));
    this._register(this.tree.onDidChangeFocus(() => {
      const focused = this.tree.getFocus();
      if (focused && focused.length > 0) {
        const focusedItem = focused[0];
        const items = this.tree.getNode(null).children;
        const idx = items.findIndex((i) => i.element === focusedItem);
        if (idx !== -1) {
          this._mostRecentlyFocusedItemIndex = idx;
        }
      }
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.tree.onDidChangeContentHeight(() => {
      this.onDidChangeTreeContentHeight();
    }));
    this._register(this.renderer.onDidChangeItemHeight((e) => {
      if (this.tree.hasElement(e.element) && this.visible) {
        this.tree.updateElementHeight(e.element, e.height);
      }
    }));
    this._register(this.tree.onDidFocus(() => {
      this._onDidFocus.fire();
    }));
    this._register(this.tree.onDidScroll(() => {
      this._onDidScroll.fire();
      const isScrolledDown = this.tree.scrollTop >= this.tree.scrollHeight - this.tree.renderHeight - 2;
      this.container.classList.toggle("show-scroll-down", !isScrolledDown && !this.scrollLock);
    }));
  }
  startEditing(requestId) {
    const editedRequest = this.renderer.getTemplateDataForRequestId(requestId);
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
        if (addedContextIds.has(entry.id) || isWorkspaceVariableEntry(entry)) {
          return;
        }
        if ((isPromptFileVariableEntry(entry) || isPromptTextVariableEntry(entry)) && entry.automaticallyAdded) {
          return;
        }
        addedContextIds.add(entry.id);
        currentContext.push(entry);
      }, "addToContext");
      for (let i = requests.length - 1; i >= 0; i -= 1) {
        const request = requests[i];
        if (request.id === currentElement.id) {
          request.setShouldBeBlocked(false);
          request.attachedContext?.forEach(addToContext);
          currentElement.variables.forEach(addToContext);
        }
      }
      this.viewModel?.setEditing(currentElement);
      if (item?.contextKeyService) {
        ChatContextKeys.currentlyEditing.bindTo(item.contextKeyService).set(true);
      }
      const isInput = this.configurationService.getValue("chat.editRequests") === "input";
      this.inputPart?.setEditing(!!this.viewModel?.editing && isInput);
      if (!isInput) {
        const rowContainer = item.rowContainer;
        this.inputContainer = dom.$(".chat-edit-input-container");
        rowContainer.appendChild(this.inputContainer);
        this.createInput(this.inputContainer);
        this.input.setChatMode(this.inputPart.currentModeObs.get().id);
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
      this.renderer.updateItemHeightOnRender(currentElement, item);
      this.onDidChangeItems();
      this.input.inputEditor.focus();
      this._register(this.inputPart.onDidClickOverlay(() => {
        if (this.viewModel?.editing && this.configurationService.getValue("chat.editRequests") !== "input") {
          this.finishedEditing();
        }
      }));
      if (!isInput) {
        this._register(this.inlineInputPart.inputEditor.onDidChangeModelContent(() => {
          this.scrollToCurrentItem(currentElement);
        }));
        this._register(this.inlineInputPart.inputEditor.onDidChangeCursorSelection((e) => {
          this.scrollToCurrentItem(currentElement);
        }));
      }
    }
    this.telemetryService.publicLog2("chat.startEditingRequests", {
      editRequestType: this.configurationService.getValue("chat.editRequests")
    });
  }
  finishedEditing(completedEdit) {
    const editedRequest = this.renderer.getTemplateDataForRequestId(this.viewModel?.editing?.id);
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
      const currentModel = this.input.selectedLanguageModel;
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
    this.inputPart?.setEditing(!!this.viewModel?.editing && isInput);
    this.onDidChangeItems();
    if (editedRequest?.currentElement) {
      this.renderer.updateItemHeightOnRender(editedRequest.currentElement, editedRequest);
    }
    this.telemetryService.publicLog2("chat.editRequestsFinished", {
      editRequestType: this.configurationService.getValue("chat.editRequests"),
      editCanceled: !completedEdit
    });
    this.inputPart.focus();
  }
  scrollToCurrentItem(currentElement) {
    if (this.viewModel?.editing && currentElement) {
      const element = currentElement;
      if (!this.tree.hasElement(element)) {
        return;
      }
      const relativeTop = this.tree.getRelativeTop(element);
      if (relativeTop === null || relativeTop < 0 || relativeTop > 1) {
        this.tree.reveal(element, 0);
      }
    }
  }
  onContextMenu(e) {
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
    const selected = e.element;
    const target = e.browserEvent.target;
    const isKatexElement = target.closest(`.${katexContainerClassName}`) !== null;
    const scopedContextKeyService = this.contextKeyService.createOverlay([
      [ChatContextKeys.responseIsFiltered.key, isResponseVM(selected) && !!selected.errorDetails?.responseIsFiltered],
      [ChatContextKeys.isKatexMathElement.key, isKatexElement]
    ]);
    this.contextMenuService.showContextMenu({
      menuId: MenuId.ChatContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: scopedContextKeyService,
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActionsContext: /* @__PURE__ */ __name(() => selected, "getActionsContext")
    });
  }
  onDidChangeTreeContentHeight() {
    if (this.tree.scrollHeight !== this.previousTreeScrollHeight) {
      const lastItem = this.viewModel?.getItems().at(-1);
      const lastResponseIsRendering = isResponseVM(lastItem) && lastItem.renderData;
      if (!lastResponseIsRendering || this.scrollLock) {
        const lastElementWasVisible = this.tree.scrollTop + this.tree.renderHeight >= this.previousTreeScrollHeight - 2;
        if (lastElementWasVisible) {
          this.scrollAnimationFrameDisposable.value = dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
            this.scrollToEnd();
          }, 0);
        }
      }
    }
    this.previousTreeScrollHeight = this.tree.scrollHeight;
    this._onDidChangeContentHeight.fire();
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
      sessionTypePickerDelegate: this.viewOptions.sessionTypePickerDelegate
    };
    if (this.viewModel?.editing) {
      const editedRequest = this.renderer.getTemplateDataForRequestId(this.viewModel?.editing?.id);
      const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, editedRequest?.contextKeyService])));
      this.inlineInputPartDisposable.value = scopedInstantiationService.createInstance(ChatInputPart, this.location, commonConfig, this.styles, true);
    } else {
      this.inputPartDisposable.value = this.instantiationService.createInstance(ChatInputPart, this.location, commonConfig, this.styles, false);
    }
    this.input.render(container, "", this);
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
    this._register(autorun((reader) => {
      this.input.inputPartHeight.read(reader);
      const editedRequest = this.renderer.getTemplateDataForRequestId(this.viewModel?.editing?.id);
      if (isRequestVM(editedRequest?.currentElement) && this.viewModel?.editing) {
        this.renderer.updateItemHeightOnRender(editedRequest?.currentElement, editedRequest);
      }
      if (this.bodyDimension) {
        this.layout(this.bodyDimension.height, this.bodyDimension.width);
      }
      this._onDidChangeContentHeight.fire();
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
    this._register(autorun((r) => {
      const toolSetIds = /* @__PURE__ */ new Set();
      const toolIds = /* @__PURE__ */ new Set();
      for (const [entry, enabled] of this.input.selectedToolsModel.entriesMap.read(r)) {
        if (enabled) {
          if (entry instanceof ToolSet) {
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
    this._codeBlockModelCollection.clear();
    this.container.setAttribute("data-session-id", model.sessionId);
    this.viewModel = this.instantiationService.createInstance(ChatViewModel, model, this._codeBlockModelCollection);
    this.inputPart.setInputModel(model.inputModel, model.getRequests().length === 0);
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
        this.scrollToEnd();
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
      }
    }));
    if (this.tree && this.visible) {
      this.onDidChangeItems();
      this.scrollToEnd();
    }
    this.renderer.updateViewModel(this.viewModel);
    this.updateChatInputContext();
    this.input.renderChatTodoListWidget(this.viewModel.sessionResource);
  }
  getFocus() {
    return this.tree.getFocus()[0] ?? void 0;
  }
  reveal(item, relativeTop) {
    this.tree.reveal(item, relativeTop);
  }
  focus(item) {
    const items = this.tree.getNode(null).children;
    const node = items.find((i) => i.element?.id === item.id);
    if (!node) {
      return;
    }
    this._mostRecentlyFocusedItemIndex = items.indexOf(node);
    this.tree.setFocus([node.element]);
    this.tree.domFocus();
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
    this.renderer.updateOptions({ restorable: false, editable: false, noFooter: true, progressMessageAtBottomOfResponse: true });
    if (this.visible) {
      this.tree.rerender();
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
    this.inputEditor.updateOptions({ placeholder: void 0 });
    this.renderer.updateOptions({ restorable: true, editable: true, noFooter: false, progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "progressMessageAtBottomOfResponse") });
    if (this.visible) {
      this.tree.rerender();
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
  async _acceptInput(query, options) {
    if (this.viewModel?.model.requestInProgress.get()) {
      return;
    }
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
    this._onDidAcceptInput.fire();
    this.scrollLock = this.isLockedToCodingAgent || !!checkModeOption(this.input.currentModeKind, this.viewOptions.autoScroll);
    const editorValue = this.getInput();
    const requestInputs = {
      input: !query ? editorValue : query.query,
      attachedContext: options?.enableImplicitContext === false ? this.input.getAttachedContext(this.viewModel.sessionResource) : this.input.getAttachedAndImplicitContext(this.viewModel.sessionResource)
    };
    const isUserQuery = !query;
    if (this.viewModel?.editing) {
      this.finishedEditing(true);
      this.viewModel.model?.setCheckpoint(void 0);
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
    this.chatService.cancelCurrentRequestForSession(this.viewModel.sessionResource);
    if (this.currentRequest) {
      await Promise.race([this.currentRequest, timeout(1e3)]);
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
    if (this.viewModel.sessionResource) {
      this.chatAccessibilityService.acceptRequest(this._viewModel.sessionResource);
    }
    const result = await this.chatService.sendRequest(this.viewModel.sessionResource, requestInputs.input, {
      userSelectedModelId: this.input.currentLanguageModel,
      location: this.location,
      locationData: this._location.resolveData?.(),
      parserContext: { selectedAgent: this._lastSelectedAgent, mode: this.input.currentModeKind },
      attachedContext: requestInputs.attachedContext.asArray(),
      noCommandDetection: options?.noCommandDetection,
      ...this.getModeRequestOptions(),
      modeInfo: this.input.currentModeInfo,
      agentIdSilent: this._lockedAgent?.id
    });
    if (!result) {
      this.chatAccessibilityService.disposeRequest(this.viewModel.sessionResource);
      return;
    }
    this.updateChatViewVisibility();
    this.input.acceptInput(options?.storeToHistory ?? isUserQuery);
    this._onDidSubmitAgent.fire({ agent: result.agent, slashCommand: result.slashCommand });
    this.handleDelegationExitIfNeeded(this._lockedAgent, result.agent);
    this.currentRequest = result.responseCompletePromise.then(() => {
      const responses = this.viewModel?.getItems().filter(isResponseVM);
      const lastResponse = responses?.[responses.length - 1];
      this.chatAccessibilityService.acceptResponse(this, this.container, lastResponse, this.viewModel?.sessionResource, options?.isVoiceInput);
      if (lastResponse?.result?.nextQuestion) {
        const { prompt, participant, command } = lastResponse.result.nextQuestion;
        const question = formatChatQuestion(this.chatAgentService, this.location, prompt, participant, command);
        if (question) {
          this.input.setValue(question, false);
        }
      }
      this.currentRequest = void 0;
    });
    return result.responseCreatedPromise;
  }
  getModeRequestOptions() {
    return {
      modeInfo: this.input.currentModeInfo,
      userSelectedTools: this.input.selectedToolsModel.userSelectedTools
    };
  }
  getCodeBlockInfosForResponse(response) {
    return this.renderer.getCodeBlockInfosForResponse(response);
  }
  getCodeBlockInfoForEditor(uri) {
    return this.renderer.getCodeBlockInfoForEditor(uri);
  }
  getFileTreeInfosForResponse(response) {
    return this.renderer.getFileTreeInfosForResponse(response);
  }
  getLastFocusedFileTreeForResponse(response) {
    return this.renderer.getLastFocusedFileTreeForResponse(response);
  }
  focusResponseItem(lastFocused) {
    if (!this.viewModel) {
      return;
    }
    const items = this.tree.getNode(null).children;
    let item;
    if (lastFocused) {
      item = items[this._mostRecentlyFocusedItemIndex] ?? items[items.length - 1];
    } else {
      item = items[items.length - 1];
    }
    if (!item) {
      return;
    }
    this.tree.setFocus([item.element]);
    this.tree.domFocus();
  }
  layout(height, width) {
    width = Math.min(width, this.viewOptions.renderStyle === "minimal" ? width : 950);
    const heightUpdated = this.bodyDimension && this.bodyDimension.height !== height;
    this.bodyDimension = new dom.Dimension(width, height);
    if (this.viewModel?.editing) {
      this.inlineInputPart?.layout(width);
    }
    this.inputPart.layout(width);
    const inputHeight = this.inputPart.inputPartHeight.get();
    const chatSuggestNextWidgetHeight = this.chatSuggestNextWidget.height;
    const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight - 2;
    const lastItem = this.viewModel?.getItems().at(-1);
    const contentHeight = Math.max(0, height - inputHeight - chatSuggestNextWidgetHeight);
    if (this.viewOptions.renderStyle === "compact" || this.viewOptions.renderStyle === "minimal") {
      this.listContainer.style.removeProperty("--chat-current-response-min-height");
    } else {
      this.listContainer.style.setProperty("--chat-current-response-min-height", contentHeight * 0.75 + "px");
      if (heightUpdated && lastItem && this.visible && this.tree.hasElement(lastItem)) {
        this.tree.updateElementHeight(lastItem, void 0);
      }
    }
    this.tree.layout(contentHeight, width);
    this.welcomeMessageContainer.style.height = `${contentHeight}px`;
    this.renderer.layout(width);
    const lastResponseIsRendering = isResponseVM(lastItem) && lastItem.renderData;
    if (lastElementVisible && (!lastResponseIsRendering || checkModeOption(this.input.currentModeKind, this.viewOptions.autoScroll))) {
      this.scrollToEnd();
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
    this._register(this.renderer.onDidChangeItemHeight(() => this.layoutDynamicChatTreeItemMode()));
    const mutableDisposable = this._register(new MutableDisposable());
    this._register(this.tree.onDidScroll((e) => {
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
        const inputPartHeight = this.input.inputPartHeight.get();
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
    const inputHeight = this.input.inputPartHeight.get();
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
      this.scrollToEnd();
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
      const enablementMap = this.toolsService.toToolAndToolSetEnablementMap(tools, Target.VSCode);
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
    const enabledTools = this.input.currentModeKind === ChatModeKind.Agent ? this.input.selectedToolsModel.entriesMap.get() : void 0;
    const computer = this.instantiationService.createInstance(ComputeAutomaticInstructions, enabledTools);
    await computer.collect(attachedContext, CancellationToken.None);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.tree.delegateScrollFromMouseWheelEvent(browserEvent);
  }
};
ChatWidget = ChatWidget_1 = __decorate([
  __param(4, ICodeEditorService),
  __param(5, IEditorService),
  __param(6, IConfigurationService),
  __param(7, IContextKeyService),
  __param(8, IInstantiationService),
  __param(9, IChatService),
  __param(10, IChatAgentService),
  __param(11, IChatWidgetService),
  __param(12, IContextMenuService),
  __param(13, IChatAccessibilityService),
  __param(14, ILogService),
  __param(15, IThemeService),
  __param(16, IChatSlashCommandService),
  __param(17, IChatEditingService),
  __param(18, ITelemetryService),
  __param(19, IPromptsService),
  __param(20, ILanguageModelToolsService),
  __param(21, IChatModeService),
  __param(22, IChatLayoutService),
  __param(23, IChatEntitlementService),
  __param(24, IChatSessionsService),
  __param(25, IAgentSessionsService),
  __param(26, IChatTodoListService),
  __param(27, IWorkspaceContextService),
  __param(28, ILifecycleService)
], ChatWidget);
export {
  ChatWidget,
  isQuickChat
};
//# sourceMappingURL=chatWidget.js.map
