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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IMcpService } from "./mcpTypes.js";
var McpContextKeys;
(function(McpContextKeys2) {
  McpContextKeys2.serverCount = new RawContextKey("mcp.serverCount", void 0, { type: "number", description: localize("mcp.serverCount.description", "Context key that has the number of registered MCP servers") });
  McpContextKeys2.hasUnknownTools = new RawContextKey("mcp.hasUnknownTools", void 0, { type: "boolean", description: localize("mcp.hasUnknownTools.description", "Indicates whether there are MCP servers with unknown tools.") });
  McpContextKeys2.hasServersWithErrors = new RawContextKey("mcp.hasServersWithErrors", void 0, { type: "boolean", description: localize("mcp.hasServersWithErrors.description", "Indicates whether there are any MCP servers with errors.") });
  McpContextKeys2.toolsCount = new RawContextKey("mcp.toolsCount", void 0, { type: "number", description: localize("mcp.toolsCount.description", "Context key that has the number of registered MCP tools") });
})(McpContextKeys || (McpContextKeys = {}));
let McpContextKeysController = class McpContextKeysController2 extends Disposable {
  static {
    __name(this, "McpContextKeysController");
  }
  static {
    this.ID = "workbench.contrib.mcp.contextKey";
  }
  constructor(mcpService, contextKeyService) {
    super();
    const ctxServerCount = McpContextKeys.serverCount.bindTo(contextKeyService);
    const ctxToolsCount = McpContextKeys.toolsCount.bindTo(contextKeyService);
    const ctxHasUnknownTools = McpContextKeys.hasUnknownTools.bindTo(contextKeyService);
    this._store.add(bindContextKey(McpContextKeys.hasServersWithErrors, contextKeyService, (r) => mcpService.servers.read(r).some(
      (c) => c.connectionState.read(r).state === 3
      /* McpConnectionState.Kind.Error */
    )));
    this._store.add(autorun((r) => {
      const servers = mcpService.servers.read(r);
      const serverTools = servers.map((s) => s.tools.read(r));
      ctxServerCount.set(servers.length);
      ctxToolsCount.set(serverTools.reduce((count, tools) => count + tools.length, 0));
      ctxHasUnknownTools.set(mcpService.lazyCollectionState.read(r).state !== 2 || servers.some((s) => {
        const toolState = s.cacheState.read(r);
        return toolState === 0 || toolState === 2 || toolState === 3;
      }));
    }));
  }
};
McpContextKeysController = __decorate([
  __param(0, IMcpService),
  __param(1, IContextKeyService)
], McpContextKeysController);
export {
  McpContextKeys,
  McpContextKeysController
};
//# sourceMappingURL=mcpContextKeys.js.map
