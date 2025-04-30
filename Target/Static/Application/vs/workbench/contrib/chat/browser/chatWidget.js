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
import * as dom from "../../../../base/browser/dom.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { pick } from "../../../../base/common/arrays.js";
import { assert } from "../../../../base/common/assert.js";
import { disposableTimeout, timeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { combinedDisposable, Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { autorun, autorunWithStore, observableFromEvent, observableValue } from "../../../../base/common/observable.js";
import { basename, extUri, isEqual } from "../../../../base/common/resources.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { isLocation } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { WorkbenchObjectTree } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { buttonSecondaryBackground, buttonSecondaryForeground, buttonSecondaryHoverBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable } from "../../../../platform/theme/common/colorUtils.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { checkModeOption } from "../common/chat.js";
import { IChatAgentService } from "../common/chatAgents.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { applyingChatEditsFailedContextKey, decidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey, IChatEditingService, inChatEditingSessionContextKey } from "../common/chatEditingService.js";
import { chatAgentLeader, ChatRequestAgentPart, ChatRequestDynamicVariablePart, ChatRequestSlashPromptPart, ChatRequestToolPart, chatSubcommandLeader, formatChatQuestion } from "../common/chatParserTypes.js";
import { ChatRequestParser } from "../common/chatRequestParser.js";
import { IChatService } from "../common/chatService.js";
import { IChatSlashCommandService } from "../common/chatSlashCommands.js";
import { ChatViewModel, isRequestVM, isResponseVM } from "../common/chatViewModel.js";
import { CodeBlockModelCollection } from "../common/codeBlockModelCollection.js";
import { ChatMode } from "../common/constants.js";
import { ILanguageModelToolsService } from "../common/languageModelToolsService.js";
import { IPromptsService } from "../common/promptSyntax/service/types.js";
import { ToggleAgentModeActionId } from "./actions/chatExecuteActions.js";
import { IChatAccessibilityService, IChatWidgetService } from "./chat.js";
import { ChatAccessibilityProvider } from "./chatAccessibilityProvider.js";
import { isPromptFileChatVariable, toChatVariable } from "./chatAttachmentModel/chatPromptAttachmentsCollection.js";
import { ChatInputPart } from "./chatInputPart.js";
import { ChatListDelegate, ChatListItemRenderer } from "./chatListRenderer.js";
import { ChatEditorOptions } from "./chatOptions.js";
import "./media/chat.css";
import "./media/chatAgentHover.css";
import "./media/chatViewWelcome.css";
import { ChatViewWelcomePart } from "./viewsWelcome/chatViewWelcomeController.js";
const $ = dom.$;
function isQuickChat(widget) {
  return "viewContext" in widget && "isQuickChat" in widget.viewContext && Boolean(widget.viewContext.isQuickChat);
}
__name(isQuickChat, "isQuickChat");
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
    this.viewModelDisposables.clear();
    this._viewModel = viewModel;
    if (viewModel) {
      this.viewModelDisposables.add(viewModel);
      this.logService.debug("ChatWidget#setViewModel: have viewModel");
      if (viewModel.model.editingSessionObs) {
        this.logService.debug("ChatWidget#setViewModel: waiting for editing session");
        viewModel.model.editingSessionObs?.promise.then(() => {
          this._isReady = true;
          this._onDidBecomeReady.fire();
        });
      } else {
        this._isReady = true;
        this._onDidBecomeReady.fire();
      }
    } else {
      this.logService.debug("ChatWidget#setViewModel: no viewModel");
    }
    this._onDidChangeViewModel.fire();
  }
  get viewModel() {
    return this._viewModel;
  }
  get parsedInput() {
    if (this.parsedChatRequest === void 0) {
      if (!this.viewModel) {
        return { text: "", parts: [] };
      }
      this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionId, this.getInput(), this.location, { selectedAgent: this._lastSelectedAgent, mode: this.input.currentMode });
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
  constructor(location, _viewContext, viewOptions, styles, codeEditorService, configurationService, contextKeyService, instantiationService, chatService, chatAgentService, chatWidgetService, contextMenuService, chatAccessibilityService, logService, themeService, chatSlashCommandService, chatEditingService, telemetryService, promptsService, commandService, toolsService) {
    super();
    this.viewOptions = viewOptions;
    this.styles = styles;
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
    this.commandService = commandService;
    this.toolsService = toolsService;
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
    this._onDidClear = this._register(new Emitter());
    this.onDidClear = this._onDidClear.event;
    this._onDidAcceptInput = this._register(new Emitter());
    this.onDidAcceptInput = this._onDidAcceptInput.event;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._onDidChangeParsedInput = this._register(new Emitter());
    this.onDidChangeParsedInput = this._onDidChangeParsedInput.event;
    this._onWillMaybeChangeHeight = new Emitter();
    this.onWillMaybeChangeHeight = this._onWillMaybeChangeHeight.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidChangeContentHeight = new Emitter();
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this.contribs = [];
    this.welcomePart = this._register(new MutableDisposable());
    this.visibleChangeCount = 0;
    this._visible = false;
    this.previousTreeScrollHeight = 0;
    this.scrollLock = true;
    this._isReady = false;
    this._onDidBecomeReady = this._register(new Emitter());
    this.viewModelDisposables = this._register(new DisposableStore());
    this._editingSession = observableValue(this, void 0);
    this.viewContext = _viewContext ?? {};
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
    this.isRequestPaused = ChatContextKeys.isRequestPaused.bindTo(contextKeyService);
    this.canRequestBePaused = ChatContextKeys.canRequestBePaused.bindTo(contextKeyService);
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
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.renderRelatedFiles")) {
        this.renderChatEditingSessionState();
      }
    }));
    this._register(autorunWithStore((r, store) => {
      const viewModel = viewModelObs.read(r);
      const sessions = chatEditingService.editingSessionsObs.read(r);
      const session = sessions.find((candidate) => candidate.chatSessionId === viewModel?.sessionId);
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
      store.add(session.onDidDispose(() => {
        this._editingSession.set(void 0, void 0);
        this.renderChatEditingSessionState();
      }));
      store.add(this.onDidChangeParsedInput(() => {
        this.renderChatEditingSessionState();
      }));
      store.add(this.inputEditor.onDidChangeModelContent(() => {
        if (this.getInput() === "") {
          this.refreshParsedInput();
          this.renderChatEditingSessionState();
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
  }
  set lastSelectedAgent(agent) {
    this.parsedChatRequest = void 0;
    this._lastSelectedAgent = agent;
    this._onDidChangeParsedInput.fire();
  }
  get lastSelectedAgent() {
    return this._lastSelectedAgent;
  }
  get supportsFileReferences() {
    return !!this.viewOptions.supportsFileReferences;
  }
  get input() {
    return this.inputPart;
  }
  get inputEditor() {
    return this.inputPart.inputEditor;
  }
  get inputUri() {
    return this.inputPart.inputUri;
  }
  get contentHeight() {
    return this.inputPart.contentHeight + this.tree.contentHeight;
  }
  get attachmentModel() {
    return this.inputPart.attachmentModel;
  }
  async waitForReady() {
    if (this._isReady) {
      this.logService.debug("ChatWidget#waitForReady: already ready");
      return;
    }
    this.logService.debug("ChatWidget#waitForReady: waiting for ready");
    await Event.toPromise(this._onDidBecomeReady.event);
    if (this.viewModel) {
      this.logService.debug("ChatWidget#waitForReady: ready");
    } else {
      this.logService.debug("ChatWidget#waitForReady: no viewModel");
    }
  }
  render(parent) {
    const viewId = "viewId" in this.viewContext ? this.viewContext.viewId : void 0;
    this.editorOptions = this._register(this.instantiationService.createInstance(ChatEditorOptions, viewId, this.styles.listForeground, this.styles.inputEditorBackground, this.styles.resultEditorBackground));
    const renderInputOnTop = this.viewOptions.renderInputOnTop ?? false;
    const renderFollowups = this.viewOptions.renderFollowups ?? !renderInputOnTop;
    const renderStyle = this.viewOptions.renderStyle;
    this.container = dom.append(parent, $(".interactive-session"));
    this.welcomeMessageContainer = dom.append(this.container, $(".chat-welcome-view-container", { style: "display: none" }));
    if (renderInputOnTop) {
      this.createInput(this.container, { renderFollowups, renderStyle });
      this.listContainer = dom.append(this.container, $(`.interactive-list`));
    } else {
      this.listContainer = dom.append(this.container, $(`.interactive-list`));
      this.createInput(this.container, { renderFollowups, renderStyle });
    }
    this.renderWelcomeViewContentIfNeeded();
    this.createList(this.listContainer, { ...this.viewOptions.rendererOptions, renderStyle });
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
    this._register(this.editorOptions.onDidChange(() => this.onDidStyleChange()));
    this.onDidStyleChange();
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
        if (part instanceof ChatRequestToolPart || part instanceof ChatRequestDynamicVariablePart) {
          const entry = part.toVariableEntry();
          newPromptAttachments.set(entry.id, entry);
          oldPromptAttachments.delete(entry.id);
        }
      }
      this.attachmentModel.updateContent(oldPromptAttachments, newPromptAttachments.values());
    }));
  }
  scrollToEnd() {
    if (this.lastItem) {
      const offset = Math.max(this.lastItem.currentRenderedHeight ?? 0, 1e6);
      this.tree.reveal(this.lastItem, offset);
    }
  }
  getContrib(id) {
    return this.contribs.find((c) => c.id === id);
  }
  focusInput() {
    this.inputPart.focus();
    this._onDidFocus.fire();
  }
  hasInputFocus() {
    return this.inputPart.hasFocus();
  }
  refreshParsedInput() {
    if (!this.viewModel) {
      return;
    }
    this.parsedChatRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(this.viewModel.sessionId, this.getInput(), this.location, { selectedAgent: this._lastSelectedAgent, mode: this.input.currentMode });
    this._onDidChangeParsedInput.fire();
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
  clear() {
    this.logService.debug("ChatWidget#clear");
    this._isReady = false;
    if (this._dynamicMessageLayoutData) {
      this._dynamicMessageLayoutData.enabled = true;
    }
    this._onDidClear.fire();
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
      this.renderWelcomeViewContentIfNeeded();
      this._onWillMaybeChangeHeight.fire();
      this.lastItem = treeItems.at(-1)?.element;
      ChatContextKeys.lastItemId.bindTo(this.contextKeyService).set(this.lastItem ? [this.lastItem.id] : []);
      this.tree.setChildren(null, treeItems, {
        diffIdentityProvider: {
          getId: /* @__PURE__ */ __name((element) => {
            return element.dataId + // Ensure re-rendering an element once slash commands are loaded, so the colorization can be applied.
            `${isRequestVM(element)}${isResponseVM(element) && element.renderData ? `_${this.visibleChangeCount}` : ""}` + // Re-render once content references are loaded
            (isResponseVM(element) ? `_${element.contentReferences.length}` : "") + // Re-render if element becomes hidden due to undo/redo
            `_${element.shouldBeRemovedOnSend ? `${element.shouldBeRemovedOnSend.afterUndoStop || "1"}` : "0"}` + // Rerender request if we got new content references in the response
            // since this may change how we render the corresponding attachments in the request
            (isRequestVM(element) && element.contentReferences ? `_${element.contentReferences?.length}` : "") + (isResponseVM(element) && element.model.isPaused.get() ? "_paused" : "");
          }, "getId")
        }
      });
      if (!skipDynamicLayout && this._dynamicMessageLayoutData) {
        this.layoutDynamicChatTreeItemMode();
      }
      if (this.lastItem && isResponseVM(this.lastItem) && this.lastItem.isComplete) {
        this.renderFollowups(this.lastItem.replyFollowups, this.lastItem);
      } else if (!treeItems.length && this.viewModel) {
        this.renderSampleQuestions();
      } else {
        this.renderFollowups(void 0);
      }
    }
  }
  renderWelcomeViewContentIfNeeded() {
    if (this.viewOptions.renderStyle === "compact" || this.viewOptions.renderStyle === "minimal") {
      return;
    }
    const numItems = this.viewModel?.getItems().length ?? 0;
    if (!numItems) {
      const welcomeContent = this.getWelcomeViewContent();
      dom.clearNode(this.welcomeMessageContainer);
      const tips = this.input.currentMode === ChatMode.Ask ? new MarkdownString(localize("chatWidget.tips", "{0} or type {1} to attach context\n\n{2} to chat with extensions\n\nType {3} to use commands", "$(attach)", "#", "$(mention)", "/"), { supportThemeIcons: true }) : new MarkdownString(localize("chatWidget.tips.withoutParticipants", "{0} or type {1} to attach context", "$(attach)", "#"), { supportThemeIcons: true });
      const defaultAgent = this.chatAgentService.getDefaultAgent(this.location, this.input.currentMode);
      const additionalMessage = defaultAgent?.metadata.additionalWelcomeMessage;
      this.welcomePart.value = this.instantiationService.createInstance(ChatViewWelcomePart, { ...welcomeContent, tips, additionalMessage }, {
        location: this.location,
        isWidgetAgentWelcomeViewContent: this.input?.currentMode === ChatMode.Agent
      });
      dom.append(this.welcomeMessageContainer, this.welcomePart.value.element);
    }
    if (this.viewModel) {
      dom.setVisibility(numItems === 0, this.welcomeMessageContainer);
      dom.setVisibility(numItems !== 0, this.listContainer);
    }
  }
  getWelcomeViewContent() {
    const baseMessage = localize("chatMessage", "Copilot is powered by AI, so mistakes are possible. Review output carefully before use.");
    if (this.input.currentMode === ChatMode.Ask) {
      return {
        title: localize("chatDescription", "Ask Copilot"),
        message: new MarkdownString(baseMessage),
        icon: Codicon.copilotLarge
      };
    } else if (this.input.currentMode === ChatMode.Edit) {
      return {
        title: localize("editsTitle", "Edit with Copilot"),
        message: new MarkdownString(localize("editsMessage", "Start your editing session by defining a set of files that you want to work with. Then ask Copilot for the changes you want to make.") + `

${baseMessage}`),
        icon: Codicon.copilotLarge
      };
    } else {
      return {
        title: localize("editsTitle", "Edit with Copilot"),
        message: new MarkdownString(localize("agentMessage", "Ask Copilot to edit your files in [agent mode]({0}). Copilot will automatically use multiple requests to pick files to edit, run terminal commands, and iterate on errors.", "https://aka.ms/vscode-copilot-agent") + `

${baseMessage}`),
        icon: Codicon.copilotLarge
      };
    }
  }
  async renderChatEditingSessionState() {
    if (!this.inputPart) {
      return;
    }
    this.inputPart.renderChatEditingSessionState(this._editingSession.get() ?? null);
    if (this.bodyDimension) {
      this.layout(this.bodyDimension.height, this.bodyDimension.width);
    }
  }
  renderSampleQuestions() {
    if (this.viewModel?.getItems().length === 0) {
      this.renderFollowups(this.input.currentMode === ChatMode.Ask ? this.viewModel.model.sampleQuestions : void 0);
    }
  }
  async renderFollowups(items, response) {
    this.inputPart.renderFollowups(items, response);
    if (this.bodyDimension) {
      this.layout(this.bodyDimension.height, this.bodyDimension.width);
    }
  }
  setVisible(visible) {
    const wasVisible = this._visible;
    this._visible = visible;
    this.visibleChangeCount++;
    this.renderer.setVisible(visible);
    this.input.setVisible(visible);
    if (visible) {
      this._register(disposableTimeout(() => {
        if (this._visible) {
          this.onDidChangeItems(true);
        }
      }, 0));
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
      currentChatMode: /* @__PURE__ */ __name(() => this.input.currentMode, "currentChatMode")
    };
    const overflowWidgetsContainer = document.createElement("div");
    overflowWidgetsContainer.classList.add("chat-overflow-widget-container", "monaco-editor");
    listContainer.append(overflowWidgetsContainer);
    this.renderer = this._register(scopedInstantiationService.createInstance(ChatListItemRenderer, this.editorOptions, options, rendererDelegate, this._codeBlockModelCollection, overflowWidgetsContainer));
    this._register(this.renderer.onDidClickFollowup((item) => {
      this.acceptInput(item.message);
    }));
    this._register(this.renderer.onDidClickRerunWithAgentOrCommandDetection((item) => {
      const request = this.chatService.getSession(item.sessionId)?.getRequests().find((candidate) => candidate.id === item.requestId);
      if (request) {
        const options2 = {
          noCommandDetection: true,
          attempt: request.attempt + 1,
          location: this.location,
          userSelectedModelId: this.input.currentLanguageModel,
          mode: this.input.currentMode
        };
        this.chatService.resendRequest(request, options2).catch((e) => this.logService.error("FAILED to rerun request", e));
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
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.tree.onDidChangeContentHeight(() => {
      this.onDidChangeTreeContentHeight();
    }));
    this._register(this.renderer.onDidChangeItemHeight((e) => {
      if (this.tree.hasElement(e.element)) {
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
  onContextMenu(e) {
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
    const selected = e.element;
    const scopedContextKeyService = this.contextKeyService.createOverlay([
      [ChatContextKeys.responseIsFiltered.key, isResponseVM(selected) && !!selected.errorDetails?.responseIsFiltered]
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
          dom.scheduleAtNextAnimationFrame(dom.getWindow(this.listContainer), () => {
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
    } else if ("viewId" in this.viewContext) {
      return "view";
    } else {
      return "quick";
    }
  }
  createInput(container, options) {
    this.inputPart = this._register(this.instantiationService.createInstance(ChatInputPart, this.location, {
      renderFollowups: options?.renderFollowups ?? true,
      renderStyle: options?.renderStyle === "minimal" ? "compact" : options?.renderStyle,
      menus: { executeToolbar: MenuId.ChatExecute, ...this.viewOptions.menus },
      editorOverflowWidgetsDomNode: this.viewOptions.editorOverflowWidgetsDomNode,
      enableImplicitContext: this.viewOptions.enableImplicitContext,
      renderWorkingSet: this.viewOptions.enableWorkingSet === "explicit",
      supportsChangingModes: this.viewOptions.supportsChangingModes,
      dndContainer: this.viewOptions.dndContainer,
      widgetViewKindTag: this.getWidgetViewKindTag()
    }, this.styles, () => this.collectInputState()));
    this.inputPart.render(container, "", this);
    this._register(this.inputPart.onDidLoadInputState((state) => {
      this.contribs.forEach((c) => {
        if (c.setInputState) {
          const contribState = (typeof state === "object" && state?.[c.id]) ?? {};
          c.setInputState(contribState);
        }
      });
      this.refreshParsedInput();
    }));
    this._register(this.inputPart.onDidFocus(() => this._onDidFocus.fire()));
    this._register(this.inputPart.onDidAcceptFollowup((e) => {
      if (!this.viewModel) {
        return;
      }
      let msg = "";
      if (e.followup.agentId && e.followup.agentId !== this.chatAgentService.getDefaultAgent(this.location, this.input.currentMode)?.id) {
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
        sessionId: this.viewModel.sessionId,
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
    this._register(this.inputPart.onDidChangeHeight(() => {
      if (this.bodyDimension) {
        this.layout(this.bodyDimension.height, this.bodyDimension.width);
      }
      this._onDidChangeContentHeight.fire();
    }));
    this._register(this.inputPart.attachmentModel.onDidChange(() => {
      if (this._editingSession) {
        this.renderChatEditingSessionState();
      }
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
      this.renderSampleQuestions();
      this.renderWelcomeViewContentIfNeeded();
      this.refreshParsedInput();
    }));
    this._register(autorun((r) => {
      const enabledTools = new Set(this.input.selectedToolsModel.tools.read(r).map((t) => t.id));
      const disabledTools = this.inputPart.attachmentModel.attachments.filter((a) => a.kind === "tool" && !enabledTools.has(a.id)).map((a) => a.id);
      this.inputPart.attachmentModel.updateContent(disabledTools, Iterable.empty());
      this.refreshParsedInput();
    }));
  }
  onDidStyleChange() {
    this.container.style.setProperty("--vscode-interactive-result-editor-background-color", this.editorOptions.configuration.resultEditor.backgroundColor?.toString() ?? "");
    this.container.style.setProperty("--vscode-interactive-session-foreground", this.editorOptions.configuration.foreground?.toString() ?? "");
    this.container.style.setProperty("--vscode-chat-list-background", this.themeService.getColorTheme().getColor(this.styles.listBackground)?.toString() ?? "");
  }
  togglePaused() {
    this.viewModel?.model.toggleLastRequestPaused();
    this.onDidChangeItems();
  }
  setModel(model, viewState) {
    if (!this.container) {
      throw new Error("Call render() before setModel()");
    }
    if (model.sessionId === this.viewModel?.sessionId) {
      return;
    }
    this._codeBlockModelCollection.clear();
    this.container.setAttribute("data-session-id", model.sessionId);
    this.viewModel = this.instantiationService.createInstance(ChatViewModel, model, this._codeBlockModelCollection);
    this.viewModelDisposables.add(Event.runAndSubscribe(Event.accumulate(this.viewModel.onDidChange, 0), (events) => {
      if (!this.viewModel) {
        return;
      }
      this.requestInProgress.set(this.viewModel.requestInProgress);
      this.isRequestPaused.set(
        this.viewModel.requestPausibility === 1
        /* ChatPauseState.Paused */
      );
      this.canRequestBePaused.set(
        this.viewModel.requestPausibility !== 0
        /* ChatPauseState.NotPausable */
      );
      this.onDidChangeItems();
      if (events?.some((e) => e?.kind === "addRequest") && this.visible) {
        this.scrollToEnd();
      }
      if (this._editingSession) {
        this.renderChatEditingSessionState();
      }
    }));
    this.viewModelDisposables.add(this.viewModel.onDidDisposeModel(() => {
      this.inputPart.saveState();
      this.viewModel = void 0;
      this.onDidChangeItems();
    }));
    this.inputPart.initForNewChatModel(viewState, model.getRequests().length === 0);
    this.contribs.forEach((c) => {
      if (c.setInputState && viewState.inputState?.[c.id]) {
        c.setInputState(viewState.inputState?.[c.id]);
      }
    });
    this.refreshParsedInput();
    this.viewModelDisposables.add(model.onDidChange((e) => {
      if (e.kind === "setAgent") {
        this._onDidChangeAgent.fire({ agent: e.agent, slashCommand: e.command });
      }
    }));
    if (this.tree && this.visible) {
      this.onDidChangeItems();
      this.scrollToEnd();
    }
    this.updateChatInputContext();
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
    this.tree.setFocus([node.element]);
    this.tree.domFocus();
  }
  refilter() {
    this.tree.refilter();
  }
  setInputPlaceholder(placeholder) {
    this.viewModel?.setInputPlaceholder(placeholder);
  }
  resetInputPlaceholder() {
    this.viewModel?.resetInputPlaceholder();
  }
  setInput(value = "") {
    this.inputPart.setValue(value, false);
    this.refreshParsedInput();
  }
  getInput() {
    return this.inputPart.inputEditor.getValue();
  }
  logInputHistory() {
    this.inputPart.logInputHistory();
  }
  async acceptInput(query, options) {
    return this._acceptInput(query ? { query } : void 0, options);
  }
  async rerunLastRequest() {
    if (!this.viewModel) {
      return;
    }
    const sessionId = this.viewModel.sessionId;
    const lastRequest = this.chatService.getSession(sessionId)?.getRequests().at(-1);
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
  collectInputState() {
    const inputState = {};
    this.contribs.forEach((c) => {
      if (c.getInputState) {
        inputState[c.id] = c.getInputState();
      }
    });
    return inputState;
  }
  async _handlePromptSlashCommand(input, attachedContext) {
    const agentSlashPromptPart = this.parsedInput.parts.find((r) => r instanceof ChatRequestSlashPromptPart);
    if (!agentSlashPromptPart) {
      return input;
    }
    input = this.parsedInput.parts.filter((part) => !(part instanceof ChatRequestSlashPromptPart)).map((part) => part.text).join("").trim();
    const promptPath = await this.promptsService.resolvePromptSlashCommand(agentSlashPromptPart.slashPromptCommand);
    if (!promptPath) {
      return input;
    }
    if (!attachedContext.some((variable) => isPromptFileChatVariable(variable) && isEqual(toUri(variable), promptPath.uri))) {
      const variable = toChatVariable({ uri: promptPath.uri, isPromptFile: true }, true);
      attachedContext.push(variable);
    }
    return input;
  }
  async _acceptInput(query, options) {
    if (this.viewModel?.requestInProgress && this.viewModel.requestPausibility !== 1) {
      return;
    }
    if (this.viewModel) {
      this._onDidAcceptInput.fire();
      this.scrollLock = !!checkModeOption(this.input.currentMode, this.viewOptions.autoScroll);
      const editorValue = this.getInput();
      const requestId = this.chatAccessibilityService.acceptRequest();
      let input = !query ? editorValue : query.query;
      const isUserQuery = !query;
      let attachedContext = await this.inputPart.getAttachedAndImplicitContext(this.viewModel.sessionId);
      const { promptInstructions } = this.inputPart.attachmentModel;
      const instructionsEnabled = promptInstructions.featureEnabled;
      if (instructionsEnabled) {
        input = await this._handlePromptSlashCommand(input, attachedContext);
        await this.autoAttachInstructions(attachedContext);
        input = await this.setupChatModeAndTools(input, attachedContext);
      }
      if (this.viewOptions.enableWorkingSet !== void 0 && this.input.currentMode === ChatMode.Edit && !this.chatService.edits2Enabled) {
        const uniqueWorkingSetEntries = new ResourceSet();
        const editingSessionAttachedContext = attachedContext;
        const previousRequests = this.viewModel.model.getRequests();
        for (const request of previousRequests) {
          for (const variable of request.variableData.variables) {
            if (URI.isUri(variable.value) && variable.kind === "file") {
              const uri = variable.value;
              if (!uniqueWorkingSetEntries.has(uri)) {
                editingSessionAttachedContext.push(variable);
                uniqueWorkingSetEntries.add(variable.value);
              }
            }
          }
        }
        attachedContext = editingSessionAttachedContext;
        this.telemetryService.publicLog2("chatEditing/workingSetSize", { originalSize: uniqueWorkingSetEntries.size, actualSize: uniqueWorkingSetEntries.size });
      }
      this.chatService.cancelCurrentRequestForSession(this.viewModel.sessionId);
      this.input.validateCurrentMode();
      let userSelectedTools;
      let userSelectedTools2;
      if (this.input.currentMode === ChatMode.Agent) {
        userSelectedTools = this.inputPart.selectedToolsModel.tools.get().map((tool) => tool.id);
        userSelectedTools2 = {};
        for (const [tool, enablement] of this.inputPart.selectedToolsModel.asEnablementMap()) {
          userSelectedTools2[tool.id] = enablement;
        }
      }
      const result = await this.chatService.sendRequest(this.viewModel.sessionId, input, {
        mode: this.inputPart.currentMode,
        userSelectedModelId: this.inputPart.currentLanguageModel,
        location: this.location,
        locationData: this._location.resolveData?.(),
        parserContext: { selectedAgent: this._lastSelectedAgent, mode: this.inputPart.currentMode },
        attachedContext,
        noCommandDetection: options?.noCommandDetection,
        userSelectedTools,
        userSelectedTools2
      });
      if (result) {
        this.inputPart.acceptInput(isUserQuery);
        this._onDidSubmitAgent.fire({ agent: result.agent, slashCommand: result.slashCommand });
        result.responseCompletePromise.then(() => {
          const responses = this.viewModel?.getItems().filter(isResponseVM);
          const lastResponse = responses?.[responses.length - 1];
          this.chatAccessibilityService.acceptResponse(lastResponse, requestId, options?.isVoiceInput);
          if (lastResponse?.result?.nextQuestion) {
            const { prompt, participant, command } = lastResponse.result.nextQuestion;
            const question = formatChatQuestion(this.chatAgentService, this.location, prompt, participant, command);
            if (question) {
              this.input.setValue(question, false);
            }
          }
        });
        return result.responseCreatedPromise;
      }
    }
    return void 0;
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
  focusLastMessage() {
    if (!this.viewModel) {
      return;
    }
    const items = this.tree.getNode(null).children;
    const lastItem = items[items.length - 1];
    if (!lastItem) {
      return;
    }
    this.tree.setFocus([lastItem.element]);
    this.tree.domFocus();
  }
  layout(height, width) {
    width = Math.min(width, 850);
    this.bodyDimension = new dom.Dimension(width, height);
    this.inputPart.layout(this._dynamicMessageLayoutData?.enabled ? this._dynamicMessageLayoutData.maxHeight : height, width);
    const inputHeight = this.inputPart.inputPartHeight;
    const lastElementVisible = this.tree.scrollTop + this.tree.renderHeight >= this.tree.scrollHeight - 2;
    const contentHeight = Math.max(0, height - inputHeight);
    if (this.viewOptions.renderStyle === "compact" || this.viewOptions.renderStyle === "minimal") {
      this.listContainer.style.removeProperty("--chat-current-response-min-height");
    } else {
      this.listContainer.style.setProperty("--chat-current-response-min-height", contentHeight * 0.75 + "px");
    }
    this.tree.layout(contentHeight, width);
    this.tree.getHTMLElement().style.height = `${contentHeight}px`;
    let welcomeOffset = 100;
    if (this.viewOptions.renderFollowups) {
      welcomeOffset = Math.max(welcomeOffset - this.inputPart.followupsHeight, 0);
    }
    if (this.viewOptions.enableWorkingSet) {
      welcomeOffset = Math.max(welcomeOffset - this.inputPart.editSessionWidgetHeight, 0);
    }
    welcomeOffset = Math.max(welcomeOffset - this.inputPart.attachmentsHeight, 0);
    this.welcomeMessageContainer.style.height = `${contentHeight - welcomeOffset}px`;
    this.welcomeMessageContainer.style.paddingBottom = `${welcomeOffset}px`;
    this.renderer.layout(width);
    const lastItem = this.viewModel?.getItems().at(-1);
    const lastResponseIsRendering = isResponseVM(lastItem) && lastItem.renderData;
    if (lastElementVisible && (!lastResponseIsRendering || checkModeOption(this.input.currentMode, this.viewOptions.autoScroll))) {
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
        this.inputPart.layout(possibleMaxHeight, width);
        const inputPartHeight = this.inputPart.inputPartHeight;
        const newHeight = Math.min(renderHeight + diff, possibleMaxHeight - inputPartHeight);
        this.layout(newHeight + inputPartHeight, width);
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
    this.inputPart.layout(this._dynamicMessageLayoutData.maxHeight, width);
    const inputHeight = this.inputPart.inputPartHeight;
    const totalMessages = this.viewModel.getItems();
    const messages = totalMessages.slice(-this._dynamicMessageLayoutData.numOfMessages);
    const needsRerender = messages.some((m) => m.currentRenderedHeight === void 0);
    const listHeight = needsRerender ? this._dynamicMessageLayoutData.maxHeight : messages.reduce((acc, message) => acc + message.currentRenderedHeight, 0);
    this.layout(Math.min(
      // we add an additional 18px in order to show that there is scrollable content
      inputHeight + listHeight + (totalMessages.length > 2 ? 18 : 0),
      this._dynamicMessageLayoutData.maxHeight
    ), width);
    if (needsRerender || !listHeight) {
      this.scrollToEnd();
    }
  }
  saveState() {
    this.inputPart.saveState();
  }
  getViewState() {
    return {
      inputValue: this.getInput(),
      inputState: this.inputPart.getViewState()
    };
  }
  updateChatInputContext() {
    const currentAgent = this.parsedInput.parts.find((part) => part instanceof ChatRequestAgentPart);
    this.agentInInput.set(!!currentAgent);
  }
  /**
   * Set's up the `chat mode` and selects required `tools` based on
   * the metadata defined in headers of attached prompt files.
   */
  async setupChatModeAndTools(input, attachedContext) {
    const promptFileVariables = attachedContext.filter(isPromptFileChatVariable).filter(pick("isRoot"));
    const promptUris = promptFileVariables.map(toUri);
    if (promptFileVariables.length === 0) {
      return input;
    }
    if (!input.trim()) {
      const promptNames = promptUris.length === 1 ? `'${basename(promptUris[0])}'` : `the prompt files`;
      input = `Follow instructions from ${promptNames}.`;
    }
    const metadata = await this.promptsService.getCombinedToolsMetadata(promptUris);
    if (metadata === null) {
      return input;
    }
    const { mode, tools } = metadata;
    if (mode && mode !== this.inputPart.currentMode) {
      await this.commandService.executeCommand(ToggleAgentModeActionId, { mode });
    }
    if (tools === void 0) {
      return input;
    }
    assert(this.inputPart.currentMode === ChatMode.Agent, `Chat mode must be 'agent' when there are 'tools' defined, got ${this.inputPart.currentMode}.`);
    const toolIds = tools.map((toolName) => {
      const tool = this.toolsService.getToolByName(toolName);
      if (tool === void 0) {
        this.logService.warn(`[setup tools]: cannot to find tool '${toolName}'`);
      }
      return tool;
    }).filter(isDefined).map(pick("id"));
    this.inputPart.selectedToolsModel.selectOnly(toolIds);
    return input;
  }
  /**
   * Resolves instructions that have `include` metadata that can
   * match file references in the attached context and then attaches
   * such instructions to the context.
   */
  async autoAttachInstructions(attachedContext) {
    const variableUris = attachedContext.filter(hasAddressableValue).map(toUri);
    const automaticInstructions = await this.promptsService.findInstructionFilesFor(variableUris);
    attachedContext.push(...automaticInstructions.map((uri) => {
      return toChatVariable({ uri, isPromptFile: true }, true);
    }));
    this.inputPart.attachmentModel.promptInstructions.add(automaticInstructions);
  }
};
ChatWidget = ChatWidget_1 = __decorate([
  __param(4, ICodeEditorService),
  __param(5, IConfigurationService),
  __param(6, IContextKeyService),
  __param(7, IInstantiationService),
  __param(8, IChatService),
  __param(9, IChatAgentService),
  __param(10, IChatWidgetService),
  __param(11, IContextMenuService),
  __param(12, IChatAccessibilityService),
  __param(13, ILogService),
  __param(14, IThemeService),
  __param(15, IChatSlashCommandService),
  __param(16, IChatEditingService),
  __param(17, ITelemetryService),
  __param(18, IPromptsService),
  __param(19, ICommandService),
  __param(20, ILanguageModelToolsService)
], ChatWidget);
const hasAddressableValue = /* @__PURE__ */ __name((thing) => {
  if (!thing || "value" in thing === false) {
    return false;
  }
  if (URI.isUri(thing.value) || isLocation(thing.value)) {
    return true;
  }
  return false;
}, "hasAddressableValue");
const toUri = /* @__PURE__ */ __name((thing) => {
  const { value } = thing;
  return URI.isUri(value) ? value : value.uri;
}, "toUri");
class ChatWidgetService extends Disposable {
  static {
    __name(this, "ChatWidgetService");
  }
  constructor() {
    super(...arguments);
    this._widgets = [];
    this._lastFocusedWidget = void 0;
    this._onDidAddWidget = this._register(new Emitter());
    this.onDidAddWidget = this._onDidAddWidget.event;
  }
  get lastFocusedWidget() {
    return this._lastFocusedWidget;
  }
  getAllWidgets() {
    return this._widgets;
  }
  getWidgetsByLocations(location) {
    return this._widgets.filter((w) => w.location === location);
  }
  getWidgetByInputUri(uri) {
    return this._widgets.find((w) => isEqual(w.inputUri, uri));
  }
  getWidgetBySessionId(sessionId) {
    return this._widgets.find((w) => w.viewModel?.sessionId === sessionId);
  }
  setLastFocusedWidget(widget) {
    if (widget === this._lastFocusedWidget) {
      return;
    }
    this._lastFocusedWidget = widget;
  }
  register(newWidget) {
    if (this._widgets.some((widget) => widget === newWidget)) {
      throw new Error("Cannot register the same widget multiple times");
    }
    this._widgets.push(newWidget);
    this._onDidAddWidget.fire(newWidget);
    return combinedDisposable(newWidget.onDidFocus(() => this.setLastFocusedWidget(newWidget)), toDisposable(() => this._widgets.splice(this._widgets.indexOf(newWidget), 1)));
  }
}
export {
  ChatWidget,
  ChatWidgetService,
  isQuickChat
};
//# sourceMappingURL=chatWidget.js.map
