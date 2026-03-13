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
var UpdateStatusBarContribution_1;
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { IStatusbarService, ShowTooltipCommand } from "../../../services/statusbar/browser/statusbar.js";
import { computeProgressPercent, formatBytes } from "../common/updateUtils.js";
import "./media/updateStatusBarEntry.css";
import { UpdateTooltip } from "./updateTooltip.js";
let UpdateStatusBarContribution = class UpdateStatusBarContribution2 extends Disposable {
  static {
    __name(this, "UpdateStatusBarContribution");
  }
  static {
    UpdateStatusBarContribution_1 = this;
  }
  static {
    this.actionableStates = [
      "available for download",
      "downloaded",
      "ready"
      /* StateType.Ready */
    ];
  }
  constructor(configurationService, instantiationService, statusbarService, updateService) {
    super();
    this.configurationService = configurationService;
    this.statusbarService = statusbarService;
    this.accessor = this._register(new MutableDisposable());
    if (isWeb) {
      return;
    }
    this.tooltip = this._register(instantiationService.createInstance(UpdateTooltip));
    this._register(updateService.onStateChange(this.onStateChange.bind(this)));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("update.statusBar") || e.affectsConfiguration("update.titleBar")) {
        this.onStateChange(updateService.state);
      }
    }));
    this.onStateChange(updateService.state);
  }
  onStateChange(state) {
    const titleBarMode = this.configurationService.getValue("update.titleBar");
    if (titleBarMode !== "none") {
      this.accessor.clear();
      return;
    }
    const mode = this.configurationService.getValue("update.statusBar");
    if (mode === "hidden" || mode === "actionable" && !UpdateStatusBarContribution_1.actionableStates.includes(state.type)) {
      this.accessor.clear();
      return;
    }
    if (this.lastStateType !== state.type) {
      this.accessor.clear();
      this.lastStateType = state.type;
    }
    switch (state.type) {
      case "checking for updates":
        this.updateEntry(localize("updateStatus.checkingForUpdates", "$(loading~spin) Checking for updates..."), localize("updateStatus.checkingForUpdatesAria", "Checking for updates"), ShowTooltipCommand);
        break;
      case "available for download":
        this.updateEntry(localize("updateStatus.updateAvailableStatus", "$(circle-filled) Update available, click to download."), localize("updateStatus.updateAvailableAria", "Update available, click to download."), "update.downloadNow");
        break;
      case "downloading":
        this.updateEntry(this.getDownloadingText(state), localize("updateStatus.downloadingUpdateAria", "Downloading update"), ShowTooltipCommand);
        break;
      case "downloaded":
        this.updateEntry(localize("updateStatus.updateReadyStatus", "$(circle-filled) Update downloaded, click to install."), localize("updateStatus.updateReadyAria", "Update downloaded, click to install."), "update.install");
        break;
      case "updating":
        this.updateEntry(this.getUpdatingText(state), void 0, ShowTooltipCommand);
        break;
      case "ready":
        this.updateEntry(localize("updateStatus.restartToUpdateStatus", "$(circle-filled) Update is ready, click to restart."), localize("updateStatus.restartToUpdateAria", "Update is ready, click to restart."), "update.restart");
        break;
      case "overwriting":
        this.updateEntry(localize("updateStatus.downloadingNewerUpdateStatus", "$(loading~spin) Downloading update..."), localize("updateStatus.downloadingNewerUpdateAria", "Downloading a newer update"), ShowTooltipCommand);
        break;
      default:
        this.accessor.clear();
        break;
    }
  }
  updateEntry(text, ariaLabel, command) {
    const entry = {
      text,
      ariaLabel: ariaLabel ?? text,
      name: localize("updateStatus", "Update Status"),
      tooltip: this.tooltip?.domNode,
      command
    };
    if (this.accessor.value) {
      this.accessor.value.update(entry);
    } else {
      this.accessor.value = this.statusbarService.addEntry(entry, "status.update", 0, -Number.MAX_VALUE);
    }
  }
  getDownloadingText({ downloadedBytes, totalBytes }) {
    if (downloadedBytes !== void 0 && totalBytes !== void 0 && totalBytes > 0) {
      const percent = computeProgressPercent(downloadedBytes, totalBytes) ?? 0;
      return localize("updateStatus.downloadUpdateProgressStatus", "$(loading~spin) Downloading update: {0} / {1} \u2022 {2}%", formatBytes(downloadedBytes), formatBytes(totalBytes), percent);
    } else {
      return localize("updateStatus.downloadUpdateStatus", "$(loading~spin) Downloading update...");
    }
  }
  getUpdatingText({ currentProgress, maxProgress }) {
    const percentage = computeProgressPercent(currentProgress, maxProgress);
    if (percentage !== void 0) {
      return localize("updateStatus.installingUpdateProgressStatus", "$(loading~spin) Installing update: {0}%", percentage);
    } else {
      return localize("updateStatus.installingUpdateStatus", "$(loading~spin) Installing update...");
    }
  }
};
UpdateStatusBarContribution = UpdateStatusBarContribution_1 = __decorate([
  __param(0, IConfigurationService),
  __param(1, IInstantiationService),
  __param(2, IStatusbarService),
  __param(3, IUpdateService)
], UpdateStatusBarContribution);
export {
  UpdateStatusBarContribution
};
//# sourceMappingURL=updateStatusBarEntry.js.map
