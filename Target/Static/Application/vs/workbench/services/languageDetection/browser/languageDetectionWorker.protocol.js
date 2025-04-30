var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LanguageDetectionWorkerHost {
  static {
    __name(this, "LanguageDetectionWorkerHost");
  }
  static {
    this.CHANNEL_NAME = "languageDetectionWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(LanguageDetectionWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(LanguageDetectionWorkerHost.CHANNEL_NAME, obj);
  }
}
export {
  LanguageDetectionWorkerHost
};
//# sourceMappingURL=languageDetectionWorker.protocol.js.map
