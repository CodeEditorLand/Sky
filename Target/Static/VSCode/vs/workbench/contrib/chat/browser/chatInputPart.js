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
import * as dom from "../../../../base/browser/dom.js";
import { addDisposableListener } from "../../../../base/browser/dom.js";
import { DEFAULT_FONT_FAMILY } from "../../../../base/browser/fonts.js";
import { IHistoryNavigationWidget } from "../../../../base/browser/history.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { ActionViewItem, IActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { IActionProvider } from "../../../../base/browser/ui/dropdown/dropdown.js";
import { createInstantHoverDelegate, getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { IAction, Separator, toAction, WorkbenchActionExecutedClassification, WorkbenchActionExecutedEvent } from "../../../../base/common/actions.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { HistoryNavigator2 } from "../../../../base/common/history.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../base/common/map.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { IEditorConstructionOptions } from "../../../../editor/browser/config/editorConfiguration.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { IDimension } from "../../../../editor/common/core/dimension.js";
import { IPosition } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { CopyPasteController } from "../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js";
import { DropIntoEditorController } from "../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js";
import { ContentHoverController } from "../../../../editor/contrib/hover/browser/contentHoverController.js";
import { GlyphHoverController } from "../../../../editor/contrib/hover/browser/glyphHoverController.js";
import { LinkDetector } from "../../../../editor/contrib/links/browser/links.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { MenuWorkbenchButtonBar } from "../../../../platform/actions/browser/buttonbar.js";
import { DropdownMenuActionViewItemWithKeybinding } from "../../../../platform/actions/browser/dropdownActionViewItemWithKeybinding.js";
import { DropdownWithPrimaryActionViewItem, IDropdownWithPrimaryActionViewItemOptions } from "../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { getFlatActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { HiddenItemStrategy, MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IMenuService, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerAndCreateHistoryNavigationContext } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ISharedWebContentExtractorService } from "../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { ResourceLabels } from "../../../browser/labels.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from "../../codeEditor/browser/simpleEditorOptions.js";
import { IChatAgentService } from "../common/chatAgents.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { IChatEditingSession } from "../common/chatEditingService.js";
import { ChatEntitlement, IChatEntitlementService } from "../common/chatEntitlementService.js";
import { IChatRequestVariableEntry, isImageVariableEntry, isPasteVariableEntry } from "../common/chatModel.js";
import { IChatFollowup, IChatService } from "../common/chatService.js";
import { IChatVariablesService } from "../common/chatVariables.js";
import { IChatResponseViewModel } from "../common/chatViewModel.js";
import { ChatInputHistoryMaxEntries, IChatHistoryEntry, IChatInputState, IChatWidgetHistoryService } from "../common/chatWidgetHistoryService.js";
import { ChatAgentLocation, ChatConfiguration, ChatMode, validateChatMode } from "../common/constants.js";
import { ILanguageModelChatMetadataAndIdentifier, ILanguageModelsService } from "../common/languageModels.js";
import { CancelAction, ChatEditingSessionSubmitAction, ChatSubmitAction, ChatSwitchToNextModelActionId, IChatExecuteActionContext, IToggleChatModeArgs, ToggleAgentModeActionId } from "./actions/chatExecuteActions.js";
import { AttachToolsAction } from "./actions/chatToolActions.js";
import { ImplicitContextAttachmentWidget } from "./attachments/implicitContextAttachment.js";
import { PromptAttachmentsCollectionWidget } from "./attachments/promptAttachments/promptAttachmentsCollectionWidget.js";
import { IChatWidget } from "./chat.js";
import { ChatAttachmentModel } from "./chatAttachmentModel.js";
import { toChatVariable } from "./chatAttachmentModel/chatPromptAttachmentsCollection.js";
import { DefaultChatAttachmentWidget, FileAttachmentWidget, ImageAttachmentWidget, PasteAttachmentWidget } from "./chatAttachmentWidgets.js";
import { IDisposableReference } from "./chatContentParts/chatCollections.js";
import { CollapsibleListPool, IChatCollapsibleListItem } from "./chatContentParts/chatReferencesContentPart.js";
import { ChatDragAndDrop } from "./chatDragAndDrop.js";
import { ChatEditingRemoveAllFilesAction, ChatEditingShowChangesAction, ViewPreviousEditsAction } from "./chatEditing/chatEditingActions.js";
import { ChatFollowups } from "./chatFollowups.js";
import { ChatSelectedTools } from "./chatSelectedTools.js";
import { IChatViewState } from "./chatWidget.js";
import { ChatFileReference } from "./contrib/chatDynamicVariables/chatFileReference.js";
import { ChatImplicitContext } from "./contrib/chatImplicitContext.js";
import { ChatRelatedFiles } from "./contrib/chatInputRelatedFilesContrib.js";
import { resizeImage } from "./imageUtils.js";
const $ = dom.$;
const INPUT_EDITOR_MAX_HEIGHT = 250;
let ChatInputPart = class extends Disposable {
  constructor(location, options, styles, getContribsInputState, historyService, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService, languageModelsService, logService, fileService, editorService, themeService, textModelResolverService, storageService, labelService, variableService, agentService, sharedWebExtracterService) {
    super();
    this.location = location;
    this.options = options;
    this.historyService = historyService;
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
    this.labelService = labelService;
    this.variableService = variableService;
    this.agentService = agentService;
    this.sharedWebExtracterService = sharedWebExtracterService;
    this._attachmentModel = this._register(this.instantiationService.createInstance(ChatAttachmentModel));
    this.selectedToolsModel = this._register(this.instantiationService.createInstance(ChatSelectedTools));
    this.dnd = this._register(this.instantiationService.createInstance(ChatDragAndDrop, this._attachmentModel, styles));
    this.getInputState = () => {
      return {
        ...getContribsInputState(),
        chatContextAttachments: this._attachmentModel.attachments,
        chatMode: this._currentMode
      };
    };
    this.inputEditorMaxHeight = this.options.renderStyle === "compact" ? INPUT_EDITOR_MAX_HEIGHT / 3 : INPUT_EDITOR_MAX_HEIGHT;
    this.inputEditorHasText = ChatContextKeys.inputHasText.bindTo(contextKeyService);
    this.chatCursorAtTop = ChatContextKeys.inputCursorAtTop.bindTo(contextKeyService);
    this.inputEditorHasFocus = ChatContextKeys.inputHasFocus.bindTo(contextKeyService);
    this.promptInstructionsAttached = ChatContextKeys.instructionsAttached.bindTo(contextKeyService);
    this.chatMode = ChatContextKeys.chatMode.bindTo(contextKeyService);
    this.history = this.loadHistory();
    this._register(this.historyService.onDidClearHistory(() => this.history = new HistoryNavigator2([{ text: "", state: this.getInputState() }], ChatInputHistoryMaxEntries, historyKeyFn)));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AccessibilityVerbositySettingId.Chat)) {
        this.inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
      }
    }));
    this._chatEditsListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, MenuId.ChatEditingWidgetModifiedFilesToolbar));
    this._hasFileAttachmentContextKey = ChatContextKeys.hasFileAttachments.bindTo(contextKeyService);
    this.instructionAttachmentsPart = this._register(
      instantiationService.createInstance(
        PromptAttachmentsCollectionWidget,
        this.attachmentModel.promptInstructions,
        this._contextResourceLabels
      )
    );
    this.instructionAttachmentsPart.onAttachmentsCountChange(() => {
      this._onDidChangeHeight.fire();
    });
    this.initSelectedModel();
    this._register(agentService.onDidChangeAgents(() => {
      if (!agentService.hasToolsAgent && this._currentMode === ChatMode.Agent) {
        this.setChatMode(ChatMode.Edit);
      }
    }));
    this._register(this.onDidChangeCurrentChatMode(() => this.accessibilityService.alert(this._currentMode)));
    this._register(this._onDidChangeCurrentLanguageModel.event(() => {
      if (this._currentLanguageModel?.metadata.name) {
        this.accessibilityService.alert(this._currentLanguageModel.metadata.name);
      }
    }));
  }
  static {
    __name(this, "ChatInputPart");
  }
  static INPUT_SCHEME = "chatSessionInput";
  static _counter = 0;
  _onDidLoadInputState = this._register(new Emitter());
  onDidLoadInputState = this._onDidLoadInputState.event;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  _onDidChangeContext = this._register(new Emitter());
  onDidChangeContext = this._onDidChangeContext.event;
  _onDidAcceptFollowup = this._register(new Emitter());
  onDidAcceptFollowup = this._onDidAcceptFollowup.event;
  _attachmentModel;
  get attachmentModel() {
    return this._attachmentModel;
  }
  selectedToolsModel;
  getAttachedAndImplicitContext(sessionId) {
    const contextArr = [...this.attachmentModel.attachments];
    if (this.implicitContext?.enabled && this.implicitContext.value) {
      contextArr.push(this.implicitContext.toBaseEntry());
    }
    const variables = this.variableService.getDynamicVariables(sessionId);
    for (const variable of variables) {
      if (!(variable instanceof ChatFileReference)) {
        continue;
      }
      contextArr.push(
        ...variable.allValidReferences.map((link) => {
          return toChatVariable(link, false);
        })
      );
    }
    contextArr.push(...this.instructionAttachmentsPart.chatAttachments);
    return contextArr;
  }
  /**
   * Check if the chat input part has any prompt instruction attachments.
   */
  get hasInstructionAttachments() {
    return !this.instructionAttachmentsPart.empty;
  }
  _indexOfLastAttachedContextDeletedWithKeyboard = -1;
  _implicitContext;
  get implicitContext() {
    return this._implicitContext;
  }
  _relatedFiles;
  get relatedFiles() {
    return this._relatedFiles;
  }
  _hasFileAttachmentContextKey;
  _onDidChangeVisibility = this._register(new Emitter());
  _contextResourceLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event });
  inputEditorMaxHeight;
  inputEditorHeight = 0;
  container;
  inputSideToolbarContainer;
  followupsContainer;
  followupsDisposables = this._register(new DisposableStore());
  attachmentsContainer;
  attachedContextContainer;
  attachedContextDisposables = this._register(new MutableDisposable());
  relatedFilesContainer;
  chatEditingSessionWidgetContainer;
  _inputPartHeight = 0;
  get inputPartHeight() {
    return this._inputPartHeight;
  }
  _followupsHeight = 0;
  get followupsHeight() {
    return this._followupsHeight;
  }
  _editSessionWidgetHeight = 0;
  get editSessionWidgetHeight() {
    return this._editSessionWidgetHeight;
  }
  get attachmentsHeight() {
    return this.attachmentsContainer.offsetHeight + (this.attachmentsContainer.checkVisibility() ? 6 : 0);
  }
  _inputEditor;
  _inputEditorElement;
  executeToolbar;
  inputActionsToolbar;
  addFilesToolbar;
  get inputEditor() {
    return this._inputEditor;
  }
  dnd;
  history;
  historyNavigationBackwardsEnablement;
  historyNavigationForewardsEnablement;
  inputModel;
  inputEditorHasText;
  chatCursorAtTop;
  inputEditorHasFocus;
  /**
   * Context key is set when prompt instructions are attached.
   */
  promptInstructionsAttached;
  chatMode;
  _waitForPersistedLanguageModel = this._register(new MutableDisposable());
  _onDidChangeCurrentLanguageModel = this._register(new Emitter());
  _currentLanguageModel;
  get currentLanguageModel() {
    return this._currentLanguageModel?.identifier;
  }
  _onDidChangeCurrentChatMode = this._register(new Emitter());
  onDidChangeCurrentChatMode = this._onDidChangeCurrentChatMode.event;
  _currentMode = ChatMode.Ask;
  get currentMode() {
    return this._currentMode === ChatMode.Agent && !this.agentService.hasToolsAgent ? ChatMode.Edit : this._currentMode;
  }
  cachedDimensions;
  cachedExecuteToolbarWidth;
  cachedInputToolbarWidth;
  inputUri = URI.parse(`${ChatInputPart.INPUT_SCHEME}:input-${ChatInputPart._counter++}`);
  _chatEditsActionsDisposables = this._register(new DisposableStore());
  _chatEditsDisposables = this._register(new DisposableStore());
  _chatEditsListPool;
  _chatEditList;
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
  _attemptedWorkingSetEntriesCount = 0;
  /**
   * The number of working set entries that the user actually wanted to attach.
   * This is less than or equal to {@link ChatInputPart.chatEditWorkingSetFiles}.
   */
  get attemptedWorkingSetEntriesCount() {
    return this._attemptedWorkingSetEntriesCount;
  }
  getInputState;
  /**
   * Child widget of prompt instruction attachments.
   * See {@linkcode PromptAttachmentsCollectionWidget}.
   */
  instructionAttachmentsPart;
  getSelectedModelStorageKey() {
    return `chat.currentLanguageModel.${this.location}`;
  }
  initSelectedModel() {
    const persistedSelection = this.storageService.get(this.getSelectedModelStorageKey(), StorageScope.APPLICATION);
    if (persistedSelection) {
      const model = this.languageModelsService.lookupLanguageModel(persistedSelection);
      if (model) {
        this.setCurrentLanguageModel({ metadata: model, identifier: persistedSelection });
        this.checkModelSupported();
      } else {
        this._waitForPersistedLanguageModel.value = this.languageModelsService.onDidChangeLanguageModels((e) => {
          const persistedModel = e.added?.find((m) => m.identifier === persistedSelection);
          if (persistedModel) {
            this._waitForPersistedLanguageModel.clear();
            if (persistedModel.metadata.isUserSelectable) {
              this.setCurrentLanguageModel({ metadata: persistedModel.metadata, identifier: persistedSelection });
              this.checkModelSupported();
            }
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
  switchToNextModel() {
    const models = this.getModels();
    if (models.length > 0) {
      const currentIndex = models.findIndex((model) => model.identifier === this._currentLanguageModel?.identifier);
      const nextIndex = (currentIndex + 1) % models.length;
      this.setCurrentLanguageModel(models[nextIndex]);
    }
  }
  checkModelSupported() {
    if (this._currentLanguageModel && !this.modelSupportedForDefaultAgent(this._currentLanguageModel)) {
      this.setCurrentLanguageModelToDefault();
    }
  }
  setChatMode(mode) {
    if (!this.options.supportsChangingModes) {
      return;
    }
    mode = validateChatMode(mode) ?? (this.location === ChatAgentLocation.Panel ? ChatMode.Ask : ChatMode.Edit);
    if (mode === ChatMode.Agent && !this.agentService.hasToolsAgent) {
      mode = ChatMode.Edit;
    }
    this._currentMode = mode;
    this.chatMode.set(mode);
    this._onDidChangeCurrentChatMode.fire();
  }
  modelSupportedForDefaultAgent(model) {
    if (this.currentMode === ChatMode.Agent || this.currentMode === ChatMode.Edit && this.configurationService.getValue(ChatConfiguration.Edits2Enabled)) {
      if (this.configurationService.getValue("chat.agent.allModels")) {
        return true;
      }
      const supportsToolsAgent = typeof model.metadata.capabilities?.agentMode === "undefined" || model.metadata.capabilities.agentMode;
      return supportsToolsAgent && !!model.metadata.capabilities?.toolCalling;
    }
    return true;
  }
  getModels() {
    const models = this.languageModelsService.getLanguageModelIds().map((modelId) => ({ identifier: modelId, metadata: this.languageModelsService.lookupLanguageModel(modelId) })).filter((entry) => entry.metadata?.isUserSelectable && this.modelSupportedForDefaultAgent(entry));
    models.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    return models;
  }
  setCurrentLanguageModelToDefault() {
    const defaultLanguageModelId = this.languageModelsService.getLanguageModelIds().find((id) => this.languageModelsService.lookupLanguageModel(id)?.isDefault);
    const hasUserSelectableLanguageModels = this.languageModelsService.getLanguageModelIds().find((id) => {
      const model = this.languageModelsService.lookupLanguageModel(id);
      return model?.isUserSelectable && !model.isDefault;
    });
    const defaultModel = hasUserSelectableLanguageModels && defaultLanguageModelId ? { metadata: this.languageModelsService.lookupLanguageModel(defaultLanguageModelId), identifier: defaultLanguageModelId } : void 0;
    if (defaultModel) {
      this.setCurrentLanguageModel(defaultModel);
    }
  }
  setCurrentLanguageModel(model) {
    this._currentLanguageModel = model;
    if (this.cachedDimensions) {
      this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
    }
    this.storageService.store(this.getSelectedModelStorageKey(), model.identifier, StorageScope.APPLICATION, StorageTarget.USER);
    this._onDidChangeCurrentLanguageModel.fire(model);
  }
  loadHistory() {
    const history = this.historyService.getHistory(this.location);
    if (history.length === 0) {
      history.push({ text: "", state: this.getInputState() });
    }
    return new HistoryNavigator2(history, 50, historyKeyFn);
  }
  _getAriaLabel() {
    const verbose = this.configurationService.getValue(AccessibilityVerbositySettingId.Chat);
    if (verbose) {
      const kbLabel = this.keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp)?.getLabel();
      return kbLabel ? localize("actions.chat.accessibiltyHelp", "Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.", kbLabel) : localize("chatInput.accessibilityHelpNoKb", "Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information.");
    }
    return localize("chatInput", "Chat Input");
  }
  initForNewChatModel(state) {
    this.history = this.loadHistory();
    this.history.add({
      text: state.inputValue ?? this.history.current().text,
      state: state.inputState ?? this.getInputState()
    });
    const attachments = state.inputState?.chatContextAttachments ?? [];
    this._attachmentModel.clearAndSetContext(...attachments);
    if (state.inputValue) {
      this.setValue(state.inputValue, false);
    }
    if (state.inputState?.chatMode) {
      this.setChatMode(state.inputState.chatMode);
    }
  }
  logInputHistory() {
    const historyStr = [...this.history].map((entry) => JSON.stringify(entry)).join("\n");
    this.logService.info(`[${this.location}] Chat input history:`, historyStr);
  }
  setVisible(visible) {
    this._onDidChangeVisibility.fire(visible);
  }
  get element() {
    return this.container;
  }
  async showPreviousValue() {
    const inputState = this.getInputState();
    if (this.history.isAtEnd()) {
      this.saveCurrentValue(inputState);
    } else {
      const currentEntry = this.getFilteredEntry(this._inputEditor.getValue(), inputState);
      if (!this.history.has(currentEntry)) {
        this.saveCurrentValue(inputState);
        this.history.resetCursor();
      }
    }
    this.navigateHistory(true);
  }
  async showNextValue() {
    const inputState = this.getInputState();
    if (this.history.isAtEnd()) {
      return;
    } else {
      const currentEntry = this.getFilteredEntry(this._inputEditor.getValue(), inputState);
      if (!this.history.has(currentEntry)) {
        this.saveCurrentValue(inputState);
        this.history.resetCursor();
      }
    }
    this.navigateHistory(false);
  }
  async navigateHistory(previous) {
    const historyEntry = previous ? this.history.previous() : this.history.next();
    let historyAttachments = historyEntry.state?.chatContextAttachments ?? [];
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
    aria.status(historyEntry.text);
    this.setValue(historyEntry.text, true);
    this._onDidLoadInputState.fire(historyEntry.state);
    const model = this._inputEditor.getModel();
    if (!model) {
      return;
    }
    if (previous) {
      const endOfFirstViewLine = this._inputEditor._getViewModel()?.getLineLength(1) ?? 1;
      const endOfFirstModelLine = model.getLineLength(1);
      if (endOfFirstViewLine === endOfFirstModelLine) {
        this._inputEditor.setPosition({ lineNumber: 1, column: endOfFirstViewLine + 1 });
      } else {
        this._inputEditor.setPosition({ lineNumber: 1, column: endOfFirstViewLine });
      }
    } else {
      this._inputEditor.setPosition(getLastPosition(model));
    }
  }
  setValue(value, transient) {
    this.inputEditor.setValue(value);
    this.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
    if (!transient) {
      this.saveCurrentValue(this.getInputState());
    }
  }
  saveCurrentValue(inputState) {
    const newEntry = this.getFilteredEntry(this._inputEditor.getValue(), inputState);
    this.history.replaceLast(newEntry);
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
      const userQuery = this._inputEditor.getValue();
      const inputState = this.getInputState();
      const entry = this.getFilteredEntry(userQuery, inputState);
      this.history.replaceLast(entry);
      this.history.add({ text: "" });
    }
    this.attachmentModel.clear();
    this._onDidLoadInputState.fire({});
    if (this.accessibilityService.isScreenReaderOptimized() && isMacintosh) {
      this._acceptInputForVoiceover();
    } else {
      this._inputEditor.focus();
      this._inputEditor.setValue("");
    }
  }
  // A funtion that filters out specifically the `value` property of the attachment.
  getFilteredEntry(query, inputState) {
    const attachmentsWithoutImageValues = inputState.chatContextAttachments?.map((attachment) => {
      if (isImageVariableEntry(attachment) && attachment.references?.length && attachment.value) {
        const newAttachment = { ...attachment };
        newAttachment.value = void 0;
        return newAttachment;
      }
      return attachment;
    });
    inputState.chatContextAttachments = attachmentsWithoutImageValues;
    const newEntry = {
      text: query,
      state: inputState
    };
    return newEntry;
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
    this._hasFileAttachmentContextKey.set(Boolean(this._attachmentModel.attachments.find((a) => a.isFile)));
    this.renderAttachedContext();
  }
  render(container, initialValue, widget) {
    let elements;
    if (this.options.renderStyle === "compact") {
      elements = dom.h(".interactive-input-part", [
        dom.h(".interactive-input-and-edit-session", [
          dom.h(".chat-editing-session@chatEditingSessionWidgetContainer"),
          dom.h(".interactive-input-and-side-toolbar@inputAndSideToolbar", [
            dom.h(".chat-input-container@inputContainer", [
              dom.h(".chat-editor-container@editorContainer"),
              dom.h(".chat-input-toolbars@inputToolbars")
            ])
          ]),
          dom.h(".chat-attachments-container@attachmentsContainer", [
            dom.h(".chat-attachment-toolbar@attachmentToolbar"),
            dom.h(".chat-attached-context@attachedContextContainer"),
            dom.h(".chat-related-files@relatedFilesContainer")
          ]),
          dom.h(".interactive-input-followups@followupsContainer")
        ])
      ]);
    } else {
      elements = dom.h(".interactive-input-part", [
        dom.h(".interactive-input-followups@followupsContainer"),
        dom.h(".chat-editing-session@chatEditingSessionWidgetContainer"),
        dom.h(".interactive-input-and-side-toolbar@inputAndSideToolbar", [
          dom.h(".chat-input-container@inputContainer", [
            dom.h(".chat-attachments-container@attachmentsContainer", [
              dom.h(".chat-attachment-toolbar@attachmentToolbar"),
              dom.h(".chat-related-files@relatedFilesContainer"),
              dom.h(".chat-attached-context@attachedContextContainer")
            ]),
            dom.h(".chat-editor-container@editorContainer"),
            dom.h(".chat-input-toolbars@inputToolbars")
          ])
        ])
      ]);
    }
    this.container = elements.root;
    container.append(this.container);
    this.container.classList.toggle("compact", this.options.renderStyle === "compact");
    this.followupsContainer = elements.followupsContainer;
    const inputAndSideToolbar = elements.inputAndSideToolbar;
    const inputContainer = elements.inputContainer;
    const editorContainer = elements.editorContainer;
    this.attachmentsContainer = elements.attachmentsContainer;
    this.attachedContextContainer = elements.attachedContextContainer;
    this.relatedFilesContainer = elements.relatedFilesContainer;
    const toolbarsContainer = elements.inputToolbars;
    const attachmentToolbarContainer = elements.attachmentToolbar;
    this.chatEditingSessionWidgetContainer = elements.chatEditingSessionWidgetContainer;
    if (this.options.enableImplicitContext) {
      this._implicitContext = this._register(new ChatImplicitContext());
      this._register(this._implicitContext.onDidChangeValue(() => this._handleAttachedContextChange()));
    }
    this.renderAttachedContext();
    this._register(this._attachmentModel.onDidChangeContext(() => this._handleAttachedContextChange()));
    this.renderChatEditingSessionState(null);
    if (this.options.renderWorkingSet) {
      this._relatedFiles = this._register(new ChatRelatedFiles());
      this._register(this._relatedFiles.onDidChange(() => this.renderChatRelatedFiles()));
    }
    this.renderChatRelatedFiles();
    this.dnd.addOverlay(this.options.dndContainer ?? container, this.options.dndContainer ?? container);
    const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
    ChatContextKeys.inChatInput.bindTo(inputScopedContextKeyService).set(true);
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
    options.suggest = {
      showIcons: true,
      showSnippets: false,
      showWords: true,
      showStatusBar: false,
      insertMode: "replace"
    };
    options.scrollbar = { ...options.scrollbar ?? {}, vertical: "hidden" };
    options.stickyScroll = { enabled: false };
    this._inputEditorElement = dom.append(editorContainer, $(chatInputEditorContainerSelector));
    const editorOptions = getSimpleCodeEditorWidgetOptions();
    editorOptions.contributions?.push(...EditorExtensionsRegistry.getSomeEditorContributions([ContentHoverController.ID, GlyphHoverController.ID, CopyPasteController.ID, LinkDetector.ID]));
    this._inputEditor = this._register(scopedInstantiationService.createInstance(CodeEditorWidget, this._inputEditorElement, options, editorOptions));
    SuggestController.get(this._inputEditor)?.forceRenderingAbove();
    options.overflowWidgetsDomNode?.classList.add("hideSuggestTextIcons");
    this._inputEditorElement.classList.add("hideSuggestTextIcons");
    this._register(this._inputEditor.onDidChangeModelContent(() => {
      const currentHeight = Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight);
      if (currentHeight !== this.inputEditorHeight) {
        this.inputEditorHeight = currentHeight;
        this._onDidChangeHeight.fire();
      }
      const model = this._inputEditor.getModel();
      const inputHasText = !!model && model.getValue().trim().length > 0;
      this.inputEditorHasText.set(inputHasText);
    }));
    this._register(this._inputEditor.onDidContentSizeChange((e) => {
      if (e.contentHeightChanged) {
        this.inputEditorHeight = e.contentHeight;
        this._onDidChangeHeight.fire();
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
    this._register(dom.addStandardDisposableListener(toolbarsContainer, dom.EventType.CLICK, (e) => this.inputEditor.focus()));
    this._register(dom.addStandardDisposableListener(this.attachmentsContainer, dom.EventType.CLICK, (e) => this.inputEditor.focus()));
    this.inputActionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, MenuId.ChatInput, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: { shouldForwardArgs: true },
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      hoverDelegate
    }));
    this.inputActionsToolbar.context = { widget };
    this._register(this.inputActionsToolbar.onDidChangeMenuItems(() => {
      if (this.cachedDimensions && typeof this.cachedInputToolbarWidth === "number" && this.cachedInputToolbarWidth !== this.inputActionsToolbar.getItemsWidth()) {
        this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
      }
    }));
    this.executeToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, this.options.menus.executeToolbar, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: {
        shouldForwardArgs: true
      },
      hoverDelegate,
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      // keep it lean when hiding items and avoid a "..." overflow menu
      actionViewItemProvider: /* @__PURE__ */ __name((action, options2) => {
        if (this.location === ChatAgentLocation.Panel || this.location === ChatAgentLocation.Editor) {
          if ((action.id === ChatSubmitAction.ID || action.id === CancelAction.ID || action.id === ChatEditingSessionSubmitAction.ID) && action instanceof MenuItemAction) {
            const dropdownAction = this.instantiationService.createInstance(MenuItemAction, { id: "chat.moreExecuteActions", title: localize("notebook.moreExecuteActionsLabel", "More..."), icon: Codicon.chevronDown }, void 0, void 0, void 0, void 0);
            return this.instantiationService.createInstance(ChatSubmitDropdownActionItem, action, dropdownAction, { ...options2, menuAsChild: false });
          }
        }
        if (action.id === ChatSwitchToNextModelActionId && action instanceof MenuItemAction) {
          if (!this._currentLanguageModel) {
            this.setCurrentLanguageModelToDefault();
          }
          if (this._currentLanguageModel) {
            const itemDelegate = {
              onDidChangeModel: this._onDidChangeCurrentLanguageModel.event,
              setModel: /* @__PURE__ */ __name((model) => {
                this._waitForPersistedLanguageModel.clear();
                this.setCurrentLanguageModel(model);
                this.renderAttachedContext();
              }, "setModel"),
              getModels: /* @__PURE__ */ __name(() => this.getModels(), "getModels")
            };
            return this.instantiationService.createInstance(ModelPickerActionViewItem, action, this._currentLanguageModel, itemDelegate);
          }
        } else if (action.id === ToggleAgentModeActionId && action instanceof MenuItemAction) {
          const delegate = {
            getMode: /* @__PURE__ */ __name(() => this.currentMode, "getMode"),
            onDidChangeMode: this._onDidChangeCurrentChatMode.event
          };
          return this.instantiationService.createInstance(ToggleChatModeActionViewItem, action, delegate);
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    this.executeToolbar.getElement().classList.add("chat-execute-toolbar");
    this.executeToolbar.context = { widget };
    this._register(this.executeToolbar.onDidChangeMenuItems(() => {
      if (this.cachedDimensions && typeof this.cachedExecuteToolbarWidth === "number" && this.cachedExecuteToolbarWidth !== this.executeToolbar.getItemsWidth()) {
        this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
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
      const atTop = position.lineNumber === 1 && position.column - 1 <= (this._inputEditor._getViewModel()?.getLineLength(1) ?? 0);
      this.chatCursorAtTop.set(atTop);
      this.historyNavigationBackwardsEnablement.set(atTop);
      this.historyNavigationForewardsEnablement.set(position.equals(getLastPosition(model)));
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
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      hoverDelegate,
      actionViewItemProvider: /* @__PURE__ */ __name((action, options2) => {
        if (action.id === "workbench.action.chat.editing.attachContext" || action.id === "workbench.action.chat.attachContext") {
          const viewItem = this.instantiationService.createInstance(AddFilesButton, void 0, action, options2);
          return viewItem;
        }
        if (action.id === AttachToolsAction.id) {
          return this.selectedToolsModel.toolsActionItemViewItemProvider(action, options2);
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    this.addFilesToolbar.context = { widget, placeholder: localize("chatAttachFiles", "Search for files and context to add to your request") };
    this._register(this.addFilesToolbar.onDidChangeMenuItems(() => {
      if (this.cachedDimensions) {
        this._onDidChangeHeight.fire();
      }
    }));
    this._register(this.selectedToolsModel.toolsActionItemViewItemProvider.onDidRender(() => this._onDidChangeHeight.fire()));
  }
  renderAttachedContext() {
    const container = this.attachedContextContainer;
    const oldHeight = this.attachmentsContainer.offsetHeight;
    const store = new DisposableStore();
    this.attachedContextDisposables.value = store;
    dom.clearNode(container);
    const hoverDelegate = store.add(createInstantHoverDelegate());
    const attachments = [...this.attachmentModel.attachments.entries()];
    const hasAttachments = Boolean(attachments.length) || Boolean(this.implicitContext?.value) || !this.instructionAttachmentsPart.empty;
    dom.setVisibility(Boolean(hasAttachments || this.addFilesToolbar && !this.addFilesToolbar.isEmpty()), this.attachmentsContainer);
    dom.setVisibility(hasAttachments, this.attachedContextContainer);
    if (!attachments.length) {
      this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
    }
    if (this.implicitContext?.value) {
      const implicitPart = store.add(this.instantiationService.createInstance(ImplicitContextAttachmentWidget, this.implicitContext, this._contextResourceLabels));
      container.appendChild(implicitPart.domNode);
    }
    this.promptInstructionsAttached.set(!this.instructionAttachmentsPart.empty);
    this.instructionAttachmentsPart.render(container);
    for (const [index, attachment] of attachments) {
      const resource = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
      const range = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : void 0;
      const shouldFocusClearButton = index === Math.min(this._indexOfLastAttachedContextDeletedWithKeyboard, this.attachmentModel.size - 1);
      let attachmentWidget;
      if (resource && (attachment.isFile || attachment.isDirectory)) {
        attachmentWidget = this.instantiationService.createInstance(FileAttachmentWidget, resource, range, attachment, this._currentLanguageModel, shouldFocusClearButton, container, this._contextResourceLabels, hoverDelegate);
      } else if (isImageVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(ImageAttachmentWidget, resource, attachment, this._currentLanguageModel, shouldFocusClearButton, container, this._contextResourceLabels, hoverDelegate);
      } else if (isPasteVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PasteAttachmentWidget, attachment, this._currentLanguageModel, shouldFocusClearButton, container, this._contextResourceLabels, hoverDelegate);
      } else {
        attachmentWidget = this.instantiationService.createInstance(DefaultChatAttachmentWidget, resource, range, attachment, this._currentLanguageModel, shouldFocusClearButton, container, this._contextResourceLabels, hoverDelegate);
      }
      store.add(attachmentWidget);
      store.add(attachmentWidget.onDidDelete((e) => {
        this.handleAttachmentDeletion(e, index, attachment);
      }));
    }
    if (oldHeight !== this.attachmentsContainer.offsetHeight) {
      this._onDidChangeHeight.fire();
    }
  }
  handleAttachmentDeletion(e, index, attachment) {
    this._attachmentModel.delete(attachment.id);
    if (dom.isKeyboardEvent(e)) {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
        this._indexOfLastAttachedContextDeletedWithKeyboard = index;
      }
    }
    if (this._attachmentModel.size === 0) {
      this.focus();
    }
    this._onDidChangeContext.fire({ removed: [attachment] });
  }
  async renderChatEditingSessionState(chatEditingSession) {
    dom.setVisibility(Boolean(chatEditingSession), this.chatEditingSessionWidgetContainer);
    const seenEntries = new ResourceSet();
    const entries = chatEditingSession?.entries.get().map((entry) => {
      seenEntries.add(entry.modifiedURI);
      return {
        reference: entry.modifiedURI,
        state: entry.state.get(),
        kind: "reference"
      };
    }) ?? [];
    if (!chatEditingSession || !this.options.renderWorkingSet || !entries.length) {
      dom.clearNode(this.chatEditingSessionWidgetContainer);
      this._chatEditsDisposables.clear();
      this._chatEditList = void 0;
      return;
    }
    const innerContainer = this.chatEditingSessionWidgetContainer.querySelector(".chat-editing-session-container.show-file-icons") ?? dom.append(this.chatEditingSessionWidgetContainer, $(".chat-editing-session-container.show-file-icons"));
    for (const entry of chatEditingSession.entries.get()) {
      if (!seenEntries.has(entry.modifiedURI)) {
        entries.unshift({
          reference: entry.modifiedURI,
          state: entry.state.get(),
          kind: "reference"
        });
        seenEntries.add(entry.modifiedURI);
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
    const overviewRegion = innerContainer.querySelector(".chat-editing-session-overview") ?? dom.append(innerContainer, $(".chat-editing-session-overview"));
    const overviewTitle = overviewRegion.querySelector(".working-set-title") ?? dom.append(overviewRegion, $(".working-set-title"));
    const overviewFileCount = overviewTitle.querySelector("span.working-set-count") ?? dom.append(overviewTitle, $("span.working-set-count"));
    overviewFileCount.textContent = entries.length === 1 ? localize("chatEditingSession.oneFile.1", "1 file changed") : localize("chatEditingSession.manyFiles.1", "{0} files changed", entries.length);
    overviewTitle.ariaLabel = overviewFileCount.textContent;
    overviewTitle.tabIndex = 0;
    this._chatEditsActionsDisposables.clear();
    const actionsContainer = overviewRegion.querySelector(".chat-editing-session-actions") ?? dom.append(overviewRegion, $(".chat-editing-session-actions"));
    this._chatEditsActionsDisposables.add(this.instantiationService.createInstance(MenuWorkbenchButtonBar, actionsContainer, MenuId.ChatEditingWidgetToolbar, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: {
        arg: { sessionId: chatEditingSession.chatSessionId }
      },
      buttonConfigProvider: /* @__PURE__ */ __name((action) => {
        if (action.id === ChatEditingShowChangesAction.ID || action.id === ChatEditingRemoveAllFilesAction.ID || action.id === ViewPreviousEditsAction.Id) {
          return { showIcon: true, showLabel: false, isSecondary: true };
        }
        return void 0;
      }, "buttonConfigProvider")
    }));
    if (!chatEditingSession) {
      return;
    }
    const workingSetContainer = innerContainer.querySelector(".chat-editing-session-list") ?? dom.append(innerContainer, $(".chat-editing-session-list"));
    if (!this._chatEditList) {
      this._chatEditList = this._chatEditsListPool.get();
      const list2 = this._chatEditList.object;
      this._chatEditsDisposables.add(this._chatEditList);
      this._chatEditsDisposables.add(list2.onDidFocus(() => {
        this._onDidFocus.fire();
      }));
      this._chatEditsDisposables.add(list2.onDidOpen(async (e) => {
        if (e.element?.kind === "reference" && URI.isUri(e.element.reference)) {
          const modifiedFileUri = e.element.reference;
          const entry = chatEditingSession.getEntry(modifiedFileUri);
          const pane = await this.editorService.openEditor({
            resource: modifiedFileUri,
            options: e.editorOptions
          }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
          if (pane) {
            entry?.getEditorIntegration(pane).reveal(true, e.editorOptions.preserveFocus);
          }
        }
      }));
      this._chatEditsDisposables.add(addDisposableListener(list2.getHTMLElement(), "click", (e) => {
        if (!this.hasFocus()) {
          this._onDidFocus.fire();
        }
      }, true));
      dom.append(workingSetContainer, list2.getHTMLElement());
      dom.append(innerContainer, workingSetContainer);
    }
    const maxItemsShown = 6;
    const itemsShown = Math.min(entries.length, maxItemsShown);
    const height = itemsShown * 22;
    const list = this._chatEditList.object;
    list.layout(height);
    list.getHTMLElement().style.height = `${height}px`;
    list.splice(0, list.length, entries);
    this._onDidChangeHeight.fire();
  }
  async renderChatRelatedFiles() {
    const anchor = this.relatedFilesContainer;
    dom.clearNode(anchor);
    const shouldRender = this.configurationService.getValue("chat.renderRelatedFiles");
    dom.setVisibility(Boolean(this.relatedFiles?.value.length && shouldRender), anchor);
    if (!shouldRender || !this.relatedFiles?.value.length) {
      return;
    }
    const hoverDelegate = getDefaultHoverDelegate("element");
    for (const { uri, description } of this.relatedFiles.value) {
      const uriLabel = this._chatEditsActionsDisposables.add(new Button(anchor, {
        supportIcons: true,
        secondary: true,
        hoverDelegate
      }));
      uriLabel.label = this.labelService.getUriBasenameLabel(uri);
      uriLabel.element.classList.add("monaco-icon-label");
      uriLabel.element.title = localize("suggeste.title", "{0} - {1}", this.labelService.getUriLabel(uri, { relative: true }), description ?? "");
      this._chatEditsActionsDisposables.add(uriLabel.onDidClick(async () => {
        group.remove();
        await this._attachmentModel.addFile(uri);
        this.relatedFiles?.remove(uri);
      }));
      const addButton = this._chatEditsActionsDisposables.add(new Button(anchor, {
        supportIcons: false,
        secondary: true,
        hoverDelegate,
        ariaLabel: localize("chatEditingSession.addSuggestion", "Add suggestion {0}", this.labelService.getUriLabel(uri, { relative: true }))
      }));
      addButton.icon = Codicon.add;
      addButton.setTitle(localize("chatEditingSession.addSuggested", "Add suggestion"));
      this._chatEditsActionsDisposables.add(addButton.onDidClick(async () => {
        group.remove();
        await this._attachmentModel.addFile(uri);
        this.relatedFiles?.remove(uri);
      }));
      const sep = document.createElement("div");
      sep.classList.add("separator");
      const group = document.createElement("span");
      group.classList.add("monaco-button-dropdown", "sidebyside-button");
      group.appendChild(addButton.element);
      group.appendChild(sep);
      group.appendChild(uriLabel.element);
      dom.append(anchor, group);
      this._chatEditsActionsDisposables.add(toDisposable(() => {
        group.remove();
      }));
    }
    this._onDidChangeHeight.fire();
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
    this._onDidChangeHeight.fire();
  }
  get contentHeight() {
    const data = this.getLayoutData();
    return data.followupsHeight + data.inputPartEditorHeight + data.inputPartVerticalPadding + data.inputEditorBorder + data.attachmentsHeight + data.toolbarsHeight + data.chatEditingStateHeight;
  }
  layout(height, width) {
    this.cachedDimensions = new dom.Dimension(width, height);
    return this._layout(height, width);
  }
  previousInputEditorDimension;
  _layout(height, width, allowRecurse = true) {
    const data = this.getLayoutData();
    const inputEditorHeight = Math.min(data.inputPartEditorHeight, height - data.followupsHeight - data.attachmentsHeight - data.inputPartVerticalPadding - data.toolbarsHeight);
    const followupsWidth = width - data.inputPartHorizontalPadding;
    this.followupsContainer.style.width = `${followupsWidth}px`;
    this._inputPartHeight = data.inputPartVerticalPadding + data.followupsHeight + inputEditorHeight + data.inputEditorBorder + data.attachmentsHeight + data.toolbarsHeight + data.chatEditingStateHeight;
    this._followupsHeight = data.followupsHeight;
    this._editSessionWidgetHeight = data.chatEditingStateHeight;
    const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
    const newEditorWidth = width - data.inputPartHorizontalPadding - data.editorBorder - data.inputPartHorizontalPaddingInside - data.toolbarsWidth - data.sideToolbarWidth;
    const newDimension = { width: newEditorWidth, height: inputEditorHeight };
    if (!this.previousInputEditorDimension || (this.previousInputEditorDimension.width !== newDimension.width || this.previousInputEditorDimension.height !== newDimension.height)) {
      this._inputEditor.layout(newDimension);
      this.previousInputEditorDimension = newDimension;
    }
    if (allowRecurse && initialEditorScrollWidth < 10) {
      return this._layout(height, width, false);
    }
  }
  getLayoutData() {
    const executeToolbarWidth = this.cachedExecuteToolbarWidth = this.executeToolbar.getItemsWidth();
    const inputToolbarWidth = this.cachedInputToolbarWidth = this.inputActionsToolbar.getItemsWidth();
    const executeToolbarPadding = (this.executeToolbar.getItemsLength() - 1) * 4;
    const inputToolbarPadding = this.inputActionsToolbar.getItemsLength() ? (this.inputActionsToolbar.getItemsLength() - 1) * 4 : 0;
    return {
      inputEditorBorder: 2,
      followupsHeight: this.followupsContainer.offsetHeight,
      inputPartEditorHeight: Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight),
      inputPartHorizontalPadding: this.options.renderStyle === "compact" ? 16 : 32,
      inputPartVerticalPadding: this.options.renderStyle === "compact" ? 12 : 28,
      attachmentsHeight: this.attachmentsHeight,
      editorBorder: 2,
      inputPartHorizontalPaddingInside: 12,
      toolbarsWidth: this.options.renderStyle === "compact" ? executeToolbarWidth + executeToolbarPadding + inputToolbarWidth + inputToolbarPadding : 0,
      toolbarsHeight: this.options.renderStyle === "compact" ? 0 : 22,
      chatEditingStateHeight: this.chatEditingSessionWidgetContainer.offsetHeight,
      sideToolbarWidth: this.inputSideToolbarContainer ? dom.getTotalWidth(this.inputSideToolbarContainer) + 4 : 0
    };
  }
  getViewState() {
    return this.getInputState();
  }
  saveState() {
    if (this.history.isAtEnd()) {
      this.saveCurrentValue(this.getInputState());
    }
    const inputHistory = [...this.history];
    this.historyService.saveHistory(this.location, inputHistory);
  }
};
ChatInputPart = __decorateClass([
  __decorateParam(4, IChatWidgetHistoryService),
  __decorateParam(5, IModelService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IAccessibilityService),
  __decorateParam(11, ILanguageModelsService),
  __decorateParam(12, ILogService),
  __decorateParam(13, IFileService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IThemeService),
  __decorateParam(16, ITextModelService),
  __decorateParam(17, IStorageService),
  __decorateParam(18, ILabelService),
  __decorateParam(19, IChatVariablesService),
  __decorateParam(20, IChatAgentService),
  __decorateParam(21, ISharedWebContentExtractorService)
], ChatInputPart);
const historyKeyFn = /* @__PURE__ */ __name((entry) => JSON.stringify({ ...entry, state: { ...entry.state, chatMode: void 0 } }), "historyKeyFn");
function getLastPosition(model) {
  return { lineNumber: model.getLineCount(), column: model.getLineLength(model.getLineCount()) + 1 };
}
__name(getLastPosition, "getLastPosition");
let ChatSubmitDropdownActionItem = class extends DropdownWithPrimaryActionViewItem {
  static {
    __name(this, "ChatSubmitDropdownActionItem");
  }
  constructor(action, dropdownAction, options, menuService, contextMenuService, contextKeyService, keybindingService, notificationService, themeService, accessibilityService) {
    super(
      action,
      dropdownAction,
      [],
      "",
      {
        ...options,
        getKeyBinding: /* @__PURE__ */ __name((action2) => keybindingService.lookupKeybinding(action2.id, contextKeyService), "getKeyBinding")
      },
      contextMenuService,
      keybindingService,
      notificationService,
      contextKeyService,
      themeService,
      accessibilityService
    );
    const menu = menuService.createMenu(MenuId.ChatExecuteSecondary, contextKeyService);
    const setActions = /* @__PURE__ */ __name(() => {
      const secondary = getFlatActionBarActions(menu.getActions({ shouldForwardArgs: true }));
      this.update(dropdownAction, secondary);
    }, "setActions");
    setActions();
    this._register(menu.onDidChange(() => setActions()));
  }
};
ChatSubmitDropdownActionItem = __decorateClass([
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IAccessibilityService)
], ChatSubmitDropdownActionItem);
let ModelPickerActionViewItem = class extends DropdownMenuActionViewItemWithKeybinding {
  constructor(action, currentLanguageModel, delegate, contextMenuService, keybindingService, contextKeyService, chatEntitlementService, commandService, menuService, telemetryService) {
    const modelActionsProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const setLanguageModelAction = /* @__PURE__ */ __name((entry) => {
          return {
            id: entry.identifier,
            label: entry.metadata.name,
            tooltip: "",
            class: void 0,
            enabled: true,
            checked: entry.identifier === this.currentLanguageModel.identifier,
            run: /* @__PURE__ */ __name(() => {
              this.currentLanguageModel = entry;
              this.renderLabel(this.element);
              this.delegate.setModel(entry);
            }, "run")
          };
        }, "setLanguageModelAction");
        const models = this.delegate.getModels();
        const actions = models.map((entry) => setLanguageModelAction(entry));
        const menuActions = menuService.getMenuActions(MenuId.ChatModelPicker, contextKeyService);
        const menuContributions = getFlatActionBarActions(menuActions);
        if (menuContributions.length > 0 || chatEntitlementService.entitlement === ChatEntitlement.Limited) {
          actions.push(new Separator());
        }
        actions.push(...menuContributions);
        if (chatEntitlementService.entitlement === ChatEntitlement.Limited) {
          actions.push(toAction({
            id: "moreModels",
            label: localize("chat.moreModels", "Add more Models"),
            run: /* @__PURE__ */ __name(() => {
              const commandId = "workbench.action.chat.upgradePlan";
              telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "chat-models" });
              commandService.executeCommand(commandId);
            }, "run")
          }));
        }
        return actions;
      }, "getActions")
    };
    const actionWithLabel = {
      ...action,
      tooltip: localize("chat.modelPicker.label", "Pick Model"),
      run: /* @__PURE__ */ __name(() => {
      }, "run")
    };
    super(actionWithLabel, modelActionsProvider, contextMenuService, void 0, keybindingService, contextKeyService);
    this.currentLanguageModel = currentLanguageModel;
    this.delegate = delegate;
    this._register(delegate.onDidChangeModel((modelId) => {
      this.currentLanguageModel = modelId;
      this.renderLabel(this.element);
    }));
  }
  static {
    __name(this, "ModelPickerActionViewItem");
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    dom.reset(element, dom.$("span.chat-model-label", void 0, this.currentLanguageModel.metadata.name), ...renderLabelWithIcons(`$(chevron-down)`));
    return null;
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-modelPicker-item");
  }
};
ModelPickerActionViewItem = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatEntitlementService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, ITelemetryService)
], ModelPickerActionViewItem);
const chatInputEditorContainerSelector = ".interactive-input-editor";
setupSimpleEditorSelectionStyling(chatInputEditorContainerSelector);
let ToggleChatModeActionViewItem = class extends DropdownMenuActionViewItemWithKeybinding {
  constructor(action, delegate, contextMenuService, keybindingService, contextKeyService, chatService, chatAgentService) {
    const makeAction = /* @__PURE__ */ __name((mode) => ({
      ...action,
      id: mode,
      label: this.modeToString(mode),
      class: void 0,
      enabled: true,
      checked: delegate.getMode() === mode,
      run: /* @__PURE__ */ __name(async () => {
        const result = await action.run({ mode });
        this.renderLabel(this.element);
        return result;
      }, "run")
    }), "makeAction");
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const agentStateActions = [
          makeAction(ChatMode.Edit)
        ];
        if (chatAgentService.hasToolsAgent) {
          agentStateActions.push(makeAction(ChatMode.Agent));
        }
        agentStateActions.unshift(makeAction(ChatMode.Ask));
        return agentStateActions;
      }, "getActions")
    };
    super(action, actionProvider, contextMenuService, void 0, keybindingService, contextKeyService);
    this.delegate = delegate;
    this._register(delegate.onDidChangeMode(() => this.renderLabel(this.element)));
  }
  static {
    __name(this, "ToggleChatModeActionViewItem");
  }
  modeToString(mode) {
    switch (mode) {
      case ChatMode.Agent:
        return localize("chat.agentMode", "Agent");
      case ChatMode.Edit:
        return localize("chat.normalMode", "Edit");
      case ChatMode.Ask:
      default:
        return localize("chat.askMode", "Ask");
    }
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const state = this.modeToString(this.delegate.getMode());
    dom.reset(element, dom.$("span.chat-model-label", void 0, state), ...renderLabelWithIcons(`$(chevron-down)`));
    return null;
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-modelPicker-item");
  }
};
ToggleChatModeActionViewItem = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IChatAgentService)
], ToggleChatModeActionViewItem);
class AddFilesButton extends ActionViewItem {
  static {
    __name(this, "AddFilesButton");
  }
  constructor(context, action, options) {
    super(context, action, options);
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-attached-context-attachment", "chat-add-files");
  }
}
export {
  ChatInputPart
};
//# sourceMappingURL=chatInputPart.js.map
