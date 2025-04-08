var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IWebWorkerServer, IWebWorkerClient } from "../../../base/common/worker/webWorker.js";
class EditorWorkerHost {
  static {
    __name(this, "EditorWorkerHost");
  }
  static CHANNEL_NAME = "editorWorkerHost";
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
