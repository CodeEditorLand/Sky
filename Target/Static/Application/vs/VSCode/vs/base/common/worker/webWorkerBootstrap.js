var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { WebWorkerServer } from "./webWorker.js";
let initialized = false;
function initialize(factory) {
  if (initialized) {
    throw new Error("WebWorker already initialized!");
  }
  initialized = true;
  const webWorkerServer = new WebWorkerServer((msg) => globalThis.postMessage(msg), (workerServer) => factory(workerServer));
  globalThis.onmessage = (e) => {
    webWorkerServer.onmessage(e.data);
  };
  return webWorkerServer;
}
__name(initialize, "initialize");
function bootstrapWebWorker(factory) {
  globalThis.onmessage = (_e) => {
    if (!initialized) {
      initialize(factory);
    }
  };
}
__name(bootstrapWebWorker, "bootstrapWebWorker");
export {
  bootstrapWebWorker,
  initialize
};
//# sourceMappingURL=webWorkerBootstrap.js.map
