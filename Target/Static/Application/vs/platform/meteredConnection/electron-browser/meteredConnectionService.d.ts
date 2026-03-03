import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IMainProcessService } from '../../ipc/common/mainProcessService.js';
import { AbstractMeteredConnectionService } from '../common/meteredConnection.js';
/**
 * Electron-browser implementation of the metered connection service.
 * This implementation monitors navigator.connection and reports changes to the main process via IPC channel.
 */
export declare class NativeMeteredConnectionService extends AbstractMeteredConnectionService {
    private readonly _channel;
    constructor(configurationService: IConfigurationService, mainProcessService: IMainProcessService);
    /**
     * Notify the main process about changes to the navigator connection state.
     */
    protected onChangeBrowserConnection(): void;
}
