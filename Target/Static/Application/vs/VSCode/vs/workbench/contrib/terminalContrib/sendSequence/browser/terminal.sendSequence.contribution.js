var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../../base/common/network.js";
import { isIOS, isMacintosh, isWindows } from "../../../../../base/common/platform.js";
import { isObject, isString } from "../../../../../base/common/types.js";
import { localize, localize2 } from "../../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingsRegistry } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IConfigurationResolverService } from "../../../../services/configurationResolver/common/configurationResolver.js";
import { IHistoryService } from "../../../../services/history/common/history.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
var TerminalSendSequenceCommandId;
(function(TerminalSendSequenceCommandId2) {
  TerminalSendSequenceCommandId2["SendSequence"] = "workbench.action.terminal.sendSequence";
})(TerminalSendSequenceCommandId || (TerminalSendSequenceCommandId = {}));
function toOptionalString(obj) {
  return isString(obj) ? obj : void 0;
}
__name(toOptionalString, "toOptionalString");
const terminalSendSequenceCommand = /* @__PURE__ */ __name(async (accessor, args) => {
  const quickInputService = accessor.get(IQuickInputService);
  const configurationResolverService = accessor.get(IConfigurationResolverService);
  const workspaceContextService = accessor.get(IWorkspaceContextService);
  const historyService = accessor.get(IHistoryService);
  const terminalService = accessor.get(ITerminalService);
  const instance = terminalService.activeInstance;
  if (instance) {
    let isTextArg2 = function(obj) {
      return isObject(obj) && "text" in obj;
    };
    var isTextArg = isTextArg2;
    __name(isTextArg2, "isTextArg");
    let text = isTextArg2(args) ? toOptionalString(args.text) : void 0;
    if (!text) {
      text = await quickInputService.input({
        value: "",
        placeHolder: "Enter sequence to send (supports \\n, \\r, \\xAB)",
        prompt: localize("workbench.action.terminal.sendSequence.prompt", "Enter sequence to send to the terminal")
      });
      if (!text) {
        return;
      }
      let processedText = text.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
      while (true) {
        const match = processedText.match(/\\x([0-9a-fA-F]{2})/);
        if (match === null || match.index === void 0 || match.length < 2) {
          break;
        }
        processedText = processedText.slice(0, match.index) + String.fromCharCode(parseInt(match[1], 16)) + processedText.slice(match.index + 4);
      }
      text = processedText;
    }
    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance.hasRemoteAuthority ? Schemas.vscodeRemote : Schemas.file);
    const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text);
    instance.sendText(resolvedText, false);
  }
}, "terminalSendSequenceCommand");
const sendSequenceString = localize2("sendSequence", "Send Sequence");
registerTerminalAction({
  id: "workbench.action.terminal.sendSequence",
  title: sendSequenceString,
  f1: true,
  metadata: {
    description: sendSequenceString.value,
    args: [{
      name: "args",
      schema: {
        type: "object",
        required: ["text"],
        properties: {
          text: {
            description: localize("sendSequence.text.desc", "The sequence of text to send to the terminal"),
            type: "string"
          }
        }
      }
    }]
  },
  run: /* @__PURE__ */ __name((c, accessor, args) => terminalSendSequenceCommand(accessor, args), "run")
});
function registerSendSequenceKeybinding(text, rule) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "workbench.action.terminal.sendSequence",
    weight: 200,
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
var Constants;
(function(Constants2) {
  Constants2[Constants2["CtrlLetterOffset"] = 64] = "CtrlLetterOffset";
})(Constants || (Constants = {}));
if (isWindows) {
  registerSendSequenceKeybinding(String.fromCharCode(
    "V".charCodeAt(0) - 64
    /* Constants.CtrlLetterOffset */
  ), {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
      "terminalShellType",
      "pwsh"
      /* GeneralShellType.PowerShell */
    ), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
    primary: 2048 | 52
    /* KeyCode.KeyV */
  });
}
registerSendSequenceKeybinding("\x1B[24~a", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
    "terminalShellType",
    "pwsh"
    /* GeneralShellType.PowerShell */
  ), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode"}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  primary: 2048 | 10,
  mac: {
    primary: 256 | 10
    /* KeyCode.Space */
  }
});
registerSendSequenceKeybinding("\x1B[24~b", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
    "terminalShellType",
    "pwsh"
    /* GeneralShellType.PowerShell */
  ), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode"}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  primary: 512 | 10
  /* KeyCode.Space */
});
registerSendSequenceKeybinding("\x1B[24~c", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
    "terminalShellType",
    "pwsh"
    /* GeneralShellType.PowerShell */
  ), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode"}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  primary: 1024 | 3
  /* KeyCode.Enter */
});
registerSendSequenceKeybinding("\x1B[24~d", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
    "terminalShellType",
    "pwsh"
    /* GeneralShellType.PowerShell */
  ), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode"}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  mac: {
    primary: 1024 | 2048 | 17
    /* KeyCode.RightArrow */
  }
});
registerSendSequenceKeybinding("\x1B[1;2H", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
    "terminalShellType",
    "pwsh"
    /* GeneralShellType.PowerShell */
  ), ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode"}`, true)),
  mac: {
    primary: 1024 | 2048 | 15
    /* KeyCode.LeftArrow */
  }
});
registerSendSequenceKeybinding("\x1B[1;5A", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 | 16
  /* KeyCode.UpArrow */
});
registerSendSequenceKeybinding("\x1B[1;5B", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 | 18
  /* KeyCode.DownArrow */
});
registerSendSequenceKeybinding("\x1B" + (isMacintosh ? "f" : "[1;5C"), {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 | 17
  /* KeyCode.RightArrow */
});
registerSendSequenceKeybinding("\x1B" + (isMacintosh ? "b" : "[1;5D"), {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 | 15
  /* KeyCode.LeftArrow */
});
registerSendSequenceKeybinding("", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
  primary: 2048 | 512 | 48,
  mac: {
    primary: 256 | 512 | 48
    /* KeyCode.KeyR */
  }
});
registerSendSequenceKeybinding("\x07", {
  when: TerminalContextKeys.focus,
  primary: 2048 | 512 | 37,
  mac: {
    primary: 256 | 512 | 37
    /* KeyCode.KeyG */
  }
});
if (isIOS) {
  registerSendSequenceKeybinding(String.fromCharCode(
    "C".charCodeAt(0) - 64
    /* Constants.CtrlLetterOffset */
  ), {
    when: ContextKeyExpr.and(TerminalContextKeys.focus),
    primary: 256 | 33
    /* KeyCode.KeyC */
  });
}
registerSendSequenceKeybinding(String.fromCharCode(
  "W".charCodeAt(0) - 64
  /* Constants.CtrlLetterOffset */
), {
  primary: 2048 | 1,
  mac: {
    primary: 512 | 1
    /* KeyCode.Backspace */
  }
});
if (isWindows) {
  registerSendSequenceKeybinding(String.fromCharCode(
    "H".charCodeAt(0) - 64
    /* Constants.CtrlLetterOffset */
  ), {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals(
      "terminalShellType",
      "cmd"
      /* WindowsShellType.CommandPrompt */
    )),
    primary: 2048 | 1
  });
}
registerSendSequenceKeybinding("\x1Bd", {
  primary: 2048 | 20,
  mac: {
    primary: 512 | 20
    /* KeyCode.Delete */
  }
});
registerSendSequenceKeybinding("", {
  mac: {
    primary: 2048 | 1
    /* KeyCode.Backspace */
  }
});
registerSendSequenceKeybinding(String.fromCharCode("A".charCodeAt(0) - 64), {
  mac: {
    primary: 2048 | 15
    /* KeyCode.LeftArrow */
  }
});
registerSendSequenceKeybinding(String.fromCharCode("E".charCodeAt(0) - 64), {
  mac: {
    primary: 2048 | 17
    /* KeyCode.RightArrow */
  }
});
registerSendSequenceKeybinding("\0", {
  primary: 2048 | 1024 | 23,
  mac: {
    primary: 256 | 1024 | 23
    /* KeyCode.Digit2 */
  }
});
registerSendSequenceKeybinding("", {
  primary: 2048 | 1024 | 27,
  mac: {
    primary: 256 | 1024 | 27
    /* KeyCode.Digit6 */
  }
});
export {
  TerminalSendSequenceCommandId,
  registerSendSequenceKeybinding,
  terminalSendSequenceCommand
};
//# sourceMappingURL=terminal.sendSequence.contribution.js.map
