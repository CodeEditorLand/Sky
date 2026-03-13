import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IChatAgentService } from '../common/participants/chatAgents.js';
import { IChatSlashCommandService } from '../common/participants/chatSlashCommands.js';
import { IChatService } from '../common/chatService/chatService.js';
import { IAgentSessionsService } from './agentSessions/agentSessionsService.js';
import { IChatWidgetService } from './chat.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
export declare class ChatSlashCommandsContribution extends Disposable {
    private readonly environmentService;
    static readonly ID = "workbench.contrib.chatSlashCommands";
    constructor(slashCommandService: IChatSlashCommandService, commandService: ICommandService, chatAgentService: IChatAgentService, instantiationService: IInstantiationService, agentSessionsService: IAgentSessionsService, chatService: IChatService, configurationService: IConfigurationService, chatWidgetService: IChatWidgetService, environmentService: IWorkbenchEnvironmentService);
}
