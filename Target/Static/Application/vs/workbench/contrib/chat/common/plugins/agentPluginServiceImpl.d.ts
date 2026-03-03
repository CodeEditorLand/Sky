import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IAgentPlugin, IAgentPluginDiscovery, IAgentPluginService } from './agentPluginService.js';
import { IPluginMarketplaceService } from './pluginMarketplaceService.js';
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
export declare function shellQuotePluginRootInCommand(command: string, fsPath: string, token?: string): string;
export declare class AgentPluginService extends Disposable implements IAgentPluginService {
    readonly _serviceBrand: undefined;
    readonly allPlugins: IObservable<readonly IAgentPlugin[]>;
    readonly plugins: IObservable<readonly IAgentPlugin[]>;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService);
    setPluginEnabled(pluginUri: URI, enabled: boolean): void;
    private _dedupeAndSort;
}
export declare class ConfiguredAgentPluginDiscovery extends Disposable implements IAgentPluginDiscovery {
    private readonly _configurationService;
    private readonly _fileService;
    private readonly _pluginMarketplaceService;
    private readonly _workspaceContextService;
    private readonly _pathService;
    private readonly _logService;
    private readonly _instantiationService;
    private readonly _pluginPathsConfig;
    private readonly _pluginEntries;
    private readonly _plugins;
    readonly plugins: IObservable<readonly IAgentPlugin[]>;
    private _discoverVersion;
    constructor(_configurationService: IConfigurationService, _fileService: IFileService, _pluginMarketplaceService: IPluginMarketplaceService, _workspaceContextService: IWorkspaceContextService, _pathService: IPathService, _logService: ILogService, _instantiationService: IInstantiationService);
    start(): void;
    private _refreshPlugins;
    private _discoverPlugins;
    /**
     * Resolves a plugin path to one or more resource URIs. Absolute paths are
     * used directly; relative paths are resolved against each workspace folder.
     */
    private _resolvePluginPath;
    /**
     * Updates the enabled state of a plugin path in the configuration,
     * writing to the most specific config target where the key is defined.
     */
    private _updatePluginPathEnabled;
    private _detectPluginFormatAdapter;
    private _pathExists;
    private _toPlugin;
    private _readMcpDefinitions;
    private _readInlinePluginJsonMcpDefinitions;
    private _parseMcpServerDefinitionMap;
    private _normalizeMcpServerConfiguration;
    private _readHooks;
    private _readJsonFile;
    private _readSkills;
    private _readAgents;
    private _readCommands;
    private _disposePluginEntriesExcept;
    dispose(): void;
}
