import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IViewDescriptorService } from '../../../../common/views.js';
import { ChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
import { IWorkbenchExtensionEnablementService } from '../../../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IWorkbenchLayoutService } from '../../../../services/layout/browser/layoutService.js';
import { IExtensionsWorkbenchService } from '../../../extensions/common/extensions.js';
export declare class ChatSetupContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly logService;
    private readonly contextKeyService;
    private readonly extensionEnablementService;
    private readonly extensionsWorkbenchService;
    private readonly extensionService;
    private readonly environmentService;
    static readonly ID = "workbench.contrib.chatSetup";
    constructor(instantiationService: IInstantiationService, chatEntitlementService: ChatEntitlementService, logService: ILogService, contextKeyService: IContextKeyService, extensionEnablementService: IWorkbenchExtensionEnablementService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, environmentService: IEnvironmentService);
    private registerSetupAgents;
    private registerActions;
    private registerUrlLinkHandler;
    private checkExtensionInstallation;
}
export declare class ChatTeardownContribution extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly viewDescriptorService;
    private readonly layoutService;
    static readonly ID = "workbench.contrib.chatTeardown";
    static readonly CHAT_DISABLED_CONFIGURATION_KEY = "chat.disableAIFeatures";
    constructor(chatEntitlementService: ChatEntitlementService, configurationService: IConfigurationService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, viewDescriptorService: IViewDescriptorService, layoutService: IWorkbenchLayoutService);
    private handleChatDisabled;
    private registerListeners;
    private maybeEnableOrDisableExtension;
    private maybeHideAuxiliaryBar;
    private registerActions;
}
export declare function refreshTokens(commandService: ICommandService): void;
