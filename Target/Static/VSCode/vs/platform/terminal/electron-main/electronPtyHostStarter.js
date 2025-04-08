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
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { parsePtyHostDebugPort } from "../../environment/node/environmentService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { NullTelemetryService } from "../../telemetry/common/telemetryUtils.js";
import { IReconnectConstants, TerminalSettingId } from "../common/terminal.js";
import { IPtyHostConnection, IPtyHostStarter } from "../node/ptyHost.js";
import { UtilityProcess } from "../../utilityProcess/electron-main/utilityProcess.js";
import { Client as MessagePortClient } from "../../../base/parts/ipc/electron-main/ipc.mp.js";
import { IpcMainEvent } from "electron";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { Emitter } from "../../../base/common/event.js";
import { deepClone } from "../../../base/common/objects.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { Schemas } from "../../../base/common/network.js";
let ElectronPtyHostStarter = class extends Disposable {
  constructor(_reconnectConstants, _configurationService, _environmentMainService, _lifecycleMainService, _logService) {
    super();
    this._reconnectConstants = _reconnectConstants;
    this._configurationService = _configurationService;
    this._environmentMainService = _environmentMainService;
    this._lifecycleMainService = _lifecycleMainService;
    this._logService = _logService;
    this._register(this._lifecycleMainService.onWillShutdown(() => this._onWillShutdown.fire()));
    validatedIpcMain.on("vscode:createPtyHostMessageChannel", (e, nonce) => this._onWindowConnection(e, nonce));
    this._register(toDisposable(() => {
      validatedIpcMain.removeHandler("vscode:createPtyHostMessageChannel");
    }));
  }
  static {
    __name(this, "ElectronPtyHostStarter");
  }
  utilityProcess = void 0;
  _onRequestConnection = new Emitter();
  onRequestConnection = this._onRequestConnection.event;
  _onWillShutdown = new Emitter();
  onWillShutdown = this._onWillShutdown.event;
  start() {
    this.utilityProcess = new UtilityProcess(this._logService, NullTelemetryService, this._lifecycleMainService);
    const inspectParams = parsePtyHostDebugPort(this._environmentMainService.args, this._environmentMainService.isBuilt);
    const execArgv = inspectParams.port ? [
      "--nolazy",
      `--inspect${inspectParams.break ? "-brk" : ""}=${inspectParams.port}`
    ] : void 0;
    this.utilityProcess.start({
      type: "ptyHost",
      entryPoint: "vs/platform/terminal/node/ptyHostMain",
      execArgv,
      args: ["--logsPath", this._environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath],
      env: this._createPtyHostConfiguration()
    });
    const port = this.utilityProcess.connect();
    const client = new MessagePortClient(port, "ptyHost");
    const store = new DisposableStore();
    store.add(client);
    store.add(toDisposable(() => {
      this.utilityProcess?.kill();
      this.utilityProcess?.dispose();
      this.utilityProcess = void 0;
    }));
    return {
      client,
      store,
      onDidProcessExit: this.utilityProcess.onExit
    };
  }
  _createPtyHostConfiguration() {
    this._environmentMainService.unsetSnapExportedVariables();
    const config = {
      ...deepClone(process.env),
      VSCODE_ESM_ENTRYPOINT: "vs/platform/terminal/node/ptyHostMain",
      VSCODE_PIPE_LOGGING: "true",
      VSCODE_VERBOSE_LOGGING: "true",
      // transmit console logs from server to client,
      VSCODE_RECONNECT_GRACE_TIME: String(this._reconnectConstants.graceTime),
      VSCODE_RECONNECT_SHORT_GRACE_TIME: String(this._reconnectConstants.shortGraceTime),
      VSCODE_RECONNECT_SCROLLBACK: String(this._reconnectConstants.scrollback)
    };
    const simulatedLatency = this._configurationService.getValue(TerminalSettingId.DeveloperPtyHostLatency);
    if (simulatedLatency && typeof simulatedLatency === "number") {
      config.VSCODE_LATENCY = String(simulatedLatency);
    }
    const startupDelay = this._configurationService.getValue(TerminalSettingId.DeveloperPtyHostStartupDelay);
    if (startupDelay && typeof startupDelay === "number") {
      config.VSCODE_STARTUP_DELAY = String(startupDelay);
    }
    this._environmentMainService.restoreSnapExportedVariables();
    return config;
  }
  _onWindowConnection(e, nonce) {
    this._onRequestConnection.fire();
    const port = this.utilityProcess.connect();
    if (e.sender.isDestroyed()) {
      port.close();
      return;
    }
    e.sender.postMessage("vscode:createPtyHostMessageChannelResult", nonce, [port]);
  }
};
ElectronPtyHostStarter = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEnvironmentMainService),
  __decorateParam(3, ILifecycleMainService),
  __decorateParam(4, ILogService)
], ElectronPtyHostStarter);
export {
  ElectronPtyHostStarter
};
//# sourceMappingURL=electronPtyHostStarter.js.map
