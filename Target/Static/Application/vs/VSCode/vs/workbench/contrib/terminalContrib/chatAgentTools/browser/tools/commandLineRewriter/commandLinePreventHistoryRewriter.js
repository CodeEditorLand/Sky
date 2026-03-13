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
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { isBash, isZsh } from "../../runInTerminalHelpers.js";
let CommandLinePreventHistoryRewriter = class CommandLinePreventHistoryRewriter2 extends Disposable {
  static {
    __name(this, "CommandLinePreventHistoryRewriter");
  }
  constructor(_configurationService) {
    super();
    this._configurationService = _configurationService;
  }
  rewrite(options) {
    const preventShellHistory = this._configurationService.getValue(
      "chat.tools.terminal.preventShellHistory"
      /* TerminalChatAgentToolsSettingId.PreventShellHistory */
    ) === true;
    if (!preventShellHistory) {
      return void 0;
    }
    if (isBash(options.shell, options.os) || isZsh(options.shell, options.os)) {
      return {
        rewritten: ` ${options.commandLine}`,
        reasoning: "Prepended with a space to exclude from shell history"
      };
    }
    return void 0;
  }
};
CommandLinePreventHistoryRewriter = __decorate([
  __param(0, IConfigurationService)
], CommandLinePreventHistoryRewriter);
export {
  CommandLinePreventHistoryRewriter
};
//# sourceMappingURL=commandLinePreventHistoryRewriter.js.map
