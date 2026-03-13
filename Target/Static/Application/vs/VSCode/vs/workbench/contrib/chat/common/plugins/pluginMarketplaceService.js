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
import { runWhenGlobalIdle } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { parse as parseJSONC } from "../../../../../base/common/json.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { revive } from "../../../../../base/common/marshalling.js";
import { derived, observableFromEvent, observableValue } from "../../../../../base/common/observable.js";
import { isEqual, isEqualOrParent, joinPath, normalizePath, relativePath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableMemento } from "../../../../../platform/observable/common/observableMemento.js";
import { asJson, IRequestService } from "../../../../../platform/request/common/request.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { AutoUpdateConfigurationKey } from "../../../extensions/common/extensions.js";
import { ChatConfiguration } from "../constants.js";
import { IAgentPluginRepositoryService } from "./agentPluginRepositoryService.js";
import { IWorkspacePluginSettingsService } from "./workspacePluginSettingsService.js";
import { IWorkspaceTrustManagementService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { deduplicateMarketplaceReferences, parseMarketplaceReference, parseMarketplaceReferences } from "./marketplaceReference.js";
import { deduplicateMarketplaceReferences as deduplicateMarketplaceReferences2, MarketplaceReferenceKind, parseMarketplaceReference as parseMarketplaceReference2, parseMarketplaceReferences as parseMarketplaceReferences2 } from "./marketplaceReference.js";
var MarketplaceType;
(function(MarketplaceType2) {
  MarketplaceType2["Copilot"] = "copilot";
  MarketplaceType2["Claude"] = "claude";
  MarketplaceType2["OpenPlugin"] = "openPlugin";
})(MarketplaceType || (MarketplaceType = {}));
var PluginSourceKind;
(function(PluginSourceKind2) {
  PluginSourceKind2["RelativePath"] = "relativePath";
  PluginSourceKind2["GitHub"] = "github";
  PluginSourceKind2["GitUrl"] = "url";
  PluginSourceKind2["Npm"] = "npm";
  PluginSourceKind2["Pip"] = "pip";
})(PluginSourceKind || (PluginSourceKind = {}));
const IPluginMarketplaceService = createDecorator("pluginMarketplaceService");
const MARKETPLACE_DEFINITIONS = [
  { type: "openPlugin", path: "marketplace.json" },
  { type: "openPlugin", path: ".plugin/marketplace.json" },
  { type: "copilot", path: ".github/plugin/marketplace.json" },
  { type: "claude", path: ".claude-plugin/marketplace.json" }
];
const GITHUB_MARKETPLACE_CACHE_TTL_MS = 8 * 60 * 60 * 1e3;
const GITHUB_MARKETPLACE_CACHE_STORAGE_KEY = "chat.plugins.marketplaces.githubCache.v1";
const PLUGIN_UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1e3;
const PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY = "chat.plugins.lastUpdateCheck.v1";
function ensureSourceDescriptor(plugin) {
  if (plugin.sourceDescriptor) {
    return plugin;
  }
  return {
    ...plugin,
    sourceDescriptor: { kind: "relativePath", path: plugin.source }
  };
}
__name(ensureSourceDescriptor, "ensureSourceDescriptor");
const installedPluginsMemento = observableMemento({
  defaultValue: [],
  key: "chat.plugins.installed.v1",
  toStorage: /* @__PURE__ */ __name((value) => JSON.stringify(value), "toStorage"),
  fromStorage: /* @__PURE__ */ __name((value) => {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  }, "fromStorage")
});
const trustedMarketplacesMemento = observableMemento({
  defaultValue: [],
  key: "chat.plugins.trustedMarketplaces.v1",
  toStorage: /* @__PURE__ */ __name((value) => JSON.stringify(value), "toStorage"),
  fromStorage: /* @__PURE__ */ __name((value) => {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  }, "fromStorage")
});
const lastFetchedPluginsMemento = observableMemento({
  defaultValue: { plugins: [], fetchedAt: 0 },
  key: "chat.plugins.lastFetchedPlugins.v2",
  toStorage: /* @__PURE__ */ __name((value) => JSON.stringify(value), "toStorage"),
  fromStorage: /* @__PURE__ */ __name((value) => {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.plugins)) {
      return parsed;
    }
    return { plugins: [], fetchedAt: 0 };
  }, "fromStorage")
});
let PluginMarketplaceService = class PluginMarketplaceService2 extends Disposable {
  static {
    __name(this, "PluginMarketplaceService");
  }
  constructor(_configurationService, _requestService, _fileService, _pluginRepositoryService, _logService, _storageService, _workspacePluginSettingsService, _workspaceTrustService) {
    super();
    this._configurationService = _configurationService;
    this._requestService = _requestService;
    this._fileService = _fileService;
    this._pluginRepositoryService = _pluginRepositoryService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._workspacePluginSettingsService = _workspacePluginSettingsService;
    this._workspaceTrustService = _workspaceTrustService;
    this._gitHubMarketplaceCache = new Lazy(() => this._loadPersistedGitHubMarketplaceCache());
    this._hasUpdatesAvailable = observableValue("hasUpdatesAvailable", false);
    this.hasUpdatesAvailable = this._hasUpdatesAvailable;
    this._installedPluginsStore = this._register(installedPluginsMemento(-1, 1, _storageService));
    this._trustedMarketplacesStore = this._register(trustedMarketplacesMemento(-1, 1, _storageService));
    this._lastFetchedPluginsStore = this._register(lastFetchedPluginsMemento(-1, 1, _storageService));
    this.lastFetchedPlugins = this._lastFetchedPluginsStore.map((s) => {
      const revived = revive(s);
      return revived.plugins.map(ensureSourceDescriptor);
    });
    this.installedPlugins = this._installedPluginsStore.map((s) => revive(s).map((e) => ({
      ...e,
      plugin: ensureSourceDescriptor(e.plugin)
    })));
    const workspaceTrusted = observableFromEvent(this, this._workspaceTrustService.onDidChangeTrust, () => this._workspaceTrustService.isWorkspaceTrusted());
    this.recommendedPlugins = derived((reader) => {
      if (!workspaceTrusted.read(reader)) {
        return /* @__PURE__ */ new Set();
      }
      const enabledMap = this._workspacePluginSettingsService.enabledPlugins.read(reader);
      const keys = /* @__PURE__ */ new Set();
      for (const [key, value] of enabledMap) {
        if (value) {
          keys.add(key);
        }
      }
      return keys;
    });
    this.onDidChangeMarketplaces = Event.any(Event.filter(_configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(ChatConfiguration.PluginsEnabled) || e.affectsConfiguration(ChatConfiguration.PluginMarketplaces)), Event.fromObservableLight(this._workspacePluginSettingsService.extraMarketplaces), Event.map(this._workspaceTrustService.onDidChangeTrust, () => {
    }));
    this._register(runWhenGlobalIdle(() => {
      this._scheduleUpdateCheck();
      this._register(Event.filter(_configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(AutoUpdateConfigurationKey))(() => this._scheduleUpdateCheck()));
    }));
  }
  dispose() {
    if (this._updateCheckTimer !== void 0) {
      clearTimeout(this._updateCheckTimer);
      this._updateCheckTimer = void 0;
    }
    super.dispose();
  }
  clearUpdatesAvailable() {
    this._hasUpdatesAvailable.set(false, void 0);
  }
  async fetchMarketplacePlugins(token) {
    if (!this._configurationService.getValue(ChatConfiguration.PluginsEnabled)) {
      return [];
    }
    const configuredRefs = this._configurationService.getValue(ChatConfiguration.PluginMarketplaces) ?? [];
    const configRefs = parseMarketplaceReferences(configuredRefs);
    let allRefs;
    if (this._workspaceTrustService.isWorkspaceTrusted()) {
      const workspaceEntries = this._workspacePluginSettingsService.extraMarketplaces.get();
      allRefs = deduplicateMarketplaceReferences(workspaceEntries.map((e) => e.reference), configRefs);
    } else {
      allRefs = configRefs;
    }
    for (const value of configuredRefs) {
      if (typeof value !== "string" || !parseMarketplaceReference(value)) {
        this._logService.debug(`[PluginMarketplaceService] Ignoring invalid marketplace entry: ${String(value)}`);
      }
    }
    const results = await Promise.all(allRefs.map((ref) => {
      if (ref.kind === "githubShorthand" && ref.githubRepo) {
        return this._fetchFromGitHubRepo(ref, ref.githubRepo, token);
      }
      return this._fetchFromClonedRepo(ref, token);
    }));
    const plugins = results.flat();
    this._lastFetchedPluginsStore.set({ plugins, fetchedAt: Date.now() }, void 0);
    return plugins;
  }
  async _fetchFromGitHubRepo(reference, repo, token) {
    const cache = this._gitHubMarketplaceCache.value;
    const cached = this._getCachedGitHubMarketplacePlugins(cache, reference.canonicalId);
    if (cached) {
      return cached.map((c) => ({
        ...c,
        marketplace: reference.displayLabel,
        marketplaceReference: reference
      }));
    }
    let repoMayBePrivate = true;
    for (const def of MARKETPLACE_DEFINITIONS) {
      if (token.isCancellationRequested) {
        return [];
      }
      const url = `https://raw.githubusercontent.com/${repo}/main/${def.path}`;
      try {
        const context = await this._requestService.request({ type: "GET", url, callSite: "pluginMarketplaceService.fetchPluginList" }, token);
        const statusCode = context.res.statusCode;
        if (statusCode !== 200) {
          repoMayBePrivate &&= statusCode !== void 0 && statusCode >= 400 && statusCode < 500;
          this._logService.debug(`[PluginMarketplaceService] ${url} returned status ${statusCode}, skipping`);
          continue;
        }
        const json = await asJson(context);
        if (!json?.plugins || !Array.isArray(json.plugins)) {
          this._logService.debug(`[PluginMarketplaceService] ${url} did not contain a valid plugins array, skipping`);
          continue;
        }
        const plugins = json.plugins.filter((p) => typeof p.name === "string" && !!p.name).flatMap((p) => {
          const sourceDescriptor = parsePluginSource(p.source, json.metadata?.pluginRoot, {
            pluginName: p.name,
            logService: this._logService,
            logPrefix: `[PluginMarketplaceService]`
          });
          if (!sourceDescriptor) {
            return [];
          }
          const source = sourceDescriptor.kind === "relativePath" ? sourceDescriptor.path : "";
          return [{
            name: p.name,
            description: p.description ?? "",
            version: p.version ?? "",
            source,
            sourceDescriptor,
            marketplace: reference.displayLabel,
            marketplaceReference: reference,
            marketplaceType: def.type,
            readmeUri: getMarketplaceReadmeUri(repo, source)
          }];
        });
        cache.set(reference.canonicalId, {
          plugins,
          expiresAt: Date.now() + GITHUB_MARKETPLACE_CACHE_TTL_MS,
          referenceRawValue: reference.rawValue
        });
        this._savePersistedGitHubMarketplaceCache(cache);
        return plugins;
      } catch (err) {
        this._logService.debug(`[PluginMarketplaceService] Failed to fetch marketplace.json from ${url}:`, err);
        continue;
      }
    }
    if (repoMayBePrivate) {
      this._logService.debug(`[PluginMarketplaceService] ${repo} may be private, attempting clone-based marketplace discovery`);
      return this._fetchFromClonedRepo(reference, token);
    }
    this._logService.debug(`[PluginMarketplaceService] No marketplace.json found in ${repo}`);
    return [];
  }
  _getCachedGitHubMarketplacePlugins(cache, cacheKey) {
    const cached = cache.get(cacheKey);
    if (!cached) {
      return void 0;
    }
    if (cached.expiresAt <= Date.now()) {
      cache.delete(cacheKey);
      this._savePersistedGitHubMarketplaceCache(cache);
      return void 0;
    }
    return [...cached.plugins];
  }
  _loadPersistedGitHubMarketplaceCache() {
    const cache = /* @__PURE__ */ new Map();
    const now = Date.now();
    const stored = this._storageService.getObject(
      GITHUB_MARKETPLACE_CACHE_STORAGE_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    if (!stored) {
      return cache;
    }
    const revived = revive(stored);
    for (const [cacheKey, entry] of Object.entries(revived)) {
      if (!entry || !Array.isArray(entry.plugins) || typeof entry.expiresAt !== "number" || entry.expiresAt <= now || typeof entry.referenceRawValue !== "string") {
        continue;
      }
      const reference = parseMarketplaceReference(entry.referenceRawValue);
      if (!reference) {
        continue;
      }
      const plugins = entry.plugins.map((plugin) => ensureSourceDescriptor({
        ...plugin,
        marketplace: reference.displayLabel,
        marketplaceReference: reference
      }));
      cache.set(cacheKey, {
        plugins,
        expiresAt: entry.expiresAt,
        referenceRawValue: entry.referenceRawValue
      });
    }
    return cache;
  }
  _savePersistedGitHubMarketplaceCache(cache) {
    const serialized = {};
    for (const [cacheKey, entry] of cache) {
      if (!entry.plugins.length || entry.expiresAt <= Date.now()) {
        continue;
      }
      serialized[cacheKey] = {
        expiresAt: entry.expiresAt,
        referenceRawValue: entry.referenceRawValue,
        plugins: entry.plugins
      };
    }
    if (Object.keys(serialized).length === 0) {
      this._storageService.remove(
        GITHUB_MARKETPLACE_CACHE_STORAGE_KEY,
        -1
        /* StorageScope.APPLICATION */
      );
      return;
    }
    this._storageService.store(
      GITHUB_MARKETPLACE_CACHE_STORAGE_KEY,
      JSON.stringify(serialized),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  getMarketplacePluginMetadata(pluginUri) {
    const installed = this.installedPlugins.get();
    return installed.find((e) => isEqualOrParent(pluginUri, e.pluginUri))?.plugin;
  }
  addInstalledPlugin(pluginUri, plugin) {
    const current = this.installedPlugins.get();
    const existing = current.find((e) => isEqual(e.pluginUri, pluginUri));
    if (existing) {
      this._installedPluginsStore.set(current.map((c) => c === existing ? { pluginUri, plugin, enabled: existing.enabled } : c), void 0);
    } else {
      this._installedPluginsStore.set([...current, { pluginUri, plugin, enabled: true }], void 0);
    }
  }
  removeInstalledPlugin(pluginUri) {
    const current = this.installedPlugins.get();
    this._installedPluginsStore.set(current.filter((e) => !isEqual(e.pluginUri, pluginUri)), void 0);
  }
  setInstalledPluginEnabled(pluginUri, enabled) {
    const current = this.installedPlugins.get();
    this._installedPluginsStore.set(current.map((e) => isEqual(e.pluginUri, pluginUri) ? { ...e, enabled } : e), void 0);
  }
  isMarketplaceTrusted(ref) {
    return this._trustedMarketplacesStore.get().includes(ref.canonicalId);
  }
  trustMarketplace(ref) {
    const current = this._trustedMarketplacesStore.get();
    if (!current.includes(ref.canonicalId)) {
      this._trustedMarketplacesStore.set([...current, ref.canonicalId], void 0);
    }
  }
  // --- Periodic update check ------------------------------------------------
  _isAutoUpdateEnabled() {
    return this._configurationService.getValue(AutoUpdateConfigurationKey);
  }
  /**
   * (Re-)schedules the next periodic update check. Called on
   * construction and whenever the auto-update config changes.
   */
  _scheduleUpdateCheck() {
    if (this._updateCheckTimer !== void 0) {
      clearTimeout(this._updateCheckTimer);
      this._updateCheckTimer = void 0;
    }
    if (!this._isAutoUpdateEnabled()) {
      return;
    }
    const lastCheck = this._storageService.getNumber(PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY, -1, 0);
    const elapsed = Date.now() - lastCheck;
    const delay = Math.max(0, PLUGIN_UPDATE_CHECK_INTERVAL_MS - elapsed);
    this._updateCheckTimer = setTimeout(() => this._runUpdateCheck(), delay);
  }
  async _runUpdateCheck() {
    this._updateCheckTimer = void 0;
    try {
      const installed = this.installedPlugins.get().filter((e) => e.enabled);
      if (installed.length === 0) {
        return;
      }
      const seenMarketplaces = /* @__PURE__ */ new Set();
      let hasUpdates = false;
      for (const entry of installed) {
        const ref = entry.plugin.marketplaceReference;
        if (seenMarketplaces.has(ref.canonicalId)) {
          continue;
        }
        seenMarketplaces.add(ref.canonicalId);
        try {
          const behind = await this._pluginRepositoryService.fetchRepository(ref);
          if (behind) {
            hasUpdates = true;
            break;
          }
        } catch (err) {
          this._logService.debug(`[PluginMarketplaceService] Update check failed for ${ref.displayLabel}:`, err);
        }
      }
      this._hasUpdatesAvailable.set(hasUpdates, void 0);
      this._storageService.store(
        PLUGIN_UPDATE_LAST_CHECK_STORAGE_KEY,
        Date.now(),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    } catch (err) {
      this._logService.debug("[PluginMarketplaceService] Periodic update check failed:", err);
    } finally {
      if (this._isAutoUpdateEnabled()) {
        this._updateCheckTimer = setTimeout(() => this._runUpdateCheck(), PLUGIN_UPDATE_CHECK_INTERVAL_MS);
      }
    }
  }
  async _fetchFromClonedRepo(reference, token) {
    let repoDir;
    try {
      repoDir = await this._pluginRepositoryService.ensureRepository(reference);
    } catch (err) {
      this._logService.debug(`[PluginMarketplaceService] Failed to prepare marketplace repository ${reference.rawValue}:`, err);
      return [];
    }
    return this._readPluginsFromDirectory(repoDir, reference, token);
  }
  async readPluginsFromDirectory(repoDir, reference) {
    return this._readPluginsFromDirectory(repoDir, reference);
  }
  async _readPluginsFromDirectory(repoDir, reference, token) {
    for (const def of MARKETPLACE_DEFINITIONS) {
      if (token?.isCancellationRequested) {
        return [];
      }
      const definitionUri = joinPath(repoDir, def.path);
      let json;
      try {
        const contents = await this._fileService.readFile(definitionUri);
        json = parseJSONC(contents.value.toString());
      } catch {
        continue;
      }
      if (!json?.plugins || !Array.isArray(json.plugins)) {
        this._logService.debug(`[PluginMarketplaceService] ${definitionUri.toString()} did not contain a valid plugins array, skipping`);
        continue;
      }
      return json.plugins.filter((p) => typeof p.name === "string" && !!p.name).flatMap((p) => {
        const sourceDescriptor = parsePluginSource(p.source, json.metadata?.pluginRoot, {
          pluginName: p.name,
          logService: this._logService,
          logPrefix: `[PluginMarketplaceService]`
        });
        if (!sourceDescriptor) {
          return [];
        }
        const source = sourceDescriptor.kind === "relativePath" ? sourceDescriptor.path : "";
        return [{
          name: p.name,
          description: p.description ?? "",
          version: p.version ?? "",
          source,
          sourceDescriptor,
          marketplace: reference.displayLabel,
          marketplaceReference: reference,
          marketplaceType: def.type,
          readmeUri: getMarketplaceReadmeFileUri(repoDir, source)
        }];
      });
    }
    this._logService.debug(`[PluginMarketplaceService] No marketplace.json found in ${reference.rawValue}`);
    return [];
  }
};
PluginMarketplaceService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IRequestService),
  __param(2, IFileService),
  __param(3, IAgentPluginRepositoryService),
  __param(4, ILogService),
  __param(5, IStorageService),
  __param(6, IWorkspacePluginSettingsService),
  __param(7, IWorkspaceTrustManagementService)
], PluginMarketplaceService);
function normalizeMarketplacePath(value) {
  let normalized = value.trim().replace(/\\/g, "/");
  normalized = normalized.replace(/^\.?\/+/, "").replace(/\/+$/g, "");
  return normalized;
}
__name(normalizeMarketplacePath, "normalizeMarketplacePath");
function resolvePluginSource(pluginRoot, source) {
  const normalizedRoot = pluginRoot ? normalizeMarketplacePath(pluginRoot) : "";
  const normalizedSource = normalizeMarketplacePath(source);
  const repoRoot = URI.file("/");
  const pluginRootUri = normalizedRoot ? normalizePath(joinPath(repoRoot, normalizedRoot)) : repoRoot;
  if (!normalizedSource) {
    return normalizedRoot || void 0;
  }
  if (normalizedRoot && (normalizedSource === normalizedRoot || normalizedSource.startsWith(`${normalizedRoot}/`))) {
    return normalizedSource;
  }
  const resolvedUri = normalizePath(joinPath(pluginRootUri, normalizedSource));
  return relativePath(repoRoot, resolvedUri) ?? void 0;
}
__name(resolvePluginSource, "resolvePluginSource");
function parsePluginSource(rawSource, pluginRoot, logContext) {
  if (rawSource === void 0 || rawSource === null) {
    const resolved = resolvePluginSource(pluginRoot, "");
    if (resolved === void 0) {
      return void 0;
    }
    return { kind: "relativePath", path: resolved };
  }
  if (typeof rawSource === "string") {
    const resolved = resolvePluginSource(pluginRoot, rawSource);
    if (resolved === void 0) {
      return void 0;
    }
    return { kind: "relativePath", path: resolved };
  }
  if (typeof rawSource !== "object" || typeof rawSource.source !== "string") {
    logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': source object is missing a 'source' discriminant`);
    return void 0;
  }
  switch (rawSource.source) {
    case "github": {
      if (typeof rawSource.repo !== "string" || !rawSource.repo) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source is missing required 'repo' field`);
        return void 0;
      }
      if (!isValidGitHubRepo(rawSource.repo)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source repo must be in 'owner/repo' format`);
        return void 0;
      }
      if (!isOptionalString(rawSource.ref)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source 'ref' must be a string when provided`);
        return void 0;
      }
      if (!isOptionalGitSha(rawSource.sha)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': github source 'sha' must be a full 40-character commit hash when provided`);
        return void 0;
      }
      return {
        kind: "github",
        repo: rawSource.repo,
        ref: rawSource.ref,
        sha: rawSource.sha
      };
    }
    case "url": {
      if (typeof rawSource.url !== "string" || !rawSource.url) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': url source is missing required 'url' field`);
        return void 0;
      }
      if (!rawSource.url.toLowerCase().endsWith(".git")) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': url source must end with '.git'`);
        return void 0;
      }
      if (!isOptionalString(rawSource.ref)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': url source 'ref' must be a string when provided`);
        return void 0;
      }
      if (!isOptionalGitSha(rawSource.sha)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': url source 'sha' must be a full 40-character commit hash when provided`);
        return void 0;
      }
      return {
        kind: "url",
        url: rawSource.url,
        ref: rawSource.ref,
        sha: rawSource.sha
      };
    }
    case "npm": {
      if (typeof rawSource.package !== "string" || !rawSource.package) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': npm source is missing required 'package' field`);
        return void 0;
      }
      if (!isOptionalString(rawSource.version) || !isOptionalString(rawSource.registry)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': npm source 'version' and 'registry' must be strings when provided`);
        return void 0;
      }
      return {
        kind: "npm",
        package: rawSource.package,
        version: rawSource.version,
        registry: rawSource.registry
      };
    }
    case "pip": {
      if (typeof rawSource.package !== "string" || !rawSource.package) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': pip source is missing required 'package' field`);
        return void 0;
      }
      if (!isOptionalString(rawSource.version) || !isOptionalString(rawSource.registry)) {
        logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': pip source 'version' and 'registry' must be strings when provided`);
        return void 0;
      }
      return {
        kind: "pip",
        package: rawSource.package,
        version: rawSource.version,
        registry: rawSource.registry
      };
    }
    default:
      logContext.logService.warn(`${logContext.logPrefix} Skipping plugin '${logContext.pluginName}': unknown source kind '${rawSource.source}'`);
      return void 0;
  }
}
__name(parsePluginSource, "parsePluginSource");
function isOptionalString(value) {
  return value === void 0 || typeof value === "string";
}
__name(isOptionalString, "isOptionalString");
function isOptionalGitSha(value) {
  return value === void 0 || typeof value === "string" && /^[0-9a-fA-F]{40}$/.test(value);
}
__name(isOptionalGitSha, "isOptionalGitSha");
function isValidGitHubRepo(repo) {
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo);
}
__name(isValidGitHubRepo, "isValidGitHubRepo");
function getPluginSourceLabel(descriptor) {
  switch (descriptor.kind) {
    case "relativePath":
      return descriptor.path || ".";
    case "github":
      return descriptor.repo;
    case "url":
      return descriptor.url;
    case "npm":
      return descriptor.version ? `${descriptor.package}@${descriptor.version}` : descriptor.package;
    case "pip":
      return descriptor.version ? `${descriptor.package}==${descriptor.version}` : descriptor.package;
  }
}
__name(getPluginSourceLabel, "getPluginSourceLabel");
function hasSourceChanged(installed, marketplace) {
  if (installed.kind !== marketplace.kind) {
    return true;
  }
  switch (installed.kind) {
    case "github":
      return installed.ref !== marketplace.ref || installed.sha !== marketplace.sha;
    case "url":
      return installed.ref !== marketplace.ref || installed.sha !== marketplace.sha;
    case "npm":
      return installed.version !== marketplace.version;
    case "pip":
      return installed.version !== marketplace.version;
    default:
      return false;
  }
}
__name(hasSourceChanged, "hasSourceChanged");
function getMarketplaceReadmeUri(repo, source) {
  const normalizedSource = source.trim().replace(/^\.?\/+|\/+$/g, "");
  const readmePath = normalizedSource ? `${normalizedSource}/README.md` : "README.md";
  return URI.parse(`https://github.com/${repo}/blob/main/${readmePath}`);
}
__name(getMarketplaceReadmeUri, "getMarketplaceReadmeUri");
function getMarketplaceReadmeFileUri(repoDir, source) {
  const normalizedSource = source.trim().replace(/^\.?\/+|\/+$/g, "");
  return normalizedSource ? joinPath(repoDir, normalizedSource, "README.md") : joinPath(repoDir, "README.md");
}
__name(getMarketplaceReadmeFileUri, "getMarketplaceReadmeFileUri");
export {
  IPluginMarketplaceService,
  MarketplaceReferenceKind,
  MarketplaceType,
  PluginMarketplaceService,
  PluginSourceKind,
  deduplicateMarketplaceReferences2 as deduplicateMarketplaceReferences,
  getPluginSourceLabel,
  hasSourceChanged,
  parseMarketplaceReference2 as parseMarketplaceReference,
  parseMarketplaceReferences2 as parseMarketplaceReferences,
  parsePluginSource
};
//# sourceMappingURL=pluginMarketplaceService.js.map
