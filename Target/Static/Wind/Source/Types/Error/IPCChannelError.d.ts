/**
 * @module Types/Error/IPCChannelError
 * @description
 * Error thrown when an IPC channel operation fails.
 * Includes the channel name and underlying cause.
 * @category Error
 */
/**
 * IPC channel error
 */
export declare class IPCChannelError extends Error {
    readonly channel: string;
    readonly cause: unknown;
    readonly _tag = "IPCChannelError";
    constructor(channel: string, cause: unknown);
}
//# sourceMappingURL=IPCChannelError.d.ts.map