import { URI } from '../../../../base/common/uri.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IAgentPluginRepositoryService, IEnsureRepositoryOptions, IPullRepositoryOptions } from '../common/plugins/agentPluginRepositoryService.js';
import { IMarketplacePlugin, IMarketplaceReference, IPluginSourceDescriptor, MarketplaceType, PluginSourceKind } from '../common/plugins/pluginMarketplaceService.js';
import { IPluginSource } from '../common/plugins/pluginSource.js';
export declare class AgentPluginRepositoryService implements IAgentPluginRepositoryService {
    private readonly _commandService;
    private readonly _fileService;
    private readonly _logService;
    private readonly _notificationService;
    private readonly _progressService;
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    private readonly _cacheRoot;
    private readonly _marketplaceIndex;
    private readonly _pluginSources;
    constructor(_commandService: ICommandService, environmentService: IEnvironmentService, _fileService: IFileService, instantiationService: IInstantiationService, _logService: ILogService, _notificationService: INotificationService, _progressService: IProgressService, _storageService: IStorageService);
    getPluginSource(kind: PluginSourceKind): IPluginSource;
    getRepositoryUri(marketplace: IMarketplaceReference, marketplaceType?: MarketplaceType): URI;
    getPluginInstallUri(plugin: IMarketplacePlugin): URI;
    ensureRepository(marketplace: IMarketplaceReference, options?: IEnsureRepositoryOptions): Promise<URI>;
    pullRepository(marketplace: IMarketplaceReference, options?: IPullRepositoryOptions): Promise<boolean>;
    private _getRepoCacheDirForReference;
    private _loadMarketplaceIndex;
    private _updateMarketplaceIndex;
    private _saveMarketplaceIndex;
    private _cloneRepository;
    private _getPluginDir;
    getPluginSourceInstallUri(sourceDescriptor: IPluginSourceDescriptor): URI;
    ensurePluginSource(plugin: IMarketplacePlugin, options?: IEnsureRepositoryOptions): Promise<URI>;
    updatePluginSource(plugin: IMarketplacePlugin, options?: IPullRepositoryOptions): Promise<boolean>;
    fetchRepository(marketplace: IMarketplaceReference): Promise<boolean>;
    cleanupPluginSource(plugin: IMarketplacePlugin): Promise<void>;
    /**
     * Walk from {@link child}'s parent toward {@link _cacheRoot}, removing
     * each directory that is empty. Stops as soon as a non-empty directory
     * is found or the cache root is reached. Only operates on descendants
     * of the cache root — returns immediately for paths outside it.
     */
    private _pruneEmptyParents;
}
