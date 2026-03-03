import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export interface IUserDataInitializer {
    requiresInitialization(): Promise<boolean>;
    whenInitializationFinished(): Promise<void>;
    initializeRequiredResources(): Promise<void>;
    initializeInstalledExtensions(instantiationService: IInstantiationService): Promise<void>;
    initializeOtherResources(instantiationService: IInstantiationService): Promise<void>;
}
export declare const IUserDataInitializationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserDataInitializationService>;
export interface IUserDataInitializationService extends IUserDataInitializer {
    _serviceBrand: undefined;
}
export declare class UserDataInitializationService implements IUserDataInitializationService {
    private readonly initializers;
    _serviceBrand: undefined;
    constructor(initializers?: IUserDataInitializer[]);
    whenInitializationFinished(): Promise<void>;
    requiresInitialization(): Promise<boolean>;
    initializeRequiredResources(): Promise<void>;
    initializeOtherResources(instantiationService: IInstantiationService): Promise<void>;
    initializeInstalledExtensions(instantiationService: IInstantiationService): Promise<void>;
}
