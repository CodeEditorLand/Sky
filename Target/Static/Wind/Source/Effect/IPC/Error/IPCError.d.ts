/**
 * @module Effect/IPC/Error/IPCError
 * @description
 * Error types for IPC operations. Includes InvokeError, SendError, and SubscriptionError.
 * @see {@link Effect/IPC/Implementation/IPCImplementation} Usage context
 * @category Error
 */
/**
 * Error thrown when IPC invoke fails
 */
export interface IPCInvokeError {
    readonly _tag: "IPCInvokeError";
    readonly channel: string;
    readonly cause: unknown;
    readonly message: string;
    readonly name: string;
}
/**
 * Error thrown when IPC send fails
 */
export interface IPCSendError {
    readonly _tag: "IPCSendError";
    readonly channel: string;
    readonly cause: unknown;
    readonly message: string;
    readonly name: string;
}
/**
 * Error thrown when IPC subscription fails
 */
export interface IPCSubscriptionError {
    readonly _tag: "IPCSubscriptionError";
    readonly channel: string;
    readonly cause: unknown;
    readonly message: string;
    readonly name: string;
}
/**
 * Creates an IPCInvokeError instance
 */
declare const CreateIPCInvokeError: (channel: string, cause: unknown) => IPCInvokeError;
/**
 * Creates an IPCSendError instance
 */
declare const CreateIPCSendError: (channel: string, cause: unknown) => IPCSendError;
/**
 * Creates an IPCSubscriptionError instance
 */
declare const CreateIPCSubscriptionError: (channel: string, cause: unknown) => IPCSubscriptionError;
export { CreateIPCInvokeError, CreateIPCSendError, CreateIPCSubscriptionError, };
declare const _default: {
    CreateIPCInvokeError: (channel: string, cause: unknown) => IPCInvokeError;
    CreateIPCSendError: (channel: string, cause: unknown) => IPCSendError;
    CreateIPCSubscriptionError: (channel: string, cause: unknown) => IPCSubscriptionError;
};
export default _default;
//# sourceMappingURL=IPCError.d.ts.map