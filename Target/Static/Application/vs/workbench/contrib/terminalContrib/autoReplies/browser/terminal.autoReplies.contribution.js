var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { ITerminalInstanceService } from "../../../terminal/browser/terminal.js";
import { TERMINAL_CONFIG_SECTION } from "../../../terminal/common/terminal.js";
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
let TerminalAutoRepliesContribution = class TerminalAutoRepliesContribution2 extends Disposable {
  static {
    __name(this, "TerminalAutoRepliesContribution");
  }
  static {
    this.ID = "terminalAutoReplies";
  }
  constructor(_configurationService, terminalInstanceService) {
    super();
    this._configurationService = _configurationService;
    for (const backend of terminalInstanceService.getRegisteredBackends()) {
      this._installListenersOnBackend(backend);
    }
    this._register(terminalInstanceService.onDidRegisterBackend(async (e) => this._installListenersOnBackend(e)));
  }
  _installListenersOnBackend(backend) {
    const initialConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
    for (const match of Object.keys(initialConfig.autoReplies)) {
      const reply = initialConfig.autoReplies[match];
      if (reply) {
        backend.installAutoReply(match, reply);
      }
    }
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.autoReplies"
        /* TerminalAutoRepliesSettingId.AutoReplies */
      )) {
        backend.uninstallAllAutoReplies();
        const config = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
        for (const match of Object.keys(config.autoReplies)) {
          const reply = config.autoReplies[match];
          if (reply) {
            backend.installAutoReply(match, reply);
          }
        }
      }
    }));
  }
};
TerminalAutoRepliesContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, ITerminalInstanceService)
], TerminalAutoRepliesContribution);
registerWorkbenchContribution2(
  TerminalAutoRepliesContribution.ID,
  TerminalAutoRepliesContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
export {
  TerminalAutoRepliesContribution
};
//# sourceMappingURL=terminal.autoReplies.contribution.js.map
