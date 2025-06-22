var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseTextEditorModel } from "./textEditorModel.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ILanguageDetectionService } from "../../services/languageDetection/common/languageDetectionWorkerService.js";
import { IAccessibilityService } from "../../../platform/accessibility/common/accessibility.js";
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
let TextResourceEditorModel = class TextResourceEditorModel2 extends BaseTextEditorModel {
  static {
    __name(this, "TextResourceEditorModel");
  }
  constructor(resource, languageService, modelService, languageDetectionService, accessibilityService) {
    super(modelService, languageService, languageDetectionService, accessibilityService, resource);
  }
  dispose() {
    if (this.textEditorModelHandle) {
      this.modelService.destroyModel(this.textEditorModelHandle);
    }
    super.dispose();
  }
};
TextResourceEditorModel = __decorate([
  __param(1, ILanguageService),
  __param(2, IModelService),
  __param(3, ILanguageDetectionService),
  __param(4, IAccessibilityService)
], TextResourceEditorModel);
export {
  TextResourceEditorModel
};
//# sourceMappingURL=textResourceEditorModel.js.map
