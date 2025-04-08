var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
function showHistoryKeybindingHint(keybindingService) {
  return keybindingService.lookupKeybinding("history.showPrevious")?.getElectronAccelerator() === "Up" && keybindingService.lookupKeybinding("history.showNext")?.getElectronAccelerator() === "Down";
}
__name(showHistoryKeybindingHint, "showHistoryKeybindingHint");
export {
  showHistoryKeybindingHint
};
//# sourceMappingURL=historyWidgetKeybindingHint.js.map
