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
var MeteredConnectionStatusContribution_1;
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IMeteredConnectionService } from "../../../../platform/meteredConnection/common/meteredConnection.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
let MeteredConnectionStatusContribution = class MeteredConnectionStatusContribution2 extends Disposable {
  static {
    __name(this, "MeteredConnectionStatusContribution");
  }
  static {
    MeteredConnectionStatusContribution_1 = this;
  }
  static {
    this.ID = "workbench.contrib.meteredConnectionStatus";
  }
  constructor(meteredConnectionService, statusbarService) {
    super();
    this.meteredConnectionService = meteredConnectionService;
    this.statusbarService = statusbarService;
    this.statusBarEntry = this._register(new MutableDisposable());
    this.updateStatusBarEntry(this.meteredConnectionService.isConnectionMetered);
    this._register(this.meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
      this.updateStatusBarEntry(isMetered);
    }));
  }
  updateStatusBarEntry(isMetered) {
    if (isMetered) {
      if (!this.statusBarEntry.value) {
        this.statusBarEntry.value = this.statusbarService.addEntry(
          this.getStatusBarEntry(),
          MeteredConnectionStatusContribution_1.ID,
          1,
          -Number.MAX_VALUE
          // Show at the far right
        );
      }
    } else {
      this.statusBarEntry.clear();
    }
  }
  getStatusBarEntry() {
    return {
      name: localize("status.meteredConnection", "Metered Connection"),
      text: "$(radio-tower)",
      ariaLabel: localize("status.meteredConnection.ariaLabel", "Metered Connection Enabled"),
      tooltip: localize("status.meteredConnection.tooltip", "Metered connection enabled. Some automatic features like extension updates, Settings Sync, and automatic Git operations are paused to reduce data usage."),
      command: {
        id: "workbench.action.configureMeteredConnection",
        title: localize("status.meteredConnection.configure", "Configure")
      },
      showInAllWindows: true
    };
  }
};
MeteredConnectionStatusContribution = MeteredConnectionStatusContribution_1 = __decorate([
  __param(0, IMeteredConnectionService),
  __param(1, IStatusbarService)
], MeteredConnectionStatusContribution);
export {
  MeteredConnectionStatusContribution
};
//# sourceMappingURL=meteredConnectionStatus.js.map
