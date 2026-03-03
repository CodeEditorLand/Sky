import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IMcpService } from '../common/mcpTypes.js';
export declare class McpGatewayToolBrokerContribution implements IWorkbenchContribution {
    constructor(remoteAgentService: IRemoteAgentService, mcpService: IMcpService);
}
