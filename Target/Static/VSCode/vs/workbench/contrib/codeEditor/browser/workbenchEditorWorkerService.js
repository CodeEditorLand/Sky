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
import { WebWorkerDescriptor } from "../../../../base/browser/webWorkerFactory.js";
import { FileAccess } from "../../../../base/common/network.js";
import { EditorWorkerService } from "../../../../editor/browser/services/editorWorkerService.js";
import { ILanguageConfigurationService } from "../../../../editor/common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let WorkbenchEditorWorkerService = class extends EditorWorkerService {
  static {
    __name(this, "WorkbenchEditorWorkerService");
  }
  constructor(modelService, configurationService, logService, languageConfigurationService, languageFeaturesService) {
    const workerDescriptor = new WebWorkerDescriptor(FileAccess.asBrowserUri("vs/editor/common/services/editorWebWorkerMain.js"), "TextEditorWorker");
    super(workerDescriptor, modelService, configurationService, logService, languageConfigurationService, languageFeaturesService);
  }
};
WorkbenchEditorWorkerService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ITextResourceConfigurationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILanguageConfigurationService),
  __decorateParam(4, ILanguageFeaturesService)
], WorkbenchEditorWorkerService);
export {
  WorkbenchEditorWorkerService
};
//# sourceMappingURL=workbenchEditorWorkerService.js.map
