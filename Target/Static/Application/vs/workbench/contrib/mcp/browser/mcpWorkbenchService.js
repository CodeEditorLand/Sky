var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMcpGalleryService, IMcpManagementService } from "../../../../platform/mcp/common/mcpManagement.js";
import { ACTIVE_GROUP, IEditorService } from "../../../services/editor/common/editorService.js";
import { HasInstalledMcpServersContext, IMcpWorkbenchService, McpServersGalleryEnabledContext } from "../common/mcpTypes.js";
import { McpServerEditorInput } from "./mcpServerEditorInput.js";
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
let McpWorkbenchServer = class McpWorkbenchServer2 {
  static {
    __name(this, "McpWorkbenchServer");
  }
  constructor(local, gallery, mcpGalleryService, fileService) {
    this.local = local;
    this.gallery = gallery;
    this.mcpGalleryService = mcpGalleryService;
    this.fileService = fileService;
  }
  get id() {
    return this.gallery?.id ?? this.local?.id ?? "";
  }
  get name() {
    return this.gallery?.name ?? this.local?.name ?? "";
  }
  get label() {
    return this.gallery?.displayName ?? this.local?.displayName ?? "";
  }
  get iconUrl() {
    return this.gallery?.iconUrl ?? this.local?.iconUrl;
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
  get installCount() {
    return this.gallery?.installCount ?? 0;
  }
  get url() {
    return this.gallery?.url;
  }
  get repository() {
    return this.gallery?.repositoryUrl;
  }
  async getReadme(token) {
    if (this.local?.readmeUrl) {
      const content = await this.fileService.readFile(this.local.readmeUrl);
      return content.value.toString();
    }
    if (this.gallery?.readmeUrl) {
      return this.mcpGalleryService.getReadme(this.gallery, token);
    }
    return Promise.reject(new Error("not available"));
  }
};
McpWorkbenchServer = __decorate([
  __param(2, IMcpGalleryService),
  __param(3, IFileService)
], McpWorkbenchServer);
let McpWorkbenchService = class McpWorkbenchService2 extends Disposable {
  static {
    __name(this, "McpWorkbenchService");
  }
  get local() {
    return this._local;
  }
  constructor(mcpGalleryService, mcpManagementService, editorService, instantiationService) {
    super();
    this.mcpGalleryService = mcpGalleryService;
    this.mcpManagementService = mcpManagementService;
    this.editorService = editorService;
    this.instantiationService = instantiationService;
    this._local = [];
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._register(this.mcpManagementService.onDidInstallMcpServers((e) => this.onDidInstallMcpServers(e)));
    this._register(this.mcpManagementService.onDidUninstallMcpServer((e) => this.onDidUninstallMcpServer(e)));
    this.queryLocal().then(async () => {
      await this.queryGallery();
      this._onChange.fire(void 0);
    });
  }
  onDidUninstallMcpServer(e) {
    if (e.error) {
      return;
    }
    const server = this._local.find((server2) => server2.local?.name === e.name);
    if (server) {
      this._local = this._local.filter((server2) => server2.local?.name !== e.name);
      server.local = void 0;
      this._onChange.fire(server);
    }
  }
  onDidInstallMcpServers(e) {
    for (const result of e) {
      if (!result.local) {
        continue;
      }
      let server = this._local.find((server2) => server2.local?.name === result.name);
      if (server) {
        server.local = result.local;
      } else {
        server = this.instantiationService.createInstance(McpWorkbenchServer, result.local, result.source);
        this._local.push(server);
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
  async queryGallery(options, token) {
    if (!this.mcpGalleryService.isEnabled()) {
      return [];
    }
    const result = await this.mcpGalleryService.query(options, token);
    return result.map((gallery) => this.fromGallery(gallery) ?? this.instantiationService.createInstance(McpWorkbenchServer, void 0, gallery));
  }
  async queryLocal() {
    const installed = await this.mcpManagementService.getInstalled();
    this._local = installed.map((i) => {
      const local = this._local.find((server) => server.name === i.name) ?? this.instantiationService.createInstance(McpWorkbenchServer, void 0, void 0);
      local.local = i;
      return local;
    });
    return this._local;
  }
  async install(server) {
    if (!server.gallery) {
      throw new Error("Gallery server is missing");
    }
    await this.mcpManagementService.installFromGallery(server.gallery, server.gallery.packageTypes[0]);
  }
  async uninstall(server) {
    if (!server.local) {
      throw new Error("Local server is missing");
    }
    await this.mcpManagementService.uninstall(server.local);
  }
  async open(extension, options) {
    await this.editorService.openEditor(this.instantiationService.createInstance(McpServerEditorInput, extension), options, ACTIVE_GROUP);
  }
};
McpWorkbenchService = __decorate([
  __param(0, IMcpGalleryService),
  __param(1, IMcpManagementService),
  __param(2, IEditorService),
  __param(3, IInstantiationService)
], McpWorkbenchService);
let MCPContextsInitialisation = class MCPContextsInitialisation2 extends Disposable {
  static {
    __name(this, "MCPContextsInitialisation");
  }
  static {
    this.ID = "workbench.mcp.contexts.initialisation";
  }
  constructor(mcpWorkbenchService, mcpGalleryService, contextKeyService) {
    super();
    const hasInstalledMcpServersContextKey = HasInstalledMcpServersContext.bindTo(contextKeyService);
    McpServersGalleryEnabledContext.bindTo(contextKeyService).set(mcpGalleryService.isEnabled());
    this._register(mcpWorkbenchService.onChange(() => hasInstalledMcpServersContextKey.set(mcpWorkbenchService.local.length > 0)));
  }
};
MCPContextsInitialisation = __decorate([
  __param(0, IMcpWorkbenchService),
  __param(1, IMcpGalleryService),
  __param(2, IContextKeyService)
], MCPContextsInitialisation);
export {
  MCPContextsInitialisation,
  McpWorkbenchService
};
//# sourceMappingURL=mcpWorkbenchService.js.map
