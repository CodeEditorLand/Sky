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
var TerminalQuickFixContribution_1;
import { DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../nls.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { registerActiveInstanceAction } from "../../../terminal/browser/terminalActions.js";
import { registerTerminalContribution } from "../../../terminal/browser/terminalExtensions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import "./media/terminalQuickFix.css";
import { ITerminalQuickFixService } from "./quickFix.js";
import { TerminalQuickFixAddon } from "./quickFixAddon.js";
import { freePort, gitCreatePr, gitFastForwardPull, gitPushSetUpstream, gitSimilar, gitTwoDashes, pwshGeneralError, pwshUnixCommandNotFoundError } from "./terminalQuickFixBuiltinActions.js";
import { TerminalQuickFixService } from "./terminalQuickFixService.js";
registerSingleton(
  ITerminalQuickFixService,
  TerminalQuickFixService,
  1
  /* InstantiationType.Delayed */
);
let TerminalQuickFixContribution = class TerminalQuickFixContribution2 extends DisposableStore {
  static {
    __name(this, "TerminalQuickFixContribution");
  }
  static {
    TerminalQuickFixContribution_1 = this;
  }
  static {
    this.ID = "quickFix";
  }
  static get(instance) {
    return instance.getContribution(TerminalQuickFixContribution_1.ID);
  }
  get addon() {
    return this._addon;
  }
  constructor(_ctx, _instantiationService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
    this._quickFixMenuItems = this.add(new MutableDisposable());
  }
  xtermReady(xterm) {
    this._addon = this._instantiationService.createInstance(TerminalQuickFixAddon, void 0, this._ctx.instance.capabilities);
    xterm.raw.loadAddon(this._addon);
    this.add(this._addon.onDidRequestRerunCommand((e) => this._ctx.instance.runCommand(e.command, e.shouldExecute || false)));
    this.add(this._addon.onDidUpdateQuickFixes((e) => {
      this._quickFixMenuItems.value = e.actions ? xterm.decorationAddon.registerMenuItems(e.command, e.actions) : void 0;
    }));
    for (const actionOption of [
      gitTwoDashes(),
      gitFastForwardPull(),
      freePort((port, command) => this._ctx.instance.freePortKillProcess(port, command)),
      gitSimilar(),
      gitPushSetUpstream(),
      gitCreatePr(),
      pwshUnixCommandNotFoundError(),
      pwshGeneralError()
    ]) {
      this._addon.registerCommandFinishedListener(actionOption);
    }
  }
};
TerminalQuickFixContribution = TerminalQuickFixContribution_1 = __decorate([
  __param(1, IInstantiationService)
], TerminalQuickFixContribution);
registerTerminalContribution(TerminalQuickFixContribution.ID, TerminalQuickFixContribution);
var TerminalQuickFixCommandId;
(function(TerminalQuickFixCommandId2) {
  TerminalQuickFixCommandId2["ShowQuickFixes"] = "workbench.action.terminal.showQuickFixes";
})(TerminalQuickFixCommandId || (TerminalQuickFixCommandId = {}));
registerActiveInstanceAction({
  id: "workbench.action.terminal.showQuickFixes",
  title: localize2("workbench.action.terminal.showQuickFixes", "Show Terminal Quick Fixes"),
  precondition: TerminalContextKeys.focus,
  keybinding: {
    primary: 2048 | 89,
    weight: 200
    /* KeybindingWeight.WorkbenchContrib */
  },
  run: /* @__PURE__ */ __name((activeInstance) => TerminalQuickFixContribution.get(activeInstance)?.addon?.showMenu(), "run")
});
//# sourceMappingURL=terminal.quickFix.contribution.js.map
