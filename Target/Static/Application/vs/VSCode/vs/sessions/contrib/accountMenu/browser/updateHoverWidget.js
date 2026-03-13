var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import "./media/updateHoverWidget.css";
class UpdateHoverWidget {
  static {
    __name(this, "UpdateHoverWidget");
  }
  constructor(updateService, productService, hoverService) {
    this.updateService = updateService;
    this.productService = productService;
    this.hoverService = hoverService;
  }
  attachTo(target) {
    return this.hoverService.setupDelayedHover(target, () => ({
      content: this.createHoverContent(),
      position: {
        hoverPosition: 1
        /* HoverPosition.RIGHT */
      },
      appearance: { showPointer: true }
    }), { groupId: "sessions-account-update" });
  }
  createHoverContent(state = this.updateService.state) {
    const update = this.getUpdateFromState(state);
    const currentVersion = this.productService.version ?? localize("unknownVersion", "Unknown");
    const targetVersion = update?.productVersion ?? update?.version ?? localize("unknownVersion", "Unknown");
    const currentCommit = this.productService.commit;
    const targetCommit = update?.version;
    const progressPercent = this.getUpdateProgressPercent(state);
    const container = document.createElement("div");
    container.classList.add("sessions-update-hover");
    const header = document.createElement("div");
    header.classList.add("sessions-update-hover-header");
    header.textContent = this.getUpdateHeaderLabel(state.type);
    container.appendChild(header);
    if (progressPercent !== void 0) {
      const progressTrack = document.createElement("div");
      progressTrack.classList.add("sessions-update-hover-progress-track");
      const progressFill = document.createElement("div");
      progressFill.classList.add("sessions-update-hover-progress-fill");
      progressFill.style.width = `${progressPercent}%`;
      progressTrack.appendChild(progressFill);
      container.appendChild(progressTrack);
    }
    const detailsGrid = document.createElement("div");
    detailsGrid.classList.add("sessions-update-hover-grid");
    const currentDate = this.productService.date ? new Date(this.productService.date) : void 0;
    const currentAge = currentDate ? this.formatCompactAge(currentDate.getTime()) : void 0;
    const newAge = update?.timestamp ? this.formatCompactAge(update.timestamp) : void 0;
    this.appendGridRow(detailsGrid, localize("updateHoverCurrentVersionLabel", "Current"), currentVersion, currentAge, currentCommit);
    this.appendGridRow(detailsGrid, localize("updateHoverNewVersionLabel", "New"), targetVersion, newAge, targetCommit);
    container.appendChild(detailsGrid);
    return container;
  }
  appendGridRow(grid, label, version, age, commit) {
    const labelEl = document.createElement("span");
    labelEl.classList.add("sessions-update-hover-label");
    labelEl.textContent = label;
    grid.appendChild(labelEl);
    const versionEl = document.createElement("span");
    versionEl.classList.add("sessions-update-hover-version");
    versionEl.textContent = version;
    grid.appendChild(versionEl);
    const ageEl = document.createElement("span");
    ageEl.classList.add("sessions-update-hover-age");
    ageEl.textContent = age ?? "";
    grid.appendChild(ageEl);
    const commitEl = document.createElement("span");
    commitEl.classList.add("sessions-update-hover-commit");
    commitEl.textContent = commit ? commit.substring(0, 7) : "";
    grid.appendChild(commitEl);
  }
  formatCompactAge(timestamp) {
    const seconds = Math.round((Date.now() - timestamp) / 1e3);
    if (seconds < 60) {
      return localize("compactAgeNow", "now");
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return localize("compactAgeMinutes", "{0}m ago", minutes);
    }
    const hours = Math.round(seconds / 3600);
    if (hours < 24) {
      return localize("compactAgeHours", "{0}h ago", hours);
    }
    const days = Math.round(seconds / 86400);
    if (days < 7) {
      return localize("compactAgeDays", "{0}d ago", days);
    }
    const weeks = Math.round(days / 7);
    if (weeks < 5) {
      return localize("compactAgeWeeks", "{0}w ago", weeks);
    }
    const months = Math.round(days / 30);
    return localize("compactAgeMonths", "{0}mo ago", months);
  }
  getUpdateFromState(state) {
    switch (state.type) {
      case "available for download":
      case "downloaded":
      case "ready":
      case "overwriting":
      case "updating":
        return state.update;
      case "downloading":
        return state.update;
      default:
        return void 0;
    }
  }
  /**
   * Returns progress as a percentage (0-100), or undefined if progress is not applicable.
   */
  getUpdateProgressPercent(state) {
    switch (state.type) {
      case "downloading": {
        const downloadingState = state;
        if (downloadingState.downloadedBytes !== void 0 && downloadingState.totalBytes && downloadingState.totalBytes > 0) {
          return Math.min(100, Math.round(downloadingState.downloadedBytes / downloadingState.totalBytes * 100));
        }
        return 0;
      }
      case "updating": {
        const updatingState = state;
        if (updatingState.currentProgress !== void 0 && updatingState.maxProgress && updatingState.maxProgress > 0) {
          return Math.min(100, Math.round(updatingState.currentProgress / updatingState.maxProgress * 100));
        }
        return 0;
      }
      case "downloaded":
      case "ready":
        return 100;
      case "available for download":
      case "overwriting":
        return 0;
      default:
        return void 0;
    }
  }
  getUpdateHeaderLabel(type) {
    const productName = this.productService.nameShort;
    switch (type) {
      case "ready":
        return localize("updateReady", "{0} Update Ready", productName);
      case "available for download":
        return localize("downloadAvailable", "{0} Update Available", productName);
      case "downloading":
      case "overwriting":
        return localize("downloadingUpdate", "Downloading {0}", productName);
      case "downloaded":
        return localize("installingUpdate", "Installing {0}", productName);
      case "updating":
        return localize("updatingApp", "Updating {0}", productName);
      default:
        return localize("updating", "Updating {0}", productName);
    }
  }
}
export {
  UpdateHoverWidget
};
//# sourceMappingURL=updateHoverWidget.js.map
