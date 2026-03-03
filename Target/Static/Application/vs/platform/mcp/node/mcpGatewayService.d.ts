import { Disposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IMcpGatewayInfo, IMcpGatewayService, IMcpGatewayToolInvoker } from '../common/mcpGateway.js';
/**
 * Node.js implementation of the MCP Gateway Service.
 *
 * Creates and manages an HTTP server on localhost that provides MCP gateway endpoints.
 * The server is shared among all gateways and uses ref-counting for lifecycle management.
 */
export declare class McpGatewayService extends Disposable implements IMcpGatewayService {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _server;
    private _port;
    private readonly _gateways;
    /** Maps gatewayId to clientId for tracking ownership */
    private readonly _gatewayToClient;
    private _serverStartPromise;
    constructor(_logService: ILogService);
    createGateway(clientId: unknown, toolInvoker?: IMcpGatewayToolInvoker): Promise<IMcpGatewayInfo>;
    disposeGateway(gatewayId: string): Promise<void>;
    disposeGatewaysForClient(clientId: unknown): void;
    private _ensureServer;
    private _startServer;
    private _stopServer;
    private _handleRequest;
    dispose(): void;
}
