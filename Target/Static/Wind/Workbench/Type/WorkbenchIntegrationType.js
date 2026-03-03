var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var WorkbenchState = /* @__PURE__ */ ((WorkbenchState2) => {
  WorkbenchState2["NotInitialized"] = "NotInitialized";
  WorkbenchState2["WaitingForReady"] = "WaitingForReady";
  WorkbenchState2["ReadyForProviderRegistration"] = "ReadyForProviderRegistration";
  WorkbenchState2["DefaultProvidersUnregistered"] = "DefaultProvidersUnregistered";
  WorkbenchState2["MountainProviderRegistered"] = "MountainProviderRegistered";
  WorkbenchState2["WorkspaceConfigured"] = "WorkspaceConfigured";
  WorkbenchState2["IntegrationComplete"] = "IntegrationComplete";
  WorkbenchState2["Failed"] = "Failed";
  return WorkbenchState2;
})(WorkbenchState || {});
class WorkbenchIntegrationError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "WorkbenchIntegrationError";
  }
  static {
    __name(this, "WorkbenchIntegrationError");
  }
}
var WorkbenchIntegrationErrorCode = /* @__PURE__ */ ((WorkbenchIntegrationErrorCode2) => {
  WorkbenchIntegrationErrorCode2["InitTimeout"] = "InitTimeout";
  WorkbenchIntegrationErrorCode2["ServiceUnavailable"] = "ServiceUnavailable";
  WorkbenchIntegrationErrorCode2["ProviderUnregisterFailed"] = "ProviderUnregisterFailed";
  WorkbenchIntegrationErrorCode2["ProviderRegistrationFailed"] = "ProviderRegistrationFailed";
  WorkbenchIntegrationErrorCode2["WorkspaceConfigFailed"] = "WorkspaceConfigFailed";
  WorkbenchIntegrationErrorCode2["FileSystemProviderUnavailable"] = "FileSystemProviderUnavailable";
  WorkbenchIntegrationErrorCode2["InvalidWorkspaceConfig"] = "InvalidWorkspaceConfig";
  WorkbenchIntegrationErrorCode2["Unknown"] = "Unknown";
  return WorkbenchIntegrationErrorCode2;
})(WorkbenchIntegrationErrorCode || {});
export {
  WorkbenchIntegrationError,
  WorkbenchIntegrationErrorCode,
  WorkbenchState
};
//# sourceMappingURL=WorkbenchIntegrationType.js.map
