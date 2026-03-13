var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { initialize } from "../base/common/worker/webWorkerBootstrap.js";
import { EditorWorker } from "./common/services/editorWebWorker.js";
import { EditorWorkerHost } from "./common/services/editorWorkerHost.js";
function start(createClient) {
  let client;
  const webWorkerServer = initialize((workerServer) => {
    const editorWorkerHost = EditorWorkerHost.getChannel(workerServer);
    const host = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === "then") {
          return void 0;
        }
        if (typeof prop !== "string") {
          throw new Error(`Not supported`);
        }
        return (...args) => {
          return editorWorkerHost.$fhr(prop, args);
        };
      }
    });
    const ctx = {
      host,
      getMirrorModels: /* @__PURE__ */ __name(() => {
        return webWorkerServer.requestHandler.getModels();
      }, "getMirrorModels")
    };
    client = createClient(ctx);
    return new EditorWorker(client);
  });
  return client;
}
__name(start, "start");
export {
  start
};
//# sourceMappingURL=editor.worker.start.js.map
