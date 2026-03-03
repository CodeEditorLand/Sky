import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IMeteredConnectionService } from '../../meteredConnection/common/meteredConnection.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { AvailableForDownload, IUpdateService, State, UpdateType } from '../common/update.js';
export interface IUpdateURLOptions {
    readonly background?: boolean;
    readonly internalOrg?: string;
}
export declare function createUpdateURL(baseUpdateUrl: string, platform: string, quality: string, commit: string, options?: IUpdateURLOptions): string;
/**
 * Builds common headers for update requests, including those issued
 * via Electron's auto-updater (e.g. setFeedURL({ url, headers })) and
 * manual HTTP requests that bypass the auto-updater. The headers include
 * OS version information which the update server uses for EOL detection.
 *
 * On macOS, the User-Agent includes the Darwin kernel version.
 * On Windows, the User-Agent includes accurate Windows version from the registry.
 */
export declare function getUpdateRequestHeaders(productVersion: string): Record<string, string> | undefined;
export type UpdateErrorClassification = {
    owner: 'joaomoreno';
    messageHash: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The hash of the error message.';
    };
    comment: 'This is used to know how often VS Code updates have failed.';
};
export declare abstract class AbstractUpdateService implements IUpdateService {
    protected readonly lifecycleMainService: ILifecycleMainService;
    protected configurationService: IConfigurationService;
    protected environmentMainService: IEnvironmentMainService;
    protected requestService: IRequestService;
    protected logService: ILogService;
    protected readonly productService: IProductService;
    protected readonly meteredConnectionService: IMeteredConnectionService;
    protected readonly supportsUpdateOverwrite: boolean;
    readonly _serviceBrand: undefined;
    protected quality: string | undefined;
    private _state;
    protected _overwrite: boolean;
    private _hasCheckedForOverwriteOnQuit;
    private readonly overwriteUpdatesCheckInterval;
    private _internalOrg;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    get state(): State;
    protected setState(state: State): void;
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, productService: IProductService, meteredConnectionService: IMeteredConnectionService, supportsUpdateOverwrite: boolean);
    /**
     * This must be called before any other call. This is a performance
     * optimization, to avoid using extra CPU cycles before first window open.
     * https://github.com/microsoft/vscode/issues/89784
     */
    protected initialize(): Promise<void>;
    private getProductQuality;
    private scheduleCheckForUpdates;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(explicit: boolean): Promise<void>;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    applyUpdate(): Promise<void>;
    protected doApplyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    private checkForOverwriteUpdates;
    isLatestVersion(commit?: string, token?: CancellationToken): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    setInternalOrg(internalOrg: string | undefined): Promise<void>;
    protected getInternalOrg(): string | undefined;
    protected getUpdateType(): UpdateType;
    protected doQuitAndInstall(): void;
    protected postInitialize(): Promise<void>;
    protected cancelPendingUpdate(): Promise<void>;
    protected abstract buildUpdateFeedUrl(quality: string, commit: string, options?: IUpdateURLOptions): string | undefined;
    protected abstract doCheckForUpdates(explicit: boolean, pendingCommit?: string): void;
}
