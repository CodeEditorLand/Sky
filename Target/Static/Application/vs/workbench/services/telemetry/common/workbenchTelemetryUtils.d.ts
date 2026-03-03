import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
/**
 * Determines if experiment properties will be set on telemetry events.
 * When true, TelemetryService should buffer events until setExperimentProperty is called.
 */
export declare function experimentsEnabled(configurationService: IConfigurationService, productService: IProductService, environmentService: IWorkbenchEnvironmentService): boolean;
