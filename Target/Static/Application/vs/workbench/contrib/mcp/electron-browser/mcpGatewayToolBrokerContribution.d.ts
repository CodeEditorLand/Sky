import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IMcpService } from '../common/mcpTypes.js';
export declare class McpGatewayToolBrokerContribution implements IWorkbenchContribution {
    constructor(mainProcessService: IMainProcessService, mcpService: IMcpService);
}
