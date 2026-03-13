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
import { parse as parseJSONC } from "../../../../../base/common/json.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, derived, observableFromEvent, observableValue } from "../../../../../base/common/observable.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { CLAUDE_CONFIG_FOLDER } from "../promptSyntax/config/promptFileLocations.js";
import { parseMarketplaceReference } from "./marketplaceReference.js";
const SETTINGS_FILENAME = "settings.json";
const SETTINGS_LOCAL_FILENAME = "settings.local.json";
const COPILOT_CONFIG_FOLDER = ".github/copilot";
const IWorkspacePluginSettingsService = createDecorator("workspacePluginSettingsService");
function marketplaceEntryToReference(entry) {
  let sourceType;
  let repo;
  let url;
  if (typeof entry.source === "object" && entry.source !== null) {
    const nested = entry.source;
    sourceType = nested.source;
    repo = nested.repo;
    url = nested.url;
  } else {
    sourceType = entry.source;
    repo = entry.repo;
    url = entry.url;
  }
  if (sourceType === "github" && typeof repo === "string") {
    return parseMarketplaceReference(repo);
  }
  if (sourceType === "git" && typeof url === "string") {
    return parseMarketplaceReference(url);
  }
  return void 0;
}
__name(marketplaceEntryToReference, "marketplaceEntryToReference");
function parseEnabledPlugins(json) {
  const result = /* @__PURE__ */ new Map();
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return result;
  }
  const obj = json;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "boolean") {
      result.set(key, value);
    }
  }
  return result;
}
__name(parseEnabledPlugins, "parseEnabledPlugins");
function parseExtraMarketplaces(json, logPrefix, logService) {
  const entries = [];
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return entries;
  }
  const obj = json;
  for (const [name, value] of Object.entries(obj)) {
    if (!value || typeof value !== "object") {
      logService.debug(`${logPrefix} Ignoring non-object extraKnownMarketplaces entry: ${name}`);
      continue;
    }
    const reference = marketplaceEntryToReference(value);
    if (!reference) {
      logService.debug(`${logPrefix} Could not parse marketplace reference for: ${name}`);
      continue;
    }
    entries.push({ name, reference: { ...reference, displayLabel: name } });
  }
  return entries;
}
__name(parseExtraMarketplaces, "parseExtraMarketplaces");
const EMPTY_DATA = { marketplaces: [], enabledPlugins: /* @__PURE__ */ new Map() };
class WorkspaceSettingsReader extends Disposable {
  static {
    __name(this, "WorkspaceSettingsReader");
  }
  constructor(configFolder, logPrefix, fileService, workspaceContextService, _logService) {
    super();
    this._logService = _logService;
    this._data = observableValue("data", EMPTY_DATA);
    this.data = this._data;
    const settingsDirs = observableFromEvent(this, workspaceContextService.onDidChangeWorkspaceFolders, () => workspaceContextService.getWorkspace().folders.map((f) => joinPath(f.uri, configFolder)));
    const watcherStore = this._register(new DisposableStore());
    this._register(autorun((reader) => {
      const dirs = settingsDirs.read(reader);
      watcherStore.clear();
      const scheduler = new RunOnceScheduler(() => this._readSettings(dirs, logPrefix, fileService), 100);
      watcherStore.add(scheduler);
      for (const dir of dirs) {
        const watcher = fileService.createWatcher(dir, { recursive: false, excludes: [] });
        watcherStore.add(watcher);
        watcherStore.add(watcher.onDidChange((e) => {
          if (e.affects(joinPath(dir, SETTINGS_FILENAME)) || e.affects(joinPath(dir, SETTINGS_LOCAL_FILENAME))) {
            scheduler.schedule();
          }
        }));
      }
      this._readSettings(dirs, logPrefix, fileService);
    }));
  }
  async _readSettings(dirs, logPrefix, fileService) {
    const allMarketplaces = [];
    const mergedEnabled = /* @__PURE__ */ new Map();
    for (const dir of dirs) {
      const sharedUri = joinPath(dir, SETTINGS_FILENAME);
      const localUri = joinPath(dir, SETTINGS_LOCAL_FILENAME);
      for (const uri of [sharedUri, localUri]) {
        try {
          const content = await fileService.readFile(uri);
          const json = parseJSONC(content.value.toString());
          if (!json || typeof json !== "object") {
            continue;
          }
          const root = json;
          const marketplaces = parseExtraMarketplaces(root.extraKnownMarketplaces, logPrefix, this._logService);
          for (const entry of marketplaces) {
            if (!allMarketplaces.some((e) => e.reference.canonicalId === entry.reference.canonicalId)) {
              allMarketplaces.push(entry);
            }
          }
          const enabled = parseEnabledPlugins(root.enabledPlugins);
          for (const [key, value] of enabled) {
            mergedEnabled.set(key, value);
          }
        } catch {
          this._logService.debug(`${logPrefix} Could not read ${uri.toString()}`);
        }
      }
    }
    this._data.set({ marketplaces: allMarketplaces, enabledPlugins: mergedEnabled }, void 0);
  }
}
let WorkspacePluginSettingsService = class WorkspacePluginSettingsService2 extends Disposable {
  static {
    __name(this, "WorkspacePluginSettingsService");
  }
  constructor(fileService, workspaceContextService, logService) {
    super();
    const claudeReader = this._register(new WorkspaceSettingsReader(CLAUDE_CONFIG_FOLDER, "[ClaudePluginSettings]", fileService, workspaceContextService, logService));
    const copilotReader = this._register(new WorkspaceSettingsReader(COPILOT_CONFIG_FOLDER, "[CopilotPluginSettings]", fileService, workspaceContextService, logService));
    this.extraMarketplaces = derived((reader) => {
      const claude = claudeReader.data.read(reader).marketplaces;
      const copilot = copilotReader.data.read(reader).marketplaces;
      const byCanonicalId = /* @__PURE__ */ new Map();
      for (const entry of [...claude, ...copilot]) {
        if (!byCanonicalId.has(entry.reference.canonicalId)) {
          byCanonicalId.set(entry.reference.canonicalId, entry);
        }
      }
      return [...byCanonicalId.values()];
    });
    this.enabledPlugins = derived((reader) => {
      const claude = claudeReader.data.read(reader).enabledPlugins;
      const copilot = copilotReader.data.read(reader).enabledPlugins;
      const merged = /* @__PURE__ */ new Map();
      for (const [key, value] of claude) {
        merged.set(key, value);
      }
      for (const [key, value] of copilot) {
        if (!merged.has(key)) {
          merged.set(key, value);
        }
      }
      return merged;
    });
  }
};
WorkspacePluginSettingsService = __decorate([
  __param(0, IFileService),
  __param(1, IWorkspaceContextService),
  __param(2, ILogService)
], WorkspacePluginSettingsService);
export {
  IWorkspacePluginSettingsService,
  WorkspacePluginSettingsService
};
//# sourceMappingURL=workspacePluginSettingsService.js.map
