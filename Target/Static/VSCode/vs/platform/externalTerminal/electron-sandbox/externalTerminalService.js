import { IExternalTerminalService as ICommonExternalTerminalService } from "../common/externalTerminal.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { registerMainProcessRemoteService } from "../../ipc/electron-sandbox/services.js";
const IExternalTerminalService = createDecorator("externalTerminal");
registerMainProcessRemoteService(IExternalTerminalService, "externalTerminal");
export {
  IExternalTerminalService
};
//# sourceMappingURL=externalTerminalService.js.map
