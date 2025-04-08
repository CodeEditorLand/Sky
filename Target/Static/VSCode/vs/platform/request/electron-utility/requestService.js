var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { net } from "electron";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IRequestContext, IRequestOptions } from "../../../base/parts/request/common/request.js";
import { IRawRequestFunction, RequestService as NodeRequestService } from "../node/requestService.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { ILogService } from "../../log/common/log.js";
function getRawRequest(options) {
  return net.request;
}
__name(getRawRequest, "getRawRequest");
let RequestService = class extends NodeRequestService {
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
RequestService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, INativeEnvironmentService),
  __decorateParam(2, ILogService)
], RequestService);
export {
  RequestService
};
//# sourceMappingURL=requestService.js.map
