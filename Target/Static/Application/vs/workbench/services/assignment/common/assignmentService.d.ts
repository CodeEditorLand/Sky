import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IAssignmentService } from '../../../../platform/assignment/common/assignment.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
export interface IAssignmentFilter {
    exclude(assignment: string): boolean;
    onDidChange: Event<void>;
}
export declare const IWorkbenchAssignmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchAssignmentService>;
export interface IWorkbenchAssignmentService extends IAssignmentService {
    getCurrentExperiments(): Promise<string[] | undefined>;
    addTelemetryAssignmentFilter(filter: IAssignmentFilter): void;
}
export declare class WorkbenchAssignmentService extends Disposable implements IAssignmentService {
    private readonly telemetryService;
    private readonly configurationService;
    private readonly productService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly tasClient;
    private readonly tasSetupDisposables;
    private networkInitialized;
    private readonly overrideInitDelay;
    private readonly telemetry;
    private readonly keyValueStorage;
    private readonly experimentsEnabled;
    private readonly _onDidRefetchAssignments;
    readonly onDidRefetchAssignments: Event<void>;
    constructor(telemetryService: ITelemetryService, storageService: IStorageService, configurationService: IConfigurationService, productService: IProductService, environmentService: IWorkbenchEnvironmentService, instantiationService: IInstantiationService);
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
    private doGetTreatment;
    private setupTASClient;
    private refetchAssignments;
    getCurrentExperiments(): Promise<string[] | undefined>;
    addTelemetryAssignmentFilter(filter: IAssignmentFilter): void;
}
