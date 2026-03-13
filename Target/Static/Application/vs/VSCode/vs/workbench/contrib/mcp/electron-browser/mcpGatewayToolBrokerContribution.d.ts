import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IMcpService } from '../common/mcpTypes.js';
export declare class McpGatewayToolBrokerContribution implements IWorkbenchContribution {
    constructor(mainProcessService: IMainProcessService, mcpService: IMcpService, logService: ILogService);
}
