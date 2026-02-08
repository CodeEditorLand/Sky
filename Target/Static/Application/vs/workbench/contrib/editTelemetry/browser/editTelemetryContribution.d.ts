import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';
export declare class EditTelemetryContribution extends Disposable {
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService, telemetryService: ITelemetryService, chatEntitlementService: IChatEntitlementService);
}
