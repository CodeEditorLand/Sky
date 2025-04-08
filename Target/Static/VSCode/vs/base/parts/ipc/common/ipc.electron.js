var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../common/buffer.js";
import { Event } from "../../../common/event.js";
import { IMessagePassingProtocol } from "./ipc.js";
class Protocol {
  constructor(sender, onMessage) {
    this.sender = sender;
    this.onMessage = onMessage;
  }
  static {
    __name(this, "Protocol");
  }
  send(message) {
    try {
      this.sender.send("vscode:message", message.buffer);
    } catch (e) {
    }
  }
  disconnect() {
    this.sender.send("vscode:disconnect", null);
  }
}
export {
  Protocol
};
//# sourceMappingURL=ipc.electron.js.map
