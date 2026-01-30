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
import { Event } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { ITerminalService } from "../../contrib/terminal/browser/terminal.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { TerminalShellExecutionCommandLineConfidence } from "../common/extHostTypes.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
let MainThreadTerminalShellIntegration = class MainThreadTerminalShellIntegration2 extends Disposable {
  static {
    __name(this, "MainThreadTerminalShellIntegration");
  }
  constructor(extHostContext, _terminalService, workbenchEnvironmentService, _extensionService) {
    super();
    this._terminalService = _terminalService;
    this._extensionService = _extensionService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTerminalShellIntegration);
    const instanceDataListeners = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      for (const listener of instanceDataListeners.values()) {
        listener.dispose();
      }
    }));
    for (const terminal of this._terminalService.instances) {
      const cmdDetection = terminal.capabilities.get(
        2
        /* TerminalCapability.CommandDetection */
      );
      if (cmdDetection) {
        this._enableShellIntegration(terminal);
      }
    }
    const onDidAddCommandDetection = this._store.add(this._terminalService.createOnInstanceEvent((instance) => {
      return Event.map(instance.capabilities.onDidAddCommandDetectionCapability, () => instance);
    })).event;
    this._store.add(onDidAddCommandDetection((e) => this._enableShellIntegration(e)));
    const cwdChangeEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(0, (e) => e.onDidChangeCwd));
    this._store.add(cwdChangeEvent.event((e) => {
      this._proxy.$cwdChange(e.instance.instanceId, e.data);
    }));
    const envChangeEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(5, (e) => e.onDidChangeEnv));
    this._store.add(envChangeEvent.event((e) => {
      if (e.data.value && typeof e.data.value === "object") {
        const envValue = e.data.value;
        const keysArr = Object.keys(envValue);
        const valuesArr = Object.values(envValue);
        this._proxy.$shellEnvChange(e.instance.instanceId, keysArr, valuesArr, e.data.isTrusted);
      }
    }));
    const commandDetectionStartEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(2, (e) => e.onCommandExecuted));
    let currentCommand;
    this._store.add(commandDetectionStartEvent.event((e) => {
      if (e.data === currentCommand) {
        return;
      }
      currentCommand = e.data;
      const instanceId = e.instance.instanceId;
      this._proxy.$shellExecutionStart(instanceId, instanceSupportsExecuteCommandApi(e.instance), e.data.command, convertToExtHostCommandLineConfidence(e.data), e.data.isTrusted, e.data.cwd);
      instanceDataListeners.get(instanceId)?.dispose();
      instanceDataListeners.set(instanceId, Event.accumulate(e.instance.onData, 50, true, this._store)((events) => {
        this._proxy.$shellExecutionData(instanceId, events.join(""));
      }));
    }));
    const commandDetectionEndEvent = this._store.add(this._terminalService.createOnInstanceCapabilityEvent(2, (e) => e.onCommandFinished));
    this._store.add(commandDetectionEndEvent.event((e) => {
      currentCommand = void 0;
      const instanceId = e.instance.instanceId;
      instanceDataListeners.get(instanceId)?.dispose();
      this._proxy.$shellExecutionEnd(instanceId, e.data.command, convertToExtHostCommandLineConfidence(e.data), e.data.isTrusted, e.data.exitCode);
    }));
    this._store.add(this._terminalService.onDidDisposeInstance((e) => this._proxy.$closeTerminal(e.instanceId)));
  }
  $executeCommand(terminalId, commandLine) {
    this._terminalService.getInstanceFromId(terminalId)?.runCommand(commandLine, true);
  }
  _enableShellIntegration(instance) {
    this._extensionService.activateByEvent("onTerminalShellIntegration:*");
    if (instance.shellType) {
      this._extensionService.activateByEvent(`onTerminalShellIntegration:${instance.shellType}`);
    }
    this._proxy.$shellIntegrationChange(instance.instanceId, instanceSupportsExecuteCommandApi(instance));
    const cwdDetection = instance.capabilities.get(
      0
      /* TerminalCapability.CwdDetection */
    );
    if (cwdDetection) {
      this._proxy.$cwdChange(instance.instanceId, cwdDetection.getCwd());
    }
  }
};
MainThreadTerminalShellIntegration = __decorate([
  extHostNamedCustomer(MainContext.MainThreadTerminalShellIntegration),
  __param(1, ITerminalService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, IExtensionService)
], MainThreadTerminalShellIntegration);
function convertToExtHostCommandLineConfidence(command) {
  switch (command.commandLineConfidence) {
    case "high":
      return TerminalShellExecutionCommandLineConfidence.High;
    case "medium":
      return TerminalShellExecutionCommandLineConfidence.Medium;
    case "low":
    default:
      return TerminalShellExecutionCommandLineConfidence.Low;
  }
}
__name(convertToExtHostCommandLineConfidence, "convertToExtHostCommandLineConfidence");
function instanceSupportsExecuteCommandApi(instance) {
  return instance.shellLaunchConfig.type !== "Task";
}
__name(instanceSupportsExecuteCommandApi, "instanceSupportsExecuteCommandApi");
export {
  MainThreadTerminalShellIntegration
};
//# sourceMappingURL=mainThreadTerminalShellIntegration.js.map
