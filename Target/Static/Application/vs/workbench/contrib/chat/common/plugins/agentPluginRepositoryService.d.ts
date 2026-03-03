import { URI } from '../../../../../base/common/uri.js';
import { IMarketplacePlugin, IMarketplaceReference, MarketplaceType } from './pluginMarketplaceService.js';
export declare const IAgentPluginRepositoryService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentPluginRepositoryService>;
/**
 * Options for ensuring a marketplace repository is available locally.
 */
export interface IEnsureRepositoryOptions {
    /** Optional progress notification title shown during clone. */
    readonly progressTitle?: string;
    /** Label used in clone failure messaging. */
    readonly failureLabel?: string;
    /** Marketplace type metadata to persist in the marketplace index. */
    readonly marketplaceType?: MarketplaceType;
}
/**
 * Options for pulling the latest changes from a cloned marketplace repository.
 */
export interface IPullRepositoryOptions {
    /** Optional plugin name used in progress messaging. */
    readonly pluginName?: string;
    /** Label used in pull failure messaging. */
    readonly failureLabel?: string;
    /** Marketplace type metadata for repository index updates. */
    readonly marketplaceType?: MarketplaceType;
}
/**
 * Manages cloning, cache location resolution, and update operations for
 * agent plugin marketplace repositories.
 */
export interface IAgentPluginRepositoryService {
    readonly _serviceBrand: undefined;
    /**
     * Returns the local cache URI for a marketplace repository reference.
     * Uses a storage-backed marketplace index when available.
     */
    getRepositoryUri(marketplace: IMarketplaceReference, marketplaceType?: MarketplaceType): URI;
    /**
     * Returns the local install URI for a plugin source directory inside its
     * marketplace repository cache.
     */
    getPluginInstallUri(plugin: IMarketplacePlugin): URI;
    /**
     * Ensures a marketplace repository is cloned locally and returns its cache URI.
     */
    ensureRepository(marketplace: IMarketplaceReference, options?: IEnsureRepositoryOptions): Promise<URI>;
    /**
     * Pulls latest changes for a cloned marketplace repository.
     */
    pullRepository(marketplace: IMarketplaceReference, options?: IPullRepositoryOptions): Promise<void>;
}
