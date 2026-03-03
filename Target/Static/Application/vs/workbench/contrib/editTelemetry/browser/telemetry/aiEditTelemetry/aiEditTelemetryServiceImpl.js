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
import { EditSuggestionId } from "../../../../../../editor/common/textModelEditSource.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { TelemetryTrustedValue } from "../../../../../../platform/telemetry/common/telemetryUtils.js";
import { DataChannelForwardingTelemetryService, forwardToChannelIf, isCopilotLikeExtension } from "../../../../../../platform/dataChannel/browser/forwardingTelemetryService.js";
import { IRandomService } from "../../randomService.js";
let AiEditTelemetryServiceImpl = class AiEditTelemetryServiceImpl2 {
  static {
    __name(this, "AiEditTelemetryServiceImpl");
  }
  constructor(instantiationService, _randomService) {
    this.instantiationService = instantiationService;
    this._randomService = _randomService;
    this._telemetryService = this.instantiationService.createInstance(DataChannelForwardingTelemetryService);
  }
  createSuggestionId(data) {
    const suggestionId = EditSuggestionId.newId((ns) => this._randomService.generatePrefixedUuid(ns));
    this._telemetryService.publicLog2("editTelemetry.codeSuggested", {
      eventId: this._randomService.generatePrefixedUuid("evt"),
      suggestionId,
      presentation: data.presentation,
      feature: data.feature,
      sourceExtensionId: data.source?.extensionId,
      sourceExtensionVersion: data.source?.extensionVersion,
      sourceProviderId: data.source?.providerId,
      languageId: data.languageId,
      editCharsInserted: data.editDeltaInfo?.charsAdded,
      editCharsDeleted: data.editDeltaInfo?.charsRemoved,
      editLinesInserted: data.editDeltaInfo?.linesAdded,
      editLinesDeleted: data.editDeltaInfo?.linesRemoved,
      modeId: data.modeId,
      modelId: new TelemetryTrustedValue(data.modelId),
      applyCodeBlockSuggestionId: data.applyCodeBlockSuggestionId,
      ...forwardToChannelIf(isCopilotLikeExtension(data.source?.extensionId))
    });
    return suggestionId;
  }
  handleCodeAccepted(data) {
    this._telemetryService.publicLog2("editTelemetry.codeAccepted", {
      eventId: this._randomService.generatePrefixedUuid("evt"),
      suggestionId: data.suggestionId,
      presentation: data.presentation,
      feature: data.feature,
      sourceExtensionId: data.source?.extensionId,
      sourceExtensionVersion: data.source?.extensionVersion,
      sourceProviderId: data.source?.providerId,
      languageId: data.languageId,
      editCharsInserted: data.editDeltaInfo?.charsAdded,
      editCharsDeleted: data.editDeltaInfo?.charsRemoved,
      editLinesInserted: data.editDeltaInfo?.linesAdded,
      editLinesDeleted: data.editDeltaInfo?.linesRemoved,
      modeId: data.modeId,
      modelId: new TelemetryTrustedValue(data.modelId),
      applyCodeBlockSuggestionId: data.applyCodeBlockSuggestionId,
      acceptanceMethod: data.acceptanceMethod,
      ...forwardToChannelIf(isCopilotLikeExtension(data.source?.extensionId))
    });
  }
};
AiEditTelemetryServiceImpl = __decorate([
  __param(0, IInstantiationService),
  __param(1, IRandomService)
], AiEditTelemetryServiceImpl);
export {
  AiEditTelemetryServiceImpl
};
//# sourceMappingURL=aiEditTelemetryServiceImpl.js.map
