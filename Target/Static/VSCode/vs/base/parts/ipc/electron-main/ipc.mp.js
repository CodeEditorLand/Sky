var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BrowserWindow, IpcMainEvent, MessagePortMain } from "electron";
import { validatedIpcMain } from "./ipcMain.js";
import { Event } from "../../../common/event.js";
import { IDisposable } from "../../../common/lifecycle.js";
import { generateUuid } from "../../../common/uuid.js";
import { Client as MessagePortClient } from "../common/ipc.mp.js";
class Client extends MessagePortClient {
  static {
    __name(this, "Client");
  }
  /**
   * @param clientId a way to uniquely identify this client among
   * other clients. this is important for routing because every
   * client can also be a server
   */
  constructor(port, clientId) {
    super({
      addEventListener: /* @__PURE__ */ __name((type, listener) => port.addListener(type, listener), "addEventListener"),
      removeEventListener: /* @__PURE__ */ __name((type, listener) => port.removeListener(type, listener), "removeEventListener"),
      postMessage: /* @__PURE__ */ __name((message) => port.postMessage(message), "postMessage"),
      start: /* @__PURE__ */ __name(() => port.start(), "start"),
      close: /* @__PURE__ */ __name(() => port.close(), "close")
    }, clientId);
  }
}
async function connect(window) {
  if (window.isDestroyed() || window.webContents.isDestroyed()) {
    throw new Error("ipc.mp#connect: Cannot talk to window because it is closed or destroyed");
  }
  const nonce = generateUuid();
  window.webContents.send("vscode:createMessageChannel", nonce);
  const onMessageChannelResult = Event.fromNodeEventEmitter(validatedIpcMain, "vscode:createMessageChannelResult", (e, nonce2) => ({ nonce: nonce2, port: e.ports[0] }));
  const { port } = await Event.toPromise(Event.once(Event.filter(onMessageChannelResult, (e) => e.nonce === nonce)));
  return port;
}
__name(connect, "connect");
export {
  Client,
  connect
};
//# sourceMappingURL=ipc.mp.js.map
