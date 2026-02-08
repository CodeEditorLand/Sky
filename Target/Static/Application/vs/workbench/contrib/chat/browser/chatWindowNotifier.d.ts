import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IChatService } from '../common/chatService/chatService.js';
import { IChatWidgetService } from './chat.js';
/**
 * Observes all live chat models and triggers OS notifications when any model
 * transitions to needing input (confirmation/elicitation).
 */
export declare class ChatWindowNotifier extends Disposable implements IWorkbenchContribution {
    private readonly _chatService;
    private readonly _chatWidgetService;
    private readonly _hostService;
    private readonly _configurationService;
    private readonly _commandService;
    static readonly ID = "workbench.contrib.chatWindowNotifier";
    private readonly _activeNotifications;
    constructor(_chatService: IChatService, _chatWidgetService: IChatWidgetService, _hostService: IHostService, _configurationService: IConfigurationService, _commandService: ICommandService);
    private _trackModel;
    private _notifyIfNeeded;
    private _sanitizeOSToastText;
    private _clearNotification;
}
