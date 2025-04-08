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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IChannel, IServerChannel, getDelayedChannel, IPCLogger } from "../../../../base/parts/ipc/common/ipc.js";
import { Client } from "../../../../base/parts/ipc/common/ipc.net.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { connectRemoteAgentManagement, IConnectionOptions, ManagementPersistentConnection, PersistentConnectionEvent } from "../../../../platform/remote/common/remoteAgentConnection.js";
import { IExtensionHostExitInfo, IRemoteAgentConnection, IRemoteAgentService } from "./remoteAgentService.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { RemoteAgentConnectionContext, IRemoteAgentEnvironment } from "../../../../platform/remote/common/remoteAgentEnvironment.js";
import { RemoteExtensionEnvironmentChannelClient } from "./remoteAgentEnvironmentChannel.js";
import { IDiagnosticInfoOptions, IDiagnosticInfo } from "../../../../platform/diagnostics/common/diagnostics.js";
import { Emitter } from "../../../../base/common/event.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryData, TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { IRemoteSocketFactoryService } from "../../../../platform/remote/common/remoteSocketFactoryService.js";
let AbstractRemoteAgentService = class extends Disposable {
  constructor(remoteSocketFactoryService, userDataProfileService, _environmentService, productService, _remoteAuthorityResolverService, signService, logService) {
    super();
    this.remoteSocketFactoryService = remoteSocketFactoryService;
    this.userDataProfileService = userDataProfileService;
    this._environmentService = _environmentService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    if (this._environmentService.remoteAuthority) {
      this._connection = this._register(new RemoteAgentConnection(this._environmentService.remoteAuthority, productService.commit, productService.quality, this.remoteSocketFactoryService, this._remoteAuthorityResolverService, signService, logService));
    } else {
      this._connection = null;
    }
    this._environment = null;
  }
  static {
    __name(this, "AbstractRemoteAgentService");
  }
  _connection;
  _environment;
  getConnection() {
    return this._connection;
  }
  getEnvironment() {
    return this.getRawEnvironment().then(void 0, () => null);
  }
  getRawEnvironment() {
    if (!this._environment) {
      this._environment = this._withChannel(
        async (channel, connection) => {
          const env = await RemoteExtensionEnvironmentChannelClient.getEnvironmentData(channel, connection.remoteAuthority, this.userDataProfileService.currentProfile.isDefault ? void 0 : this.userDataProfileService.currentProfile.id);
          this._remoteAuthorityResolverService._setAuthorityConnectionToken(connection.remoteAuthority, env.connectionToken);
          return env;
        },
        null
      );
    }
    return this._environment;
  }
  getExtensionHostExitInfo(reconnectionToken) {
    return this._withChannel(
      (channel, connection) => RemoteExtensionEnvironmentChannelClient.getExtensionHostExitInfo(channel, connection.remoteAuthority, reconnectionToken),
      null
    );
  }
  getDiagnosticInfo(options) {
    return this._withChannel(
      (channel) => RemoteExtensionEnvironmentChannelClient.getDiagnosticInfo(channel, options),
      void 0
    );
  }
  updateTelemetryLevel(telemetryLevel) {
    return this._withTelemetryChannel(
      (channel) => RemoteExtensionEnvironmentChannelClient.updateTelemetryLevel(channel, telemetryLevel),
      void 0
    );
  }
  logTelemetry(eventName, data) {
    return this._withTelemetryChannel(
      (channel) => RemoteExtensionEnvironmentChannelClient.logTelemetry(channel, eventName, data),
      void 0
    );
  }
  flushTelemetry() {
    return this._withTelemetryChannel(
      (channel) => RemoteExtensionEnvironmentChannelClient.flushTelemetry(channel),
      void 0
    );
  }
  getRoundTripTime() {
    return this._withTelemetryChannel(
      async (channel) => {
        const start = Date.now();
        await RemoteExtensionEnvironmentChannelClient.ping(channel);
        return Date.now() - start;
      },
      void 0
    );
  }
  async endConnection() {
    if (this._connection) {
      await this._connection.end();
      this._connection.dispose();
    }
  }
  _withChannel(callback, fallback) {
    const connection = this.getConnection();
    if (!connection) {
      return Promise.resolve(fallback);
    }
    return connection.withChannel("remoteextensionsenvironment", (channel) => callback(channel, connection));
  }
  _withTelemetryChannel(callback, fallback) {
    const connection = this.getConnection();
    if (!connection) {
      return Promise.resolve(fallback);
    }
    return connection.withChannel("telemetry", (channel) => callback(channel, connection));
  }
};
AbstractRemoteAgentService = __decorateClass([
  __decorateParam(0, IRemoteSocketFactoryService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IRemoteAuthorityResolverService),
  __decorateParam(5, ISignService),
  __decorateParam(6, ILogService)
], AbstractRemoteAgentService);
class RemoteAgentConnection extends Disposable {
  constructor(remoteAuthority, _commit, _quality, _remoteSocketFactoryService, _remoteAuthorityResolverService, _signService, _logService) {
    super();
    this._commit = _commit;
    this._quality = _quality;
    this._remoteSocketFactoryService = _remoteSocketFactoryService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._signService = _signService;
    this._logService = _logService;
    this.remoteAuthority = remoteAuthority;
    this._connection = null;
  }
  static {
    __name(this, "RemoteAgentConnection");
  }
  _onReconnecting = this._register(new Emitter());
  onReconnecting = this._onReconnecting.event;
  _onDidStateChange = this._register(new Emitter());
  onDidStateChange = this._onDidStateChange.event;
  remoteAuthority;
  _connection;
  _initialConnectionMs;
  end = /* @__PURE__ */ __name(() => Promise.resolve(), "end");
  getChannel(channelName) {
    return getDelayedChannel(this._getOrCreateConnection().then((c) => c.getChannel(channelName)));
  }
  withChannel(channelName, callback) {
    const channel = this.getChannel(channelName);
    const result = callback(channel);
    return result;
  }
  registerChannel(channelName, channel) {
    this._getOrCreateConnection().then((client) => client.registerChannel(channelName, channel));
  }
  async getInitialConnectionTimeMs() {
    try {
      await this._getOrCreateConnection();
    } catch {
    }
    return this._initialConnectionMs;
  }
  _getOrCreateConnection() {
    if (!this._connection) {
      this._connection = this._createConnection();
    }
    return this._connection;
  }
  async _createConnection() {
    let firstCall = true;
    const options = {
      commit: this._commit,
      quality: this._quality,
      addressProvider: {
        getAddress: /* @__PURE__ */ __name(async () => {
          if (firstCall) {
            firstCall = false;
          } else {
            this._onReconnecting.fire(void 0);
          }
          const { authority } = await this._remoteAuthorityResolverService.resolveAuthority(this.remoteAuthority);
          return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
        }, "getAddress")
      },
      remoteSocketFactoryService: this._remoteSocketFactoryService,
      signService: this._signService,
      logService: this._logService,
      ipcLogger: false ? new IPCLogger(`Local \u2192 Remote`, `Remote \u2192 Local`) : null
    };
    let connection;
    const start = Date.now();
    try {
      connection = this._register(await connectRemoteAgentManagement(options, this.remoteAuthority, `renderer`));
    } finally {
      this._initialConnectionMs = Date.now() - start;
    }
    connection.protocol.onDidDispose(() => {
      connection.dispose();
    });
    this.end = () => {
      connection.protocol.sendDisconnect();
      return connection.protocol.drain();
    };
    this._register(connection.onDidStateChange((e) => this._onDidStateChange.fire(e)));
    return connection.client;
  }
}
export {
  AbstractRemoteAgentService
};
//# sourceMappingURL=abstractRemoteAgentService.js.map
