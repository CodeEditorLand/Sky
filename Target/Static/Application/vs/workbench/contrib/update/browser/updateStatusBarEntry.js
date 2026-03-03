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
var UpdateStatusBarEntryContribution_1;
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { toAction } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import * as nls from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IHoverService, nativeHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { IStatusbarService, ShowTooltipCommand } from "../../../services/statusbar/browser/statusbar.js";
import "./media/updateStatusBarEntry.css";
let UpdateStatusBarEntryContribution = class UpdateStatusBarEntryContribution2 extends Disposable {
  static {
    __name(this, "UpdateStatusBarEntryContribution");
  }
  static {
    UpdateStatusBarEntryContribution_1 = this;
  }
  static {
    this.NAME = nls.localize("updateStatus", "Update Status");
  }
  constructor(updateService, statusbarService, productService, commandService, hoverService, configurationService) {
    super();
    this.updateService = updateService;
    this.statusbarService = statusbarService;
    this.productService = productService;
    this.commandService = commandService;
    this.hoverService = hoverService;
    this.configurationService = configurationService;
    this.statusBarEntryAccessor = this._register(new MutableDisposable());
    if (isWeb) {
      return;
    }
    this._register(this.updateService.onStateChange((state) => this.onUpdateStateChange(state)));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("update.statusBar")) {
        this.onUpdateStateChange(this.updateService.state);
      }
    }));
    this.onUpdateStateChange(this.updateService.state);
  }
  onUpdateStateChange(state) {
    if (this.lastStateType !== state.type) {
      this.statusBarEntryAccessor.clear();
      this.lastStateType = state.type;
    }
    const statusBarMode = this.configurationService.getValue("update.statusBar");
    if (statusBarMode === "hidden") {
      this.statusBarEntryAccessor.clear();
      return;
    }
    const actionRequiredStates = [
      "available for download",
      "downloaded",
      "ready"
      /* StateType.Ready */
    ];
    if (statusBarMode === "actionable" && !actionRequiredStates.includes(state.type)) {
      this.statusBarEntryAccessor.clear();
      return;
    }
    switch (state.type) {
      case "uninitialized":
      case "idle":
      case "disabled":
        this.statusBarEntryAccessor.clear();
        break;
      case "checking for updates":
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: nls.localize("updateStatus.checkingForUpdates", "$(sync~spin) Checking for updates..."),
          ariaLabel: nls.localize("updateStatus.checkingForUpdatesAria", "Checking for updates"),
          tooltip: this.getCheckingTooltip(),
          command: ShowTooltipCommand
        });
        break;
      case "available for download":
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: nls.localize("updateStatus.updateAvailableStatus", "$(circle-filled) Update available, click to download."),
          ariaLabel: nls.localize("updateStatus.updateAvailableAria", "Update available, click to download."),
          tooltip: this.getAvailableTooltip(state.update),
          command: "update.downloadNow"
        });
        break;
      case "downloading":
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: this.getDownloadingText(state),
          ariaLabel: nls.localize("updateStatus.downloadingUpdateAria", "Downloading update"),
          tooltip: this.getDownloadingTooltip(state),
          command: ShowTooltipCommand
        });
        break;
      case "downloaded":
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: nls.localize("updateStatus.updateReadyStatus", "$(circle-filled) Update downloaded, click to install."),
          ariaLabel: nls.localize("updateStatus.updateReadyAria", "Update downloaded, click to install."),
          tooltip: this.getReadyToInstallTooltip(state.update),
          command: "update.install"
        });
        break;
      case "updating":
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: this.getUpdatingText(state),
          ariaLabel: this.getUpdatingText(state),
          tooltip: this.getUpdatingTooltip(state),
          command: ShowTooltipCommand
        });
        break;
      case "ready": {
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: nls.localize("updateStatus.restartToUpdateStatus", "$(circle-filled) Update is ready, click to restart."),
          ariaLabel: nls.localize("updateStatus.restartToUpdateAria", "Update is ready, click to restart."),
          tooltip: this.getRestartToUpdateTooltip(state.update),
          command: "update.restart"
        });
        break;
      }
      case "overwriting":
        this.updateStatusBarEntry({
          name: UpdateStatusBarEntryContribution_1.NAME,
          text: nls.localize("updateStatus.downloadingNewerUpdateStatus", "$(sync~spin) Downloading update..."),
          ariaLabel: nls.localize("updateStatus.downloadingNewerUpdateAria", "Downloading a newer update"),
          tooltip: this.getOverwritingTooltip(state),
          command: ShowTooltipCommand
        });
        break;
    }
  }
  updateStatusBarEntry(entry) {
    if (this.statusBarEntryAccessor.value) {
      this.statusBarEntryAccessor.value.update(entry);
    } else {
      this.statusBarEntryAccessor.value = this.statusbarService.addEntry(entry, "status.update", 0, -Number.MAX_VALUE);
    }
  }
  getCheckingTooltip() {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.checkingForUpdatesTitle", "Checking for Updates"), store);
        this.appendProductInfo(container);
        const message = dom.append(container, dom.$(".progress-details"));
        message.textContent = nls.localize("updateStatus.checkingPleaseWait", "Checking for updates, please wait...");
        return container;
      }, "element")
    };
  }
  getAvailableTooltip(update) {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.updateAvailableTitle", "Update Available"), store);
        this.appendProductInfo(container, update);
        this.appendWhatsIncluded(container);
        return container;
      }, "element")
    };
  }
  getDownloadingText({ downloadedBytes, totalBytes }) {
    if (downloadedBytes !== void 0 && totalBytes !== void 0 && totalBytes > 0) {
      return nls.localize("updateStatus.downloadUpdateProgressStatus", "$(sync~spin) Downloading update: {0} / {1} \u2022 {2}%", formatBytes(downloadedBytes), formatBytes(totalBytes), getProgressPercent(downloadedBytes, totalBytes) ?? 0);
    } else {
      return nls.localize("updateStatus.downloadUpdateStatus", "$(sync~spin) Downloading update...");
    }
  }
  getDownloadingTooltip(state) {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.downloadingUpdateTitle", "Downloading Update"), store);
        this.appendProductInfo(container, state.update);
        const { downloadedBytes, totalBytes } = state;
        if (downloadedBytes !== void 0 && totalBytes !== void 0 && totalBytes > 0) {
          const percentage = getProgressPercent(downloadedBytes, totalBytes) ?? 0;
          const progressContainer = dom.append(container, dom.$(".progress-container"));
          const progressBar = dom.append(progressContainer, dom.$(".progress-bar"));
          const progressFill = dom.append(progressBar, dom.$(".progress-fill"));
          progressFill.style.width = `${percentage}%`;
          const progressText = dom.append(progressContainer, dom.$(".progress-text"));
          const percentageSpan = dom.append(progressText, dom.$("span"));
          percentageSpan.textContent = `${percentage}%`;
          const sizeSpan = dom.append(progressText, dom.$("span"));
          sizeSpan.textContent = `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`;
          const speed = computeDownloadSpeed(state);
          if (speed !== void 0 && speed > 0) {
            const speedInfo = dom.append(container, dom.$(".speed-info"));
            speedInfo.textContent = nls.localize("updateStatus.downloadSpeed", "{0}/s", formatBytes(speed));
          }
          const timeRemaining = computeDownloadTimeRemaining(state);
          if (timeRemaining !== void 0 && timeRemaining > 0) {
            const timeRemainingNode = dom.append(container, dom.$(".time-remaining"));
            timeRemainingNode.textContent = `~${formatTimeRemaining(timeRemaining)} ${nls.localize("updateStatus.timeRemaining", "remaining")}`;
          }
        } else {
          const message = dom.append(container, dom.$(".progress-details"));
          message.textContent = nls.localize("updateStatus.downloadingPleaseWait", "Downloading, please wait...");
        }
        return container;
      }, "element")
    };
  }
  getReadyToInstallTooltip(update) {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.updateReadyTitle", "Update is Ready to Install"), store);
        this.appendProductInfo(container, update);
        this.appendWhatsIncluded(container);
        return container;
      }, "element")
    };
  }
  getRestartToUpdateTooltip(update) {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.updateInstalledTitle", "Update Installed"), store);
        this.appendProductInfo(container, update);
        this.appendWhatsIncluded(container);
        return container;
      }, "element")
    };
  }
  getUpdatingText({ currentProgress, maxProgress }) {
    const percentage = getProgressPercent(currentProgress, maxProgress);
    if (percentage !== void 0) {
      return nls.localize("updateStatus.installingUpdateProgressStatus", "$(sync~spin) Installing update: {0}%", percentage);
    } else {
      return nls.localize("updateStatus.installingUpdateStatus", "$(sync~spin) Installing update...");
    }
  }
  getUpdatingTooltip(state) {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.installingUpdateTitle", "Installing Update"), store);
        this.appendProductInfo(container, state.update);
        const { currentProgress, maxProgress } = state;
        const percentage = getProgressPercent(currentProgress, maxProgress);
        if (percentage !== void 0) {
          const progressContainer = dom.append(container, dom.$(".progress-container"));
          const progressBar = dom.append(progressContainer, dom.$(".progress-bar"));
          const progressFill = dom.append(progressBar, dom.$(".progress-fill"));
          progressFill.style.width = `${percentage}%`;
          const progressText = dom.append(progressContainer, dom.$(".progress-text"));
          const percentageSpan = dom.append(progressText, dom.$("span"));
          percentageSpan.textContent = `${percentage}%`;
        } else {
          const message = dom.append(container, dom.$(".progress-details"));
          message.textContent = nls.localize("updateStatus.installingPleaseWait", "Installing update, please wait...");
        }
        return container;
      }, "element")
    };
  }
  getOverwritingTooltip(state) {
    return {
      element: /* @__PURE__ */ __name((token) => {
        const store = this.createTooltipDisposableStore(token);
        const container = dom.$(".update-status-tooltip");
        this.appendHeader(container, nls.localize("updateStatus.downloadingNewerUpdateTitle", "Downloading Newer Update"), store);
        this.appendProductInfo(container, state.update);
        const message = dom.append(container, dom.$(".progress-details"));
        message.textContent = nls.localize("updateStatus.downloadingNewerPleaseWait", "A newer update was released. Downloading, please wait...");
        return container;
      }, "element")
    };
  }
  createTooltipDisposableStore(token) {
    const store = new DisposableStore();
    store.add(token.onCancellationRequested(() => store.dispose()));
    return store;
  }
  runCommandAndClose(command, ...args) {
    this.commandService.executeCommand(command, ...args);
    this.hoverService.hideHover(true);
  }
  appendHeader(container, title, store) {
    const header = dom.append(container, dom.$(".header"));
    const text = dom.append(header, dom.$(".title"));
    text.textContent = title;
    const actionBar = store.add(new ActionBar(header, { hoverDelegate: nativeHoverDelegate }));
    actionBar.push([toAction({
      id: "update.openSettings",
      label: nls.localize("updateStatus.settingsTooltip", "Update Settings"),
      class: ThemeIcon.asClassName(Codicon.gear),
      run: /* @__PURE__ */ __name(() => this.runCommandAndClose("workbench.action.openSettings", "@id:update*"), "run")
    })], { icon: true, label: false });
  }
  appendProductInfo(container, update) {
    const productInfo = dom.append(container, dom.$(".product-info"));
    const logoContainer = dom.append(productInfo, dom.$(".product-logo"));
    logoContainer.setAttribute("role", "img");
    logoContainer.setAttribute("aria-label", this.productService.nameLong);
    const details = dom.append(productInfo, dom.$(".product-details"));
    const productName = dom.append(details, dom.$(".product-name"));
    productName.textContent = this.productService.nameLong;
    const productVersion = this.productService.version;
    if (productVersion) {
      const currentVersion = dom.append(details, dom.$(".product-version"));
      const currentCommitId = this.productService.commit?.substring(0, 7);
      currentVersion.textContent = currentCommitId ? nls.localize("updateStatus.currentVersionLabelWithCommit", "Current Version: {0} ({1})", productVersion, currentCommitId) : nls.localize("updateStatus.currentVersionLabel", "Current Version: {0}", productVersion);
    }
    const version = update?.productVersion;
    if (version) {
      const latestVersion = dom.append(details, dom.$(".product-version"));
      const updateCommitId = update.version?.substring(0, 7);
      latestVersion.textContent = updateCommitId ? nls.localize("updateStatus.latestVersionLabelWithCommit", "Latest Version: {0} ({1})", version, updateCommitId) : nls.localize("updateStatus.latestVersionLabel", "Latest Version: {0}", version);
    }
    const releaseDate = update?.timestamp ?? tryParseDate(this.productService.date);
    if (typeof releaseDate === "number" && releaseDate > 0) {
      const releaseDateNode = dom.append(details, dom.$(".product-release-date"));
      releaseDateNode.textContent = nls.localize("updateStatus.releasedLabel", "Released {0}", formatDate(releaseDate));
    }
    const releaseNotesVersion = version ?? productVersion;
    if (releaseNotesVersion) {
      const link = dom.append(details, dom.$("a.release-notes-link"));
      link.textContent = nls.localize("updateStatus.releaseNotesLink", "Release Notes");
      link.href = "#";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.runCommandAndClose("update.showCurrentReleaseNotes", releaseNotesVersion);
      });
    }
  }
  appendWhatsIncluded(container) {
  }
};
UpdateStatusBarEntryContribution = UpdateStatusBarEntryContribution_1 = __decorate([
  __param(0, IUpdateService),
  __param(1, IStatusbarService),
  __param(2, IProductService),
  __param(3, ICommandService),
  __param(4, IHoverService),
  __param(5, IConfigurationService)
], UpdateStatusBarEntryContribution);
function getProgressPercent(current, max) {
  if (current === void 0 || max === void 0 || max <= 0) {
    return void 0;
  } else {
    return Math.max(Math.min(Math.round(current / max * 100), 100), 0);
  }
}
__name(getProgressPercent, "getProgressPercent");
function tryParseDate(date) {
  if (date === void 0) {
    return void 0;
  }
  const parsed = Date.parse(date);
  return isNaN(parsed) ? void 0 : parsed;
}
__name(tryParseDate, "tryParseDate");
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
__name(formatDate, "formatDate");
function computeDownloadTimeRemaining(state) {
  const { downloadedBytes, totalBytes, startTime } = state;
  if (downloadedBytes === void 0 || totalBytes === void 0 || startTime === void 0) {
    return void 0;
  }
  const elapsedMs = Date.now() - startTime;
  if (downloadedBytes <= 0 || totalBytes <= 0 || elapsedMs <= 0) {
    return void 0;
  }
  const remainingBytes = totalBytes - downloadedBytes;
  if (remainingBytes <= 0) {
    return 0;
  }
  const bytesPerMs = downloadedBytes / elapsedMs;
  if (bytesPerMs <= 0) {
    return void 0;
  }
  const remainingMs = remainingBytes / bytesPerMs;
  return Math.ceil(remainingMs / 1e3);
}
__name(computeDownloadTimeRemaining, "computeDownloadTimeRemaining");
function formatTimeRemaining(seconds) {
  const hours = seconds / 3600;
  if (hours >= 1) {
    const formattedHours = formatDecimal(hours);
    return formattedHours === "1" ? nls.localize("timeRemainingHour", "{0} hour", formattedHours) : nls.localize("timeRemainingHours", "{0} hours", formattedHours);
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 1) {
    return nls.localize("timeRemainingMinutes", "{0} min", minutes);
  }
  return nls.localize("timeRemainingSeconds", "{0}s", seconds);
}
__name(formatTimeRemaining, "formatTimeRemaining");
function formatBytes(bytes) {
  if (bytes < 1024) {
    return nls.localize("bytes", "{0} B", bytes);
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return nls.localize("kilobytes", "{0} KB", formatDecimal(kb));
  }
  const mb = kb / 1024;
  if (mb < 1024) {
    return nls.localize("megabytes", "{0} MB", formatDecimal(mb));
  }
  const gb = mb / 1024;
  return nls.localize("gigabytes", "{0} GB", formatDecimal(gb));
}
__name(formatBytes, "formatBytes");
function formatDecimal(value) {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}
__name(formatDecimal, "formatDecimal");
function computeDownloadSpeed(state) {
  const { downloadedBytes, startTime } = state;
  if (downloadedBytes === void 0 || startTime === void 0) {
    return void 0;
  }
  const elapsedMs = Date.now() - startTime;
  if (elapsedMs <= 0 || downloadedBytes <= 0) {
    return void 0;
  }
  return downloadedBytes / elapsedMs * 1e3;
}
__name(computeDownloadSpeed, "computeDownloadSpeed");
export {
  UpdateStatusBarEntryContribution,
  computeDownloadSpeed,
  computeDownloadTimeRemaining,
  formatBytes,
  formatDate,
  formatTimeRemaining,
  getProgressPercent,
  tryParseDate
};
//# sourceMappingURL=updateStatusBarEntry.js.map
