var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { deepClone } from "../../../base/common/objects.js";
import { uppercaseFirstLetter } from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IMcpGalleryService } from "./mcpManagement.js";
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
let McpManagementService = class McpManagementService2 extends Disposable {
  static {
    __name(this, "McpManagementService");
  }
  get onDidInstallMcpServers() {
    return this._onDidInstallMcpServers.event;
  }
  get onUninstallMcpServer() {
    return this._onUninstallMcpServer.event;
  }
  get onDidUninstallMcpServer() {
    return this._onDidUninstallMcpServer.event;
  }
  constructor(configurationService, mcpGalleryService, fileService, environmentService, uriIdentityService, logService) {
    super();
    this.configurationService = configurationService;
    this.mcpGalleryService = mcpGalleryService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._onInstallMcpServer = this._register(new Emitter());
    this.onInstallMcpServer = this._onInstallMcpServer.event;
    this._onDidInstallMcpServers = this._register(new Emitter());
    this._onUninstallMcpServer = this._register(new Emitter());
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this.mcpLocation = uriIdentityService.extUri.joinPath(environmentService.userRoamingDataHome, "mcp");
  }
  async getInstalled() {
    const { userLocal } = this.configurationService.inspect("mcp");
    if (!userLocal?.value?.servers) {
      return [];
    }
    return Promise.all(Object.entries(userLocal.value.servers).map(([name, config]) => this.scanServer(name, config)));
  }
  async scanServer(name, config) {
    let scanned;
    let readmeUrl;
    if (config.location) {
      const manifestLocation = this.uriIdentityService.extUri.joinPath(URI.revive(config.location), "manifest.json");
      try {
        const content = await this.fileService.readFile(manifestLocation);
        scanned = JSON.parse(content.value.toString());
      } catch (e) {
        this.logService.error("MCP Management Service: failed to read manifest", config.location.toString(), e);
      }
      readmeUrl = this.uriIdentityService.extUri.joinPath(URI.revive(config.location), "README.md");
      if (!await this.fileService.exists(readmeUrl)) {
        readmeUrl = void 0;
      }
    }
    if (!scanned) {
      let publisher = "";
      const nameParts = name.split("/");
      if (nameParts.length > 0) {
        const domainParts = nameParts[0].split(".");
        if (domainParts.length > 0) {
          publisher = domainParts[domainParts.length - 1];
        }
      }
      scanned = {
        name,
        version: "1.0.0",
        displayName: nameParts[nameParts.length - 1].split("-").map((s) => uppercaseFirstLetter(s)).join(" "),
        publisher
      };
    }
    return {
      name,
      config,
      version: scanned.version,
      location: URI.revive(config.location),
      id: scanned.id,
      displayName: scanned.displayName,
      description: scanned.description,
      publisher: scanned.publisher,
      publisherDisplayName: scanned.publisherDisplayName,
      repositoryUrl: scanned.repositoryUrl,
      readmeUrl,
      iconUrl: scanned.iconUrl,
      manifest: scanned.manifest
    };
  }
  async installFromGallery(server, packageType) {
    this.logService.trace("MCP Management Service: installGallery", server.url);
    this._onInstallMcpServer.fire({ name: server.name });
    try {
      const manifest = await this.mcpGalleryService.getManifest(server, CancellationToken.None);
      const location = this.uriIdentityService.extUri.joinPath(this.mcpLocation, `${server.name.replace("/", ".")}-${server.version}`);
      const manifestPath = this.uriIdentityService.extUri.joinPath(location, "manifest.json");
      await this.fileService.writeFile(manifestPath, VSBuffer.fromString(JSON.stringify({
        id: server.id,
        name: server.name,
        displayName: server.displayName,
        description: server.description,
        version: server.version,
        publisher: server.publisher,
        publisherDisplayName: server.publisherDisplayName,
        repository: server.repositoryUrl,
        licenseUrl: server.licenseUrl,
        ...manifest
      })));
      if (server.readmeUrl) {
        const readme = await this.mcpGalleryService.getReadme(server, CancellationToken.None);
        await this.fileService.writeFile(this.uriIdentityService.extUri.joinPath(location, "README.md"), VSBuffer.fromString(readme));
      }
      const { userLocal } = this.configurationService.inspect("mcp");
      const value = deepClone(userLocal?.value ?? { servers: {} });
      if (!value.servers) {
        value.servers = {};
      }
      const serverConfig = this.getServerConfig(manifest, packageType);
      value.servers[server.name] = {
        ...serverConfig,
        location: location.toJSON()
      };
      if (serverConfig.inputs) {
        value.inputs = value.inputs ?? [];
        for (const input of serverConfig.inputs) {
          if (!value.inputs.some((i) => i.id === input.id)) {
            value.inputs.push({ ...input, serverName: server.name });
          }
        }
      }
      await this.configurationService.updateValue(
        "mcp",
        value,
        3
        /* ConfigurationTarget.USER_LOCAL */
      );
      const local = await this.scanServer(server.name, value.servers[server.name]);
      this._onDidInstallMcpServers.fire([{ name: server.name, source: server, local }]);
    } catch (e) {
      this._onDidInstallMcpServers.fire([{ name: server.name, source: server, error: e }]);
      throw e;
    }
  }
  async uninstall(server) {
    this.logService.trace("MCP Management Service: uninstall", server.name);
    this._onUninstallMcpServer.fire({ name: server.name });
    try {
      const { userLocal } = this.configurationService.inspect("mcp");
      const value = deepClone(userLocal?.value ?? { servers: {} });
      if (!value.servers) {
        value.servers = {};
      }
      delete value.servers[server.name];
      if (value.inputs) {
        const index = value.inputs.findIndex((i) => i.serverName === server.name);
        if (index !== void 0 && index >= 0) {
          value.inputs?.splice(index, 1);
        }
      }
      await this.configurationService.updateValue(
        "mcp",
        value,
        3
        /* ConfigurationTarget.USER_LOCAL */
      );
      if (server.location) {
        await this.fileService.del(URI.revive(server.location), { recursive: true });
      }
      this._onDidUninstallMcpServer.fire({ name: server.name });
    } catch (e) {
      this._onDidUninstallMcpServer.fire({ name: server.name, error: e });
      throw e;
    }
  }
  getServerConfig(manifest, packageType) {
    if (packageType === void 0) {
      packageType = manifest.packages?.[0]?.registry_name ?? "remote";
    }
    if (packageType === "remote") {
      const inputs2 = [];
      const headers = {};
      for (const input of manifest.remotes[0].headers ?? []) {
        headers[input.name] = input.value;
        if (input.variables) {
          inputs2.push(...this.getVariables(input.variables));
        }
      }
      return {
        type: "http",
        url: manifest.remotes[0].url,
        headers: Object.keys(headers).length ? headers : void 0,
        inputs: inputs2.length ? inputs2 : void 0
      };
    }
    const serverPackage = manifest.packages.find((p) => p.registry_name === packageType) ?? manifest.packages[0];
    const inputs = [];
    const args = [];
    const env = {};
    if (serverPackage.registry_name === "docker") {
      args.push("run");
      args.push("-i");
      args.push("--rm");
    }
    for (const arg of serverPackage.runtime_arguments ?? []) {
      if (arg.type === "positional") {
        args.push(arg.value ?? arg.value_hint);
      } else if (arg.type === "named") {
        args.push(arg.name);
        if (arg.value) {
          args.push(arg.value);
        }
      }
      if (arg.variables) {
        inputs.push(...this.getVariables(arg.variables));
      }
    }
    for (const input of serverPackage.environment_variables ?? []) {
      const variables = input.variables ? this.getVariables(input.variables) : [];
      let value = input.value;
      for (const variable of variables) {
        value = value.replace(`{${variable.id}}`, `\${input:${variable.id}}`);
      }
      env[input.name] = value;
      if (variables.length) {
        inputs.push(...variables);
      }
      if (serverPackage.registry_name === "docker") {
        args.push("-e");
        args.push(input.name);
      }
    }
    if (serverPackage.registry_name === "npm") {
      args.push(`${serverPackage.name}@${serverPackage.version}`);
    } else if (serverPackage.registry_name === "pypi") {
      args.push(`${serverPackage.name}==${serverPackage.version}`);
    } else if (serverPackage.registry_name === "docker") {
      args.push(`${serverPackage.name}:${serverPackage.version}`);
    }
    for (const arg of serverPackage.package_arguments ?? []) {
      if (arg.type === "positional") {
        args.push(arg.value ?? arg.value_hint);
      } else if (arg.type === "named") {
        args.push(arg.name);
        if (arg.value) {
          args.push(arg.value);
        }
      }
      if (arg.variables) {
        inputs.push(...this.getVariables(arg.variables));
      }
    }
    return {
      type: "stdio",
      command: this.getCommandName(serverPackage.registry_name),
      args: args.length ? args : void 0,
      env: Object.keys(env).length ? env : void 0,
      inputs: inputs.length ? inputs : void 0
    };
  }
  getCommandName(packageType) {
    switch (packageType) {
      case "npm":
        return "npx";
      case "docker":
        return "docker";
      case "pypi":
        return "uvx";
    }
    return packageType;
  }
  getVariables(variableInputs) {
    const variables = [];
    for (const [key, value] of Object.entries(variableInputs)) {
      variables.push({
        id: key,
        type: value.choices ? "pickString" : "promptString",
        description: value.description ?? "",
        password: !!value.is_secret,
        default: value.default,
        options: value.choices
      });
    }
    return variables;
  }
};
McpManagementService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IMcpGalleryService),
  __param(2, IFileService),
  __param(3, IEnvironmentService),
  __param(4, IUriIdentityService),
  __param(5, ILogService)
], McpManagementService);
export {
  McpManagementService
};
//# sourceMappingURL=mcpManagementService.js.map
