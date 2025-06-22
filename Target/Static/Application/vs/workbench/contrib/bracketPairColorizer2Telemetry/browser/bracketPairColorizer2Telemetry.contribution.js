var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
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
let BracketPairColorizer2TelemetryContribution = class BracketPairColorizer2TelemetryContribution2 {
  static {
    __name(this, "BracketPairColorizer2TelemetryContribution");
  }
  constructor(configurationService, extensionsWorkbenchService, telemetryService) {
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.telemetryService = telemetryService;
    this.init().catch(onUnexpectedError);
  }
  async init() {
    const bracketPairColorizerId = "coenraads.bracket-pair-colorizer-2";
    await this.extensionsWorkbenchService.queryLocal();
    const extension = this.extensionsWorkbenchService.installed.find((e) => e.identifier.id === bracketPairColorizerId);
    if (!extension || extension.enablementState !== 11 && extension.enablementState !== 12) {
      return;
    }
    const nativeBracketPairColorizationEnabledKey = "editor.bracketPairColorization.enabled";
    const nativeColorizationEnabled = !!this.configurationService.getValue(nativeBracketPairColorizationEnabledKey);
    this.telemetryService.publicLog2("bracketPairColorizerTwoUsage", {
      nativeColorizationEnabled
    });
  }
};
BracketPairColorizer2TelemetryContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, IExtensionsWorkbenchService),
  __param(2, ITelemetryService)
], BracketPairColorizer2TelemetryContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  BracketPairColorizer2TelemetryContribution,
  3
  /* LifecyclePhase.Restored */
);
//# sourceMappingURL=bracketPairColorizer2Telemetry.contribution.js.map
