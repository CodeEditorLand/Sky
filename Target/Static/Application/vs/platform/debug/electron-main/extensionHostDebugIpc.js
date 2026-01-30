var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { upgradeToISocket } from "../../../base/parts/ipc/node/ipc.net.js";
import { OPTIONS, parseArgs } from "../../environment/node/argv.js";
import { ExtensionHostDebugBroadcastChannel } from "../common/extensionHostDebugIpc.js";
class ElectronExtensionHostDebugBroadcastChannel extends ExtensionHostDebugBroadcastChannel {
  static {
    __name(this, "ElectronExtensionHostDebugBroadcastChannel");
  }
  constructor(windowsMainService) {
    super();
    this.windowsMainService = windowsMainService;
  }
  call(ctx, command, arg) {
    if (command === "openExtensionDevelopmentHostWindow") {
      return this.openExtensionDevelopmentHostWindow(arg[0], arg[1]);
    } else if (command === "attachToCurrentWindowRenderer") {
      return this.attachToCurrentWindowRenderer(arg[0]);
    } else {
      return super.call(ctx, command, arg);
    }
  }
  async attachToCurrentWindowRenderer(windowId) {
    const codeWindow = this.windowsMainService.getWindowById(windowId);
    if (!codeWindow?.win) {
      return { success: false };
    }
    return this.openCdp(codeWindow.win);
  }
  async openExtensionDevelopmentHostWindow(args, debugRenderer) {
    const pargs = parseArgs(args, OPTIONS);
    pargs.debugRenderer = debugRenderer;
    const extDevPaths = pargs.extensionDevelopmentPath;
    if (!extDevPaths) {
      return { success: false };
    }
    const [codeWindow] = await this.windowsMainService.openExtensionDevelopmentHostWindow(extDevPaths, {
      context: 5,
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
    return this.openCdp(win);
  }
  async openCdpServer(ident, onSocket) {
    const { createServer } = await import("http");
    const server = createServer((req, res) => {
      res.statusCode = 404;
      res.end();
    });
    server.on("upgrade", (req, socket) => {
      if (!req.url?.includes(ident)) {
        socket.end();
        return;
      }
      const upgraded = upgradeToISocket(req, socket, {
        debugLabel: "extension-host-cdp-" + generateUuid(),
        enableMessageSplitting: false
      });
      if (upgraded) {
        onSocket(upgraded);
      }
    });
    return server;
  }
  async openCdp(win) {
    const debug = win.webContents.debugger;
    let listeners = debug.isAttached() ? Infinity : 0;
    const ident = generateUuid();
    const server = await this.openCdpServer(ident, (listener) => {
      if (listeners++ === 0) {
        debug.attach();
      }
      const store = new DisposableStore();
      store.add(listener);
      const writeMessage = /* @__PURE__ */ __name((message) => {
        if (!store.isDisposed) {
          listener.write(VSBuffer.fromString(JSON.stringify(message)));
        }
      }, "writeMessage");
      const onMessage = /* @__PURE__ */ __name((_event, method, params, sessionId) => writeMessage({ method, params, sessionId }), "onMessage");
      const onWindowClose = /* @__PURE__ */ __name(() => {
        listener.end();
        store.dispose();
      }, "onWindowClose");
      win.addListener("close", onWindowClose);
      store.add(toDisposable(() => win.removeListener("close", onWindowClose)));
      debug.addListener("message", onMessage);
      store.add(toDisposable(() => debug.removeListener("message", onMessage)));
      store.add(listener.onData((rawData) => {
        let data;
        try {
          data = JSON.parse(rawData.toString());
        } catch (e) {
          console.error("error reading cdp line", e);
          return;
        }
        debug.sendCommand(data.method, data.params, data.sessionId).then((result) => writeMessage({ id: data.id, sessionId: data.sessionId, result })).catch((error) => writeMessage({ id: data.id, sessionId: data.sessionId, error: { code: 0, message: error.message } }));
      }));
      store.add(listener.onClose(() => {
        if (--listeners === 0) {
          debug.detach();
        }
      }));
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    win.on("close", () => server.close());
    const serverAddr = server.address();
    const serverAddrBase = typeof serverAddr === "string" ? serverAddr : `ws://127.0.0.1:${serverAddr?.port}`;
    return { rendererDebugAddr: `${serverAddrBase}/${ident}`, success: true };
  }
}
export {
  ElectronExtensionHostDebugBroadcastChannel
};
//# sourceMappingURL=extensionHostDebugIpc.js.map
