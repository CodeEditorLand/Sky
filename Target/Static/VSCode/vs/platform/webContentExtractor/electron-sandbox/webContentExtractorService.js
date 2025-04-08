import { registerMainProcessRemoteService, registerSharedProcessRemoteService } from "../../ipc/electron-sandbox/services.js";
import { ISharedWebContentExtractorService, IWebContentExtractorService } from "../common/webContentExtractor.js";
registerMainProcessRemoteService(IWebContentExtractorService, "webContentExtractor");
registerSharedProcessRemoteService(ISharedWebContentExtractorService, "sharedWebContentExtractor");
//# sourceMappingURL=webContentExtractorService.js.map
