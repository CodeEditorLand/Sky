var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { timeout } from "../../../../../base/common/async.js";
import { cancelOnDispose } from "../../../../../base/common/cancellation.js";
import { createHotClass } from "../../../../../base/common/hotReloadHelpers.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, derived, derivedDisposable, derivedObservableWithCache, observableFromEvent, observableSignal, observableValue, runOnChange, runOnChangeWithStore, transaction, waitForState } from "../../../../../base/common/observable.js";
import { isUndefined } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { hotClassGetOriginalInstance } from "../../../../../platform/observable/common/wrapInHotClass.js";
import { CoreEditingCommands } from "../../../../browser/coreCommands.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { getOuterEditor } from "../../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { Position } from "../../../../common/core/position.js";
import { ILanguageFeatureDebounceService } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { InlineSuggestionHintsContentWidget } from "../hintsWidget/inlineCompletionsHintsWidget.js";
import { TextModelChangeRecorder } from "../model/changeRecorder.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import { ObservableSuggestWidgetAdapter } from "../model/suggestWidgetAdapter.js";
import { ObservableContextKeyService } from "../utils.js";
import { InlineCompletionsView } from "../view/inlineCompletionsView.js";
import { inlineSuggestCommitId } from "./commandIds.js";
import { InlineCompletionContextKeys } from "./inlineCompletionContextKeys.js";
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
var InlineCompletionsController_1;
let InlineCompletionsController = class InlineCompletionsController2 extends Disposable {
  static {
    __name(this, "InlineCompletionsController");
  }
  static {
    InlineCompletionsController_1 = this;
  }
  static {
    this._instances = /* @__PURE__ */ new Set();
  }
  static {
    this.hot = createHotClass(InlineCompletionsController_1);
  }
  static {
    this.ID = "editor.contrib.inlineCompletionsController";
  }
  /**
   * Find the controller in the focused editor or in the outer editor (if applicable)
   */
  static getInFocusedEditorOrParent(accessor) {
    const outerEditor = getOuterEditor(accessor);
    if (!outerEditor) {
      return null;
    }
    return InlineCompletionsController_1.get(outerEditor);
  }
  static get(editor) {
    return hotClassGetOriginalInstance(editor.getContribution(InlineCompletionsController_1.ID));
  }
  constructor(editor, _instantiationService, _contextKeyService, _configurationService, _commandService, _debounceService, _languageFeaturesService, _accessibilitySignalService, _keybindingService, _accessibilityService) {
    super();
    this.editor = editor;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._commandService = _commandService;
    this._debounceService = _debounceService;
    this._languageFeaturesService = _languageFeaturesService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._keybindingService = _keybindingService;
    this._accessibilityService = _accessibilityService;
    this._editorObs = observableCodeEditor(this.editor);
    this._positions = derived(this, (reader) => this._editorObs.selections.read(reader)?.map((s) => s.getEndPosition()) ?? [new Position(1, 1)]);
    this._suggestWidgetAdapter = this._register(new ObservableSuggestWidgetAdapter(this._editorObs, (item) => this.model.get()?.handleSuggestAccepted(item), () => this.model.get()?.selectedInlineCompletion.get()?.getSingleTextEdit()));
    this._enabledInConfig = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).enabled);
    this._isScreenReaderEnabled = observableFromEvent(this, this._accessibilityService.onDidChangeScreenReaderOptimized, () => this._accessibilityService.isScreenReaderOptimized());
    this._editorDictationInProgress = observableFromEvent(this, this._contextKeyService.onDidChangeContext, () => this._contextKeyService.getContext(this.editor.getDomNode()).getValue("editorDictation.inProgress") === true);
    this._enabled = derived(this, (reader) => this._enabledInConfig.read(reader) && (!this._isScreenReaderEnabled.read(reader) || !this._editorDictationInProgress.read(reader)));
    this._debounceValue = this._debounceService.for(this._languageFeaturesService.inlineCompletionsProvider, "InlineCompletionsDebounce", { min: 50, max: 50 });
    this._focusIsInMenu = observableValue(this, false);
    this._focusIsInEditorOrMenu = derived(this, (reader) => {
      const editorHasFocus = this._editorObs.isFocused.read(reader);
      const menuHasFocus = this._focusIsInMenu.read(reader);
      return editorHasFocus || menuHasFocus;
    });
    this._cursorIsInIndentation = derived(this, (reader) => {
      const cursorPos = this._editorObs.cursorPosition.read(reader);
      if (cursorPos === null) {
        return false;
      }
      const model = this._editorObs.model.read(reader);
      if (!model) {
        return false;
      }
      this._editorObs.versionId.read(reader);
      const indentMaxColumn = model.getLineIndentColumn(cursorPos.lineNumber);
      return cursorPos.column <= indentMaxColumn;
    });
    this.model = derivedDisposable(this, (reader) => {
      if (this._editorObs.isReadonly.read(reader)) {
        return void 0;
      }
      const textModel = this._editorObs.model.read(reader);
      if (!textModel) {
        return void 0;
      }
      const model = this._instantiationService.createInstance(InlineCompletionsModel, textModel, this._suggestWidgetAdapter.selectedItem, this._editorObs.versionId, this._positions, this._debounceValue, this._enabled, this.editor);
      return model;
    }).recomputeInitiallyAndOnChange(this._store);
    this._playAccessibilitySignal = observableSignal(this);
    this._hideInlineEditOnSelectionChange = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((val) => true);
    this._view = this._register(this._instantiationService.createInstance(InlineCompletionsView, this.editor, this.model, this._focusIsInMenu));
    InlineCompletionsController_1._instances.add(this);
    this._register(toDisposable(() => InlineCompletionsController_1._instances.delete(this)));
    this._register(autorun((reader) => {
      const model = this.model.read(reader);
      if (!model) {
        return;
      }
      if (model.state.read(reader) !== void 0) {
        for (const ctrl of InlineCompletionsController_1._instances) {
          if (ctrl !== this) {
            ctrl.reject();
          }
        }
      }
    }));
    this._register(runOnChange(this._editorObs.onDidType, (_value, _changes) => {
      if (this._enabled.get()) {
        this.model.get()?.trigger();
      }
    }));
    this._register(runOnChange(this._editorObs.onDidPaste, (_value, _changes) => {
      if (this._enabled.get()) {
        this.model.get()?.trigger();
      }
    }));
    this._register(this._commandService.onDidExecuteCommand((e) => {
      const commands = /* @__PURE__ */ new Set([
        CoreEditingCommands.Tab.id,
        CoreEditingCommands.DeleteLeft.id,
        CoreEditingCommands.DeleteRight.id,
        inlineSuggestCommitId,
        "acceptSelectedSuggestion"
      ]);
      if (commands.has(e.commandId) && editor.hasTextFocus() && this._enabled.get()) {
        let noDelay = false;
        if (e.commandId === inlineSuggestCommitId) {
          noDelay = true;
        }
        this._editorObs.forceUpdate((tx) => {
          this.model.get()?.trigger(tx, { noDelay });
        });
      }
    }));
    this._register(runOnChange(this._editorObs.selections, (_value, _, changes) => {
      if (changes.some((e) => e.reason === 3 || e.source === "api")) {
        if (!this._hideInlineEditOnSelectionChange.get() && this.model.get()?.state.get()?.kind === "inlineEdit") {
          return;
        }
        const m = this.model.get();
        if (!m) {
          return;
        }
        if (m.state.get()?.kind === "ghostText") {
          this.model.get()?.stop();
        }
      }
    }));
    this._register(autorun((reader) => {
      const isFocused = this._focusIsInEditorOrMenu.read(reader);
      if (isFocused) {
        return;
      }
      if (this._contextKeyService.getContextKeyValue("accessibleViewIsShown") || this._configurationService.getValue("editor.inlineSuggest.keepOnBlur") || editor.getOption(
        67
        /* EditorOption.inlineSuggest */
      ).keepOnBlur || InlineSuggestionHintsContentWidget.dropDownVisible) {
        return;
      }
      const model = this.model.get();
      if (!model) {
        return;
      }
      if (model.state.get()?.inlineCompletion?.isFromExplicitRequest && model.inlineEditAvailable.get()) {
        return;
      }
      transaction((tx) => {
        model.stop("automatic", tx);
      });
    }));
    this._register(autorun((reader) => {
      const state = this.model.read(reader)?.inlineCompletionState.read(reader);
      if (state?.suggestItem) {
        if (state.primaryGhostText.lineCount >= 2) {
          this._suggestWidgetAdapter.forceRenderingAbove();
        }
      } else {
        this._suggestWidgetAdapter.stopForceRenderingAbove();
      }
    }));
    this._register(toDisposable(() => {
      this._suggestWidgetAdapter.stopForceRenderingAbove();
    }));
    const currentInlineCompletionBySemanticId = derivedObservableWithCache(this, (reader, last) => {
      const model = this.model.read(reader);
      const state = model?.state.read(reader);
      if (this._suggestWidgetAdapter.selectedItem.get()) {
        return last;
      }
      return state?.inlineCompletion?.semanticId;
    });
    this._register(runOnChangeWithStore(derived((reader) => {
      this._playAccessibilitySignal.read(reader);
      currentInlineCompletionBySemanticId.read(reader);
      return {};
    }), async (_value, _, _deltas, store) => {
      const model = this.model.get();
      const state = model?.state.get();
      if (!state || !model) {
        return;
      }
      const lineText = state.kind === "ghostText" ? model.textModel.getLineContent(state.primaryGhostText.lineNumber) : "";
      await timeout(50, cancelOnDispose(store));
      await waitForState(this._suggestWidgetAdapter.selectedItem, isUndefined, () => false, cancelOnDispose(store));
      await this._accessibilitySignalService.playSignal(state.kind === "ghostText" ? AccessibilitySignal.inlineSuggestion : AccessibilitySignal.nextEditSuggestion);
      if (this.editor.getOption(
        9
        /* EditorOption.screenReaderAnnounceInlineSuggestion */
      )) {
        if (state.kind === "ghostText") {
          this._provideScreenReaderUpdate(state.primaryGhostText.renderForScreenReader(lineText));
        } else {
          this._provideScreenReaderUpdate("");
        }
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("accessibility.verbosity.inlineCompletions")) {
        this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue("accessibility.verbosity.inlineCompletions") });
      }
    }));
    this.editor.updateOptions({ inlineCompletionsAccessibilityVerbose: this._configurationService.getValue("accessibility.verbosity.inlineCompletions") });
    const contextKeySvcObs = new ObservableContextKeyService(this._contextKeyService);
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.cursorInIndentation, this._cursorIsInIndentation));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.hasSelection, (reader) => !this._editorObs.cursorSelection.read(reader)?.isEmpty()));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.cursorAtInlineEdit, this.model.map((m, reader) => m?.inlineEditState?.read(reader)?.cursorAtInlineEdit.read(reader))));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.tabShouldAcceptInlineEdit, this.model.map((m, r) => !!m?.tabShouldAcceptInlineEdit.read(r))));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.tabShouldJumpToInlineEdit, this.model.map((m, r) => !!m?.tabShouldJumpToInlineEdit.read(r))));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.inlineEditVisible, (reader) => this.model.read(reader)?.inlineEditState.read(reader) !== void 0));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.inlineSuggestionHasIndentation, (reader) => this.model.read(reader)?.getIndentationInfo(reader)?.startsWithIndentation));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize, (reader) => this.model.read(reader)?.getIndentationInfo(reader)?.startsWithIndentationLessThanTabSize));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.suppressSuggestions, (reader) => {
      const model = this.model.read(reader);
      const state = model?.inlineCompletionState.read(reader);
      return state?.primaryGhostText && state?.inlineCompletion ? state.inlineCompletion.source.inlineSuggestions.suppressSuggestions : void 0;
    }));
    this._register(contextKeySvcObs.bind(InlineCompletionContextKeys.inlineSuggestionVisible, (reader) => {
      const model = this.model.read(reader);
      const state = model?.inlineCompletionState.read(reader);
      return !!state?.inlineCompletion && state?.primaryGhostText !== void 0 && !state?.primaryGhostText.isEmpty();
    }));
    this._register(this._instantiationService.createInstance(TextModelChangeRecorder, this.editor));
  }
  playAccessibilitySignal(tx) {
    this._playAccessibilitySignal.trigger(tx);
  }
  _provideScreenReaderUpdate(content) {
    const accessibleViewShowing = this._contextKeyService.getContextKeyValue("accessibleViewIsShown");
    const accessibleViewKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView");
    let hint;
    if (!accessibleViewShowing && accessibleViewKeybinding && this.editor.getOption(
      158
      /* EditorOption.inlineCompletionsAccessibilityVerbose */
    )) {
      hint = localize("showAccessibleViewHint", "Inspect this in the accessible view ({0})", accessibleViewKeybinding.getAriaLabel());
    }
    alert(hint ? content + ", " + hint : content);
  }
  shouldShowHoverAt(range) {
    const ghostText = this.model.get()?.primaryGhostText.get();
    if (!ghostText) {
      return false;
    }
    return ghostText.parts.some((p) => range.containsPosition(new Position(ghostText.lineNumber, p.column)));
  }
  shouldShowHoverAtViewZone(viewZoneId) {
    return this._view.shouldShowHoverAtViewZone(viewZoneId);
  }
  reject() {
    transaction((tx) => {
      const m = this.model.get();
      if (m) {
        m.stop("explicitCancel", tx);
      }
    });
  }
  jump() {
    const m = this.model.get();
    if (m) {
      m.jump();
    }
  }
  testOnlyDisableUi() {
    this._view.dispose();
  }
};
InlineCompletionsController = InlineCompletionsController_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, IContextKeyService),
  __param(3, IConfigurationService),
  __param(4, ICommandService),
  __param(5, ILanguageFeatureDebounceService),
  __param(6, ILanguageFeaturesService),
  __param(7, IAccessibilitySignalService),
  __param(8, IKeybindingService),
  __param(9, IAccessibilityService)
], InlineCompletionsController);
export {
  InlineCompletionsController
};
//# sourceMappingURL=inlineCompletionsController.js.map
