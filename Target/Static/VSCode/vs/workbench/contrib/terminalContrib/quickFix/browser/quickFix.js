import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IAction } from "../../../../../base/common/actions.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { ITerminalCommandSelector, ITerminalOutputMatch, ITerminalOutputMatcher } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalCommand } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
const ITerminalQuickFixService = createDecorator("terminalQuickFixService");
var TerminalQuickFixType = /* @__PURE__ */ ((TerminalQuickFixType2) => {
  TerminalQuickFixType2[TerminalQuickFixType2["TerminalCommand"] = 0] = "TerminalCommand";
  TerminalQuickFixType2[TerminalQuickFixType2["Opener"] = 1] = "Opener";
  TerminalQuickFixType2[TerminalQuickFixType2["Port"] = 2] = "Port";
  TerminalQuickFixType2[TerminalQuickFixType2["VscodeCommand"] = 3] = "VscodeCommand";
  return TerminalQuickFixType2;
})(TerminalQuickFixType || {});
export {
  ITerminalQuickFixService,
  TerminalQuickFixType
};
//# sourceMappingURL=quickFix.js.map
