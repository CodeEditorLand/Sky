var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import minimist from "minimist";
import * as nativeWatchdog from "native-watchdog";
import * as net from "net";
import { ProcessTimeRunOnceScheduler } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { isCancellationError, isSigPipeError, onUnexpectedError } from "../../../base/common/errors.js";
import { Event } from "../../../base/common/event.js";
import * as performance from "../../../base/common/performance.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { realpath } from "../../../base/node/extpath.js";
import { Promises } from "../../../base/node/pfs.js";
import { IMessagePassingProtocol } from "../../../base/parts/ipc/common/ipc.js";
import { BufferedEmitter, PersistentProtocol, ProtocolConstants } from "../../../base/parts/ipc/common/ipc.net.js";
import { NodeSocket, WebSocketNodeSocket } from "../../../base/parts/ipc/node/ipc.net.js";
import { boolean } from "../../../editor/common/config/editorOptions.js";
import product from "../../../platform/product/common/product.js";
import { ExtensionHostMain, IExitFn } from "../common/extensionHostMain.js";
import { IHostUtils } from "../common/extHostExtensionService.js";
import { createURITransformer } from "./uriTransformer.js";
import { ExtHostConnectionType, readExtHostConnection } from "../../services/extensions/common/extensionHostEnv.js";
import { ExtensionHostExitCode, IExtHostReadyMessage, IExtHostReduceGraceTimeMessage, IExtHostSocketMessage, IExtensionHostInitData, MessageType, createMessageOfType, isMessageOfType } from "../../services/extensions/common/extensionHostProtocol.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import "../common/extHost.common.services.js";
import "./extHost.node.services.js";
import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
(/* @__PURE__ */ __name(function removeInspectPort() {
  for (let i = 0; i < process.execArgv.length; i++) {
    if (process.execArgv[i] === "--inspect-port=0") {
      process.execArgv.splice(i, 1);
      i--;
    }
  }
}, "removeInspectPort"))();
const args = minimist(process.argv.slice(2), {
  boolean: [
    "transformURIs",
    "skipWorkspaceStorageLock"
  ],
  string: [
    "useHostProxy"
    // 'true' | 'false' | undefined
  ]
});
(function() {
  const Module = require2("module");
  const originalLoad = Module._load;
  Module._load = function(request) {
    if (request === "natives") {
      throw new Error('Either the extension or an NPM dependency is using the [unsupported "natives" node module](https://go.microsoft.com/fwlink/?linkid=871887).');
    }
    return originalLoad.apply(this, arguments);
  };
})();
const nativeExit = process.exit.bind(process);
const nativeOn = process.on.bind(process);
function patchProcess(allowExit) {
  process.exit = function(code) {
    if (allowExit) {
      nativeExit(code);
    } else {
      const err = new Error("An extension called process.exit() and this was prevented.");
      console.warn(err.stack);
    }
  };
  process.crash = function() {
    const err = new Error("An extension called process.crash() and this was prevented.");
    console.warn(err.stack);
  };
  process.env["ELECTRON_RUN_AS_NODE"] = "1";
  process.on = function(event, listener) {
    if (event === "uncaughtException") {
      const actualListener = listener;
      listener = /* @__PURE__ */ __name(function(...args2) {
        try {
          return actualListener.apply(void 0, args2);
        } catch {
        }
      }, "listener");
    }
    nativeOn(event, listener);
  };
}
__name(patchProcess, "patchProcess");
let onTerminate = /* @__PURE__ */ __name(function(reason) {
  nativeExit();
}, "onTerminate");
function _createExtHostProtocol() {
  const extHostConnection = readExtHostConnection(process.env);
  if (extHostConnection.type === ExtHostConnectionType.MessagePort) {
    return new Promise((resolve, reject) => {
      const withPorts = /* @__PURE__ */ __name((ports) => {
        const port = ports[0];
        const onMessage = new BufferedEmitter();
        port.on("message", (e) => onMessage.fire(VSBuffer.wrap(e.data)));
        port.on("close", () => {
          onTerminate("renderer closed the MessagePort");
        });
        port.start();
        resolve({
          onMessage: onMessage.event,
          send: /* @__PURE__ */ __name((message) => port.postMessage(message.buffer), "send")
        });
      }, "withPorts");
      process.parentPort.on("message", (e) => withPorts(e.ports));
    });
  } else if (extHostConnection.type === ExtHostConnectionType.Socket) {
    return new Promise((resolve, reject) => {
      let protocol = null;
      const timer = setTimeout(() => {
        onTerminate("VSCODE_EXTHOST_IPC_SOCKET timeout");
      }, 6e4);
      const reconnectionGraceTime = ProtocolConstants.ReconnectionGraceTime;
      const reconnectionShortGraceTime = ProtocolConstants.ReconnectionShortGraceTime;
      const disconnectRunner1 = new ProcessTimeRunOnceScheduler(() => onTerminate("renderer disconnected for too long (1)"), reconnectionGraceTime);
      const disconnectRunner2 = new ProcessTimeRunOnceScheduler(() => onTerminate("renderer disconnected for too long (2)"), reconnectionShortGraceTime);
      process.on("message", (msg, handle) => {
        if (msg && msg.type === "VSCODE_EXTHOST_IPC_SOCKET") {
          handle.setNoDelay(true);
          const initialDataChunk = VSBuffer.wrap(Buffer.from(msg.initialDataChunk, "base64"));
          let socket;
          if (msg.skipWebSocketFrames) {
            socket = new NodeSocket(handle, "extHost-socket");
          } else {
            const inflateBytes = VSBuffer.wrap(Buffer.from(msg.inflateBytes, "base64"));
            socket = new WebSocketNodeSocket(new NodeSocket(handle, "extHost-socket"), msg.permessageDeflate, inflateBytes, false);
          }
          if (protocol) {
            disconnectRunner1.cancel();
            disconnectRunner2.cancel();
            protocol.beginAcceptReconnection(socket, initialDataChunk);
            protocol.endAcceptReconnection();
            protocol.sendResume();
          } else {
            clearTimeout(timer);
            protocol = new PersistentProtocol({ socket, initialChunk: initialDataChunk });
            protocol.sendResume();
            protocol.onDidDispose(() => onTerminate("renderer disconnected"));
            resolve(protocol);
            protocol.onSocketClose(() => {
              disconnectRunner1.schedule();
            });
          }
        }
        if (msg && msg.type === "VSCODE_EXTHOST_IPC_REDUCE_GRACE_TIME") {
          if (disconnectRunner2.isScheduled()) {
            return;
          }
          if (disconnectRunner1.isScheduled()) {
            disconnectRunner2.schedule();
          }
        }
      });
      const req = { type: "VSCODE_EXTHOST_IPC_READY" };
      process.send?.(req);
    });
  } else {
    const pipeName = extHostConnection.pipeName;
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(pipeName, () => {
        socket.removeListener("error", reject);
        const protocol = new PersistentProtocol({ socket: new NodeSocket(socket, "extHost-renderer") });
        protocol.sendResume();
        resolve(protocol);
      });
      socket.once("error", reject);
      socket.on("close", () => {
        onTerminate("renderer closed the socket");
      });
    });
  }
}
__name(_createExtHostProtocol, "_createExtHostProtocol");
async function createExtHostProtocol() {
  const protocol = await _createExtHostProtocol();
  return new class {
    _onMessage = new BufferedEmitter();
    onMessage = this._onMessage.event;
    _terminating;
    _protocolListener;
    constructor() {
      this._terminating = false;
      this._protocolListener = protocol.onMessage((msg) => {
        if (isMessageOfType(msg, MessageType.Terminate)) {
          this._terminating = true;
          this._protocolListener.dispose();
          onTerminate("received terminate message from renderer");
        } else {
          this._onMessage.fire(msg);
        }
      });
    }
    send(msg) {
      if (!this._terminating) {
        protocol.send(msg);
      }
    }
    async drain() {
      if (protocol.drain) {
        return protocol.drain();
      }
    }
  }();
}
__name(createExtHostProtocol, "createExtHostProtocol");
function connectToRenderer(protocol) {
  return new Promise((c) => {
    const first = protocol.onMessage((raw) => {
      first.dispose();
      const initData = JSON.parse(raw.toString());
      const rendererCommit = initData.commit;
      const myCommit = product.commit;
      if (rendererCommit && myCommit) {
        if (rendererCommit !== myCommit) {
          nativeExit(ExtensionHostExitCode.VersionMismatch);
        }
      }
      if (initData.parentPid) {
        let epermErrors = 0;
        setInterval(function() {
          try {
            process.kill(initData.parentPid, 0);
            epermErrors = 0;
          } catch (e) {
            if (e && e.code === "EPERM") {
              epermErrors++;
              if (epermErrors >= 3) {
                onTerminate(`parent process ${initData.parentPid} does not exist anymore (3 x EPERM): ${e.message} (code: ${e.code}) (errno: ${e.errno})`);
              }
            } else {
              onTerminate(`parent process ${initData.parentPid} does not exist anymore: ${e.message} (code: ${e.code}) (errno: ${e.errno})`);
            }
          }
        }, 1e3);
        let watchdog;
        try {
          watchdog = require2("native-watchdog");
          watchdog.start(initData.parentPid);
        } catch (err) {
          onUnexpectedError(err);
        }
      }
      protocol.send(createMessageOfType(MessageType.Initialized));
      c({ protocol, initData });
    });
    protocol.send(createMessageOfType(MessageType.Ready));
  });
}
__name(connectToRenderer, "connectToRenderer");
async function startExtensionHostProcess() {
  const unhandledPromises = [];
  process.on("unhandledRejection", (reason, promise) => {
    unhandledPromises.push(promise);
    setTimeout(() => {
      const idx = unhandledPromises.indexOf(promise);
      if (idx >= 0) {
        promise.catch((e) => {
          unhandledPromises.splice(idx, 1);
          if (!isCancellationError(e)) {
            console.warn(`rejected promise not handled within 1 second: ${e}`);
            if (e && e.stack) {
              console.warn(`stack trace: ${e.stack}`);
            }
            if (reason) {
              onUnexpectedError(reason);
            }
          }
        });
      }
    }, 1e3);
  });
  process.on("rejectionHandled", (promise) => {
    const idx = unhandledPromises.indexOf(promise);
    if (idx >= 0) {
      unhandledPromises.splice(idx, 1);
    }
  });
  process.on("uncaughtException", function(err) {
    if (!isSigPipeError(err)) {
      onUnexpectedError(err);
    }
  });
  performance.mark(`code/extHost/willConnectToRenderer`);
  const protocol = await createExtHostProtocol();
  performance.mark(`code/extHost/didConnectToRenderer`);
  const renderer = await connectToRenderer(protocol);
  performance.mark(`code/extHost/didWaitForInitData`);
  const { initData } = renderer;
  patchProcess(!!initData.environment.extensionTestsLocationURI);
  initData.environment.useHostProxy = args.useHostProxy !== void 0 ? args.useHostProxy !== "false" : void 0;
  initData.environment.skipWorkspaceStorageLock = boolean(args.skipWorkspaceStorageLock, false);
  const hostUtils = new class NodeHost {
    static {
      __name(this, "NodeHost");
    }
    pid = process.pid;
    exit(code) {
      nativeExit(code);
    }
    fsExists(path) {
      return Promises.exists(path);
    }
    fsRealpath(path) {
      return realpath(path);
    }
  }();
  let uriTransformer = null;
  if (initData.remote.authority && args.transformURIs) {
    uriTransformer = createURITransformer(initData.remote.authority);
  }
  const extensionHostMain = new ExtensionHostMain(
    renderer.protocol,
    initData,
    hostUtils,
    uriTransformer
  );
  onTerminate = /* @__PURE__ */ __name((reason) => extensionHostMain.terminate(reason), "onTerminate");
}
__name(startExtensionHostProcess, "startExtensionHostProcess");
startExtensionHostProcess().catch((err) => console.log(err));
//# sourceMappingURL=extensionHostProcess.js.map
