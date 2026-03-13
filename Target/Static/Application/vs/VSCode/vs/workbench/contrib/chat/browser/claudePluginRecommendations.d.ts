import { Disposable } from '../../../../base/common/lifecycle.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { IChatService } from '../common/chatService/chatService.js';
import { IPluginMarketplaceService } from '../common/plugins/pluginMarketplaceService.js';
export declare class AgentPluginRecommendations extends Disposable implements IWorkbenchContribution {
    private readonly _chatService;
    private readonly _pluginMarketplaceService;
    private readonly _notificationService;
    private readonly _extensionsWorkbenchService;
    static readonly ID = "workbench.contrib.agentPluginRecommendations";
    private _hasNotified;
    constructor(_chatService: IChatService, _pluginMarketplaceService: IPluginMarketplaceService, _notificationService: INotificationService, _extensionsWorkbenchService: IExtensionsWorkbenchService);
    private _checkForRecommendedPlugins;
}
