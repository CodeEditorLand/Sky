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
var SCMInputWidget_1;
import "./media/scm.css";
import { Event, Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { append, $, Dimension, trackFocus } from "../../../../base/browser/dom.js";
import { ISCMViewService, SCMInputChangeReason } from "../common/scm.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextViewService, IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IContextKeyService, ContextKeyExpr, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { MenuItemAction, IMenuService, registerAction2, MenuId, Action2 } from "../../../../platform/actions/common/actions.js";
import { ActionRunner, Action } from "../../../../base/common/actions.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { localize } from "../../../../nls.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from "../../codeEditor/browser/simpleEditorOptions.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { MenuPreventer } from "../../codeEditor/browser/menuPreventer.js";
import { SelectionClipboardContributionID } from "../../codeEditor/browser/selectionClipboard.js";
import { EditorDictation } from "../../codeEditor/browser/dictation/editorDictation.js";
import { ContextMenuController } from "../../../../editor/contrib/contextmenu/browser/contextmenu.js";
import * as platform from "../../../../base/common/platform.js";
import { format } from "../../../../base/common/strings.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { SnippetController2 } from "../../../../editor/contrib/snippet/browser/snippetController2.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ColorDetector } from "../../../../editor/contrib/colorPicker/browser/colorDetector.js";
import { LinkDetector } from "../../../../editor/contrib/links/browser/links.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { DEFAULT_FONT_FAMILY } from "../../../../base/browser/fonts.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { createActionViewItem, getFlatActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMarkdownRendererService, openLinkFromMarkdown } from "../../../../platform/markdown/browser/markdownRenderer.js";
import { DragAndDropController } from "../../../../editor/contrib/dnd/browser/dnd.js";
import { CopyPasteController } from "../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js";
import { DropIntoEditorController } from "../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js";
import { MessageController } from "../../../../editor/contrib/message/browser/messageController.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { CodeActionController } from "../../../../editor/contrib/codeAction/browser/codeActionController.js";
import { FormatOnType } from "../../../../editor/contrib/format/browser/formatActions.js";
import { EditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { clamp } from "../../../../base/common/numbers.js";
import { ContentHoverController } from "../../../../editor/contrib/hover/browser/contentHoverController.js";
import { GlyphHoverController } from "../../../../editor/contrib/hover/browser/glyphHoverController.js";
import { autorun, runOnChange } from "../../../../base/common/observable.js";
import { PlaceholderTextContribution } from "../../../../editor/contrib/placeholderText/browser/placeholderTextContribution.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import product from "../../../../platform/product/common/product.js";
import { CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID } from "../../chat/browser/actions/chatActions.js";
const SCMInputContextKeys = {
  SCMInputHasValidationMessage: new RawContextKey("scmInputHasValidationMessage", false)
};
var SCMInputWidgetCommandId;
(function(SCMInputWidgetCommandId2) {
  SCMInputWidgetCommandId2["CancelAction"] = "scm.input.cancelAction";
  SCMInputWidgetCommandId2["SetupAction"] = "scm.input.triggerSetup";
})(SCMInputWidgetCommandId || (SCMInputWidgetCommandId = {}));
var SCMInputWidgetStorageKey;
(function(SCMInputWidgetStorageKey2) {
  SCMInputWidgetStorageKey2["LastActionId"] = "scm.input.lastActionId";
})(SCMInputWidgetStorageKey || (SCMInputWidgetStorageKey = {}));
let SCMInputWidgetActionRunner = class SCMInputWidgetActionRunner2 extends ActionRunner {
  static {
    __name(this, "SCMInputWidgetActionRunner");
  }
  get runningActions() {
    return this._runningActions;
  }
  constructor(input, storageService) {
    super();
    this.input = input;
    this.storageService = storageService;
    this._runningActions = /* @__PURE__ */ new Set();
  }
  async runAction(action) {
    try {
      if (this.runningActions.size !== 0) {
        this._cts?.cancel();
        if (action.id === "scm.input.cancelAction") {
          return;
        }
      }
      const context = [];
      for (const group of this.input.repository.provider.groups) {
        context.push({
          resourceGroupId: group.id,
          resources: [...group.resources.map((r) => r.sourceUri)]
        });
      }
      this._runningActions.add(action);
      this._cts = new CancellationTokenSource();
      await action.run(...[this.input.repository.provider.rootUri, context, this._cts.token]);
    } finally {
      this._runningActions.delete(action);
      if (this._runningActions.size === 0) {
        const actionId = action.id === "scm.input.triggerSetup" ? product.defaultChatAgent?.generateCommitMessageCommand ?? action.id : action.id;
        this.storageService.store(
          "scm.input.lastActionId",
          actionId,
          0,
          0
          /* StorageTarget.USER */
        );
      }
    }
  }
};
SCMInputWidgetActionRunner = __decorate([
  __param(1, IStorageService)
], SCMInputWidgetActionRunner);
let SCMInputWidgetToolbar = class SCMInputWidgetToolbar2 extends WorkbenchToolBar {
  static {
    __name(this, "SCMInputWidgetToolbar");
  }
  get dropdownActions() {
    return this._dropdownActions;
  }
  get dropdownAction() {
    return this._dropdownAction;
  }
  constructor(container, options, menuService, contextKeyService, contextMenuService, commandService, keybindingService, storageService, telemetryService) {
    super(container, options, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this._dropdownActions = [];
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._disposables = this._register(new MutableDisposable());
    this._dropdownAction = new Action("scmInputMoreActions", localize("scmInputMoreActions", "More Actions..."), "codicon-chevron-down");
    this._cancelAction = new MenuItemAction({
      id: "scm.input.cancelAction",
      title: localize("scmInputCancelAction", "Cancel"),
      icon: Codicon.stopCircle
    }, void 0, void 0, void 0, void 0, contextKeyService, commandService);
  }
  setInput(input) {
    this._disposables.value = new DisposableStore();
    const contextKeyService = this.contextKeyService.createOverlay([
      ["scmProvider", input.repository.provider.providerId],
      ["scmProviderRootUri", input.repository.provider.rootUri?.toString()],
      ["scmProviderHasRootUri", !!input.repository.provider.rootUri]
    ]);
    const menu = this._disposables.value.add(this.menuService.createMenu(MenuId.SCMInputBox, contextKeyService, { emitEventsForSubmenuChanges: true }));
    const isEnabled = /* @__PURE__ */ __name(() => {
      return input.repository.provider.groups.some((g) => g.resources.length > 0);
    }, "isEnabled");
    const updateToolbar = /* @__PURE__ */ __name(() => {
      const actions = getFlatActionBarActions(menu.getActions({ shouldForwardArgs: true }));
      for (const action of actions) {
        action.enabled = isEnabled();
      }
      this._dropdownAction.enabled = isEnabled();
      let primaryAction = void 0;
      if (this.actionRunner.runningActions.size !== 0) {
        primaryAction = this._cancelAction;
      } else if (actions.length === 1) {
        primaryAction = actions[0];
      } else if (actions.length > 1) {
        const lastActionId = this.storageService.get("scm.input.lastActionId", 0, "");
        primaryAction = actions.find((a) => a.id === lastActionId) ?? actions[0];
      }
      this._dropdownActions = actions.length === 1 ? [] : actions;
      super.setActions(primaryAction ? [primaryAction] : [], []);
      this._onDidChange.fire();
    }, "updateToolbar");
    this._disposables.value.add(menu.onDidChange(() => updateToolbar()));
    this._disposables.value.add(input.repository.provider.onDidChangeResources(() => updateToolbar()));
    this._disposables.value.add(this.storageService.onDidChangeValue(0, "scm.input.lastActionId", this._disposables.value)(() => updateToolbar()));
    this.actionRunner = this._disposables.value.add(new SCMInputWidgetActionRunner(input, this.storageService));
    this._disposables.value.add(this.actionRunner.onWillRun((e) => {
      if (this.actionRunner.runningActions.size === 0) {
        super.setActions([this._cancelAction], []);
        this._onDidChange.fire();
      }
    }));
    this._disposables.value.add(this.actionRunner.onDidRun((e) => {
      if (this.actionRunner.runningActions.size === 0) {
        updateToolbar();
      }
    }));
    updateToolbar();
  }
};
SCMInputWidgetToolbar = __decorate([
  __param(2, IMenuService),
  __param(3, IContextKeyService),
  __param(4, IContextMenuService),
  __param(5, ICommandService),
  __param(6, IKeybindingService),
  __param(7, IStorageService),
  __param(8, ITelemetryService)
], SCMInputWidgetToolbar);
class SCMInputWidgetEditorOptions {
  static {
    __name(this, "SCMInputWidgetEditorOptions");
  }
  constructor(overflowWidgetsDomNode, configurationService) {
    this.overflowWidgetsDomNode = overflowWidgetsDomNode;
    this.configurationService = configurationService;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this.defaultInputFontFamily = DEFAULT_FONT_FAMILY;
    this._disposables = new DisposableStore();
    const onDidChangeConfiguration = Event.filter(this.configurationService.onDidChangeConfiguration, (e) => {
      return e.affectsConfiguration("editor.accessibilitySupport") || e.affectsConfiguration("editor.cursorBlinking") || e.affectsConfiguration("editor.cursorStyle") || e.affectsConfiguration("editor.cursorWidth") || e.affectsConfiguration("editor.emptySelectionClipboard") || e.affectsConfiguration("editor.fontFamily") || e.affectsConfiguration("editor.roundedSelection") || e.affectsConfiguration("editor.rulers") || e.affectsConfiguration("editor.wordWrap") || e.affectsConfiguration("editor.wordSegmenterLocales") || e.affectsConfiguration("scm.inputFontFamily") || e.affectsConfiguration("scm.inputFontSize");
    }, this._disposables);
    this._disposables.add(onDidChangeConfiguration(() => this._onDidChange.fire()));
  }
  getEditorConstructionOptions() {
    return {
      ...getSimpleEditorOptions(this.configurationService),
      ...this.getEditorOptions(),
      dragAndDrop: true,
      dropIntoEditor: { enabled: true },
      formatOnType: true,
      lineDecorationsWidth: 6,
      overflowWidgetsDomNode: this.overflowWidgetsDomNode,
      padding: { top: 2, bottom: 2 },
      quickSuggestions: false,
      renderWhitespace: "none",
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        vertical: "hidden"
      },
      wrappingIndent: "none",
      wrappingStrategy: "advanced"
    };
  }
  getEditorOptions() {
    const fontFamily = this._getEditorFontFamily();
    const fontSize = this._getEditorFontSize();
    const lineHeight = this._getEditorLineHeight(fontSize);
    const wordSegmenterLocales = this.configurationService.getValue("editor.wordSegmenterLocales");
    const accessibilitySupport = this.configurationService.getValue("editor.accessibilitySupport");
    const cursorBlinking = this.configurationService.getValue("editor.cursorBlinking");
    const cursorStyle = this.configurationService.getValue("editor.cursorStyle");
    const cursorWidth = this.configurationService.getValue("editor.cursorWidth") ?? 1;
    const emptySelectionClipboard = this.configurationService.getValue("editor.emptySelectionClipboard") === true;
    const roundedSelection = this.configurationService.getValue("editor.roundedSelection") === true;
    return { ...this._getEditorLanguageConfiguration(), accessibilitySupport, cursorBlinking, cursorStyle, cursorWidth, fontFamily, fontSize, lineHeight, emptySelectionClipboard, roundedSelection, wordSegmenterLocales };
  }
  _getEditorFontFamily() {
    const inputFontFamily = this.configurationService.getValue("scm.inputFontFamily").trim();
    if (inputFontFamily.toLowerCase() === "editor") {
      return this.configurationService.getValue("editor.fontFamily").trim();
    }
    if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== "default") {
      return inputFontFamily;
    }
    return this.defaultInputFontFamily;
  }
  _getEditorFontSize() {
    return this.configurationService.getValue("scm.inputFontSize");
  }
  _getEditorLanguageConfiguration() {
    const rulersConfig = this.configurationService.inspect("editor.rulers", { overrideIdentifier: "scminput" });
    const rulers = rulersConfig.overrideIdentifiers?.includes("scminput") ? EditorOptions.rulers.validate(rulersConfig.value) : [];
    const wordWrapConfig = this.configurationService.inspect("editor.wordWrap", { overrideIdentifier: "scminput" });
    const wordWrap = wordWrapConfig.overrideIdentifiers?.includes("scminput") ? EditorOptions.wordWrap.validate(wordWrapConfig.value) : "on";
    return { rulers, wordWrap };
  }
  _getEditorLineHeight(fontSize) {
    return Math.round(fontSize * 1.5);
  }
  dispose() {
    this._disposables.dispose();
    this._onDidChange.dispose();
  }
}
let SCMInputWidget = class SCMInputWidget2 {
  static {
    __name(this, "SCMInputWidget");
  }
  static {
    SCMInputWidget_1 = this;
  }
  static {
    this.ValidationTimeouts = {
      [
        2
        /* InputValidationType.Information */
      ]: 5e3,
      [
        1
        /* InputValidationType.Warning */
      ]: 8e3,
      [
        0
        /* InputValidationType.Error */
      ]: 1e4
    };
  }
  get input() {
    return this.model?.input;
  }
  set input(input) {
    if (input === this.input) {
      return;
    }
    this.clearValidation();
    this.element.classList.remove("synthetic-focus");
    this.repositoryDisposables.clear();
    this.repositoryIdContextKey.set(input?.repository.id);
    if (!input) {
      this.inputEditor.setModel(void 0);
      this.model = void 0;
      return;
    }
    const textModel = input.repository.provider.inputBoxTextModel;
    this.inputEditor.setModel(textModel);
    if (this.configurationService.getValue("editor.wordBasedSuggestions", { resource: textModel.uri }) !== "off") {
      this.configurationService.updateValue(
        "editor.wordBasedSuggestions",
        "off",
        { resource: textModel.uri },
        8
        /* ConfigurationTarget.MEMORY */
      );
    }
    const validationDelayer = new ThrottledDelayer(200);
    const validate = /* @__PURE__ */ __name(async () => {
      const position = this.inputEditor.getSelection()?.getStartPosition();
      const offset = position && textModel.getOffsetAt(position);
      const value = textModel.getValue();
      this.setValidation(await input.validateInput(value, offset || 0));
    }, "validate");
    const triggerValidation = /* @__PURE__ */ __name(() => validationDelayer.trigger(validate), "triggerValidation");
    this.repositoryDisposables.add(validationDelayer);
    this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
    const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
    const onEnter = Event.filter(this.inputEditor.onKeyDown, (e) => e.keyCode === 3, this.repositoryDisposables);
    this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
    textModel.setValue(input.value);
    this.repositoryDisposables.add(input.onDidChange(({ value, reason }) => {
      const currentValue = textModel.getValue();
      if (value === currentValue) {
        return;
      }
      textModel.pushStackElement();
      textModel.pushEditOperations(null, [EditOperation.replaceMove(textModel.getFullModelRange(), value)], () => []);
      const position = reason === SCMInputChangeReason.HistoryPrevious ? textModel.getFullModelRange().getStartPosition() : textModel.getFullModelRange().getEndPosition();
      this.inputEditor.setPosition(position);
      this.inputEditor.revealPositionInCenterIfOutsideViewport(position);
    }));
    this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
    this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
    this.repositoryDisposables.add(input.onDidChangeValidateInput((e) => triggerValidation()));
    this.repositoryDisposables.add(input.onDidClearValidation(() => this.clearValidation()));
    this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
      input.setValue(textModel.getValue(), true);
      triggerValidation();
    }));
    const accessibilityVerbosityConfig = observableConfigValue("accessibility.verbosity.sourceControl", true, this.configurationService);
    const getAriaLabel = /* @__PURE__ */ __name((placeholder, verbosity) => {
      verbosity = verbosity ?? accessibilityVerbosityConfig.get();
      if (!verbosity || !this.accessibilityService.isScreenReaderOptimized()) {
        return placeholder;
      }
      const kbLabel = this.keybindingService.lookupKeybinding(
        "editor.action.accessibilityHelp"
        /* AccessibilityCommandId.OpenAccessibilityHelp */
      )?.getLabel();
      return kbLabel ? localize("scmInput.accessibilityHelp", "{0}, Use {1} to open Source Control Accessibility Help.", placeholder, kbLabel) : localize("scmInput.accessibilityHelpNoKb", "{0}, Run the Open Accessibility Help command for more information.", placeholder);
    }, "getAriaLabel");
    const getPlaceholderText = /* @__PURE__ */ __name(() => {
      const binding = this.keybindingService.lookupKeybinding("scm.acceptInput");
      const label = binding ? binding.getLabel() : platform.isMacintosh ? "Cmd+Enter" : "Ctrl+Enter";
      return format(input.placeholder, label);
    }, "getPlaceholderText");
    const updatePlaceholderText = /* @__PURE__ */ __name(() => {
      const placeholder = getPlaceholderText();
      const ariaLabel = getAriaLabel(placeholder);
      this.inputEditor.updateOptions({ ariaLabel, placeholder });
    }, "updatePlaceholderText");
    this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
    this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
    this.repositoryDisposables.add(runOnChange(accessibilityVerbosityConfig, (verbosity) => {
      const placeholder = getPlaceholderText();
      const ariaLabel = getAriaLabel(placeholder, verbosity);
      this.inputEditor.updateOptions({ ariaLabel });
    }));
    updatePlaceholderText();
    let commitTemplate = "";
    this.repositoryDisposables.add(autorun((reader) => {
      if (!input.visible) {
        return;
      }
      const oldCommitTemplate = commitTemplate;
      commitTemplate = input.repository.provider.commitTemplate.read(reader);
      const value = textModel.getValue();
      if (value && value !== oldCommitTemplate) {
        return;
      }
      textModel.setValue(commitTemplate);
    }));
    const updateEnablement = /* @__PURE__ */ __name((enabled) => {
      this.inputEditor.updateOptions({ readOnly: !enabled });
    }, "updateEnablement");
    this.repositoryDisposables.add(input.onDidChangeEnablement((enabled) => updateEnablement(enabled)));
    updateEnablement(input.enabled);
    this.toolbar.setInput(input);
    this.model = { input, textModel };
  }
  get selections() {
    return this.inputEditor.getSelections();
  }
  set selections(selections) {
    if (selections) {
      this.inputEditor.setSelections(selections);
    }
  }
  setValidation(validation, options) {
    if (this._validationTimer) {
      clearTimeout(this._validationTimer);
      this._validationTimer = void 0;
    }
    this.validation = validation;
    this.renderValidation();
    if (options?.focus && !this.hasFocus()) {
      this.focus();
    }
    if (validation && options?.timeout) {
      this._validationTimer = setTimeout(() => this.setValidation(void 0), SCMInputWidget_1.ValidationTimeouts[validation.type]);
    }
  }
  constructor(container, overflowWidgetsDomNode, contextKeyService, instantiationService, modelService, keybindingService, configurationService, scmViewService, contextViewService, openerService, accessibilityService, markdownRendererService) {
    this.modelService = modelService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.scmViewService = scmViewService;
    this.contextViewService = contextViewService;
    this.openerService = openerService;
    this.accessibilityService = accessibilityService;
    this.markdownRendererService = markdownRendererService;
    this.disposables = new DisposableStore();
    this.repositoryDisposables = new DisposableStore();
    this.validationHasFocus = false;
    this.lastLayoutWasTrash = false;
    this.shouldFocusAfterLayout = false;
    this.element = append(container, $(".scm-editor"));
    this.editorContainer = append(this.element, $(".scm-editor-container"));
    this.toolbarContainer = append(this.element, $(".scm-editor-toolbar"));
    this.contextKeyService = this.disposables.add(contextKeyService.createScoped(this.element));
    this.repositoryIdContextKey = this.contextKeyService.createKey("scmRepository", void 0);
    this.validationMessageContextKey = SCMInputContextKeys.SCMInputHasValidationMessage.bindTo(this.contextKeyService);
    this.inputEditorOptions = new SCMInputWidgetEditorOptions(overflowWidgetsDomNode, this.configurationService);
    this.disposables.add(this.inputEditorOptions.onDidChange(this.onDidChangeEditorOptions, this));
    this.disposables.add(this.inputEditorOptions);
    const codeEditorWidgetOptions = {
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        CodeActionController.ID,
        ColorDetector.ID,
        ContextMenuController.ID,
        CopyPasteController.ID,
        DragAndDropController.ID,
        DropIntoEditorController.ID,
        EditorDictation.ID,
        FormatOnType.ID,
        ContentHoverController.ID,
        GlyphHoverController.ID,
        InlineCompletionsController.ID,
        LinkDetector.ID,
        MenuPreventer.ID,
        MessageController.ID,
        PlaceholderTextContribution.ID,
        SelectionClipboardContributionID,
        SnippetController2.ID,
        SuggestController.ID
      ]),
      isSimpleWidget: true
    };
    const services = new ServiceCollection([IContextKeyService, this.contextKeyService]);
    const instantiationService2 = instantiationService.createChild(services, this.disposables);
    const editorConstructionOptions = this.inputEditorOptions.getEditorConstructionOptions();
    this.inputEditor = instantiationService2.createInstance(CodeEditorWidget, this.editorContainer, editorConstructionOptions, codeEditorWidgetOptions);
    this.disposables.add(this.inputEditor);
    this.disposables.add(this.inputEditor.onDidFocusEditorText(() => {
      if (this.input?.repository) {
        this.scmViewService.focus(this.input.repository);
      }
      this.element.classList.add("synthetic-focus");
      this.renderValidation();
    }));
    this.disposables.add(this.inputEditor.onDidBlurEditorText(() => {
      this.element.classList.remove("synthetic-focus");
      setTimeout(() => {
        if (!this.validation || !this.validationHasFocus) {
          this.clearValidation();
        }
      }, 0);
    }));
    this.disposables.add(this.inputEditor.onDidBlurEditorWidget(() => {
      CopyPasteController.get(this.inputEditor)?.clearWidgets();
      DropIntoEditorController.get(this.inputEditor)?.clearWidgets();
    }));
    const firstLineKey = this.contextKeyService.createKey("scmInputIsInFirstPosition", false);
    const lastLineKey = this.contextKeyService.createKey("scmInputIsInLastPosition", false);
    this.disposables.add(this.inputEditor.onDidChangeCursorPosition(({ position }) => {
      const viewModel = this.inputEditor._getViewModel();
      const lastLineNumber = viewModel.getLineCount();
      const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
      const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
      firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
      lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
    }));
    this.disposables.add(this.inputEditor.onDidScrollChange((e) => {
      this.toolbarContainer.classList.toggle("scroll-decoration", e.scrollTop > 0);
    }));
    Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.showInputActionButton"))(() => this.layout(), this, this.disposables);
    this.onDidChangeContentHeight = Event.signal(Event.filter(this.inputEditor.onDidContentSizeChange, (e) => e.contentHeightChanged, this.disposables));
    this.toolbar = instantiationService2.createInstance(SCMInputWidgetToolbar, this.toolbarContainer, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction && this.toolbar.dropdownActions.length > 1) {
          return instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, this.toolbar.dropdownAction, this.toolbar.dropdownActions, "", { actionRunner: this.toolbar.actionRunner, hoverDelegate: options.hoverDelegate });
        }
        return createActionViewItem(instantiationService, action, options);
      }, "actionViewItemProvider"),
      hiddenItemStrategy: -1,
      menuOptions: {
        shouldForwardArgs: true
      }
    });
    this.disposables.add(this.toolbar.onDidChange(() => this.layout()));
    this.disposables.add(this.toolbar);
  }
  getContentHeight() {
    const lineHeight = this.inputEditor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const { top, bottom } = this.inputEditor.getOption(
      96
      /* EditorOption.padding */
    );
    const inputMinLinesConfig = this.configurationService.getValue("scm.inputMinLineCount");
    const inputMinLines = typeof inputMinLinesConfig === "number" ? clamp(inputMinLinesConfig, 1, 50) : 1;
    const editorMinHeight = inputMinLines * lineHeight + top + bottom;
    const inputMaxLinesConfig = this.configurationService.getValue("scm.inputMaxLineCount");
    const inputMaxLines = typeof inputMaxLinesConfig === "number" ? clamp(inputMaxLinesConfig, 1, 50) : 10;
    const editorMaxHeight = inputMaxLines * lineHeight + top + bottom;
    return clamp(this.inputEditor.getContentHeight(), editorMinHeight, editorMaxHeight);
  }
  layout() {
    const editorHeight = this.getContentHeight();
    const toolbarWidth = this.getToolbarWidth();
    const dimension = new Dimension(this.element.clientWidth - toolbarWidth, editorHeight);
    if (dimension.width < 0) {
      this.lastLayoutWasTrash = true;
      return;
    }
    this.lastLayoutWasTrash = false;
    this.inputEditor.layout(dimension);
    this.renderValidation();
    const showInputActionButton = this.configurationService.getValue("scm.showInputActionButton") === true;
    this.toolbarContainer.classList.toggle("hidden", !showInputActionButton || this.toolbar?.isEmpty() === true);
    if (this.shouldFocusAfterLayout) {
      this.shouldFocusAfterLayout = false;
      this.focus();
    }
  }
  focus() {
    if (this.lastLayoutWasTrash) {
      this.lastLayoutWasTrash = false;
      this.shouldFocusAfterLayout = true;
      return;
    }
    this.inputEditor.focus();
    this.element.classList.add("synthetic-focus");
  }
  hasFocus() {
    return this.inputEditor.hasTextFocus();
  }
  onDidChangeEditorOptions() {
    this.inputEditor.updateOptions(this.inputEditorOptions.getEditorOptions());
  }
  renderValidation() {
    this.clearValidation();
    this.element.classList.toggle(
      "validation-info",
      this.validation?.type === 2
      /* InputValidationType.Information */
    );
    this.element.classList.toggle(
      "validation-warning",
      this.validation?.type === 1
      /* InputValidationType.Warning */
    );
    this.element.classList.toggle(
      "validation-error",
      this.validation?.type === 0
      /* InputValidationType.Error */
    );
    if (!this.validation || !this.inputEditor.hasTextFocus()) {
      return;
    }
    this.validationMessageContextKey.set(true);
    const disposables = new DisposableStore();
    this.validationContextView = this.contextViewService.showContextView({
      getAnchor: /* @__PURE__ */ __name(() => this.element, "getAnchor"),
      render: /* @__PURE__ */ __name((container) => {
        this.element.style.borderBottomLeftRadius = "0";
        this.element.style.borderBottomRightRadius = "0";
        const validationContainer = append(container, $(".scm-editor-validation-container"));
        validationContainer.classList.toggle(
          "validation-info",
          this.validation.type === 2
          /* InputValidationType.Information */
        );
        validationContainer.classList.toggle(
          "validation-warning",
          this.validation.type === 1
          /* InputValidationType.Warning */
        );
        validationContainer.classList.toggle(
          "validation-error",
          this.validation.type === 0
          /* InputValidationType.Error */
        );
        validationContainer.style.width = `${this.element.clientWidth + 2}px`;
        const element = append(validationContainer, $(".scm-editor-validation"));
        const message = this.validation.message;
        if (typeof message === "string") {
          element.textContent = message;
        } else {
          const tracker = trackFocus(element);
          disposables.add(tracker);
          disposables.add(tracker.onDidFocus(() => this.validationHasFocus = true));
          disposables.add(tracker.onDidBlur(() => {
            this.validationHasFocus = false;
            this.element.style.borderBottomLeftRadius = "2px";
            this.element.style.borderBottomRightRadius = "2px";
            this.contextViewService.hideContextView();
          }));
          const renderedMarkdown = this.markdownRendererService.render(message, {
            actionHandler: /* @__PURE__ */ __name((link, mdStr) => {
              openLinkFromMarkdown(this.openerService, link, mdStr.isTrusted);
              this.element.style.borderBottomLeftRadius = "2px";
              this.element.style.borderBottomRightRadius = "2px";
              this.contextViewService.hideContextView();
            }, "actionHandler")
          });
          disposables.add(renderedMarkdown);
          element.appendChild(renderedMarkdown.element);
        }
        const actionsContainer = append(validationContainer, $(".scm-editor-validation-actions"));
        const actionbar = new ActionBar(actionsContainer);
        const action = new Action("scmInputWidget.validationMessage.close", localize("label.close", "Close"), ThemeIcon.asClassName(Codicon.close), true, () => {
          this.contextViewService.hideContextView();
          this.element.style.borderBottomLeftRadius = "2px";
          this.element.style.borderBottomRightRadius = "2px";
        });
        disposables.add(actionbar);
        actionbar.push(action, { icon: true, label: false });
        return Disposable.None;
      }, "render"),
      onHide: /* @__PURE__ */ __name(() => {
        this.validationHasFocus = false;
        this.element.style.borderBottomLeftRadius = "2px";
        this.element.style.borderBottomRightRadius = "2px";
        disposables.dispose();
      }, "onHide"),
      anchorAlignment: 0
      /* AnchorAlignment.LEFT */
    });
  }
  getToolbarWidth() {
    const showInputActionButton = this.configurationService.getValue("scm.showInputActionButton");
    if (!this.toolbar || !showInputActionButton || this.toolbar?.isEmpty() === true) {
      return 0;
    }
    return this.toolbar.dropdownActions.length === 0 ? 26 : 39;
  }
  clearValidation() {
    this.validationContextView?.close();
    this.validationContextView = void 0;
    this.validationHasFocus = false;
    this.validationMessageContextKey.set(false);
  }
  dispose() {
    this.input = void 0;
    this.repositoryDisposables.dispose();
    this.clearValidation();
    this.disposables.dispose();
  }
};
SCMInputWidget = SCMInputWidget_1 = __decorate([
  __param(2, IContextKeyService),
  __param(3, IInstantiationService),
  __param(4, IModelService),
  __param(5, IKeybindingService),
  __param(6, IConfigurationService),
  __param(7, ISCMViewService),
  __param(8, IContextViewService),
  __param(9, IOpenerService),
  __param(10, IAccessibilityService),
  __param(11, IMarkdownRendererService)
], SCMInputWidget);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "scm.input.triggerSetup",
      title: localize("scmInputGenerateCommitMessage", "Generate Commit Message"),
      icon: Codicon.sparkle,
      f1: false,
      menu: {
        id: MenuId.SCMInputBox,
        when: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabled.negate(), ChatContextKeys.Setup.installed.negate(), ContextKeyExpr.equals("scmProvider", "git"))
      }
    });
  }
  async run(accessor, ...args) {
    const commandService = accessor.get(ICommandService);
    const result = await commandService.executeCommand(CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID);
    if (!result) {
      return;
    }
    const command = product.defaultChatAgent?.generateCommitMessageCommand;
    if (!command) {
      return;
    }
    await commandService.executeCommand(command, ...args);
  }
});
setupSimpleEditorSelectionStyling(".scm-view .scm-editor-container");
export {
  SCMInputContextKeys,
  SCMInputWidget
};
//# sourceMappingURL=scmInput.js.map
