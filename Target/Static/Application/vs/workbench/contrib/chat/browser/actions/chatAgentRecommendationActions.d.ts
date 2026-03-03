import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IExtensionGalleryService } from '../../../../../platform/extensionManagement/common/extensionManagement.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IWorkbenchExtensionManagementService } from '../../../../services/extensionManagement/common/extensionManagement.js';
export declare class ChatAgentRecommendation extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly extensionGalleryService;
    private readonly extensionManagementService;
    private readonly contextKeyService;
    static readonly ID = "workbench.contrib.chatAgentRecommendation";
    private readonly availabilityContextKeys;
    private refreshRequestId;
    constructor(productService: IProductService, extensionGalleryService: IExtensionGalleryService, extensionManagementService: IWorkbenchExtensionManagementService, contextKeyService: IContextKeyService);
    private registerRecommendation;
    private refreshInstallAvailability;
}
