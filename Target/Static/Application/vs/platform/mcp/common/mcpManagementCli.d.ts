import { ILogger } from '../../log/common/log.js';
import { IMcpManagementService } from './mcpManagement.js';
export declare class McpManagementCli {
    private readonly _logger;
    private readonly _mcpManagementService;
    constructor(_logger: ILogger, _mcpManagementService: IMcpManagementService);
    addMcpDefinitions(definitions: string[]): Promise<void>;
    private updateMcpInResource;
    private validateConfiguration;
}
