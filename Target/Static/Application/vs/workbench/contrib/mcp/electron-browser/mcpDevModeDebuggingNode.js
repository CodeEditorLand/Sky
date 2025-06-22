var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../base/common/async.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IDebugService } from "../../debug/common/debug.js";
import { McpDevModeDebugging } from "../common/mcpDevMode.js";
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
let McpDevModeDebuggingNode = class McpDevModeDebuggingNode2 extends McpDevModeDebugging {
  static {
    __name(this, "McpDevModeDebuggingNode");
  }
  constructor(debugService, commandService, _nativeHostService) {
    super(debugService, commandService);
    this._nativeHostService = _nativeHostService;
  }
  async ensureListeningOnPort(port) {
    const deadline = Date.now() + 3e4;
    while (await this._nativeHostService.isPortFree(port) && Date.now() < deadline) {
      await timeout(50);
    }
  }
  getDebugPort() {
    return this._nativeHostService.findFreePort(
      5e3,
      10,
      5e3,
      2048
      /* skip 2048 ports between attempts */
    );
  }
};
McpDevModeDebuggingNode = __decorate([
  __param(0, IDebugService),
  __param(1, ICommandService),
  __param(2, INativeHostService)
], McpDevModeDebuggingNode);
export {
  McpDevModeDebuggingNode
};
//# sourceMappingURL=mcpDevModeDebuggingNode.js.map
