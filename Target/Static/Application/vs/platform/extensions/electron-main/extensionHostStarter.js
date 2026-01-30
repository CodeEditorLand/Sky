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
var ExtensionHostStarter_1;
import { Promises } from "../../../base/common/async.js";
import { canceled } from "../../../base/common/errors.js";
import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { WindowUtilityProcess } from "../../utilityProcess/electron-main/utilityProcess.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
let ExtensionHostStarter = class ExtensionHostStarter2 extends Disposable {
  static {
    __name(this, "ExtensionHostStarter");
  }
  static {
    ExtensionHostStarter_1 = this;
  }
  static {
    this._lastId = 0;
  }
  constructor(_logService, _lifecycleMainService, _windowsMainService, _telemetryService, _configurationService) {
    super();
    this._logService = _logService;
    this._lifecycleMainService = _lifecycleMainService;
    this._windowsMainService = _windowsMainService;
    this._telemetryService = _telemetryService;
    this._configurationService = _configurationService;
    this._extHosts = /* @__PURE__ */ new Map();
    this._shutdown = false;
    this._register(this._lifecycleMainService.onWillShutdown((e) => {
      this._shutdown = true;
      e.join("extHostStarter", this._waitForAllExit(6e3));
    }));
  }
  dispose() {
    super.dispose();
  }
  _getExtHost(id) {
    const extHostProcess = this._extHosts.get(id);
    if (!extHostProcess) {
      throw new Error(`Unknown extension host!`);
    }
    return extHostProcess;
  }
  onDynamicStdout(id) {
    return this._getExtHost(id).onStdout;
  }
  onDynamicStderr(id) {
    return this._getExtHost(id).onStderr;
  }
  onDynamicMessage(id) {
    return this._getExtHost(id).onMessage;
  }
  onDynamicExit(id) {
    return this._getExtHost(id).onExit;
  }
  async createExtensionHost() {
    if (this._shutdown) {
      throw canceled();
    }
    const id = String(++ExtensionHostStarter_1._lastId);
    const extHost = new WindowUtilityProcess(this._logService, this._windowsMainService, this._telemetryService, this._lifecycleMainService);
    this._extHosts.set(id, extHost);
    const disposable = extHost.onExit(({ pid, code, signal }) => {
      disposable.dispose();
      this._logService.info(`Extension host with pid ${pid} exited with code: ${code}, signal: ${signal}.`);
      setTimeout(() => {
        extHost.dispose();
        this._extHosts.delete(id);
      });
      setTimeout(() => {
        try {
          process.kill(pid, 0);
          this._logService.error(`Extension host with pid ${pid} still exists, forcefully killing it...`);
          process.kill(pid);
        } catch (er) {
        }
      }, 1e3);
    });
    return { id };
  }
  async start(id, opts) {
    if (this._shutdown) {
      throw canceled();
    }
    const extHost = this._getExtHost(id);
    const args = ["--skipWorkspaceStorageLock"];
    if (this._configurationService.getValue("extensions.supportNodeGlobalNavigator")) {
      args.push("--supportGlobalNavigator");
    }
    extHost.start({
      ...opts,
      type: "extensionHost",
      name: "extension-host",
      entryPoint: "vs/workbench/api/node/extensionHostProcess",
      args,
      execArgv: opts.execArgv,
      allowLoadingUnsignedLibraries: true,
      respondToAuthRequestsFromMainProcess: true,
      correlationId: id
    });
    const pid = await Event.toPromise(extHost.onSpawn);
    return { pid };
  }
  async enableInspectPort(id) {
    if (this._shutdown) {
      throw canceled();
    }
    const extHostProcess = this._extHosts.get(id);
    if (!extHostProcess) {
      return false;
    }
    return extHostProcess.enableInspectPort();
  }
  async kill(id) {
    if (this._shutdown) {
      throw canceled();
    }
    const extHostProcess = this._extHosts.get(id);
    if (!extHostProcess) {
      return;
    }
    extHostProcess.kill();
  }
  async _killAllNow() {
    for (const [, extHost] of this._extHosts) {
      extHost.kill();
    }
  }
  async _waitForAllExit(maxWaitTimeMs) {
    const exitPromises = [];
    for (const [, extHost] of this._extHosts) {
      exitPromises.push(extHost.waitForExit(maxWaitTimeMs));
    }
    return Promises.settled(exitPromises).then(() => {
    });
  }
};
ExtensionHostStarter = ExtensionHostStarter_1 = __decorate([
  __param(0, ILogService),
  __param(1, ILifecycleMainService),
  __param(2, IWindowsMainService),
  __param(3, ITelemetryService),
  __param(4, IConfigurationService)
], ExtensionHostStarter);
export {
  ExtensionHostStarter
};
//# sourceMappingURL=extensionHostStarter.js.map
