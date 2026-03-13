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
import { createHotClass } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorunWithStore, debouncedObservable, derived, observableFromEvent } from "../../../../base/common/observable.js";
import Severity from "../../../../base/common/severity.js";
import { isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { localize } from "../../../../nls.js";
import { IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ILanguageStatusService } from "../../../services/languageStatus/common/languageStatusService.js";
let InlineCompletionLanguageStatusBarContribution = class InlineCompletionLanguageStatusBarContribution2 extends Disposable {
  static {
    __name(this, "InlineCompletionLanguageStatusBarContribution");
  }
  static {
    this.hot = createHotClass(this);
  }
  static {
    this.Id = "vs.contrib.inlineCompletionLanguageStatusBarContribution";
  }
  static {
    this.languageStatusBarDisposables = /* @__PURE__ */ new Set();
  }
  constructor(_languageStatusService, _editorService, _chatEntitlementService) {
    super();
    this._languageStatusService = _languageStatusService;
    this._editorService = _editorService;
    this._chatEntitlementService = _chatEntitlementService;
    this._activeEditor = observableFromEvent(this, _editorService.onDidActiveEditorChange, () => this._editorService.activeTextEditorControl);
    this._sentiment = this._chatEntitlementService.sentimentObs;
    this._state = derived(this, (reader) => {
      const editor = this._activeEditor.read(reader);
      if (!editor || !isCodeEditor(editor)) {
        return void 0;
      }
      const c = InlineCompletionsController.get(editor);
      const model = c?.model.read(reader);
      if (!model) {
        return void 0;
      }
      return {
        model,
        status: debouncedObservable(model.status, 300)
      };
    });
    this._register(autorunWithStore((reader, store) => {
      const sentiment = this._sentiment.read(reader);
      if (sentiment.hidden) {
        return;
      }
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
InlineCompletionLanguageStatusBarContribution = __decorate([
  __param(0, ILanguageStatusService),
  __param(1, IEditorService),
  __param(2, IChatEntitlementService)
], InlineCompletionLanguageStatusBarContribution);
export {
  InlineCompletionLanguageStatusBarContribution
};
//# sourceMappingURL=inlineCompletionLanguageStatusBarContribution.js.map
