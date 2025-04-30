var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class EditorWorkerHost {
  static {
    __name(this, "EditorWorkerHost");
  }
  static {
    this.CHANNEL_NAME = "editorWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(EditorWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(EditorWorkerHost.CHANNEL_NAME, obj);
  }
}
export {
  EditorWorkerHost
};
//# sourceMappingURL=editorWorkerHost.js.map
