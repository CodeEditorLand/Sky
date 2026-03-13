import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchMcpManagementService } from '../../../services/mcp/common/mcpWorkbenchManagementService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IJSONEditingService } from '../../../services/configuration/common/jsonEditing.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
export declare class McpConfigMigrationContribution extends Disposable implements IWorkbenchContribution {
    private readonly mcpManagementService;
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly remoteAgentService;
    private readonly jsonEditingService;
    private readonly logService;
    private readonly notificationService;
    private readonly commandService;
    static ID: string;
    constructor(mcpManagementService: IWorkbenchMcpManagementService, userDataProfileService: IUserDataProfileService, fileService: IFileService, remoteAgentService: IRemoteAgentService, jsonEditingService: IJSONEditingService, logService: ILogService, notificationService: INotificationService, commandService: ICommandService);
    private migrateMcpConfig;
    private watchForMcpConfiguration;
    private checkForMcpConfigInFile;
    private showMcpConfigErrorNotification;
    private parseMcpConfig;
    private removeMcpConfig;
}
