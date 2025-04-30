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
import { IConfigurationService } from "../../configuration/common/configuration.js";
let McpManagementCli = class McpManagementCli2 {
  static {
    __name(this, "McpManagementCli");
  }
  constructor(_logger, _userConfigurationService) {
    this._logger = _logger;
    this._userConfigurationService = _userConfigurationService;
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
McpManagementCli = __decorate([
  __param(1, IConfigurationService)
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
