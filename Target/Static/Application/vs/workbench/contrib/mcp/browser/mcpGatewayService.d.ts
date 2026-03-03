import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IMcpGatewayResult, IWorkbenchMcpGatewayService } from '../common/mcpGatewayService.js';
/**
 * Browser implementation of the MCP Gateway Service.
 *
 * In browser/serverless web environments without a remote connection,
 * there is no Node.js process available to create an HTTP server.
 *
 * When running with a remote connection, the gateway is created on the
 * remote server via IPC.
 */
export declare class BrowserMcpGatewayService implements IWorkbenchMcpGatewayService {
    private readonly _remoteAgentService;
    readonly _serviceBrand: undefined;
    constructor(_remoteAgentService: IRemoteAgentService);
    createGateway(inRemote: boolean): Promise<IMcpGatewayResult | undefined>;
}
