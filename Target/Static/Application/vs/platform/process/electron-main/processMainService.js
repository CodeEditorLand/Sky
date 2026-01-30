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
import { listProcesses } from "../../../base/node/ps.js";
import { localize } from "../../../nls.js";
import { IDiagnosticsService, isRemoteDiagnosticError } from "../../diagnostics/common/diagnostics.js";
import { IDiagnosticsMainService } from "../../diagnostics/electron-main/diagnosticsMainService.js";
import { ILogService } from "../../log/common/log.js";
import { UtilityProcess } from "../../utilityProcess/electron-main/utilityProcess.js";
let ProcessMainService = class ProcessMainService2 {
  static {
    __name(this, "ProcessMainService");
  }
  constructor(logService, diagnosticsService, diagnosticsMainService) {
    this.logService = logService;
    this.diagnosticsService = diagnosticsService;
    this.diagnosticsMainService = diagnosticsMainService;
  }
  async resolveProcesses() {
    const mainProcessInfo = await this.diagnosticsMainService.getMainDiagnostics();
    const pidToNames = [];
    for (const window of mainProcessInfo.windows) {
      pidToNames.push([window.pid, `window [${window.id}] (${window.title})`]);
    }
    for (const { pid, name } of UtilityProcess.getAll()) {
      pidToNames.push([pid, name]);
    }
    const processes = [];
    try {
      processes.push({ name: localize("local", "Local"), rootProcess: await listProcesses(process.pid) });
      const remoteDiagnostics = await this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true });
      remoteDiagnostics.forEach((data) => {
        if (isRemoteDiagnosticError(data)) {
          processes.push({
            name: data.hostName,
            rootProcess: data
          });
        } else {
          if (data.processes) {
            processes.push({
              name: data.hostName,
              rootProcess: data.processes
            });
          }
        }
      });
    } catch (e) {
      this.logService.error(`Listing processes failed: ${e}`);
    }
    return { pidToNames, processes };
  }
  async getSystemStatus() {
    const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
    return this.diagnosticsService.getDiagnostics(info, remoteData);
  }
  async getSystemInfo() {
    const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
    const msg = await this.diagnosticsService.getSystemInfo(info, remoteData);
    return msg;
  }
  async getPerformanceInfo() {
    try {
      const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
      return await this.diagnosticsService.getPerformanceInfo(info, remoteData);
    } catch (error) {
      this.logService.warn("issueService#getPerformanceInfo ", error.message);
      throw error;
    }
  }
};
ProcessMainService = __decorate([
  __param(0, ILogService),
  __param(1, IDiagnosticsService),
  __param(2, IDiagnosticsMainService)
], ProcessMainService);
export {
  ProcessMainService
};
//# sourceMappingURL=processMainService.js.map
