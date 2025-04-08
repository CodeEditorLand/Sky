var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../common/buffer.js";
import { Event } from "../../../common/event.js";
import { IDisposable } from "../../../common/lifecycle.js";
import { IPCClient } from "../common/ipc.js";
import { Protocol as ElectronProtocol } from "../common/ipc.electron.js";
import { ipcRenderer } from "../../sandbox/electron-sandbox/globals.js";
class Client extends IPCClient {
  static {
    __name(this, "Client");
  }
  protocol;
  static createProtocol() {
    const onMessage = Event.fromNodeEventEmitter(ipcRenderer, "vscode:message", (_, message) => VSBuffer.wrap(message));
    ipcRenderer.send("vscode:hello");
    return new ElectronProtocol(ipcRenderer, onMessage);
  }
  constructor(id) {
    const protocol = Client.createProtocol();
    super(protocol, id);
    this.protocol = protocol;
  }
  dispose() {
    this.protocol.disconnect();
    super.dispose();
  }
}
export {
  Client
};
//# sourceMappingURL=ipc.electron.js.map
