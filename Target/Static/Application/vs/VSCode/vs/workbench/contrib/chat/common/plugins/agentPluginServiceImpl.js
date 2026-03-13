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
import { Iterable } from "../../../../../base/common/iterator.js";
import { parse as parseJSONC } from "../../../../../base/common/json.js";
import { untildify } from "../../../../../base/common/labels.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { cloneAndChange, equals } from "../../../../../base/common/objects.js";
import { autorun, derived, derivedOpts, ObservablePromise, observableSignal, observableValue } from "../../../../../base/common/observable.js";
import { posix, win32 } from "../../../../../base/common/path.js";
import { basename, extname, isEqualOrParent, joinPath, normalizePath } from "../../../../../base/common/resources.js";
import { escapeRegExpCharacters } from "../../../../../base/common/strings.js";
import { hasKey } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { getConfigValueInTarget, IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IPathService } from "../../../../services/path/common/pathService.js";
import { ChatConfiguration } from "../constants.js";
import { EnablementModel } from "../enablement.js";
import { parseClaudeHooks } from "../promptSyntax/hookClaudeCompat.js";
import { parseCopilotHooks } from "../promptSyntax/hookCompatibility.js";
import { IAgentPluginRepositoryService } from "./agentPluginRepositoryService.js";
import { agentPluginDiscoveryRegistry } from "./agentPluginService.js";
import { IPluginMarketplaceService } from "./pluginMarketplaceService.js";
const COMMAND_FILE_SUFFIX = ".md";
const RULE_FILE_SUFFIXES = [".instructions.md", ".mdc", ".md"];
var AgentPluginFormat;
(function(AgentPluginFormat2) {
  AgentPluginFormat2[AgentPluginFormat2["Copilot"] = 0] = "Copilot";
  AgentPluginFormat2[AgentPluginFormat2["Claude"] = 1] = "Claude";
  AgentPluginFormat2[AgentPluginFormat2["OpenPlugin"] = 2] = "OpenPlugin";
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
    this.manifestPath = "plugin.json";
    this.hookConfigPath = "hooks.json";
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
function shellQuotePluginRootInCommand(command, fsPath, token) {
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
function parsePluginRootHooks(json, pluginUri, userHome, workspaceContextService, token, envVar) {
  const fsPath = pluginUri.fsPath;
  const typedJson = json;
  const mutateHookCommand = /* @__PURE__ */ __name((hook) => {
    for (const field of ["command", "windows", "linux", "osx"]) {
      if (typeof hook[field] === "string") {
        hook[field] = shellQuotePluginRootInCommand(hook[field], fsPath, token);
      }
    }
    hook.env ??= {};
    hook.env[envVar] = fsPath;
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
    return typeof v === "string" ? v.replaceAll(token, pluginUri.fsPath) : void 0;
  }, "replacer");
  const workspaceRoot = resolveWorkspaceRoot(pluginUri, workspaceContextService);
  const { hooks, disabledAllHooks } = parseClaudeHooks(cloneAndChange(json, replacer), workspaceRoot, userHome);
  if (disabledAllHooks) {
    return [];
  }
  return mapParsedHooks(hooks);
}
__name(parsePluginRootHooks, "parsePluginRootHooks");
let ClaudePluginFormatAdapter = class ClaudePluginFormatAdapter2 {
  static {
    __name(this, "ClaudePluginFormatAdapter");
  }
  constructor(_workspaceContextService) {
    this._workspaceContextService = _workspaceContextService;
    this.format = 1;
    this.manifestPath = ".claude-plugin/plugin.json";
    this.hookConfigPath = "hooks/hooks.json";
  }
  parseHooks(json, pluginUri, userHome) {
    return parsePluginRootHooks(json, pluginUri, userHome, this._workspaceContextService, "${CLAUDE_PLUGIN_ROOT}", "CLAUDE_PLUGIN_ROOT");
  }
};
ClaudePluginFormatAdapter = __decorate([
  __param(0, IWorkspaceContextService)
], ClaudePluginFormatAdapter);
let OpenPluginFormatAdapter = class OpenPluginFormatAdapter2 {
  static {
    __name(this, "OpenPluginFormatAdapter");
  }
  constructor(_workspaceContextService) {
    this._workspaceContextService = _workspaceContextService;
    this.format = 2;
    this.manifestPath = ".plugin/plugin.json";
    this.hookConfigPath = "hooks/hooks.json";
  }
  parseHooks(json, pluginUri, userHome) {
    return parsePluginRootHooks(json, pluginUri, userHome, this._workspaceContextService, "${PLUGIN_ROOT}", "PLUGIN_ROOT");
  }
};
OpenPluginFormatAdapter = __decorate([
  __param(0, IWorkspaceContextService)
], OpenPluginFormatAdapter);
const emptyComponentPathConfig = { paths: [], exclusive: false };
function parseComponentPathConfig(raw) {
  if (raw === void 0 || raw === null) {
    return emptyComponentPathConfig;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed ? { paths: [trimmed], exclusive: false } : emptyComponentPathConfig;
  }
  if (Array.isArray(raw)) {
    const paths = raw.filter((v) => typeof v === "string").map((v) => v.trim()).filter((v) => v.length > 0);
    return { paths, exclusive: false };
  }
  if (typeof raw === "object") {
    const obj = raw;
    if (Array.isArray(obj["paths"])) {
      const paths = obj["paths"].filter((v) => typeof v === "string").map((v) => v.trim()).filter((v) => v.length > 0);
      const exclusive = obj["exclusive"] === true;
      return { paths, exclusive };
    }
  }
  return emptyComponentPathConfig;
}
__name(parseComponentPathConfig, "parseComponentPathConfig");
function resolveComponentDirs(pluginUri, defaultDir, config) {
  const dirs = [];
  if (!config.exclusive) {
    dirs.push(joinPath(pluginUri, defaultDir));
  }
  for (const p of config.paths) {
    const resolved = normalizePath(joinPath(pluginUri, p));
    if (isEqualOrParent(resolved, pluginUri)) {
      dirs.push(resolved);
    }
  }
  return dirs;
}
__name(resolveComponentDirs, "resolveComponentDirs");
let AgentPluginService = class AgentPluginService2 extends Disposable {
  static {
    __name(this, "AgentPluginService");
  }
  constructor(instantiationService, configurationService, storageService) {
    super();
    this.enablementModel = this._register(new EnablementModel("agentPlugins.enablement", storageService));
    const pluginsEnabled = observableConfigValue(ChatConfiguration.PluginsEnabled, true, configurationService);
    const discoveries = [];
    for (const descriptor of agentPluginDiscoveryRegistry.getAll()) {
      const discovery = instantiationService.createInstance(descriptor);
      this._register(discovery);
      discoveries.push(discovery);
      discovery.start(this.enablementModel);
    }
    this.plugins = derived((read) => {
      if (!pluginsEnabled.read(read)) {
        return [];
      }
      return this._dedupeAndSort(discoveries.flatMap((d) => d.plugins.read(read)));
    });
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
  __param(1, IConfigurationService),
  __param(2, IStorageService)
], AgentPluginService);
class AbstractAgentPluginDiscovery extends Disposable {
  static {
    __name(this, "AbstractAgentPluginDiscovery");
  }
  constructor(_fileService, _pathService, _logService, _instantiationService) {
    super();
    this._fileService = _fileService;
    this._pathService = _pathService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._pluginEntries = /* @__PURE__ */ new Map();
    this._plugins = observableValue("discoveredAgentPlugins", []);
    this.plugins = this._plugins;
    this._discoverVersion = 0;
  }
  async _refreshPlugins() {
    const version = ++this._discoverVersion;
    const plugins = await this._discoverAndBuildPlugins();
    if (version !== this._discoverVersion || this._store.isDisposed) {
      return;
    }
    this._plugins.set(plugins, void 0);
  }
  async _discoverAndBuildPlugins() {
    const sources = await this._discoverPluginSources();
    const plugins = [];
    const seenPluginUris = /* @__PURE__ */ new Set();
    for (const source of sources) {
      const key = source.uri.toString();
      if (!seenPluginUris.has(key)) {
        seenPluginUris.add(key);
        const adapter = await this._detectPluginFormatAdapter(source.uri);
        plugins.push(this._toPlugin(source.uri, adapter, source.fromMarketplace, () => source.remove()));
      }
    }
    this._disposePluginEntriesExcept(seenPluginUris);
    plugins.sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
    return plugins;
  }
  async _detectPluginFormatAdapter(pluginUri) {
    if (await this._pathExists(joinPath(pluginUri, ".plugin", "plugin.json"))) {
      return this._instantiationService.createInstance(OpenPluginFormatAdapter);
    }
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
  _toPlugin(uri, adapter, fromMarketplace, removeCallback) {
    const key = uri.toString();
    const existing = this._pluginEntries.get(key);
    if (existing) {
      if (existing.adapter.format !== adapter.format) {
        existing.store.dispose();
        this._pluginEntries.delete(key);
      } else {
        return existing.plugin;
      }
    }
    const store = new DisposableStore();
    const enablement = derived((r) => this._enablementModel.readEnabled(key, r));
    const manifest = observableValue("agentPluginManifest", void 0);
    const observeComponent = /* @__PURE__ */ __name((prop, doRead, tryReadEmbedded, defaultPath = prop) => {
      const secondObs = derivedOpts({ equalsFn: equals }, (reader) => manifest.read(reader)?.[prop]);
      const wrapped = derived((reader) => {
        const section = secondObs.read(reader);
        if (tryReadEmbedded) {
          if (section && typeof section === "object" && !Array.isArray(section) && !hasKey(section, { paths: true })) {
            return { kind: "const", data: new ObservablePromise(tryReadEmbedded(section)) };
          }
        }
        const paths = parseComponentPathConfig(section);
        const dirs = resolveComponentDirs(uri, defaultPath, paths);
        for (const d of dirs) {
          const watcher = this._fileService.createWatcher(d, { recursive: false, excludes: [] });
          reader.store.add(watcher);
          reader.store.add(watcher.onDidChange(() => changeTrigger.trigger(void 0)));
        }
        return { kind: "dirs", dirs };
      });
      const changeTrigger = observableSignal("fileChange");
      const promised = derived((reader) => {
        const w = wrapped.read(reader);
        if (w.kind === "const") {
          return w.data.promiseResult;
        } else {
          changeTrigger.read(reader);
          const promise = new ObservablePromise(doRead(w.dirs));
          return promise.promiseResult;
        }
      });
      const result = promised.map((w, r) => w.read(r)?.data ?? Iterable.empty());
      return result.recomputeInitiallyAndOnChange(store);
    }, "observeComponent");
    const commands = observeComponent("commands", (d) => this._readMarkdownComponents(d));
    const skills = observeComponent("skills", (d) => this._readSkills(uri, d));
    const agents = observeComponent("agents", (d) => this._readMarkdownComponents(d));
    const instructions = observeComponent("rules", (d) => this._readRules(d));
    const hooks = observeComponent("hooks", (paths) => this._readHooksFromPaths(uri, paths, adapter), async (section) => {
      const userHome = (await this._pathService.userHome()).fsPath;
      return adapter.parseHooks(section, uri, userHome);
    }, adapter.hookConfigPath);
    const mcpServerDefinitions = observeComponent("mcpServers", (paths) => this._readMcpDefinitionsFromPaths(paths), async (section) => this._parseMcpServerDefinitionMap({ mcpServers: section }), ".mcp.json");
    const readManifest = /* @__PURE__ */ __name(async () => {
      manifest.set(await this._readManifest(uri, adapter), void 0);
    }, "readManifest");
    const manifestWatcher = this._fileService.createWatcher(joinPath(uri, adapter.manifestPath), { recursive: false, excludes: [] });
    store.add(manifestWatcher);
    store.add(manifestWatcher.onDidChange(() => readManifest()));
    readManifest();
    const plugin = {
      uri,
      label: fromMarketplace?.name ?? basename(uri),
      enablement,
      remove: removeCallback,
      hooks,
      commands,
      skills,
      agents,
      instructions,
      mcpServerDefinitions,
      fromMarketplace
    };
    this._pluginEntries.set(key, { store, plugin, adapter });
    return plugin;
  }
  async _readManifest(pluginUri, adapter) {
    const json = await this._readJsonFile(joinPath(pluginUri, adapter.manifestPath));
    if (json && typeof json === "object") {
      return json;
    }
    return void 0;
  }
  /**
   * Reads hook definitions from a list of resolved paths (JSON files).
   * Each path is tried in order; the first one that contains valid hook
   * JSON is used.
   */
  async _readHooksFromPaths(pluginUri, paths, adapter) {
    const userHome = (await this._pathService.userHome()).fsPath;
    for (const hookPath of paths) {
      const json = await this._readJsonFile(hookPath);
      if (json) {
        try {
          return adapter.parseHooks(json, pluginUri, userHome);
        } catch (e) {
          this._logService.info(`[AgentPluginDiscovery] Failed to parse hooks from ${hookPath.toString()}:`, e);
        }
      }
    }
    return [];
  }
  /**
   * Reads MCP server definitions from a list of resolved paths (JSON files).
   * Definitions from all files are merged; the first definition for a given
   * server name wins.
   */
  async _readMcpDefinitionsFromPaths(paths) {
    const merged = /* @__PURE__ */ new Map();
    for (const mcpPath of paths) {
      const json = await this._readJsonFile(mcpPath);
      for (const def of this._parseMcpServerDefinitionMap(json)) {
        if (!merged.has(def.name)) {
          merged.set(def.name, def.configuration);
        }
      }
    }
    return [...merged.entries()].map(([name, configuration]) => ({ name, configuration })).sort((a, b) => a.name.localeCompare(b.name));
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
  async _readJsonFile(uri) {
    try {
      const fileContents = await this._fileService.readFile(uri);
      return parseJSONC(fileContents.value.toString());
    } catch {
      return void 0;
    }
  }
  async _readSkills(pluginRoot, dirs) {
    const seen = /* @__PURE__ */ new Set();
    const skills = [];
    const addSkill = /* @__PURE__ */ __name((name, skillMd) => {
      if (!seen.has(name)) {
        seen.add(name);
        skills.push({ uri: skillMd, name });
      }
    }, "addSkill");
    for (const dir of dirs) {
      const skillMd = URI.joinPath(dir, "SKILL.md");
      if (await this._pathExists(skillMd)) {
        addSkill(basename(dir), skillMd);
        continue;
      }
      let stat;
      try {
        stat = await this._fileService.resolve(dir);
      } catch {
        continue;
      }
      if (!stat.isDirectory || !stat.children) {
        continue;
      }
      for (const child of stat.children) {
        const childSkillMd = URI.joinPath(child.resource, "SKILL.md");
        if (await this._pathExists(childSkillMd)) {
          addSkill(basename(child.resource), childSkillMd);
        }
      }
    }
    if (skills.length === 0) {
      const rootSkillMd = URI.joinPath(pluginRoot, "SKILL.md");
      if (await this._pathExists(rootSkillMd)) {
        addSkill(basename(pluginRoot), rootSkillMd);
      }
    }
    skills.sort((a, b) => a.name.localeCompare(b.name));
    return skills;
  }
  /**
   * Scans directories for rule/instruction files (`.mdc`, `.md`,
   * `.instructions.md`), returning `{ uri, name }` entries where name is
   * derived from the filename minus the matched suffix.
   */
  async _readRules(dirs) {
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    const matchSuffix = /* @__PURE__ */ __name((filename) => {
      const lower = filename.toLowerCase();
      return RULE_FILE_SUFFIXES.find((s) => lower.endsWith(s));
    }, "matchSuffix");
    const addItem = /* @__PURE__ */ __name((name, uri) => {
      if (!seen.has(name)) {
        seen.add(name);
        items.push({ uri, name });
      }
    }, "addItem");
    for (const dir of dirs) {
      let stat;
      try {
        stat = await this._fileService.resolve(dir);
      } catch {
        continue;
      }
      if (stat.isFile) {
        const suffix = matchSuffix(basename(dir));
        if (suffix) {
          addItem(basename(dir).slice(0, -suffix.length), dir);
        }
        continue;
      }
      if (!stat.isDirectory || !stat.children) {
        continue;
      }
      for (const child of stat.children) {
        if (!child.isFile) {
          continue;
        }
        const suffix = matchSuffix(child.name);
        if (suffix) {
          addItem(child.name.slice(0, -suffix.length), child.resource);
        }
      }
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }
  /**
   * Scans directories for `.md` files, returning `{ uri, name }` entries
   * where name is derived from the filename (minus the `.md` extension).
   * If a path points to a specific `.md` file, it is included directly.
   * Used for both commands and agents.
   */
  async _readMarkdownComponents(dirs) {
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    const addItem = /* @__PURE__ */ __name((name, uri) => {
      if (!seen.has(name)) {
        seen.add(name);
        items.push({ uri, name });
      }
    }, "addItem");
    for (const dir of dirs) {
      let stat;
      try {
        stat = await this._fileService.resolve(dir);
      } catch {
        continue;
      }
      if (stat.isFile && extname(dir).toLowerCase() === COMMAND_FILE_SUFFIX) {
        addItem(basename(dir).slice(0, -COMMAND_FILE_SUFFIX.length), dir);
        continue;
      }
      if (!stat.isDirectory || !stat.children) {
        continue;
      }
      for (const child of stat.children) {
        if (!child.isFile || extname(child.resource).toLowerCase() !== COMMAND_FILE_SUFFIX) {
          continue;
        }
        addItem(basename(child.resource).slice(0, -COMMAND_FILE_SUFFIX.length), child.resource);
      }
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
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
}
let ConfiguredAgentPluginDiscovery = class ConfiguredAgentPluginDiscovery2 extends AbstractAgentPluginDiscovery {
  static {
    __name(this, "ConfiguredAgentPluginDiscovery");
  }
  constructor(_configurationService, fileService, _pluginMarketplaceService, _workspaceContextService, pathService, logService, instantiationService) {
    super(fileService, pathService, logService, instantiationService);
    this._configurationService = _configurationService;
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._workspaceContextService = _workspaceContextService;
    this._pluginLocationsConfig = observableConfigValue(ChatConfiguration.PluginLocations, {}, _configurationService);
  }
  start(enablementModel) {
    this._enablementModel = enablementModel;
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    this._register(autorun((reader) => {
      this._pluginLocationsConfig.read(reader);
      scheduler.schedule();
    }));
    scheduler.schedule();
  }
  async _discoverPluginSources() {
    const sources = [];
    const config = this._pluginLocationsConfig.get();
    const userHome = await this._getUserHome();
    for (const [path, enabled] of Object.entries(config)) {
      if (!path.trim() || enabled === false) {
        continue;
      }
      const resources = this._resolvePluginPath(path.trim(), userHome);
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
        const fromMarketplace = this._pluginMarketplaceService.getMarketplacePluginMetadata(stat.resource);
        const configKey = path;
        sources.push({
          uri: stat.resource,
          fromMarketplace,
          remove: /* @__PURE__ */ __name(() => this._removePluginPath(configKey), "remove")
        });
      }
    }
    return sources;
  }
  async _getUserHome() {
    const userHome = await this._pathService.userHome();
    return userHome.scheme === "file" ? userHome.fsPath : userHome.path;
  }
  /**
   * Resolves a plugin path to one or more resource URIs. Supports:
   * - Absolute paths (used directly)
   * - Tilde paths (expanded to user home directory)
   * - Relative paths (resolved against each workspace folder)
   */
  _resolvePluginPath(path, userHome) {
    if (path.startsWith("~")) {
      path = untildify(path, userHome);
    }
    if (win32.isAbsolute(path) || posix.isAbsolute(path)) {
      return [URI.file(path)];
    }
    return this._workspaceContextService.getWorkspace().folders.map((folder) => joinPath(folder.uri, path));
  }
  /**
   * Removes a plugin path from `chat.pluginLocations` in the most specific
   * config target where the key is defined.
   */
  _removePluginPath(configKey) {
    const inspected = this._configurationService.inspect(ChatConfiguration.PluginLocations);
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
        const updated = { ...mapping };
        delete updated[configKey];
        this._configurationService.updateValue(ChatConfiguration.PluginLocations, updated, target);
        return;
      }
    }
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
let MarketplaceAgentPluginDiscovery = class MarketplaceAgentPluginDiscovery2 extends AbstractAgentPluginDiscovery {
  static {
    __name(this, "MarketplaceAgentPluginDiscovery");
  }
  constructor(_pluginMarketplaceService, _pluginRepositoryService, fileService, pathService, logService, instantiationService) {
    super(fileService, pathService, logService, instantiationService);
    this._pluginMarketplaceService = _pluginMarketplaceService;
    this._pluginRepositoryService = _pluginRepositoryService;
  }
  start(enablementModel) {
    this._enablementModel = enablementModel;
    const scheduler = this._register(new RunOnceScheduler(() => this._refreshPlugins(), 0));
    this._register(autorun((reader) => {
      this._pluginMarketplaceService.installedPlugins.read(reader);
      scheduler.schedule();
    }));
    scheduler.schedule();
  }
  async _discoverPluginSources() {
    const installed = this._pluginMarketplaceService.installedPlugins.get();
    const sources = [];
    for (const entry of installed) {
      let stat;
      try {
        stat = await this._fileService.resolve(entry.pluginUri);
      } catch {
        this._logService.debug(`[MarketplaceAgentPluginDiscovery] Could not resolve installed plugin: ${entry.pluginUri.toString()}`);
        continue;
      }
      if (!stat.isDirectory) {
        this._logService.debug(`[MarketplaceAgentPluginDiscovery] Installed plugin path is not a directory: ${entry.pluginUri.toString()}`);
        continue;
      }
      sources.push({
        uri: stat.resource,
        fromMarketplace: entry.plugin,
        remove: /* @__PURE__ */ __name(() => {
          this._pluginMarketplaceService.removeInstalledPlugin(entry.pluginUri);
          this._pluginRepositoryService.cleanupPluginSource(entry.plugin).catch((error) => {
            this._logService.error("[MarketplaceAgentPluginDiscovery] Failed to clean up plugin source", error);
          });
        }, "remove")
      });
    }
    return sources;
  }
};
MarketplaceAgentPluginDiscovery = __decorate([
  __param(0, IPluginMarketplaceService),
  __param(1, IAgentPluginRepositoryService),
  __param(2, IFileService),
  __param(3, IPathService),
  __param(4, ILogService),
  __param(5, IInstantiationService)
], MarketplaceAgentPluginDiscovery);
export {
  AbstractAgentPluginDiscovery,
  AgentPluginService,
  ConfiguredAgentPluginDiscovery,
  MarketplaceAgentPluginDiscovery,
  shellQuotePluginRootInCommand
};
//# sourceMappingURL=agentPluginServiceImpl.js.map
