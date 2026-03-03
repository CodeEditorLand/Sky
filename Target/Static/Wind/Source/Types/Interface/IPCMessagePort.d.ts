/**
 * @module Types/Interface/IPCMessagePort
 * @description
 * MessagePort interface for SharedProcessWorker support.
 * Used for VSCode's message port acquisition mechanism.
 * @category Interface
 */
/**
 * IPC MessagePort interface
 */
export interface IPCMessagePort {
    readonly acquire: (responseChannel: string, nonce: string) => void;
}
//# sourceMappingURL=IPCMessagePort.d.ts.map