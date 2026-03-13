var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isMacintosh } from "../../../base/common/platform.js";
import { localize } from "../../../nls.js";
import { ContextKeyExpr } from "../../contextkey/common/contextkey.js";
import { InputFocusedContext } from "../../contextkey/common/contextkeys.js";
import { KeybindingsRegistry } from "../../keybinding/common/keybindingsRegistry.js";
import { endOfQuickInputBoxContext, inQuickInputContext, quickInputTypeContextKeyValue } from "./quickInput.js";
import { IQuickInputService, QuickPickFocus } from "../common/quickInput.js";
function registerQuickInputCommandAndKeybindingRule(rule, options = {}) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    weight: 200,
    when: inQuickInputContext,
    metadata: { description: localize("quickInput", "Used while in the context of any kind of quick input. If you change one keybinding for this command, you should change all of the other keybindings (modifier variants) of this command as well.") },
    ...rule,
    secondary: getSecondary(rule.primary, rule.secondary ?? [], options)
  });
}
__name(registerQuickInputCommandAndKeybindingRule, "registerQuickInputCommandAndKeybindingRule");
function registerQuickPickCommandAndKeybindingRule(rule, options = {}) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    weight: 200,
    when: ContextKeyExpr.and(ContextKeyExpr.or(
      // Only things that use Tree widgets
      ContextKeyExpr.equals(
        quickInputTypeContextKeyValue,
        "quickPick"
        /* QuickInputType.QuickPick */
      ),
      ContextKeyExpr.equals(
        quickInputTypeContextKeyValue,
        "quickTree"
        /* QuickInputType.QuickTree */
      )
    ), inQuickInputContext),
    metadata: { description: localize("quickPick", "Used while in the context of the quick pick. If you change one keybinding for this command, you should change all of the other keybindings (modifier variants) of this command as well.") },
    ...rule,
    secondary: getSecondary(rule.primary, rule.secondary ?? [], options)
  });
}
__name(registerQuickPickCommandAndKeybindingRule, "registerQuickPickCommandAndKeybindingRule");
const ctrlKeyMod = isMacintosh ? 256 : 2048;
function getSecondary(primary, secondary, options = {}) {
  if (options.withAltMod) {
    secondary.push(512 + primary);
  }
  if (options.withCtrlMod) {
    secondary.push(ctrlKeyMod + primary);
    if (options.withAltMod) {
      secondary.push(512 + ctrlKeyMod + primary);
    }
  }
  if (options.withCmdMod && isMacintosh) {
    secondary.push(2048 + primary);
    if (options.withCtrlMod) {
      secondary.push(2048 + 256 + primary);
    }
    if (options.withAltMod) {
      secondary.push(2048 + 512 + primary);
      if (options.withCtrlMod) {
        secondary.push(2048 + 512 + 256 + primary);
      }
    }
  }
  return secondary;
}
__name(getSecondary, "getSecondary");
function focusHandler(focus, focusOnQuickNatigate) {
  return (accessor) => {
    const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
    if (!currentQuickPick) {
      return;
    }
    if (focusOnQuickNatigate && currentQuickPick.quickNavigate) {
      return currentQuickPick.focus(focusOnQuickNatigate);
    }
    return currentQuickPick.focus(focus);
  };
}
__name(focusHandler, "focusHandler");
registerQuickPickCommandAndKeybindingRule({ id: "quickInput.pageNext", primary: 12, handler: focusHandler(QuickPickFocus.NextPage) }, { withAltMod: true, withCtrlMod: true, withCmdMod: true });
registerQuickPickCommandAndKeybindingRule({ id: "quickInput.pagePrevious", primary: 11, handler: focusHandler(QuickPickFocus.PreviousPage) }, { withAltMod: true, withCtrlMod: true, withCmdMod: true });
registerQuickPickCommandAndKeybindingRule({ id: "quickInput.first", primary: ctrlKeyMod + 14, handler: focusHandler(QuickPickFocus.First) }, { withAltMod: true, withCmdMod: true });
registerQuickPickCommandAndKeybindingRule({ id: "quickInput.last", primary: ctrlKeyMod + 13, handler: focusHandler(QuickPickFocus.Last) }, { withAltMod: true, withCmdMod: true });
registerQuickPickCommandAndKeybindingRule({ id: "quickInput.next", primary: 18, handler: focusHandler(QuickPickFocus.Next) }, { withCtrlMod: true });
registerQuickPickCommandAndKeybindingRule({ id: "quickInput.previous", primary: 16, handler: focusHandler(QuickPickFocus.Previous) }, { withCtrlMod: true });
const nextSeparatorFallbackDesc = localize("quickInput.nextSeparatorWithQuickAccessFallback", "If we're in quick access mode, this will navigate to the next item. If we are not in quick access mode, this will navigate to the next separator.");
const prevSeparatorFallbackDesc = localize("quickInput.previousSeparatorWithQuickAccessFallback", "If we're in quick access mode, this will navigate to the previous item. If we are not in quick access mode, this will navigate to the previous separator.");
if (isMacintosh) {
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.nextSeparatorWithQuickAccessFallback",
    primary: 2048 + 18,
    handler: focusHandler(QuickPickFocus.NextSeparator, QuickPickFocus.Next),
    metadata: { description: nextSeparatorFallbackDesc }
  });
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.nextSeparator",
    primary: 2048 + 512 + 18,
    // Since macOS has the cmd key as the primary modifier, we need to add this additional
    // keybinding to capture cmd+ctrl+upArrow
    secondary: [
      2048 + 256 + 18
      /* KeyCode.DownArrow */
    ],
    handler: focusHandler(QuickPickFocus.NextSeparator)
  }, { withCtrlMod: true });
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.previousSeparatorWithQuickAccessFallback",
    primary: 2048 + 16,
    handler: focusHandler(QuickPickFocus.PreviousSeparator, QuickPickFocus.Previous),
    metadata: { description: prevSeparatorFallbackDesc }
  });
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.previousSeparator",
    primary: 2048 + 512 + 16,
    // Since macOS has the cmd key as the primary modifier, we need to add this additional
    // keybinding to capture cmd+ctrl+upArrow
    secondary: [
      2048 + 256 + 16
      /* KeyCode.UpArrow */
    ],
    handler: focusHandler(QuickPickFocus.PreviousSeparator)
  }, { withCtrlMod: true });
} else {
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.nextSeparatorWithQuickAccessFallback",
    primary: 512 + 18,
    handler: focusHandler(QuickPickFocus.NextSeparator, QuickPickFocus.Next),
    metadata: { description: nextSeparatorFallbackDesc }
  });
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.nextSeparator",
    primary: 2048 + 512 + 18,
    handler: focusHandler(QuickPickFocus.NextSeparator)
  });
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.previousSeparatorWithQuickAccessFallback",
    primary: 512 + 16,
    handler: focusHandler(QuickPickFocus.PreviousSeparator, QuickPickFocus.Previous),
    metadata: { description: prevSeparatorFallbackDesc }
  });
  registerQuickPickCommandAndKeybindingRule({
    id: "quickInput.previousSeparator",
    primary: 2048 + 512 + 16,
    handler: focusHandler(QuickPickFocus.PreviousSeparator)
  });
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "quickInput.accept",
  primary: 3,
  weight: 200,
  when: ContextKeyExpr.and(
    // All other kinds of Quick things handle Accept, except Widget. In other words, Accepting is a detail on the things
    // that extend IQuickInput
    ContextKeyExpr.notEquals(
      quickInputTypeContextKeyValue,
      "quickWidget"
      /* QuickInputType.QuickWidget */
    ),
    inQuickInputContext,
    ContextKeyExpr.not("isComposing")
  ),
  metadata: { description: localize("nonQuickWidget", "Used while in the context of some quick input. If you change one keybinding for this command, you should change all of the other keybindings (modifier variants) of this command as well.") },
  handler: /* @__PURE__ */ __name((accessor) => {
    const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
    currentQuickPick?.accept();
  }, "handler"),
  secondary: getSecondary(3, [], { withAltMod: true, withCtrlMod: true, withCmdMod: true })
});
registerQuickPickCommandAndKeybindingRule({
  id: "quickInput.acceptInBackground",
  // If we are in the quick pick but the input box is not focused or our cursor is at the end of the input box
  when: ContextKeyExpr.and(inQuickInputContext, ContextKeyExpr.equals(
    quickInputTypeContextKeyValue,
    "quickPick"
    /* QuickInputType.QuickPick */
  ), ContextKeyExpr.or(InputFocusedContext.negate(), endOfQuickInputBoxContext)),
  primary: 17,
  // Need a little extra weight to ensure this keybinding is preferred over the default cmd+alt+right arrow keybinding
  // https://github.com/microsoft/vscode/blob/1451e4fbbbf074a4355cc537c35b547b80ce1c52/src/vs/workbench/browser/parts/editor/editorActions.ts#L1178-L1195
  weight: 200 + 50,
  handler: /* @__PURE__ */ __name((accessor) => {
    const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
    currentQuickPick?.accept(true);
  }, "handler")
}, { withAltMod: true, withCtrlMod: true, withCmdMod: true });
registerQuickInputCommandAndKeybindingRule({
  id: "quickInput.hide",
  primary: 9,
  handler: /* @__PURE__ */ __name((accessor) => {
    const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
    currentQuickPick?.hide();
  }, "handler")
}, { withAltMod: true, withCtrlMod: true, withCmdMod: true });
registerQuickPickCommandAndKeybindingRule({
  id: "quickInput.toggleCheckbox",
  when: ContextKeyExpr.and(inQuickInputContext, ContextKeyExpr.or(ContextKeyExpr.equals(
    quickInputTypeContextKeyValue,
    "quickPick"
    /* QuickInputType.QuickPick */
  ), ContextKeyExpr.equals(
    quickInputTypeContextKeyValue,
    "quickTree"
    /* QuickInputType.QuickTree */
  )), InputFocusedContext.negate()),
  primary: 10,
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.toggle();
  }, "handler")
});
registerQuickPickCommandAndKeybindingRule({
  id: "quickInput.toggleHover",
  primary: ctrlKeyMod | 10,
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.toggleHover();
  }, "handler")
});
//# sourceMappingURL=quickInputActions.js.map
