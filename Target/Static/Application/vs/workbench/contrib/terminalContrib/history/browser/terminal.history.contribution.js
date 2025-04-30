var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var TerminalHistoryContribution_1;
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TerminalLocation } from "../../../../../platform/terminal/common/terminal.js";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { registerActiveInstanceAction, registerTerminalAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { clearShellFileHistory, getCommandHistory, getDirectoryHistory } from "../common/history.js";
import { showRunRecentQuickPick } from "./terminalRunRecentQuickPick.js";
let TerminalHistoryContribution = class TerminalHistoryContribution2 extends Disposable {
  static {
    __name(this, "TerminalHistoryContribution");
  }
  static {
    TerminalHistoryContribution_1 = this;
  }
  static {
    this.ID = "terminal.history";
  }
  static get(instance) {
    return instance.getContribution(TerminalHistoryContribution_1.ID);
  }
  constructor(_ctx, contextKeyService, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
    this._terminalInRunCommandPicker = TerminalContextKeys.inTerminalRunCommandPicker.bindTo(contextKeyService);
    this._register(_ctx.instance.capabilities.onDidAddCapabilityType((e) => {
      switch (e) {
        case 0: {
          const cwdDetection = _ctx.instance.capabilities.get(
            0
            /* TerminalCapability.CwdDetection */
          );
          if (!cwdDetection) {
            return;
          }
          this._register(cwdDetection.onDidChangeCwd((e2) => {
            this._instantiationService.invokeFunction(getDirectoryHistory)?.add(e2, { remoteAuthority: _ctx.instance.remoteAuthority });
          }));
          break;
        }
        case 2: {
          const commandDetection = _ctx.instance.capabilities.get(
            2
            /* TerminalCapability.CommandDetection */
          );
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
  /**
   * Triggers a quick pick that displays recent commands or cwds. Selecting one will
   * rerun it in the active terminal.
   */
  async runRecent(type, filterMode, value) {
    return this._instantiationService.invokeFunction(showRunRecentQuickPick, this._ctx.instance, this._terminalInRunCommandPicker, type, filterMode, value);
  }
};
TerminalHistoryContribution = TerminalHistoryContribution_1 = __decorate([
  __param(1, IContextKeyService),
  __param(2, IInstantiationService)
], TerminalHistoryContribution);
registerTerminalContribution(TerminalHistoryContribution.ID, TerminalHistoryContribution);
const precondition = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
registerTerminalAction({
  id: "workbench.action.terminal.clearPreviousSessionHistory",
  title: localize2("workbench.action.terminal.clearPreviousSessionHistory", "Clear Previous Session History"),
  precondition,
  run: /* @__PURE__ */ __name(async (c, accessor) => {
    getCommandHistory(accessor).clear();
    clearShellFileHistory();
  }, "run")
});
registerActiveInstanceAction({
  id: "workbench.action.terminal.goToRecentDirectory",
  title: localize2("workbench.action.terminal.goToRecentDirectory", "Go to Recent Directory..."),
  metadata: {
    description: localize2("goToRecentDirectory.metadata", "Goes to a recent folder")
  },
  precondition,
  keybinding: {
    primary: 2048 | 37,
    when: TerminalContextKeys.focus,
    weight: 200
    /* KeybindingWeight.WorkbenchContrib */
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
  id: "workbench.action.terminal.runRecentCommand",
  title: localize2("workbench.action.terminal.runRecentCommand", "Run Recent Command..."),
  precondition,
  keybinding: [
    {
      primary: 2048 | 48,
      when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo(
        "terminal"
        /* AccessibleViewProviderId.Terminal */
      )))),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    {
      primary: 2048 | 512 | 48,
      mac: {
        primary: 256 | 512 | 48
        /* KeyCode.KeyR */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
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
