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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { FoldingController } from "../../../../editor/contrib/folding/browser/folding.js";
import * as nls from "../../../../nls.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry, IWorkbenchContribution } from "../../../common/contributions.js";
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { editorConfigurationBaseNode } from "../../../../editor/common/config/editorConfigurationSchema.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { FoldingRangeProvider } from "../../../../editor/common/languages.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
let DefaultFoldingRangeProvider = class extends Disposable {
  constructor(_extensionService, _configurationService) {
    super();
    this._extensionService = _extensionService;
    this._configurationService = _configurationService;
    this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
    this._store.add(FoldingController.setFoldingRangeProviderSelector(this._selectFoldingRangeProvider.bind(this)));
    this._updateConfigValues();
  }
  static {
    __name(this, "DefaultFoldingRangeProvider");
  }
  static configName = "editor.defaultFoldingRangeProvider";
  static extensionIds = [];
  static extensionItemLabels = [];
  static extensionDescriptions = [];
  async _updateConfigValues() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    DefaultFoldingRangeProvider.extensionIds.length = 0;
    DefaultFoldingRangeProvider.extensionItemLabels.length = 0;
    DefaultFoldingRangeProvider.extensionDescriptions.length = 0;
    DefaultFoldingRangeProvider.extensionIds.push(null);
    DefaultFoldingRangeProvider.extensionItemLabels.push(nls.localize("null", "All"));
    DefaultFoldingRangeProvider.extensionDescriptions.push(nls.localize("nullFormatterDescription", "All active folding range providers"));
    const languageExtensions = [];
    const otherExtensions = [];
    for (const extension of this._extensionService.extensions) {
      if (extension.main || extension.browser) {
        if (extension.categories?.find((cat) => cat === "Programming Languages")) {
          languageExtensions.push(extension);
        } else {
          otherExtensions.push(extension);
        }
      }
    }
    const sorter = /* @__PURE__ */ __name((a, b) => a.name.localeCompare(b.name), "sorter");
    for (const extension of languageExtensions.sort(sorter)) {
      DefaultFoldingRangeProvider.extensionIds.push(extension.identifier.value);
      DefaultFoldingRangeProvider.extensionItemLabels.push(extension.displayName ?? "");
      DefaultFoldingRangeProvider.extensionDescriptions.push(extension.description ?? "");
    }
    for (const extension of otherExtensions.sort(sorter)) {
      DefaultFoldingRangeProvider.extensionIds.push(extension.identifier.value);
      DefaultFoldingRangeProvider.extensionItemLabels.push(extension.displayName ?? "");
      DefaultFoldingRangeProvider.extensionDescriptions.push(extension.description ?? "");
    }
  }
  _selectFoldingRangeProvider(providers, document) {
    const value = this._configurationService.getValue(DefaultFoldingRangeProvider.configName, { overrideIdentifier: document.getLanguageId() });
    if (value) {
      return providers.filter((p) => p.id === value);
    }
    return void 0;
  }
};
DefaultFoldingRangeProvider = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IConfigurationService)
], DefaultFoldingRangeProvider);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    [DefaultFoldingRangeProvider.configName]: {
      description: nls.localize("formatter.default", "Defines a default folding range provider that takes precedence over all other folding range providers. Must be the identifier of an extension contributing a folding range provider."),
      type: ["string", "null"],
      default: null,
      enum: DefaultFoldingRangeProvider.extensionIds,
      enumItemLabels: DefaultFoldingRangeProvider.extensionItemLabels,
      markdownEnumDescriptions: DefaultFoldingRangeProvider.extensionDescriptions
    }
  }
});
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  DefaultFoldingRangeProvider,
  LifecyclePhase.Restored
);
//# sourceMappingURL=folding.contribution.js.map
