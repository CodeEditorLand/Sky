var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AddressInfo, createServer } from "net";
import { IOpenExtensionWindowResult } from "../common/extensionHostDebug.js";
import { ExtensionHostDebugBroadcastChannel } from "../common/extensionHostDebugIpc.js";
import { OPTIONS, parseArgs } from "../../environment/node/argv.js";
import { IWindowsMainService, OpenContext } from "../../windows/electron-main/windows.js";
class ElectronExtensionHostDebugBroadcastChannel extends ExtensionHostDebugBroadcastChannel {
  constructor(windowsMainService) {
    super();
    this.windowsMainService = windowsMainService;
  }
  static {
    __name(this, "ElectronExtensionHostDebugBroadcastChannel");
  }
  call(ctx, command, arg) {
    if (command === "openExtensionDevelopmentHostWindow") {
      return this.openExtensionDevelopmentHostWindow(arg[0], arg[1]);
    } else {
      return super.call(ctx, command, arg);
    }
  }
  async openExtensionDevelopmentHostWindow(args, debugRenderer) {
    const pargs = parseArgs(args, OPTIONS);
    pargs.debugRenderer = debugRenderer;
    const extDevPaths = pargs.extensionDevelopmentPath;
    if (!extDevPaths) {
      return { success: false };
    }
    const [codeWindow] = await this.windowsMainService.openExtensionDevelopmentHostWindow(extDevPaths, {
      context: OpenContext.API,
      cli: pargs,
      forceProfile: pargs.profile,
      forceTempProfile: pargs["profile-temp"]
    });
    if (!debugRenderer) {
      return { success: true };
    }
    const win = codeWindow.win;
    if (!win) {
      return { success: true };
    }
    const debug = win.webContents.debugger;
    let listeners = debug.isAttached() ? Infinity : 0;
    const server = createServer((listener) => {
      if (listeners++ === 0) {
        debug.attach();
      }
      let closed = false;
      const writeMessage = /* @__PURE__ */ __name((message) => {
        if (!closed) {
          listener.write(JSON.stringify(message) + "\0");
        }
      }, "writeMessage");
      const onMessage = /* @__PURE__ */ __name((_event, method, params, sessionId) => writeMessage({ method, params, sessionId }), "onMessage");
      win.on("close", () => {
        debug.removeListener("message", onMessage);
        listener.end();
        closed = true;
      });
      debug.addListener("message", onMessage);
      let buf = Buffer.alloc(0);
      listener.on("data", (data) => {
        buf = Buffer.concat([buf, data]);
        for (let delimiter = buf.indexOf(0); delimiter !== -1; delimiter = buf.indexOf(0)) {
          let data2;
          try {
            const contents = buf.slice(0, delimiter).toString("utf8");
            buf = buf.slice(delimiter + 1);
            data2 = JSON.parse(contents);
          } catch (e) {
            console.error("error reading cdp line", e);
          }
          debug.sendCommand(data2.method, data2.params, data2.sessionId).then((result) => writeMessage({ id: data2.id, sessionId: data2.sessionId, result })).catch((error) => writeMessage({ id: data2.id, sessionId: data2.sessionId, error: { code: 0, message: error.message } }));
        }
      });
      listener.on("error", (err) => {
        console.error("error on cdp pipe:", err);
      });
      listener.on("close", () => {
        closed = true;
        if (--listeners === 0) {
          debug.detach();
        }
      });
    });
    await new Promise((r) => server.listen(0, r));
    win.on("close", () => server.close());
    return { rendererDebugPort: server.address().port, success: true };
  }
}
export {
  ElectronExtensionHostDebugBroadcastChannel
};
//# sourceMappingURL=extensionHostDebugIpc.js.map
