import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ITerminalEnvironment } from "../../terminal/common/terminal.js";
const IExternalTerminalService = createDecorator("externalTerminal");
const DEFAULT_TERMINAL_OSX = "Terminal.app";
export {
  DEFAULT_TERMINAL_OSX,
  IExternalTerminalService
};
//# sourceMappingURL=externalTerminal.js.map
