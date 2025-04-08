var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { UriComponents } from "../../../../../../base/common/uri.js";
import { IWebWorkerServer, IWebWorkerClient } from "../../../../../../base/common/worker/webWorker.js";
import { StateDeltas } from "./textMateTokenizationWorker.worker.js";
class TextMateWorkerHost {
  static {
    __name(this, "TextMateWorkerHost");
  }
  static CHANNEL_NAME = "textMateWorkerHost";
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
