var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class McpDiscoveryRegistry {
  static {
    __name(this, "McpDiscoveryRegistry");
  }
  constructor() {
    this._discovery = [];
  }
  register(discovery) {
    this._discovery.push(discovery);
  }
  getAll() {
    return this._discovery;
  }
}
const mcpDiscoveryRegistry = new McpDiscoveryRegistry();
export {
  mcpDiscoveryRegistry
};
//# sourceMappingURL=mcpDiscovery.js.map
