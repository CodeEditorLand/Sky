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
import { RunOnceScheduler } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { MarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { equals } from "../../../base/common/objects.js";
import { isString } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { IMcpGalleryService, IAllowedMcpServersService } from "./mcpManagement.js";
import { IMcpResourceScannerService } from "./mcpResourceScannerService.js";
let AbstractCommonMcpManagementService = class AbstractCommonMcpManagementService2 extends Disposable {
  static {
    __name(this, "AbstractCommonMcpManagementService");
  }
  constructor(logService) {
    super();
    this.logService = logService;
  }
  getMcpServerConfigurationFromManifest(manifest, packageType) {
    if (packageType === "remote" && manifest.remotes?.length) {
      const url = manifest.remotes[0].url;
      const headers = manifest.remotes[0].headers ?? [];
      const { inputs: inputs2, variables } = this.processKeyValueInputs(url.startsWith("https://api.githubcopilot.com/mcp") ? headers.filter((h) => h.name.toLowerCase() !== "authorization") : headers);
      return {
        mcpServerConfiguration: {
          config: {
            type: "http",
            url: manifest.remotes[0].url,
            headers: Object.keys(inputs2).length ? inputs2 : void 0
          },
          inputs: variables.length ? variables : void 0
        },
        notices: []
      };
    }
    const serverPackage = manifest.packages?.find((p) => p.registryType === packageType) ?? manifest.packages?.[0];
    if (!serverPackage) {
      throw new Error(`No server package found`);
    }
    const args = [];
    const inputs = [];
    const env = {};
    const notices = [];
    if (serverPackage.registryType === "oci") {
      args.push("run");
      args.push("-i");
      args.push("--rm");
    }
    if (serverPackage.runtimeArguments?.length) {
      const result = this.processArguments(serverPackage.runtimeArguments ?? []);
      args.push(...result.args);
      inputs.push(...result.variables);
      notices.push(...result.notices);
    }
    if (serverPackage.environmentVariables?.length) {
      const { inputs: envInputs, variables: envVariables, notices: envNotices } = this.processKeyValueInputs(serverPackage.environmentVariables ?? []);
      inputs.push(...envVariables);
      notices.push(...envNotices);
      for (const [name, value] of Object.entries(envInputs)) {
        env[name] = value;
        if (serverPackage.registryType === "oci") {
          args.push("-e");
          args.push(name);
        }
      }
    }
    switch (serverPackage.registryType) {
      case "npm":
        if (serverPackage.registryBaseUrl) {
          args.push("--registry", serverPackage.registryBaseUrl);
        }
        args.push(serverPackage.version ? `${serverPackage.identifier}@${serverPackage.version}` : serverPackage.identifier);
        break;
      case "pypi":
        if (serverPackage.registryBaseUrl) {
          args.push("--index-url", serverPackage.registryBaseUrl);
        }
        args.push(serverPackage.version ? `${serverPackage.identifier}@${serverPackage.version}` : serverPackage.identifier);
        break;
      case "oci": {
        const dockerIdentifier = serverPackage.registryBaseUrl ? `${serverPackage.registryBaseUrl}/${serverPackage.identifier}` : serverPackage.identifier;
        args.push(serverPackage.version ? `${dockerIdentifier}:${serverPackage.version}` : dockerIdentifier);
        break;
      }
      case "nuget":
        args.push(serverPackage.version ? `${serverPackage.identifier}@${serverPackage.version}` : serverPackage.identifier);
        args.push("--yes");
        if (serverPackage.registryBaseUrl) {
          args.push("--source", serverPackage.registryBaseUrl);
        }
        if (serverPackage.packageArguments?.length) {
          args.push("--");
        }
        break;
    }
    if (serverPackage.packageArguments?.length) {
      const result = this.processArguments(serverPackage.packageArguments);
      args.push(...result.args);
      inputs.push(...result.variables);
      notices.push(...result.notices);
    }
    return {
      notices,
      mcpServerConfiguration: {
        config: {
          type: "stdio",
          command: this.getCommandName(serverPackage.registryType),
          args: args.length ? args : void 0,
          env: Object.keys(env).length ? env : void 0
        },
        inputs: inputs.length ? inputs : void 0
      }
    };
  }
  getCommandName(packageType) {
    switch (packageType) {
      case "npm":
        return "npx";
      case "oci":
        return "docker";
      case "pypi":
        return "uvx";
      case "nuget":
        return "dnx";
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
        password: !!value.isSecret,
        default: value.default,
        options: value.choices
      });
    }
    return variables;
  }
  processKeyValueInputs(keyValueInputs) {
    const notices = [];
    const inputs = {};
    const variables = [];
    for (const input of keyValueInputs) {
      const inputVariables = input.variables ? this.getVariables(input.variables) : [];
      let value = input.value || "";
      if (inputVariables.length) {
        for (const variable of inputVariables) {
          value = value.replace(`{${variable.id}}`, `\${input:${variable.id}}`);
        }
        variables.push(...inputVariables);
      } else if (!value && (input.description || input.choices || input.default !== void 0)) {
        variables.push({
          id: input.name,
          type: input.choices ? "pickString" : "promptString",
          description: input.description ?? "",
          password: !!input.isSecret,
          default: input.default,
          options: input.choices
        });
        value = `\${input:${input.name}}`;
      }
      inputs[input.name] = value;
    }
    return { inputs, variables, notices };
  }
  processArguments(argumentsList) {
    const args = [];
    const variables = [];
    const notices = [];
    for (const arg of argumentsList) {
      const argVariables = arg.variables ? this.getVariables(arg.variables) : [];
      if (arg.type === "positional") {
        let value = arg.value;
        if (value) {
          for (const variable of argVariables) {
            value = value.replace(`{${variable.id}}`, `\${input:${variable.id}}`);
          }
          args.push(value);
          if (argVariables.length) {
            variables.push(...argVariables);
          }
        } else if (arg.valueHint && (arg.description || arg.default !== void 0)) {
          variables.push({
            id: arg.valueHint,
            type: "promptString",
            description: arg.description ?? "",
            password: false,
            default: arg.default
          });
          args.push(`\${input:${arg.valueHint}}`);
        } else {
          args.push(arg.valueHint ?? "");
        }
      } else if (arg.type === "named") {
        if (!arg.name) {
          notices.push(`Named argument is missing a name. ${JSON.stringify(arg)}`);
          continue;
        }
        args.push(arg.name);
        if (arg.value) {
          let value = arg.value;
          for (const variable of argVariables) {
            value = value.replace(`{${variable.id}}`, `\${input:${variable.id}}`);
          }
          args.push(value);
          if (argVariables.length) {
            variables.push(...argVariables);
          }
        } else if (arg.description || arg.default !== void 0) {
          const variableId = arg.name.replace(/^--?/, "");
          variables.push({
            id: variableId,
            type: "promptString",
            description: arg.description ?? "",
            password: false,
            default: arg.default
          });
          args.push(`\${input:${variableId}}`);
        }
      }
    }
    return { args, variables, notices };
  }
};
AbstractCommonMcpManagementService = __decorate([
  __param(0, ILogService)
], AbstractCommonMcpManagementService);
let AbstractMcpResourceManagementService = class AbstractMcpResourceManagementService2 extends AbstractCommonMcpManagementService {
  static {
    __name(this, "AbstractMcpResourceManagementService");
  }
  get onDidInstallMcpServers() {
    return this._onDidInstallMcpServers.event;
  }
  get onDidUpdateMcpServers() {
    return this._onDidUpdateMcpServers.event;
  }
  get onUninstallMcpServer() {
    return this._onUninstallMcpServer.event;
  }
  get onDidUninstallMcpServer() {
    return this._onDidUninstallMcpServer.event;
  }
  constructor(mcpResource, target, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService) {
    super(logService);
    this.mcpResource = mcpResource;
    this.target = target;
    this.mcpGalleryService = mcpGalleryService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.mcpResourceScannerService = mcpResourceScannerService;
    this.local = /* @__PURE__ */ new Map();
    this._onInstallMcpServer = this._register(new Emitter());
    this.onInstallMcpServer = this._onInstallMcpServer.event;
    this._onDidInstallMcpServers = this._register(new Emitter());
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this._onUninstallMcpServer = this._register(new Emitter());
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.updateLocal(), 50));
  }
  initialize() {
    if (!this.initializePromise) {
      this.initializePromise = (async () => {
        try {
          this.local = await this.populateLocalServers();
        } finally {
          this.startWatching();
        }
      })();
    }
    return this.initializePromise;
  }
  async populateLocalServers() {
    this.logService.trace("AbstractMcpResourceManagementService#populateLocalServers", this.mcpResource.toString());
    const local = /* @__PURE__ */ new Map();
    try {
      const scannedMcpServers = await this.mcpResourceScannerService.scanMcpServers(this.mcpResource, this.target);
      if (scannedMcpServers.servers) {
        await Promise.allSettled(Object.entries(scannedMcpServers.servers).map(async ([name, scannedServer]) => {
          const server = await this.scanLocalServer(name, scannedServer, scannedMcpServers.sandbox);
          local.set(name, server);
        }));
      }
    } catch (error) {
      this.logService.debug("Could not read user MCP servers:", error);
      throw error;
    }
    return local;
  }
  startWatching() {
    this._register(this.fileService.watch(this.mcpResource));
    this._register(this.fileService.onDidFilesChange((e) => {
      if (e.affects(this.mcpResource)) {
        this.reloadConfigurationScheduler.schedule();
      }
    }));
  }
  async updateLocal() {
    try {
      const current = await this.populateLocalServers();
      const added = [];
      const updated = [];
      const removed = [...this.local.keys()].filter((name) => !current.has(name));
      for (const server of removed) {
        this.local.delete(server);
      }
      for (const [name, server] of current) {
        const previous = this.local.get(name);
        if (previous) {
          if (!equals(previous, server)) {
            updated.push(server);
            this.local.set(name, server);
          }
        } else {
          added.push(server);
          this.local.set(name, server);
        }
      }
      for (const server of removed) {
        this.local.delete(server);
        this._onDidUninstallMcpServer.fire({ name: server, mcpResource: this.mcpResource });
      }
      if (updated.length) {
        this._onDidUpdateMcpServers.fire(updated.map((server) => ({ name: server.name, local: server, mcpResource: this.mcpResource })));
      }
      if (added.length) {
        this._onDidInstallMcpServers.fire(added.map((server) => ({ name: server.name, local: server, mcpResource: this.mcpResource })));
      }
    } catch (error) {
      this.logService.error("Failed to load installed MCP servers:", error);
    }
  }
  async getInstalled() {
    await this.initialize();
    return Array.from(this.local.values());
  }
  async scanLocalServer(name, config, rootSandbox) {
    let mcpServerInfo = await this.getLocalServerInfo(name, config);
    if (!mcpServerInfo) {
      mcpServerInfo = { name, version: config.version, galleryUrl: isString(config.gallery) ? config.gallery : void 0 };
    }
    return {
      name,
      config,
      rootSandbox,
      mcpResource: this.mcpResource,
      version: mcpServerInfo.version,
      location: mcpServerInfo.location,
      displayName: mcpServerInfo.displayName,
      description: mcpServerInfo.description,
      publisher: mcpServerInfo.publisher,
      publisherDisplayName: mcpServerInfo.publisherDisplayName,
      galleryUrl: mcpServerInfo.galleryUrl,
      galleryId: mcpServerInfo.galleryId,
      repositoryUrl: mcpServerInfo.repositoryUrl,
      readmeUrl: mcpServerInfo.readmeUrl,
      icon: mcpServerInfo.icon,
      codicon: mcpServerInfo.codicon,
      manifest: mcpServerInfo.manifest,
      source: config.gallery ? "gallery" : "local"
    };
  }
  async install(server, options) {
    this.logService.trace("MCP Management Service: install", server.name);
    this._onInstallMcpServer.fire({ name: server.name, mcpResource: this.mcpResource });
    try {
      await this.mcpResourceScannerService.addMcpServers([server], this.mcpResource, this.target);
      await this.updateLocal();
      const local = this.local.get(server.name);
      if (!local) {
        throw new Error(`Failed to install MCP server: ${server.name}`);
      }
      return local;
    } catch (e) {
      this._onDidInstallMcpServers.fire([{ name: server.name, error: e, mcpResource: this.mcpResource }]);
      throw e;
    }
  }
  async uninstall(server, options) {
    this.logService.trace("MCP Management Service: uninstall", server.name);
    this._onUninstallMcpServer.fire({ name: server.name, mcpResource: this.mcpResource });
    try {
      const currentServers = await this.mcpResourceScannerService.scanMcpServers(this.mcpResource, this.target);
      if (!currentServers.servers) {
        return;
      }
      await this.mcpResourceScannerService.removeMcpServers([server.name], this.mcpResource, this.target);
      if (server.location) {
        await this.fileService.del(URI.revive(server.location), { recursive: true });
      }
      await this.updateLocal();
    } catch (e) {
      this._onDidUninstallMcpServer.fire({ name: server.name, error: e, mcpResource: this.mcpResource });
      throw e;
    }
  }
};
AbstractMcpResourceManagementService = __decorate([
  __param(2, IMcpGalleryService),
  __param(3, IFileService),
  __param(4, IUriIdentityService),
  __param(5, ILogService),
  __param(6, IMcpResourceScannerService)
], AbstractMcpResourceManagementService);
let McpUserResourceManagementService = class McpUserResourceManagementService2 extends AbstractMcpResourceManagementService {
  static {
    __name(this, "McpUserResourceManagementService");
  }
  constructor(mcpResource, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService, environmentService) {
    super(mcpResource, 2, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService);
    this.mcpLocation = uriIdentityService.extUri.joinPath(environmentService.userRoamingDataHome, "mcp");
  }
  async installFromGallery(server, options) {
    throw new Error("Not supported");
  }
  async updateMetadata(local, gallery) {
    await this.updateMetadataFromGallery(gallery);
    await this.updateLocal();
    const updatedLocal = (await this.getInstalled()).find((s) => s.name === local.name);
    if (!updatedLocal) {
      throw new Error(`Failed to find MCP server: ${local.name}`);
    }
    return updatedLocal;
  }
  async updateMetadataFromGallery(gallery) {
    const manifest = gallery.configuration;
    const location = this.getLocation(gallery.name, gallery.version);
    const manifestPath = this.uriIdentityService.extUri.joinPath(location, "manifest.json");
    const local = {
      galleryUrl: gallery.galleryUrl,
      galleryId: gallery.id,
      name: gallery.name,
      displayName: gallery.displayName,
      description: gallery.description,
      version: gallery.version,
      publisher: gallery.publisher,
      publisherDisplayName: gallery.publisherDisplayName,
      repositoryUrl: gallery.repositoryUrl,
      licenseUrl: gallery.license,
      icon: gallery.icon,
      codicon: gallery.codicon,
      manifest
    };
    await this.fileService.writeFile(manifestPath, VSBuffer.fromString(JSON.stringify(local)));
    if (gallery.readmeUrl || gallery.readme) {
      const readme = gallery.readme ? gallery.readme : await this.mcpGalleryService.getReadme(gallery, CancellationToken.None);
      await this.fileService.writeFile(this.uriIdentityService.extUri.joinPath(location, "README.md"), VSBuffer.fromString(readme));
    }
    return manifest;
  }
  async getLocalServerInfo(name, mcpServerConfig) {
    let storedMcpServerInfo;
    let location;
    let readmeUrl;
    if (mcpServerConfig.gallery) {
      location = this.getLocation(name, mcpServerConfig.version);
      const manifestLocation = this.uriIdentityService.extUri.joinPath(location, "manifest.json");
      try {
        const content = await this.fileService.readFile(manifestLocation);
        storedMcpServerInfo = JSON.parse(content.value.toString());
        if (storedMcpServerInfo.galleryUrl?.includes("/v0/")) {
          storedMcpServerInfo.galleryUrl = storedMcpServerInfo.galleryUrl.substring(0, storedMcpServerInfo.galleryUrl.indexOf("/v0/"));
          await this.fileService.writeFile(manifestLocation, VSBuffer.fromString(JSON.stringify(storedMcpServerInfo)));
        }
        storedMcpServerInfo.location = location;
        readmeUrl = this.uriIdentityService.extUri.joinPath(location, "README.md");
        if (!await this.fileService.exists(readmeUrl)) {
          readmeUrl = void 0;
        }
        storedMcpServerInfo.readmeUrl = readmeUrl;
      } catch (e) {
        this.logService.error("MCP Management Service: failed to read manifest", location.toString(), e);
      }
    }
    return storedMcpServerInfo;
  }
  getLocation(name, version) {
    name = name.replace("/", ".");
    return this.uriIdentityService.extUri.joinPath(this.mcpLocation, version ? `${name}-${version}` : name);
  }
  installFromUri(uri, options) {
    throw new Error("Method not supported.");
  }
  canInstall() {
    throw new Error("Not supported");
  }
};
McpUserResourceManagementService = __decorate([
  __param(1, IMcpGalleryService),
  __param(2, IFileService),
  __param(3, IUriIdentityService),
  __param(4, ILogService),
  __param(5, IMcpResourceScannerService),
  __param(6, IEnvironmentService)
], McpUserResourceManagementService);
let AbstractMcpManagementService = class AbstractMcpManagementService2 extends AbstractCommonMcpManagementService {
  static {
    __name(this, "AbstractMcpManagementService");
  }
  constructor(allowedMcpServersService, logService) {
    super(logService);
    this.allowedMcpServersService = allowedMcpServersService;
  }
  canInstall(server) {
    const allowedToInstall = this.allowedMcpServersService.isAllowed(server);
    if (allowedToInstall !== true) {
      return new MarkdownString(localize("not allowed to install", "This mcp server cannot be installed because {0}", allowedToInstall.value));
    }
    return true;
  }
};
AbstractMcpManagementService = __decorate([
  __param(0, IAllowedMcpServersService),
  __param(1, ILogService)
], AbstractMcpManagementService);
let McpManagementService = class McpManagementService2 extends AbstractMcpManagementService {
  static {
    __name(this, "McpManagementService");
  }
  constructor(allowedMcpServersService, logService, userDataProfilesService, instantiationService) {
    super(allowedMcpServersService, logService);
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
    this._onInstallMcpServer = this._register(new Emitter());
    this.onInstallMcpServer = this._onInstallMcpServer.event;
    this._onDidInstallMcpServers = this._register(new Emitter());
    this.onDidInstallMcpServers = this._onDidInstallMcpServers.event;
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this.onDidUpdateMcpServers = this._onDidUpdateMcpServers.event;
    this._onUninstallMcpServer = this._register(new Emitter());
    this.onUninstallMcpServer = this._onUninstallMcpServer.event;
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this.onDidUninstallMcpServer = this._onDidUninstallMcpServer.event;
    this.mcpResourceManagementServices = new ResourceMap();
  }
  getMcpResourceManagementService(mcpResource) {
    let mcpResourceManagementService = this.mcpResourceManagementServices.get(mcpResource);
    if (!mcpResourceManagementService) {
      const disposables = new DisposableStore();
      const service = disposables.add(this.createMcpResourceManagementService(mcpResource));
      disposables.add(service.onInstallMcpServer((e) => this._onInstallMcpServer.fire(e)));
      disposables.add(service.onDidInstallMcpServers((e) => this._onDidInstallMcpServers.fire(e)));
      disposables.add(service.onDidUpdateMcpServers((e) => this._onDidUpdateMcpServers.fire(e)));
      disposables.add(service.onUninstallMcpServer((e) => this._onUninstallMcpServer.fire(e)));
      disposables.add(service.onDidUninstallMcpServer((e) => this._onDidUninstallMcpServer.fire(e)));
      this.mcpResourceManagementServices.set(mcpResource, mcpResourceManagementService = { service, dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose") });
    }
    return mcpResourceManagementService.service;
  }
  async getInstalled(mcpResource) {
    const mcpResourceUri = mcpResource || this.userDataProfilesService.defaultProfile.mcpResource;
    return this.getMcpResourceManagementService(mcpResourceUri).getInstalled();
  }
  async install(server, options) {
    const mcpResourceUri = options?.mcpResource || this.userDataProfilesService.defaultProfile.mcpResource;
    return this.getMcpResourceManagementService(mcpResourceUri).install(server, options);
  }
  async uninstall(server, options) {
    const mcpResourceUri = options?.mcpResource || this.userDataProfilesService.defaultProfile.mcpResource;
    return this.getMcpResourceManagementService(mcpResourceUri).uninstall(server, options);
  }
  async installFromGallery(server, options) {
    const mcpResourceUri = options?.mcpResource || this.userDataProfilesService.defaultProfile.mcpResource;
    return this.getMcpResourceManagementService(mcpResourceUri).installFromGallery(server, options);
  }
  async updateMetadata(local, gallery, mcpResource) {
    return this.getMcpResourceManagementService(mcpResource || this.userDataProfilesService.defaultProfile.mcpResource).updateMetadata(local, gallery);
  }
  dispose() {
    this.mcpResourceManagementServices.forEach((service) => service.dispose());
    this.mcpResourceManagementServices.clear();
    super.dispose();
  }
  createMcpResourceManagementService(mcpResource) {
    return this.instantiationService.createInstance(McpUserResourceManagementService, mcpResource);
  }
};
McpManagementService = __decorate([
  __param(0, IAllowedMcpServersService),
  __param(1, ILogService),
  __param(2, IUserDataProfilesService),
  __param(3, IInstantiationService)
], McpManagementService);
export {
  AbstractCommonMcpManagementService,
  AbstractMcpManagementService,
  AbstractMcpResourceManagementService,
  McpManagementService,
  McpUserResourceManagementService
};
//# sourceMappingURL=mcpManagementService.js.map
