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
import { assertNever } from "../../../base/common/assert.js";
import { Queue } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { parse } from "../../../base/common/json.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { ConfigurationTargetToString } from "../../configuration/common/configuration.js";
import { IFileService, toFileOperationResult } from "../../files/common/files.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
const IMcpResourceScannerService = createDecorator("IMcpResourceScannerService");
let McpResourceScannerService = class McpResourceScannerService2 extends Disposable {
  static {
    __name(this, "McpResourceScannerService");
  }
  constructor(fileService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.resourcesAccessQueueMap = new ResourceMap();
  }
  async scanMcpServers(mcpResource, target) {
    return this.withProfileMcpServers(mcpResource, target);
  }
  async addMcpServers(servers, mcpResource, target) {
    await this.withProfileMcpServers(mcpResource, target, (scannedMcpServers) => {
      let updatedInputs = scannedMcpServers.inputs ?? [];
      const existingServers = scannedMcpServers.servers ?? {};
      for (const { name, config, inputs } of servers) {
        existingServers[name] = config;
        if (inputs) {
          const existingInputIds = new Set(updatedInputs.map((input) => input.id));
          const newInputs = inputs.filter((input) => !existingInputIds.has(input.id));
          updatedInputs = [...updatedInputs, ...newInputs];
        }
      }
      return { servers: existingServers, inputs: updatedInputs, sandbox: scannedMcpServers.sandbox };
    });
  }
  async removeMcpServers(serverNames, mcpResource, target) {
    await this.withProfileMcpServers(mcpResource, target, (scannedMcpServers) => {
      for (const serverName of serverNames) {
        if (scannedMcpServers.servers?.[serverName]) {
          delete scannedMcpServers.servers[serverName];
        }
      }
      return scannedMcpServers;
    });
  }
  async withProfileMcpServers(mcpResource, target, updateFn) {
    return this.getResourceAccessQueue(mcpResource).queue(async () => {
      target = target ?? 2;
      let scannedMcpServers = {};
      try {
        const content = await this.fileService.readFile(mcpResource);
        const errors = [];
        const result = parse(content.value.toString(), errors, { allowTrailingComma: true, allowEmptyContent: true }) || {};
        if (errors.length > 0) {
          throw new Error("Failed to parse scanned MCP servers: " + errors.join(", "));
        }
        if (target === 2) {
          scannedMcpServers = this.fromUserMcpServers(result);
        } else if (target === 6) {
          scannedMcpServers = this.fromWorkspaceFolderMcpServers(result);
        } else if (target === 5) {
          const workspaceScannedMcpServers = result;
          if (workspaceScannedMcpServers.settings?.mcp) {
            scannedMcpServers = this.fromWorkspaceFolderMcpServers(workspaceScannedMcpServers.settings?.mcp);
          }
        }
      } catch (error) {
        if (toFileOperationResult(error) !== 1) {
          throw error;
        }
      }
      if (updateFn) {
        scannedMcpServers = updateFn(scannedMcpServers ?? {});
        if (target === 2) {
          await this.writeScannedMcpServers(mcpResource, scannedMcpServers);
        } else if (target === 6) {
          await this.writeScannedMcpServersToWorkspaceFolder(mcpResource, scannedMcpServers);
        } else if (target === 5) {
          await this.writeScannedMcpServersToWorkspace(mcpResource, scannedMcpServers);
        } else {
          assertNever(target, `Invalid Target: ${ConfigurationTargetToString(target)}`);
        }
      }
      return scannedMcpServers;
    });
  }
  async writeScannedMcpServers(mcpResource, scannedMcpServers) {
    if (scannedMcpServers.servers && Object.keys(scannedMcpServers.servers).length > 0 || scannedMcpServers.inputs && scannedMcpServers.inputs.length > 0) {
      await this.fileService.writeFile(mcpResource, VSBuffer.fromString(JSON.stringify(scannedMcpServers, null, "	")));
    } else {
      await this.fileService.del(mcpResource);
    }
  }
  async writeScannedMcpServersToWorkspaceFolder(mcpResource, scannedMcpServers) {
    await this.fileService.writeFile(mcpResource, VSBuffer.fromString(JSON.stringify(scannedMcpServers, null, "	")));
  }
  async writeScannedMcpServersToWorkspace(mcpResource, scannedMcpServers) {
    let scannedWorkspaceMcpServers;
    try {
      const content = await this.fileService.readFile(mcpResource);
      const errors = [];
      scannedWorkspaceMcpServers = parse(content.value.toString(), errors, { allowTrailingComma: true, allowEmptyContent: true });
      if (errors.length > 0) {
        throw new Error("Failed to parse scanned MCP servers: " + errors.join(", "));
      }
    } catch (error) {
      if (toFileOperationResult(error) !== 1) {
        throw error;
      }
      scannedWorkspaceMcpServers = { settings: {} };
    }
    if (!scannedWorkspaceMcpServers.settings) {
      scannedWorkspaceMcpServers.settings = {};
    }
    scannedWorkspaceMcpServers.settings.mcp = scannedMcpServers;
    await this.fileService.writeFile(mcpResource, VSBuffer.fromString(JSON.stringify(scannedWorkspaceMcpServers, null, "	")));
  }
  fromUserMcpServers(scannedMcpServers) {
    const userMcpServers = {
      inputs: scannedMcpServers.inputs,
      sandbox: scannedMcpServers.sandbox
    };
    const servers = Object.entries(scannedMcpServers.servers ?? {});
    if (servers.length > 0) {
      userMcpServers.servers = {};
      for (const [serverName, server] of servers) {
        userMcpServers.servers[serverName] = this.sanitizeServer(server, scannedMcpServers.sandbox);
      }
    }
    return userMcpServers;
  }
  fromWorkspaceFolderMcpServers(scannedWorkspaceFolderMcpServers) {
    const scannedMcpServers = {
      inputs: scannedWorkspaceFolderMcpServers.inputs,
      sandbox: scannedWorkspaceFolderMcpServers.sandbox
    };
    const servers = Object.entries(scannedWorkspaceFolderMcpServers.servers ?? {});
    if (servers.length > 0) {
      scannedMcpServers.servers = {};
      for (const [serverName, config] of servers) {
        scannedMcpServers.servers[serverName] = this.sanitizeServer(config, scannedWorkspaceFolderMcpServers.sandbox);
      }
    }
    return scannedMcpServers;
  }
  sanitizeServer(serverOrConfig, sandbox) {
    let server;
    if (serverOrConfig.config) {
      const oldScannedMcpServer = serverOrConfig;
      server = {
        ...oldScannedMcpServer.config,
        version: oldScannedMcpServer.version,
        gallery: oldScannedMcpServer.gallery
      };
    } else {
      server = serverOrConfig;
    }
    if (server.type === void 0 || server.type !== "http" && server.type !== "stdio") {
      server.type = server.command ? "stdio" : "http";
    }
    if (sandbox && server.type === "stdio" && !server.sandbox && server.sandboxEnabled) {
      server.sandbox = sandbox;
    }
    return server;
  }
  getResourceAccessQueue(file) {
    let resourceQueue = this.resourcesAccessQueueMap.get(file);
    if (!resourceQueue) {
      resourceQueue = new Queue();
      this.resourcesAccessQueueMap.set(file, resourceQueue);
    }
    return resourceQueue;
  }
};
McpResourceScannerService = __decorate([
  __param(0, IFileService),
  __param(1, IUriIdentityService)
], McpResourceScannerService);
registerSingleton(
  IMcpResourceScannerService,
  McpResourceScannerService,
  1
  /* InstantiationType.Delayed */
);
export {
  IMcpResourceScannerService,
  McpResourceScannerService
};
//# sourceMappingURL=mcpResourceScannerService.js.map
