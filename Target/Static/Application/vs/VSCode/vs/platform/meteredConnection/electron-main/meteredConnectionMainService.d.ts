import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AbstractMeteredConnectionService } from '../common/meteredConnection.js';
/**
 * Electron-main implementation of the metered connection service.
 * This implementation receives metered connection updates via IPC channel from the renderer process.
 */
export declare class MeteredConnectionMainService extends AbstractMeteredConnectionService {
    private telemetryService;
    constructor(configurationService: IConfigurationService);
    setTelemetryService(telemetryService: ITelemetryService): void;
    protected onChangeBrowserConnection(): void;
}
