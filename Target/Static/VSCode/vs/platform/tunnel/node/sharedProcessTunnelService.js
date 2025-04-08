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
import { ILogService } from "../../log/common/log.js";
import { ISharedProcessTunnel, ISharedProcessTunnelService } from "../../remote/common/sharedProcessTunnelService.js";
import { ISharedTunnelsService, RemoteTunnel } from "../common/tunnel.js";
import { IAddress, IAddressProvider } from "../../remote/common/remoteAgentConnection.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { canceled } from "../../../base/common/errors.js";
import { DeferredPromise } from "../../../base/common/async.js";
class TunnelData extends Disposable {
  static {
    __name(this, "TunnelData");
  }
  _address;
  _addressPromise;
  constructor() {
    super();
    this._address = null;
    this._addressPromise = null;
  }
  async getAddress() {
    if (this._address) {
      return this._address;
    }
    if (!this._addressPromise) {
      this._addressPromise = new DeferredPromise();
    }
    return this._addressPromise.p;
  }
  setAddress(address) {
    this._address = address;
    if (this._addressPromise) {
      this._addressPromise.complete(address);
      this._addressPromise = null;
    }
  }
  setTunnel(tunnel) {
    this._register(tunnel);
  }
}
let SharedProcessTunnelService = class extends Disposable {
  constructor(_tunnelService, _logService) {
    super();
    this._tunnelService = _tunnelService;
    this._logService = _logService;
  }
  static {
    __name(this, "SharedProcessTunnelService");
  }
  _serviceBrand;
  static _lastId = 0;
  _tunnels = /* @__PURE__ */ new Map();
  _disposedTunnels = /* @__PURE__ */ new Set();
  dispose() {
    super.dispose();
    this._tunnels.forEach((tunnel) => tunnel.dispose());
  }
  async createTunnel() {
    const id = String(++SharedProcessTunnelService._lastId);
    return { id };
  }
  async startTunnel(authority, id, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
    const tunnelData = new TunnelData();
    const tunnel = await Promise.resolve(this._tunnelService.openTunnel(authority, tunnelData, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded));
    if (!tunnel || typeof tunnel === "string") {
      this._logService.info(`[SharedProcessTunnelService] Could not create a tunnel to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
      tunnelData.dispose();
      throw new Error(`Could not create tunnel`);
    }
    if (this._disposedTunnels.has(id)) {
      this._disposedTunnels.delete(id);
      tunnelData.dispose();
      await tunnel.dispose();
      throw canceled();
    }
    tunnelData.setTunnel(tunnel);
    this._tunnels.set(id, tunnelData);
    this._logService.info(`[SharedProcessTunnelService] Created tunnel ${id}: ${tunnel.localAddress} (local) to ${tunnelRemoteHost}:${tunnelRemotePort} (remote).`);
    const result = {
      tunnelLocalPort: tunnel.tunnelLocalPort,
      localAddress: tunnel.localAddress
    };
    return result;
  }
  async setAddress(id, address) {
    const tunnel = this._tunnels.get(id);
    if (!tunnel) {
      return;
    }
    tunnel.setAddress(address);
  }
  async destroyTunnel(id) {
    const tunnel = this._tunnels.get(id);
    if (tunnel) {
      this._logService.info(`[SharedProcessTunnelService] Disposing tunnel ${id}.`);
      this._tunnels.delete(id);
      await tunnel.dispose();
      return;
    }
    this._disposedTunnels.add(id);
  }
};
SharedProcessTunnelService = __decorateClass([
  __decorateParam(0, ISharedTunnelsService),
  __decorateParam(1, ILogService)
], SharedProcessTunnelService);
export {
  SharedProcessTunnelService
};
//# sourceMappingURL=sharedProcessTunnelService.js.map
