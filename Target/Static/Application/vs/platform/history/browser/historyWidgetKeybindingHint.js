var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function showHistoryKeybindingHint(keybindingService) {
  return keybindingService.lookupKeybinding("history.showPrevious")?.getElectronAccelerator() === "Up" && keybindingService.lookupKeybinding("history.showNext")?.getElectronAccelerator() === "Down";
}
__name(showHistoryKeybindingHint, "showHistoryKeybindingHint");
export {
  showHistoryKeybindingHint
};
//# sourceMappingURL=historyWidgetKeybindingHint.js.map
