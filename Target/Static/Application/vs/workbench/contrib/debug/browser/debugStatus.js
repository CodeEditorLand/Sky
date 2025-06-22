var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { dispose } from "../../../../base/common/lifecycle.js";
import { IDebugService } from "../common/debug.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
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
let DebugStatusContribution = class DebugStatusContribution2 {
  static {
    __name(this, "DebugStatusContribution");
  }
  constructor(statusBarService, debugService, configurationService) {
    this.statusBarService = statusBarService;
    this.debugService = debugService;
    this.toDispose = [];
    const addStatusBarEntry = /* @__PURE__ */ __name(() => {
      this.entryAccessor = this.statusBarService.addEntry(
        this.entry,
        "status.debug",
        0,
        30
        /* Low Priority */
      );
    }, "addStatusBarEntry");
    const setShowInStatusBar = /* @__PURE__ */ __name(() => {
      this.showInStatusBar = configurationService.getValue("debug").showInStatusBar;
      if (this.showInStatusBar === "always" && !this.entryAccessor) {
        addStatusBarEntry();
      }
    }, "setShowInStatusBar");
    setShowInStatusBar();
    this.toDispose.push(this.debugService.onDidChangeState((state) => {
      if (state !== 0 && this.showInStatusBar === "onFirstSessionStart" && !this.entryAccessor) {
        addStatusBarEntry();
      }
    }));
    this.toDispose.push(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.showInStatusBar")) {
        setShowInStatusBar();
        if (this.entryAccessor && this.showInStatusBar === "never") {
          this.entryAccessor.dispose();
          this.entryAccessor = void 0;
        }
      }
    }));
    this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration((e) => {
      this.entryAccessor?.update(this.entry);
    }));
  }
  get entry() {
    let text = "";
    const manager = this.debugService.getConfigurationManager();
    const name = manager.selectedConfiguration.name || "";
    const nameAndLaunchPresent = name && manager.selectedConfiguration.launch;
    if (nameAndLaunchPresent) {
      text = manager.getLaunches().length > 1 ? `${name} (${manager.selectedConfiguration.launch.name})` : name;
    }
    return {
      name: nls.localize("status.debug", "Debug"),
      text: "$(debug-alt-small) " + text,
      ariaLabel: nls.localize("debugTarget", "Debug: {0}", text),
      tooltip: nls.localize("selectAndStartDebug", "Select and Start Debug Configuration"),
      command: "workbench.action.debug.selectandstart"
    };
  }
  dispose() {
    this.entryAccessor?.dispose();
    dispose(this.toDispose);
  }
};
DebugStatusContribution = __decorate([
  __param(0, IStatusbarService),
  __param(1, IDebugService),
  __param(2, IConfigurationService)
], DebugStatusContribution);
export {
  DebugStatusContribution
};
//# sourceMappingURL=debugStatus.js.map
