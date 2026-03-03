/**
 * @module Effect/NetworkRestrictions/Error/NetworkBlockError
 * @description
 * Error thrown when a network URL request is blocked by the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Usage context
 * @see [Error Handling Guide](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
/**
 * Error thrown when a network request is blocked
 */
export interface NetworkBlockError {
    readonly _tag: "NetworkBlockError";
    readonly url: string;
    readonly reason: string;
    readonly message: string;
    readonly name: string;
    readonly cause: string;
}
/**
 * Creates a NetworkBlockError instance
 * @param url - The blocked URL
 * @param reason - The reason for blocking
 * @returns A NetworkBlockError instance
 */
declare const CreateNetworkBlockError: (url: string, reason: string) => NetworkBlockError;
export default CreateNetworkBlockError;
//# sourceMappingURL=NetworkBlockError.d.ts.map