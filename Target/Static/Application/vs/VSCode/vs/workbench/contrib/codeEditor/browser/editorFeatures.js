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
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { getEditorFeatures } from "../../../../editor/common/editorFeatures.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
let EditorFeaturesInstantiator = class EditorFeaturesInstantiator2 extends Disposable {
  static {
    __name(this, "EditorFeaturesInstantiator");
  }
  static {
    this.ID = "workbench.contrib.editorFeaturesInstantiator";
  }
  constructor(codeEditorService, _instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    this._instantiated = false;
    this._register(codeEditorService.onWillCreateCodeEditor(() => this._instantiate()));
    this._register(codeEditorService.onWillCreateDiffEditor(() => this._instantiate()));
    if (codeEditorService.listCodeEditors().length > 0 || codeEditorService.listDiffEditors().length > 0) {
      this._instantiate();
    }
  }
  _instantiate() {
    if (this._instantiated) {
      return;
    }
    this._instantiated = true;
    const editorFeatures = getEditorFeatures();
    for (const feature of editorFeatures) {
      try {
        const instance = this._instantiationService.createInstance(feature);
        if (typeof instance.dispose === "function") {
          this._register(instance);
        }
      } catch (err) {
        onUnexpectedError(err);
      }
    }
  }
};
EditorFeaturesInstantiator = __decorate([
  __param(0, ICodeEditorService),
  __param(1, IInstantiationService)
], EditorFeaturesInstantiator);
registerWorkbenchContribution2(
  EditorFeaturesInstantiator.ID,
  EditorFeaturesInstantiator,
  2
  /* WorkbenchPhase.BlockRestore */
);
//# sourceMappingURL=editorFeatures.js.map
