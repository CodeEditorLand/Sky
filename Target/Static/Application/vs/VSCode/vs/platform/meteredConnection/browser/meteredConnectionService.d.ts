import { IConfigurationService } from '../../configuration/common/configuration.js';
import { AbstractMeteredConnectionService } from '../common/meteredConnection.js';
/**
 * Browser implementation of the metered connection service.
 * This implementation monitors navigator.connection for changes.
 */
export declare class MeteredConnectionService extends AbstractMeteredConnectionService {
    constructor(configurationService: IConfigurationService);
}
