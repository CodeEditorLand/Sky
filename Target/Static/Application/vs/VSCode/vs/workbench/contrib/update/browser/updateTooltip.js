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
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { toAction } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IHoverService, nativeHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { IMeteredConnectionService } from "../../../../platform/meteredConnection/common/meteredConnection.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { computeDownloadSpeed, computeDownloadTimeRemaining, computeProgressPercent, formatBytes, formatDate, formatTimeRemaining, tryParseDate } from "../common/updateUtils.js";
import "./media/updateTooltip.css";
let UpdateTooltip = class UpdateTooltip2 extends Disposable {
  static {
    __name(this, "UpdateTooltip");
  }
  constructor(commandService, configurationService, hoverService, meteredConnectionService, productService, updateService) {
    super();
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.meteredConnectionService = meteredConnectionService;
    this.productService = productService;
    this.domNode = dom.$(".update-tooltip");
    const header = dom.append(this.domNode, dom.$(".header"));
    this.titleNode = dom.append(header, dom.$(".title"));
    const actionBar = this._register(new ActionBar(header, { hoverDelegate: nativeHoverDelegate }));
    actionBar.push(toAction({
      id: "update.openSettings",
      label: localize("updateTooltip.settingsTooltip", "Update Settings"),
      class: ThemeIcon.asClassName(Codicon.gear),
      run: /* @__PURE__ */ __name(() => this.runCommandAndClose("workbench.action.openSettings", "@id:update*"), "run")
    }), { icon: true, label: false });
    const productInfo = dom.append(this.domNode, dom.$(".product-info"));
    const logoContainer = dom.append(productInfo, dom.$(".product-logo"));
    logoContainer.setAttribute("role", "img");
    logoContainer.setAttribute("aria-label", this.productService.nameLong);
    const details = dom.append(productInfo, dom.$(".product-details"));
    this.productNameNode = dom.append(details, dom.$(".product-name"));
    this.productNameNode.textContent = this.productService.nameLong;
    this.currentVersionNode = dom.append(details, dom.$(".product-version"));
    this.latestVersionNode = dom.append(details, dom.$(".product-version"));
    this.releaseDateNode = dom.append(details, dom.$(".product-release-date"));
    this.releaseNotesLink = dom.append(details, dom.$("a.release-notes-link"));
    this.releaseNotesLink.textContent = localize("updateTooltip.releaseNotesLink", "Release Notes");
    this.releaseNotesLink.href = "#";
    this._register(dom.addDisposableListener(this.releaseNotesLink, "click", (e) => {
      e.preventDefault();
      if (this.releaseNotesVersion) {
        this.runCommandAndClose("update.showCurrentReleaseNotes", this.releaseNotesVersion);
      }
    }));
    this.progressContainer = dom.append(this.domNode, dom.$(".progress-container"));
    const progressBar = dom.append(this.progressContainer, dom.$(".progress-bar"));
    this.progressFill = dom.append(progressBar, dom.$(".progress-fill"));
    const progressText = dom.append(this.progressContainer, dom.$(".progress-text"));
    this.progressPercentNode = dom.append(progressText, dom.$("span"));
    this.progressSizeNode = dom.append(progressText, dom.$("span"));
    this.downloadStatsContainer = dom.append(this.progressContainer, dom.$(".download-stats"));
    this.timeRemainingNode = dom.append(this.downloadStatsContainer, dom.$(".time-remaining"));
    this.speedInfoNode = dom.append(this.downloadStatsContainer, dom.$(".speed-info"));
    this.messageNode = dom.append(this.domNode, dom.$(".state-message"));
    this.updateCurrentVersion();
    this._register(updateService.onStateChange((state) => this.onStateChange(state)));
    this.onStateChange(updateService.state);
  }
  updateCurrentVersion() {
    const productVersion = this.productService.version;
    if (productVersion) {
      const currentCommitId = this.productService.commit?.substring(0, 7);
      this.currentVersionNode.textContent = currentCommitId ? localize("updateTooltip.currentVersionLabelWithCommit", "Current Version: {0} ({1})", productVersion, currentCommitId) : localize("updateTooltip.currentVersionLabel", "Current Version: {0}", productVersion);
      this.currentVersionNode.style.display = "";
    } else {
      this.currentVersionNode.style.display = "none";
    }
  }
  onStateChange(state) {
    this.progressContainer.style.display = "none";
    this.speedInfoNode.textContent = "";
    this.timeRemainingNode.textContent = "";
    this.messageNode.style.display = "none";
    switch (state.type) {
      case "uninitialized":
        this.renderUninitialized();
        break;
      case "disabled":
        this.renderDisabled(state);
        break;
      case "idle":
        this.renderIdle(state);
        break;
      case "checking for updates":
        this.renderCheckingForUpdates();
        break;
      case "available for download":
        this.renderAvailableForDownload(state);
        break;
      case "downloading":
        this.renderDownloading(state);
        break;
      case "downloaded":
        this.renderDownloaded(state);
        break;
      case "updating":
        this.renderUpdating(state);
        break;
      case "ready":
        this.renderReady(state);
        break;
      case "overwriting":
        this.renderOverwriting(state);
        break;
    }
  }
  renderUninitialized() {
    this.renderTitleAndInfo(localize("updateTooltip.initializingTitle", "Initializing"));
    this.showMessage(localize("updateTooltip.initializingMessage", "Initializing update service..."));
  }
  renderDisabled({ reason }) {
    this.renderTitleAndInfo(localize("updateTooltip.updatesDisabledTitle", "Updates Disabled"));
    switch (reason) {
      case 0:
        this.showMessage(localize("updateTooltip.disabledNotBuilt", "Updates are not available for this build."), Codicon.info);
        break;
      case 1:
        this.showMessage(localize("updateTooltip.disabledByEnvironment", "Updates are disabled by the --disable-updates command line flag."), Codicon.warning);
        break;
      case 2:
        this.showMessage(localize("updateTooltip.disabledManually", 'Updates are manually disabled. Change the "update.mode" setting to enable.'), Codicon.warning);
        break;
      case 3:
        this.showMessage(localize("updateTooltip.disabledByPolicy", "Updates are disabled by organization policy."), Codicon.info);
        break;
      case 4:
        this.showMessage(localize("updateTooltip.disabledMissingConfig", "Updates are disabled because no update URL is configured."), Codicon.info);
        break;
      case 5:
        this.showMessage(localize("updateTooltip.disabledInvalidConfig", "Updates are disabled because the update URL is invalid."), Codicon.error);
        break;
      case 6:
        this.showMessage(localize("updateTooltip.disabledRunningAsAdmin", "Updates are not available when running a user install of {0} as administrator.", this.productService.nameShort), Codicon.warning);
        break;
      default:
        this.showMessage(localize("updateTooltip.disabledGeneric", "Updates are disabled."), Codicon.warning);
        break;
    }
  }
  renderIdle({ error, notAvailable }) {
    if (error) {
      this.renderTitleAndInfo(localize("updateTooltip.updateErrorTitle", "Update Error"));
      this.showMessage(error, Codicon.error);
      return;
    }
    if (notAvailable) {
      this.renderTitleAndInfo(localize("updateTooltip.noUpdateAvailableTitle", "No Update Available"));
      this.showMessage(localize("updateTooltip.noUpdateAvailableMessage", "There are no updates currently available."), Codicon.info);
      return;
    }
    this.renderTitleAndInfo(localize("updateTooltip.upToDateTitle", "Up to Date"));
    switch (this.configurationService.getValue("update.mode")) {
      case "none":
        this.showMessage(localize("updateTooltip.autoUpdateNone", "Automatic updates are disabled."), Codicon.warning);
        break;
      case "manual":
        this.showMessage(localize("updateTooltip.autoUpdateManual", "Automatic updates will be checked but not installed automatically."));
        break;
      case "start":
        this.showMessage(localize("updateTooltip.autoUpdateStart", "Updates will be applied on restart."));
        break;
      case "default":
        if (this.meteredConnectionService.isConnectionMetered) {
          this.showMessage(localize("updateTooltip.meteredConnectionMessage", "Automatic updates are paused because the network connection is metered."), Codicon.radioTower);
        } else {
          this.showMessage(localize("updateTooltip.autoUpdateDefault", "Automatic updates are enabled. Happy Coding!"), Codicon.smiley);
        }
        break;
    }
  }
  renderCheckingForUpdates() {
    this.renderTitleAndInfo(localize("updateTooltip.checkingForUpdatesTitle", "Checking for Updates"));
    this.showMessage(localize("updateTooltip.checkingPleaseWait", "Checking for updates, please wait..."));
  }
  renderAvailableForDownload({ update }) {
    this.renderTitleAndInfo(localize("updateTooltip.updateAvailableTitle", "Update Available"), update);
  }
  renderDownloading(state) {
    this.renderTitleAndInfo(localize("updateTooltip.downloadingUpdateTitle", "Downloading Update"), state.update);
    const { downloadedBytes, totalBytes } = state;
    if (downloadedBytes !== void 0 && totalBytes !== void 0 && totalBytes > 0) {
      const percentage = computeProgressPercent(downloadedBytes, totalBytes) ?? 0;
      this.progressFill.style.width = `${percentage}%`;
      this.progressPercentNode.textContent = `${percentage}%`;
      this.progressSizeNode.textContent = `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`;
      this.progressContainer.style.display = "";
      const speed = computeDownloadSpeed(state);
      if (speed !== void 0 && speed > 0) {
        this.speedInfoNode.textContent = localize("updateTooltip.downloadSpeed", "{0}/s", formatBytes(speed));
      }
      const timeRemaining = computeDownloadTimeRemaining(state);
      if (timeRemaining !== void 0 && timeRemaining > 0) {
        this.timeRemainingNode.textContent = `~${formatTimeRemaining(timeRemaining)} ${localize("updateTooltip.timeRemaining", "remaining")}`;
      }
      this.downloadStatsContainer.style.display = "";
    } else {
      this.showMessage(localize("updateTooltip.downloadingPleaseWait", "Downloading update, please wait..."));
    }
  }
  renderDownloaded({ update }) {
    this.renderTitleAndInfo(localize("updateTooltip.updateReadyTitle", "Update is Ready to Install"), update);
  }
  renderUpdating({ update, currentProgress, maxProgress }) {
    this.renderTitleAndInfo(localize("updateTooltip.installingUpdateTitle", "Installing Update"), update);
    const percentage = computeProgressPercent(currentProgress, maxProgress);
    if (percentage !== void 0) {
      this.progressFill.style.width = `${percentage}%`;
      this.progressPercentNode.textContent = `${percentage}%`;
      this.progressSizeNode.textContent = "";
      this.progressContainer.style.display = "";
    } else {
      this.showMessage(localize("updateTooltip.installingPleaseWait", "Installing update, please wait..."));
    }
  }
  renderReady({ update }) {
    this.renderTitleAndInfo(localize("updateTooltip.updateInstalledTitle", "Update Installed"), update);
  }
  renderOverwriting({ update }) {
    this.renderTitleAndInfo(localize("updateTooltip.downloadingNewerUpdateTitle", "Downloading Newer Update"), update);
    this.showMessage(localize("updateTooltip.downloadingNewerPleaseWait", "A newer update was released. Downloading, please wait..."));
  }
  renderTitleAndInfo(title, update) {
    this.titleNode.textContent = title;
    const version = update?.productVersion;
    if (version) {
      const updateCommitId = update.version?.substring(0, 7);
      this.latestVersionNode.textContent = updateCommitId ? localize("updateTooltip.latestVersionLabelWithCommit", "Latest Version: {0} ({1})", version, updateCommitId) : localize("updateTooltip.latestVersionLabel", "Latest Version: {0}", version);
      this.latestVersionNode.style.display = "";
    } else {
      this.latestVersionNode.style.display = "none";
    }
    const releaseDate = update?.timestamp ?? tryParseDate(this.productService.date);
    if (typeof releaseDate === "number" && releaseDate > 0) {
      this.releaseDateNode.textContent = localize("updateTooltip.releasedLabel", "Released {0}", formatDate(releaseDate));
      this.releaseDateNode.style.display = "";
    } else {
      this.releaseDateNode.style.display = "none";
    }
    this.releaseNotesVersion = version ?? this.productService.version;
    this.releaseNotesLink.style.display = this.releaseNotesVersion ? "" : "none";
  }
  showMessage(message, icon) {
    dom.clearNode(this.messageNode);
    if (icon) {
      const iconNode = dom.append(this.messageNode, dom.$(".state-message-icon"));
      iconNode.classList.add(...ThemeIcon.asClassNameArray(icon));
    }
    dom.append(this.messageNode, document.createTextNode(message));
    this.messageNode.style.display = "";
  }
  runCommandAndClose(command, ...args) {
    this.commandService.executeCommand(command, ...args);
    this.hoverService.hideHover(true);
  }
};
UpdateTooltip = __decorate([
  __param(0, ICommandService),
  __param(1, IConfigurationService),
  __param(2, IHoverService),
  __param(3, IMeteredConnectionService),
  __param(4, IProductService),
  __param(5, IUpdateService)
], UpdateTooltip);
export {
  UpdateTooltip
};
//# sourceMappingURL=updateTooltip.js.map
