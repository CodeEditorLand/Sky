var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Protocol {
  static {
    __name(this, "Protocol");
  }
  constructor(sender, onMessage) {
    this.sender = sender;
    this.onMessage = onMessage;
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
