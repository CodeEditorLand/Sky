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
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AbstractRequestService, IRequestService } from "../../../../platform/request/common/request.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { request } from "../../../../base/parts/request/common/requestImpl.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { localize } from "../../../../nls.js";
import { windowLogGroup } from "../../log/common/logConstants.js";
import { LogService } from "../../../../platform/log/common/logService.js";
let NativeRequestService = class NativeRequestService2 extends AbstractRequestService {
  static {
    __name(this, "NativeRequestService");
  }
  constructor(nativeHostService, configurationService, loggerService) {
    const logger = loggerService.createLogger(`network`, { name: localize("network", "Network"), group: windowLogGroup });
    const logService = new LogService(logger);
    super(logService);
    this.nativeHostService = nativeHostService;
    this.configurationService = configurationService;
    this._register(logger);
    this._register(logService);
  }
  async request(options, token) {
    if (!options.proxyAuthorization) {
      options.proxyAuthorization = this.configurationService.inspect("http.proxyAuthorization").userLocalValue;
    }
    return this.logAndRequest(options, () => request(options, token, () => navigator.onLine));
  }
  async resolveProxy(url) {
    return this.nativeHostService.resolveProxy(url);
  }
  async lookupAuthorization(authInfo) {
    return this.nativeHostService.lookupAuthorization(authInfo);
  }
  async lookupKerberosAuthorization(url) {
    return this.nativeHostService.lookupKerberosAuthorization(url);
  }
  async loadCertificates() {
    return this.nativeHostService.loadCertificates();
  }
};
NativeRequestService = __decorate([
  __param(0, INativeHostService),
  __param(1, IConfigurationService),
  __param(2, ILoggerService)
], NativeRequestService);
registerSingleton(
  IRequestService,
  NativeRequestService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeRequestService
};
//# sourceMappingURL=requestService.js.map
