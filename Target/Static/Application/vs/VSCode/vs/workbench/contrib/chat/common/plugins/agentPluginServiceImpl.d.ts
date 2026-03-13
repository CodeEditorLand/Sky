import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IEnablementModel } from '../enablement.js';
import { IAgentPluginRepositoryService } from './agentPluginRepositoryService.js';
import { IAgentPlugin, IAgentPluginDiscovery, IAgentPluginService } from './agentPluginService.js';
import { IMarketplacePlugin, IPluginMarketplaceService } from './pluginMarketplaceService.js';
/**
 * Replaces `${CLAUDE_PLUGIN_ROOT}` in a shell command string with the
 * given fsPath. If the path contains characters that would break shell
 * parsing (e.g. spaces), occurrences are wrapped in double-quotes.
 *
 * The token may be followed by additional path segments like
 * `${CLAUDE_PLUGIN_ROOT}/scripts/run.sh`; the entire resulting path
 * (including suffix) is quoted as one unit.
 *
 */
export declare function shellQuotePluginRootInCommand(command: string, fsPath: string, token: string): string;
export declare class AgentPluginService extends Disposable implements IAgentPluginService {
    readonly _serviceBrand: undefined;
    readonly plugins: IObservable<readonly IAgentPlugin[]>;
    readonly enablementModel: IEnablementModel;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService, storageService: IStorageService);
    private _dedupeAndSort;
}
/**
 * Describes a single discovered plugin source, before the shared
 * infrastructure builds the full {@link IAgentPlugin} from it.
 */
interface IPluginSource {
    readonly uri: URI;
    readonly fromMarketplace: IMarketplacePlugin | undefined;
    /** Called when remove is invoked on the plugin */
    remove(): void;
}
/**
 * Shared base class for plugin discovery implementations. Contains the common
 * logic for reading plugin contents (commands, skills, agents, hooks, MCP server
 * definitions) from the filesystem and watching for live updates.
 *
 * Subclasses implement {@link _discoverPluginSources} to determine *which*
 * plugins exist, while this class handles the rest.
 */
export declare abstract class AbstractAgentPluginDiscovery extends Disposable implements IAgentPluginDiscovery {
    protected readonly _fileService: IFileService;
    protected readonly _pathService: IPathService;
    protected readonly _logService: ILogService;
    protected readonly _instantiationService: IInstantiationService;
    private readonly _pluginEntries;
    private readonly _plugins;
    readonly plugins: IObservable<readonly IAgentPlugin[]>;
    private _discoverVersion;
    protected _enablementModel: IEnablementModel;
    constructor(_fileService: IFileService, _pathService: IPathService, _logService: ILogService, _instantiationService: IInstantiationService);
    abstract start(enablementModel: IEnablementModel): void;
    protected _refreshPlugins(): Promise<void>;
    /** Subclasses return plugin sources to discover. */
    protected abstract _discoverPluginSources(): Promise<readonly IPluginSource[]>;
    private _discoverAndBuildPlugins;
    private _detectPluginFormatAdapter;
    protected _pathExists(resource: URI): Promise<boolean>;
    private _toPlugin;
    private _readManifest;
    /**
     * Reads hook definitions from a list of resolved paths (JSON files).
     * Each path is tried in order; the first one that contains valid hook
     * JSON is used.
     */
    private _readHooksFromPaths;
    /**
     * Reads MCP server definitions from a list of resolved paths (JSON files).
     * Definitions from all files are merged; the first definition for a given
     * server name wins.
     */
    private _readMcpDefinitionsFromPaths;
    private _parseMcpServerDefinitionMap;
    private _normalizeMcpServerConfiguration;
    private _readJsonFile;
    private _readSkills;
    /**
     * Scans directories for rule/instruction files (`.mdc`, `.md`,
     * `.instructions.md`), returning `{ uri, name }` entries where name is
     * derived from the filename minus the matched suffix.
     */
    private _readRules;
    /**
     * Scans directories for `.md` files, returning `{ uri, name }` entries
     * where name is derived from the filename (minus the `.md` extension).
     * If a path points to a specific `.md` file, it is included directly.
     * Used for both commands and agents.
     */
    private _readMarkdownComponents;
    private _disposePluginEntriesExcept;
    dispose(): void;
}
export declare class ConfiguredAgentPluginDiscovery extends AbstractAgentPluginDiscovery {
    private readonly _configurationService;
    private readonly _pluginMarketplaceService;
    private readonly _workspaceContextService;
    private readonly _pluginLocationsConfig;
    constructor(_configurationService: IConfigurationService, fileService: IFileService, _pluginMarketplaceService: IPluginMarketplaceService, _workspaceContextService: IWorkspaceContextService, pathService: IPathService, logService: ILogService, instantiationService: IInstantiationService);
    start(enablementModel: IEnablementModel): void;
    protected _discoverPluginSources(): Promise<readonly IPluginSource[]>;
    private _getUserHome;
    /**
     * Resolves a plugin path to one or more resource URIs. Supports:
     * - Absolute paths (used directly)
     * - Tilde paths (expanded to user home directory)
     * - Relative paths (resolved against each workspace folder)
     */
    private _resolvePluginPath;
    /**
     * Removes a plugin path from `chat.pluginLocations` in the most specific
     * config target where the key is defined.
     */
    private _removePluginPath;
}
export declare class MarketplaceAgentPluginDiscovery extends AbstractAgentPluginDiscovery {
    private readonly _pluginMarketplaceService;
    private readonly _pluginRepositoryService;
    constructor(_pluginMarketplaceService: IPluginMarketplaceService, _pluginRepositoryService: IAgentPluginRepositoryService, fileService: IFileService, pathService: IPathService, logService: ILogService, instantiationService: IInstantiationService);
    start(enablementModel: IEnablementModel): void;
    protected _discoverPluginSources(): Promise<readonly IPluginSource[]>;
}
export {};
