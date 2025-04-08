var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import { EditorWorkerClient } from "../../browser/services/editorWorkerService.js";
import { IModelService } from "../../common/services/model.js";
function createWebWorker(modelService, opts) {
  return new MonacoWebWorkerImpl(modelService, opts);
}
__name(createWebWorker, "createWebWorker");
class MonacoWebWorkerImpl extends EditorWorkerClient {
  static {
    __name(this, "MonacoWebWorkerImpl");
  }
  _foreignModuleHost;
  _foreignProxy;
  constructor(modelService, opts) {
    super(opts.worker, opts.keepIdleModels || false, modelService);
    this._foreignModuleHost = opts.host || null;
    this._foreignProxy = this._getProxy().then((proxy) => {
      return new Proxy({}, {
        get(target, prop, receiver) {
          if (typeof prop !== "string") {
            throw new Error(`Not supported`);
          }
          return (...args) => {
            return proxy.$fmr(prop, args);
          };
        }
      });
    });
  }
  // foreign host request
  fhr(method, args) {
    if (!this._foreignModuleHost || typeof this._foreignModuleHost[method] !== "function") {
      return Promise.reject(new Error("Missing method " + method + " or missing main thread foreign host."));
    }
    try {
      return Promise.resolve(this._foreignModuleHost[method].apply(this._foreignModuleHost, args));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  getProxy() {
    return this._foreignProxy;
  }
  withSyncedResources(resources) {
    return this.workerWithSyncedResources(resources).then((_) => this.getProxy());
  }
}
export {
  createWebWorker
};
//# sourceMappingURL=standaloneWebWorker.js.map
