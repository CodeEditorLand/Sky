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
import { localize } from "../../../../../../nls.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ITerminalSandboxService } from "../../common/terminalSandboxService.js";
let SandboxOutputAnalyzer = class SandboxOutputAnalyzer2 extends Disposable {
  static {
    __name(this, "SandboxOutputAnalyzer");
  }
  constructor(_sandboxService) {
    super();
    this._sandboxService = _sandboxService;
  }
  async analyze(options) {
    if (options.exitCode === void 0 || options.exitCode === 0) {
      return void 0;
    }
    if (!await this._sandboxService.isEnabled()) {
      return void 0;
    }
    return localize(
      "runInTerminalTool.sandboxCommandFailed",
      "Command failed while running in sandboxed mode. Use the command result to determine the scenario. If the issue is filesystem permissions, update allowWrite in {0} (Linux) or {1} (macOS). If the issue is domain/network related, add the required domains to {2}.allowedDomains.",
      "chat.tools.terminal.sandbox.linuxFileSystem",
      "chat.tools.terminal.sandbox.macFileSystem",
      "chat.tools.terminal.sandbox.network"
      /* TerminalChatAgentToolsSettingId.TerminalSandboxNetwork */
    );
  }
};
SandboxOutputAnalyzer = __decorate([
  __param(0, ITerminalSandboxService)
], SandboxOutputAnalyzer);
export {
  SandboxOutputAnalyzer
};
//# sourceMappingURL=sandboxOutputAnalyzer.js.map
