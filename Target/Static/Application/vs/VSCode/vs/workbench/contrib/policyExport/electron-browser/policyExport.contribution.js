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
var PolicyExportContribution_1;
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { URI } from "../../../../base/common/uri.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { PolicyCategory, PolicyCategoryData } from "../../../../base/common/policy.js";
import { join } from "../../../../base/common/path.js";
let PolicyExportContribution = class PolicyExportContribution2 extends Disposable {
  static {
    __name(this, "PolicyExportContribution");
  }
  static {
    PolicyExportContribution_1 = this;
  }
  static {
    this.ID = "workbench.contrib.policyExport";
  }
  static {
    this.DEFAULT_POLICY_EXPORT_PATH = "build/lib/policies/policyData.jsonc";
  }
  constructor(nativeEnvironmentService, extensionService, fileService, configurationService, nativeHostService, progressService, logService) {
    super();
    this.nativeEnvironmentService = nativeEnvironmentService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.nativeHostService = nativeHostService;
    this.progressService = progressService;
    this.logService = logService;
    if (this.nativeEnvironmentService.isBuilt) {
      return;
    }
    const policyDataPath = this.nativeEnvironmentService.exportPolicyData;
    if (policyDataPath !== void 0) {
      const defaultPath = join(this.nativeEnvironmentService.appRoot, PolicyExportContribution_1.DEFAULT_POLICY_EXPORT_PATH);
      void this.exportPolicyDataAndQuit(policyDataPath ? policyDataPath : defaultPath);
    }
  }
  log(msg, ...args) {
    this.logService.info(`[${PolicyExportContribution_1.ID}]`, msg, ...args);
  }
  async exportPolicyDataAndQuit(policyDataPath) {
    try {
      await this.progressService.withProgress({
        location: 15,
        title: `Exporting policy data to ${policyDataPath}`
      }, async (_progress) => {
        this.log("Export started. Waiting for configurations to load.");
        await this.extensionService.whenInstalledExtensionsRegistered();
        await this.configurationService.whenRemoteConfigurationLoaded();
        this.log("Extensions and configuration loaded.");
        const configurationRegistry = Registry.as(Extensions.Configuration);
        const configurationProperties = {
          ...configurationRegistry.getExcludedConfigurationProperties(),
          ...configurationRegistry.getConfigurationProperties()
        };
        const policyData = {
          categories: Object.values(PolicyCategory).map((category) => ({
            key: category,
            name: PolicyCategoryData[category].name
          })),
          policies: []
        };
        for (const [key, schema] of Object.entries(configurationProperties)) {
          if (schema.policy?.localization) {
            policyData.policies.push({
              key,
              name: schema.policy.name,
              category: schema.policy.category,
              minimumVersion: schema.policy.minimumVersion,
              localization: {
                description: schema.policy.localization.description,
                enumDescriptions: schema.policy.localization.enumDescriptions
              },
              type: schema.type,
              default: schema.default,
              enum: schema.enum
            });
          }
        }
        this.log(`Discovered ${policyData.policies.length} policies to export.`);
        const disclaimerComment = `/** THIS FILE IS AUTOMATICALLY GENERATED USING \`code --export-policy-data\`. DO NOT MODIFY IT MANUALLY. **/`;
        const policyDataFileContent = `${disclaimerComment}
${JSON.stringify(policyData, null, 4)}
`;
        await this.fileService.writeFile(URI.file(policyDataPath), VSBuffer.fromString(policyDataFileContent));
        this.log(`Successfully exported ${policyData.policies.length} policies to ${policyDataPath}.`);
      });
      await this.nativeHostService.exit(0);
    } catch (error) {
      this.log("Failed to export policy", error);
      await this.nativeHostService.exit(1);
    }
  }
};
PolicyExportContribution = PolicyExportContribution_1 = __decorate([
  __param(0, INativeEnvironmentService),
  __param(1, IExtensionService),
  __param(2, IFileService),
  __param(3, IWorkbenchConfigurationService),
  __param(4, INativeHostService),
  __param(5, IProgressService),
  __param(6, ILogService)
], PolicyExportContribution);
registerWorkbenchContribution2(
  PolicyExportContribution.ID,
  PolicyExportContribution,
  4
  /* WorkbenchPhase.Eventually */
);
export {
  PolicyExportContribution
};
//# sourceMappingURL=policyExport.contribution.js.map
