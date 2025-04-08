var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ILogger } from "../../log/common/log.js";
import { IMcpConfiguration, IMcpConfigurationSSE, IMcpConfigurationStdio, McpConfigurationServer } from "./mcpPlatformTypes.js";
let McpManagementCli = class {
  constructor(_logger, _userConfigurationService) {
    this._logger = _logger;
    this._userConfigurationService = _userConfigurationService;
  }
  static {
    __name(this, "McpManagementCli");
  }
  async addMcpDefinitions(definitions) {
    const configs = definitions.map((config) => this.validateConfiguration(config));
    await this.updateMcpInConfig(this._userConfigurationService, configs);
    this._logger.info(`Added MCP servers: ${configs.map((c) => c.name).join(", ")}`);
  }
  async updateMcpInConfig(service, configs) {
    const mcp = service.getValue("mcp") || { servers: {} };
    mcp.servers ??= {};
    for (const config of configs) {
      mcp.servers[config.name] = config.config;
    }
    await service.updateValue("mcp", mcp);
  }
  validateConfiguration(config) {
    let parsed;
    try {
      parsed = JSON.parse(config);
    } catch (e) {
      throw new InvalidMcpOperationError(`Invalid JSON '${config}': ${e}`);
    }
    if (!parsed.name) {
      throw new InvalidMcpOperationError(`Missing name property in ${config}`);
    }
    if (!("command" in parsed) && !("url" in parsed)) {
      throw new InvalidMcpOperationError(`Missing command or URL property in ${config}`);
    }
    const { name, ...rest } = parsed;
    return { name, config: rest };
  }
};
McpManagementCli = __decorateClass([
  __decorateParam(1, IConfigurationService)
], McpManagementCli);
class InvalidMcpOperationError extends Error {
  static {
    __name(this, "InvalidMcpOperationError");
  }
  constructor(message) {
    super(message);
    this.stack = message;
  }
}
export {
  McpManagementCli
};
//# sourceMappingURL=mcpManagementCli.js.map
