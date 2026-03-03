import type * as http from 'http';
import { JsonRpcMessage } from '../../../base/common/jsonRpcProtocol.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IMcpGatewayToolInvoker } from '../common/mcpGateway.js';
/**
 * Encodes a resource URI for the gateway by appending `-{serverIndex}` to the authority.
 * This namespaces resources from different MCP servers served through the same gateway.
 */
export declare function encodeGatewayResourceUri(uri: string, serverIndex: number): string;
/**
 * Decodes a gateway-encoded resource URI, extracting the server index and original URI.
 */
export declare function decodeGatewayResourceUri(uri: string): {
    serverIndex: number;
    originalUri: string;
};
export declare class McpGatewaySession extends Disposable {
    readonly id: string;
    private readonly _logService;
    private readonly _onDidDispose;
    private readonly _toolInvoker;
    private readonly _rpc;
    private readonly _sseClients;
    private readonly _pendingResponses;
    private _isCollectingPostResponses;
    private _lastEventId;
    private _isInitialized;
    constructor(id: string, _logService: ILogService, _onDidDispose: () => void, _toolInvoker: IMcpGatewayToolInvoker);
    attachSseClient(_req: http.IncomingMessage, res: http.ServerResponse): void;
    handleIncoming(message: JsonRpcMessage | JsonRpcMessage[]): Promise<JsonRpcMessage[]>;
    dispose(): void;
    private _handleOutgoingMessage;
    private _broadcastSse;
    private _handleRequest;
    private _handleNotification;
    private _handleInitialize;
    private _handleCallTool;
    private _handleListTools;
    private _handleListResources;
    private _handleReadResource;
    private _handleListResourceTemplates;
}
export declare function isInitializeMessage(message: JsonRpcMessage | JsonRpcMessage[]): boolean;
