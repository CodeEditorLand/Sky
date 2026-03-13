import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export declare const restoreWalkthroughsConfigurationKey = "workbench.welcomePage.restorableWalkthroughs";
export type RestoreWalkthroughsConfigurationValue = {
    folder: string;
    category?: string;
    step?: string;
};
export declare class StartupPageEditorResolverContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.startupPageEditorResolver";
    constructor(instantiationService: IInstantiationService, editorResolverService: IEditorResolverService);
}
export declare class StartupPageRunnerContribution extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly editorService;
    private readonly fileService;
    private readonly contextService;
    private readonly lifecycleService;
    private readonly layoutService;
    private readonly productService;
    private readonly commandService;
    private readonly environmentService;
    private readonly storageService;
    private readonly notificationService;
    private readonly contextKeyService;
    static readonly ID = "workbench.contrib.startupPageRunner";
    constructor(configurationService: IConfigurationService, editorService: IEditorService, fileService: IFileService, contextService: IWorkspaceContextService, lifecycleService: ILifecycleService, layoutService: IWorkbenchLayoutService, productService: IProductService, commandService: ICommandService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService, notificationService: INotificationService, contextKeyService: IContextKeyService);
    private run;
    private tryOpenWalkthroughForFolder;
    private openReadme;
    private openGettingStarted;
    private shouldPreserveFocus;
}
