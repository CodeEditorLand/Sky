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
import { BaseTextEditorModel } from "./textEditorModel.js";
import { URI } from "../../../base/common/uri.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ILanguageDetectionService } from "../../services/languageDetection/common/languageDetectionWorkerService.js";
import { IAccessibilityService } from "../../../platform/accessibility/common/accessibility.js";
let TextResourceEditorModel = class extends BaseTextEditorModel {
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
TextResourceEditorModel = __decorateClass([
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageDetectionService),
  __decorateParam(4, IAccessibilityService)
], TextResourceEditorModel);
export {
  TextResourceEditorModel
};
//# sourceMappingURL=textResourceEditorModel.js.map
