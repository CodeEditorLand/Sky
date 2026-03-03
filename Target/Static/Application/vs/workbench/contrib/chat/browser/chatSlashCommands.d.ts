import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatAgentService } from '../common/participants/chatAgents.js';
import { IChatSlashCommandService } from '../common/participants/chatSlashCommands.js';
import { IChatService } from '../common/chatService/chatService.js';
import { IAgentSessionsService } from './agentSessions/agentSessionsService.js';
export declare class ChatSlashCommandsContribution extends Disposable {
    static readonly ID = "workbench.contrib.chatSlashCommands";
    constructor(slashCommandService: IChatSlashCommandService, commandService: ICommandService, chatAgentService: IChatAgentService, instantiationService: IInstantiationService, agentSessionsService: IAgentSessionsService, chatService: IChatService, configurationService: IConfigurationService, dialogService: IDialogService, notificationService: INotificationService, storageService: IStorageService);
}
