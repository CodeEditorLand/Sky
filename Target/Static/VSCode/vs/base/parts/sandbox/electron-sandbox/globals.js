import { INodeProcess, IProcessEnvironment } from "../../../common/platform.js";
import { ISandboxConfiguration } from "../common/sandboxTypes.js";
import { IpcRenderer, ProcessMemoryInfo, WebFrame, WebUtils } from "./electronTypes.js";
const vscodeGlobal = globalThis.vscode;
const ipcRenderer = vscodeGlobal.ipcRenderer;
const ipcMessagePort = vscodeGlobal.ipcMessagePort;
const webFrame = vscodeGlobal.webFrame;
const process = vscodeGlobal.process;
const context = vscodeGlobal.context;
const webUtils = vscodeGlobal.webUtils;
export {
  context,
  ipcMessagePort,
  ipcRenderer,
  process,
  webFrame,
  webUtils
};
//# sourceMappingURL=globals.js.map
