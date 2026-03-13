var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LocalFileSearchWorkerHost {
  static {
    __name(this, "LocalFileSearchWorkerHost");
  }
  static {
    this.CHANNEL_NAME = "localFileSearchWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(LocalFileSearchWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(LocalFileSearchWorkerHost.CHANNEL_NAME, obj);
  }
}
export {
  LocalFileSearchWorkerHost
};
//# sourceMappingURL=localFileSearchWorkerTypes.js.map
