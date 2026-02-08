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
var ChatInputPart_1;
import * as dom from "../../../../../../base/browser/dom.js";
import { addDisposableListener } from "../../../../../../base/browser/dom.js";
import { DEFAULT_FONT_FAMILY } from "../../../../../../base/browser/fonts.js";
import { hasModifierKeys } from "../../../../../../base/browser/keyboardEvent.js";
import { ActionViewItem, BaseActionViewItem } from "../../../../../../base/browser/ui/actionbar/actionViewItems.js";
import * as aria from "../../../../../../base/browser/ui/aria/aria.js";
import { ButtonWithIcon } from "../../../../../../base/browser/ui/button/button.js";
import { createInstantHoverDelegate } from "../../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { equals as arraysEqual } from "../../../../../../base/common/arrays.js";
import { DeferredPromise, RunOnceScheduler } from "../../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../../base/common/map.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { mixin } from "../../../../../../base/common/objects.js";
import { autorun, derived, derivedOpts, observableFromEvent, observableValue } from "../../../../../../base/common/observable.js";
import { isMacintosh } from "../../../../../../base/common/platform.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { assertType } from "../../../../../../base/common/types.js";
import { URI } from "../../../../../../base/common/uri.js";
import { EditorExtensionsRegistry } from "../../../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { isLocation } from "../../../../../../editor/common/languages.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../../editor/common/services/resolverService.js";
import { CopyPasteController } from "../../../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js";
import { DropIntoEditorController } from "../../../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js";
import { ContentHoverController } from "../../../../../../editor/contrib/hover/browser/contentHoverController.js";
import { GlyphHoverController } from "../../../../../../editor/contrib/hover/browser/glyphHoverController.js";
import { LinkDetector } from "../../../../../../editor/contrib/links/browser/links.js";
import { SuggestController } from "../../../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize } from "../../../../../../nls.js";
import { IAccessibilityService } from "../../../../../../platform/accessibility/common/accessibility.js";
import { MenuWorkbenchButtonBar } from "../../../../../../platform/actions/browser/buttonbar.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { MenuId, MenuItemAction } from "../../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { registerAndCreateHistoryNavigationContext } from "../../../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { observableMemento } from "../../../../../../platform/observable/common/observableMemento.js";
import { bindContextKey } from "../../../../../../platform/observable/common/platformObservableUtils.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { ISharedWebContentExtractorService } from "../../../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IWorkbenchLayoutService } from "../../../../../services/layout/browser/layoutService.js";
import { IViewDescriptorService } from "../../../../../common/views.js";
import { ResourceLabels } from "../../../../../browser/labels.js";
import { IWorkbenchAssignmentService } from "../../../../../services/assignment/common/assignmentService.js";
import { IChatEntitlementService } from "../../../../../services/chat/common/chatEntitlementService.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../../../services/editor/common/editorService.js";
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from "../../../../codeEditor/browser/simpleEditorOptions.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { ChatRequestVariableSet, isElementVariableEntry, isImageVariableEntry, isNotebookOutputVariableEntry, isPasteVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isSCMHistoryItemChangeRangeVariableEntry, isSCMHistoryItemChangeVariableEntry, isSCMHistoryItemVariableEntry, isStringVariableEntry } from "../../../common/attachments/chatVariableEntries.js";
import { ChatMode, IChatModeService } from "../../../common/chatModes.js";
import { IChatService } from "../../../common/chatService/chatService.js";
import { agentOptionId, IChatSessionsService, isIChatSessionFileChange2, localChatSessionType } from "../../../common/chatSessionsService.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind, validateChatMode } from "../../../common/constants.js";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "../../../common/languageModels.js";
import { getChatSessionType } from "../../../common/model/chatUri.js";
import { IChatAgentService } from "../../../common/participants/chatAgents.js";
import { ILanguageModelToolsService } from "../../../common/tools/languageModelToolsService.js";
import { ChatHistoryNavigator } from "../../../common/widget/chatWidgetHistoryService.js";
import { ChatSessionPrimaryPickerAction, ChatSubmitAction, OpenDelegationPickerAction, OpenModelPickerAction, OpenModePickerAction, OpenSessionTargetPickerAction, OpenWorkspacePickerAction } from "../../actions/chatExecuteActions.js";
import { AgentSessionProviders, getAgentSessionProvider } from "../../agentSessions/agentSessions.js";
import { IAgentSessionsService } from "../../agentSessions/agentSessionsService.js";
import { ChatAttachmentModel } from "../../attachments/chatAttachmentModel.js";
import { DefaultChatAttachmentWidget, ElementChatAttachmentWidget, FileAttachmentWidget, ImageAttachmentWidget, NotebookCellOutputChatAttachmentWidget, PasteAttachmentWidget, PromptFileAttachmentWidget, PromptTextAttachmentWidget, SCMHistoryItemAttachmentWidget, SCMHistoryItemChangeAttachmentWidget, SCMHistoryItemChangeRangeAttachmentWidget, TerminalCommandAttachmentWidget, ToolSetOrToolItemAttachmentWidget } from "../../attachments/chatAttachmentWidgets.js";
import { ChatImplicitContexts } from "../../attachments/chatImplicitContext.js";
import { ImplicitContextAttachmentWidget } from "../../attachments/implicitContextAttachment.js";
import { isIChatResourceViewContext, isIChatViewViewContext } from "../../chat.js";
import { ChatEditingShowChangesAction, ViewAllSessionChangesAction, ViewPreviousEditsAction } from "../../chatEditing/chatEditingActions.js";
import { resizeImage } from "../../chatImageUtils.js";
import { ChatSessionPickerActionItem } from "../../chatSessions/chatSessionPickerActionItem.js";
import { SearchableOptionPickerActionItem } from "../../chatSessions/searchableOptionPickerActionItem.js";
import { IChatContextService } from "../../contextContrib/chatContextService.js";
import { CollapsibleListPool } from "../chatContentParts/chatReferencesContentPart.js";
import { ChatTodoListWidget } from "../chatContentParts/chatTodoListWidget.js";
import { ChatDragAndDrop } from "../chatDragAndDrop.js";
import { ChatFollowups } from "./chatFollowups.js";
import { ChatInputPartWidgetController } from "./chatInputPartWidgets.js";
import { ChatSelectedTools } from "./chatSelectedTools.js";
import { DelegationSessionPickerActionItem } from "./delegationSessionPickerActionItem.js";
import { ModelPickerActionItem } from "./modelPickerActionItem.js";
import { ModePickerActionItem } from "./modePickerActionItem.js";
import { SessionTypePickerActionItem } from "./sessionTargetPickerActionItem.js";
import { WorkspacePickerActionItem } from "./workspacePickerActionItem.js";
import { ChatContextUsageWidget } from "../../widgetHosts/viewPane/chatContextUsageWidget.js";
const $ = dom.$;
const INPUT_EDITOR_MAX_HEIGHT = 250;
const CachedLanguageModelsKey = "chat.cachedLanguageModels.v2";
var ChatWidgetLocation;
(function(ChatWidgetLocation2) {
  ChatWidgetLocation2["SidebarLeft"] = "sidebarLeft";
  ChatWidgetLocation2["SidebarRight"] = "sidebarRight";
  ChatWidgetLocation2["Panel"] = "panel";
  ChatWidgetLocation2["Editor"] = "editor";
})(ChatWidgetLocation || (ChatWidgetLocation = {}));
const emptyInputState = observableMemento({
  defaultValue: void 0,
  key: "chat.untitledInputState",
  toStorage: JSON.stringify,
  fromStorage(value) {
    const obj = JSON.parse(value);
    if (obj.selectedModel && !obj.selectedModel.metadata.isDefaultForLocation) {
      const oldIsDefault = obj.selectedModel.metadata.isDefault;
      const isDefaultForLocation = { [ChatAgentLocation.Chat]: Boolean(oldIsDefault) };
      mixin(obj.selectedModel.metadata, { isDefaultForLocation });
      delete obj.selectedModel.metadata.isDefault;
    }
    return obj;
  }
});
let ChatInputPart = class ChatInputPart2 extends Disposable {
  static {
    __name(this, "ChatInputPart");
  }
  static {
    ChatInputPart_1 = this;
  }
  static {
    this._counter = 0;
  }
  get attachmentModel() {
    return this._attachmentModel;
  }
  getAttachedContext(sessionResource) {
    const contextArr = new ChatRequestVariableSet();
    contextArr.add(...this.attachmentModel.attachments, ...this.chatContextService.getWorkspaceContextItems());
    return contextArr;
  }
  getAttachedAndImplicitContext(sessionResource) {
    const contextArr = this.getAttachedContext(sessionResource);
    if (this.implicitContext) {
      const implicitChatVariables = this.implicitContext.enabledBaseEntries(this.configurationService.getValue("chat.implicitContext.suggestedContext"));
      contextArr.add(...implicitChatVariables);
    }
    return contextArr;
  }
  get implicitContext() {
    return this._implicitContext;
  }
  get inputEditor() {
    return this._inputEditor;
  }
  get currentLanguageModel() {
    return this._currentLanguageModel.get()?.identifier;
  }
  get selectedLanguageModel() {
    return this._currentLanguageModel;
  }
  get currentModeKind() {
    const mode = this._currentModeObservable.get();
    return mode.kind === ChatModeKind.Agent && !this.agentService.hasToolsAgent ? ChatModeKind.Edit : mode.kind;
  }
  get currentModeObs() {
    return this._currentModeObservable;
  }
  get currentModeInfo() {
    const mode = this._currentModeObservable.get();
    const modeId = mode.isBuiltin ? this.currentModeKind : "custom";
    const modeInstructions = mode.modeInstructions?.get();
    return {
      kind: this.currentModeKind,
      isBuiltin: mode.isBuiltin,
      modeInstructions: modeInstructions ? {
        name: mode.name.get(),
        content: modeInstructions.content,
        toolReferences: this.toolService.toToolReferences(modeInstructions.toolReferences),
        metadata: modeInstructions.metadata
      } : void 0,
      modeId,
      applyCodeBlockSuggestionId: void 0
    };
  }
  get selectedElements() {
    const edits = [];
    const editsList = this._chatEditList?.object;
    const selectedElements = editsList?.getSelectedElements() ?? [];
    for (const element of selectedElements) {
      if (element.kind === "reference" && URI.isUri(element.reference)) {
        edits.push(element.reference);
      }
    }
    return edits;
  }
  /**
   * The number of working set entries that the user actually wanted to attach.
   * This is less than or equal to {@link ChatInputPart.chatEditWorkingSetFiles}.
   */
  get attemptedWorkingSetEntriesCount() {
    return this._attemptedWorkingSetEntriesCount;
  }
  /**
   * Gets the pending delegation target if one is set.
   * This is used when the user changes the session target picker to a different provider
   * but hasn't submitted yet, so the delegation will happen on submit.
   */
  get pendingDelegationTarget() {
    return this._pendingDelegationTarget;
  }
  constructor(location, options, styles, inline, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService, languageModelsService, logService, fileService, editorService, themeService, textModelResolverService, storageService, agentService, sharedWebExtracterService, experimentService, entitlementService, chatModeService, toolService, chatService, chatSessionsService, chatContextService, agentSessionsService, workspaceContextService, layoutService, viewDescriptorService) {
    super();
    this.location = location;
    this.options = options;
    this.inline = inline;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.accessibilityService = accessibilityService;
    this.languageModelsService = languageModelsService;
    this.logService = logService;
    this.fileService = fileService;
    this.editorService = editorService;
    this.themeService = themeService;
    this.textModelResolverService = textModelResolverService;
    this.storageService = storageService;
    this.agentService = agentService;
    this.sharedWebExtracterService = sharedWebExtracterService;
    this.experimentService = experimentService;
    this.entitlementService = entitlementService;
    this.chatModeService = chatModeService;
    this.toolService = toolService;
    this.chatService = chatService;
    this.chatSessionsService = chatSessionsService;
    this.chatContextService = chatContextService;
    this.agentSessionsService = agentSessionsService;
    this.workspaceContextService = workspaceContextService;
    this.layoutService = layoutService;
    this.viewDescriptorService = viewDescriptorService;
    this._workingSetCollapsed = observableValue("chatInputPart.workingSetCollapsed", true);
    this._chatInputTodoListWidget = this._register(new MutableDisposable());
    this._chatEditingTodosDisposables = this._register(new DisposableStore());
    this._onDidLoadInputState = this._register(new Emitter());
    this.onDidLoadInputState = this._onDidLoadInputState.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._onDidChangeContext = this._register(new Emitter());
    this.onDidChangeContext = this._onDidChangeContext.event;
    this._onDidAcceptFollowup = this._register(new Emitter());
    this.onDidAcceptFollowup = this._onDidAcceptFollowup.event;
    this._onDidClickOverlay = this._register(new Emitter());
    this.onDidClickOverlay = this._onDidClickOverlay.event;
    this._implicitContextWidget = this._register(new MutableDisposable());
    this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
    this._indexOfLastOpenedContext = -1;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.inputEditorHeight = 0;
    this.followupsDisposables = this._register(new DisposableStore());
    this.overlayClickListener = this._register(new MutableDisposable());
    this.attachedContextDisposables = this._register(new MutableDisposable());
    this._widgetController = this._register(new MutableDisposable());
    this._contextUsageDisposables = this._register(new MutableDisposable());
    this.height = observableValue(this, 0);
    this._modelSyncDisposables = this._register(new DisposableStore());
    this._isSyncingToOrFromInputModel = false;
    this.chatSessionPickerWidgets = /* @__PURE__ */ new Map();
    this._waitForPersistedLanguageModel = this._register(new MutableDisposable());
    this._chatSessionOptionEmitters = /* @__PURE__ */ new Map();
    this._optionContextKeys = /* @__PURE__ */ new Map();
    this._currentLanguageModel = observableValue("_currentLanguageModel", void 0);
    this._onDidChangeCurrentChatMode = this._register(new Emitter());
    this.onDidChangeCurrentChatMode = this._onDidChangeCurrentChatMode.event;
    this.inputUri = URI.parse(`${Schemas.vscodeChatInput}:input-${ChatInputPart_1._counter++}`);
    this._workingSetLinesAddedSpan = new Lazy(() => dom.$(".working-set-lines-added"));
    this._workingSetLinesRemovedSpan = new Lazy(() => dom.$(".working-set-lines-removed"));
    this._chatEditsActionsDisposables = this._register(new DisposableStore());
    this._chatEditsDisposables = this._register(new DisposableStore());
    this._renderingChatEdits = this._register(new MutableDisposable());
    this._attemptedWorkingSetEntriesCount = 0;
    this._chatSessionIsEmpty = false;
    this._pendingDelegationTarget = void 0;
    this._syncTextDebounced = this._register(new RunOnceScheduler(() => this._syncInputStateToModel(), 150));
    this._emptyInputState = this._register(emptyInputState(1, 0, this.storageService));
    this._contextResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event }));
    this._currentModeObservable = observableValue("currentMode", this.options.defaultMode ?? ChatMode.Agent);
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this._indexOfLastOpenedContext = -1;
      this.refreshChatSessionPickers();
    }));
    this._register(this.chatSessionsService.onDidChangeSessionOptions((e) => {
      const sessionResource = this._widget?.viewModel?.model.sessionResource;
      if (sessionResource && isEqual(sessionResource, e)) {
        this.refreshChatSessionPickers();
      }
    }));
    this._register(this.chatSessionsService.onDidChangeOptionGroups((chatSessionType) => {
      const sessionResource = this._widget?.viewModel?.model.sessionResource;
      if (sessionResource) {
        const ctx = this.chatService.getChatSessionFromInternalUri(sessionResource);
        const delegateSessionType = this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.();
        if (ctx?.chatSessionType === chatSessionType || delegateSessionType === chatSessionType) {
          this.refreshChatSessionPickers();
        }
      }
    }));
    if (this.options.sessionTypePickerDelegate?.onDidChangeActiveSessionProvider) {
      this._register(this.options.sessionTypePickerDelegate.onDidChangeActiveSessionProvider(async (newSessionType) => {
        this.computeVisibleOptionGroups();
        this.agentSessionTypeKey.set(newSessionType);
        this.updateWidgetLockStateFromSessionType(newSessionType);
        this.refreshChatSessionPickers();
      }));
    }
    this._attachmentModel = this._register(this.instantiationService.createInstance(ChatAttachmentModel));
    this._register(this._attachmentModel.onDidChange(() => this._syncInputStateToModel()));
    this.selectedToolsModel = this._register(this.instantiationService.createInstance(ChatSelectedTools, this.currentModeObs, this._currentLanguageModel));
    this.dnd = this._register(this.instantiationService.createInstance(ChatDragAndDrop, () => this._widget, this._attachmentModel, styles));
    this.inputEditorMaxHeight = this.options.renderStyle === "compact" ? INPUT_EDITOR_MAX_HEIGHT / 3 : INPUT_EDITOR_MAX_HEIGHT;
    this.inputEditorHasText = ChatContextKeys.inputHasText.bindTo(contextKeyService);
    this.chatCursorAtTop = ChatContextKeys.inputCursorAtTop.bindTo(contextKeyService);
    this.inputEditorHasFocus = ChatContextKeys.inputHasFocus.bindTo(contextKeyService);
    this.chatModeKindKey = ChatContextKeys.chatModeKind.bindTo(contextKeyService);
    this.chatModeNameKey = ChatContextKeys.chatModeName.bindTo(contextKeyService);
    this.withinEditSessionKey = ChatContextKeys.withinEditSessionDiff.bindTo(contextKeyService);
    this.filePartOfEditSessionKey = ChatContextKeys.filePartOfEditSession.bindTo(contextKeyService);
    this.chatSessionHasOptions = ChatContextKeys.chatSessionHasModels.bindTo(contextKeyService);
    this.chatSessionOptionsValid = ChatContextKeys.chatSessionOptionsValid.bindTo(contextKeyService);
    this.agentSessionTypeKey = ChatContextKeys.agentSessionType.bindTo(contextKeyService);
    if (this.options.sessionTypePickerDelegate?.getActiveSessionProvider) {
      const initialSessionType = this.options.sessionTypePickerDelegate.getActiveSessionProvider();
      if (initialSessionType) {
        this.agentSessionTypeKey.set(initialSessionType);
      }
    }
    this.chatSessionHasCustomAgentTarget = ChatContextKeys.chatSessionHasCustomAgentTarget.bindTo(contextKeyService);
    this.history = this._register(this.instantiationService.createInstance(ChatHistoryNavigator, this.location));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      const newOptions = {};
      if (e.affectsConfiguration(
        "accessibility.verbosity.panelChat"
        /* AccessibilityVerbositySettingId.Chat */
      )) {
        newOptions.ariaLabel = this._getAriaLabel();
      }
      if (e.affectsConfiguration("editor.wordSegmenterLocales")) {
        newOptions.wordSegmenterLocales = this.configurationService.getValue("editor.wordSegmenterLocales");
      }
      if (e.affectsConfiguration("editor.autoClosingBrackets")) {
        newOptions.autoClosingBrackets = this.configurationService.getValue("editor.autoClosingBrackets");
      }
      if (e.affectsConfiguration("editor.autoClosingQuotes")) {
        newOptions.autoClosingQuotes = this.configurationService.getValue("editor.autoClosingQuotes");
      }
      if (e.affectsConfiguration("editor.autoSurround")) {
        newOptions.autoSurround = this.configurationService.getValue("editor.autoSurround");
      }
      this.inputEditor.updateOptions(newOptions);
    }));
    this._chatEditsListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, MenuId.ChatEditingWidgetModifiedFilesToolbar, {
      verticalScrollMode: 3
      /* ScrollbarVisibility.Visible */
    }));
    this._hasFileAttachmentContextKey = ChatContextKeys.hasFileAttachments.bindTo(contextKeyService);
    this.initSelectedModel();
    this._register(this.languageModelsService.onDidChangeLanguageModels((vendor) => {
      this.storageService.store(
        CachedLanguageModelsKey,
        this.storageService.getObject(CachedLanguageModelsKey, -1, []).filter((m) => !m.identifier.startsWith(vendor)),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
      const selectedModel = this._currentLanguageModel ? this.getModels().find((m) => m.identifier === this._currentLanguageModel.get()?.identifier) : void 0;
      const selectedModelNotAvailable = this._currentLanguageModel && !selectedModel?.metadata.isUserSelectable;
      if (!this.currentLanguageModel || selectedModelNotAvailable) {
        this.setCurrentLanguageModelToDefault();
      }
    }));
    this._register(this.onDidChangeCurrentChatMode(() => {
      this.accessibilityService.alert(this._currentModeObservable.get().label.get());
      if (this._inputEditor) {
        this._inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
      }
      this.setImplicitContextEnablement();
    }));
    this._register(autorun((reader) => {
      const lm = this._currentLanguageModel.read(reader);
      if (lm?.metadata.name) {
        this.accessibilityService.alert(lm.metadata.name);
      }
      this._inputEditor?.updateOptions({ ariaLabel: this._getAriaLabel() });
    }));
    this._register(this.chatModeService.onDidChangeChatModes(() => this.validateCurrentChatMode()));
    this._register(autorun((r) => {
      const mode = this._currentModeObservable.read(r);
      this.chatModeKindKey.set(mode.kind);
      this.chatModeNameKey.set(mode.name.read(r));
      const models = mode.model?.read(r);
      if (models) {
        this.switchModelByQualifiedName(models);
      }
    }));
    this._register(autorun((r) => {
      const mode = this._currentModeObservable.read(r);
      const modeName = mode.name.read(r);
      const sessionResource = this._widget?.viewModel?.model.sessionResource;
      if (sessionResource) {
        const ctx = this.chatService.getChatSessionFromInternalUri(sessionResource);
        if (ctx) {
          this.chatSessionsService.notifySessionOptionsChange(ctx.chatSessionResource, [{ optionId: agentOptionId, value: mode.isBuiltin ? "" : modeName }]).catch((err) => this.logService.error("Failed to notify extension of agent change:", err));
        }
      }
    }));
    this.validateCurrentChatMode();
  }
  setImplicitContextEnablement() {
    if (this.implicitContext && this.configurationService.getValue("chat.implicitContext.suggestedContext")) {
      this.implicitContext.setEnabled(this._currentModeObservable.get().kind !== ChatMode.Agent.kind);
    }
  }
  setIsWithinEditSession(inInsideDiff, isFilePartOfEditSession) {
    this.withinEditSessionKey.set(inInsideDiff);
    this.filePartOfEditSessionKey.set(isFilePartOfEditSession);
  }
  getSelectedModelStorageKey() {
    return `chat.currentLanguageModel.${this.location}`;
  }
  getSelectedModelIsDefaultStorageKey() {
    return `chat.currentLanguageModel.${this.location}.isDefault`;
  }
  initSelectedModel() {
    const persistedSelection = this.storageService.get(
      this.getSelectedModelStorageKey(),
      -1
      /* StorageScope.APPLICATION */
    );
    const persistedAsDefault = this.storageService.getBoolean(this.getSelectedModelIsDefaultStorageKey(), -1, persistedSelection === "copilot/gpt-4.1");
    if (persistedSelection) {
      const model = this.getModels().find((m) => m.identifier === persistedSelection);
      if (model) {
        if (!persistedAsDefault || model.metadata.isDefaultForLocation[this.location]) {
          this.setCurrentLanguageModel(model);
          this.checkModelSupported();
        }
      } else {
        this._waitForPersistedLanguageModel.value = this.languageModelsService.onDidChangeLanguageModels((e) => {
          const persistedModel = this.languageModelsService.lookupLanguageModel(persistedSelection);
          if (persistedModel) {
            this._waitForPersistedLanguageModel.clear();
            if (!persistedAsDefault || persistedModel.isDefaultForLocation[this.location]) {
              if (persistedModel.isUserSelectable) {
                this.setCurrentLanguageModel({ metadata: persistedModel, identifier: persistedSelection });
                this.checkModelSupported();
              }
            }
          } else {
            this.setCurrentLanguageModelToDefault();
          }
        });
      }
    }
    this._register(this._onDidChangeCurrentChatMode.event(() => {
      this.checkModelSupported();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.Edits2Enabled)) {
        this.checkModelSupported();
      }
    }));
  }
  setEditing(enabled) {
    this.currentlyEditingInputKey?.set(enabled);
  }
  switchModel(modelMetadata) {
    const models = this.getModels();
    const model = models.find((m) => m.metadata.vendor === modelMetadata.vendor && m.metadata.id === modelMetadata.id && m.metadata.family === modelMetadata.family);
    if (model) {
      this.setCurrentLanguageModel(model);
    }
  }
  switchModelByQualifiedName(qualifiedModelNames) {
    const models = this.getModels();
    for (const qualifiedModelName of qualifiedModelNames) {
      const model = models.find((m) => ILanguageModelChatMetadata.matchesQualifiedName(qualifiedModelName, m.metadata));
      if (model) {
        this.setCurrentLanguageModel(model);
        return true;
      }
    }
    this.logService.warn(`[chat] Node of the models "${qualifiedModelNames.join(", ")}" not found. Use format "<name> (<vendor>)", e.g. "GPT-4o (copilot)".`);
    return false;
  }
  switchToNextModel() {
    const models = this.getModels();
    if (models.length > 0) {
      const currentIndex = models.findIndex((model) => model.identifier === this._currentLanguageModel.get()?.identifier);
      const nextIndex = (currentIndex + 1) % models.length;
      this.setCurrentLanguageModel(models[nextIndex]);
    }
  }
  openModelPicker() {
    this.modelWidget?.show();
  }
  openModePicker() {
    this.modeWidget?.show();
  }
  openSessionTargetPicker() {
    this.sessionTargetWidget?.show();
  }
  openDelegationPicker() {
    this.delegationWidget?.show();
  }
  openChatSessionPicker() {
    const firstWidget = this.chatSessionPickerWidgets?.values()?.next().value;
    firstWidget?.show();
  }
  /**
   * Create picker widgets for all option groups available for the current session type.
   */
  createChatSessionPickerWidgets(action) {
    this._lastSessionPickerAction = action;
    const result = this.computeVisibleOptionGroups();
    if (!result) {
      return [];
    }
    const { visibleGroupIds, optionGroups, effectiveSessionType } = result;
    this.disposeSessionPickerWidgets();
    const widgets = [];
    for (const optionGroup of optionGroups) {
      if (!visibleGroupIds.has(optionGroup.id)) {
        continue;
      }
      const initialItem = this.getCurrentOptionForGroup(optionGroup.id);
      const initialState = { group: optionGroup, item: initialItem };
      const itemDelegate = {
        getCurrentOption: /* @__PURE__ */ __name(() => this.getCurrentOptionForGroup(optionGroup.id), "getCurrentOption"),
        onDidChangeOption: this.getOrCreateOptionEmitter(optionGroup.id).event,
        setOption: /* @__PURE__ */ __name((option) => {
          this.updateOptionContextKey(optionGroup.id, option.id);
          this.getOrCreateOptionEmitter(optionGroup.id).fire(option);
          const sessionResource = this._widget?.viewModel?.model.sessionResource;
          const currentCtx = sessionResource ? this.chatService.getChatSessionFromInternalUri(sessionResource) : void 0;
          if (currentCtx) {
            this.chatSessionsService.notifySessionOptionsChange(currentCtx.chatSessionResource, [{ optionId: optionGroup.id, value: option }]).catch((err) => this.logService.error(`Failed to notify extension of ${optionGroup.id} change:`, err));
          }
          this.refreshChatSessionPickers();
        }, "setOption"),
        getOptionGroup: /* @__PURE__ */ __name(() => {
          const groups = this.chatSessionsService.getOptionGroupsForSessionType(effectiveSessionType);
          return groups?.find((g) => g.id === optionGroup.id);
        }, "getOptionGroup"),
        getSessionResource: /* @__PURE__ */ __name(() => {
          return this._widget?.viewModel?.model.sessionResource;
        }, "getSessionResource")
      };
      const widget = this.instantiationService.createInstance(optionGroup.searchable ? SearchableOptionPickerActionItem : ChatSessionPickerActionItem, action, initialState, itemDelegate);
      this.chatSessionPickerWidgets.set(optionGroup.id, widget);
      widgets.push(widget);
    }
    return widgets;
  }
  /**
   * Set the input model reference for syncing input state
   */
  setInputModel(model, chatSessionIsEmpty) {
    this._inputModel = model;
    this._modelSyncDisposables.clear();
    this.selectedToolsModel.resetSessionEnablementState();
    this._chatSessionIsEmpty = chatSessionIsEmpty;
    if (chatSessionIsEmpty) {
      this._setEmptyModelState();
    }
    this._modelSyncDisposables.add(autorun((reader) => {
      let state = model.state.read(reader);
      if (!state && this._chatSessionIsEmpty) {
        state = this._emptyInputState.read(void 0);
      }
      this._syncFromModel(state);
    }));
  }
  _setEmptyModelState() {
    const storageKey = this.getDefaultModeExperimentStorageKey();
    const hasSetDefaultMode = this.storageService.getBoolean(storageKey, 1, false);
    if (!hasSetDefaultMode) {
      const isAnonymous = this.entitlementService.anonymous;
      this.experimentService.getTreatment("chat.defaultMode").then(((defaultModeTreatment) => {
        if (isAnonymous) {
          defaultModeTreatment = ChatModeKind.Agent;
        }
        if (typeof defaultModeTreatment === "string") {
          this.storageService.store(
            storageKey,
            true,
            1,
            1
            /* StorageTarget.MACHINE */
          );
          const defaultMode = validateChatMode(defaultModeTreatment);
          if (defaultMode) {
            this.logService.trace(`Applying default mode from experiment: ${defaultMode}`);
            this.setChatMode(defaultMode, false);
            this.checkModelSupported();
          }
        }
      }));
    }
  }
  /**
   * Sync from model to view (when model state changes)
   */
  _syncFromModel(state) {
    if (this._isSyncingToOrFromInputModel) {
      return;
    }
    try {
      this._isSyncingToOrFromInputModel = true;
      if (state) {
        const currentMode = this._currentModeObservable.get();
        if (currentMode.id !== state.mode.id) {
          this.setChatMode(state.mode.id, false);
        }
      }
      if (state?.selectedModel) {
        const lm = this._currentLanguageModel.get();
        if (!lm || lm.identifier !== state.selectedModel.identifier) {
          this.setCurrentLanguageModel(state.selectedModel);
        }
      }
      const currentAttachments = this._attachmentModel.attachments;
      if (!state) {
        this._attachmentModel.clear();
      } else if (!arraysEqual(currentAttachments, state.attachments)) {
        this._attachmentModel.clearAndSetContext(...state.attachments);
      }
      if (this._inputEditor) {
        this._inputEditor.setValue(state?.inputText || "");
        if (state?.selections.length) {
          this._inputEditor.setSelections(state.selections);
        }
      }
      if (state) {
        this._widget?.contribs.forEach((contrib) => {
          contrib.setInputState?.(state.contrib);
        });
      }
    } finally {
      this._isSyncingToOrFromInputModel = false;
    }
  }
  /**
   * Sync current input state to the input model
   */
  _syncInputStateToModel() {
    if (this._isSyncingToOrFromInputModel) {
      return;
    }
    this._isSyncingToOrFromInputModel = true;
    const state = this.getCurrentInputState();
    if (this._chatSessionIsEmpty) {
      this._emptyInputState.set(state, void 0);
    }
    this._inputModel?.setState(state);
    this._isSyncingToOrFromInputModel = false;
  }
  setCurrentLanguageModel(model) {
    this._currentLanguageModel.set(model, void 0);
    if (this.cachedWidth) {
      this.layout(this.cachedWidth);
    }
    this.storageService.store(
      this.getSelectedModelStorageKey(),
      model.identifier,
      -1,
      0
      /* StorageTarget.USER */
    );
    this.storageService.store(
      this.getSelectedModelIsDefaultStorageKey(),
      !!model.metadata.isDefaultForLocation[this.location],
      -1,
      0
      /* StorageTarget.USER */
    );
    this._syncInputStateToModel();
  }
  checkModelSupported() {
    const lm = this._currentLanguageModel.get();
    if (lm && (!this.modelSupportedForDefaultAgent(lm) || !this.modelSupportedForInlineChat(lm))) {
      this.setCurrentLanguageModelToDefault();
    }
  }
  /**
   * By ID- prefer this method
   */
  setChatMode(mode, storeSelection = true) {
    if (!this.options.supportsChangingModes) {
      return;
    }
    const mode2 = this.chatModeService.findModeById(mode) ?? this.chatModeService.findModeById(ChatModeKind.Agent) ?? ChatMode.Ask;
    this.setChatMode2(mode2, storeSelection);
  }
  setChatMode2(mode, storeSelection = true) {
    if (!this.options.supportsChangingModes) {
      return;
    }
    this._currentModeObservable.set(mode, void 0);
    this._onDidChangeCurrentChatMode.fire();
    this._syncInputStateToModel();
  }
  modelSupportedForDefaultAgent(model) {
    if (this.currentModeKind === ChatModeKind.Agent || this.currentModeKind === ChatModeKind.Edit && this.configurationService.getValue(ChatConfiguration.Edits2Enabled)) {
      return ILanguageModelChatMetadata.suitableForAgentMode(model.metadata);
    }
    return true;
  }
  modelSupportedForInlineChat(model) {
    if (this.location !== ChatAgentLocation.EditorInline || !this.configurationService.getValue(
      "inlineChat.enableV2"
      /* InlineChatConfigKeys.EnableV2 */
    )) {
      return true;
    }
    return !!model.metadata.capabilities?.toolCalling;
  }
  getModels() {
    const cachedModels = this.storageService.getObject(CachedLanguageModelsKey, -1, []);
    let models = this.languageModelsService.getLanguageModelIds().map((modelId) => ({ identifier: modelId, metadata: this.languageModelsService.lookupLanguageModel(modelId) }));
    if (models.length === 0 || models.some((m) => m.metadata.isDefaultForLocation[this.location]) === false) {
      models = cachedModels;
    } else {
      this.storageService.store(
        CachedLanguageModelsKey,
        models,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    }
    models.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    return models.filter((entry) => entry.metadata?.isUserSelectable && this.modelSupportedForDefaultAgent(entry) && this.modelSupportedForInlineChat(entry));
  }
  setCurrentLanguageModelToDefault() {
    const allModels = this.getModels();
    const defaultModel = allModels.find((m) => m.metadata.isDefaultForLocation[this.location]) || allModels.find((m) => m.metadata.isUserSelectable);
    if (defaultModel) {
      this.setCurrentLanguageModel(defaultModel);
    }
  }
  /**
   * Get the current input state for history
   */
  getCurrentInputState() {
    const mode = this._currentModeObservable.get();
    const state = {
      inputText: this._inputEditor?.getValue() ?? "",
      attachments: this._attachmentModel.attachments,
      mode: {
        id: mode.id,
        kind: mode.kind
      },
      selectedModel: this._currentLanguageModel.get(),
      selections: this._inputEditor?.getSelections() || [],
      contrib: {}
    };
    for (const contrib of this._widget?.contribs || Iterable.empty()) {
      contrib.getInputState?.(state.contrib);
    }
    return state;
  }
  _getAriaLabel() {
    const verbose = this.configurationService.getValue(
      "accessibility.verbosity.panelChat"
      /* AccessibilityVerbositySettingId.Chat */
    );
    let kbLabel;
    if (verbose) {
      kbLabel = this.keybindingService.lookupKeybinding(
        "editor.action.accessibilityHelp"
        /* AccessibilityCommandId.OpenAccessibilityHelp */
      )?.getLabel();
    }
    const mode = this._currentModeObservable.get();
    const modelName = this._currentLanguageModel.get()?.metadata.name;
    const modelInfo = modelName ? localize("chatInput.model", ", {0}. ", modelName) : "";
    let modeLabel = "";
    if (!mode.isBuiltin) {
      const mode2 = this.currentModeObs.get();
      modeLabel = localize("chatInput.mode.custom", "({0}), {1}", mode2.label.get(), mode2.description.get());
    } else {
      switch (this.currentModeKind) {
        case ChatModeKind.Agent:
          modeLabel = localize("chatInput.mode.agent", "(Agent), edit files in your workspace.");
          break;
        case ChatModeKind.Edit:
          modeLabel = localize("chatInput.mode.edit", "(Edit), edit files in your workspace.");
          break;
        case ChatModeKind.Ask:
        default:
          modeLabel = localize("chatInput.mode.ask", "(Ask), ask questions or type / for topics.");
          break;
      }
    }
    if (verbose) {
      return kbLabel ? localize("actions.chat.accessibiltyHelp", "Chat Input {0}{1} Press Enter to send out the request. Use {2} for Chat Accessibility Help.", modeLabel, modelInfo, kbLabel) : localize("chatInput.accessibilityHelpNoKb", "Chat Input {0}{1} Press Enter to send out the request. Use the Chat Accessibility Help command for more information.", modeLabel, modelInfo);
    } else {
      return localize("chatInput.accessibilityHelp", "Chat Input {0}{1}.", modeLabel, modelInfo);
    }
  }
  validateCurrentChatMode() {
    const currentMode = this._currentModeObservable.get();
    const validMode = this.chatModeService.findModeById(currentMode.id);
    const isAgentModeEnabled = this.configurationService.getValue(ChatConfiguration.AgentEnabled);
    if (!validMode) {
      this.setChatMode(isAgentModeEnabled ? ChatModeKind.Agent : ChatModeKind.Ask);
      return;
    }
    if (currentMode.kind === ChatModeKind.Agent && !isAgentModeEnabled) {
      this.setChatMode(ChatModeKind.Ask);
      return;
    }
  }
  getDefaultModeExperimentStorageKey() {
    const tag = this.options.widgetViewKindTag;
    return `chat.${tag}.hasSetDefaultModeByExperiment`;
  }
  logInputHistory() {
    const historyStr = this.history.values.map((entry) => JSON.stringify(entry)).join("\n");
    this.logService.info(`[${this.location}] Chat input history:`, historyStr);
  }
  setVisible(visible) {
    this._onDidChangeVisibility.fire(visible);
  }
  /** If consumers are busy generating the chat input, returns the promise resolved when they finish */
  get generating() {
    return this._generating?.defer.p;
  }
  /** Disables the input submissions buttons until the disposable is disposed. */
  startGenerating() {
    this.logService.trace("ChatWidget#startGenerating");
    if (this._generating) {
      this._generating.rc++;
    } else {
      this._generating = { rc: 1, defer: new DeferredPromise() };
    }
    return toDisposable(() => {
      this.logService.trace("ChatWidget#doneGenerating");
      if (this._generating && !--this._generating.rc) {
        this._generating.defer.complete();
        this._generating = void 0;
      }
    });
  }
  get element() {
    return this.container;
  }
  async showPreviousValue() {
    if (this.history.isAtStart()) {
      return;
    }
    const state = this.getCurrentInputState();
    if (state.inputText || state.attachments.length) {
      this.history.overlay(state);
    }
    this.navigateHistory(true);
  }
  async showNextValue() {
    if (this.history.isAtEnd()) {
      return;
    }
    const state = this.getCurrentInputState();
    if (state.inputText || state.attachments.length) {
      this.history.overlay(state);
    }
    this.navigateHistory(false);
  }
  async navigateHistory(previous) {
    const historyEntry = previous ? this.history.previous() : this.history.next();
    let historyAttachments = historyEntry?.attachments ?? [];
    if (historyAttachments.length > 0) {
      historyAttachments = (await Promise.all(historyAttachments.map(async (attachment) => {
        if (isImageVariableEntry(attachment) && attachment.references?.length && URI.isUri(attachment.references[0].reference)) {
          const currReference = attachment.references[0].reference;
          try {
            const imageBinary = currReference.toString(true).startsWith("http") ? await this.sharedWebExtracterService.readImage(currReference, CancellationToken.None) : (await this.fileService.readFile(currReference)).value;
            if (!imageBinary) {
              return void 0;
            }
            const newAttachment = { ...attachment };
            newAttachment.value = isImageVariableEntry(attachment) && attachment.isPasted ? imageBinary.buffer : await resizeImage(imageBinary.buffer);
            return newAttachment;
          } catch (err) {
            this.logService.error("Failed to fetch and reference.", err);
            return void 0;
          }
        }
        return attachment;
      }))).filter((attachment) => attachment !== void 0);
    }
    this._attachmentModel.clearAndSetContext(...historyAttachments);
    const inputText = historyEntry?.inputText ?? "";
    const contribData = historyEntry?.contrib ?? {};
    aria.status(inputText);
    this.setValue(inputText, true);
    this._widget?.contribs.forEach((contrib) => {
      contrib.setInputState?.(contribData);
    });
    this._onDidLoadInputState.fire();
    const model = this._inputEditor.getModel();
    if (!model) {
      return;
    }
    if (previous) {
      this._inputEditor.setPosition({ lineNumber: 1, column: 1 });
    } else {
      this._inputEditor.setPosition(getLastPosition(model));
    }
  }
  setValue(value, transient) {
    this.inputEditor.setValue(value);
    const model = this.inputEditor.getModel();
    if (model) {
      this.inputEditor.setPosition(getLastPosition(model));
    }
  }
  focus() {
    this._inputEditor.focus();
  }
  hasFocus() {
    return this._inputEditor.hasWidgetFocus();
  }
  /**
   * Reset the input and update history.
   * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
   */
  async acceptInput(isUserQuery) {
    if (isUserQuery) {
      const userQuery = this.getCurrentInputState();
      this.history.append(this._getFilteredEntry(userQuery));
    }
    if (this._chatSessionIsEmpty) {
      this._chatSessionIsEmpty = false;
      this._emptyInputState.set(void 0, void 0);
    }
    this.attachmentModel.clear();
    this._onDidLoadInputState.fire();
    if (this.accessibilityService.isScreenReaderOptimized() && isMacintosh) {
      this._acceptInputForVoiceover();
    } else {
      this._inputEditor.focus();
      this._inputEditor.setValue("");
    }
  }
  validateAgentMode() {
    if (!this.agentService.hasToolsAgent && this._currentModeObservable.get().kind === ChatModeKind.Agent) {
      this.setChatMode(ChatModeKind.Edit);
    }
  }
  // A function that filters out specifically the `value` property of the attachment.
  _getFilteredEntry(inputState) {
    const attachmentsWithoutImageValues = inputState.attachments.map((attachment) => {
      if (isImageVariableEntry(attachment) && attachment.references?.length && attachment.value) {
        const newAttachment = { ...attachment };
        newAttachment.value = void 0;
        return newAttachment;
      }
      return attachment;
    });
    return { ...inputState, attachments: attachmentsWithoutImageValues };
  }
  _acceptInputForVoiceover() {
    const domNode = this._inputEditor.getDomNode();
    if (!domNode) {
      return;
    }
    domNode.remove();
    this._inputEditor.setValue("");
    this._inputEditorElement.appendChild(domNode);
    this._inputEditor.focus();
  }
  _handleAttachedContextChange() {
    this._hasFileAttachmentContextKey.set(Boolean(this._attachmentModel.attachments.find((a) => a.kind === "file")));
    this.renderAttachedContext();
  }
  getOrCreateOptionEmitter(optionGroupId) {
    let emitter = this._chatSessionOptionEmitters.get(optionGroupId);
    if (!emitter) {
      emitter = this._register(new Emitter());
      this._chatSessionOptionEmitters.set(optionGroupId, emitter);
    }
    return emitter;
  }
  /**
   * Get or create a context key for an option group.
   * Context keys follow the pattern `chatSessionOption.<groupId>`.
   */
  getOrCreateOptionContextKey(optionGroupId) {
    if (!this._scopedContextKeyService) {
      return void 0;
    }
    let contextKey = this._optionContextKeys.get(optionGroupId);
    if (!contextKey) {
      const rawKey = new RawContextKey(`chatSessionOption.${optionGroupId}`, "");
      contextKey = rawKey.bindTo(this._scopedContextKeyService);
      this._optionContextKeys.set(optionGroupId, contextKey);
    }
    return contextKey;
  }
  /**
   * Update the context key for an option group with the current selection.
   * This enables `when` expressions on other option groups to react to changes.
   */
  updateOptionContextKey(optionGroupId, optionItemId) {
    const normalizedOptionId = optionItemId.trim();
    const contextKey = this.getOrCreateOptionContextKey(optionGroupId);
    if (contextKey) {
      contextKey.set(normalizedOptionId);
    }
  }
  /**
   * Evaluate whether an option group should be visible based on its `when` expression.
   * Returns true if the option group should be visible, false otherwise.
   */
  evaluateOptionGroupVisibility(optionGroup) {
    if (!optionGroup.when) {
      return true;
    }
    if (!this._scopedContextKeyService) {
      return true;
    }
    const expr = ContextKeyExpr.deserialize(optionGroup.when);
    if (!expr) {
      return true;
    }
    return this._scopedContextKeyService.contextMatchesRules(expr);
  }
  /**
   * Computes which option groups should be visible for the current session.
   *
   * A picker should show if and only if:
   * 1. We can determine a session type (from session context OR delegate)
   * 2. That session type has option groups registered
   * 3. At least one option group has items AND passes its `when` clause
   *
   * This method also updates the `chatSessionHasOptions` context key, which controls
   * whether the picker action is shown in the toolbar via its `when` clause.
   *
   * @returns The result containing visible group IDs and related context, or undefined
   *          if there are no visible option groups
   */
  computeVisibleOptionGroups() {
    const setNoOptions = /* @__PURE__ */ __name(() => {
      this.chatSessionHasOptions.set(false);
      this.chatSessionOptionsValid.set(true);
    }, "setNoOptions");
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    const ctx = sessionResource ? this.chatService.getChatSessionFromInternalUri(sessionResource) : void 0;
    const customAgentTarget = ctx && this.chatSessionsService.getCustomAgentTargetForSessionType(ctx.chatSessionType);
    this.chatSessionHasCustomAgentTarget.set(!!customAgentTarget);
    if (customAgentTarget) {
      const agentOption = this.chatSessionsService.getSessionOption(ctx.chatSessionResource, agentOptionId);
      if (typeof agentOption !== "undefined") {
        const agentId = (typeof agentOption === "string" ? agentOption : agentOption.id) || ChatMode.Agent.id;
        const currentMode = this._currentModeObservable.get();
        const isDefaultAgent = agentId === ChatMode.Agent.id;
        const needsUpdate = isDefaultAgent ? currentMode.id !== ChatMode.Agent.id : currentMode.label.get() !== agentId;
        if (needsUpdate) {
          this.setChatMode(agentId);
        }
      }
    }
    const delegateSessionType = this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.();
    const effectiveSessionType = delegateSessionType ?? ctx?.chatSessionType;
    if (!effectiveSessionType) {
      setNoOptions();
      return void 0;
    }
    const optionGroups = this.chatSessionsService.getOptionGroupsForSessionType(effectiveSessionType);
    if (!optionGroups || optionGroups.length === 0) {
      setNoOptions();
      return void 0;
    }
    if (ctx) {
      for (const optionGroup of optionGroups) {
        const currentOption = this.chatSessionsService.getSessionOption(ctx.chatSessionResource, optionGroup.id);
        if (currentOption) {
          const optionId = typeof currentOption === "string" ? currentOption : currentOption.id;
          this.updateOptionContextKey(optionGroup.id, optionId);
        }
      }
    }
    const visibleGroupIds = /* @__PURE__ */ new Set();
    for (const optionGroup of optionGroups) {
      const hasItems = optionGroup.items.length > 0 || (optionGroup.commands || []).length > 0;
      const passesWhenClause = this.evaluateOptionGroupVisibility(optionGroup);
      const sessionHasOption = !ctx || this.chatSessionsService.getSessionOption(ctx.chatSessionResource, optionGroup.id) !== void 0;
      if (hasItems && passesWhenClause && sessionHasOption) {
        visibleGroupIds.add(optionGroup.id);
      }
    }
    if (visibleGroupIds.size === 0) {
      setNoOptions();
      return void 0;
    }
    let allOptionsValid = true;
    if (ctx) {
      for (const groupId of visibleGroupIds) {
        const optionGroup = optionGroups.find((g) => g.id === groupId);
        const currentOption = this.chatSessionsService.getSessionOption(ctx.chatSessionResource, groupId);
        if (optionGroup && currentOption) {
          const currentOptionId = typeof currentOption === "string" ? currentOption : currentOption.id;
          if (!optionGroup.items.some((item) => item.id === currentOptionId) && typeof currentOption === "string") {
            allOptionsValid = false;
            break;
          }
        }
      }
    }
    this.chatSessionHasOptions.set(true);
    this.chatSessionOptionsValid.set(allOptionsValid);
    return { visibleGroupIds, optionGroups, ctx, effectiveSessionType };
  }
  /**
   * Refresh all registered option groups for the current chat session.
   * Fires events for each option group with their current selection.
   */
  refreshChatSessionPickers() {
    const result = this.computeVisibleOptionGroups();
    if (!result) {
      this.hideAllSessionPickerWidgets();
      return;
    }
    const { visibleGroupIds, optionGroups, ctx } = result;
    const currentWidgetGroupIds = new Set(this.chatSessionPickerWidgets.keys());
    const needsRecreation = currentWidgetGroupIds.size !== visibleGroupIds.size || !Array.from(visibleGroupIds).every((id) => currentWidgetGroupIds.has(id));
    if (needsRecreation && this._lastSessionPickerAction && this.chatSessionPickerContainer) {
      const widgets = this.createChatSessionPickerWidgets(this._lastSessionPickerAction);
      dom.clearNode(this.chatSessionPickerContainer);
      for (const widget of widgets) {
        const container = dom.$(".action-item.chat-sessionPicker-item");
        widget.render(container);
        this.chatSessionPickerContainer.appendChild(container);
      }
    }
    if (this.chatSessionPickerContainer) {
      this.chatSessionPickerContainer.style.display = "";
    }
    if (ctx) {
      for (const [optionGroupId] of this.chatSessionPickerWidgets.entries()) {
        const currentOption = this.chatSessionsService.getSessionOption(ctx.chatSessionResource, optionGroupId);
        if (currentOption) {
          const optionGroup = optionGroups.find((g) => g.id === optionGroupId);
          if (optionGroup) {
            const currentOptionId = typeof currentOption === "string" ? currentOption : currentOption.id;
            const item = optionGroup.items.find((m) => m.id === currentOptionId);
            if (item && typeof currentOption === "string") {
              this.getOrCreateOptionEmitter(optionGroupId).fire(item);
            } else if (typeof currentOption !== "string") {
              this.getOrCreateOptionEmitter(optionGroupId).fire(currentOption);
            }
          }
        }
      }
    }
  }
  hideAllSessionPickerWidgets() {
    if (this.chatSessionPickerContainer) {
      this.chatSessionPickerContainer.style.display = "none";
    }
  }
  disposeSessionPickerWidgets() {
    for (const widget of this.chatSessionPickerWidgets.values()) {
      widget.dispose();
    }
    this.chatSessionPickerWidgets.clear();
  }
  /**
   * Get the current option for a specific option group.
   * Returns undefined if the session doesn't have this option configured.
   */
  getCurrentOptionForGroup(optionGroupId) {
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    if (!sessionResource) {
      return;
    }
    const ctx = this.chatService.getChatSessionFromInternalUri(sessionResource);
    if (!ctx) {
      return;
    }
    if (this.chatSessionsService.getSessionOption(ctx.chatSessionResource, optionGroupId) === void 0) {
      return;
    }
    const effectiveSessionType = this.getEffectiveSessionType(ctx, this.options.sessionTypePickerDelegate);
    const optionGroups = this.chatSessionsService.getOptionGroupsForSessionType(effectiveSessionType);
    const optionGroup = optionGroups?.find((g) => g.id === optionGroupId);
    if (!optionGroup || optionGroup.items.length === 0) {
      return;
    }
    const currentOptionValue = this.chatSessionsService.getSessionOption(ctx.chatSessionResource, optionGroupId);
    if (!currentOptionValue) {
      const defaultItem = optionGroup.items.find((item) => item.default);
      return defaultItem;
    }
    if (typeof currentOptionValue === "string") {
      const normalizedOptionId = currentOptionValue.trim();
      return optionGroup.items.find((m) => m.id === normalizedOptionId);
    } else {
      return currentOptionValue;
    }
  }
  getEffectiveSessionType(ctx, delegate) {
    return this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.() || ctx?.chatSessionType || "";
  }
  /**
   * Updates the agentSessionType context key based on delegate or actual session.
   */
  updateAgentSessionTypeContextKey() {
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    const delegate = this.options.sessionTypePickerDelegate;
    const delegateSessionType = delegate?.setActiveSessionProvider && delegate?.getActiveSessionProvider?.();
    const sessionType = delegateSessionType || (sessionResource ? getChatSessionType(sessionResource) : "");
    this.agentSessionTypeKey.set(sessionType);
  }
  /**
   * Updates the widget lock state based on a session type.
   * Local sessions unlock from coding agent mode, while remote/cloud sessions lock to coding agent mode.
   */
  updateWidgetLockStateFromSessionType(sessionType) {
    if (sessionType === localChatSessionType) {
      this._widget?.unlockFromCodingAgent();
      return;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    if (contribution) {
      this._widget?.lockToCodingAgent(contribution.name, contribution.displayName, contribution.type);
    } else {
      this._widget?.unlockFromCodingAgent();
    }
  }
  /**
   * Updates the widget controller based on session type.
   */
  tryUpdateWidgetController() {
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    if (!sessionResource) {
      return;
    }
    const delegate = this.options.sessionTypePickerDelegate;
    const delegateSessionType = delegate?.setActiveSessionProvider && delegate?.getActiveSessionProvider?.();
    const sessionType = delegateSessionType || this._pendingDelegationTarget || getChatSessionType(sessionResource);
    const isLocalSession = sessionType === localChatSessionType;
    if (!isLocalSession) {
      this._widgetController.clear();
      return;
    }
    if (!this._widgetController.value) {
      this._widgetController.value = this.instantiationService.createInstance(ChatInputPartWidgetController, this.chatInputWidgetsContainer);
    }
  }
  /**
   * Updates the context usage widget based on the current model.
   */
  updateContextUsageWidget() {
    this._contextUsageDisposables.clear();
    const model = this._widget?.viewModel?.model;
    if (!model || !this.contextUsageWidget) {
      return;
    }
    const store = new DisposableStore();
    this._contextUsageDisposables.value = store;
    store.add(model.onDidChange((e) => {
      if (e.kind === "addRequest" || e.kind === "completedRequest") {
        this.contextUsageWidget?.update(model.lastRequest);
      }
    }));
    this.contextUsageWidget.update(model.lastRequest);
  }
  render(container, initialValue, widget) {
    this._widget = widget;
    this.computeVisibleOptionGroups();
    const delegate = this.options.sessionTypePickerDelegate;
    if (delegate?.setActiveSessionProvider && delegate?.getActiveSessionProvider) {
      const initialSessionType = delegate.getActiveSessionProvider();
      if (initialSessionType) {
        this.updateWidgetLockStateFromSessionType(initialSessionType);
      }
    }
    this._register(widget.onDidChangeViewModel(() => {
      this._pendingDelegationTarget = void 0;
      this.updateAgentSessionTypeContextKey();
      this.refreshChatSessionPickers();
      this.tryUpdateWidgetController();
      this.updateContextUsageWidget();
    }));
    let elements;
    if (this.options.renderStyle === "compact") {
      elements = dom.h(".interactive-input-part", [
        dom.h(".interactive-input-and-edit-session", [
          dom.h(".chat-input-widgets-container@chatInputWidgetsContainer"),
          dom.h(".chat-todo-list-widget-container@chatInputTodoListWidgetContainer"),
          dom.h(".chat-editing-session@chatEditingSessionWidgetContainer"),
          dom.h(".interactive-input-and-side-toolbar@inputAndSideToolbar", [
            dom.h(".chat-input-container@inputContainer", [
              dom.h(".chat-context-usage-container@contextUsageWidgetContainer"),
              dom.h(".chat-editor-container@editorContainer"),
              dom.h(".chat-input-toolbars@inputToolbars")
            ])
          ]),
          dom.h(".chat-attachments-container@attachmentsContainer", [
            dom.h(".chat-attachment-toolbar@attachmentToolbar"),
            dom.h(".chat-attached-context@attachedContextContainer")
          ]),
          dom.h(".interactive-input-followups@followupsContainer")
        ])
      ]);
    } else {
      elements = dom.h(".interactive-input-part", [
        dom.h(".interactive-input-followups@followupsContainer"),
        dom.h(".chat-input-widgets-container@chatInputWidgetsContainer"),
        dom.h(".chat-todo-list-widget-container@chatInputTodoListWidgetContainer"),
        dom.h(".chat-editing-session@chatEditingSessionWidgetContainer"),
        dom.h(".interactive-input-and-side-toolbar@inputAndSideToolbar", [
          dom.h(".chat-input-container@inputContainer", [
            dom.h(".chat-context-usage-container@contextUsageWidgetContainer"),
            dom.h(".chat-attachments-container@attachmentsContainer", [
              dom.h(".chat-attachment-toolbar@attachmentToolbar"),
              dom.h(".chat-attached-context@attachedContextContainer")
            ]),
            dom.h(".chat-editor-container@editorContainer"),
            dom.h(".chat-input-toolbars@inputToolbars")
          ])
        ])
      ]);
    }
    this.container = elements.root;
    this.chatInputOverlay = dom.$(".chat-input-overlay");
    container.append(this.container);
    this.container.append(this.chatInputOverlay);
    this.container.classList.toggle("compact", this.options.renderStyle === "compact");
    this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.container));
    this.followupsContainer = elements.followupsContainer;
    const inputAndSideToolbar = elements.inputAndSideToolbar;
    const inputContainer = elements.inputContainer;
    const editorContainer = elements.editorContainer;
    this.attachmentsContainer = elements.attachmentsContainer;
    this.attachedContextContainer = elements.attachedContextContainer;
    const toolbarsContainer = elements.inputToolbars;
    const attachmentToolbarContainer = elements.attachmentToolbar;
    this.chatEditingSessionWidgetContainer = elements.chatEditingSessionWidgetContainer;
    this.chatInputTodoListWidgetContainer = elements.chatInputTodoListWidgetContainer;
    this.chatInputWidgetsContainer = elements.chatInputWidgetsContainer;
    this.contextUsageWidgetContainer = elements.contextUsageWidgetContainer;
    this.contextUsageWidget = this._register(this.instantiationService.createInstance(ChatContextUsageWidget));
    this.contextUsageWidgetContainer.appendChild(this.contextUsageWidget.domNode);
    if (this.options.enableImplicitContext && !this._implicitContext) {
      this._implicitContext = this._register(this.instantiationService.createInstance(ChatImplicitContexts));
      this.setImplicitContextEnablement();
      this._register(this._implicitContext.onDidChangeValue(() => {
        this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
        this._handleAttachedContextChange();
      }));
    } else if (!this.options.enableImplicitContext && this._implicitContext) {
      this._implicitContext?.dispose();
      this._implicitContext = void 0;
    }
    this.tryUpdateWidgetController();
    this._register(this._attachmentModel.onDidChange((e) => {
      if (e.added.length > 0) {
        this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
      }
      this._handleAttachedContextChange();
    }));
    this.renderChatEditingSessionState(null);
    this.dnd.addOverlay(this.options.dndContainer ?? container, this.options.dndContainer ?? container);
    const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
    ChatContextKeys.inChatInput.bindTo(inputScopedContextKeyService).set(true);
    this.currentlyEditingInputKey = ChatContextKeys.currentlyEditingInput.bindTo(inputScopedContextKeyService);
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, inputScopedContextKeyService])));
    const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(inputScopedContextKeyService, this));
    this.historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
    this.historyNavigationForewardsEnablement = historyNavigationForwardsEnablement;
    const options = getSimpleEditorOptions(this.configurationService);
    options.overflowWidgetsDomNode = this.options.editorOverflowWidgetsDomNode;
    options.pasteAs = EditorOptions.pasteAs.defaultValue;
    options.readOnly = false;
    options.ariaLabel = this._getAriaLabel();
    options.fontFamily = DEFAULT_FONT_FAMILY;
    options.fontSize = 13;
    options.lineHeight = 20;
    options.padding = this.options.renderStyle === "compact" ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
    options.cursorWidth = 1;
    options.wrappingStrategy = "advanced";
    options.bracketPairColorization = { enabled: false };
    options.autoClosingBrackets = this.configurationService.getValue("editor.autoClosingBrackets");
    options.autoClosingQuotes = this.configurationService.getValue("editor.autoClosingQuotes");
    options.autoSurround = this.configurationService.getValue("editor.autoSurround");
    options.suggest = {
      showIcons: true,
      showSnippets: false,
      showWords: true,
      showStatusBar: false,
      insertMode: "insert"
    };
    options.scrollbar = { ...options.scrollbar ?? {}, vertical: "hidden" };
    options.stickyScroll = { enabled: false };
    this._inputEditorElement = dom.append(editorContainer, $(chatInputEditorContainerSelector));
    const editorOptions = getSimpleCodeEditorWidgetOptions();
    editorOptions.contributions?.push(...EditorExtensionsRegistry.getSomeEditorContributions([ContentHoverController.ID, GlyphHoverController.ID, DropIntoEditorController.ID, CopyPasteController.ID, LinkDetector.ID]));
    this._inputEditor = this._register(scopedInstantiationService.createInstance(CodeEditorWidget, this._inputEditorElement, options, editorOptions));
    SuggestController.get(this._inputEditor)?.forceRenderingAbove();
    options.overflowWidgetsDomNode?.classList.add("hideSuggestTextIcons");
    this._inputEditorElement.classList.add("hideSuggestTextIcons");
    this._register(this._inputEditor.onKeyDown((e) => {
      if (e.keyCode === 3 && !hasModifierKeys(e)) {
        for (const keybinding of this.keybindingService.lookupKeybindings(ChatSubmitAction.ID)) {
          const chords = keybinding.getDispatchChords();
          const isPlainEnter = chords.length === 1 && chords[0] === "[Enter]";
          if (isPlainEnter) {
            e.preventDefault();
            break;
          }
        }
      }
    }));
    this._register(this._inputEditor.onDidChangeModelContent(() => {
      const currentHeight = Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight);
      if (currentHeight !== this.inputEditorHeight) {
        this.inputEditorHeight = currentHeight;
        if (this.cachedWidth) {
          this._layout(this.cachedWidth);
        }
      }
      const model = this._inputEditor.getModel();
      const inputHasText = !!model && model.getValue().trim().length > 0;
      this.inputEditorHasText.set(inputHasText);
      this._syncTextDebounced.schedule();
    }));
    this._register(this._inputEditor.onDidContentSizeChange((e) => {
      if (e.contentHeightChanged) {
        this.inputEditorHeight = !this.inline ? e.contentHeight : this.inputEditorHeight;
        if (this.cachedWidth) {
          this._layout(this.cachedWidth);
        }
      }
    }));
    this._register(this._inputEditor.onDidFocusEditorText(() => {
      this.inputEditorHasFocus.set(true);
      this._onDidFocus.fire();
      inputContainer.classList.toggle("focused", true);
    }));
    this._register(this._inputEditor.onDidBlurEditorText(() => {
      this.inputEditorHasFocus.set(false);
      inputContainer.classList.toggle("focused", false);
      this._onDidBlur.fire();
    }));
    this._register(this._inputEditor.onDidBlurEditorWidget(() => {
      CopyPasteController.get(this._inputEditor)?.clearWidgets();
      DropIntoEditorController.get(this._inputEditor)?.clearWidgets();
    }));
    const hoverDelegate = this._register(createInstantHoverDelegate());
    const { location, isMaximized } = this.getWidgetLocationInfo(widget);
    const pickerOptions = {
      getOverflowAnchor: /* @__PURE__ */ __name(() => this.inputActionsToolbar.getElement(), "getOverflowAnchor"),
      actionContext: { widget },
      onlyShowIconsForDefaultActions: observableFromEvent(
        this._inputEditor.onDidLayoutChange,
        (l) => (l?.width ?? this._inputEditor.getLayoutInfo().width) < 650
        /* This is a magical number based on testing*/
      ).recomputeInitiallyAndOnChange(this._store),
      hoverPosition: {
        forcePosition: true,
        hoverPosition: location === "sidebarRight" && !isMaximized ? 0 : 1
        /* HoverPosition.RIGHT */
      }
    };
    this._register(dom.addStandardDisposableListener(toolbarsContainer, dom.EventType.CLICK, (e) => this.inputEditor.focus()));
    this._register(dom.addStandardDisposableListener(this.attachmentsContainer, dom.EventType.CLICK, (e) => this.inputEditor.focus()));
    this.inputActionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, this.options.renderInputToolbarBelowInput ? this.attachmentsContainer : toolbarsContainer, MenuId.ChatInput, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: { shouldForwardArgs: true },
      hiddenItemStrategy: -1,
      hoverDelegate,
      responsiveBehavior: {
        enabled: true,
        kind: "last",
        minItems: 1,
        actionMinWidth: 40
      },
      actionViewItemProvider: /* @__PURE__ */ __name((action, options2) => {
        if (action.id === OpenModelPickerAction.ID && action instanceof MenuItemAction) {
          if (!this._currentLanguageModel) {
            this.setCurrentLanguageModelToDefault();
          }
          const itemDelegate = {
            currentModel: this._currentLanguageModel,
            setModel: /* @__PURE__ */ __name((model) => {
              this._waitForPersistedLanguageModel.clear();
              this.setCurrentLanguageModel(model);
              this.renderAttachedContext();
            }, "setModel"),
            getModels: /* @__PURE__ */ __name(() => this.getModels(), "getModels")
          };
          return this.modelWidget = this.instantiationService.createInstance(ModelPickerActionItem, action, void 0, itemDelegate, pickerOptions);
        } else if (action.id === OpenModePickerAction.ID && action instanceof MenuItemAction) {
          const delegate2 = {
            currentMode: this._currentModeObservable,
            sessionResource: /* @__PURE__ */ __name(() => this._widget?.viewModel?.sessionResource, "sessionResource"),
            customAgentTarget: /* @__PURE__ */ __name(() => {
              const sessionResource = this._widget?.viewModel?.model.sessionResource;
              const ctx = sessionResource && this.chatService.getChatSessionFromInternalUri(sessionResource);
              return ctx && this.chatSessionsService.getCustomAgentTargetForSessionType(ctx.chatSessionType);
            }, "customAgentTarget")
          };
          return this.modeWidget = this.instantiationService.createInstance(ModePickerActionItem, action, delegate2, pickerOptions);
        } else if ((action.id === OpenSessionTargetPickerAction.ID || action.id === OpenDelegationPickerAction.ID) && action instanceof MenuItemAction) {
          const getActiveSessionType = /* @__PURE__ */ __name(() => {
            const sessionResource = this._widget?.viewModel?.sessionResource;
            return sessionResource ? getAgentSessionProvider(sessionResource) : void 0;
          }, "getActiveSessionType");
          const delegate2 = this.options.sessionTypePickerDelegate ?? {
            getActiveSessionProvider: /* @__PURE__ */ __name(() => {
              return getActiveSessionType();
            }, "getActiveSessionProvider"),
            getPendingDelegationTarget: /* @__PURE__ */ __name(() => {
              return this._pendingDelegationTarget;
            }, "getPendingDelegationTarget"),
            setPendingDelegationTarget: /* @__PURE__ */ __name((provider) => {
              const isActive = getActiveSessionType() === provider;
              this._pendingDelegationTarget = isActive ? void 0 : provider;
              this.updateWidgetLockStateFromSessionType(provider);
              this.updateAgentSessionTypeContextKey();
              this.refreshChatSessionPickers();
            }, "setPendingDelegationTarget")
          };
          const isWelcomeViewMode = !!this.options.sessionTypePickerDelegate?.setActiveSessionProvider;
          const Picker = action.id === OpenSessionTargetPickerAction.ID || isWelcomeViewMode ? SessionTypePickerActionItem : DelegationSessionPickerActionItem;
          return this.sessionTargetWidget = this.instantiationService.createInstance(Picker, action, location === "editor" ? "editor" : "sidebar", delegate2, pickerOptions);
        } else if (action.id === OpenWorkspacePickerAction.ID && action instanceof MenuItemAction) {
          if (this.workspaceContextService.getWorkbenchState() === 1 && this.options.workspacePickerDelegate) {
            return this.instantiationService.createInstance(WorkspacePickerActionItem, action, this.options.workspacePickerDelegate, pickerOptions);
          } else {
            const empty = new BaseActionViewItem(void 0, action);
            if (empty.element) {
              empty.element.style.display = "none";
            }
            return empty;
          }
        } else if (action.id === ChatSessionPrimaryPickerAction.ID && action instanceof MenuItemAction) {
          const widgets = this.createChatSessionPickerWidgets(action);
          if (widgets.length === 0) {
            return void 0;
          }
          return this.instantiationService.createInstance(ChatSessionPickersContainerActionItem, action, widgets);
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    this.inputActionsToolbar.getElement().classList.add("chat-input-toolbar");
    this.inputActionsToolbar.context = { widget };
    this._register(this.inputActionsToolbar.onDidChangeMenuItems(() => {
      const toolbarElement = this.inputActionsToolbar.getElement();
      const container2 = toolbarElement.querySelector(".chat-sessionPicker-container");
      this.chatSessionPickerContainer = container2;
      if (this.cachedWidth && typeof this.cachedInputToolbarWidth === "number" && this.cachedInputToolbarWidth !== this.inputActionsToolbar.getItemsWidth()) {
        this.layout(this.cachedWidth);
      }
    }));
    this.executeToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, this.options.menus.executeToolbar, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: {
        shouldForwardArgs: true
      },
      hoverDelegate,
      hiddenItemStrategy: -1
    }));
    this.executeToolbar.getElement().classList.add("chat-execute-toolbar");
    this.executeToolbar.context = { widget };
    this._register(this.executeToolbar.onDidChangeMenuItems(() => {
      if (this.cachedWidth && typeof this.cachedExecuteToolbarWidth === "number" && this.cachedExecuteToolbarWidth !== this.executeToolbar.getItemsWidth()) {
        this.layout(this.cachedWidth);
      }
    }));
    if (this.options.menus.inputSideToolbar) {
      const toolbarSide = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, inputAndSideToolbar, this.options.menus.inputSideToolbar, {
        telemetrySource: this.options.menus.telemetrySource,
        menuOptions: {
          shouldForwardArgs: true
        },
        hoverDelegate
      }));
      this.inputSideToolbarContainer = toolbarSide.getElement();
      toolbarSide.getElement().classList.add("chat-side-toolbar");
      toolbarSide.context = { widget };
    }
    let inputModel = this.modelService.getModel(this.inputUri);
    if (!inputModel) {
      inputModel = this.modelService.createModel("", null, this.inputUri, true);
    }
    this.textModelResolverService.createModelReference(this.inputUri).then((ref) => {
      if (this._store.isDisposed) {
        ref.dispose();
        return;
      }
      this._register(ref);
    });
    this.inputModel = inputModel;
    this.inputModel.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
    this._inputEditor.setModel(this.inputModel);
    if (initialValue) {
      this.inputModel.setValue(initialValue);
      const lineNumber = this.inputModel.getLineCount();
      this._inputEditor.setPosition({ lineNumber, column: this.inputModel.getLineMaxColumn(lineNumber) });
    }
    const onDidChangeCursorPosition = /* @__PURE__ */ __name(() => {
      const model = this._inputEditor.getModel();
      if (!model) {
        return;
      }
      const position = this._inputEditor.getPosition();
      if (!position) {
        return;
      }
      const atTop = position.lineNumber === 1 && position.column === 1;
      this.chatCursorAtTop.set(atTop);
      this.historyNavigationBackwardsEnablement.set(atTop);
      this.historyNavigationForewardsEnablement.set(position.equals(getLastPosition(model)));
      this._syncInputStateToModel();
    }, "onDidChangeCursorPosition");
    this._register(this._inputEditor.onDidChangeCursorPosition((e) => onDidChangeCursorPosition()));
    onDidChangeCursorPosition();
    this._register(this.themeService.onDidFileIconThemeChange(() => {
      this.renderAttachedContext();
    }));
    this.addFilesToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, attachmentToolbarContainer, MenuId.ChatInputAttachmentToolbar, {
      telemetrySource: this.options.menus.telemetrySource,
      label: true,
      menuOptions: { shouldForwardArgs: true, renderShortTitle: true },
      hiddenItemStrategy: -1,
      hoverDelegate,
      actionViewItemProvider: /* @__PURE__ */ __name((action, options2) => {
        if (action.id === "workbench.action.chat.attachContext") {
          const viewItem = this.instantiationService.createInstance(AddFilesButton, this._attachmentModel, action, options2);
          viewItem.setShowLabel(this._attachmentModel.size === 0 && !this._implicitContextWidget.value?.hasRenderedContexts);
          this.addFilesButton = viewItem;
          return this.addFilesButton;
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    this.addFilesToolbar.context = { widget, placeholder: localize("chatAttachFiles", "Search for files and context to add to your request") };
    this.renderAttachedContext();
    const inputResizeObserver = this._register(new dom.DisposableResizeObserver(() => {
      const newHeight = this.container.offsetHeight;
      this.height.set(newHeight, void 0);
    }));
    this._register(inputResizeObserver.observe(this.container));
    if (this.options.renderStyle === "compact") {
      const toolbarsResizeObserver = this._register(new dom.DisposableResizeObserver(() => {
        if (this.cachedWidth) {
          this.layout(this.cachedWidth);
        }
      }));
      this._register(toolbarsResizeObserver.observe(toolbarsContainer));
    }
  }
  toggleChatInputOverlay(editing) {
    this.chatInputOverlay.classList.toggle("disabled", editing);
    if (editing) {
      this.overlayClickListener.value = dom.addStandardDisposableListener(this.chatInputOverlay, dom.EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._onDidClickOverlay.fire();
      });
    } else {
      this.overlayClickListener.clear();
    }
  }
  renderAttachedContext() {
    const container = this.attachedContextContainer;
    const store = new DisposableStore();
    this.attachedContextDisposables.value = store;
    dom.clearNode(container);
    store.add(dom.addStandardDisposableListener(this.attachmentsContainer, dom.EventType.KEY_DOWN, (e) => {
      this.handleAttachmentNavigation(e);
    }));
    const attachments = [...this.attachmentModel.attachments.entries()];
    const hasAttachments = Boolean(attachments.length) || Boolean(this.implicitContext?.hasValue);
    dom.setVisibility(Boolean(this.options.renderInputToolbarBelowInput || hasAttachments || this.addFilesToolbar && !this.addFilesToolbar.isEmpty()), this.attachmentsContainer);
    dom.setVisibility(hasAttachments, this.attachedContextContainer);
    if (!attachments.length) {
      this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
      this._indexOfLastOpenedContext = -1;
    }
    const isSuggestedEnabled = this.configurationService.getValue("chat.implicitContext.suggestedContext");
    for (const [index, attachment] of attachments) {
      const resource = URI.isUri(attachment.value) ? attachment.value : isLocation(attachment.value) ? attachment.value.uri : void 0;
      const range = isLocation(attachment.value) ? attachment.value.range : void 0;
      const shouldFocusClearButton = index === Math.min(this._indexOfLastAttachedContextDeletedWithKeyboard, this.attachmentModel.size - 1) && this._indexOfLastAttachedContextDeletedWithKeyboard > -1;
      let attachmentWidget;
      const options = { shouldFocusClearButton, supportsDeletion: true };
      const lm = this._currentLanguageModel.get();
      if (attachment.kind === "tool" || attachment.kind === "toolset") {
        attachmentWidget = this.instantiationService.createInstance(ToolSetOrToolItemAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (resource && isNotebookOutputVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(NotebookCellOutputChatAttachmentWidget, resource, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isPromptFileVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PromptFileAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isPromptTextVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PromptTextAttachmentWidget, attachment, void 0, options, container, this._contextResourceLabels);
      } else if (resource && (attachment.kind === "file" || attachment.kind === "directory")) {
        attachmentWidget = this.instantiationService.createInstance(FileAttachmentWidget, resource, range, attachment, void 0, lm, options, container, this._contextResourceLabels);
      } else if (attachment.kind === "terminalCommand") {
        attachmentWidget = this.instantiationService.createInstance(TerminalCommandAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isImageVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(ImageAttachmentWidget, resource, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isElementVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(ElementChatAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isPasteVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PasteAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isSCMHistoryItemVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(SCMHistoryItemAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isSCMHistoryItemChangeVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(SCMHistoryItemChangeAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else if (isSCMHistoryItemChangeRangeVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(SCMHistoryItemChangeRangeAttachmentWidget, attachment, lm, options, container, this._contextResourceLabels);
      } else {
        attachmentWidget = this.instantiationService.createInstance(DefaultChatAttachmentWidget, resource, range, attachment, void 0, lm, options, container, this._contextResourceLabels);
      }
      if (shouldFocusClearButton) {
        attachmentWidget.element.focus();
      }
      if (index === Math.min(this._indexOfLastOpenedContext, this.attachmentModel.size - 1)) {
        attachmentWidget.element.focus();
      }
      store.add(attachmentWidget);
      store.add(attachmentWidget.onDidDelete((e) => {
        this.handleAttachmentDeletion(e, index, attachment);
      }));
      store.add(attachmentWidget.onDidOpen((e) => {
        this.handleAttachmentOpen(index, attachment);
      }));
    }
    if (isSuggestedEnabled && this.implicitContext?.hasValue) {
      this._implicitContextWidget.value = this.instantiationService.createInstance(ImplicitContextAttachmentWidget, () => this._widget, (targetUri, targetRange, targetHandle) => this.isAttachmentAlreadyAttached(targetUri, targetRange, targetHandle, attachments.map(([, a]) => a)), this.implicitContext, this._contextResourceLabels, this._attachmentModel, container);
    } else {
      this._implicitContextWidget.clear();
    }
    this.addFilesButton?.setShowLabel(this._attachmentModel.size === 0 && !this._implicitContextWidget.value?.hasRenderedContexts);
    this._indexOfLastOpenedContext = -1;
  }
  isAttachmentAlreadyAttached(targetUri, targetRange, targetHandle, attachments) {
    return attachments.some((attachment) => {
      let uri;
      let range;
      let handle;
      if (URI.isUri(attachment.value)) {
        uri = attachment.value;
      } else if (isLocation(attachment.value)) {
        uri = attachment.value.uri;
        range = attachment.value.range;
      } else if (isStringVariableEntry(attachment)) {
        uri = attachment.uri;
        handle = attachment.handle;
      }
      if (handle !== void 0 && targetHandle === void 0 || handle === void 0 && targetHandle !== void 0) {
        return false;
      }
      if (handle !== void 0 && targetHandle !== void 0 && handle !== targetHandle) {
        return false;
      }
      if (!uri || !isEqual(uri, targetUri)) {
        return false;
      }
      if (targetRange) {
        return range && Range.equalsRange(range, targetRange);
      }
      return true;
    });
  }
  handleAttachmentDeletion(e, index, attachment) {
    if (dom.isKeyboardEvent(e)) {
      this._indexOfLastAttachedContextDeletedWithKeyboard = index;
    }
    this._attachmentModel.delete(attachment.id);
    if (this.configurationService.getValue("chat.implicitContext.enableImplicitContext")) {
      for (const implicitContext of this._implicitContext?.values || []) {
        const implicitValue = URI.isUri(implicitContext?.value) && URI.isUri(attachment.value) && isEqual(implicitContext.value, attachment.value);
        if (implicitContext?.isFile && implicitValue) {
          implicitContext.enabled = false;
        }
      }
    }
    if (this._attachmentModel.size === 0) {
      this.focus();
    }
    this._onDidChangeContext.fire({ removed: [attachment] });
    this.renderAttachedContext();
  }
  handleAttachmentOpen(index, attachment) {
    this._indexOfLastOpenedContext = index;
    this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
    if (this._attachmentModel.size === 0) {
      this.focus();
    }
  }
  handleAttachmentNavigation(e) {
    if (!e.equals(
      15
      /* KeyCode.LeftArrow */
    ) && !e.equals(
      17
      /* KeyCode.RightArrow */
    )) {
      return;
    }
    const toolbar = this.addFilesToolbar?.getElement().querySelector(".action-label");
    if (!toolbar) {
      return;
    }
    const attachments = Array.from(this.attachedContextContainer.querySelectorAll(".chat-attached-context-attachment"));
    if (!attachments.length) {
      return;
    }
    attachments.unshift(toolbar);
    const activeElement = dom.getWindow(this.attachmentsContainer).document.activeElement;
    const currentIndex = attachments.findIndex((attachment) => attachment === activeElement);
    let newIndex = currentIndex;
    if (e.equals(
      15
      /* KeyCode.LeftArrow */
    )) {
      newIndex = currentIndex > 0 ? currentIndex - 1 : attachments.length - 1;
    } else if (e.equals(
      17
      /* KeyCode.RightArrow */
    )) {
      newIndex = currentIndex < attachments.length - 1 ? currentIndex + 1 : 0;
    }
    if (newIndex !== -1) {
      const nextElement = attachments[newIndex];
      nextElement.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  }
  async renderChatTodoListWidget(chatSessionResource) {
    const isTodoWidgetEnabled = this.configurationService.getValue(ChatConfiguration.TodosShowWidget) !== false;
    if (!isTodoWidgetEnabled) {
      return;
    }
    if (!this._chatInputTodoListWidget.value) {
      const widget = this._chatEditingTodosDisposables.add(this.instantiationService.createInstance(ChatTodoListWidget));
      this._chatInputTodoListWidget.value = widget;
      dom.clearNode(this.chatInputTodoListWidgetContainer);
      dom.append(this.chatInputTodoListWidgetContainer, widget.domNode);
    }
    this._chatInputTodoListWidget.value.render(chatSessionResource);
  }
  clearTodoListWidget(sessionResource, force) {
    this._chatInputTodoListWidget.value?.clear(sessionResource, force);
  }
  setWorkingSetCollapsed(collapsed) {
    this._workingSetCollapsed.set(collapsed, void 0);
  }
  renderChatEditingSessionState(chatEditingSession) {
    dom.setVisibility(Boolean(chatEditingSession), this.chatEditingSessionWidgetContainer);
    if (chatEditingSession) {
      if (!isEqual(chatEditingSession.chatSessionResource, this._lastEditingSessionResource)) {
        this._workingSetCollapsed.set(true, void 0);
      }
      this._lastEditingSessionResource = chatEditingSession.chatSessionResource;
    }
    const modifiedEntries = derivedOpts({ equalsFn: arraysEqual }, (r) => {
      const sessionResource = chatEditingSession?.chatSessionResource ?? this._widget?.viewModel?.model.sessionResource;
      if (sessionResource && getChatSessionType(sessionResource) === AgentSessionProviders.Background) {
        return [];
      }
      return chatEditingSession?.entries.read(r).filter(
        (entry) => entry.state.read(r) === 0
        /* ModifiedFileEntryState.Modified */
      ) || [];
    });
    const editSessionEntries = derived((reader) => {
      const seenEntries = new ResourceSet();
      const entries = [];
      for (const entry of modifiedEntries.read(reader)) {
        if (entry.state.read(reader) !== 0) {
          continue;
        }
        if (!seenEntries.has(entry.modifiedURI)) {
          seenEntries.add(entry.modifiedURI);
          const linesAdded = entry.linesAdded?.read(reader);
          const linesRemoved = entry.linesRemoved?.read(reader);
          entries.push({
            reference: entry.modifiedURI,
            state: 0,
            kind: "reference",
            options: {
              status: void 0,
              diffMeta: { added: linesAdded ?? 0, removed: linesRemoved ?? 0 },
              isDeletion: !!entry.isDeletion,
              originalUri: entry.isDeletion ? entry.originalURI : void 0
            }
          });
        }
      }
      entries.sort((a, b) => {
        if (a.kind === "reference" && b.kind === "reference") {
          if (a.state === b.state || a.state === void 0 || b.state === void 0) {
            return a.reference.toString().localeCompare(b.reference.toString());
          }
          return a.state - b.state;
        }
        return 0;
      });
      return entries;
    });
    const sessionFileChanges = observableFromEvent(this, this.agentSessionsService.model.onDidChangeSessions, () => {
      const sessionResource = this._widget?.viewModel?.model?.sessionResource;
      if (!sessionResource) {
        return Iterable.empty();
      }
      const model = this.agentSessionsService.getSession(sessionResource);
      return model?.changes instanceof Array ? model.changes : Iterable.empty();
    });
    const sessionFiles = derived((reader) => sessionFileChanges.read(reader).map((entry) => ({
      reference: isIChatSessionFileChange2(entry) ? entry.modifiedUri ?? entry.uri : entry.modifiedUri,
      state: 1,
      kind: "reference",
      options: {
        diffMeta: { added: entry.insertions, removed: entry.deletions },
        isDeletion: entry.modifiedUri === void 0,
        originalUri: entry.originalUri,
        status: void 0
      }
    })));
    const shouldRender = derived((reader) => editSessionEntries.read(reader).length > 0 || sessionFiles.read(reader).length > 0);
    this._renderingChatEdits.value = autorun((reader) => {
      if (this.options.renderWorkingSet && shouldRender.read(reader)) {
        this.renderChatEditingSessionWithEntries(reader.store, chatEditingSession, editSessionEntries, sessionFiles);
      } else {
        dom.clearNode(this.chatEditingSessionWidgetContainer);
        this._chatEditsDisposables.clear();
        this._chatEditList = void 0;
      }
    });
  }
  renderChatEditingSessionWithEntries(store, chatEditingSession, editSessionEntriesObs, sessionEntriesObs) {
    const innerContainer = this.chatEditingSessionWidgetContainer.querySelector(".chat-editing-session-container.show-file-icons") ?? dom.append(this.chatEditingSessionWidgetContainer, $(".chat-editing-session-container.show-file-icons"));
    const overviewRegion = innerContainer.querySelector(".chat-editing-session-overview") ?? dom.append(innerContainer, $(".chat-editing-session-overview"));
    const overviewTitle = overviewRegion.querySelector(".working-set-title") ?? dom.append(overviewRegion, $(".working-set-title"));
    this._chatEditsActionsDisposables.clear();
    const actionsContainer = overviewRegion.querySelector(".chat-editing-session-actions") ?? dom.append(overviewRegion, $(".chat-editing-session-actions"));
    const sessionResource = chatEditingSession?.chatSessionResource || this._widget?.viewModel?.model.sessionResource;
    const scopedContextKeyService = this._chatEditsActionsDisposables.add(this.contextKeyService.createScoped(actionsContainer));
    if (sessionResource) {
      scopedContextKeyService.createKey(ChatContextKeys.agentSessionType.key, getChatSessionType(sessionResource));
    }
    this._chatEditsActionsDisposables.add(bindContextKey(ChatContextKeys.hasAgentSessionChanges, scopedContextKeyService, (r) => !!sessionEntriesObs.read(r)?.length));
    const scopedInstantiationService = this._chatEditsActionsDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    const workingSetContainer = innerContainer.querySelector(".chat-editing-session-list") ?? dom.append(innerContainer, $(".chat-editing-session-list"));
    const button = this._chatEditsActionsDisposables.add(new ButtonWithIcon(overviewTitle, {
      supportIcons: true,
      secondary: true,
      ariaLabel: localize("chatEditingSession.toggleWorkingSet", "Toggle changed files.")
    }));
    const topLevelStats = derived((reader) => {
      const entries = editSessionEntriesObs.read(reader);
      const sessionEntries = sessionEntriesObs.read(reader);
      let added = 0, removed = 0;
      if (entries.length > 0) {
        for (const entry of entries) {
          if (entry.kind === "reference" && entry.options?.diffMeta) {
            added += entry.options.diffMeta.added;
            removed += entry.options.diffMeta.removed;
          }
        }
      } else {
        for (const entry of sessionEntries) {
          if (entry.kind === "reference" && entry.options?.diffMeta) {
            added += entry.options.diffMeta.added;
            removed += entry.options.diffMeta.removed;
          }
        }
      }
      const files = entries.length > 0 ? entries.length : sessionEntries.length;
      const topLevelIsSessionMenu2 = entries.length === 0 && sessionEntries.length > 0;
      const shouldShowEditingSession = entries.length > 0 || sessionEntries.length > 0;
      return { files, added, removed, shouldShowEditingSession, topLevelIsSessionMenu: topLevelIsSessionMenu2 };
    });
    const topLevelIsSessionMenu = topLevelStats.map((t) => t.topLevelIsSessionMenu);
    store.add(autorun((reader) => {
      const isSessionMenu = topLevelIsSessionMenu.read(reader);
      reader.store.add(scopedInstantiationService.createInstance(MenuWorkbenchButtonBar, actionsContainer, isSessionMenu ? MenuId.ChatEditingSessionChangesToolbar : MenuId.ChatEditingWidgetToolbar, {
        telemetrySource: this.options.menus.telemetrySource,
        small: true,
        menuOptions: sessionResource ? isSessionMenu ? {
          args: [sessionResource, this.agentSessionsService.getSession(sessionResource)?.metadata]
        } : {
          arg: {
            $mid: 19,
            sessionResource
          }
        } : void 0,
        disableWhileRunning: isSessionMenu,
        buttonConfigProvider: /* @__PURE__ */ __name((action) => {
          if (action.id === ChatEditingShowChangesAction.ID || action.id === ViewPreviousEditsAction.Id || action.id === ViewAllSessionChangesAction.ID) {
            return { showIcon: true, showLabel: false, isSecondary: true };
          }
          return void 0;
        }, "buttonConfigProvider")
      }));
    }));
    store.add(autorun((reader) => {
      const { files, added, removed, shouldShowEditingSession } = topLevelStats.read(reader);
      const buttonLabel = files === 1 ? localize("chatEditingSession.oneFile", "1 file changed") : localize("chatEditingSession.manyFiles", "{0} files changed", files);
      button.label = buttonLabel;
      button.element.setAttribute("aria-label", localize("chatEditingSession.ariaLabelWithCounts", "{0}, {1} lines added, {2} lines removed", buttonLabel, added, removed));
      this._workingSetLinesAddedSpan.value.textContent = `+${added}`;
      this._workingSetLinesRemovedSpan.value.textContent = `-${removed}`;
      dom.setVisibility(shouldShowEditingSession, this.chatEditingSessionWidgetContainer);
    }));
    const countsContainer = dom.$(".working-set-line-counts");
    button.element.appendChild(countsContainer);
    countsContainer.appendChild(this._workingSetLinesAddedSpan.value);
    countsContainer.appendChild(this._workingSetLinesRemovedSpan.value);
    const toggleWorkingSet = /* @__PURE__ */ __name(() => {
      this._workingSetCollapsed.set(!this._workingSetCollapsed.get(), void 0);
    }, "toggleWorkingSet");
    this._chatEditsActionsDisposables.add(button.onDidClick(toggleWorkingSet));
    this._chatEditsActionsDisposables.add(addDisposableListener(overviewRegion, "click", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      const target = e.target;
      if (target.closest(".monaco-button")) {
        return;
      }
      toggleWorkingSet();
    }));
    this._chatEditsActionsDisposables.add(autorun((reader) => {
      const collapsed = this._workingSetCollapsed.read(reader);
      button.icon = collapsed ? Codicon.chevronRight : Codicon.chevronDown;
      workingSetContainer.classList.toggle("collapsed", collapsed);
    }));
    if (!this._chatEditList) {
      this._chatEditList = this._chatEditsListPool.get();
      const list = this._chatEditList.object;
      this._chatEditsDisposables.add(this._chatEditList);
      this._chatEditsDisposables.add(list.onDidFocus(() => {
        this._onDidFocus.fire();
      }));
      this._chatEditsDisposables.add(list.onDidOpen(async (e) => {
        if (e.element?.kind === "reference" && URI.isUri(e.element.reference)) {
          const modifiedFileUri = e.element.reference;
          const originalUri = e.element.options?.originalUri;
          if (e.element.options?.isDeletion && originalUri) {
            await this.editorService.openEditor({
              resource: originalUri,
              // instead of modified, because modified will not exist
              options: e.editorOptions
            }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
            return;
          }
          if (originalUri) {
            await this.editorService.openEditor({
              original: { resource: originalUri },
              modified: { resource: modifiedFileUri },
              options: e.editorOptions
            }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
            return;
          }
          const entry = chatEditingSession?.getEntry(modifiedFileUri);
          const pane = await this.editorService.openEditor({
            resource: modifiedFileUri,
            options: e.editorOptions
          }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
          if (pane) {
            entry?.getEditorIntegration(pane).reveal(true, e.editorOptions.preserveFocus);
          }
        }
      }));
      this._chatEditsDisposables.add(addDisposableListener(list.getHTMLElement(), "click", (e) => {
        if (!this.hasFocus()) {
          this._onDidFocus.fire();
        }
      }, true));
      dom.append(workingSetContainer, list.getHTMLElement());
      dom.append(innerContainer, workingSetContainer);
    }
    store.add(autorun((reader) => {
      const editEntries = editSessionEntriesObs.read(reader);
      const sessionFileEntries = sessionEntriesObs.read(reader);
      const allEntries = editEntries.concat(sessionFileEntries);
      const maxItemsShown = 6;
      const itemsShown = Math.min(allEntries.length, maxItemsShown);
      const height = itemsShown * 22;
      const list = this._chatEditList.object;
      list.layout(height);
      list.getHTMLElement().style.height = `${height}px`;
      list.splice(0, list.length, allEntries);
    }));
  }
  async renderFollowups(items, response) {
    if (!this.options.renderFollowups) {
      return;
    }
    this.followupsDisposables.clear();
    dom.clearNode(this.followupsContainer);
    if (items && items.length > 0) {
      this.followupsDisposables.add(this.instantiationService.createInstance(ChatFollowups, this.followupsContainer, items, this.location, void 0, (followup) => this._onDidAcceptFollowup.fire({ followup, response })));
    }
  }
  /**
   * Layout the input part with the given width. Height is intrinsic - determined by content
   * and detected via ResizeObserver, which updates `inputPartHeight` for the parent to observe.
   */
  layout(width) {
    this.cachedWidth = width;
    return this._layout(width);
  }
  _layout(width, allowRecurse = true) {
    const data = this.getLayoutData();
    const followupsWidth = width - data.inputPartHorizontalPadding;
    this.followupsContainer.style.width = `${followupsWidth}px`;
    const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
    const newEditorWidth = width - data.inputPartHorizontalPadding - data.editorBorder - data.inputPartHorizontalPaddingInside - data.toolbarsWidth - data.sideToolbarWidth;
    const inputEditorHeight = Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight);
    const newDimension = { width: newEditorWidth, height: inputEditorHeight };
    if (!this.previousInputEditorDimension || (this.previousInputEditorDimension.width !== newDimension.width || this.previousInputEditorDimension.height !== newDimension.height)) {
      this._inputEditor.layout(newDimension);
      this.previousInputEditorDimension = newDimension;
    }
    if (allowRecurse && initialEditorScrollWidth < 10) {
      return this._layout(width, false);
    }
  }
  getLayoutData() {
    const inputSideToolbarWidth = this.inputSideToolbarContainer ? dom.getTotalWidth(this.inputSideToolbarContainer) : 0;
    const getToolbarsWidthCompact = /* @__PURE__ */ __name(() => {
      const executeToolbarWidth = this.cachedExecuteToolbarWidth = this.executeToolbar.getItemsWidth();
      const inputToolbarWidth = this.cachedInputToolbarWidth = this.inputActionsToolbar.getItemsWidth();
      const executeToolbarPadding = (this.executeToolbar.getItemsLength() - 1) * 4;
      const inputToolbarPadding = this.inputActionsToolbar.getItemsLength() ? (this.inputActionsToolbar.getItemsLength() - 1) * 4 : 0;
      return executeToolbarWidth + executeToolbarPadding + (this.options.renderInputToolbarBelowInput ? 0 : inputToolbarWidth + inputToolbarPadding);
    }, "getToolbarsWidthCompact");
    return {
      editorBorder: 2,
      inputPartHorizontalPadding: this.options.renderStyle === "compact" ? 16 : 32,
      inputPartHorizontalPaddingInside: 12,
      toolbarsWidth: this.options.renderStyle === "compact" ? getToolbarsWidthCompact() : 0,
      sideToolbarWidth: inputSideToolbarWidth > 0 ? inputSideToolbarWidth + 4 : 0
    };
  }
  /**
   * Gets the location of the chat widget and whether that location is maximized.
   */
  getWidgetLocationInfo(widget) {
    if (isIChatResourceViewContext(widget.viewContext)) {
      return { location: "editor", isMaximized: false };
    }
    if (isIChatViewViewContext(widget.viewContext)) {
      const viewLocation = this.viewDescriptorService.getViewLocationById(widget.viewContext.viewId);
      const sideBarPosition = this.layoutService.getSideBarPosition();
      switch (viewLocation) {
        case 1:
          return {
            location: "panel",
            isMaximized: this.layoutService.isPanelMaximized()
          };
        case 2:
          return {
            location: sideBarPosition === 0 ? "sidebarRight" : "sidebarLeft",
            isMaximized: this.layoutService.isAuxiliaryBarMaximized()
          };
        case 0:
        default:
          return {
            location: sideBarPosition === 0 ? "sidebarLeft" : "sidebarRight",
            isMaximized: false
          };
      }
    }
    return { location: "editor", isMaximized: false };
  }
};
ChatInputPart = ChatInputPart_1 = __decorate([
  __param(4, IModelService),
  __param(5, IInstantiationService),
  __param(6, IContextKeyService),
  __param(7, IConfigurationService),
  __param(8, IKeybindingService),
  __param(9, IAccessibilityService),
  __param(10, ILanguageModelsService),
  __param(11, ILogService),
  __param(12, IFileService),
  __param(13, IEditorService),
  __param(14, IThemeService),
  __param(15, ITextModelService),
  __param(16, IStorageService),
  __param(17, IChatAgentService),
  __param(18, ISharedWebContentExtractorService),
  __param(19, IWorkbenchAssignmentService),
  __param(20, IChatEntitlementService),
  __param(21, IChatModeService),
  __param(22, ILanguageModelToolsService),
  __param(23, IChatService),
  __param(24, IChatSessionsService),
  __param(25, IChatContextService),
  __param(26, IAgentSessionsService),
  __param(27, IWorkspaceContextService),
  __param(28, IWorkbenchLayoutService),
  __param(29, IViewDescriptorService)
], ChatInputPart);
function getLastPosition(model) {
  return { lineNumber: model.getLineCount(), column: model.getLineLength(model.getLineCount()) + 1 };
}
__name(getLastPosition, "getLastPosition");
const chatInputEditorContainerSelector = ".interactive-input-editor";
setupSimpleEditorSelectionStyling(chatInputEditorContainerSelector);
class ChatSessionPickersContainerActionItem extends ActionViewItem {
  static {
    __name(this, "ChatSessionPickersContainerActionItem");
  }
  constructor(action, widgets, options) {
    super(null, action, options ?? {});
    this.widgets = widgets;
  }
  render(container) {
    container.classList.add("chat-sessionPicker-container");
    for (const widget of this.widgets) {
      const itemContainer = dom.$(".action-item.chat-sessionPicker-item");
      widget.render(itemContainer);
      container.appendChild(itemContainer);
    }
  }
  dispose() {
    for (const widget of this.widgets) {
      widget.dispose();
    }
    super.dispose();
  }
}
class AddFilesButton extends ActionViewItem {
  static {
    __name(this, "AddFilesButton");
  }
  constructor(context, action, options) {
    super(context, action, {
      ...options,
      icon: false,
      label: true,
      keybindingNotRenderedWithLabel: true
    });
  }
  setShowLabel(show) {
    this.showLabel = show;
    this.updateLabel();
  }
  render(container) {
    container.classList.add("chat-attachment-button");
    super.render(container);
    this.updateLabel();
  }
  updateLabel() {
    if (!this.label) {
      return;
    }
    assertType(this.label);
    this.label.classList.toggle("has-label", this.showLabel);
    const message = this.showLabel ? `$(attach) ${this.action.label}` : `$(attach)`;
    dom.reset(this.label, ...renderLabelWithIcons(message));
  }
}
export {
  ChatInputPart,
  ChatWidgetLocation
};
//# sourceMappingURL=chatInputPart.js.map
