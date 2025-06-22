var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../common/buffer.js";
import { Event } from "../../../common/event.js";
import { IPCClient } from "./ipc.js";
class Protocol {
  static {
    __name(this, "Protocol");
  }
  constructor(port) {
    this.port = port;
    this.onMessage = Event.fromDOMEventEmitter(this.port, "message", (e) => {
      if (e.data) {
        return VSBuffer.wrap(e.data);
      }
      return VSBuffer.alloc(0);
    });
    port.start();
  }
  send(message) {
    this.port.postMessage(message.buffer);
  }
  disconnect() {
    this.port.close();
  }
}
class Client extends IPCClient {
  static {
    __name(this, "Client");
  }
  constructor(port, clientId) {
    const protocol = new Protocol(port);
    super(protocol, clientId);
    this.protocol = protocol;
  }
  dispose() {
    this.protocol.disconnect();
    super.dispose();
  }
}
export {
  Client,
  Protocol
};
//# sourceMappingURL=ipc.mp.js.map
