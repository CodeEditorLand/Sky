var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IDebugService } from "./debug.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
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
let DebugLifecycle = class DebugLifecycle2 {
  static {
    __name(this, "DebugLifecycle");
  }
  constructor(lifecycleService, debugService, configurationService, dialogService) {
    this.debugService = debugService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.disposable = lifecycleService.onBeforeShutdown(async (e) => e.veto(this.shouldVetoShutdown(e.reason), "veto.debug"));
  }
  shouldVetoShutdown(_reason) {
    const rootSessions = this.debugService.getModel().getSessions().filter((s) => s.parentSession === void 0);
    if (rootSessions.length === 0) {
      return false;
    }
    const shouldConfirmOnExit = this.configurationService.getValue("debug").confirmOnExit;
    if (shouldConfirmOnExit === "never") {
      return false;
    }
    return this.showWindowCloseConfirmation(rootSessions.length);
  }
  dispose() {
    return this.disposable.dispose();
  }
  async showWindowCloseConfirmation(numSessions) {
    let message;
    if (numSessions === 1) {
      message = nls.localize("debug.debugSessionCloseConfirmationSingular", "There is an active debug session, are you sure you want to stop it?");
    } else {
      message = nls.localize("debug.debugSessionCloseConfirmationPlural", "There are active debug sessions, are you sure you want to stop them?");
    }
    const res = await this.dialogService.confirm({
      message,
      type: "warning",
      primaryButton: nls.localize({ key: "debug.stop", comment: ["&& denotes a mnemonic"] }, "&&Stop Debugging")
    });
    return !res.confirmed;
  }
};
DebugLifecycle = __decorate([
  __param(0, ILifecycleService),
  __param(1, IDebugService),
  __param(2, IConfigurationService),
  __param(3, IDialogService)
], DebugLifecycle);
export {
  DebugLifecycle
};
//# sourceMappingURL=debugLifecycle.js.map
