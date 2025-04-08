var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { localize } from "../../../../nls.js";
import { ICrossVersionSerializedTerminalState, IPtyHostController, ISerializedTerminalState, ITerminalLogService } from "../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, StatusbarAlignment } from "../../../services/statusbar/browser/statusbar.js";
import { TerminalContribCommandId } from "../terminalContribExports.js";
class BaseTerminalBackend extends Disposable {
  constructor(_ptyHostController, _logService, historyService, configurationResolverService, statusBarService, _workspaceContextService) {
    super();
    this._ptyHostController = _ptyHostController;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
    let unresponsiveStatusBarEntry;
    let statusBarAccessor;
    let hasStarted = false;
    this._register(this._ptyHostController.onPtyHostExit(() => {
      this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
    }));
    this._register(this.onPtyHostConnected(() => hasStarted = true));
    this._register(this._ptyHostController.onPtyHostStart(() => {
      this._logService.debug(`The terminal's pty host process is starting`);
      if (hasStarted) {
        this._logService.trace("IPtyHostController#onPtyHostRestart");
        this._onPtyHostRestart.fire();
      }
      statusBarAccessor?.dispose();
      this._isPtyHostUnresponsive = false;
    }));
    this._register(this._ptyHostController.onPtyHostUnresponsive(() => {
      statusBarAccessor?.dispose();
      if (!unresponsiveStatusBarEntry) {
        unresponsiveStatusBarEntry = {
          name: localize("ptyHostStatus", "Pty Host Status"),
          text: `$(debug-disconnect) ${localize("ptyHostStatus.short", "Pty Host")}`,
          tooltip: localize("nonResponsivePtyHost", "The connection to the terminal's pty host process is unresponsive, terminals may stop working. Click to manually restart the pty host."),
          ariaLabel: localize("ptyHostStatus.ariaLabel", "Pty Host is unresponsive"),
          command: TerminalContribCommandId.DeveloperRestartPtyHost,
          kind: "warning"
        };
      }
      statusBarAccessor = statusBarService.addEntry(unresponsiveStatusBarEntry, "ptyHostStatus", StatusbarAlignment.LEFT);
      this._isPtyHostUnresponsive = true;
      this._onPtyHostUnresponsive.fire();
    }));
    this._register(this._ptyHostController.onPtyHostResponsive(() => {
      if (!this._isPtyHostUnresponsive) {
        return;
      }
      this._logService.info("The pty host became responsive again");
      statusBarAccessor?.dispose();
      this._isPtyHostUnresponsive = false;
      this._onPtyHostResponsive.fire();
    }));
    this._register(this._ptyHostController.onPtyHostRequestResolveVariables(async (e) => {
      if (e.workspaceId !== this._workspaceContextService.getWorkspace().id) {
        return;
      }
      const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.file);
      const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
      const resolveCalls = e.originalText.map((t) => {
        return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t);
      });
      const result = await Promise.all(resolveCalls);
      this._ptyHostController.acceptPtyHostResolvedVariables(e.requestId, result);
    }));
  }
  static {
    __name(this, "BaseTerminalBackend");
  }
  _isPtyHostUnresponsive = false;
  get isResponsive() {
    return !this._isPtyHostUnresponsive;
  }
  _onPtyHostConnected = this._register(new Emitter());
  onPtyHostConnected = this._onPtyHostConnected.event;
  _onPtyHostRestart = this._register(new Emitter());
  onPtyHostRestart = this._onPtyHostRestart.event;
  _onPtyHostUnresponsive = this._register(new Emitter());
  onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
  _onPtyHostResponsive = this._register(new Emitter());
  onPtyHostResponsive = this._onPtyHostResponsive.event;
  restartPtyHost() {
    this._ptyHostController.restartPtyHost();
  }
  _deserializeTerminalState(serializedState) {
    if (serializedState === void 0) {
      return void 0;
    }
    const parsedUnknown = JSON.parse(serializedState);
    if (!("version" in parsedUnknown) || !("state" in parsedUnknown) || !Array.isArray(parsedUnknown.state)) {
      this._logService.warn("Could not revive serialized processes, wrong format", parsedUnknown);
      return void 0;
    }
    const parsedCrossVersion = parsedUnknown;
    if (parsedCrossVersion.version !== 1) {
      this._logService.warn(`Could not revive serialized processes, wrong version "${parsedCrossVersion.version}"`, parsedCrossVersion);
      return void 0;
    }
    return parsedCrossVersion.state;
  }
  _getWorkspaceId() {
    return this._workspaceContextService.getWorkspace().id;
  }
}
export {
  BaseTerminalBackend
};
//# sourceMappingURL=baseTerminalBackend.js.map
