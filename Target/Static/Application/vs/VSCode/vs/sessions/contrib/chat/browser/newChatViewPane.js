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
import "./media/chatWidget.css";
import "./media/chatWelcomePart.css";
import * as dom from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { toAction } from "../../../../base/common/actions.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { SnippetController2 } from "../../../../editor/contrib/snippet/browser/snippetController2.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { localize } from "../../../../nls.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { ChatSessionPosition, getResourceForNewChatSession } from "../../../../workbench/contrib/chat/browser/chatSessions/chatSessions.contribution.js";
import { ChatSessionPickerActionItem } from "../../../../workbench/contrib/chat/browser/chatSessions/chatSessionPickerActionItem.js";
import { SearchableOptionPickerActionItem } from "../../../../workbench/contrib/chat/browser/chatSessions/searchableOptionPickerActionItem.js";
import { ILanguageModelsService } from "../../../../workbench/contrib/chat/common/languageModels.js";
import { EnhancedModelPickerActionItem } from "../../../../workbench/contrib/chat/browser/widget/input/modelPickerActionItem2.js";
import { IViewDescriptorService } from "../../../../workbench/common/views.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { ViewPane } from "../../../../workbench/browser/parts/views/viewPane.js";
import { ContextMenuController } from "../../../../editor/contrib/contextmenu/browser/contextmenu.js";
import { getSimpleEditorOptions } from "../../../../workbench/contrib/codeEditor/browser/simpleEditorOptions.js";
import { NewChatContextAttachments } from "./newChatContextAttachments.js";
import { GITHUB_REMOTE_FILE_SCHEME } from "../../fileTreeView/browser/githubFileSystemProvider.js";
import { FolderPicker } from "./folderPicker.js";
import { IGitService } from "../../../../workbench/contrib/git/common/gitService.js";
import { IsolationModePicker, SessionTargetPicker } from "./sessionTargetPicker.js";
import { BranchPicker } from "./branchPicker.js";
import { SyncIndicator } from "./syncIndicator.js";
import { RemoteNewSession } from "./newSession.js";
import { RepoPicker } from "./repoPicker.js";
import { CloudModelPicker } from "./modelPicker.js";
import { ModePicker } from "./modePicker.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import { SlashCommandHandler } from "./slashCommands.js";
import { IChatRequestVariableEntry } from "../../../../workbench/contrib/chat/common/attachments/chatVariableEntries.js";
import { ChatAgentLocation, ChatModeKind } from "../../../../workbench/contrib/chat/common/constants.js";
import { ChatHistoryNavigator } from "../../../../workbench/contrib/chat/common/widget/chatWidgetHistoryService.js";
import { NewChatPermissionPicker } from "./newChatPermissionPicker.js";
import { registerAndCreateHistoryNavigationContext } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
const STORAGE_KEY_DRAFT_STATE = "sessions.draftState";
const MIN_EDITOR_HEIGHT = 50;
const MAX_EDITOR_HEIGHT = 200;
let NewChatWidget = class NewChatWidget2 extends Disposable {
  static {
    __name(this, "NewChatWidget");
  }
  get element() {
    return this._editorContainer;
  }
  constructor(options, instantiationService, modelService, configurationService, languageModelsService, contextKeyService, logService, hoverService, sessionsManagementService, gitService, storageService, workspaceTrustRequestService) {
    super();
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.configurationService = configurationService;
    this.languageModelsService = languageModelsService;
    this.contextKeyService = contextKeyService;
    this.logService = logService;
    this.hoverService = hoverService;
    this.sessionsManagementService = sessionsManagementService;
    this.gitService = gitService;
    this.storageService = storageService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._currentLanguageModel = observableValue("currentLanguageModel", void 0);
    this._modelPickerDisposable = this._register(new MutableDisposable());
    this._newSession = this._register(new MutableDisposable());
    this._newSessionListener = this._register(new MutableDisposable());
    this._sending = false;
    this._openRepositoryCts = this._register(new MutableDisposable());
    this._repositoryLoading = false;
    this._branchLoading = false;
    this._loadingDelayDisposable = this._register(new MutableDisposable());
    this._toolbarPickerWidgets = /* @__PURE__ */ new Map();
    this._toolbarPickerDisposables = this._register(new DisposableStore());
    this._optionEmitters = /* @__PURE__ */ new Map();
    this._optionContextKeys = /* @__PURE__ */ new Map();
    this._draftState = {
      inputText: "",
      attachments: [],
      mode: { id: ChatModeKind.Agent, kind: ChatModeKind.Agent },
      selectedModel: void 0,
      selections: [],
      contrib: {}
    };
    this._history = this._register(this.instantiationService.createInstance(ChatHistoryNavigator, ChatAgentLocation.Chat));
    this._contextAttachments = this._register(this.instantiationService.createInstance(NewChatContextAttachments));
    this._folderPicker = this._register(this.instantiationService.createInstance(FolderPicker));
    this._permissionPicker = this._register(this.instantiationService.createInstance(NewChatPermissionPicker));
    this._repoPicker = this._register(this.instantiationService.createInstance(RepoPicker));
    this._cloudModelPicker = this._register(this.instantiationService.createInstance(CloudModelPicker));
    this._modePicker = this._register(this.instantiationService.createInstance(ModePicker));
    this._targetPicker = this._register(new SessionTargetPicker(options.allowedTargets, this._resolveDefaultTarget(options)));
    this._isolationModePicker = this._register(this.instantiationService.createInstance(IsolationModePicker));
    this._branchPicker = this._register(this.instantiationService.createInstance(BranchPicker));
    this._syncIndicator = this._register(this.instantiationService.createInstance(SyncIndicator));
    this._options = options;
    this._register(this._targetPicker.onDidChangeTarget((target) => {
      this._createNewSession();
      const isLocal = target === AgentSessionProviders.Background;
      this._updateIsolationPickerVisibility();
      this._permissionPicker.setVisible(isLocal);
      this._branchPicker.setVisible(isLocal);
      this._syncIndicator.setVisible(isLocal);
      this._updateDraftState();
      this._focusEditor();
    }));
    this._register(this._branchPicker.onDidChangeLoading((loading) => {
      this._branchLoading = loading;
      this._updateInputLoadingState();
    }));
    this._register(this._branchPicker.onDidChange((branch) => {
      this._newSession.value?.setBranch(branch);
      this._syncIndicator.setBranch(branch);
      this._updateDraftState();
      this._focusEditor();
    }));
    this._register(this._folderPicker.onDidSelectFolder(async (folderUri) => {
      const trusted = await this._requestFolderTrust(folderUri);
      if (trusted) {
        this._newSession.value?.setRepoUri(folderUri);
      }
      this._updateDraftState();
      this._focusEditor();
    }));
    this._register(this._isolationModePicker.onDidChange((mode) => {
      this._newSession.value?.setIsolationMode(mode);
      this._branchPicker.setVisible(mode === "worktree");
      this._syncIndicator.setVisible(mode === "worktree");
      this._updateDraftState();
      this._focusEditor();
    }));
    this._register(this._modePicker.onDidChange((mode) => {
      this._newSession.value?.setMode(mode);
      this._focusEditor();
    }));
    this._register(this._repoPicker.onDidSelectRepo((repoId) => {
      if (this._targetPicker.selectedTarget !== AgentSessionProviders.Background) {
        this._newSession.value?.setRepoUri(this._getRepoUri(repoId));
      }
      this._updateDraftState();
    }));
    this._register(this.languageModelsService.onDidChangeLanguageModels(() => {
      this._initDefaultModel();
    }));
    this._register(this._contextAttachments.onDidChangeContext(() => {
      this._updateDraftState();
      this._focusEditor();
    }));
    this._register(autorun((reader) => {
      this._currentLanguageModel.read(reader);
      this._updateDraftState();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("github.copilot.chat.cli.isolationOption.enabled")) {
        this._updateIsolationPickerVisibility();
      }
    }));
  }
  get _isIsolationOptionEnabled() {
    return this.configurationService.getValue("github.copilot.chat.cli.isolationOption.enabled") !== false;
  }
  _updateIsolationPickerVisibility() {
    const isLocal = this._targetPicker.selectedTarget === AgentSessionProviders.Background;
    const enabled = this._isIsolationOptionEnabled;
    if (!enabled) {
      this._isolationModePicker.setPreferredIsolationMode("worktree");
    }
    this._isolationModePicker.setVisible(isLocal);
    this._isolationModePicker.setEnabled(enabled);
  }
  // --- Rendering ---
  render(container) {
    const wrapper = dom.append(container, dom.$(".sessions-chat-widget"));
    const editorOverflowWidgetsDomNode = dom.append(container, dom.$(".sessions-chat-editor-overflow.monaco-editor"));
    this._register({ dispose: /* @__PURE__ */ __name(() => editorOverflowWidgetsDomNode.remove(), "dispose") });
    const welcomeElement = dom.append(wrapper, dom.$(".chat-full-welcome"));
    const header = dom.append(welcomeElement, dom.$(".chat-full-welcome-header"));
    dom.append(header, dom.$(".chat-full-welcome-letterpress"));
    this._pickersContainer = dom.append(welcomeElement, dom.$(".chat-full-welcome-pickers-container"));
    this._inputSlot = dom.append(welcomeElement, dom.$(".chat-full-welcome-inputSlot"));
    const inputArea = dom.$(".sessions-chat-input-area");
    this._contextAttachments.registerDropTarget(wrapper);
    this._contextAttachments.registerPasteHandler(inputArea);
    const attachRow = dom.append(inputArea, dom.$(".sessions-chat-attach-row"));
    const attachedContextContainer = dom.append(attachRow, dom.$(".sessions-chat-attached-context"));
    this._contextAttachments.renderAttachedContext(attachedContextContainer);
    this._createEditor(inputArea, editorOverflowWidgetsDomNode);
    this._createBottomToolbar(inputArea);
    this._inputSlot.appendChild(inputArea);
    const isolationContainer = dom.append(welcomeElement, dom.$(".chat-full-welcome-local-mode"));
    this._isolationModePicker.render(isolationContainer);
    this._permissionPicker.render(isolationContainer);
    dom.append(isolationContainer, dom.$(".sessions-chat-local-mode-spacer"));
    const branchContainer = dom.append(isolationContainer, dom.$(".sessions-chat-local-mode-right"));
    this._branchPicker.render(branchContainer);
    this._syncIndicator.render(branchContainer);
    const isLocal = this._targetPicker.selectedTarget === AgentSessionProviders.Background;
    this._updateIsolationPickerVisibility();
    this._permissionPicker.setVisible(isLocal);
    const isWorktree = this._isolationModePicker.isolationMode === "worktree";
    this._branchPicker.setVisible(isLocal && isWorktree);
    this._syncIndicator.setVisible(isLocal && isWorktree);
    this._renderOptionGroupPickers();
    this._initDefaultModel();
    this._restoreState();
    this._createNewSession();
    welcomeElement.classList.add("revealed");
    this._register(dom.addDisposableListener(this._inputSlot, "animationend", () => {
      this._editor?.layout();
    }, { once: true }));
  }
  async _createNewSession() {
    const target = this._targetPicker.selectedTarget;
    let defaultRepoUri = this._folderPicker.selectedFolderUri;
    if (target === AgentSessionProviders.Background && defaultRepoUri) {
      const trusted = await this._requestFolderTrust(defaultRepoUri);
      if (!trusted) {
        defaultRepoUri = void 0;
      }
    }
    const resource = getResourceForNewChatSession({
      type: target,
      position: this._options.sessionPosition ?? ChatSessionPosition.Sidebar,
      displayName: ""
    });
    try {
      const session = await this.sessionsManagementService.createNewSessionForTarget(target, resource, defaultRepoUri);
      this._setNewSession(session);
    } catch (e) {
      this.logService.error("Failed to create new session:", e);
    }
  }
  _setNewSession(session) {
    this._newSession.value = session;
    const target = this._targetPicker.selectedTarget;
    if (target === AgentSessionProviders.Background) {
      session.setIsolationMode(this._isolationModePicker.isolationMode);
      if (this._branchPicker.selectedBranch) {
        session.setBranch(this._branchPicker.selectedBranch);
      }
    } else {
      const selectedRepo = this._repoPicker.selectedRepo;
      if (selectedRepo) {
        session.setRepoUri(this._getRepoUri(selectedRepo));
      }
    }
    const currentModel = this._currentLanguageModel.get();
    if (currentModel) {
      session.setModelId(currentModel.identifier);
    }
    session.setMode(this._modePicker.selectedMode);
    if (session.repoUri) {
      this._openRepository(session.repoUri);
    }
    const listeners = new DisposableStore();
    listeners.add(session.onDidChange((changeType) => {
      if (changeType === "repoUri" && session.repoUri) {
        this._openRepository(session.repoUri);
      }
      if (changeType === "isolationMode") {
        this._branchPicker.setVisible(session.isolationMode === "worktree");
      }
      if (changeType === "disabled") {
        this._updateSendButtonState();
      }
    }));
    if (session instanceof RemoteNewSession) {
      this._renderRemoteSessionPickers(session, true);
      listeners.add(session.onDidChangeOptionGroups(() => {
        this._renderRemoteSessionPickers(session);
      }));
    } else {
      this._renderLocalSessionPickers();
    }
    this._newSessionListener.value = listeners;
    this._updateSendButtonState();
  }
  _openRepository(folderUri) {
    this._openRepositoryCts.value?.cancel();
    const cts = this._openRepositoryCts.value = new CancellationTokenSource();
    this._repositoryLoading = true;
    this._updateInputLoadingState();
    this._branchPicker.setRepository(void 0);
    this._isolationModePicker.setRepository(void 0);
    this._updateIsolationPickerVisibility();
    this._syncIndicator.setRepository(void 0);
    this._modePicker.setRepository(void 0);
    this.gitService.openRepository(folderUri).then((repository) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      this._repositoryLoading = false;
      this._updateInputLoadingState();
      this._isolationModePicker.setRepository(repository);
      this._updateIsolationPickerVisibility();
      this._branchPicker.setRepository(repository);
      this._syncIndicator.setRepository(repository);
      this._modePicker.setRepository(repository);
    }).catch((e) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.logService.warn(`Failed to open repository at ${folderUri.toString()}`, getErrorMessage(e));
      this._repositoryLoading = false;
      this._updateInputLoadingState();
      this._isolationModePicker.setRepository(void 0);
      this._updateIsolationPickerVisibility();
      this._branchPicker.setRepository(void 0);
      this._syncIndicator.setRepository(void 0);
      this._modePicker.setRepository(void 0);
    });
  }
  _updateInputLoadingState() {
    const loading = this._repositoryLoading || this._branchLoading || this._sending;
    if (loading) {
      if (!this._loadingDelayDisposable.value) {
        const timer = setTimeout(() => {
          this._loadingDelayDisposable.clear();
          if (this._repositoryLoading || this._branchLoading || this._sending) {
            this._loadingSpinner?.classList.add("visible");
          }
        }, 500);
        this._loadingDelayDisposable.value = toDisposable(() => clearTimeout(timer));
      }
    } else {
      this._loadingDelayDisposable.clear();
      this._loadingSpinner?.classList.remove("visible");
    }
  }
  // --- Editor ---
  _createEditor(container, overflowWidgetsDomNode) {
    const editorContainer = this._editorContainer = dom.append(container, dom.$(".sessions-chat-editor"));
    editorContainer.style.height = `${MIN_EDITOR_HEIGHT}px`;
    const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(container));
    const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(inputScopedContextKeyService, this));
    this._historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
    this._historyNavigationForwardsEnablement = historyNavigationForwardsEnablement;
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, inputScopedContextKeyService])));
    const uri = URI.from({ scheme: "sessions-chat", path: `input-${Date.now()}` });
    const textModel = this._register(this.modelService.createModel("", null, uri, true));
    const editorOptions = {
      ...getSimpleEditorOptions(this.configurationService),
      readOnly: false,
      ariaLabel: localize("chatInput", "Chat input"),
      placeholder: localize("chatPlaceholder", "Run tasks in the background, type '#' for adding context"),
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 13,
      lineHeight: 20,
      cursorWidth: 1,
      padding: { top: 8, bottom: 2 },
      wrappingStrategy: "advanced",
      stickyScroll: { enabled: false },
      renderWhitespace: "none",
      overflowWidgetsDomNode,
      suggest: {
        showIcons: false,
        showSnippets: false,
        showWords: true,
        showStatusBar: false,
        insertMode: "insert"
      }
    };
    const widgetOptions = {
      isSimpleWidget: true,
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        ContextMenuController.ID,
        SuggestController.ID,
        SnippetController2.ID
      ])
    };
    this._editor = this._register(scopedInstantiationService.createInstance(CodeEditorWidget, editorContainer, editorOptions, widgetOptions));
    this._editor.setModel(textModel);
    SuggestController.get(this._editor)?.forceRenderingAbove();
    this._register(this._editor.onDidFocusEditorWidget(() => this._onDidFocus.fire()));
    this._register(this._editor.onDidBlurEditorWidget(() => this._onDidBlur.fire()));
    this._register(this._editor.onKeyDown((e) => {
      if (e.keyCode === 3 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        if (this._editor.contextKeyService.getContextKeyValue("suggestWidgetVisible")) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this._send();
      }
      if (e.keyCode === 3 && !e.shiftKey && !e.ctrlKey && e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        this._send();
      }
    }));
    const updateHistoryNavigationEnablement = /* @__PURE__ */ __name(() => {
      const model = this._editor.getModel();
      const position = this._editor.getPosition();
      if (!model || !position) {
        return;
      }
      this._historyNavigationBackwardsEnablement.set(position.lineNumber === 1 && position.column === 1);
      this._historyNavigationForwardsEnablement.set(position.lineNumber === model.getLineCount() && position.column === model.getLineMaxColumn(position.lineNumber));
    }, "updateHistoryNavigationEnablement");
    this._register(this._editor.onDidChangeCursorPosition(() => updateHistoryNavigationEnablement()));
    updateHistoryNavigationEnablement();
    let previousHeight = -1;
    this._register(this._editor.onDidContentSizeChange((e) => {
      if (!e.contentHeightChanged) {
        return;
      }
      const contentHeight = this._editor.getContentHeight();
      const clampedHeight = Math.min(MAX_EDITOR_HEIGHT, Math.max(MIN_EDITOR_HEIGHT, contentHeight));
      if (clampedHeight === previousHeight) {
        return;
      }
      previousHeight = clampedHeight;
      this._editorContainer.style.height = `${clampedHeight}px`;
      this._editor.layout();
    }));
    this._slashCommandHandler = this._register(this.instantiationService.createInstance(SlashCommandHandler, this._editor));
    this._register(this._editor.onDidChangeModelContent(() => {
      this._updateDraftState();
      this._updateSendButtonState();
    }));
  }
  _focusEditor() {
    this._editor?.focus();
  }
  _createAttachButton(container) {
    const attachButton = dom.append(container, dom.$(".sessions-chat-attach-button"));
    const attachButtonLabel = localize("addContext", "Add Context...");
    attachButton.tabIndex = 0;
    attachButton.role = "button";
    attachButton.ariaLabel = attachButtonLabel;
    this._register(this.hoverService.setupDelayedHover(attachButton, {
      content: attachButtonLabel,
      position: {
        hoverPosition: 2
        /* HoverPosition.BELOW */
      },
      appearance: { showPointer: true }
    }));
    dom.append(attachButton, renderIcon(Codicon.add));
    this._register(dom.addDisposableListener(attachButton, dom.EventType.CLICK, () => {
      this._contextAttachments.showPicker(this._getContextFolderUri());
    }));
  }
  /**
   * Returns the folder URI for the context picker based on the current target.
   * Local targets use the workspace folder; cloud targets construct a github-remote-file:// URI.
   */
  _getContextFolderUri() {
    const target = this._targetPicker.selectedTarget;
    if (target === AgentSessionProviders.Background) {
      return this._folderPicker.selectedFolderUri;
    }
    const selectedRepo = this._repoPicker.selectedRepo;
    if (selectedRepo && selectedRepo.includes("/")) {
      return this._getRepoUri(selectedRepo);
    }
    return void 0;
  }
  _getRepoUri(repoId) {
    return URI.from({
      scheme: GITHUB_REMOTE_FILE_SCHEME,
      authority: "github",
      path: `/${repoId}/HEAD`
    });
  }
  _createBottomToolbar(container) {
    const toolbar = dom.append(container, dom.$(".sessions-chat-toolbar"));
    this._createAttachButton(toolbar);
    this._modePicker.render(toolbar);
    this._modePicker.setVisible(false);
    this._localModelPickerContainer = dom.append(toolbar, dom.$(".sessions-chat-model-picker"));
    this._createLocalModelPicker(this._localModelPickerContainer);
    this._cloudModelPicker.render(toolbar);
    this._cloudModelPicker.setVisible(false);
    this._toolbarPickersContainer = dom.append(toolbar, dom.$(".sessions-chat-toolbar-pickers"));
    dom.append(toolbar, dom.$(".sessions-chat-toolbar-spacer"));
    this._loadingSpinner = dom.append(toolbar, dom.$(".sessions-chat-loading-spinner"));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this._loadingSpinner, localize("loading", "Loading...")));
    const sendButtonContainer = dom.append(toolbar, dom.$(".sessions-chat-send-button"));
    const sendButton = this._sendButton = this._register(new Button(sendButtonContainer, {
      secondary: true,
      title: localize("send", "Send"),
      ariaLabel: localize("send", "Send")
    }));
    sendButton.icon = Codicon.send;
    this._register(sendButton.onDidClick(() => this._send()));
    this._updateSendButtonState();
  }
  // --- Model picker ---
  _createLocalModelPicker(container) {
    const delegate = {
      currentModel: this._currentLanguageModel,
      setModel: /* @__PURE__ */ __name((model) => {
        this._currentLanguageModel.set(model, void 0);
        this._newSession.value?.setModelId(model.identifier);
        this._focusEditor();
      }, "setModel"),
      getModels: /* @__PURE__ */ __name(() => this._getAvailableModels(), "getModels"),
      useGroupedModelPicker: /* @__PURE__ */ __name(() => true, "useGroupedModelPicker"),
      showManageModelsAction: /* @__PURE__ */ __name(() => false, "showManageModelsAction"),
      showUnavailableFeatured: /* @__PURE__ */ __name(() => false, "showUnavailableFeatured"),
      showFeatured: /* @__PURE__ */ __name(() => true, "showFeatured")
    };
    const pickerOptions = {
      hideChevrons: observableValue("hideChevrons", false),
      hoverPosition: {
        hoverPosition: 3
        /* HoverPosition.ABOVE */
      }
    };
    const action = { id: "sessions.modelPicker", label: "", enabled: true, class: void 0, tooltip: "", run: /* @__PURE__ */ __name(() => {
    }, "run") };
    const modelPicker = this.instantiationService.createInstance(EnhancedModelPickerActionItem, action, delegate, pickerOptions);
    this._modelPickerDisposable.value = modelPicker;
    modelPicker.render(container);
  }
  _initDefaultModel() {
    const models = this._getAvailableModels();
    const draft = this._getDraftState();
    const lastModelId = draft?.selectedModel?.identifier ?? this._history.values.at(-1)?.selectedModel?.identifier;
    const defaultModel = (lastModelId ? models.find((m) => m.identifier === lastModelId) : void 0) ?? models[0];
    this._currentLanguageModel.set(defaultModel, void 0);
  }
  _getAvailableModels() {
    return this.languageModelsService.getLanguageModelIds().map((id) => {
      const metadata = this.languageModelsService.lookupLanguageModel(id);
      return metadata ? { metadata, identifier: id } : void 0;
    }).filter((m) => !!m && m.metadata.targetChatSessionType === AgentSessionProviders.Background);
  }
  // --- Welcome: Target & option pickers (dropdown row below input) ---
  _renderOptionGroupPickers() {
    if (!this._pickersContainer) {
      return;
    }
    this._clearAllPickers();
    dom.clearNode(this._pickersContainer);
    const pickersRow = dom.append(this._pickersContainer, dom.$(".chat-full-welcome-pickers"));
    const leftHalf = dom.append(pickersRow, dom.$(".sessions-chat-pickers-left-half"));
    const targetDropdownContainer = dom.append(leftHalf, dom.$(".sessions-chat-dropdown-wrapper"));
    this._targetPicker.render(targetDropdownContainer);
    const rightHalf = dom.append(pickersRow, dom.$(".sessions-chat-pickers-right-half"));
    this._extensionPickersLeftContainer = dom.append(rightHalf, dom.$(".sessions-chat-pickers-left-separator"));
    this._extensionPickersLeftContainer.style.display = "none";
    this._repoPickerContainer = dom.append(rightHalf, dom.$(".sessions-chat-extension-pickers-right"));
    this._repoPickerContainer.style.display = "none";
    this._repoPicker.render(this._repoPickerContainer);
    this._folderPickerContainer = this._folderPicker.render(rightHalf);
    this._folderPickerContainer.style.display = "none";
  }
  // --- Local session pickers ---
  _renderLocalSessionPickers() {
    this._clearAllPickers();
    if (this._folderPickerContainer) {
      this._folderPickerContainer.style.display = "";
    }
    if (this._extensionPickersLeftContainer) {
      this._extensionPickersLeftContainer.style.display = "block";
    }
    if (this._localModelPickerContainer) {
      this._localModelPickerContainer.style.display = "";
    }
    this._modePicker.setVisible(true);
    this._cloudModelPicker.setVisible(false);
  }
  // --- Remote session pickers ---
  _renderRemoteSessionPickers(session, force) {
    if (!this._repoPickerContainer) {
      return;
    }
    if (this._folderPickerContainer) {
      this._folderPickerContainer.style.display = "none";
    }
    if (this._localModelPickerContainer) {
      this._localModelPickerContainer.style.display = "none";
    }
    this._modePicker.setVisible(false);
    this._cloudModelPicker.setSession(session);
    this._cloudModelPicker.setVisible(true);
    if (this._extensionPickersLeftContainer) {
      this._extensionPickersLeftContainer.style.display = "block";
    }
    this._repoPickerContainer.style.display = "";
    this._renderToolbarPickers(session, force);
  }
  _renderToolbarPickers(session, force) {
    if (!this._toolbarPickersContainer) {
      return;
    }
    const toolbarOptions = session.getOtherOptionGroups();
    const visibleGroups = toolbarOptions.filter((option) => {
      const group = option.group;
      return group.items.length > 0 || (group.commands || []).length > 0 || !!group.searchable;
    });
    if (visibleGroups.length === 0) {
      this._clearToolbarPickers();
      return;
    }
    if (!force) {
      const allMatch = visibleGroups.length === this._toolbarPickerWidgets.size && visibleGroups.every((o) => this._toolbarPickerWidgets.has(o.group.id));
      if (allMatch) {
        return;
      }
    }
    this._clearToolbarPickers();
    for (const option of visibleGroups) {
      this._renderToolbarPickerWidget(option, session);
    }
  }
  _renderToolbarPickerWidget(option, session) {
    const { group: optionGroup, value: initialItem } = option;
    if (initialItem) {
      this._updateOptionContextKey(optionGroup.id, initialItem.id);
    }
    const initialState = { group: optionGroup, item: initialItem };
    const emitter = this._getOrCreateOptionEmitter(optionGroup.id);
    const itemDelegate = {
      getCurrentOption: /* @__PURE__ */ __name(() => session.getOptionValue(optionGroup.id) ?? initialItem, "getCurrentOption"),
      onDidChangeOption: emitter.event,
      setOption: /* @__PURE__ */ __name((item) => {
        this._updateOptionContextKey(optionGroup.id, item.id);
        emitter.fire(item);
        session.setOptionValue(optionGroup.id, item);
        this._focusEditor();
      }, "setOption"),
      getOptionGroup: /* @__PURE__ */ __name(() => {
        const modelOpt = session.getModelOptionGroup();
        if (modelOpt?.group.id === optionGroup.id) {
          return modelOpt.group;
        }
        return session.getOtherOptionGroups().find((o) => o.group.id === optionGroup.id)?.group;
      }, "getOptionGroup"),
      getSessionResource: /* @__PURE__ */ __name(() => session.resource, "getSessionResource")
    };
    const action = toAction({ id: optionGroup.id, label: optionGroup.name, run: /* @__PURE__ */ __name(() => {
    }, "run") });
    const widget = this.instantiationService.createInstance(optionGroup.searchable ? SearchableOptionPickerActionItem : ChatSessionPickerActionItem, action, initialState, itemDelegate, void 0);
    this._toolbarPickerDisposables.add(widget);
    this._toolbarPickerWidgets.set(optionGroup.id, widget);
    const slot = dom.append(this._toolbarPickersContainer, dom.$(".sessions-chat-picker-slot"));
    widget.render(slot);
  }
  _updateOptionContextKey(optionGroupId, optionItemId) {
    let contextKey = this._optionContextKeys.get(optionGroupId);
    if (!contextKey) {
      const rawKey = new RawContextKey(`chatSessionOption.${optionGroupId}`, "");
      contextKey = rawKey.bindTo(this.contextKeyService);
      this._optionContextKeys.set(optionGroupId, contextKey);
    }
    contextKey.set(optionItemId.trim());
  }
  _getOrCreateOptionEmitter(optionGroupId) {
    let emitter = this._optionEmitters.get(optionGroupId);
    if (!emitter) {
      emitter = new Emitter();
      this._optionEmitters.set(optionGroupId, emitter);
      this._toolbarPickerDisposables.add(emitter);
    }
    return emitter;
  }
  _clearToolbarPickers() {
    this._toolbarPickerDisposables.clear();
    this._toolbarPickerWidgets.clear();
    this._optionEmitters.clear();
    if (this._toolbarPickersContainer) {
      dom.clearNode(this._toolbarPickersContainer);
    }
  }
  _clearAllPickers() {
    this._clearToolbarPickers();
    if (this._folderPickerContainer) {
      this._folderPickerContainer.style.display = "none";
    }
    if (this._repoPickerContainer) {
      this._repoPickerContainer.style.display = "none";
    }
    if (this._extensionPickersLeftContainer) {
      this._extensionPickersLeftContainer.style.display = "none";
    }
  }
  // --- Input History (IHistoryNavigationWidget) ---
  showPreviousValue() {
    if (this._history.isAtStart()) {
      return;
    }
    if (this._draftState?.inputText || this._draftState?.attachments.length) {
      this._history.overlay(this._draftState);
    }
    this._navigateHistory(true);
  }
  showNextValue() {
    if (this._history.isAtEnd()) {
      return;
    }
    if (this._draftState?.inputText || this._draftState?.attachments.length) {
      this._history.overlay(this._draftState);
    }
    this._navigateHistory(false);
  }
  _updateDraftState() {
    const attachments = [...this._contextAttachments.attachments];
    this._draftState = {
      inputText: this._editor?.getModel()?.getValue() ?? "",
      attachments,
      mode: { id: ChatModeKind.Agent, kind: ChatModeKind.Agent },
      selectedModel: this._currentLanguageModel.get(),
      selections: this._editor?.getSelections() ?? [],
      contrib: {},
      target: this._targetPicker.selectedTarget,
      isolationMode: this._isolationModePicker.isolationMode,
      branch: this._branchPicker.selectedBranch,
      folderUri: this._folderPicker.selectedFolderUri?.toString(),
      repo: this._repoPicker.selectedRepo
    };
  }
  _navigateHistory(previous) {
    const entry = previous ? this._history.previous() : this._history.next();
    const inputText = entry?.inputText ?? "";
    if (entry) {
      this._editor?.getModel()?.setValue(inputText);
      this._contextAttachments.setAttachments(entry.attachments);
    }
    aria.status(inputText);
    if (previous) {
      this._editor.setPosition({ lineNumber: 1, column: 1 });
    } else {
      const model = this._editor.getModel();
      if (model) {
        const lastLine = model.getLineCount();
        this._editor.setPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) });
      }
    }
  }
  // --- Send ---
  _updateSendButtonState() {
    if (!this._sendButton) {
      return;
    }
    const hasText = !!this._editor?.getModel()?.getValue().trim();
    this._sendButton.enabled = !this._sending && hasText && !(this._newSession.value?.disabled ?? true);
  }
  async _send() {
    let query = this._editor.getModel()?.getValue().trim();
    const session = this._newSession.value;
    if (!query || !session || this._sending) {
      return;
    }
    if (session.disabled) {
      if (!this._hasRequiredRepoOrFolderSelection(session.target)) {
        this._openRepoOrFolderPicker(session.target);
      }
      return;
    }
    if (this._slashCommandHandler?.tryExecuteSlashCommand(query)) {
      this._editor.getModel()?.setValue("");
      return;
    }
    const expanded = this._slashCommandHandler?.tryExpandPromptSlashCommand(query);
    if (expanded) {
      query = expanded;
    }
    session.setQuery(query);
    session.setAttachedContext(this._contextAttachments.attachments.length > 0 ? [...this._contextAttachments.attachments] : void 0);
    if (this._draftState) {
      this._history.append(this._draftState);
    }
    this._clearDraftState();
    this._sending = true;
    this._editor.updateOptions({ readOnly: true });
    this._updateSendButtonState();
    this._updateInputLoadingState();
    try {
      await this.sessionsManagementService.sendRequestForNewSession(session.resource, {
        permissionLevel: this._permissionPicker.permissionLevel
      });
      this._newSessionListener.clear();
      this._contextAttachments.clear();
    } catch (e) {
      this.logService.error("Failed to send request:", e);
    }
    this._sending = false;
    this._editor.updateOptions({ readOnly: false });
    this._updateSendButtonState();
    this._updateInputLoadingState();
  }
  /**
   * Checks whether the required folder/repo selection exists for the given session type.
   * For Local/Background targets, checks the folder picker.
   * For other targets, checks extension-contributed repo/folder option groups.
   */
  _hasRequiredRepoOrFolderSelection(sessionType) {
    if (sessionType === AgentSessionProviders.Local || sessionType === AgentSessionProviders.Background) {
      return !!this._folderPicker.selectedFolderUri;
    }
    return !!this._repoPicker.selectedRepo;
  }
  _openRepoOrFolderPicker(sessionType) {
    if (sessionType === AgentSessionProviders.Local || sessionType === AgentSessionProviders.Background) {
      this._folderPicker.showPicker();
    } else {
      this._repoPicker.showPicker();
    }
  }
  async _requestFolderTrust(folderUri) {
    const trusted = await this.workspaceTrustRequestService.requestResourcesTrust({
      uri: folderUri,
      message: localize("trustFolderMessage", "An agent session will be able to read files, run commands, and make changes in this folder.")
    });
    if (!trusted) {
      this._folderPicker.removeFromRecents(folderUri);
      const previousFolderUri = this._newSession.value?.repoUri;
      if (previousFolderUri) {
        this._folderPicker.setSelectedFolder(previousFolderUri);
      } else {
        this._folderPicker.clearSelection();
      }
    }
    return !!trusted;
  }
  _resolveDefaultTarget(options) {
    const draft = this._getDraftState();
    if (draft?.target && options.allowedTargets.includes(draft.target)) {
      return draft.target;
    }
    return options.defaultTarget;
  }
  _restoreState() {
    const draft = this._getDraftState();
    if (draft) {
      this._editor?.getModel()?.setValue(draft.inputText);
      if (draft.attachments?.length) {
        this._contextAttachments.setAttachments(draft.attachments.map(IChatRequestVariableEntry.fromExport));
      }
      if (draft.selectedModel) {
        const models = this._getAvailableModels();
        const model = models.find((m) => m.identifier === draft.selectedModel?.identifier);
        if (model) {
          this._currentLanguageModel.set(model, void 0);
        }
      }
      if (draft.isolationMode) {
        if (this._isIsolationOptionEnabled) {
          this._isolationModePicker.setPreferredIsolationMode(draft.isolationMode);
          this._isolationModePicker.setIsolationMode(draft.isolationMode);
        } else {
          this._isolationModePicker.setPreferredIsolationMode("worktree");
          this._isolationModePicker.setIsolationMode("worktree");
        }
      }
      if (draft.branch) {
        this._branchPicker.setPreferredBranch(draft.branch);
      }
      if (draft.folderUri) {
        try {
          this._folderPicker.setSelectedFolder(URI.parse(draft.folderUri));
        } catch {
        }
      }
      if (draft.repo) {
        this._repoPicker.setSelectedRepo(draft.repo);
      }
    }
  }
  _getDraftState() {
    const raw = this.storageService.get(
      STORAGE_KEY_DRAFT_STATE,
      1
      /* StorageScope.WORKSPACE */
    );
    if (!raw) {
      return void 0;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return void 0;
    }
  }
  _clearDraftState() {
    const target = this._targetPicker.selectedTarget;
    const isLocal = target === AgentSessionProviders.Background;
    const preserved = {
      inputText: "",
      attachments: [],
      mode: { id: ChatModeKind.Agent, kind: ChatModeKind.Agent },
      selectedModel: this._draftState?.selectedModel,
      selections: [],
      contrib: {},
      target,
      isolationMode: isLocal ? this._isolationModePicker.isolationMode : void 0,
      branch: isLocal ? this._branchPicker.selectedBranch : void 0,
      folderUri: isLocal ? this._folderPicker.selectedFolderUri?.toString() : void 0,
      repo: isLocal ? void 0 : this._repoPicker.selectedRepo
    };
    this._draftState = preserved;
    this.storageService.store(
      STORAGE_KEY_DRAFT_STATE,
      JSON.stringify(preserved),
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  saveState() {
    if (this._draftState) {
      const state = {
        ...this._draftState,
        attachments: this._draftState.attachments.map(IChatRequestVariableEntry.toExport)
      };
      this.storageService.store(
        STORAGE_KEY_DRAFT_STATE,
        JSON.stringify(state),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
  layout(_height, _width) {
    this._editor?.layout();
  }
  focusInput() {
    this._editor?.focus();
  }
  updateAllowedTargets(targets) {
    this._targetPicker.updateAllowedTargets(targets);
  }
};
NewChatWidget = __decorate([
  __param(1, IInstantiationService),
  __param(2, IModelService),
  __param(3, IConfigurationService),
  __param(4, ILanguageModelsService),
  __param(5, IContextKeyService),
  __param(6, ILogService),
  __param(7, IHoverService),
  __param(8, ISessionsManagementService),
  __param(9, IGitService),
  __param(10, IStorageService),
  __param(11, IWorkspaceTrustRequestService)
], NewChatWidget);
const SessionsViewId = "workbench.view.sessions.chat";
let NewChatViewPane = class NewChatViewPane2 extends ViewPane {
  static {
    __name(this, "NewChatViewPane");
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, workspaceContextService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.workspaceContextService = workspaceContextService;
  }
  renderBody(container) {
    super.renderBody(container);
    this._widget = this._register(this.instantiationService.createInstance(NewChatWidget, {
      allowedTargets: this.computeAllowedTargets(),
      defaultTarget: AgentSessionProviders.Background
    }));
    this._widget.render(container);
    this._widget.focusInput();
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => {
      this._widget?.updateAllowedTargets(this.computeAllowedTargets());
    }));
  }
  computeAllowedTargets() {
    const targets = [AgentSessionProviders.Background, AgentSessionProviders.Cloud];
    return targets;
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._widget?.layout(height, width);
  }
  focus() {
    super.focus();
    this._widget?.focusInput();
  }
  setVisible(visible) {
    super.setVisible(visible);
    if (visible) {
      this._widget?.focusInput();
    }
  }
  saveState() {
    this._widget?.saveState();
  }
  dispose() {
    this._widget?.saveState();
    super.dispose();
  }
};
NewChatViewPane = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IWorkspaceContextService)
], NewChatViewPane);
export {
  NewChatViewPane,
  SessionsViewId
};
//# sourceMappingURL=newChatViewPane.js.map
