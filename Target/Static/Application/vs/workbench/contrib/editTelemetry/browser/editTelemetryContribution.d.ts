import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export declare class EditTelemetryContribution extends Disposable {
    private readonly _instantiationService;
    private readonly _configurationService;
    private readonly _telemetryService;
    constructor(_instantiationService: IInstantiationService, _configurationService: IConfigurationService, _telemetryService: ITelemetryService);
}
