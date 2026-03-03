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
import { Emitter, Event } from "../../../../base/common/event.js";
import { createCommandUri, MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IMcpGalleryService, mcpAccessConfig, IAllowedMcpServersService } from "../../../../platform/mcp/common/mcpManagement.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IURLService } from "../../../../platform/url/common/url.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { MCP_CONFIGURATION_KEY, WORKSPACE_STANDALONE_CONFIGURATIONS } from "../../../services/configuration/common/configuration.js";
import { ACTIVE_GROUP, IEditorService, MODAL_GROUP } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IWorkbenchMcpManagementService, REMOTE_USER_CONFIG_ID, USER_CONFIG_ID, WORKSPACE_CONFIG_ID, WORKSPACE_FOLDER_CONFIG_ID_PREFIX } from "../../../services/mcp/common/mcpWorkbenchManagementService.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { mcpConfigurationSection } from "../common/mcpConfiguration.js";
import { HasInstalledMcpServersContext, IMcpService, IMcpWorkbenchService, McpServersGalleryStatusContext } from "../common/mcpTypes.js";
import { McpServerEditorInput } from "./mcpServerEditorInput.js";
import { IMcpGalleryManifestService } from "../../../../platform/mcp/common/mcpGalleryManifest.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { runOnChange } from "../../../../base/common/observable.js";
import Severity from "../../../../base/common/severity.js";
import { Queue } from "../../../../base/common/async.js";
let McpWorkbenchServer = class McpWorkbenchServer2 {
  static {
    __name(this, "McpWorkbenchServer");
  }
  constructor(installStateProvider, runtimeStateProvider, local, gallery, installable, mcpGalleryService, fileService) {
    this.installStateProvider = installStateProvider;
    this.runtimeStateProvider = runtimeStateProvider;
    this.local = local;
    this.gallery = gallery;
    this.installable = installable;
    this.mcpGalleryService = mcpGalleryService;
    this.fileService = fileService;
    this.local = local;
  }
  get id() {
    return this.local?.id ?? this.gallery?.name ?? this.installable?.name ?? this.name;
  }
  get name() {
    return this.gallery?.name ?? this.local?.name ?? this.installable?.name ?? "";
  }
  get label() {
    return this.gallery?.displayName ?? this.local?.displayName ?? this.local?.name ?? this.installable?.name ?? "";
  }
  get icon() {
    return this.gallery?.icon ?? this.local?.icon;
  }
  get installState() {
    return this.installStateProvider(this);
  }
  get codicon() {
    return this.gallery?.codicon ?? this.local?.codicon;
  }
  get publisherDisplayName() {
    return this.gallery?.publisherDisplayName ?? this.local?.publisherDisplayName ?? this.gallery?.publisher ?? this.local?.publisher;
  }
  get publisherUrl() {
    return this.gallery?.publisherDomain?.link;
  }
  get description() {
    return this.gallery?.description ?? this.local?.description ?? "";
  }
  get starsCount() {
    return this.gallery?.starsCount ?? 0;
  }
  get license() {
    return this.gallery?.license;
  }
  get repository() {
    return this.gallery?.repositoryUrl;
  }
  get config() {
    return this.local?.config ?? this.installable?.config;
  }
  get runtimeStatus() {
    return this.runtimeStateProvider(this);
  }
  get readmeUrl() {
    return this.local?.readmeUrl ?? (this.gallery?.readmeUrl ? URI.parse(this.gallery.readmeUrl) : void 0);
  }
  async getReadme(token) {
    if (this.local?.readmeUrl) {
      const content = await this.fileService.readFile(this.local.readmeUrl);
      return content.value.toString();
    }
    if (this.gallery?.readme) {
      return this.gallery.readme;
    }
    if (this.gallery?.readmeUrl) {
      return this.mcpGalleryService.getReadme(this.gallery, token);
    }
    return Promise.reject(new Error("not available"));
  }
  async getManifest(token) {
    if (this.local?.manifest) {
      return this.local.manifest;
    }
    if (this.gallery) {
      return this.gallery.configuration;
    }
    throw new Error("No manifest available");
  }
};
McpWorkbenchServer = __decorate([
  __param(5, IMcpGalleryService),
  __param(6, IFileService)
], McpWorkbenchServer);
let McpWorkbenchService = class McpWorkbenchService2 extends Disposable {
  static {
    __name(this, "McpWorkbenchService");
  }
  get local() {
    return [...this._local];
  }
  constructor(mcpGalleryManifestService, mcpGalleryService, mcpManagementService, editorService, userDataProfilesService, uriIdentityService, workspaceService, environmentService, labelService, productService, remoteAgentService, configurationService, instantiationService, telemetryService, logService, extensionsWorkbenchService, allowedMcpServersService, mcpService, urlService) {
    super();
    this.mcpGalleryService = mcpGalleryService;
    this.mcpManagementService = mcpManagementService;
    this.editorService = editorService;
    this.userDataProfilesService = userDataProfilesService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceService = workspaceService;
    this.environmentService = environmentService;
    this.labelService = labelService;
    this.productService = productService;
    this.remoteAgentService = remoteAgentService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.allowedMcpServersService = allowedMcpServersService;
    this.mcpService = mcpService;
    this.installing = [];
    this.uninstalling = [];
    this._local = [];
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._onReset = this._register(new Emitter());
    this.onReset = this._onReset.event;
    this._register(this.mcpManagementService.onDidInstallMcpServersInCurrentProfile((e) => this.onDidInstallMcpServers(e)));
    this._register(this.mcpManagementService.onDidUpdateMcpServersInCurrentProfile((e) => this.onDidUpdateMcpServers(e)));
    this._register(this.mcpManagementService.onDidUninstallMcpServerInCurrentProfile((e) => this.onDidUninstallMcpServer(e)));
    this._register(this.mcpManagementService.onDidChangeProfile((e) => this.onDidChangeProfile()));
    this.queryLocal().then(() => {
      if (this._store.isDisposed) {
        return;
      }
      const queue = this._register(new Queue());
      this._register(mcpGalleryManifestService.onDidChangeMcpGalleryManifest((e) => queue.queue(() => this.syncInstalledMcpServers())));
      queue.queue(() => this.syncInstalledMcpServers());
    });
    urlService.registerHandler(this);
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpAccessConfig)) {
        this._onChange.fire(void 0);
      }
    }));
    this._register(this.allowedMcpServersService.onDidChangeAllowedMcpServers(() => {
      this._local = this.sort(this._local);
      this._onChange.fire(void 0);
    }));
    this._register(runOnChange(mcpService.servers, () => {
      this._local = this.sort(this._local);
      this._onChange.fire(void 0);
    }));
  }
  async onDidChangeProfile() {
    await this.queryLocal();
    this._onChange.fire(void 0);
    this._onReset.fire();
  }
  areSameMcpServers(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.name === b.name && a.scope === b.scope;
  }
  onDidUninstallMcpServer(e) {
    if (e.error) {
      return;
    }
    const uninstalled = this._local.find((server) => this.areSameMcpServers(server.local, e));
    if (uninstalled) {
      this._local = this._local.filter((server) => server !== uninstalled);
      this._onChange.fire(uninstalled);
    }
  }
  onDidInstallMcpServers(e) {
    const servers = [];
    for (const { local, source, name } of e) {
      let server = this.installing.find((server2) => server2.local && local ? this.areSameMcpServers(server2.local, local) : server2.name === name);
      this.installing = server ? this.installing.filter((e2) => e2 !== server) : this.installing;
      if (local) {
        if (server) {
          server.local = local;
        } else {
          server = this.instantiationService.createInstance(McpWorkbenchServer, (e2) => this.getInstallState(e2), (e2) => this.getRuntimeStatus(e2), local, source, void 0);
        }
        if (!local.galleryUrl) {
          server.gallery = void 0;
        }
        this._local = this._local.filter((server2) => !this.areSameMcpServers(server2.local, local));
        this.addServer(server);
      }
      this._onChange.fire(server);
    }
    if (servers.some((server) => server.local?.galleryUrl && !server.gallery)) {
      this.syncInstalledMcpServers();
    }
  }
  onDidUpdateMcpServers(e) {
    for (const result of e) {
      if (!result.local) {
        continue;
      }
      const serverIndex = this._local.findIndex((server2) => this.areSameMcpServers(server2.local, result.local));
      let server;
      if (serverIndex !== -1) {
        this._local[serverIndex].local = result.local;
        server = this._local[serverIndex];
      } else {
        server = this.instantiationService.createInstance(McpWorkbenchServer, (e2) => this.getInstallState(e2), (e2) => this.getRuntimeStatus(e2), result.local, result.source, void 0);
        this.addServer(server);
      }
      this._onChange.fire(server);
    }
  }
  fromGallery(gallery) {
    for (const local of this._local) {
      if (local.name === gallery.name) {
        local.gallery = gallery;
        return local;
      }
    }
    return void 0;
  }
  async syncInstalledMcpServers() {
    const infos = [];
    for (const installed of this.local) {
      if (installed.local?.source !== "gallery") {
        continue;
      }
      if (installed.local.galleryUrl) {
        infos.push({ name: installed.local.name, id: installed.local.galleryId });
      }
    }
    if (infos.length) {
      const galleryServers = await this.mcpGalleryService.getMcpServersFromGallery(infos);
      await this.syncInstalledMcpServersWithGallery(galleryServers);
    }
  }
  async syncInstalledMcpServersWithGallery(gallery) {
    const galleryMap = new Map(gallery.map((server) => [server.name, server]));
    for (const mcpServer of this.local) {
      if (!mcpServer.local) {
        continue;
      }
      const key = mcpServer.local.name;
      const gallery2 = key ? galleryMap.get(key) : void 0;
      if (!gallery2 || gallery2.galleryUrl !== mcpServer.local.galleryUrl) {
        if (mcpServer.gallery) {
          mcpServer.gallery = void 0;
          this._onChange.fire(mcpServer);
        }
        continue;
      }
      mcpServer.gallery = gallery2;
      if (!mcpServer.local.manifest) {
        mcpServer.local = await this.mcpManagementService.updateMetadata(mcpServer.local, gallery2);
      }
      this._onChange.fire(mcpServer);
    }
  }
  async queryGallery(options, token) {
    if (!this.mcpGalleryService.isEnabled()) {
      return {
        firstPage: { items: [], hasMore: false },
        getNextPage: /* @__PURE__ */ __name(async () => ({ items: [], hasMore: false }), "getNextPage")
      };
    }
    const pager = await this.mcpGalleryService.query(options, token);
    const mapPage = /* @__PURE__ */ __name((page) => ({
      items: page.items.map((gallery) => this.fromGallery(gallery) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e) => this.getInstallState(e), (e) => this.getRuntimeStatus(e), void 0, gallery, void 0)),
      hasMore: page.hasMore
    }), "mapPage");
    return {
      firstPage: mapPage(pager.firstPage),
      getNextPage: /* @__PURE__ */ __name(async (ct) => {
        const nextPage = await pager.getNextPage(ct);
        return mapPage(nextPage);
      }, "getNextPage")
    };
  }
  async queryLocal() {
    const installed = await this.mcpManagementService.getInstalled();
    this._local = this.sort(installed.map((i) => {
      const existing = this._local.find((local2) => local2.id === i.id);
      const local = existing ?? this.instantiationService.createInstance(McpWorkbenchServer, (e) => this.getInstallState(e), (e) => this.getRuntimeStatus(e), void 0, void 0, void 0);
      local.local = i;
      return local;
    }));
    this._onChange.fire(void 0);
    return [...this.local];
  }
  addServer(server) {
    this._local.push(server);
    this._local = this.sort(this._local);
  }
  sort(local) {
    return local.sort((a, b) => {
      if (a.name === b.name) {
        if (!a.runtimeStatus || a.runtimeStatus.state === 2) {
          return -1;
        }
        if (!b.runtimeStatus || b.runtimeStatus.state === 2) {
          return 1;
        }
        return 0;
      }
      return a.name.localeCompare(b.name);
    });
  }
  getEnabledLocalMcpServers() {
    const result = /* @__PURE__ */ new Map();
    const userRemote = [];
    const workspace = [];
    for (const server of this.local) {
      const enablementStatus = this.getEnablementStatus(server);
      if (enablementStatus && enablementStatus.state !== 2) {
        continue;
      }
      if (server.local?.scope === "user") {
        result.set(server.name, server.local);
      } else if (server.local?.scope === "remoteUser") {
        userRemote.push(server.local);
      } else if (server.local?.scope === "workspace") {
        workspace.push(server.local);
      }
    }
    for (const server of userRemote) {
      const existing = result.get(server.name);
      if (existing) {
        this.logService.warn(localize("overwriting", "Overwriting mcp server '{0}' from {1} with {2}.", server.name, server.mcpResource.path, existing.mcpResource.path));
      }
      result.set(server.name, server);
    }
    for (const server of workspace) {
      const existing = result.get(server.name);
      if (existing) {
        this.logService.warn(localize("overwriting", "Overwriting mcp server '{0}' from {1} with {2}.", server.name, server.mcpResource.path, existing.mcpResource.path));
      }
      result.set(server.name, server);
    }
    return [...result.values()];
  }
  canInstall(mcpServer) {
    if (!(mcpServer instanceof McpWorkbenchServer)) {
      return new MarkdownString().appendText(localize("not an extension", "The provided object is not an mcp server."));
    }
    if (mcpServer.gallery) {
      const result = this.mcpManagementService.canInstall(mcpServer.gallery);
      if (result === true) {
        return true;
      }
      return result;
    }
    if (mcpServer.installable) {
      const result = this.mcpManagementService.canInstall(mcpServer.installable);
      if (result === true) {
        return true;
      }
      return result;
    }
    return new MarkdownString().appendText(localize("cannot be installed", "Cannot install the '{0}' MCP Server because it is not available in this setup.", mcpServer.label));
  }
  async install(server, installOptions) {
    if (!(server instanceof McpWorkbenchServer)) {
      throw new Error("Invalid server instance");
    }
    if (server.installable) {
      const installable = server.installable;
      return this.doInstall(server, () => this.mcpManagementService.install(installable, installOptions));
    }
    if (server.gallery) {
      const gallery = server.gallery;
      return this.doInstall(server, () => this.mcpManagementService.installFromGallery(gallery, installOptions));
    }
    throw new Error("No installable server found");
  }
  async uninstall(server) {
    if (!server.local) {
      throw new Error("Local server is missing");
    }
    await this.mcpManagementService.uninstall(server.local);
  }
  async doInstall(server, installTask) {
    const source = server.gallery ? "gallery" : "local";
    const serverName = server.name;
    const hasInputs = !!(server.installable?.inputs && server.installable.inputs.length > 0);
    this.installing.push(server);
    this._onChange.fire(server);
    try {
      await installTask();
      const result = await this.waitAndGetInstalledMcpServer(server);
      this.telemetryService.publicLog2("mcp/serverInstall", {
        serverName,
        source,
        scope: result.local?.scope ?? "unknown",
        success: true,
        hasInputs
      });
      return result;
    } catch (error) {
      this.telemetryService.publicLog2("mcp/serverInstall", {
        serverName,
        source,
        scope: "unknown",
        success: false,
        error: error instanceof Error ? error.message : String(error),
        hasInputs
      });
      throw error;
    } finally {
      if (this.installing.includes(server)) {
        this.installing.splice(this.installing.indexOf(server), 1);
        this._onChange.fire(server);
      }
    }
  }
  async waitAndGetInstalledMcpServer(server) {
    let installed = this.local.find((local) => local.name === server.name);
    if (!installed) {
      await Event.toPromise(Event.filter(this.onChange, (e) => !!e && this.local.some((local) => local.name === server.name)));
    }
    installed = this.local.find((local) => local.name === server.name);
    if (!installed) {
      throw new Error("Extension should have been installed");
    }
    return installed;
  }
  getMcpConfigPath(arg) {
    if (arg instanceof URI) {
      const mcpResource = arg;
      for (const profile of this.userDataProfilesService.profiles) {
        if (this.uriIdentityService.extUri.isEqual(profile.mcpResource, mcpResource)) {
          return this.getUserMcpConfigPath(mcpResource);
        }
      }
      return this.remoteAgentService.getEnvironment().then((remoteEnvironment) => {
        if (remoteEnvironment && this.uriIdentityService.extUri.isEqual(remoteEnvironment.mcpResource, mcpResource)) {
          return this.getRemoteMcpConfigPath(mcpResource);
        }
        return this.getWorkspaceMcpConfigPath(mcpResource);
      });
    }
    if (arg.scope === "user") {
      return this.getUserMcpConfigPath(arg.mcpResource);
    }
    if (arg.scope === "workspace") {
      return this.getWorkspaceMcpConfigPath(arg.mcpResource);
    }
    if (arg.scope === "remoteUser") {
      return this.getRemoteMcpConfigPath(arg.mcpResource);
    }
    return void 0;
  }
  getUserMcpConfigPath(mcpResource) {
    return {
      id: USER_CONFIG_ID,
      key: "userLocalValue",
      target: 3,
      label: localize("mcp.configuration.userLocalValue", "Global in {0}", this.productService.nameShort),
      scope: 0,
      order: 200,
      uri: mcpResource,
      section: []
    };
  }
  getRemoteMcpConfigPath(mcpResource) {
    return {
      id: REMOTE_USER_CONFIG_ID,
      key: "userRemoteValue",
      target: 4,
      label: this.environmentService.remoteAuthority ? this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority) : "Remote",
      scope: 0,
      order: 200 + -50,
      remoteAuthority: this.environmentService.remoteAuthority,
      uri: mcpResource,
      section: []
    };
  }
  getWorkspaceMcpConfigPath(mcpResource) {
    const workspace = this.workspaceService.getWorkspace();
    if (workspace.configuration && this.uriIdentityService.extUri.isEqual(workspace.configuration, mcpResource)) {
      return {
        id: WORKSPACE_CONFIG_ID,
        key: "workspaceValue",
        target: 5,
        label: basename(mcpResource),
        scope: 1,
        order: 100,
        remoteAuthority: this.environmentService.remoteAuthority,
        uri: mcpResource,
        section: ["settings", mcpConfigurationSection]
      };
    }
    const workspaceFolders = workspace.folders;
    for (let index = 0; index < workspaceFolders.length; index++) {
      const workspaceFolder = workspaceFolders[index];
      if (this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.joinPath(workspaceFolder.uri, WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]), mcpResource)) {
        return {
          id: `${WORKSPACE_FOLDER_CONFIG_ID_PREFIX}${index}`,
          key: "workspaceFolderValue",
          target: 6,
          label: `${workspaceFolder.name}/.vscode/mcp.json`,
          scope: 1,
          remoteAuthority: this.environmentService.remoteAuthority,
          order: 0,
          uri: mcpResource,
          workspaceFolder
        };
      }
    }
    return void 0;
  }
  async handleURL(uri) {
    if (uri.path === "mcp/install") {
      return this.handleMcpInstallUri(uri);
    }
    if (uri.path.startsWith("mcp/by-name/")) {
      const mcpServerName = uri.path.substring("mcp/by-name/".length);
      if (mcpServerName) {
        return this.handleMcpServerByName(mcpServerName);
      }
    }
    if (uri.path.startsWith("mcp/")) {
      const mcpServerUrl = uri.path.substring(4);
      if (mcpServerUrl) {
        return this.handleMcpServerUrl(`${Schemas.https}://${mcpServerUrl}`);
      }
    }
    return false;
  }
  async handleMcpInstallUri(uri) {
    let parsed;
    try {
      parsed = JSON.parse(decodeURIComponent(uri.query));
    } catch (e) {
      return false;
    }
    try {
      const { name, inputs, gallery, ...config } = parsed;
      if (config.type === void 0) {
        config.type = parsed.command ? "stdio" : "http";
      }
      this.open(this.instantiationService.createInstance(McpWorkbenchServer, (e) => this.getInstallState(e), (e) => this.getRuntimeStatus(e), void 0, void 0, { name, config, inputs }));
    } catch (e) {
    }
    return true;
  }
  async handleMcpServerUrl(url) {
    try {
      const gallery = await this.mcpGalleryService.getMcpServer(url);
      if (!gallery) {
        this.logService.info(`MCP server '${url}' not found`);
        return true;
      }
      const local = this.local.find((e) => e.name === gallery.name) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e) => this.getInstallState(e), (e) => this.getRuntimeStatus(e), void 0, gallery, void 0);
      this.open(local);
    } catch (e) {
      this.logService.error(e);
    }
    return true;
  }
  async handleMcpServerByName(name) {
    try {
      const [gallery] = await this.mcpGalleryService.getMcpServersFromGallery([{ name }]);
      if (!gallery) {
        this.logService.info(`MCP server '${name}' not found`);
        return true;
      }
      const local = this.local.find((e) => e.name === gallery.name) ?? this.instantiationService.createInstance(McpWorkbenchServer, (e) => this.getInstallState(e), (e) => this.getRuntimeStatus(e), void 0, gallery, void 0);
      this.open(local);
    } catch (e) {
      this.logService.error(e);
    }
    return true;
  }
  async openSearch(searchValue, preserveFoucs) {
    await this.extensionsWorkbenchService.openSearch(`@mcp ${searchValue}`, preserveFoucs);
  }
  async open(extension, options) {
    const useModal = this.configurationService.getValue("extensions.allowOpenInModalEditor");
    await this.editorService.openEditor(this.instantiationService.createInstance(McpServerEditorInput, extension), options, useModal ? MODAL_GROUP : ACTIVE_GROUP);
  }
  getInstallState(extension) {
    if (this.installing.some((i) => i.name === extension.name)) {
      return 0;
    }
    if (this.uninstalling.some((e) => e.name === extension.name)) {
      return 2;
    }
    const local = this.local.find((e) => e === extension);
    return local ? 1 : 3;
  }
  getRuntimeStatus(mcpServer) {
    const enablementStatus = this.getEnablementStatus(mcpServer);
    if (enablementStatus) {
      return enablementStatus;
    }
    if (!this.mcpService.servers.get().find((s) => s.definition.id === mcpServer.id)) {
      return {
        state: 0
        /* McpServerEnablementState.Disabled */
      };
    }
    return void 0;
  }
  getEnablementStatus(mcpServer) {
    if (!mcpServer.local) {
      return void 0;
    }
    const settingsCommandLink = createCommandUri("workbench.action.openSettings", { query: `@id:${mcpAccessConfig}` }).toString();
    const accessValue = this.configurationService.getValue(mcpAccessConfig);
    if (accessValue === "none") {
      return {
        state: 1,
        message: {
          severity: Severity.Warning,
          text: new MarkdownString(localize("disabled - all not allowed", "This MCP Server is disabled because MCP servers are configured to be disabled in the Editor. Please check your [settings]({0}).", settingsCommandLink))
        }
      };
    }
    if (accessValue === "registry") {
      if (!mcpServer.gallery) {
        return {
          state: 1,
          message: {
            severity: Severity.Warning,
            text: new MarkdownString(localize("disabled - some not allowed", "This MCP Server is disabled because it is configured to be disabled in the Editor. Please check your [settings]({0}).", settingsCommandLink))
          }
        };
      }
      const remoteUrl = mcpServer.local.config.type === "http" && mcpServer.local.config.url;
      if (remoteUrl && !mcpServer.gallery.configuration.remotes?.some((remote) => remote.url === remoteUrl)) {
        return {
          state: 1,
          message: {
            severity: Severity.Warning,
            text: new MarkdownString(localize("disabled - some not allowed", "This MCP Server is disabled because it is configured to be disabled in the Editor. Please check your [settings]({0}).", settingsCommandLink))
          }
        };
      }
    }
    return void 0;
  }
};
McpWorkbenchService = __decorate([
  __param(0, IMcpGalleryManifestService),
  __param(1, IMcpGalleryService),
  __param(2, IWorkbenchMcpManagementService),
  __param(3, IEditorService),
  __param(4, IUserDataProfilesService),
  __param(5, IUriIdentityService),
  __param(6, IWorkspaceContextService),
  __param(7, IWorkbenchEnvironmentService),
  __param(8, ILabelService),
  __param(9, IProductService),
  __param(10, IRemoteAgentService),
  __param(11, IConfigurationService),
  __param(12, IInstantiationService),
  __param(13, ITelemetryService),
  __param(14, ILogService),
  __param(15, IExtensionsWorkbenchService),
  __param(16, IAllowedMcpServersService),
  __param(17, IMcpService),
  __param(18, IURLService)
], McpWorkbenchService);
let MCPContextsInitialisation = class MCPContextsInitialisation2 extends Disposable {
  static {
    __name(this, "MCPContextsInitialisation");
  }
  static {
    this.ID = "workbench.mcp.contexts.initialisation";
  }
  constructor(mcpWorkbenchService, mcpGalleryManifestService, contextKeyService) {
    super();
    const mcpServersGalleryStatus = McpServersGalleryStatusContext.bindTo(contextKeyService);
    mcpServersGalleryStatus.set(mcpGalleryManifestService.mcpGalleryManifestStatus);
    this._register(mcpGalleryManifestService.onDidChangeMcpGalleryManifestStatus((status) => mcpServersGalleryStatus.set(status)));
    const hasInstalledMcpServersContextKey = HasInstalledMcpServersContext.bindTo(contextKeyService);
    mcpWorkbenchService.queryLocal().finally(() => {
      hasInstalledMcpServersContextKey.set(mcpWorkbenchService.local.length > 0);
      this._register(mcpWorkbenchService.onChange(() => hasInstalledMcpServersContextKey.set(mcpWorkbenchService.local.length > 0)));
    });
  }
};
MCPContextsInitialisation = __decorate([
  __param(0, IMcpWorkbenchService),
  __param(1, IMcpGalleryManifestService),
  __param(2, IContextKeyService)
], MCPContextsInitialisation);
export {
  MCPContextsInitialisation,
  McpWorkbenchService
};
//# sourceMappingURL=mcpWorkbenchService.js.map
