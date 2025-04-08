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
import { equals as arrayEquals } from "../../../../../base/common/arrays.js";
import { Throttler } from "../../../../../base/common/async.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { autorunDelta, ISettableObservable, observableValue } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { Location } from "../../../../../editor/common/languages.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { getMcpServerMapping } from "../mcpConfigFileUtils.js";
import { IMcpConfigPath, IMcpConfigPathsService } from "../mcpConfigPathsService.js";
import { IMcpConfiguration, mcpConfigurationSection } from "../mcpConfiguration.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { McpServerDefinition, McpServerTransportType } from "../mcpTypes.js";
import { IMcpDiscovery } from "./mcpDiscovery.js";
let ConfigMcpDiscovery = class extends Disposable {
  constructor(_configurationService, _mcpRegistry, _textModelService, _mcpConfigPathsService) {
    super();
    this._configurationService = _configurationService;
    this._mcpRegistry = _mcpRegistry;
    this._textModelService = _textModelService;
    this._mcpConfigPathsService = _mcpConfigPathsService;
  }
  static {
    __name(this, "ConfigMcpDiscovery");
  }
  configSources = [];
  start() {
    const throttler = this._register(new Throttler());
    const addPath = /* @__PURE__ */ __name((path) => {
      this.configSources.push({
        path,
        serverDefinitions: observableValue(this, []),
        disposable: this._register(new MutableDisposable()),
        getServerToLocationMapping: /* @__PURE__ */ __name((uri) => this._getServerIdMapping(uri, path.section ? [...path.section, "servers"] : ["servers"]), "getServerToLocationMapping")
      });
    }, "addPath");
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpConfigurationSection)) {
        throttler.queue(() => this.sync());
      }
    }));
    this._register(autorunDelta(this._mcpConfigPathsService.paths, ({ lastValue, newValue }) => {
      for (const last of lastValue || []) {
        if (!newValue.includes(last)) {
          const idx = this.configSources.findIndex((src) => src.path.id === last.id);
          if (idx !== -1) {
            this.configSources[idx].disposable.dispose();
            this.configSources.splice(idx, 1);
          }
        }
      }
      for (const next of newValue) {
        if (!lastValue || !lastValue.includes(next)) {
          addPath(next);
        }
      }
      this.sync();
    }));
  }
  async _getServerIdMapping(resource, pathToServers) {
    const store = new DisposableStore();
    try {
      const ref = await this._textModelService.createModelReference(resource);
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
    const configurationKey = this._configurationService.inspect(mcpConfigurationSection);
    const configMappings = await Promise.all(this.configSources.map((src) => {
      const uri = src.path.uri;
      return uri && src.getServerToLocationMapping(uri);
    }));
    for (const [index, src] of this.configSources.entries()) {
      const collectionId = `mcp.config.${src.path.id}`;
      let value = src.path.workspaceFolder ? this._configurationService.inspect(mcpConfigurationSection, { resource: src.path.workspaceFolder.uri })[src.path.key] : configurationKey[src.path.key];
      if (value?.mcpServers) {
        value = { ...value, servers: { ...value.servers, ...value.mcpServers }, mcpServers: void 0 };
        this._configurationService.updateValue(mcpConfigurationSection, value, {}, src.path.target, { donotNotifyError: true });
      }
      const configMapping = configMappings[index];
      const nextDefinitions = Object.entries(value?.servers || {}).map(([name, value2]) => ({
        id: `${collectionId}.${name}`,
        label: name,
        launch: "type" in value2 && value2.type === "sse" ? {
          type: McpServerTransportType.SSE,
          uri: URI.parse(value2.url),
          headers: Object.entries(value2.headers || {})
        } : {
          type: McpServerTransportType.Stdio,
          args: value2.args || [],
          command: value2.command,
          env: value2.env || {},
          envFile: value2.envFile,
          cwd: void 0
        },
        roots: src.path.workspaceFolder ? [src.path.workspaceFolder.uri] : [],
        variableReplacement: {
          folder: src.path.workspaceFolder,
          section: mcpConfigurationSection,
          target: src.path.target
        },
        presentation: {
          order: src.path.order,
          origin: configMapping?.get(name)
        }
      }));
      if (arrayEquals(nextDefinitions, src.serverDefinitions.get(), McpServerDefinition.equals)) {
        continue;
      }
      if (!nextDefinitions.length) {
        src.disposable.clear();
        src.serverDefinitions.set(nextDefinitions, void 0);
      } else {
        src.serverDefinitions.set(nextDefinitions, void 0);
        src.disposable.value ??= this._mcpRegistry.registerCollection({
          id: collectionId,
          label: src.path.label,
          presentation: { order: src.path.order, origin: src.path.uri },
          remoteAuthority: src.path.remoteAuthority || null,
          serverDefinitions: src.serverDefinitions,
          isTrustedByDefault: true,
          scope: src.path.scope
        });
      }
    }
  }
};
ConfigMcpDiscovery = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IMcpConfigPathsService)
], ConfigMcpDiscovery);
export {
  ConfigMcpDiscovery
};
//# sourceMappingURL=configMcpDiscovery.js.map
