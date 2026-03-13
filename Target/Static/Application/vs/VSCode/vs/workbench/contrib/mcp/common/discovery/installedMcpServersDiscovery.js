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
import { equals } from "../../../../../base/common/arrays.js";
import { Throttler } from "../../../../../base/common/async.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { getMcpServerMapping } from "../mcpConfigFileUtils.js";
import { mcpConfigurationSection } from "../mcpConfiguration.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { IMcpWorkbenchService, McpCollectionDefinition, McpServerDefinition, McpServerLaunch } from "../mcpTypes.js";
let InstalledMcpServersDiscovery = class InstalledMcpServersDiscovery2 extends Disposable {
  static {
    __name(this, "InstalledMcpServersDiscovery");
  }
  constructor(mcpWorkbenchService, mcpRegistry, textModelService, logService) {
    super();
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpRegistry = mcpRegistry;
    this.textModelService = textModelService;
    this.logService = logService;
    this.fromGallery = true;
    this.collections = this._register(new DisposableMap());
  }
  start() {
    const throttler = this._register(new Throttler());
    this._register(this.mcpWorkbenchService.onChange(() => throttler.queue(() => this.sync())));
    this.sync();
  }
  async getServerIdMapping(resource, pathToServers) {
    const store = new DisposableStore();
    try {
      const ref = await this.textModelService.createModelReference(resource);
      store.add(ref);
      const serverIdMapping = getMcpServerMapping({ model: ref.object.textEditorModel, pathToServers });
      return serverIdMapping;
    } catch {
      return /* @__PURE__ */ new Map();
    } finally {
      store.dispose();
    }
  }
  async sync() {
    try {
      const collections = /* @__PURE__ */ new Map();
      const mcpConfigPathInfos = new ResourceMap();
      for (const server of this.mcpWorkbenchService.getEnabledLocalMcpServers()) {
        let mcpConfigPathPromise = mcpConfigPathInfos.get(server.mcpResource);
        if (!mcpConfigPathPromise) {
          mcpConfigPathPromise = (async (local) => {
            const mcpConfigPath2 = this.mcpWorkbenchService.getMcpConfigPath(local);
            const locations = mcpConfigPath2?.uri ? await this.getServerIdMapping(mcpConfigPath2?.uri, mcpConfigPath2.section ? [...mcpConfigPath2.section, "servers"] : ["servers"]) : /* @__PURE__ */ new Map();
            return mcpConfigPath2 ? { ...mcpConfigPath2, locations } : void 0;
          })(server);
          mcpConfigPathInfos.set(server.mcpResource, mcpConfigPathPromise);
        }
        const config = server.config;
        const mcpConfigPath = await mcpConfigPathPromise;
        const collectionId = `mcp.config.${mcpConfigPath ? mcpConfigPath.id : "unknown"}`;
        let definitions = collections.get(collectionId);
        if (!definitions) {
          definitions = [mcpConfigPath, []];
          collections.set(collectionId, definitions);
        }
        const launch = config.type === "http" ? {
          type: 2,
          uri: URI.parse(config.url),
          headers: Object.entries(config.headers || {})
        } : {
          type: 1,
          command: config.command,
          args: config.args || [],
          env: config.env || {},
          envFile: config.envFile,
          cwd: config.cwd,
          sandbox: server.rootSandbox
        };
        definitions[1].push({
          id: `${collectionId}.${server.name}`,
          label: server.name,
          launch,
          sandboxEnabled: config.type === "http" ? void 0 : config.sandboxEnabled,
          cacheNonce: await McpServerLaunch.hash(launch),
          roots: mcpConfigPath?.workspaceFolder ? [mcpConfigPath.workspaceFolder.uri] : void 0,
          variableReplacement: {
            folder: mcpConfigPath?.workspaceFolder,
            section: mcpConfigurationSection,
            target: mcpConfigPath?.target ?? 2
          },
          devMode: config.dev,
          presentation: {
            order: mcpConfigPath?.order,
            origin: mcpConfigPath?.locations.get(server.name)
          }
        });
      }
      for (const [id] of this.collections) {
        if (!collections.has(id)) {
          this.collections.deleteAndDispose(id);
        }
      }
      for (const [id, [mcpConfigPath, serverDefinitions]] of collections) {
        const newServerDefinitions = observableValue(this, serverDefinitions);
        const newCollection = {
          id,
          label: mcpConfigPath?.label ?? "",
          presentation: {
            order: serverDefinitions[0]?.presentation?.order,
            origin: mcpConfigPath?.uri
          },
          remoteAuthority: mcpConfigPath?.remoteAuthority ?? null,
          serverDefinitions: newServerDefinitions,
          trustBehavior: 0,
          configTarget: mcpConfigPath?.target ?? 2,
          scope: mcpConfigPath?.scope ?? 0
        };
        const existingCollection = this.collections.get(id);
        const collectionDefinitionsChanged = existingCollection ? !McpCollectionDefinition.equals(existingCollection.definition, newCollection) : true;
        if (!collectionDefinitionsChanged) {
          const serverDefinitionsChanged = existingCollection ? !equals(existingCollection.definition.serverDefinitions.get(), newCollection.serverDefinitions.get(), McpServerDefinition.equals) : true;
          if (serverDefinitionsChanged) {
            existingCollection?.serverDefinitions.set(serverDefinitions, void 0);
          }
          continue;
        }
        this.collections.deleteAndDispose(id);
        const disposable = this.mcpRegistry.registerCollection(newCollection);
        this.collections.set(id, {
          definition: newCollection,
          serverDefinitions: newServerDefinitions,
          dispose: /* @__PURE__ */ __name(() => disposable.dispose(), "dispose")
        });
      }
    } catch (error) {
      this.logService.error(error);
    }
  }
};
InstalledMcpServersDiscovery = __decorate([
  __param(0, IMcpWorkbenchService),
  __param(1, IMcpRegistry),
  __param(2, ITextModelService),
  __param(3, ILogService)
], InstalledMcpServersDiscovery);
export {
  InstalledMcpServersDiscovery
};
//# sourceMappingURL=installedMcpServersDiscovery.js.map
