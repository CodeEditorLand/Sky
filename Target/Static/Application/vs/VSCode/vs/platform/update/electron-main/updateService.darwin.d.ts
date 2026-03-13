import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService, IRelaunchHandler, IRelaunchOptions } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AvailableForDownload } from '../common/update.js';
import { IMeteredConnectionService } from '../../meteredConnection/common/meteredConnection.js';
import { AbstractUpdateService, IUpdateURLOptions } from './abstractUpdateService.js';
export declare class DarwinUpdateService extends AbstractUpdateService implements IRelaunchHandler {
    private readonly telemetryService;
    private readonly disposables;
    private get onRawError();
    private get onRawCheckingForUpdate();
    private get onRawUpdateNotAvailable();
    private get onRawUpdateAvailable();
    private get onRawUpdateDownloaded();
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, telemetryService: ITelemetryService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, productService: IProductService, meteredConnectionService: IMeteredConnectionService);
    handleRelaunch(options?: IRelaunchOptions): boolean;
    protected initialize(): Promise<void>;
    private onCheckingForUpdate;
    private onError;
    protected buildUpdateFeedUrl(quality: string, commit: string, options?: IUpdateURLOptions): string | undefined;
    checkForUpdates(explicit: boolean): Promise<void>;
    protected doCheckForUpdates(explicit: boolean, pendingCommit?: string): void;
    /**
     * Manually check the update feed URL without triggering Electron's auto-download.
     * Used when connection is metered or in the embedded app.
     * @param canInstall When false, signals that the update cannot be installed from this app.
     */
    private checkForUpdateNoDownload;
    private onUpdateAvailable;
    private onUpdateDownloaded;
    private onUpdateNotAvailable;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    protected doQuitAndInstall(): void;
    dispose(): void;
}
