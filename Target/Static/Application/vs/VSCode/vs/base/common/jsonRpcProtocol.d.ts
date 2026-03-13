import { CancellationToken } from './cancellation.js';
import { Disposable } from './lifecycle.js';
export type JsonRpcId = string | number;
export interface IJsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}
export interface IJsonRpcRequest {
    jsonrpc: '2.0';
    id: JsonRpcId;
    method: string;
    params?: unknown;
}
export interface IJsonRpcNotification {
    jsonrpc: '2.0';
    method: string;
    params?: unknown;
}
export interface IJsonRpcSuccessResponse {
    jsonrpc: '2.0';
    id: JsonRpcId;
    result: unknown;
}
export interface IJsonRpcErrorResponse {
    jsonrpc: '2.0';
    id?: JsonRpcId;
    error: IJsonRpcError;
}
export type JsonRpcMessage = IJsonRpcRequest | IJsonRpcNotification | IJsonRpcSuccessResponse | IJsonRpcErrorResponse;
export type JsonRpcResponse = IJsonRpcSuccessResponse | IJsonRpcErrorResponse;
export interface IJsonRpcProtocolHandlers {
    handleRequest?(request: IJsonRpcRequest, token: CancellationToken): Promise<unknown> | unknown;
    handleNotification?(notification: IJsonRpcNotification): void;
}
export declare class JsonRpcError extends Error {
    readonly code: number;
    readonly data?: unknown | undefined;
    constructor(code: number, message: string, data?: unknown | undefined);
}
/**
 * Generic JSON-RPC 2.0 protocol helper.
 */
export declare class JsonRpcProtocol extends Disposable {
    private readonly _send;
    private readonly _handlers;
    private static readonly ParseError;
    private static readonly MethodNotFound;
    private static readonly InternalError;
    private _nextRequestId;
    private readonly _pendingRequests;
    constructor(_send: (message: JsonRpcMessage) => void, _handlers: IJsonRpcProtocolHandlers);
    sendNotification(notification: Omit<IJsonRpcNotification, 'jsonrpc'>): void;
    sendRequest<T = unknown>(request: Omit<IJsonRpcRequest, 'jsonrpc' | 'id'>, token?: CancellationToken, onCancel?: (id: JsonRpcId) => void): Promise<T>;
    /**
     * Handles one or more incoming JSON-RPC messages.
     *
     * Returns an array of JSON-RPC response objects generated for any incoming
     * requests in the message(s). Notifications and responses to our own
     * outgoing requests do not produce return values. For batch inputs, the
     * returned responses are in the same order as the corresponding requests.
     *
     * Note: responses are also emitted via the `_send` callback, so callers
     * that rely on the return value should not re-send them.
     */
    handleMessage(message: JsonRpcMessage | JsonRpcMessage[]): Promise<JsonRpcResponse[]>;
    cancelPendingRequest(id: JsonRpcId): void;
    cancelAllRequests(): void;
    private _handleMessage;
    private _handleResult;
    private _handleError;
    private _handleRequest;
    dispose(): void;
    static createParseError(message: string, data?: unknown): IJsonRpcErrorResponse;
}
export declare function isJsonRpcRequest(message: JsonRpcMessage): message is IJsonRpcRequest;
export declare function isJsonRpcResponse(message: JsonRpcMessage): message is IJsonRpcSuccessResponse | IJsonRpcErrorResponse;
export declare function isJsonRpcNotification(message: JsonRpcMessage): message is IJsonRpcNotification;
