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
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import * as extHostProtocol from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
const IExtHostApiDeprecationService = createDecorator("IExtHostApiDeprecationService");
let ExtHostApiDeprecationService = class ExtHostApiDeprecationService2 {
  static {
    __name(this, "ExtHostApiDeprecationService");
  }
  constructor(rpc, _extHostLogService) {
    this._extHostLogService = _extHostLogService;
    this._reportedUsages = /* @__PURE__ */ new Set();
    this._telemetryShape = rpc.getProxy(extHostProtocol.MainContext.MainThreadTelemetry);
  }
  report(apiId, extension, migrationSuggestion, options) {
    const key = this.getUsageKey(apiId, extension, options?.usageId);
    if (this._reportedUsages.has(key)) {
      return;
    }
    this._reportedUsages.add(key);
    if (extension.isUnderDevelopment) {
      this._extHostLogService.warn(`[Deprecation Warning] '${apiId}' is deprecated. ${migrationSuggestion}`);
    }
    this._telemetryShape.$publicLog2("extHostDeprecatedApiUsage", {
      extensionId: extension.identifier.value,
      apiId,
      usageId: options?.usageId ?? ""
    });
  }
  getUsageKey(apiId, extension, usageId) {
    const rootKey = `${apiId}-${extension.identifier.value}`;
    return usageId ? `${rootKey}-${usageId}` : rootKey;
  }
};
ExtHostApiDeprecationService = __decorate([
  __param(0, IExtHostRpcService),
  __param(1, ILogService)
], ExtHostApiDeprecationService);
const NullApiDeprecationService = Object.freeze(new class {
  report(_apiId, _extension, _warningMessage) {
  }
}());
export {
  ExtHostApiDeprecationService,
  IExtHostApiDeprecationService,
  NullApiDeprecationService
};
//# sourceMappingURL=extHostApiDeprecationService.js.map
