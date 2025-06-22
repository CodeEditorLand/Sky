var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractTunnelService, ITunnelService, isTunnelProvider } from "../../../../platform/tunnel/common/tunnel.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
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
let TunnelService = class TunnelService2 extends AbstractTunnelService {
  static {
    __name(this, "TunnelService");
  }
  constructor(logService, environmentService, configurationService) {
    super(logService, configurationService);
    this.environmentService = environmentService;
  }
  isPortPrivileged(_port) {
    return false;
  }
  retainOrCreateTunnel(tunnelProvider, remoteHost, remotePort, _localHost, localPort, elevateIfNeeded, privacy, protocol) {
    const existing = this.getTunnelFromMap(remoteHost, remotePort);
    if (existing) {
      ++existing.refcount;
      return existing.value;
    }
    if (isTunnelProvider(tunnelProvider)) {
      return this.createWithProvider(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
    }
    return void 0;
  }
  canTunnel(uri) {
    return super.canTunnel(uri) && !!this.environmentService.remoteAuthority;
  }
};
TunnelService = __decorate([
  __param(0, ILogService),
  __param(1, IWorkbenchEnvironmentService),
  __param(2, IConfigurationService)
], TunnelService);
registerSingleton(
  ITunnelService,
  TunnelService,
  1
  /* InstantiationType.Delayed */
);
export {
  TunnelService
};
//# sourceMappingURL=tunnelService.js.map
