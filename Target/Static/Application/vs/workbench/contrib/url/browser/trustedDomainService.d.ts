import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Event } from '../../../../base/common/event.js';
export declare const ITrustedDomainService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITrustedDomainService>;
export interface ITrustedDomainService {
    _serviceBrand: undefined;
    readonly onDidChangeTrustedDomains: Event<void>;
    isValid(resource: URI): boolean;
    readonly trustedDomains: string[];
}
export declare class TrustedDomainService extends Disposable implements ITrustedDomainService {
    private readonly _instantiationService;
    private readonly _storageService;
    _serviceBrand: undefined;
    private _staticTrustedDomainsResult;
    private _onDidChangeTrustedDomains;
    readonly onDidChangeTrustedDomains: Event<void>;
    constructor(_instantiationService: IInstantiationService, _storageService: IStorageService);
    get trustedDomains(): string[];
    isValid(resource: URI): boolean;
}
