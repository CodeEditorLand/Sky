var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IWebWorkerClient, IWebWorkerServer } from "../../../../base/common/worker/webWorker.js";
class LanguageDetectionWorkerHost {
  static {
    __name(this, "LanguageDetectionWorkerHost");
  }
  static CHANNEL_NAME = "languageDetectionWorkerHost";
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
