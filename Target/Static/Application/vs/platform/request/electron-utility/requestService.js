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
import { net } from "electron";
import { RequestService as NodeRequestService } from "../node/requestService.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { ILogService } from "../../log/common/log.js";
function getRawRequest(options) {
  return net.request;
}
__name(getRawRequest, "getRawRequest");
let RequestService = class RequestService2 extends NodeRequestService {
  static {
    __name(this, "RequestService");
  }
  constructor(configurationService, environmentService, logService) {
    super("local", configurationService, environmentService, logService);
  }
  request(options, token) {
    return super.request({ ...options || {}, getRawRequest, isChromiumNetwork: true }, token);
  }
};
RequestService = __decorate([
  __param(0, IConfigurationService),
  __param(1, INativeEnvironmentService),
  __param(2, ILogService)
], RequestService);
export {
  RequestService
};
//# sourceMappingURL=requestService.js.map
