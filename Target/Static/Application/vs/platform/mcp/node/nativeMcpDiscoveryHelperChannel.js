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
import { transformOutgoingURIs } from "../../../base/common/uriIpc.js";
import { INativeMcpDiscoveryHelperService } from "../common/nativeMcpDiscoveryHelper.js";
let NativeMcpDiscoveryHelperChannel = class NativeMcpDiscoveryHelperChannel2 {
  static {
    __name(this, "NativeMcpDiscoveryHelperChannel");
  }
  constructor(getUriTransformer, nativeMcpDiscoveryHelperService) {
    this.getUriTransformer = getUriTransformer;
    this.nativeMcpDiscoveryHelperService = nativeMcpDiscoveryHelperService;
  }
  listen(context, event) {
    throw new Error("Invalid listen");
  }
  async call(context, command, args) {
    const uriTransformer = this.getUriTransformer?.(context);
    switch (command) {
      case "load": {
        const result = await this.nativeMcpDiscoveryHelperService.load();
        return uriTransformer ? transformOutgoingURIs(result, uriTransformer) : result;
      }
    }
    throw new Error("Invalid call");
  }
};
NativeMcpDiscoveryHelperChannel = __decorate([
  __param(1, INativeMcpDiscoveryHelperService)
], NativeMcpDiscoveryHelperChannel);
export {
  NativeMcpDiscoveryHelperChannel
};
//# sourceMappingURL=nativeMcpDiscoveryHelperChannel.js.map
