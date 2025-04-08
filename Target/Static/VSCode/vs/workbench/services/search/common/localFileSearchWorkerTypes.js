var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { UriComponents } from "../../../../base/common/uri.js";
import { IWebWorkerClient, IWebWorkerServer } from "../../../../base/common/worker/webWorker.js";
import { IFileMatch, IFileQueryProps, IFolderQuery, ITextQueryProps } from "./search.js";
class LocalFileSearchWorkerHost {
  static {
    __name(this, "LocalFileSearchWorkerHost");
  }
  static CHANNEL_NAME = "localFileSearchWorkerHost";
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
