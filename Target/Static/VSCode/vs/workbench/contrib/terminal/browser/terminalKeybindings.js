var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpression } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindings, KeybindingWeight, KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { TerminalCommandId } from "../common/terminal.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { terminalSendSequenceCommand } from "./terminalActions.js";
function registerSendSequenceKeybinding(text, rule) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TerminalCommandId.SendSequence,
    weight: KeybindingWeight.WorkbenchContrib,
    when: rule.when || TerminalContextKeys.focus,
    primary: rule.primary,
    mac: rule.mac,
    linux: rule.linux,
    win: rule.win,
    handler: terminalSendSequenceCommand,
    args: { text }
  });
}
__name(registerSendSequenceKeybinding, "registerSendSequenceKeybinding");
export {
  registerSendSequenceKeybinding
};
//# sourceMappingURL=terminalKeybindings.js.map
