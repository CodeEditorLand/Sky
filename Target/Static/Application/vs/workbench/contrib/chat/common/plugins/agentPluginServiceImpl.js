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
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { parse as parseJSONC } from "../../../../../base/common/json.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { cloneAndChange } from "../../../../../base/common/objects.js";
import { autorun, derived, observableValue } from "../../../../../base/common/observable.js";
import { posix, win32 } from "../../../../../base/common/path.js";
import { basename, extname, joinPath } from "../../../../../base/common/resources.js";
import { escapeRegExpCharacters } from "../../../../../base/common/strings.js";
import { URI } from "../../../../../base/common/uri.js";
import { getConfigValueInTarget, IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IPathService } from "../../../../services/path/common/pathService.js";
import { ChatConfiguration } from "../constants.js";
import { parseClaudeHooks } from "../promptSyntax/hookClaudeCompat.js";
import { parseCopilotHooks } from "../promptSyntax/hookCompatibility.js";
import { agentPluginDiscoveryRegistry } from "./agentPluginService.js";
import { IPluginMarketplaceService } from "./pluginMarketplaceService.js";
const COMMAND_FILE_SUFFIX = ".md";
var AgentPluginFormat;
(function(AgentPluginFormat2) {
  AgentPluginFormat2[AgentPluginFormat2["Copilot"] = 0] = "Copilot";
  AgentPluginFormat2[AgentPluginFormat2["Claude"] = 1] = "Claude";
})(AgentPluginFormat || (AgentPluginFormat = {}));
function mapParsedHooks(parsed) {
  return [...parsed.entries()].map(([type, { hooks, originalId }]) => ({ type, hooks, originalId }));
}
__name(mapParsedHooks, "mapParsedHooks");
function resolveWorkspaceRoot(pluginUri, workspaceContextService) {
  const defaultFolder = workspaceContextService.getWorkspace().folders[0];
  const folder = workspaceContextService.getWorkspaceFolder(pluginUri) ?? defaultFolder;
  return folder?.uri;
}
__name(resolveWorkspaceRoot, "resolveWorkspaceRoot");
let CopilotPluginFormatAdapter = class CopilotPluginFormatAdapter2 {
  static {
    __name(this, "CopilotPluginFormatAdapter");
  }
  constructor(_workspaceContextService) {
    this._workspaceContextService = _workspaceContextService;
    this.format = 0;
    this.manifestPaths = ["plugin.json"];
    this.hookConfigPaths = ["hooks.json"];
    this.hookWatchPaths = ["hooks.json"];
  }
  parseHooks(json, pluginUri, userHome) {
    const workspaceRoot = resolveWorkspaceRoot(pluginUri, this._workspaceContextService);
    return mapParsedHooks(parseCopilotHooks(json, workspaceRoot, userHome));
  }
};
CopilotPluginFormatAdapter = __decorate([
  __param(0, IWorkspaceContextService)
], CopilotPluginFormatAdapter);
const shellUnsafeChars = /[\s&|<>()^;!`"']/;
function shellQuotePluginRootInCommand(command, fsPath, token = "${CLAUDE_PLUGIN_ROOT}") {
  if (!command.includes(token)) {
    return command;
  }
  if (!shellUnsafeChars.test(fsPath)) {
    return command.replaceAll(token, fsPath);
  }
  const escapedToken = escapeRegExpCharacters(token);
  const pattern = new RegExp(
    // Capture an optional leading quote so we know if it's already quoted
    `(["']?)` + escapedToken + `([\\w./\\\\~:-]*)`,
    "g"
  );
  return command.replace(pattern, (_match, leadingQuote, suffix) => {
    const fullPath = fsPath + suffix;
    if (leadingQuote) {
      return leadingQuote + fullPath;
    }
    return '"' + fullPath.replace(/"/g, '\\"') + '"';
  });
}
__name(shellQuotePluginRootInCommand, "shellQuotePluginRootInCommand");
let ClaudePluginFormatAdapter = class ClaudePluginFormatAdapter2 {
  static {
    __name(this, "ClaudePluginFormatAdapter");
  }
  constructor(_workspaceContextService) {
    this._workspaceContextService = _workspaceContextService;
    this.format = 1;
    this.manifestPaths = [".claude-plugin/plugin.json"];
    this.hookConfigPaths = ["hooks/hooks.json"];
    this.hookWatchPaths = ["hooks"];
  }
  parseHooks(json, pluginUri, userHome) {
    const token = "${CLAUDE_PLUGIN_ROOT}";
    const fsPath = pluginUri.fsPath;
    const typedJson = json;
    const mutateHookCommand = /* @__PURE__ */ __name((hook) => {
      for (const field of ["command", "windows", "linux", "osx"]) {
        if (typeof hook[field] === "string") {
          hook[field] = shellQuotePluginRootInCommand(hook[field], fsPath, token);
        }
      }
      hook.env ??= {};
      hook.env.CLAUDE_PLUGIN_ROOT = fsPath;
    }, "mutateHookCommand");
    for (const lifecycle of Object.values(typedJson.hooks ?? {})) {
      if (!Array.isArray(lifecycle)) {
        continue;
      }
      for (const lifecycleEntry of lifecycle) {
        if (!lifecycleEntry || typeof lifecycleEntry !== "object") {
          continue;
        }
        const entry = lifecycleEntry;
        if (Array.isArray(entry.hooks)) {
          for (const hook of entry.hooks) {
            mutateHookCommand(hook);
          }
        } else {
          mutateHookCommand(entry);
        }
      }
    }
    const replacer = /* @__PURE__ */ __name((v) => {
      return typeof v === "string" ? v.replaceAll("${CLAUDE_PLUGIN_ROOT}", pluginUri.fsPath) : void 0;
    }, "replacer");
    const workspaceRoot = resolveWorkspaceRoot(pluginUri, this._workspaceContextService);
    const { hooks, disabledAllHooks } = parseClaudeHooks(cloneAndChange(json, replacer), workspaceRoot, userHome);
    if (disabledAllHooks) {
      return [];
    }
    return mapParsedHooks(hooks);
  }
};
ClaudePluginFormatAdapter = __decorate([
  __param(0, IWorkspaceContextService)
], ClaudePluginFormatAdapter);
let AgentPluginService = class AgentPluginService2 extends Disposable {
  static {
    __name(this, "AgentPluginService");
  }
  constructor(instantiationService, configurationService) {
    super();
    const pluginsEnabled = observableConfigValue(ChatConfiguration.PluginsEnabled, true, configurationService);
    const discoveries = [];
    for (const descriptor of agentPluginDiscoveryRegistry.getAll()) {
      const discovery = instantiationService.createInstance(descriptor);
      this._register(discovery);
      discoveries.push(discovery);
      discovery.start();
    }
    this.allPlugins = derived((read) => {
      if (!pluginsEnabled.read(read)) {
        return [];
      }
      return this._dedupeAndSort(discoveries.flatMap((d) => d.plugins.read(read)));
    });
    this.plugins = derived((reader) => {
      const all = this.allPlugins.read(reader);
      return all.filter((p) => p.enabled.read(reader));
    });
  }
  setPluginEnabled(pluginUri, enabled) {
    const plugin = this.allPlugins.get().find((p) => p.uri.toString() === pluginUri.toString());
    if (plugin) {
      plugin.setEnabled(enabled);
    }
  }
  _dedupeAndSort(plugins) {
    const unique = [];
    const seen = new ResourceSet();
    for (const plugin of plugins) {
      if (seen.has(plugin.uri)) {
        continue;
      }
      seen.add(plugin.uri);
      unique.push(plugin);
    }
    unique.sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
    return unique;
  }
};
AgentPluginService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IConfigurationService)
], AgentPluginService);
let ConfiguredAgentPluginDiscovery = class ConfiguredAgentPluginDiscovery2 extends Disposable {
  static {
    __name(this, "ConfiguredAgentPluginDiscovery");
  }
  constructor(_configurationService, _fileService, _pluginMarketplaceService, _workspaceContextService, _pathService, _logService, _instantiationService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._workspaceContextService = _workspaceContextService;
    this._pathService = _pathService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._pluginEntries = /* @__PURE__ */ new Map();
    this._plugins = observableValue("discoveredAgentPlugins", []);
    this.plugins = this._plugins;
    this._discoverVersion = 0;
    this._pluginPathsConfig = observableConfigValue(ChatConfiguration.PluginPaths, {}, _configurationService);
  }
  start() {
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    this._register(autorun((reader) => {
      this._pluginPathsConfig.read(reader);
      scheduler.schedule();
    }));
    scheduler.schedule();
  }
  async _refreshPlugins() {
    const version = ++this._discoverVersion;
    const plugins = await this._discoverPlugins();
    if (version !== this._discoverVersion || this._store.isDisposed) {
      return;
    }
    this._plugins.set(plugins, void 0);
  }
  async _discoverPlugins() {
    const plugins = [];
    const seenPluginUris = /* @__PURE__ */ new Set();
    const config = this._pluginPathsConfig.get();
    for (const [path, enabled] of Object.entries(config)) {
      if (!path.trim()) {
        continue;
      }
      const resources = this._resolvePluginPath(path.trim());
      for (const resource of resources) {
        let stat;
        try {
          stat = await this._fileService.resolve(resource);
        } catch {
          this._logService.debug(`[ConfiguredAgentPluginDiscovery] Could not resolve plugin path: ${resource.toString()}`);
          continue;
        }
        if (!stat.isDirectory) {
          this._logService.debug(`[ConfiguredAgentPluginDiscovery] Plugin path is not a directory: ${resource.toString()}`);
          continue;
        }
        const key = stat.resource.toString();
        if (!seenPluginUris.has(key)) {
          const adapter = await this._detectPluginFormatAdapter(stat.resource);
          const fromMarketplace = await this._pluginMarketplaceService.getMarketplacePluginMetadata(stat.resource);
          seenPluginUris.add(key);
          plugins.push(this._toPlugin(stat.resource, path, enabled, adapter, fromMarketplace));
        }
      }
    }
    this._disposePluginEntriesExcept(seenPluginUris);
    plugins.sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
    return plugins;
  }
  /**
   * Resolves a plugin path to one or more resource URIs. Absolute paths are
   * used directly; relative paths are resolved against each workspace folder.
   */
  _resolvePluginPath(path) {
    if (win32.isAbsolute(path) || posix.isAbsolute(path)) {
      return [URI.file(path)];
    }
    return this._workspaceContextService.getWorkspace().folders.map((folder) => joinPath(folder.uri, path));
  }
  /**
   * Updates the enabled state of a plugin path in the configuration,
   * writing to the most specific config target where the key is defined.
   */
  _updatePluginPathEnabled(configKey, value) {
    const inspected = this._configurationService.inspect(ChatConfiguration.PluginPaths);
    const targets = [
      6,
      5,
      3,
      4,
      2,
      1
    ];
    for (const target of targets) {
      const mapping = getConfigValueInTarget(inspected, target);
      if (mapping && Object.prototype.hasOwnProperty.call(mapping, configKey)) {
        this._configurationService.updateValue(ChatConfiguration.PluginPaths, { ...mapping, [configKey]: value }, target);
        return;
      }
    }
    const current = getConfigValueInTarget(
      inspected,
      3
      /* ConfigurationTarget.USER_LOCAL */
    ) ?? {};
    this._configurationService.updateValue(
      ChatConfiguration.PluginPaths,
      { ...current, [configKey]: value },
      3
      /* ConfigurationTarget.USER_LOCAL */
    );
  }
  async _detectPluginFormatAdapter(pluginUri) {
    const isInClaudeDirectory = pluginUri.path.split("/").includes(".claude");
    if (isInClaudeDirectory || await this._pathExists(joinPath(pluginUri, ".claude-plugin", "plugin.json"))) {
      return this._instantiationService.createInstance(ClaudePluginFormatAdapter);
    }
    return this._instantiationService.createInstance(CopilotPluginFormatAdapter);
  }
  async _pathExists(resource) {
    try {
      await this._fileService.resolve(resource);
      return true;
    } catch {
      return false;
    }
  }
  _toPlugin(uri, configKey, initialEnabled, adapter, fromMarketplace) {
    const key = uri.toString();
    const existing = this._pluginEntries.get(key);
    if (existing) {
      if (existing.adapter.format !== adapter.format) {
        existing.store.dispose();
        this._pluginEntries.delete(key);
      } else {
        existing.plugin.enabled.set(initialEnabled, void 0);
        return existing.plugin;
      }
    }
    const store = new DisposableStore();
    const commands = observableValue("agentPluginCommands", []);
    const skills = observableValue("agentPluginSkills", []);
    const agents = observableValue("agentPluginAgents", []);
    const hooks = observableValue("agentPluginHooks", []);
    const mcpServerDefinitions = observableValue("agentPluginMcpServerDefinitions", []);
    const enabled = observableValue("agentPluginEnabled", initialEnabled);
    const commandsDir = joinPath(uri, "commands");
    const skillsDir = joinPath(uri, "skills");
    const agentsDir = joinPath(uri, "agents");
    const commandsScheduler = store.add(new RunOnceScheduler(async () => {
      commands.set(await this._readCommands(uri), void 0);
    }, 200));
    const skillsScheduler = store.add(new RunOnceScheduler(async () => {
      skills.set(await this._readSkills(uri), void 0);
    }, 200));
    const agentsScheduler = store.add(new RunOnceScheduler(async () => {
      agents.set(await this._readAgents(uri), void 0);
    }, 200));
    const hooksScheduler = store.add(new RunOnceScheduler(async () => {
      hooks.set(await this._readHooks(uri, adapter), void 0);
    }, 200));
    const mcpScheduler = store.add(new RunOnceScheduler(async () => {
      mcpServerDefinitions.set(await this._readMcpDefinitions(uri, adapter), void 0);
    }, 200));
    store.add(this._fileService.watch(uri, { recursive: true, excludes: [] }));
    store.add(this._fileService.onDidFilesChange((e) => {
      if (e.affects(commandsDir)) {
        commandsScheduler.schedule();
      }
      if (e.affects(skillsDir)) {
        skillsScheduler.schedule();
      }
      if (e.affects(agentsDir)) {
        agentsScheduler.schedule();
      }
      if (adapter.hookWatchPaths.some((path) => e.affects(joinPath(uri, path)))) {
        hooksScheduler.schedule();
      }
      if (e.affects(joinPath(uri, ".mcp.json")) || adapter.manifestPaths.some((path) => e.affects(joinPath(uri, path)))) {
        mcpScheduler.schedule();
        hooksScheduler.schedule();
      }
    }));
    commandsScheduler.schedule();
    skillsScheduler.schedule();
    agentsScheduler.schedule();
    hooksScheduler.schedule();
    mcpScheduler.schedule();
    const plugin = {
      uri,
      enabled,
      setEnabled: /* @__PURE__ */ __name((value) => {
        this._updatePluginPathEnabled(configKey, value);
      }, "setEnabled"),
      hooks,
      commands,
      skills,
      agents,
      mcpServerDefinitions,
      fromMarketplace
    };
    this._pluginEntries.set(key, { store, plugin, adapter });
    return plugin;
  }
  async _readMcpDefinitions(pluginUri, adapter) {
    const mcpUri = joinPath(pluginUri, ".mcp.json");
    const mcpFileConfig = await this._readJsonFile(mcpUri);
    const fileDefinitions = this._parseMcpServerDefinitionMap(mcpFileConfig);
    const pluginJsonDefinitions = await this._readInlinePluginJsonMcpDefinitions(pluginUri, adapter);
    const merged = /* @__PURE__ */ new Map();
    for (const definition of fileDefinitions) {
      merged.set(definition.name, definition.configuration);
    }
    for (const definition of pluginJsonDefinitions) {
      if (!merged.has(definition.name)) {
        merged.set(definition.name, definition.configuration);
      }
    }
    const definitions = [...merged.entries()].map(([name, configuration]) => ({ name, configuration })).sort((a, b) => a.name.localeCompare(b.name));
    return definitions;
  }
  async _readInlinePluginJsonMcpDefinitions(pluginUri, adapter) {
    for (const manifestPath of adapter.manifestPaths.map((path) => joinPath(pluginUri, path))) {
      const manifest = await this._readJsonFile(manifestPath);
      if (!manifest || typeof manifest !== "object") {
        continue;
      }
      const definitions = this._parseMcpServerDefinitionMap(manifest);
      if (definitions.length > 0) {
        return definitions;
      }
    }
    return [];
  }
  _parseMcpServerDefinitionMap(raw) {
    if (!raw || typeof raw !== "object" || !raw.hasOwnProperty("mcpServers")) {
      return [];
    }
    const definitions = [];
    for (const [name, configValue] of Object.entries(raw.mcpServers)) {
      const configuration = this._normalizeMcpServerConfiguration(configValue);
      if (!configuration) {
        continue;
      }
      definitions.push({ name, configuration });
    }
    return definitions;
  }
  _normalizeMcpServerConfiguration(rawConfig) {
    if (!rawConfig || typeof rawConfig !== "object") {
      return void 0;
    }
    const candidate = rawConfig;
    const type = typeof candidate["type"] === "string" ? candidate["type"] : void 0;
    const command = typeof candidate["command"] === "string" ? candidate["command"] : void 0;
    const url = typeof candidate["url"] === "string" ? candidate["url"] : void 0;
    const args = Array.isArray(candidate["args"]) ? candidate["args"].filter((value) => typeof value === "string") : void 0;
    const env = candidate["env"] && typeof candidate["env"] === "object" ? Object.fromEntries(Object.entries(candidate["env"]).filter(([, value]) => typeof value === "string" || typeof value === "number" || value === null).map(([key, value]) => [key, value])) : void 0;
    const envFile = typeof candidate["envFile"] === "string" ? candidate["envFile"] : void 0;
    const cwd = typeof candidate["cwd"] === "string" ? candidate["cwd"] : void 0;
    const headers = candidate["headers"] && typeof candidate["headers"] === "object" ? Object.fromEntries(Object.entries(candidate["headers"]).filter(([, value]) => typeof value === "string").map(([key, value]) => [key, value])) : void 0;
    const dev = candidate["dev"] && typeof candidate["dev"] === "object" ? candidate["dev"] : void 0;
    if (type === "ws") {
      return void 0;
    }
    if (type === "stdio" || !type && command) {
      if (!command) {
        return void 0;
      }
      return {
        type: "stdio",
        command,
        args,
        env,
        envFile,
        cwd,
        dev
      };
    }
    if (type === "http" || type === "sse" || !type && url) {
      if (!url) {
        return void 0;
      }
      return {
        type: "http",
        url,
        headers,
        dev
      };
    }
    return void 0;
  }
  async _readHooks(pluginUri, adapter) {
    const userHome = (await this._pathService.userHome()).fsPath;
    for (const hooksUri of adapter.hookConfigPaths.map((path) => joinPath(pluginUri, path))) {
      const json = await this._readJsonFile(hooksUri);
      if (json) {
        try {
          return adapter.parseHooks(json, pluginUri, userHome);
        } catch (e) {
          this._logService.info(`[ConfiguredAgentPluginDiscovery] Failed to parse hooks from ${hooksUri.toString()}:`, e);
        }
      }
    }
    for (const manifestPath of adapter.manifestPaths.map((path) => joinPath(pluginUri, path))) {
      const manifest = await this._readJsonFile(manifestPath);
      if (manifest && typeof manifest === "object") {
        const hooks = manifest["hooks"];
        if (hooks && typeof hooks === "object") {
          try {
            return adapter.parseHooks({ hooks }, pluginUri, userHome);
          } catch (e) {
            this._logService.info(`[ConfiguredAgentPluginDiscovery] Failed to parse hooks from manifest ${manifestPath.toString()}:`, e);
          }
        }
      }
    }
    return [];
  }
  async _readJsonFile(uri) {
    try {
      const fileContents = await this._fileService.readFile(uri);
      return parseJSONC(fileContents.value.toString());
    } catch {
      return void 0;
    }
  }
  async _readSkills(uri) {
    const skillsDir = joinPath(uri, "skills");
    let stat;
    try {
      stat = await this._fileService.resolve(skillsDir);
    } catch {
      return [];
    }
    if (!stat.isDirectory || !stat.children) {
      return [];
    }
    const skills = [];
    for (const child of stat.children) {
      const skillMd = URI.joinPath(child.resource, "SKILL.md");
      if (!await this._pathExists(skillMd)) {
        continue;
      }
      skills.push({
        uri: skillMd,
        name: basename(child.resource)
      });
    }
    skills.sort((a, b) => a.name.localeCompare(b.name));
    return skills;
  }
  async _readAgents(uri) {
    const agentsDir = joinPath(uri, "agents");
    let stat;
    try {
      stat = await this._fileService.resolve(agentsDir);
    } catch {
      return [];
    }
    if (!stat.isDirectory || !stat.children) {
      return [];
    }
    const agents = [];
    for (const child of stat.children) {
      if (!child.isFile || extname(child.resource).toLowerCase() !== COMMAND_FILE_SUFFIX) {
        continue;
      }
      const name = basename(child.resource).slice(0, -COMMAND_FILE_SUFFIX.length);
      agents.push({
        uri: child.resource,
        name
      });
    }
    agents.sort((a, b) => a.name.localeCompare(b.name));
    return agents;
  }
  async _readCommands(uri) {
    const commandsDir = joinPath(uri, "commands");
    let stat;
    try {
      stat = await this._fileService.resolve(commandsDir);
    } catch {
      return [];
    }
    if (!stat.isDirectory || !stat.children) {
      return [];
    }
    const commands = [];
    for (const child of stat.children) {
      if (!child.isFile || extname(child.resource).toLowerCase() !== COMMAND_FILE_SUFFIX) {
        continue;
      }
      const name = basename(child.resource).slice(0, -COMMAND_FILE_SUFFIX.length);
      commands.push({
        uri: child.resource,
        name
      });
    }
    commands.sort((a, b) => a.name.localeCompare(b.name));
    return commands;
  }
  _disposePluginEntriesExcept(keep) {
    for (const [key, entry] of this._pluginEntries) {
      if (!keep.has(key)) {
        entry.store.dispose();
        this._pluginEntries.delete(key);
      }
    }
  }
  dispose() {
    this._disposePluginEntriesExcept(/* @__PURE__ */ new Set());
    super.dispose();
  }
};
ConfiguredAgentPluginDiscovery = __decorate([
  __param(0, IConfigurationService),
  __param(1, IFileService),
  __param(2, IPluginMarketplaceService),
  __param(3, IWorkspaceContextService),
  __param(4, IPathService),
  __param(5, ILogService),
  __param(6, IInstantiationService)
], ConfiguredAgentPluginDiscovery);
export {
  AgentPluginService,
  ConfiguredAgentPluginDiscovery,
  shellQuotePluginRootInCommand
};
//# sourceMappingURL=agentPluginServiceImpl.js.map
