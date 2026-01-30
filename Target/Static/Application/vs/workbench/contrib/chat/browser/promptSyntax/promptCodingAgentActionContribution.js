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
import { Disposable, DisposableMap } from "../../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../../../editor/browser/editorExtensions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { PROMPT_LANGUAGE_ID } from "../../common/promptSyntax/promptTypes.js";
import { PromptCodingAgentActionOverlayWidget } from "./promptCodingAgentActionOverlay.js";
let PromptCodingAgentActionContribution = class PromptCodingAgentActionContribution2 extends Disposable {
  static {
    __name(this, "PromptCodingAgentActionContribution");
  }
  static {
    this.ID = "promptCodingAgentActionContribution";
  }
  constructor(_editor, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._overlayWidgets = this._register(new DisposableMap());
    this._register(this._editor.onDidChangeModel(() => {
      this._updateOverlayWidget();
    }));
    this._updateOverlayWidget();
  }
  _updateOverlayWidget() {
    const model = this._editor.getModel();
    this._overlayWidgets.deleteAndDispose(this._editor);
    if (model && model.getLanguageId() === PROMPT_LANGUAGE_ID) {
      const widget = this._instantiationService.createInstance(PromptCodingAgentActionOverlayWidget, this._editor);
      this._overlayWidgets.set(this._editor, widget);
    }
  }
};
PromptCodingAgentActionContribution = __decorate([
  __param(1, IInstantiationService)
], PromptCodingAgentActionContribution);
registerEditorContribution(
  PromptCodingAgentActionContribution.ID,
  PromptCodingAgentActionContribution,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
export {
  PromptCodingAgentActionContribution
};
//# sourceMappingURL=promptCodingAgentActionContribution.js.map
