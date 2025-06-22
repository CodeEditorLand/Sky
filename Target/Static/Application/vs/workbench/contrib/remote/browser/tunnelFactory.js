var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { ITunnelService, TunnelProtocol, TunnelPrivacyId } from "../../../../platform/tunnel/common/tunnel.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { URI } from "../../../../base/common/uri.js";
import { IRemoteExplorerService } from "../../../services/remote/common/remoteExplorerService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { forwardedPortsFeaturesEnabled } from "../../../services/remote/common/tunnelModel.js";
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
let TunnelFactoryContribution = class TunnelFactoryContribution2 extends Disposable {
  static {
    __name(this, "TunnelFactoryContribution");
  }
  static {
    this.ID = "workbench.contrib.tunnelFactory";
  }
  constructor(tunnelService, environmentService, openerService, remoteExplorerService, logService, contextKeyService) {
    super();
    this.openerService = openerService;
    const tunnelFactory = environmentService.options?.tunnelProvider?.tunnelFactory;
    if (tunnelFactory) {
      contextKeyService.createKey(forwardedPortsFeaturesEnabled.key, true);
      let privacyOptions = environmentService.options?.tunnelProvider?.features?.privacyOptions ?? [];
      if (environmentService.options?.tunnelProvider?.features?.public && privacyOptions.length === 0) {
        privacyOptions = [
          {
            id: "private",
            label: nls.localize("tunnelPrivacy.private", "Private"),
            themeIcon: "lock"
          },
          {
            id: "public",
            label: nls.localize("tunnelPrivacy.public", "Public"),
            themeIcon: "eye"
          }
        ];
      }
      this._register(tunnelService.setTunnelProvider({
        forwardPort: /* @__PURE__ */ __name(async (tunnelOptions, tunnelCreationOptions) => {
          let tunnelPromise;
          try {
            tunnelPromise = tunnelFactory(tunnelOptions, tunnelCreationOptions);
          } catch (e) {
            logService.trace("tunnelFactory: tunnel provider error");
          }
          if (!tunnelPromise) {
            return void 0;
          }
          let tunnel;
          try {
            tunnel = await tunnelPromise;
          } catch (e) {
            logService.trace("tunnelFactory: tunnel provider promise error");
            if (e instanceof Error) {
              return e.message;
            }
            return void 0;
          }
          const localAddress = tunnel.localAddress.startsWith("http") ? tunnel.localAddress : `http://${tunnel.localAddress}`;
          const remoteTunnel = {
            tunnelRemotePort: tunnel.remoteAddress.port,
            tunnelRemoteHost: tunnel.remoteAddress.host,
            // The tunnel factory may give us an inaccessible local address.
            // To make sure this doesn't happen, resolve the uri immediately.
            localAddress: await this.resolveExternalUri(localAddress),
            privacy: tunnel.privacy ?? (tunnel.public ? TunnelPrivacyId.Public : TunnelPrivacyId.Private),
            protocol: tunnel.protocol ?? TunnelProtocol.Http,
            dispose: /* @__PURE__ */ __name(async () => {
              await tunnel.dispose();
            }, "dispose")
          };
          return remoteTunnel;
        }, "forwardPort")
      }));
      const tunnelInformation = environmentService.options?.tunnelProvider?.features ? {
        features: {
          elevation: !!environmentService.options?.tunnelProvider?.features?.elevation,
          public: !!environmentService.options?.tunnelProvider?.features?.public,
          privacyOptions,
          protocol: environmentService.options?.tunnelProvider?.features?.protocol === void 0 ? true : !!environmentService.options?.tunnelProvider?.features?.protocol
        }
      } : void 0;
      remoteExplorerService.setTunnelInformation(tunnelInformation);
    }
  }
  async resolveExternalUri(uri) {
    try {
      return (await this.openerService.resolveExternalUri(URI.parse(uri))).resolved.toString();
    } catch {
      return uri;
    }
  }
};
TunnelFactoryContribution = __decorate([
  __param(0, ITunnelService),
  __param(1, IBrowserWorkbenchEnvironmentService),
  __param(2, IOpenerService),
  __param(3, IRemoteExplorerService),
  __param(4, ILogService),
  __param(5, IContextKeyService)
], TunnelFactoryContribution);
export {
  TunnelFactoryContribution
};
//# sourceMappingURL=tunnelFactory.js.map
