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
import { Event } from "../../../../../base/common/event.js";
import { parse as parseJSONC } from "../../../../../base/common/json.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { revive } from "../../../../../base/common/marshalling.js";
import { isEqualOrParent, joinPath, normalizePath, relativePath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { asJson, IRequestService } from "../../../../../platform/request/common/request.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ChatConfiguration } from "../constants.js";
import { IAgentPluginRepositoryService } from "./agentPluginRepositoryService.js";
var MarketplaceType;
(function(MarketplaceType2) {
  MarketplaceType2["Copilot"] = "copilot";
  MarketplaceType2["Claude"] = "claude";
})(MarketplaceType || (MarketplaceType = {}));
var MarketplaceReferenceKind;
(function(MarketplaceReferenceKind2) {
  MarketplaceReferenceKind2["GitHubShorthand"] = "githubShorthand";
  MarketplaceReferenceKind2["GitUri"] = "gitUri";
  MarketplaceReferenceKind2["LocalFileUri"] = "localFileUri";
})(MarketplaceReferenceKind || (MarketplaceReferenceKind = {}));
const IPluginMarketplaceService = createDecorator("pluginMarketplaceService");
const MARKETPLACE_DEFINITIONS = [
  { type: "copilot", path: ".github/plugin/marketplace.json" },
  { type: "claude", path: ".claude-plugin/marketplace.json" }
];
const GITHUB_MARKETPLACE_CACHE_TTL_MS = 8 * 60 * 60 * 1e3;
const GITHUB_MARKETPLACE_CACHE_STORAGE_KEY = "chat.plugins.marketplaces.githubCache.v1";
let PluginMarketplaceService = class PluginMarketplaceService2 {
  static {
    __name(this, "PluginMarketplaceService");
  }
  constructor(_configurationService, _requestService, _fileService, _pluginRepositoryService, _logService, _storageService) {
    this._configurationService = _configurationService;
    this._requestService = _requestService;
    this._fileService = _fileService;
    this._pluginRepositoryService = _pluginRepositoryService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._gitHubMarketplaceCache = new Lazy(() => this._loadPersistedGitHubMarketplaceCache());
    this.onDidChangeMarketplaces = Event.filter(_configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(ChatConfiguration.PluginsEnabled) || e.affectsConfiguration(ChatConfiguration.PluginMarketplaces));
  }
  async fetchMarketplacePlugins(token) {
    if (!this._configurationService.getValue(ChatConfiguration.PluginsEnabled)) {
      return [];
    }
    const configuredRefs = this._configurationService.getValue(ChatConfiguration.PluginMarketplaces) ?? [];
    const refs = parseMarketplaceReferences(configuredRefs);
    for (const value of configuredRefs) {
      if (typeof value !== "string" || !parseMarketplaceReference(value)) {
        this._logService.debug(`[PluginMarketplaceService] Ignoring invalid marketplace entry: ${String(value)}`);
      }
    }
    const results = await Promise.all(refs.map((ref) => {
      if (ref.kind === "githubShorthand" && ref.githubRepo) {
        return this._fetchFromGitHubRepo(ref, ref.githubRepo, token);
      }
      return this._fetchFromClonedRepo(ref, token);
    }));
    return results.flat();
  }
  async _fetchFromGitHubRepo(reference, repo, token) {
    const cache = this._gitHubMarketplaceCache.value;
    const cached = this._getCachedGitHubMarketplacePlugins(cache, reference.canonicalId);
    if (cached) {
      return cached;
    }
    let repoMayBePrivate = true;
    for (const def of MARKETPLACE_DEFINITIONS) {
      if (token.isCancellationRequested) {
        return [];
      }
      const url = `https://raw.githubusercontent.com/${repo}/main/${def.path}`;
      try {
        const context = await this._requestService.request({ type: "GET", url }, token);
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
          const source = resolvePluginSource(json.metadata?.pluginRoot, p.source ?? "");
          if (source === void 0) {
            this._logService.warn(`[PluginMarketplaceService] Skipping plugin '${p.name}' in ${repo}: invalid source path '${p.source ?? ""}' with pluginRoot '${json.metadata?.pluginRoot ?? ""}'`);
            return [];
          }
          return [{
            name: p.name,
            description: p.description ?? "",
            version: p.version ?? "",
            source,
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
      const plugins = entry.plugins.map((plugin) => ({
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
  async getMarketplacePluginMetadata(pluginUri) {
    const configuredRefs = this._configurationService.getValue(ChatConfiguration.PluginMarketplaces) ?? [];
    const refs = parseMarketplaceReferences(configuredRefs);
    for (const ref of refs) {
      let repoDir;
      try {
        repoDir = this._pluginRepositoryService.getRepositoryUri(ref);
      } catch {
        continue;
      }
      if (!isEqualOrParent(pluginUri, repoDir)) {
        continue;
      }
      for (const def of MARKETPLACE_DEFINITIONS) {
        const definitionUri = joinPath(repoDir, def.path);
        let json;
        try {
          const contents = await this._fileService.readFile(definitionUri);
          json = parseJSONC(contents.value.toString());
        } catch {
          continue;
        }
        if (!json?.plugins || !Array.isArray(json.plugins)) {
          continue;
        }
        for (const p of json.plugins) {
          if (typeof p.name !== "string" || !p.name) {
            continue;
          }
          const source = resolvePluginSource(json.metadata?.pluginRoot, p.source ?? "");
          if (source === void 0) {
            continue;
          }
          const pluginSourceUri = normalizePath(joinPath(repoDir, source));
          if (isEqualOrParent(pluginUri, pluginSourceUri)) {
            return {
              name: p.name,
              description: p.description ?? "",
              version: p.version ?? "",
              source,
              marketplace: ref.displayLabel,
              marketplaceReference: ref,
              marketplaceType: def.type,
              readmeUri: getMarketplaceReadmeFileUri(repoDir, source)
            };
          }
        }
      }
    }
    return void 0;
  }
  async _fetchFromClonedRepo(reference, token) {
    let repoDir;
    try {
      repoDir = await this._pluginRepositoryService.ensureRepository(reference);
    } catch (err) {
      this._logService.debug(`[PluginMarketplaceService] Failed to prepare marketplace repository ${reference.rawValue}:`, err);
      return [];
    }
    for (const def of MARKETPLACE_DEFINITIONS) {
      if (token.isCancellationRequested) {
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
        const source = resolvePluginSource(json.metadata?.pluginRoot, p.source ?? "");
        if (source === void 0) {
          this._logService.warn(`[PluginMarketplaceService] Skipping plugin '${p.name}' in ${reference.rawValue}: invalid source path '${p.source ?? ""}' with pluginRoot '${json.metadata?.pluginRoot ?? ""}'`);
          return [];
        }
        return [{
          name: p.name,
          description: p.description ?? "",
          version: p.version ?? "",
          source,
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
  __param(5, IStorageService)
], PluginMarketplaceService);
function parseMarketplaceReferences(values) {
  const byCanonicalId = /* @__PURE__ */ new Map();
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }
    const parsed = parseMarketplaceReference(value);
    if (!parsed) {
      continue;
    }
    if (!byCanonicalId.has(parsed.canonicalId)) {
      byCanonicalId.set(parsed.canonicalId, parsed);
    }
  }
  return [...byCanonicalId.values()];
}
__name(parseMarketplaceReferences, "parseMarketplaceReferences");
function parseMarketplaceReference(value) {
  const rawValue = value.trim();
  if (!rawValue) {
    return void 0;
  }
  const uriReference = parseUriMarketplaceReference(rawValue);
  if (uriReference) {
    return uriReference;
  }
  const scpReference = parseScpMarketplaceReference(rawValue);
  if (scpReference) {
    return scpReference;
  }
  const shorthandMatch = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(rawValue);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    return {
      rawValue,
      displayLabel: `${owner}/${repo}`,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
      canonicalId: getGitHubCanonicalId(owner, repo),
      cacheSegments: ["github.com", owner, repo],
      kind: "githubShorthand",
      githubRepo: `${owner}/${repo}`
    };
  }
  return void 0;
}
__name(parseMarketplaceReference, "parseMarketplaceReference");
function parseUriMarketplaceReference(rawValue) {
  let uri;
  try {
    uri = URI.parse(rawValue);
  } catch {
    return void 0;
  }
  const scheme = uri.scheme.toLowerCase();
  if (scheme === "file" && /^file:\/\//i.test(rawValue)) {
    const localRepositoryUri = URI.file(uri.fsPath);
    return {
      rawValue,
      displayLabel: localRepositoryUri.fsPath,
      cloneUrl: rawValue,
      canonicalId: `file:${localRepositoryUri.toString().toLowerCase()}`,
      cacheSegments: [],
      kind: "localFileUri",
      localRepositoryUri
    };
  }
  if (scheme !== "http" && scheme !== "https" && scheme !== "ssh") {
    return void 0;
  }
  if (!uri.authority) {
    return void 0;
  }
  const normalizedPath = normalizeGitRepoPath(uri.path);
  if (!normalizedPath) {
    return void 0;
  }
  const sanitizedAuthority = sanitizePathSegment(uri.authority.toLowerCase());
  const pathSegments = normalizedPath.slice(1, -4).split("/").map(sanitizePathSegment);
  return {
    rawValue,
    displayLabel: rawValue,
    cloneUrl: rawValue,
    canonicalId: `git:${uri.authority.toLowerCase()}/${normalizedPath.slice(1).toLowerCase()}`,
    cacheSegments: [sanitizedAuthority, ...pathSegments],
    kind: "gitUri"
  };
}
__name(parseUriMarketplaceReference, "parseUriMarketplaceReference");
function parseScpMarketplaceReference(rawValue) {
  const match = /^([^@\s]+)@([^:\s]+):(.+\.git)$/i.exec(rawValue);
  if (!match) {
    return void 0;
  }
  const authority = match[2];
  const pathWithGit = match[3].replace(/^\/+/, "");
  if (!pathWithGit.toLowerCase().endsWith(".git")) {
    return void 0;
  }
  const pathSegments = pathWithGit.slice(0, -4).split("/").map(sanitizePathSegment);
  return {
    rawValue,
    displayLabel: rawValue,
    cloneUrl: rawValue,
    canonicalId: `git:${authority.toLowerCase()}/${pathWithGit.toLowerCase()}`,
    cacheSegments: [sanitizePathSegment(authority.toLowerCase()), ...pathSegments],
    kind: "gitUri"
  };
}
__name(parseScpMarketplaceReference, "parseScpMarketplaceReference");
function normalizeGitRepoPath(path) {
  const trimmed = path.replace(/\/+/g, "/").replace(/\/+$/g, "");
  if (!trimmed.toLowerCase().endsWith(".git")) {
    return void 0;
  }
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const pathWithoutGit = withLeadingSlash.slice(1, -4);
  if (!pathWithoutGit || !pathWithoutGit.includes("/")) {
    return void 0;
  }
  return withLeadingSlash;
}
__name(normalizeGitRepoPath, "normalizeGitRepoPath");
function getGitHubCanonicalId(owner, repo) {
  return `github:${owner.toLowerCase()}/${repo.toLowerCase()}`;
}
__name(getGitHubCanonicalId, "getGitHubCanonicalId");
function sanitizePathSegment(value) {
  return value.replace(/[\\/:*?"<>|]/g, "_");
}
__name(sanitizePathSegment, "sanitizePathSegment");
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
  parseMarketplaceReference,
  parseMarketplaceReferences
};
//# sourceMappingURL=pluginMarketplaceService.js.map
