var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asArray } from "../../../../base/common/arrays.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { basename } from "../../../../base/common/path.js";
import { localize } from "../../../../nls.js";
function getInstanceHoverInfo(instance, storageService) {
  const showDetailed = parseInt(storageService.get(
    "terminal.integrated.tabs.showDetailed",
    -1
    /* StorageScope.APPLICATION */
  ) ?? "0");
  let statusString = "";
  const statuses = instance.statusList.statuses;
  const actions = [];
  for (const status of statuses) {
    if (showDetailed) {
      if (status.detailedTooltip ?? status.tooltip) {
        statusString += `

---

${status.icon ? `$(${status.icon?.id}) ` : ""}` + (status.detailedTooltip ?? status.tooltip ?? "");
      }
    } else {
      if (status.tooltip) {
        statusString += `

---

${status.icon ? `$(${status.icon?.id}) ` : ""}` + (status.tooltip ?? "");
      }
    }
    if (status.hoverActions) {
      actions.push(...status.hoverActions);
    }
  }
  actions.push({
    commandId: "toggleDetailedInfo",
    label: showDetailed ? localize("hideDetails", "Hide Details") : localize("showDetails", "Show Details"),
    run() {
      storageService.store(
        "terminal.integrated.tabs.showDetailed",
        (showDetailed + 1) % 2,
        -1,
        0
        /* StorageTarget.USER */
      );
    }
  });
  const shellProcessString = getShellProcessTooltip(instance, !!showDetailed);
  const content = new MarkdownString(instance.title + shellProcessString + statusString, { supportThemeIcons: true });
  return { content, actions };
}
__name(getInstanceHoverInfo, "getInstanceHoverInfo");
function getShellProcessTooltip(instance, showDetailed) {
  const lines = [];
  if (instance.processId && instance.processId > 0) {
    lines.push(localize({ key: "shellProcessTooltip.processId", comment: [`The first arg is "PID" which shouldn't be translated`] }, "Process ID ({0}): {1}", "PID", instance.processId) + "\n");
  }
  if (instance.shellLaunchConfig.executable) {
    let commandLine = "";
    if (!showDetailed && instance.shellLaunchConfig.executable.length > 32) {
      const base = basename(instance.shellLaunchConfig.executable);
      const sepIndex = instance.shellLaunchConfig.executable.length - base.length - 1;
      const sep = instance.shellLaunchConfig.executable.substring(sepIndex, sepIndex + 1);
      commandLine += `\u2026${sep}${base}`;
    } else {
      commandLine += instance.shellLaunchConfig.executable;
    }
    const args = asArray(instance.injectedArgs || instance.shellLaunchConfig.args || []).map((x) => x.match(/\s/) ? `'${x}'` : x).join(" ");
    if (args) {
      commandLine += ` ${args}`;
    }
    lines.push(localize("shellProcessTooltip.commandLine", "Command line: {0}", commandLine));
  }
  return lines.length ? `

---

${lines.join("\n")}` : "";
}
__name(getShellProcessTooltip, "getShellProcessTooltip");
export {
  getInstanceHoverInfo,
  getShellProcessTooltip
};
//# sourceMappingURL=terminalTooltip.js.map
