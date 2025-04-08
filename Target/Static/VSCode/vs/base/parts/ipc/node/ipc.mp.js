var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MessagePortMain, isUtilityProcess, MessageEvent } from "../../sandbox/node/electronTypes.js";
import { VSBuffer } from "../../../common/buffer.js";
import { ClientConnectionEvent, IMessagePassingProtocol, IPCServer } from "../common/ipc.js";
import { Emitter, Event } from "../../../common/event.js";
import { assertType } from "../../../common/types.js";
class Protocol {
  constructor(port) {
    this.port = port;
    this.onMessage = Event.fromNodeEventEmitter(this.port, "message", (e) => {
      if (e.data) {
        return VSBuffer.wrap(e.data);
      }
      return VSBuffer.alloc(0);
    });
    port.start();
  }
  static {
    __name(this, "Protocol");
  }
  onMessage;
  send(message) {
    this.port.postMessage(message.buffer);
  }
  disconnect() {
    this.port.close();
  }
}
class Server extends IPCServer {
  static {
    __name(this, "Server");
  }
  static getOnDidClientConnect(filter) {
    assertType(isUtilityProcess(process), "Electron Utility Process");
    const onCreateMessageChannel = new Emitter();
    process.parentPort.on("message", (e) => {
      if (filter?.handledClientConnection(e)) {
        return;
      }
      const port = e.ports.at(0);
      if (port) {
        onCreateMessageChannel.fire(port);
      }
    });
    return Event.map(onCreateMessageChannel.event, (port) => {
      const protocol = new Protocol(port);
      const result = {
        protocol,
        // Not part of the standard spec, but in Electron we get a `close` event
        // when the other side closes. We can use this to detect disconnects
        // (https://github.com/electron/electron/blob/11-x-y/docs/api/message-port-main.md#event-close)
        onDidClientDisconnect: Event.fromNodeEventEmitter(port, "close")
      };
      return result;
    });
  }
  constructor(filter) {
    super(Server.getOnDidClientConnect(filter));
  }
}
function once(port, message, callback) {
  const listener = /* @__PURE__ */ __name((e) => {
    if (e.data === message) {
      port.removeListener("message", listener);
      callback();
    }
  }, "listener");
  port.on("message", listener);
}
__name(once, "once");
export {
  Server,
  once
};
//# sourceMappingURL=ipc.mp.js.map
