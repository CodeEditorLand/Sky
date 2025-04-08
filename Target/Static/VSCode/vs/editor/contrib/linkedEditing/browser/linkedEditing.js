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
import * as arrays from "../../../../base/common/arrays.js";
import { Delayer, first } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Color } from "../../../../base/common/color.js";
import { isCancellationError, onUnexpectedError, onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import * as strings from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorCommand, EditorContributionInstantiation, registerEditorAction, registerEditorCommand, registerEditorContribution, registerModelAndPositionCommand, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IPosition, Position } from "../../../common/core/position.js";
import { IRange, Range } from "../../../common/core/range.js";
import { IEditorContribution, IEditorDecorationsCollection } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { IModelDeltaDecoration, ITextModel, TrackedRangeStickiness } from "../../../common/model.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { LinkedEditingRangeProvider, LinkedEditingRanges } from "../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import * as nls from "../../../../nls.js";
import { ContextKeyExpr, IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { registerColor } from "../../../../platform/theme/common/colorRegistry.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { ISingleEditOperation } from "../../../common/core/editOperation.js";
import { IFeatureDebounceInformation, ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import "./linkedEditing.css";
const CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE = new RawContextKey("LinkedEditingInputVisible", false);
const DECORATION_CLASS_NAME = "linked-editing-decoration";
let LinkedEditingContribution = class extends Disposable {
  constructor(editor, contextKeyService, languageFeaturesService, languageConfigurationService, languageFeatureDebounceService) {
    super();
    this.languageConfigurationService = languageConfigurationService;
    this._editor = editor;
    this._providers = languageFeaturesService.linkedEditingRangeProvider;
    this._enabled = false;
    this._visibleContextKey = CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
    this._debounceInformation = languageFeatureDebounceService.for(this._providers, "Linked Editing", { max: 200 });
    this._currentDecorations = this._editor.createDecorationsCollection();
    this._languageWordPattern = null;
    this._currentWordPattern = null;
    this._ignoreChangeEvent = false;
    this._localToDispose = this._register(new DisposableStore());
    this._rangeUpdateTriggerPromise = null;
    this._rangeSyncTriggerPromise = null;
    this._currentRequestCts = null;
    this._currentRequestPosition = null;
    this._currentRequestModelVersion = null;
    this._register(this._editor.onDidChangeModel(() => this.reinitialize(true)));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.linkedEditing) || e.hasChanged(EditorOption.renameOnType)) {
        this.reinitialize(false);
      }
    }));
    this._register(this._providers.onDidChange(() => this.reinitialize(false)));
    this._register(this._editor.onDidChangeModelLanguage(() => this.reinitialize(true)));
    this.reinitialize(true);
  }
  static {
    __name(this, "LinkedEditingContribution");
  }
  static ID = "editor.contrib.linkedEditing";
  static DECORATION = ModelDecorationOptions.register({
    description: "linked-editing",
    stickiness: TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges,
    className: DECORATION_CLASS_NAME
  });
  static get(editor) {
    return editor.getContribution(LinkedEditingContribution.ID);
  }
  _debounceDuration;
  _editor;
  _providers;
  _enabled;
  _visibleContextKey;
  _debounceInformation;
  _rangeUpdateTriggerPromise;
  _rangeSyncTriggerPromise;
  _currentRequestCts;
  _currentRequestPosition;
  _currentRequestModelVersion;
  _currentDecorations;
  // The one at index 0 is the reference one
  _syncRangesToken = 0;
  _languageWordPattern;
  _currentWordPattern;
  _ignoreChangeEvent;
  _localToDispose = this._register(new DisposableStore());
  reinitialize(forceRefresh) {
    const model = this._editor.getModel();
    const isEnabled = model !== null && (this._editor.getOption(EditorOption.linkedEditing) || this._editor.getOption(EditorOption.renameOnType)) && this._providers.has(model);
    if (isEnabled === this._enabled && !forceRefresh) {
      return;
    }
    this._enabled = isEnabled;
    this.clearRanges();
    this._localToDispose.clear();
    if (!isEnabled || model === null) {
      return;
    }
    this._localToDispose.add(
      Event.runAndSubscribe(
        model.onDidChangeLanguageConfiguration,
        () => {
          this._languageWordPattern = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
        }
      )
    );
    const rangeUpdateScheduler = new Delayer(this._debounceInformation.get(model));
    const triggerRangeUpdate = /* @__PURE__ */ __name(() => {
      this._rangeUpdateTriggerPromise = rangeUpdateScheduler.trigger(() => this.updateRanges(), this._debounceDuration ?? this._debounceInformation.get(model));
    }, "triggerRangeUpdate");
    const rangeSyncScheduler = new Delayer(0);
    const triggerRangeSync = /* @__PURE__ */ __name((token) => {
      this._rangeSyncTriggerPromise = rangeSyncScheduler.trigger(() => this._syncRanges(token));
    }, "triggerRangeSync");
    this._localToDispose.add(this._editor.onDidChangeCursorPosition(() => {
      triggerRangeUpdate();
    }));
    this._localToDispose.add(this._editor.onDidChangeModelContent((e) => {
      if (!this._ignoreChangeEvent) {
        if (this._currentDecorations.length > 0) {
          const referenceRange = this._currentDecorations.getRange(0);
          if (referenceRange && e.changes.every((c) => referenceRange.intersectRanges(c.range))) {
            triggerRangeSync(this._syncRangesToken);
            return;
          }
        }
      }
      triggerRangeUpdate();
    }));
    this._localToDispose.add({
      dispose: /* @__PURE__ */ __name(() => {
        rangeUpdateScheduler.dispose();
        rangeSyncScheduler.dispose();
      }, "dispose")
    });
    this.updateRanges();
  }
  _syncRanges(token) {
    if (!this._editor.hasModel() || token !== this._syncRangesToken || this._currentDecorations.length === 0) {
      return;
    }
    const model = this._editor.getModel();
    const referenceRange = this._currentDecorations.getRange(0);
    if (!referenceRange || referenceRange.startLineNumber !== referenceRange.endLineNumber) {
      return this.clearRanges();
    }
    const referenceValue = model.getValueInRange(referenceRange);
    if (this._currentWordPattern) {
      const match = referenceValue.match(this._currentWordPattern);
      const matchLength = match ? match[0].length : 0;
      if (matchLength !== referenceValue.length) {
        return this.clearRanges();
      }
    }
    const edits = [];
    for (let i = 1, len = this._currentDecorations.length; i < len; i++) {
      const mirrorRange = this._currentDecorations.getRange(i);
      if (!mirrorRange) {
        continue;
      }
      if (mirrorRange.startLineNumber !== mirrorRange.endLineNumber) {
        edits.push({
          range: mirrorRange,
          text: referenceValue
        });
      } else {
        let oldValue = model.getValueInRange(mirrorRange);
        let newValue = referenceValue;
        let rangeStartColumn = mirrorRange.startColumn;
        let rangeEndColumn = mirrorRange.endColumn;
        const commonPrefixLength = strings.commonPrefixLength(oldValue, newValue);
        rangeStartColumn += commonPrefixLength;
        oldValue = oldValue.substr(commonPrefixLength);
        newValue = newValue.substr(commonPrefixLength);
        const commonSuffixLength = strings.commonSuffixLength(oldValue, newValue);
        rangeEndColumn -= commonSuffixLength;
        oldValue = oldValue.substr(0, oldValue.length - commonSuffixLength);
        newValue = newValue.substr(0, newValue.length - commonSuffixLength);
        if (rangeStartColumn !== rangeEndColumn || newValue.length !== 0) {
          edits.push({
            range: new Range(mirrorRange.startLineNumber, rangeStartColumn, mirrorRange.endLineNumber, rangeEndColumn),
            text: newValue
          });
        }
      }
    }
    if (edits.length === 0) {
      return;
    }
    try {
      this._editor.popUndoStop();
      this._ignoreChangeEvent = true;
      const prevEditOperationType = this._editor._getViewModel().getPrevEditOperationType();
      this._editor.executeEdits("linkedEditing", edits);
      this._editor._getViewModel().setPrevEditOperationType(prevEditOperationType);
    } finally {
      this._ignoreChangeEvent = false;
    }
  }
  dispose() {
    this.clearRanges();
    super.dispose();
  }
  clearRanges() {
    this._visibleContextKey.set(false);
    this._currentDecorations.clear();
    if (this._currentRequestCts) {
      this._currentRequestCts.cancel();
      this._currentRequestCts = null;
      this._currentRequestPosition = null;
    }
  }
  get currentUpdateTriggerPromise() {
    return this._rangeUpdateTriggerPromise || Promise.resolve();
  }
  get currentSyncTriggerPromise() {
    return this._rangeSyncTriggerPromise || Promise.resolve();
  }
  async updateRanges(force = false) {
    if (!this._editor.hasModel()) {
      this.clearRanges();
      return;
    }
    const position = this._editor.getPosition();
    if (!this._enabled && !force || this._editor.getSelections().length > 1) {
      this.clearRanges();
      return;
    }
    const model = this._editor.getModel();
    const modelVersionId = model.getVersionId();
    if (this._currentRequestPosition && this._currentRequestModelVersion === modelVersionId) {
      if (position.equals(this._currentRequestPosition)) {
        return;
      }
      if (this._currentDecorations.length > 0) {
        const range = this._currentDecorations.getRange(0);
        if (range && range.containsPosition(position)) {
          return;
        }
      }
    }
    this.clearRanges();
    this._currentRequestPosition = position;
    this._currentRequestModelVersion = modelVersionId;
    const currentRequestCts = this._currentRequestCts = new CancellationTokenSource();
    try {
      const sw = new StopWatch(false);
      const response = await getLinkedEditingRanges(this._providers, model, position, currentRequestCts.token);
      this._debounceInformation.update(model, sw.elapsed());
      if (currentRequestCts !== this._currentRequestCts) {
        return;
      }
      this._currentRequestCts = null;
      if (modelVersionId !== model.getVersionId()) {
        return;
      }
      let ranges = [];
      if (response?.ranges) {
        ranges = response.ranges;
      }
      this._currentWordPattern = response?.wordPattern || this._languageWordPattern;
      let foundReferenceRange = false;
      for (let i = 0, len = ranges.length; i < len; i++) {
        if (Range.containsPosition(ranges[i], position)) {
          foundReferenceRange = true;
          if (i !== 0) {
            const referenceRange = ranges[i];
            ranges.splice(i, 1);
            ranges.unshift(referenceRange);
          }
          break;
        }
      }
      if (!foundReferenceRange) {
        this.clearRanges();
        return;
      }
      const decorations = ranges.map((range) => ({ range, options: LinkedEditingContribution.DECORATION }));
      this._visibleContextKey.set(true);
      this._currentDecorations.set(decorations);
      this._syncRangesToken++;
    } catch (err) {
      if (!isCancellationError(err)) {
        onUnexpectedError(err);
      }
      if (this._currentRequestCts === currentRequestCts || !this._currentRequestCts) {
        this.clearRanges();
      }
    }
  }
  // for testing
  setDebounceDuration(timeInMS) {
    this._debounceDuration = timeInMS;
  }
  // private printDecorators(model: ITextModel) {
  // 	return this._currentDecorations.map(d => {
  // 		const range = model.getDecorationRange(d);
  // 		if (range) {
  // 			return this.printRange(range);
  // 		}
  // 		return 'invalid';
  // 	}).join(',');
  // }
  // private printChanges(changes: IModelContentChange[]) {
  // 	return changes.map(c => {
  // 		return `${this.printRange(c.range)} - ${c.text}`;
  // 	}
  // 	).join(',');
  // }
  // private printRange(range: IRange) {
  // 	return `${range.startLineNumber},${range.startColumn}/${range.endLineNumber},${range.endColumn}`;
  // }
};
LinkedEditingContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, ILanguageFeatureDebounceService)
], LinkedEditingContribution);
class LinkedEditingAction extends EditorAction {
  static {
    __name(this, "LinkedEditingAction");
  }
  constructor() {
    super({
      id: "editor.action.linkedEditing",
      label: nls.localize2("linkedEditing.label", "Start Linked Editing"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasRenameProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.F2,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  runCommand(accessor, args) {
    const editorService = accessor.get(ICodeEditorService);
    const [uri, pos] = Array.isArray(args) && args || [void 0, void 0];
    if (URI.isUri(uri) && Position.isIPosition(pos)) {
      return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then((editor) => {
        if (!editor) {
          return;
        }
        editor.setPosition(pos);
        editor.invokeWithinContext((accessor2) => {
          this.reportTelemetry(accessor2, editor);
          return this.run(accessor2, editor);
        });
      }, onUnexpectedError);
    }
    return super.runCommand(accessor, args);
  }
  run(_accessor, editor) {
    const controller = LinkedEditingContribution.get(editor);
    if (controller) {
      return Promise.resolve(controller.updateRanges(true));
    }
    return Promise.resolve();
  }
}
const LinkedEditingCommand = EditorCommand.bindToContribution(LinkedEditingContribution.get);
registerEditorCommand(new LinkedEditingCommand({
  id: "cancelLinkedEditingInput",
  precondition: CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE,
  handler: /* @__PURE__ */ __name((x) => x.clearRanges(), "handler"),
  kbOpts: {
    kbExpr: EditorContextKeys.editorTextFocus,
    weight: KeybindingWeight.EditorContrib + 99,
    primary: KeyCode.Escape,
    secondary: [KeyMod.Shift | KeyCode.Escape]
  }
}));
function getLinkedEditingRanges(providers, model, position, token) {
  const orderedByScore = providers.ordered(model);
  return first(orderedByScore.map((provider) => async () => {
    try {
      return await provider.provideLinkedEditingRanges(model, position, token);
    } catch (e) {
      onUnexpectedExternalError(e);
      return void 0;
    }
  }), (result) => !!result && arrays.isNonEmptyArray(result?.ranges));
}
__name(getLinkedEditingRanges, "getLinkedEditingRanges");
const editorLinkedEditingBackground = registerColor("editor.linkedEditingBackground", { dark: Color.fromHex("#f00").transparent(0.3), light: Color.fromHex("#f00").transparent(0.3), hcDark: Color.fromHex("#f00").transparent(0.3), hcLight: Color.white }, nls.localize("editorLinkedEditingBackground", "Background color when the editor auto renames on type."));
registerModelAndPositionCommand("_executeLinkedEditingProvider", (_accessor, model, position) => {
  const { linkedEditingRangeProvider } = _accessor.get(ILanguageFeaturesService);
  return getLinkedEditingRanges(linkedEditingRangeProvider, model, position, CancellationToken.None);
});
registerEditorContribution(LinkedEditingContribution.ID, LinkedEditingContribution, EditorContributionInstantiation.AfterFirstRender);
registerEditorAction(LinkedEditingAction);
export {
  CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE,
  LinkedEditingAction,
  LinkedEditingContribution,
  editorLinkedEditingBackground
};
//# sourceMappingURL=linkedEditing.js.map
