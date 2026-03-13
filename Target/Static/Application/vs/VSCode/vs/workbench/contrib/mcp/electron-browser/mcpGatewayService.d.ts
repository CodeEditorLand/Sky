import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IMcpGatewayResult, IWorkbenchMcpGatewayService } from '../common/mcpGatewayService.js';
/**
 * Electron workbench implementation of the MCP Gateway Service.
 *
 * This implementation can create gateways either in the main process (local)
 * or on a remote server (if connected).
 */
export declare class WorkbenchMcpGatewayService implements IWorkbenchMcpGatewayService {
    private readonly _remoteAgentService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _localPlatformService;
    constructor(mainProcessService: IMainProcessService, _remoteAgentService: IRemoteAgentService, _logService: ILogService);
    createGateway(inRemote: boolean): Promise<IMcpGatewayResult | undefined>;
    private _createLocalGateway;
    private _createRemoteGateway;
}
