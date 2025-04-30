var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { initialize } from "../base/common/worker/webWorkerBootstrap.js";
import { EditorWorker } from "./common/services/editorWebWorker.js";
import { EditorWorkerHost } from "./common/services/editorWorkerHost.js";
function start(client) {
  const webWorkerServer = initialize(() => new EditorWorker(client));
  const editorWorkerHost = EditorWorkerHost.getChannel(webWorkerServer);
  const host = new Proxy({}, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") {
        throw new Error(`Not supported`);
      }
      return (...args) => {
        return editorWorkerHost.$fhr(prop, args);
      };
    }
  });
  return {
    host,
    getMirrorModels: /* @__PURE__ */ __name(() => {
      return webWorkerServer.requestHandler.getModels();
    }, "getMirrorModels")
  };
}
__name(start, "start");
export {
  start
};
//# sourceMappingURL=editor.worker.start.js.map
