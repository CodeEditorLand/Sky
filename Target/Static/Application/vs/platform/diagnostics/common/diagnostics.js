var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
const ID = "diagnosticsService";
const IDiagnosticsService = createDecorator(ID);
function isRemoteDiagnosticError(x) {
  return !!x.hostName && !!x.errorMessage;
}
__name(isRemoteDiagnosticError, "isRemoteDiagnosticError");
class NullDiagnosticsService {
  static {
    __name(this, "NullDiagnosticsService");
  }
  async getPerformanceInfo(mainProcessInfo, remoteInfo) {
    return {};
  }
  async getSystemInfo(mainProcessInfo, remoteInfo) {
    return {
      processArgs: "nullProcessArgs",
      gpuStatus: "nullGpuStatus",
      screenReader: "nullScreenReader",
      remoteData: [],
      os: "nullOs",
      memory: "nullMemory",
      vmHint: "nullVmHint"
    };
  }
  async getDiagnostics(mainProcessInfo, remoteInfo) {
    return "";
  }
  async getWorkspaceFileExtensions(workspace) {
    return { extensions: [] };
  }
  async reportWorkspaceStats(workspace) {
  }
}
export {
  ID,
  IDiagnosticsService,
  NullDiagnosticsService,
  isRemoteDiagnosticError
};
//# sourceMappingURL=diagnostics.js.map
