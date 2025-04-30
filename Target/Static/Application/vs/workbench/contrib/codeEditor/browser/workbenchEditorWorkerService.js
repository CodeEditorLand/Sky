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
import { WebWorkerDescriptor } from "../../../../base/browser/webWorkerFactory.js";
import { FileAccess } from "../../../../base/common/network.js";
import { EditorWorkerService } from "../../../../editor/browser/services/editorWorkerService.js";
import { ILanguageConfigurationService } from "../../../../editor/common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let WorkbenchEditorWorkerService = class WorkbenchEditorWorkerService2 extends EditorWorkerService {
  static {
    __name(this, "WorkbenchEditorWorkerService");
  }
  constructor(modelService, configurationService, logService, languageConfigurationService, languageFeaturesService) {
    const workerDescriptor = new WebWorkerDescriptor(FileAccess.asBrowserUri("vs/editor/common/services/editorWebWorkerMain.js"), "TextEditorWorker");
    super(workerDescriptor, modelService, configurationService, logService, languageConfigurationService, languageFeaturesService);
  }
};
WorkbenchEditorWorkerService = __decorate([
  __param(0, IModelService),
  __param(1, ITextResourceConfigurationService),
  __param(2, ILogService),
  __param(3, ILanguageConfigurationService),
  __param(4, ILanguageFeaturesService)
], WorkbenchEditorWorkerService);
export {
  WorkbenchEditorWorkerService
};
//# sourceMappingURL=workbenchEditorWorkerService.js.map
