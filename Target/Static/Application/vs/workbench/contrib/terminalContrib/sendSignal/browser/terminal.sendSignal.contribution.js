var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isWindows } from "../../../../../base/common/platform.js";
import { isObject, isString } from "../../../../../base/common/types.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
var TerminalSendSignalCommandId;
(function(TerminalSendSignalCommandId2) {
  TerminalSendSignalCommandId2["SendSignal"] = "workbench.action.terminal.sendSignal";
})(TerminalSendSignalCommandId || (TerminalSendSignalCommandId = {}));
function toOptionalString(obj) {
  return isString(obj) ? obj : void 0;
}
__name(toOptionalString, "toOptionalString");
const sendSignalString = localize2("sendSignal", "Send Signal");
registerTerminalAction({
  id: "workbench.action.terminal.sendSignal",
  title: sendSignalString,
  f1: !isWindows,
  metadata: {
    description: sendSignalString.value,
    args: [{
      name: "args",
      schema: {
        type: "object",
        required: ["signal"],
        properties: {
          signal: {
            description: localize("sendSignal.signal.desc", "The signal to send to the terminal process (e.g., 'SIGTERM', 'SIGINT', 'SIGKILL')"),
            type: "string"
          }
        }
      }
    }]
  },
  run: /* @__PURE__ */ __name(async (c, accessor, args) => {
    const quickInputService = accessor.get(IQuickInputService);
    const instance = c.service.activeInstance;
    if (!instance) {
      return;
    }
    let signal = isObject(args) && "signal" in args ? toOptionalString(args.signal) : void 0;
    if (!signal) {
      const signalOptions = [
        { label: "SIGINT", description: localize("SIGINT", "Interrupt process (Ctrl+C)") },
        { label: "SIGTERM", description: localize("SIGTERM", "Terminate process gracefully") },
        { label: "SIGKILL", description: localize("SIGKILL", "Force kill process") },
        { label: "SIGSTOP", description: localize("SIGSTOP", "Stop process") },
        { label: "SIGCONT", description: localize("SIGCONT", "Continue process") },
        { label: "SIGHUP", description: localize("SIGHUP", "Hangup") },
        { label: "SIGQUIT", description: localize("SIGQUIT", "Quit process") },
        { label: "SIGUSR1", description: localize("SIGUSR1", "User-defined signal 1") },
        { label: "SIGUSR2", description: localize("SIGUSR2", "User-defined signal 2") },
        { type: "separator" },
        { label: localize("manualSignal", "Manually enter signal") }
      ];
      const selected = await quickInputService.pick(signalOptions, {
        placeHolder: localize("selectSignal", "Select signal to send to terminal process")
      });
      if (!selected) {
        return;
      }
      if (selected.label === localize("manualSignal", "Manually enter signal")) {
        const inputSignal = await quickInputService.input({
          prompt: localize("enterSignal", "Enter signal name (e.g., SIGTERM, SIGKILL)")
        });
        if (!inputSignal) {
          return;
        }
        signal = inputSignal;
      } else {
        signal = selected.label;
      }
    }
    await instance.sendSignal(signal);
  }, "run")
});
export {
  TerminalSendSignalCommandId
};
//# sourceMappingURL=terminal.sendSignal.contribution.js.map
