var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeColor } from "../../../../base/common/themables.js";
import { Command } from "../../../../editor/common/languages.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IManagedHoverTooltipHTMLElement, IManagedHoverTooltipMarkdownString } from "../../../../base/browser/ui/hover/hover.js";
import { ColorIdentifier } from "../../../../platform/theme/common/colorRegistry.js";
import { IAuxiliaryStatusbarPart, IStatusbarEntryContainer } from "../../../browser/parts/statusbar/statusbarPart.js";
const IStatusbarService = createDecorator("statusbarService");
var StatusbarAlignment = /* @__PURE__ */ ((StatusbarAlignment2) => {
  StatusbarAlignment2[StatusbarAlignment2["LEFT"] = 0] = "LEFT";
  StatusbarAlignment2[StatusbarAlignment2["RIGHT"] = 1] = "RIGHT";
  return StatusbarAlignment2;
})(StatusbarAlignment || {});
function isStatusbarEntryLocation(thing) {
  const candidate = thing;
  return typeof candidate?.location?.id === "string" && typeof candidate.alignment === "number";
}
__name(isStatusbarEntryLocation, "isStatusbarEntryLocation");
function isStatusbarEntryPriority(thing) {
  const candidate = thing;
  return (typeof candidate?.primary === "number" || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === "number";
}
__name(isStatusbarEntryPriority, "isStatusbarEntryPriority");
const ShowTooltipCommand = {
  id: "statusBar.entry.showTooltip",
  title: ""
};
const StatusbarEntryKinds = ["standard", "warning", "error", "prominent", "remote", "offline"];
function isTooltipWithCommands(thing) {
  const candidate = thing;
  return !!candidate?.content && Array.isArray(candidate?.commands);
}
__name(isTooltipWithCommands, "isTooltipWithCommands");
export {
  IStatusbarService,
  ShowTooltipCommand,
  StatusbarAlignment,
  StatusbarEntryKinds,
  isStatusbarEntryLocation,
  isStatusbarEntryPriority,
  isTooltipWithCommands
};
//# sourceMappingURL=statusbar.js.map
