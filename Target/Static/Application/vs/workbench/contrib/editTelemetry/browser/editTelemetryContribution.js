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
import { autorun, derived } from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { ITelemetryService, telemetryLevelEnabled } from "../../../../platform/telemetry/common/telemetry.js";
import { AnnotatedDocuments } from "./helpers/annotatedDocuments.js";
import { EditTrackingFeature } from "./telemetry/editSourceTrackingFeature.js";
import { VSCodeWorkspace } from "./helpers/vscodeObservableWorkspace.js";
import { AiStatsFeature } from "./editStats/aiStatsFeature.js";
import { EDIT_TELEMETRY_SETTING_ID, AI_STATS_SETTING_ID } from "./settingIds.js";
let EditTelemetryContribution = class EditTelemetryContribution2 extends Disposable {
  static {
    __name(this, "EditTelemetryContribution");
  }
  constructor(_instantiationService, _configurationService, _telemetryService) {
    super();
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    const workspace = derived((reader) => reader.store.add(this._instantiationService.createInstance(VSCodeWorkspace)));
    const annotatedDocuments = derived((reader) => reader.store.add(this._instantiationService.createInstance(AnnotatedDocuments, workspace.read(reader))));
    const editSourceTrackingEnabled = observableConfigValue(EDIT_TELEMETRY_SETTING_ID, true, this._configurationService);
    this._register(autorun((r) => {
      const enabled = editSourceTrackingEnabled.read(r);
      if (!enabled || !telemetryLevelEnabled(
        this._telemetryService,
        3
        /* TelemetryLevel.USAGE */
      )) {
        return;
      }
      r.store.add(this._instantiationService.createInstance(EditTrackingFeature, workspace.read(r), annotatedDocuments.read(r)));
    }));
    const aiStatsEnabled = observableConfigValue(AI_STATS_SETTING_ID, true, this._configurationService);
    this._register(autorun((r) => {
      const enabled = aiStatsEnabled.read(r);
      if (!enabled) {
        return;
      }
      r.store.add(this._instantiationService.createInstance(AiStatsFeature, annotatedDocuments.read(r)));
    }));
  }
};
EditTelemetryContribution = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService),
  __param(2, ITelemetryService)
], EditTelemetryContribution);
export {
  EditTelemetryContribution
};
//# sourceMappingURL=editTelemetryContribution.js.map
