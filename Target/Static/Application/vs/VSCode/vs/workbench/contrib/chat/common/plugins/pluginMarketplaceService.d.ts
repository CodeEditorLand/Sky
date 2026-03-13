import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IAgentPluginRepositoryService } from './agentPluginRepositoryService.js';
import { IWorkspacePluginSettingsService } from './workspacePluginSettingsService.js';
import { IWorkspaceTrustManagementService } from '../../../../../platform/workspace/common/workspaceTrust.js';
import { type IMarketplaceReference } from './marketplaceReference.js';
export { deduplicateMarketplaceReferences, MarketplaceReferenceKind, parseMarketplaceReference, parseMarketplaceReferences } from './marketplaceReference.js';
export type { IMarketplaceReference } from './marketplaceReference.js';
export declare const enum MarketplaceType {
    Copilot = "copilot",
    Claude = "claude",
    OpenPlugin = "openPlugin"
}
export declare const enum PluginSourceKind {
    RelativePath = "relativePath",
    GitHub = "github",
    GitUrl = "url",
    Npm = "npm",
    Pip = "pip"
}
export interface IRelativePathPluginSource {
    readonly kind: PluginSourceKind.RelativePath;
    /** Resolved relative path within the marketplace repository. */
    readonly path: string;
}
export interface IGitHubPluginSource {
    readonly kind: PluginSourceKind.GitHub;
    readonly repo: string;
    readonly ref?: string;
    readonly sha?: string;
}
export interface IGitUrlPluginSource {
    readonly kind: PluginSourceKind.GitUrl;
    /** Full git repository URL (must end with .git). */
    readonly url: string;
    readonly ref?: string;
    readonly sha?: string;
}
export interface INpmPluginSource {
    readonly kind: PluginSourceKind.Npm;
    readonly package: string;
    readonly version?: string;
    readonly registry?: string;
}
export interface IPipPluginSource {
    readonly kind: PluginSourceKind.Pip;
    readonly package: string;
    readonly version?: string;
    readonly registry?: string;
}
export type IPluginSourceDescriptor = IRelativePathPluginSource | IGitHubPluginSource | IGitUrlPluginSource | INpmPluginSource | IPipPluginSource;
export interface IMarketplacePlugin {
    readonly name: string;
    readonly description: string;
    readonly version: string;
    /** Subdirectory within the repository where the plugin lives (for relative-path sources). */
    readonly source: string;
    /** Structured source descriptor indicating how the plugin should be fetched/installed. */
    readonly sourceDescriptor: IPluginSourceDescriptor;
    /** Marketplace label shown in UI and plugin provenance. */
    readonly marketplace: string;
    /** Canonical reference for clone/update/install location resolution. */
    readonly marketplaceReference: IMarketplaceReference;
    /** The type of marketplace this plugin comes from. */
    readonly marketplaceType: MarketplaceType;
    readonly readmeUri?: URI;
}
/** Raw JSON shape of a remote plugin source object in marketplace.json. */
interface IJsonPluginSource {
    readonly source: string;
    readonly repo?: string;
    readonly url?: string;
    readonly package?: string;
    readonly ref?: string;
    readonly sha?: string;
    readonly version?: string;
    readonly registry?: string;
}
export interface IMarketplaceInstalledPlugin {
    readonly pluginUri: URI;
    readonly plugin: IMarketplacePlugin;
    readonly enabled: boolean;
}
export declare const IPluginMarketplaceService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPluginMarketplaceService>;
export interface IPluginMarketplaceService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeMarketplaces: Event<void>;
    /** Installed marketplace plugins, backed by storage. */
    readonly installedPlugins: IObservable<readonly IMarketplaceInstalledPlugin[]>;
    /**
     * Observable that is `true` when at least one cloned marketplace
     * repository has upstream changes available. Checked periodically
     * (approximately once per day) when `extensions.autoUpdate` is enabled.
     */
    readonly hasUpdatesAvailable: IObservable<boolean>;
    /**
     * Observable snapshot of the last {@link fetchMarketplacePlugins} result.
     * Empty until the first fetch completes. Views should use this for
     * synchronous outdated-detection instead of calling fetchMarketplacePlugins.
     */
    readonly lastFetchedPlugins: IObservable<readonly IMarketplacePlugin[]>;
    /**
     * Set of recommended plugin keys (`"pluginName@marketplaceName"`) aggregated
     * from workspace-defined settings (e.g. `.claude/settings.json`). Providers
     * may be added over time; consumers should not assume a specific source.
     */
    readonly recommendedPlugins: IObservable<ReadonlySet<string>>;
    /** Resets {@link hasUpdatesAvailable} to `false`. */
    clearUpdatesAvailable(): void;
    fetchMarketplacePlugins(token: CancellationToken): Promise<IMarketplacePlugin[]>;
    getMarketplacePluginMetadata(pluginUri: URI): IMarketplacePlugin | undefined;
    addInstalledPlugin(pluginUri: URI, plugin: IMarketplacePlugin): void;
    removeInstalledPlugin(pluginUri: URI): void;
    setInstalledPluginEnabled(pluginUri: URI, enabled: boolean): void;
    /** Returns whether the given marketplace has been explicitly trusted by the user. */
    isMarketplaceTrusted(ref: IMarketplaceReference): boolean;
    /** Records that the user trusts the given marketplace, persisted permanently. */
    trustMarketplace(ref: IMarketplaceReference): void;
    /**
     * Reads marketplace definition files from an already-cloned repository
     * directory and returns the declared plugins. Used by direct-install flows
     * that clone a repo first, then need to discover its plugins.
     */
    readPluginsFromDirectory(repoDir: URI, reference: IMarketplaceReference): Promise<IMarketplacePlugin[]>;
}
export declare class PluginMarketplaceService extends Disposable implements IPluginMarketplaceService {
    private readonly _configurationService;
    private readonly _requestService;
    private readonly _fileService;
    private readonly _pluginRepositoryService;
    private readonly _logService;
    private readonly _storageService;
    private readonly _workspacePluginSettingsService;
    private readonly _workspaceTrustService;
    readonly _serviceBrand: undefined;
    private readonly _gitHubMarketplaceCache;
    private readonly _installedPluginsStore;
    private readonly _trustedMarketplacesStore;
    private readonly _lastFetchedPluginsStore;
    private readonly _hasUpdatesAvailable;
    private _updateCheckTimer;
    readonly onDidChangeMarketplaces: Event<void>;
    readonly installedPlugins: IObservable<readonly IMarketplaceInstalledPlugin[]>;
    readonly hasUpdatesAvailable: IObservable<boolean>;
    readonly lastFetchedPlugins: IObservable<readonly IMarketplacePlugin[]>;
    readonly recommendedPlugins: IObservable<ReadonlySet<string>>;
    constructor(_configurationService: IConfigurationService, _requestService: IRequestService, _fileService: IFileService, _pluginRepositoryService: IAgentPluginRepositoryService, _logService: ILogService, _storageService: IStorageService, _workspacePluginSettingsService: IWorkspacePluginSettingsService, _workspaceTrustService: IWorkspaceTrustManagementService);
    dispose(): void;
    clearUpdatesAvailable(): void;
    fetchMarketplacePlugins(token: CancellationToken): Promise<IMarketplacePlugin[]>;
    private _fetchFromGitHubRepo;
    private _getCachedGitHubMarketplacePlugins;
    private _loadPersistedGitHubMarketplaceCache;
    private _savePersistedGitHubMarketplaceCache;
    getMarketplacePluginMetadata(pluginUri: URI): IMarketplacePlugin | undefined;
    addInstalledPlugin(pluginUri: URI, plugin: IMarketplacePlugin): void;
    removeInstalledPlugin(pluginUri: URI): void;
    setInstalledPluginEnabled(pluginUri: URI, enabled: boolean): void;
    isMarketplaceTrusted(ref: IMarketplaceReference): boolean;
    trustMarketplace(ref: IMarketplaceReference): void;
    private _isAutoUpdateEnabled;
    /**
     * (Re-)schedules the next periodic update check. Called on
     * construction and whenever the auto-update config changes.
     */
    private _scheduleUpdateCheck;
    private _runUpdateCheck;
    private _fetchFromClonedRepo;
    readPluginsFromDirectory(repoDir: URI, reference: IMarketplaceReference): Promise<IMarketplacePlugin[]>;
    private _readPluginsFromDirectory;
}
/**
 * Parse a raw `source` field from marketplace.json into a structured
 * {@link IPluginSourceDescriptor}. Accepts either a relative-path string
 * or a JSON object with a `source` discriminant indicating the kind.
 */
export declare function parsePluginSource(rawSource: string | IJsonPluginSource | undefined, pluginRoot: string | undefined, logContext: {
    pluginName: string;
    logService: ILogService;
    logPrefix: string;
}): IPluginSourceDescriptor | undefined;
/**
 * Returns a human-readable label for a plugin source descriptor,
 * suitable for error messages and UI display.
 */
export declare function getPluginSourceLabel(descriptor: IPluginSourceDescriptor): string;
/**
 * Returns `true` when the marketplace source descriptor differs from the
 * installed one — meaning an update should be performed.
 */
export declare function hasSourceChanged(installed: IPluginSourceDescriptor, marketplace: IPluginSourceDescriptor): boolean;
