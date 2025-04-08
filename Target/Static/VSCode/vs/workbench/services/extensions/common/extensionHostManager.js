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
import { IntervalTimer } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import * as errors from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { URI } from "../../../../base/common/uri.js";
import { IMessagePassingProtocol } from "../../../../base/parts/ipc/common/ipc.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { RemoteAuthorityResolverErrorCode, getRemoteAuthorityPrefix } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { ExtHostCustomersRegistry, IInternalExtHostContext } from "./extHostCustomers.js";
import { ExtensionHostKind, extensionHostKindToString } from "./extensionHostKind.js";
import { IExtensionHostManager } from "./extensionHostManagers.js";
import { IExtensionDescriptionDelta } from "./extensionHostProtocol.js";
import { IExtensionHostProxy, IResolveAuthorityResult } from "./extensionHostProxy.js";
import { ExtensionRunningLocation } from "./extensionRunningLocation.js";
import { ActivationKind, ExtensionActivationReason, ExtensionHostStartup, IExtensionHost, IInternalExtensionService } from "./extensions.js";
import { Proxied, ProxyIdentifier } from "./proxyIdentifier.js";
import { IRPCProtocolLogger, RPCProtocol, RequestInitiator, ResponsiveState } from "./rpcProtocol.js";
const LOG_EXTENSION_HOST_COMMUNICATION = false;
const LOG_USE_COLORS = true;
let ExtensionHostManager = class extends Disposable {
  constructor(extensionHost, initialActivationEvents, _internalExtensionService, _instantiationService, _environmentService, _telemetryService, _logService) {
    super();
    this._internalExtensionService = _internalExtensionService;
    this._instantiationService = _instantiationService;
    this._environmentService = _environmentService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._cachedActivationEvents = /* @__PURE__ */ new Map();
    this._resolvedActivationEvents = /* @__PURE__ */ new Set();
    this._rpcProtocol = null;
    this._customers = [];
    this._extensionHost = extensionHost;
    this.onDidExit = this._extensionHost.onExit;
    const startingTelemetryEvent = {
      time: Date.now(),
      action: "starting",
      kind: extensionHostKindToString(this.kind)
    };
    this._telemetryService.publicLog2("extensionHostStartup", startingTelemetryEvent);
    this._proxy = this._extensionHost.start().then(
      (protocol) => {
        this._hasStarted = true;
        const successTelemetryEvent = {
          time: Date.now(),
          action: "success",
          kind: extensionHostKindToString(this.kind)
        };
        this._telemetryService.publicLog2("extensionHostStartup", successTelemetryEvent);
        return this._createExtensionHostCustomers(this.kind, protocol);
      },
      (err) => {
        this._logService.error(`Error received from starting extension host (kind: ${extensionHostKindToString(this.kind)})`);
        this._logService.error(err);
        const failureTelemetryEvent = {
          time: Date.now(),
          action: "error",
          kind: extensionHostKindToString(this.kind)
        };
        if (err && err.name) {
          failureTelemetryEvent.errorName = err.name;
        }
        if (err && err.message) {
          failureTelemetryEvent.errorMessage = err.message;
        }
        if (err && err.stack) {
          failureTelemetryEvent.errorStack = err.stack;
        }
        this._telemetryService.publicLog2("extensionHostStartup", failureTelemetryEvent);
        return null;
      }
    );
    this._proxy.then(() => {
      initialActivationEvents.forEach((activationEvent) => this.activateByEvent(activationEvent, ActivationKind.Normal));
      this._register(registerLatencyTestProvider({
        measure: /* @__PURE__ */ __name(() => this.measure(), "measure")
      }));
    });
  }
  static {
    __name(this, "ExtensionHostManager");
  }
  onDidExit;
  _onDidChangeResponsiveState = this._register(new Emitter());
  onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
  /**
   * A map of already requested activation events to speed things up if the same activation event is triggered multiple times.
   */
  _cachedActivationEvents;
  _resolvedActivationEvents;
  _rpcProtocol;
  _customers;
  _extensionHost;
  _proxy;
  _hasStarted = false;
  get pid() {
    return this._extensionHost.pid;
  }
  get kind() {
    return this._extensionHost.runningLocation.kind;
  }
  get startup() {
    return this._extensionHost.startup;
  }
  get friendyName() {
    return friendlyExtHostName(this.kind, this.pid);
  }
  async disconnect() {
    await this._extensionHost?.disconnect?.();
  }
  dispose() {
    this._extensionHost?.dispose();
    this._rpcProtocol?.dispose();
    for (let i = 0, len = this._customers.length; i < len; i++) {
      const customer = this._customers[i];
      try {
        customer.dispose();
      } catch (err) {
        errors.onUnexpectedError(err);
      }
    }
    this._proxy = null;
    super.dispose();
  }
  async measure() {
    const proxy = await this._proxy;
    if (!proxy) {
      return null;
    }
    const latency = await this._measureLatency(proxy);
    const down = await this._measureDown(proxy);
    const up = await this._measureUp(proxy);
    return {
      remoteAuthority: this._extensionHost.remoteAuthority,
      latency,
      down,
      up
    };
  }
  async ready() {
    await this._proxy;
  }
  async _measureLatency(proxy) {
    const COUNT = 10;
    let sum = 0;
    for (let i = 0; i < COUNT; i++) {
      const sw = StopWatch.create();
      await proxy.test_latency(i);
      sw.stop();
      sum += sw.elapsed();
    }
    return sum / COUNT;
  }
  static _convert(byteCount, elapsedMillis) {
    return byteCount * 1e3 * 8 / elapsedMillis;
  }
  async _measureUp(proxy) {
    const SIZE = 10 * 1024 * 1024;
    const buff = VSBuffer.alloc(SIZE);
    const value = Math.ceil(Math.random() * 256);
    for (let i = 0; i < buff.byteLength; i++) {
      buff.writeUInt8(i, value);
    }
    const sw = StopWatch.create();
    await proxy.test_up(buff);
    sw.stop();
    return ExtensionHostManager._convert(SIZE, sw.elapsed());
  }
  async _measureDown(proxy) {
    const SIZE = 10 * 1024 * 1024;
    const sw = StopWatch.create();
    await proxy.test_down(SIZE);
    sw.stop();
    return ExtensionHostManager._convert(SIZE, sw.elapsed());
  }
  _createExtensionHostCustomers(kind, protocol) {
    let logger = null;
    if (LOG_EXTENSION_HOST_COMMUNICATION || this._environmentService.logExtensionHostCommunication) {
      logger = new RPCLogger(kind);
    } else if (TelemetryRPCLogger.isEnabled()) {
      logger = new TelemetryRPCLogger(this._telemetryService);
    }
    this._rpcProtocol = new RPCProtocol(protocol, logger);
    this._register(this._rpcProtocol.onDidChangeResponsiveState((responsiveState) => this._onDidChangeResponsiveState.fire(responsiveState)));
    let extensionHostProxy = null;
    let mainProxyIdentifiers = [];
    const extHostContext = {
      remoteAuthority: this._extensionHost.remoteAuthority,
      extensionHostKind: this.kind,
      getProxy: /* @__PURE__ */ __name((identifier) => this._rpcProtocol.getProxy(identifier), "getProxy"),
      set: /* @__PURE__ */ __name((identifier, instance) => this._rpcProtocol.set(identifier, instance), "set"),
      dispose: /* @__PURE__ */ __name(() => this._rpcProtocol.dispose(), "dispose"),
      assertRegistered: /* @__PURE__ */ __name((identifiers) => this._rpcProtocol.assertRegistered(identifiers), "assertRegistered"),
      drain: /* @__PURE__ */ __name(() => this._rpcProtocol.drain(), "drain"),
      //#region internal
      internalExtensionService: this._internalExtensionService,
      _setExtensionHostProxy: /* @__PURE__ */ __name((value) => {
        extensionHostProxy = value;
      }, "_setExtensionHostProxy"),
      _setAllMainProxyIdentifiers: /* @__PURE__ */ __name((value) => {
        mainProxyIdentifiers = value;
      }, "_setAllMainProxyIdentifiers")
      //#endregion
    };
    const namedCustomers = ExtHostCustomersRegistry.getNamedCustomers();
    for (let i = 0, len = namedCustomers.length; i < len; i++) {
      const [id, ctor] = namedCustomers[i];
      try {
        const instance = this._instantiationService.createInstance(ctor, extHostContext);
        this._customers.push(instance);
        this._rpcProtocol.set(id, instance);
      } catch (err) {
        this._logService.error(`Cannot instantiate named customer: '${id.sid}'`);
        this._logService.error(err);
        errors.onUnexpectedError(err);
      }
    }
    const customers = ExtHostCustomersRegistry.getCustomers();
    for (const ctor of customers) {
      try {
        const instance = this._instantiationService.createInstance(ctor, extHostContext);
        this._customers.push(instance);
      } catch (err) {
        this._logService.error(err);
        errors.onUnexpectedError(err);
      }
    }
    if (!extensionHostProxy) {
      throw new Error(`Missing IExtensionHostProxy!`);
    }
    this._rpcProtocol.assertRegistered(mainProxyIdentifiers);
    return extensionHostProxy;
  }
  async activate(extension, reason) {
    const proxy = await this._proxy;
    if (!proxy) {
      return false;
    }
    return proxy.activate(extension, reason);
  }
  activateByEvent(activationEvent, activationKind) {
    if (activationKind === ActivationKind.Immediate && !this._hasStarted) {
      return Promise.resolve();
    }
    if (!this._cachedActivationEvents.has(activationEvent)) {
      this._cachedActivationEvents.set(activationEvent, this._activateByEvent(activationEvent, activationKind));
    }
    return this._cachedActivationEvents.get(activationEvent);
  }
  activationEventIsDone(activationEvent) {
    return this._resolvedActivationEvents.has(activationEvent);
  }
  async _activateByEvent(activationEvent, activationKind) {
    if (!this._proxy) {
      return;
    }
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    if (!this._extensionHost.extensions.containsActivationEvent(activationEvent)) {
      this._resolvedActivationEvents.add(activationEvent);
      return;
    }
    await proxy.activateByEvent(activationEvent, activationKind);
    this._resolvedActivationEvents.add(activationEvent);
  }
  async getInspectPort(tryEnableInspector) {
    if (this._extensionHost) {
      if (tryEnableInspector) {
        await this._extensionHost.enableInspectPort();
      }
      const port = this._extensionHost.getInspectPort();
      if (port) {
        return port;
      }
    }
    return void 0;
  }
  async resolveAuthority(remoteAuthority, resolveAttempt) {
    const sw = StopWatch.create(false);
    const prefix = /* @__PURE__ */ __name(() => `[${extensionHostKindToString(this._extensionHost.runningLocation.kind)}${this._extensionHost.runningLocation.affinity}][resolveAuthority(${getRemoteAuthorityPrefix(remoteAuthority)},${resolveAttempt})][${sw.elapsed()}ms] `, "prefix");
    const logInfo = /* @__PURE__ */ __name((msg) => this._logService.info(`${prefix()}${msg}`), "logInfo");
    const logError = /* @__PURE__ */ __name((msg, err = void 0) => this._logService.error(`${prefix()}${msg}`, err), "logError");
    logInfo(`obtaining proxy...`);
    const proxy = await this._proxy;
    if (!proxy) {
      logError(`no proxy`);
      return {
        type: "error",
        error: {
          message: `Cannot resolve authority`,
          code: RemoteAuthorityResolverErrorCode.Unknown,
          detail: void 0
        }
      };
    }
    logInfo(`invoking...`);
    const intervalLogger = new IntervalTimer();
    try {
      intervalLogger.cancelAndSet(() => logInfo("waiting..."), 1e3);
      const resolverResult = await proxy.resolveAuthority(remoteAuthority, resolveAttempt);
      intervalLogger.dispose();
      if (resolverResult.type === "ok") {
        logInfo(`returned ${resolverResult.value.authority.connectTo}`);
      } else {
        logError(`returned an error`, resolverResult.error);
      }
      return resolverResult;
    } catch (err) {
      intervalLogger.dispose();
      logError(`returned an error`, err);
      return {
        type: "error",
        error: {
          message: err.message,
          code: RemoteAuthorityResolverErrorCode.Unknown,
          detail: err
        }
      };
    }
  }
  async getCanonicalURI(remoteAuthority, uri) {
    const proxy = await this._proxy;
    if (!proxy) {
      throw new Error(`Cannot resolve canonical URI`);
    }
    return proxy.getCanonicalURI(remoteAuthority, uri);
  }
  async start(extensionRegistryVersionId, allExtensions, myExtensions) {
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    const deltaExtensions = this._extensionHost.extensions.set(extensionRegistryVersionId, allExtensions, myExtensions);
    return proxy.startExtensionHost(deltaExtensions);
  }
  async extensionTestsExecute() {
    const proxy = await this._proxy;
    if (!proxy) {
      throw new Error("Could not obtain Extension Host Proxy");
    }
    return proxy.extensionTestsExecute();
  }
  representsRunningLocation(runningLocation) {
    return this._extensionHost.runningLocation.equals(runningLocation);
  }
  async deltaExtensions(incomingExtensionsDelta) {
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    const outgoingExtensionsDelta = this._extensionHost.extensions.delta(incomingExtensionsDelta);
    if (!outgoingExtensionsDelta) {
      return;
    }
    return proxy.deltaExtensions(outgoingExtensionsDelta);
  }
  containsExtension(extensionId) {
    return this._extensionHost.extensions?.containsExtension(extensionId) ?? false;
  }
  async setRemoteEnvironment(env) {
    const proxy = await this._proxy;
    if (!proxy) {
      return;
    }
    return proxy.setRemoteEnvironment(env);
  }
};
ExtensionHostManager = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService)
], ExtensionHostManager);
function friendlyExtHostName(kind, pid) {
  if (pid) {
    return `${extensionHostKindToString(kind)} pid: ${pid}`;
  }
  return `${extensionHostKindToString(kind)}`;
}
__name(friendlyExtHostName, "friendlyExtHostName");
const colorTables = [
  ["#2977B1", "#FC802D", "#34A13A", "#D3282F", "#9366BA"],
  ["#8B564C", "#E177C0", "#7F7F7F", "#BBBE3D", "#2EBECD"]
];
function prettyWithoutArrays(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && typeof data.toString === "function") {
    const result = data.toString();
    if (result !== "[object Object]") {
      return result;
    }
  }
  return data;
}
__name(prettyWithoutArrays, "prettyWithoutArrays");
function pretty(data) {
  if (Array.isArray(data)) {
    return data.map(prettyWithoutArrays);
  }
  return prettyWithoutArrays(data);
}
__name(pretty, "pretty");
class RPCLogger {
  constructor(_kind) {
    this._kind = _kind;
  }
  static {
    __name(this, "RPCLogger");
  }
  _totalIncoming = 0;
  _totalOutgoing = 0;
  _log(direction, totalLength, msgLength, req, initiator, str, data) {
    data = pretty(data);
    const colorTable = colorTables[initiator];
    const color = LOG_USE_COLORS ? colorTable[req % colorTable.length] : "#000000";
    let args = [`%c[${extensionHostKindToString(this._kind)}][${direction}]%c[${String(totalLength).padStart(7)}]%c[len: ${String(msgLength).padStart(5)}]%c${String(req).padStart(5)} - ${str}`, "color: darkgreen", "color: grey", "color: grey", `color: ${color}`];
    if (/\($/.test(str)) {
      args = args.concat(data);
      args.push(")");
    } else {
      args.push(data);
    }
    console.log.apply(console, args);
  }
  logIncoming(msgLength, req, initiator, str, data) {
    this._totalIncoming += msgLength;
    this._log("Ext \u2192 Win", this._totalIncoming, msgLength, req, initiator, str, data);
  }
  logOutgoing(msgLength, req, initiator, str, data) {
    this._totalOutgoing += msgLength;
    this._log("Win \u2192 Ext", this._totalOutgoing, msgLength, req, initiator, str, data);
  }
}
let TelemetryRPCLogger = class {
  constructor(_telemetryService) {
    this._telemetryService = _telemetryService;
  }
  static {
    __name(this, "TelemetryRPCLogger");
  }
  static isEnabled() {
    return Math.random() < 1e-4;
  }
  _pendingRequests = /* @__PURE__ */ new Map();
  logIncoming(msgLength, req, initiator, str) {
    if (initiator === RequestInitiator.LocalSide && /^receiveReply(Err)?:/.test(str)) {
      const requestStr = this._pendingRequests.get(req) ?? "unknown_reply";
      this._pendingRequests.delete(req);
      this._telemetryService.publicLog2("extensionhost.incoming", {
        type: `${str} ${requestStr}`,
        length: msgLength
      });
    }
    if (initiator === RequestInitiator.OtherSide && /^receiveRequest /.test(str)) {
      this._telemetryService.publicLog2("extensionhost.incoming", {
        type: `${str}`,
        length: msgLength
      });
    }
  }
  logOutgoing(msgLength, req, initiator, str) {
    if (initiator === RequestInitiator.LocalSide && str.startsWith("request: ")) {
      this._pendingRequests.set(req, str);
      this._telemetryService.publicLog2("extensionhost.outgoing", {
        type: str,
        length: msgLength
      });
    }
  }
};
TelemetryRPCLogger = __decorateClass([
  __decorateParam(0, ITelemetryService)
], TelemetryRPCLogger);
const providers = [];
function registerLatencyTestProvider(provider) {
  providers.push(provider);
  return {
    dispose: /* @__PURE__ */ __name(() => {
      for (let i = 0; i < providers.length; i++) {
        if (providers[i] === provider) {
          providers.splice(i, 1);
          return;
        }
      }
    }, "dispose")
  };
}
__name(registerLatencyTestProvider, "registerLatencyTestProvider");
function getLatencyTestProviders() {
  return providers.slice(0);
}
__name(getLatencyTestProviders, "getLatencyTestProviders");
registerAction2(class MeasureExtHostLatencyAction extends Action2 {
  static {
    __name(this, "MeasureExtHostLatencyAction");
  }
  constructor() {
    super({
      id: "editor.action.measureExtHostLatency",
      title: nls.localize2("measureExtHostLatency", "Measure Extension Host Latency"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const measurements = await Promise.all(getLatencyTestProviders().map((provider) => provider.measure()));
    editorService.openEditor({ resource: void 0, contents: measurements.map(MeasureExtHostLatencyAction._print).join("\n\n"), options: { pinned: true } });
  }
  static _print(m) {
    if (!m) {
      return "";
    }
    return `${m.remoteAuthority ? `Authority: ${m.remoteAuthority}
` : ``}Roundtrip latency: ${m.latency.toFixed(3)}ms
Up: ${MeasureExtHostLatencyAction._printSpeed(m.up)}
Down: ${MeasureExtHostLatencyAction._printSpeed(m.down)}
`;
  }
  static _printSpeed(n) {
    if (n <= 1024) {
      return `${n} bps`;
    }
    if (n < 1024 * 1024) {
      return `${(n / 1024).toFixed(1)} kbps`;
    }
    return `${(n / 1024 / 1024).toFixed(1)} Mbps`;
  }
});
export {
  ExtensionHostManager,
  friendlyExtHostName
};
//# sourceMappingURL=extensionHostManager.js.map
