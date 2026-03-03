/**
 * @module Effect/NetworkRestrictions/Error/IPCBlockError
 * @description
 * Error thrown when an IPC channel is blocked by the NetworkRestrictions service.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Usage context
 * @see [Error Handling Guide](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
/**
 * Error thrown when an IPC channel is blocked
 */
export interface IPCBlockError {
    readonly _tag: "IPCBlockError";
    readonly channel: string;
    readonly reason: string;
    readonly message: string;
    readonly name: string;
    readonly cause: string;
}
/**
 * Creates an IPCBlockError instance
 * @param channel - The blocked IPC channel
 * @param reason - The reason for blocking
 * @returns An IPCBlockError instance
 */
declare const CreateIPCBlockError: (channel: string, reason: string) => IPCBlockError;
export default CreateIPCBlockError;
//# sourceMappingURL=IPCBlockError.d.ts.map