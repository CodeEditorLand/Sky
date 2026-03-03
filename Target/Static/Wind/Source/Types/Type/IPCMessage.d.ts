/**
 * @module Types/Type/IPCMessage
 * @description
 * IPC message envelope type.
 * Represents a message sent through the IPC channel.
 * @see {@link Types/Interface/IPCRenderer} Related IPC renderer interface
 * @category Type
 */
/**
 * IPC message interface
 */
export interface IPCMessage {
    readonly channel: string;
    readonly args: ReadonlyArray<unknown>;
}
//# sourceMappingURL=IPCMessage.d.ts.map