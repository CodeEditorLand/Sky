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
import { ITerminalSandboxService } from "../../../common/terminalSandboxService.js";
let CommandLineSandboxAnalyzer = class CommandLineSandboxAnalyzer2 extends Disposable {
  static {
    __name(this, "CommandLineSandboxAnalyzer");
  }
  constructor(_sandboxService) {
    super();
    this._sandboxService = _sandboxService;
  }
  async analyze(_options) {
    if (!await this._sandboxService.isEnabled()) {
      return {
        isAutoApproveAllowed: true
      };
    }
    return {
      isAutoApproveAllowed: true,
      forceAutoApproval: true
    };
  }
};
CommandLineSandboxAnalyzer = __decorate([
  __param(0, ITerminalSandboxService)
], CommandLineSandboxAnalyzer);
export {
  CommandLineSandboxAnalyzer
};
//# sourceMappingURL=commandLineSandboxAnalyzer.js.map
