var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStringDictionary } from "../../../base/common/collections.js";
import { ProcessItem } from "../../../base/common/processes.js";
import { UriComponents } from "../../../base/common/uri.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IWorkspace } from "../../workspace/common/workspace.js";
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
  _serviceBrand;
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
