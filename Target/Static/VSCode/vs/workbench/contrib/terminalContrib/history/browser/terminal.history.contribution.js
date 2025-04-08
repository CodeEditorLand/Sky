var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../nls.js";
import { AccessibleViewProviderId } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { TerminalCapability } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { registerActiveInstanceAction, registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { clearShellFileHistory, getCommandHistory, getDirectoryHistory } from "../common/history.js";
import { TerminalHistoryCommandId } from "../common/terminal.history.js";
import { showRunRecentQuickPick } from "./terminalRunRecentQuickPick.js";
let TerminalHistoryContribution = class extends Disposable {
  constructor(_ctx, contextKeyService, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
    this._terminalInRunCommandPicker = TerminalContextKeys.inTerminalRunCommandPicker.bindTo(contextKeyService);
    this._register(_ctx.instance.capabilities.onDidAddCapabilityType((e) => {
      switch (e) {
        case TerminalCapability.CwdDetection: {
          const cwdDetection = _ctx.instance.capabilities.get(TerminalCapability.CwdDetection);
          if (!cwdDetection) {
            return;
          }
          this._register(cwdDetection.onDidChangeCwd((e2) => {
            this._instantiationService.invokeFunction(getDirectoryHistory)?.add(e2, { remoteAuthority: _ctx.instance.remoteAuthority });
          }));
          break;
        }
        case TerminalCapability.CommandDetection: {
          const commandDetection = _ctx.instance.capabilities.get(TerminalCapability.CommandDetection);
          if (!commandDetection) {
            return;
          }
          this._register(commandDetection.onCommandFinished((e2) => {
            if (e2.command.trim().length > 0) {
              this._instantiationService.invokeFunction(getCommandHistory)?.add(e2.command, { shellType: _ctx.instance.shellType });
            }
          }));
          break;
        }
      }
    }));
  }
  static {
    __name(this, "TerminalHistoryContribution");
  }
  static ID = "terminal.history";
  static get(instance) {
    return instance.getContribution(TerminalHistoryContribution.ID);
  }
  _terminalInRunCommandPicker;
  /**
   * Triggers a quick pick that displays recent commands or cwds. Selecting one will
   * rerun it in the active terminal.
   */
  async runRecent(type, filterMode, value) {
    return this._instantiationService.invokeFunction(
      showRunRecentQuickPick,
      this._ctx.instance,
      this._terminalInRunCommandPicker,
      type,
      filterMode,
      value
    );
  }
};
TerminalHistoryContribution = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService)
], TerminalHistoryContribution);
registerTerminalContribution(TerminalHistoryContribution.ID, TerminalHistoryContribution);
const precondition = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
registerTerminalAction({
  id: TerminalHistoryCommandId.ClearPreviousSessionHistory,
  title: localize2("workbench.action.terminal.clearPreviousSessionHistory", "Clear Previous Session History"),
  precondition,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    getCommandHistory(accessor).clear();
    clearShellFileHistory();
  }, "run")
});
registerActiveInstanceAction({
  id: TerminalHistoryCommandId.GoToRecentDirectory,
  title: localize2("workbench.action.terminal.goToRecentDirectory", "Go to Recent Directory..."),
  metadata: {
    description: localize2("goToRecentDirectory.metadata", "Goes to a recent folder")
  },
  precondition,
  keybinding: {
    primary: KeyMod.CtrlCmd | KeyCode.KeyG,
    when: TerminalContextKeys.focus,
    weight: KeybindingWeight.WorkbenchContrib
  },
  run: /* @__PURE__ */ __name(async (activeInstance, c) => {
    const history = TerminalHistoryContribution.get(activeInstance);
    if (!history) {
      return;
    }
    await history.runRecent("cwd");
    if (activeInstance?.target === TerminalLocation.Editor) {
      await c.editorService.revealActiveEditor();
    } else {
      await c.groupService.showPanel(false);
    }
  }, "run")
});
registerActiveInstanceAction({
  id: TerminalHistoryCommandId.RunRecentCommand,
  title: localize2("workbench.action.terminal.runRecentCommand", "Run Recent Command..."),
  precondition,
  keybinding: [
    {
      primary: KeyMod.CtrlCmd | KeyCode.KeyR,
      when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo(AccessibleViewProviderId.Terminal)))),
      weight: KeybindingWeight.WorkbenchContrib
    },
    {
      primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyR,
      mac: { primary: KeyMod.WinCtrl | KeyMod.Alt | KeyCode.KeyR },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: KeybindingWeight.WorkbenchContrib
    }
  ],
  run: /* @__PURE__ */ __name(async (activeInstance, c) => {
    const history = TerminalHistoryContribution.get(activeInstance);
    if (!history) {
      return;
    }
    await history.runRecent("command");
    if (activeInstance?.target === TerminalLocation.Editor) {
      await c.editorService.revealActiveEditor();
    } else {
      await c.groupService.showPanel(false);
    }
  }, "run")
});
//# sourceMappingURL=terminal.history.contribution.js.map
