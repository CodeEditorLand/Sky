var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeybindingsRegistry, KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ITerminalGroupService } from "./terminal.js";
function setupTerminalCommands() {
  registerOpenTerminalAtIndexCommands();
}
__name(setupTerminalCommands, "setupTerminalCommands");
function registerOpenTerminalAtIndexCommands() {
  for (let i = 0; i < 9; i++) {
    const terminalIndex = i;
    const visibleIndex = i + 1;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: `workbench.action.terminal.focusAtIndex${visibleIndex}`,
      weight: KeybindingWeight.WorkbenchContrib,
      when: void 0,
      primary: 0,
      handler: /* @__PURE__ */ __name((accessor) => {
        accessor.get(ITerminalGroupService).setActiveInstanceByIndex(terminalIndex);
        return accessor.get(ITerminalGroupService).showPanel(true);
      }, "handler")
    });
  }
}
__name(registerOpenTerminalAtIndexCommands, "registerOpenTerminalAtIndexCommands");
export {
  setupTerminalCommands
};
//# sourceMappingURL=terminalCommands.js.map
