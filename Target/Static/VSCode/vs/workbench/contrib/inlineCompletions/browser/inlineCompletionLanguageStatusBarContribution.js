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
import { createHotClass } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorunWithStore, debouncedObservable, derived } from "../../../../base/common/observable.js";
import Severity from "../../../../base/common/severity.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../editor/browser/observableCodeEditor.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { localize } from "../../../../nls.js";
import { ILanguageStatusService } from "../../../services/languageStatus/common/languageStatusService.js";
let InlineCompletionLanguageStatusBarContribution = class extends Disposable {
  constructor(_editor, _languageStatusService) {
    super();
    this._editor = _editor;
    this._languageStatusService = _languageStatusService;
    this._register(autorunWithStore((reader, store) => {
      const state = this._state.read(reader);
      if (!state) {
        return;
      }
      const status = state.status.read(reader);
      const statusMap = {
        loading: { shortLabel: "", label: localize("inlineSuggestionLoading", "Loading..."), loading: true },
        ghostText: { shortLabel: "$(lightbulb)", label: "$(copilot) " + localize("inlineCompletionAvailable", "Inline completion available"), loading: false },
        inlineEdit: { shortLabel: "$(lightbulb-sparkle)", label: "$(copilot) " + localize("inlineEditAvailable", "Inline edit available"), loading: false },
        noSuggestion: { shortLabel: "$(circle-slash)", label: "$(copilot) " + localize("noInlineSuggestionAvailable", "No inline suggestion available"), loading: false }
      };
      InlineCompletionLanguageStatusBarContribution.languageStatusBarDisposables.forEach((d) => d.clear());
      InlineCompletionLanguageStatusBarContribution.languageStatusBarDisposables.add(store);
      store.add({
        dispose: /* @__PURE__ */ __name(() => InlineCompletionLanguageStatusBarContribution.languageStatusBarDisposables.delete(store), "dispose")
      });
      store.add(this._languageStatusService.addStatus({
        accessibilityInfo: void 0,
        busy: statusMap[status].loading,
        command: void 0,
        detail: localize("inlineSuggestionsSmall", "Inline suggestions"),
        id: "inlineSuggestions",
        label: { value: statusMap[status].label, shortValue: statusMap[status].shortLabel },
        name: localize("inlineSuggestions", "Inline Suggestions"),
        selector: { pattern: state.model.textModel.uri.fsPath },
        severity: Severity.Info,
        source: "inlineSuggestions"
      }));
    }));
  }
  static {
    __name(this, "InlineCompletionLanguageStatusBarContribution");
  }
  static hot = createHotClass(InlineCompletionLanguageStatusBarContribution);
  static Id = "vs.editor.contrib.inlineCompletionLanguageStatusBarContribution";
  static languageStatusBarDisposables = /* @__PURE__ */ new Set();
  _c = InlineCompletionsController.get(this._editor);
  _state = derived(this, (reader) => {
    const model = this._c?.model.read(reader);
    if (!model) {
      return void 0;
    }
    if (!observableCodeEditor(this._editor).isFocused.read(reader)) {
      return void 0;
    }
    return {
      model,
      status: debouncedObservable(model.status, 300)
    };
  });
};
InlineCompletionLanguageStatusBarContribution = __decorateClass([
  __decorateParam(1, ILanguageStatusService)
], InlineCompletionLanguageStatusBarContribution);
export {
  InlineCompletionLanguageStatusBarContribution
};
//# sourceMappingURL=inlineCompletionLanguageStatusBarContribution.js.map
