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
var InlineChatDefaultModel_1;
import { localize } from "../../../../nls.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageModelsService } from "../../chat/common/languageModels.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { DEFAULT_MODEL_PICKER_CATEGORY } from "../../chat/common/widget/input/modelPickerWidget.js";
let InlineChatDefaultModel = class InlineChatDefaultModel2 extends Disposable {
  static {
    __name(this, "InlineChatDefaultModel");
  }
  static {
    InlineChatDefaultModel_1 = this;
  }
  static {
    this.ID = "workbench.contrib.inlineChatDefaultModel";
  }
  static {
    this.configName = "inlineChat.defaultModel";
  }
  static {
    this.modelIds = [""];
  }
  static {
    this.modelLabels = [localize("defaultModel", "Auto (Vendor Default)")];
  }
  static {
    this.modelDescriptions = [localize("defaultModelDescription", "Use the vendor's default model")];
  }
  constructor(languageModelsService, logService) {
    super();
    this.languageModelsService = languageModelsService;
    this.logService = logService;
    this._register(languageModelsService.onDidChangeLanguageModels(() => this._updateModelValues()));
    this._updateModelValues();
  }
  _updateModelValues() {
    try {
      InlineChatDefaultModel_1.modelIds.length = 0;
      InlineChatDefaultModel_1.modelLabels.length = 0;
      InlineChatDefaultModel_1.modelDescriptions.length = 0;
      InlineChatDefaultModel_1.modelIds.push("");
      InlineChatDefaultModel_1.modelLabels.push(localize("defaultModel", "Auto (Vendor Default)"));
      InlineChatDefaultModel_1.modelDescriptions.push(localize("defaultModelDescription", "Use the vendor's default model"));
      const modelIds = this.languageModelsService.getLanguageModelIds();
      const models = [];
      for (const modelId of modelIds) {
        try {
          const metadata = this.languageModelsService.lookupLanguageModel(modelId);
          if (metadata) {
            models.push({ identifier: modelId, metadata });
          } else {
            this.logService.warn(`[InlineChatDefaultModel] No metadata found for model ID: ${modelId}`);
          }
        } catch (e) {
          this.logService.error(`[InlineChatDefaultModel] Error looking up model ${modelId}:`, e);
        }
      }
      const supportedModels = models.filter((model) => {
        if (!model.metadata?.isUserSelectable) {
          return false;
        }
        if (!model.metadata.capabilities?.toolCalling) {
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
          const qualifiedName = `${model.metadata.name} (${model.metadata.vendor})`;
          InlineChatDefaultModel_1.modelIds.push(qualifiedName);
          InlineChatDefaultModel_1.modelLabels.push(model.metadata.name);
          InlineChatDefaultModel_1.modelDescriptions.push(model.metadata.tooltip ?? model.metadata.detail ?? "");
        } catch (e) {
          this.logService.error(`[InlineChatDefaultModel] Error adding model ${model.metadata.name}:`, e);
        }
      }
    } catch (e) {
      this.logService.error("[InlineChatDefaultModel] Error updating model values:", e);
    }
  }
};
InlineChatDefaultModel = InlineChatDefaultModel_1 = __decorate([
  __param(0, ILanguageModelsService),
  __param(1, ILogService)
], InlineChatDefaultModel);
registerWorkbenchContribution2(
  InlineChatDefaultModel.ID,
  InlineChatDefaultModel,
  2
  /* WorkbenchPhase.BlockRestore */
);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  ...{ id: "inlineChat", title: localize("inlineChatConfigurationTitle", "Inline Chat"), order: 30, type: "object" },
  properties: {
    [InlineChatDefaultModel.configName]: {
      description: localize("inlineChatDefaultModelDescription", "Select the default language model to use for inline chat from the available providers. Model names may include the provider in parentheses, for example 'Claude Haiku 4.5 (copilot)'."),
      type: "string",
      default: "",
      enum: InlineChatDefaultModel.modelIds,
      enumItemLabels: InlineChatDefaultModel.modelLabels,
      markdownEnumDescriptions: InlineChatDefaultModel.modelDescriptions
    }
  }
});
export {
  InlineChatDefaultModel
};
//# sourceMappingURL=inlineChatDefaultModel.js.map
