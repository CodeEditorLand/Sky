import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IAgentPluginRepositoryService } from './agentPluginRepositoryService.js';
export declare const enum MarketplaceType {
    Copilot = "copilot",
    Claude = "claude"
}
export declare const enum MarketplaceReferenceKind {
    GitHubShorthand = "githubShorthand",
    GitUri = "gitUri",
    LocalFileUri = "localFileUri"
}
export interface IMarketplaceReference {
    readonly rawValue: string;
    readonly displayLabel: string;
    readonly cloneUrl: string;
    readonly canonicalId: string;
    readonly cacheSegments: readonly string[];
    readonly kind: MarketplaceReferenceKind;
    readonly githubRepo?: string;
    readonly localRepositoryUri?: URI;
}
export interface IMarketplacePlugin {
    readonly name: string;
    readonly description: string;
    readonly version: string;
    /** Subdirectory within the repository where the plugin lives. */
    readonly source: string;
    /** Marketplace label shown in UI and plugin provenance. */
    readonly marketplace: string;
    /** Canonical reference for clone/update/install location resolution. */
    readonly marketplaceReference: IMarketplaceReference;
    /** The type of marketplace this plugin comes from. */
    readonly marketplaceType: MarketplaceType;
    readonly readmeUri?: URI;
}
export declare const IPluginMarketplaceService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPluginMarketplaceService>;
export interface IPluginMarketplaceService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeMarketplaces: Event<void>;
    fetchMarketplacePlugins(token: CancellationToken): Promise<IMarketplacePlugin[]>;
    getMarketplacePluginMetadata(pluginUri: URI): Promise<IMarketplacePlugin | undefined>;
}
export declare class PluginMarketplaceService implements IPluginMarketplaceService {
    private readonly _configurationService;
    private readonly _requestService;
    private readonly _fileService;
    private readonly _pluginRepositoryService;
    private readonly _logService;
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    private readonly _gitHubMarketplaceCache;
    readonly onDidChangeMarketplaces: Event<void>;
    constructor(_configurationService: IConfigurationService, _requestService: IRequestService, _fileService: IFileService, _pluginRepositoryService: IAgentPluginRepositoryService, _logService: ILogService, _storageService: IStorageService);
    fetchMarketplacePlugins(token: CancellationToken): Promise<IMarketplacePlugin[]>;
    private _fetchFromGitHubRepo;
    private _getCachedGitHubMarketplacePlugins;
    private _loadPersistedGitHubMarketplaceCache;
    private _savePersistedGitHubMarketplaceCache;
    getMarketplacePluginMetadata(pluginUri: URI): Promise<IMarketplacePlugin | undefined>;
    private _fetchFromClonedRepo;
}
export declare function parseMarketplaceReferences(values: readonly unknown[]): IMarketplaceReference[];
export declare function parseMarketplaceReference(value: string): IMarketplaceReference | undefined;
