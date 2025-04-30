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
var InlineCompletionLanguageStatusBarContribution_1;
import { createHotClass } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorunWithStore, debouncedObservable, derived } from "../../../../base/common/observable.js";
import Severity from "../../../../base/common/severity.js";
import { observableCodeEditor } from "../../../../editor/browser/observableCodeEditor.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { localize } from "../../../../nls.js";
import { ILanguageStatusService } from "../../../services/languageStatus/common/languageStatusService.js";
let InlineCompletionLanguageStatusBarContribution = class InlineCompletionLanguageStatusBarContribution2 extends Disposable {
  static {
    __name(this, "InlineCompletionLanguageStatusBarContribution");
  }
  static {
    InlineCompletionLanguageStatusBarContribution_1 = this;
  }
  static {
    this.hot = createHotClass(InlineCompletionLanguageStatusBarContribution_1);
  }
  static {
    this.Id = "vs.editor.contrib.inlineCompletionLanguageStatusBarContribution";
  }
  static {
    this.languageStatusBarDisposables = /* @__PURE__ */ new Set();
  }
  constructor(_editor, _languageStatusService) {
    super();
    this._editor = _editor;
    this._languageStatusService = _languageStatusService;
    this._c = InlineCompletionsController.get(this._editor);
    this._state = derived(this, (reader) => {
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
      InlineCompletionLanguageStatusBarContribution_1.languageStatusBarDisposables.forEach((d) => d.clear());
      InlineCompletionLanguageStatusBarContribution_1.languageStatusBarDisposables.add(store);
      store.add({
        dispose: /* @__PURE__ */ __name(() => InlineCompletionLanguageStatusBarContribution_1.languageStatusBarDisposables.delete(store), "dispose")
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
};
InlineCompletionLanguageStatusBarContribution = InlineCompletionLanguageStatusBarContribution_1 = __decorate([
  __param(1, ILanguageStatusService)
], InlineCompletionLanguageStatusBarContribution);
export {
  InlineCompletionLanguageStatusBarContribution
};
//# sourceMappingURL=inlineCompletionLanguageStatusBarContribution.js.map
