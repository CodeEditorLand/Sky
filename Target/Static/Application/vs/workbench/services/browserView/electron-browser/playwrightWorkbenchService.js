import { IPlaywrightService } from "../../../../platform/browserView/common/playwrightService.js";
import { registerSharedProcessRemoteService } from "../../../../platform/ipc/electron-browser/services.js";
registerSharedProcessRemoteService(IPlaywrightService, "playwright");
//# sourceMappingURL=playwrightWorkbenchService.js.map
