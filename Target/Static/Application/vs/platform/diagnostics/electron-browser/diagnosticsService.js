import { IDiagnosticsService } from "../common/diagnostics.js";
import { registerSharedProcessRemoteService } from "../../ipc/electron-browser/services.js";
registerSharedProcessRemoteService(IDiagnosticsService, "diagnostics");
//# sourceMappingURL=diagnosticsService.js.map
