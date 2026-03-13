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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { Extensions, IExtensionFeaturesManagementService } from "../../../services/extensionManagement/common/extensionFeatures.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { localize } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
const ILanguageModelStatsService = createDecorator("ILanguageModelStatsService");
let LanguageModelStatsService = class LanguageModelStatsService2 extends Disposable {
  static {
    __name(this, "LanguageModelStatsService");
  }
  constructor(extensionFeaturesManagementService, storageService) {
    super();
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    for (const key in storageService.keys(
      -1,
      0
      /* StorageTarget.USER */
    )) {
      if (key.startsWith("languageModelStats.") || key.startsWith("languageModelAccess.")) {
        storageService.remove(
          key,
          -1
          /* StorageScope.APPLICATION */
        );
      }
    }
  }
  async update(model, extensionId, agent, tokenCount) {
    await this.extensionFeaturesManagementService.getAccess(extensionId, CopilotUsageExtensionFeatureId);
  }
};
LanguageModelStatsService = __decorate([
  __param(0, IExtensionFeaturesManagementService),
  __param(1, IStorageService)
], LanguageModelStatsService);
const CopilotUsageExtensionFeatureId = "copilot";
Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: CopilotUsageExtensionFeatureId,
  label: localize("Language Models", "Copilot"),
  description: localize("languageModels", "Language models usage statistics of this extension."),
  icon: Codicon.copilot,
  access: {
    canToggle: false
  },
  accessDataLabel: localize("chat", "chat")
});
export {
  CopilotUsageExtensionFeatureId,
  ILanguageModelStatsService,
  LanguageModelStatsService
};
//# sourceMappingURL=languageModelStats.js.map
