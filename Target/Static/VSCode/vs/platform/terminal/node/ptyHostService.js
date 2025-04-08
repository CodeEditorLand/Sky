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
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { IProcessEnvironment, OS, OperatingSystem, isWindows } from "../../../base/common/platform.js";
import { ProxyChannel } from "../../../base/parts/ipc/common/ipc.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ILogService, ILoggerService, LogLevel } from "../../log/common/log.js";
import { RemoteLoggerChannelClient } from "../../log/common/logIpc.js";
import { getResolvedShellEnv } from "../../shell/node/shellEnv.js";
import { IPtyHostProcessReplayEvent } from "../common/capabilities/capabilities.js";
import { RequestStore } from "../common/requestStore.js";
import { HeartbeatConstants, IHeartbeatService, IProcessDataEvent, IProcessProperty, IProcessPropertyMap, IProcessReadyEvent, IPtyHostLatencyMeasurement, IPtyHostService, IPtyService, IRequestResolveVariablesEvent, ISerializedTerminalState, IShellLaunchConfig, ITerminalLaunchError, ITerminalProcessOptions, ITerminalProfile, ITerminalsLayoutInfo, ProcessPropertyType, TerminalIcon, TerminalIpcChannels, TerminalSettingId, TitleEventSource } from "../common/terminal.js";
import { registerTerminalPlatformConfiguration } from "../common/terminalPlatformConfiguration.js";
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from "../common/terminalProcess.js";
import { IPtyHostConnection, IPtyHostStarter } from "./ptyHost.js";
import { detectAvailableProfiles } from "./terminalProfiles.js";
import * as performance from "../../../base/common/performance.js";
import { getSystemShell } from "../../../base/node/shell.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MaxRestarts"] = 5] = "MaxRestarts";
  return Constants2;
})(Constants || {});
let PtyHostService = class extends Disposable {
  constructor(_ptyHostStarter, _configurationService, _logService, _loggerService) {
    super();
    this._ptyHostStarter = _ptyHostStarter;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._loggerService = _loggerService;
    registerTerminalPlatformConfiguration();
    this._register(this._ptyHostStarter);
    this._register(toDisposable(() => this._disposePtyHost()));
    this._resolveVariablesRequestStore = this._register(new RequestStore(void 0, this._logService));
    this._register(this._resolveVariablesRequestStore.onCreateRequest(this._onPtyHostRequestResolveVariables.fire, this._onPtyHostRequestResolveVariables));
    if (this._ptyHostStarter.onRequestConnection) {
      this._register(Event.once(this._ptyHostStarter.onRequestConnection)(() => this._ensurePtyHost()));
    }
    if (this._ptyHostStarter.onWillShutdown) {
      this._register(this._ptyHostStarter.onWillShutdown(() => this._wasQuitRequested = true));
    }
  }
  static {
    __name(this, "PtyHostService");
  }
  __connection;
  // ProxyChannel is not used here because events get lost when forwarding across multiple proxies
  __proxy;
  get _connection() {
    this._ensurePtyHost();
    return this.__connection;
  }
  get _proxy() {
    this._ensurePtyHost();
    return this.__proxy;
  }
  /**
   * Get the proxy if it exists, otherwise undefined. This is used when calls are not needed to be
   * passed through to the pty host if it has not yet been spawned.
   */
  get _optionalProxy() {
    return this.__proxy;
  }
  _ensurePtyHost() {
    if (!this.__connection) {
      this._startPtyHost();
    }
  }
  _resolveVariablesRequestStore;
  _wasQuitRequested = false;
  _restartCount = 0;
  _isResponsive = true;
  _heartbeatFirstTimeout;
  _heartbeatSecondTimeout;
  _onPtyHostExit = this._register(new Emitter());
  onPtyHostExit = this._onPtyHostExit.event;
  _onPtyHostStart = this._register(new Emitter());
  onPtyHostStart = this._onPtyHostStart.event;
  _onPtyHostUnresponsive = this._register(new Emitter());
  onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
  _onPtyHostResponsive = this._register(new Emitter());
  onPtyHostResponsive = this._onPtyHostResponsive.event;
  _onPtyHostRequestResolveVariables = this._register(new Emitter());
  onPtyHostRequestResolveVariables = this._onPtyHostRequestResolveVariables.event;
  _onProcessData = this._register(new Emitter());
  onProcessData = this._onProcessData.event;
  _onProcessReady = this._register(new Emitter());
  onProcessReady = this._onProcessReady.event;
  _onProcessReplay = this._register(new Emitter());
  onProcessReplay = this._onProcessReplay.event;
  _onProcessOrphanQuestion = this._register(new Emitter());
  onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
  _onDidRequestDetach = this._register(new Emitter());
  onDidRequestDetach = this._onDidRequestDetach.event;
  _onDidChangeProperty = this._register(new Emitter());
  onDidChangeProperty = this._onDidChangeProperty.event;
  _onProcessExit = this._register(new Emitter());
  onProcessExit = this._onProcessExit.event;
  get _ignoreProcessNames() {
    return this._configurationService.getValue(TerminalSettingId.IgnoreProcessNames);
  }
  async _refreshIgnoreProcessNames() {
    return this._optionalProxy?.refreshIgnoreProcessNames?.(this._ignoreProcessNames);
  }
  async _resolveShellEnv() {
    if (isWindows) {
      return process.env;
    }
    try {
      return await getResolvedShellEnv(this._configurationService, this._logService, { _: [] }, process.env);
    } catch (error) {
      this._logService.error("ptyHost was unable to resolve shell environment", error);
      return {};
    }
  }
  _startPtyHost() {
    const connection = this._ptyHostStarter.start();
    const client = connection.client;
    if (this._logService.getLevel() === LogLevel.Trace) {
      this._logService.trace("PtyHostService#_startPtyHost", new Error().stack?.replace(/^Error/, ""));
    }
    const heartbeatService = ProxyChannel.toService(client.getChannel(TerminalIpcChannels.Heartbeat));
    heartbeatService.onBeat(() => this._handleHeartbeat());
    this._handleHeartbeat(true);
    this._register(connection.onDidProcessExit((e) => {
      this._onPtyHostExit.fire(e.code);
      if (!this._wasQuitRequested && !this._store.isDisposed) {
        if (this._restartCount <= 5 /* MaxRestarts */) {
          this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}`);
          this._restartCount++;
          this.restartPtyHost();
        } else {
          this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
        }
      }
    }));
    const proxy = ProxyChannel.toService(client.getChannel(TerminalIpcChannels.PtyHost));
    this._register(proxy.onProcessData((e) => this._onProcessData.fire(e)));
    this._register(proxy.onProcessReady((e) => this._onProcessReady.fire(e)));
    this._register(proxy.onProcessExit((e) => this._onProcessExit.fire(e)));
    this._register(proxy.onDidChangeProperty((e) => this._onDidChangeProperty.fire(e)));
    this._register(proxy.onProcessReplay((e) => this._onProcessReplay.fire(e)));
    this._register(proxy.onProcessOrphanQuestion((e) => this._onProcessOrphanQuestion.fire(e)));
    this._register(proxy.onDidRequestDetach((e) => this._onDidRequestDetach.fire(e)));
    this._register(new RemoteLoggerChannelClient(this._loggerService, client.getChannel(TerminalIpcChannels.Logger)));
    this.__connection = connection;
    this.__proxy = proxy;
    this._onPtyHostStart.fire();
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(TerminalSettingId.IgnoreProcessNames)) {
        await this._refreshIgnoreProcessNames();
      }
    }));
    this._refreshIgnoreProcessNames();
    return [connection, proxy];
  }
  async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName) {
    const timeout = setTimeout(() => this._handleUnresponsiveCreateProcess(), HeartbeatConstants.CreateProcessTimeout);
    const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName);
    clearTimeout(timeout);
    return id;
  }
  updateTitle(id, title, titleSource) {
    return this._proxy.updateTitle(id, title, titleSource);
  }
  updateIcon(id, userInitiated, icon, color) {
    return this._proxy.updateIcon(id, userInitiated, icon, color);
  }
  attachToProcess(id) {
    return this._proxy.attachToProcess(id);
  }
  detachFromProcess(id, forcePersist) {
    return this._proxy.detachFromProcess(id, forcePersist);
  }
  shutdownAll() {
    return this._proxy.shutdownAll();
  }
  listProcesses() {
    return this._proxy.listProcesses();
  }
  async getPerformanceMarks() {
    return this._optionalProxy?.getPerformanceMarks() ?? [];
  }
  async reduceConnectionGraceTime() {
    return this._optionalProxy?.reduceConnectionGraceTime();
  }
  start(id) {
    return this._proxy.start(id);
  }
  shutdown(id, immediate) {
    return this._proxy.shutdown(id, immediate);
  }
  input(id, data) {
    return this._proxy.input(id, data);
  }
  processBinary(id, data) {
    return this._proxy.processBinary(id, data);
  }
  resize(id, cols, rows) {
    return this._proxy.resize(id, cols, rows);
  }
  clearBuffer(id) {
    return this._proxy.clearBuffer(id);
  }
  acknowledgeDataEvent(id, charCount) {
    return this._proxy.acknowledgeDataEvent(id, charCount);
  }
  setUnicodeVersion(id, version) {
    return this._proxy.setUnicodeVersion(id, version);
  }
  getInitialCwd(id) {
    return this._proxy.getInitialCwd(id);
  }
  getCwd(id) {
    return this._proxy.getCwd(id);
  }
  async getLatency() {
    const sw = new StopWatch();
    const results = await this._proxy.getLatency();
    sw.stop();
    return [
      {
        label: "ptyhostservice<->ptyhost",
        latency: sw.elapsed()
      },
      ...results
    ];
  }
  orphanQuestionReply(id) {
    return this._proxy.orphanQuestionReply(id);
  }
  installAutoReply(match, reply) {
    return this._proxy.installAutoReply(match, reply);
  }
  uninstallAllAutoReplies() {
    return this._proxy.uninstallAllAutoReplies();
  }
  getDefaultSystemShell(osOverride) {
    return this._optionalProxy?.getDefaultSystemShell(osOverride) ?? getSystemShell(osOverride ?? OS, process.env);
  }
  async getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles = false) {
    const shellEnv = await this._resolveShellEnv();
    return detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, this._configurationService, shellEnv, void 0, this._logService, this._resolveVariables.bind(this, workspaceId));
  }
  async getEnvironment() {
    if (!this.__proxy) {
      return { ...process.env };
    }
    return this._proxy.getEnvironment();
  }
  getWslPath(original, direction) {
    return this._proxy.getWslPath(original, direction);
  }
  getRevivedPtyNewId(workspaceId, id) {
    return this._proxy.getRevivedPtyNewId(workspaceId, id);
  }
  setTerminalLayoutInfo(args) {
    return this._proxy.setTerminalLayoutInfo(args);
  }
  async getTerminalLayoutInfo(args) {
    return this._optionalProxy?.getTerminalLayoutInfo(args);
  }
  async requestDetachInstance(workspaceId, instanceId) {
    return this._proxy.requestDetachInstance(workspaceId, instanceId);
  }
  async acceptDetachInstanceReply(requestId, persistentProcessId) {
    return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
  }
  async freePortKillProcess(port) {
    if (!this._proxy.freePortKillProcess) {
      throw new Error("freePortKillProcess does not exist on the pty proxy");
    }
    return this._proxy.freePortKillProcess(port);
  }
  async serializeTerminalState(ids) {
    return this._proxy.serializeTerminalState(ids);
  }
  async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
    return this._proxy.reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate);
  }
  async refreshProperty(id, property) {
    return this._proxy.refreshProperty(id, property);
  }
  async updateProperty(id, property, value) {
    return this._proxy.updateProperty(id, property, value);
  }
  async restartPtyHost() {
    this._disposePtyHost();
    this._isResponsive = true;
    this._startPtyHost();
  }
  _disposePtyHost() {
    this._proxy.shutdownAll();
    this._connection.store.dispose();
  }
  _handleHeartbeat(isConnecting) {
    this._clearHeartbeatTimeouts();
    this._heartbeatFirstTimeout = setTimeout(() => this._handleHeartbeatFirstTimeout(), isConnecting ? HeartbeatConstants.ConnectingBeatInterval : HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier);
    if (!this._isResponsive) {
      this._isResponsive = true;
      this._onPtyHostResponsive.fire();
    }
  }
  _handleHeartbeatFirstTimeout() {
    this._logService.warn(`No ptyHost heartbeat after ${HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier / 1e3} seconds`);
    this._heartbeatFirstTimeout = void 0;
    this._heartbeatSecondTimeout = setTimeout(() => this._handleHeartbeatSecondTimeout(), HeartbeatConstants.BeatInterval * HeartbeatConstants.SecondWaitMultiplier);
  }
  _handleHeartbeatSecondTimeout() {
    this._logService.error(`No ptyHost heartbeat after ${(HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier + HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier) / 1e3} seconds`);
    this._heartbeatSecondTimeout = void 0;
    if (this._isResponsive) {
      this._isResponsive = false;
      this._onPtyHostUnresponsive.fire();
    }
  }
  _handleUnresponsiveCreateProcess() {
    this._clearHeartbeatTimeouts();
    this._logService.error(`No ptyHost response to createProcess after ${HeartbeatConstants.CreateProcessTimeout / 1e3} seconds`);
    if (this._isResponsive) {
      this._isResponsive = false;
      this._onPtyHostUnresponsive.fire();
    }
  }
  _clearHeartbeatTimeouts() {
    if (this._heartbeatFirstTimeout) {
      clearTimeout(this._heartbeatFirstTimeout);
      this._heartbeatFirstTimeout = void 0;
    }
    if (this._heartbeatSecondTimeout) {
      clearTimeout(this._heartbeatSecondTimeout);
      this._heartbeatSecondTimeout = void 0;
    }
  }
  _resolveVariables(workspaceId, text) {
    return this._resolveVariablesRequestStore.createRequest({ workspaceId, originalText: text });
  }
  async acceptPtyHostResolvedVariables(requestId, resolved) {
    this._resolveVariablesRequestStore.acceptReply(requestId, resolved);
  }
};
PtyHostService = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILoggerService)
], PtyHostService);
export {
  PtyHostService
};
//# sourceMappingURL=ptyHostService.js.map
