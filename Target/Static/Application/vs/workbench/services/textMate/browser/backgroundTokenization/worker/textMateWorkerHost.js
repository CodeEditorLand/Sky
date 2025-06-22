var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TextMateWorkerHost {
  static {
    __name(this, "TextMateWorkerHost");
  }
  static {
    this.CHANNEL_NAME = "textMateWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(TextMateWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(TextMateWorkerHost.CHANNEL_NAME, obj);
  }
}
export {
  TextMateWorkerHost
};
//# sourceMappingURL=textMateWorkerHost.js.map
