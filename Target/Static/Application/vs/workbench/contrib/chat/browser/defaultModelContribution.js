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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "../common/languageModels.js";
import { DEFAULT_MODEL_PICKER_CATEGORY } from "../common/widget/input/modelPickerWidget.js";
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
function createDefaultModelArrays() {
  return {
    modelIds: [""],
    modelLabels: [localize("defaultModel", "Auto (Vendor Default)")],
    modelDescriptions: [localize("defaultModelDescription", "Use the vendor's default model")]
  };
}
__name(createDefaultModelArrays, "createDefaultModelArrays");
let DefaultModelContribution = class DefaultModelContribution2 extends Disposable {
  static {
    __name(this, "DefaultModelContribution");
  }
  constructor(_arrays, _options, _languageModelsService, _logService) {
    super();
    this._arrays = _arrays;
    this._options = _options;
    this._languageModelsService = _languageModelsService;
    this._logService = _logService;
    this._register(_languageModelsService.onDidChangeLanguageModels(() => this._updateModelValues()));
    this._updateModelValues();
  }
  _updateModelValues() {
    const { modelIds, modelLabels, modelDescriptions } = this._arrays;
    const { configKey, configSectionId, logPrefix, filter } = this._options;
    try {
      modelIds.length = 0;
      modelLabels.length = 0;
      modelDescriptions.length = 0;
      modelIds.push("");
      modelLabels.push(localize("defaultModel", "Auto (Vendor Default)"));
      modelDescriptions.push(localize("defaultModelDescription", "Use the vendor's default model"));
      const models = [];
      const allModelIds = this._languageModelsService.getLanguageModelIds();
      for (const modelId of allModelIds) {
        try {
          const metadata = this._languageModelsService.lookupLanguageModel(modelId);
          if (metadata) {
            models.push({ identifier: modelId, metadata });
          } else {
            this._logService.warn(`${logPrefix} No metadata found for model ID: ${modelId}`);
          }
        } catch (e) {
          this._logService.error(`${logPrefix} Error looking up model ${modelId}:`, e);
        }
      }
      const supportedModels = models.filter((model) => {
        if (!model.metadata?.isUserSelectable) {
          return false;
        }
        if (filter && !filter(model.metadata)) {
          return false;
        }
        return true;
      });
      supportedModels.sort((a, b) => {
        const aCategory = a.metadata.modelPickerCategory ?? DEFAULT_MODEL_PICKER_CATEGORY;
        const bCategory = b.metadata.modelPickerCategory ?? DEFAULT_MODEL_PICKER_CATEGORY;
        if (aCategory.order !== bCategory.order) {
          return aCategory.order - bCategory.order;
        }
        return a.metadata.name.localeCompare(b.metadata.name);
      });
      for (const model of supportedModels) {
        try {
          const qualifiedName = ILanguageModelChatMetadata.asQualifiedName(model.metadata);
          modelIds.push(qualifiedName);
          modelLabels.push(model.metadata.name);
          modelDescriptions.push(model.metadata.tooltip ?? model.metadata.detail ?? "");
        } catch (e) {
          this._logService.error(`${logPrefix} Error adding model ${model.metadata.name}:`, e);
        }
      }
      if (configSectionId) {
        configurationRegistry.notifyConfigurationSchemaUpdated({
          id: configSectionId,
          properties: {
            [configKey]: {}
          }
        });
      }
    } catch (e) {
      this._logService.error(`${logPrefix} Error updating model values:`, e);
    }
  }
};
DefaultModelContribution = __decorate([
  __param(2, ILanguageModelsService),
  __param(3, ILogService)
], DefaultModelContribution);
export {
  DefaultModelContribution,
  createDefaultModelArrays
};
//# sourceMappingURL=defaultModelContribution.js.map
