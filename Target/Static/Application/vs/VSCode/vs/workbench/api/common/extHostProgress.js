var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { MainContext } from "./extHost.protocol.js";
import { ProgressLocation } from "./extHostTypeConverters.js";
import { Progress } from "../../../platform/progress/common/progress.js";
import { CancellationTokenSource, CancellationToken } from "../../../base/common/cancellation.js";
import { throttle } from "../../../base/common/decorators.js";
import { onUnexpectedExternalError } from "../../../base/common/errors.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
const IExtHostProgress = createDecorator("IExtHostProgress");
let ExtHostProgress = class ExtHostProgress2 {
  static {
    __name(this, "ExtHostProgress");
  }
  constructor(extHostRpc) {
    this._handles = 0;
    this._mapHandleToCancellationSource = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadProgress);
  }
  async withProgress(extension, options, task) {
    const handle = this._handles++;
    const { title, location, cancellable } = options;
    const source = { label: extension.displayName || extension.name, id: extension.identifier.value };
    this._proxy.$startProgress(handle, { location: ProgressLocation.from(location), title, source, cancellable }, !extension.isUnderDevelopment ? extension.identifier.value : void 0).catch(onUnexpectedExternalError);
    return this._withProgress(handle, task, !!cancellable);
  }
  async withProgressFromSource(source, options, task) {
    const handle = this._handles++;
    const { title, location, cancellable } = options;
    this._proxy.$startProgress(handle, { location: ProgressLocation.from(location), title, source, cancellable }, void 0).catch(onUnexpectedExternalError);
    return this._withProgress(handle, task, !!cancellable);
  }
  _withProgress(handle, task, cancellable) {
    let source;
    if (cancellable) {
      source = new CancellationTokenSource();
      this._mapHandleToCancellationSource.set(handle, source);
    }
    const progressEnd = /* @__PURE__ */ __name((handle2) => {
      this._proxy.$progressEnd(handle2);
      this._mapHandleToCancellationSource.delete(handle2);
      source?.dispose();
    }, "progressEnd");
    let p;
    try {
      p = task(new ProgressCallback(this._proxy, handle), cancellable && source ? source.token : CancellationToken.None);
    } catch (err) {
      progressEnd(handle);
      throw err;
    }
    p.then((result) => progressEnd(handle), (err) => progressEnd(handle));
    return p;
  }
  $acceptProgressCanceled(handle) {
    const source = this._mapHandleToCancellationSource.get(handle);
    if (source) {
      source.cancel();
      this._mapHandleToCancellationSource.delete(handle);
    }
  }
};
ExtHostProgress = __decorate([
  __param(0, IExtHostRpcService)
], ExtHostProgress);
function mergeProgress(result, currentValue) {
  result.message = currentValue.message;
  if (typeof currentValue.increment === "number") {
    if (typeof result.increment === "number") {
      result.increment += currentValue.increment;
    } else {
      result.increment = currentValue.increment;
    }
  }
  return result;
}
__name(mergeProgress, "mergeProgress");
class ProgressCallback extends Progress {
  static {
    __name(this, "ProgressCallback");
  }
  constructor(_proxy, _handle) {
    super((p) => this.throttledReport(p));
    this._proxy = _proxy;
    this._handle = _handle;
  }
  throttledReport(p) {
    this._proxy.$progressReport(this._handle, p);
  }
}
__decorate([
  throttle(100, (result, currentValue) => mergeProgress(result, currentValue), () => /* @__PURE__ */ Object.create(null))
], ProgressCallback.prototype, "throttledReport", null);
export {
  ExtHostProgress,
  IExtHostProgress
};
//# sourceMappingURL=extHostProgress.js.map
