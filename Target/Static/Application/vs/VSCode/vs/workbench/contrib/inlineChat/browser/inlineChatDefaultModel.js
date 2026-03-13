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
import { localize } from "../../../../nls.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { ILanguageModelsService } from "../../chat/common/languageModels.js";
import { createDefaultModelArrays, DefaultModelContribution } from "../../chat/browser/defaultModelContribution.js";
const arrays = createDefaultModelArrays();
let InlineChatDefaultModel = class InlineChatDefaultModel2 extends DefaultModelContribution {
  static {
    __name(this, "InlineChatDefaultModel");
  }
  static {
    this.ID = "workbench.contrib.inlineChatDefaultModel";
  }
  static {
    this.modelIds = arrays.modelIds;
  }
  static {
    this.modelLabels = arrays.modelLabels;
  }
  static {
    this.modelDescriptions = arrays.modelDescriptions;
  }
  constructor(languageModelsService, logService) {
    super(arrays, {
      configKey: "inlineChat.defaultModel",
      configSectionId: "inlineChat",
      logPrefix: "[InlineChatDefaultModel]",
      filter: /* @__PURE__ */ __name((metadata) => !!metadata.capabilities?.toolCalling, "filter")
    }, languageModelsService, logService);
  }
};
InlineChatDefaultModel = __decorate([
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
    [
      "inlineChat.defaultModel"
      /* InlineChatConfigKeys.DefaultModel */
    ]: {
      description: localize("inlineChatDefaultModelDescription", "Select the default language model to use for inline chat from the available providers. Model names may include the provider in parentheses, for example 'Claude Haiku 4.5 (copilot)'."),
      type: "string",
      default: "",
      order: 1,
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
