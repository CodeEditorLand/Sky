export declare const IRandomService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRandomService>;
export interface IRandomService {
    readonly _serviceBrand: undefined;
    generateUuid(): string;
    generatePrefixedUuid(prefix: string): string;
}
export declare class RandomService implements IRandomService {
    readonly _serviceBrand: undefined;
    generateUuid(): string;
    /** Namespace should be 3 letter. */
    generatePrefixedUuid(namespace: string): string;
}
