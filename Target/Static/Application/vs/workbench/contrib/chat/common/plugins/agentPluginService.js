var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../../base/common/resources.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const IAgentPluginService = createDecorator("agentPluginService");
function getCanonicalPluginCommandId(plugin, commandName) {
  const pluginSegment = basename(plugin.uri);
  const prefix = normalizePluginToken(pluginSegment);
  const normalizedCommand = normalizePluginToken(commandName);
  if (normalizedCommand.startsWith(`${prefix}:`)) {
    return normalizedCommand;
  }
  return `${prefix}:${normalizedCommand}`;
}
__name(getCanonicalPluginCommandId, "getCanonicalPluginCommandId");
function normalizePluginToken(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_.:-]/g, "-").replace(/-+/g, "-").replace(/^[-:.]+|[-:.]+$/g, "");
}
__name(normalizePluginToken, "normalizePluginToken");
class AgentPluginDiscoveryRegistry {
  static {
    __name(this, "AgentPluginDiscoveryRegistry");
  }
  constructor() {
    this._discovery = [];
  }
  register(descriptor) {
    this._discovery.push(descriptor);
  }
  getAll() {
    return this._discovery;
  }
}
const agentPluginDiscoveryRegistry = new AgentPluginDiscoveryRegistry();
export {
  IAgentPluginService,
  agentPluginDiscoveryRegistry,
  getCanonicalPluginCommandId
};
//# sourceMappingURL=agentPluginService.js.map
