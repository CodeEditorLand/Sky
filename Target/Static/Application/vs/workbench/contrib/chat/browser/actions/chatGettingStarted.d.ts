import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IExtensionManagementService } from '../../../../../platform/extensionManagement/common/extensionManagement.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IChatWidgetService } from '../chat.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
export declare class ChatGettingStartedContribution extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly extensionService;
    private readonly extensionManagementService;
    private readonly storageService;
    private readonly chatWidgetService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.chatGettingStarted";
    private recentlyInstalled;
    private static readonly hideWelcomeView;
    constructor(productService: IProductService, extensionService: IExtensionService, extensionManagementService: IExtensionManagementService, storageService: IStorageService, chatWidgetService: IChatWidgetService, configurationService: IConfigurationService);
    private registerListeners;
    private onDidInstallChat;
}
