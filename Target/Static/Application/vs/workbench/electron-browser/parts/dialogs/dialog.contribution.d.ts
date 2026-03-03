import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
export declare class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {
    private configurationService;
    private dialogService;
    private productService;
    private nativeHostService;
    private environmentService;
    static readonly ID = "workbench.contrib.dialogHandler";
    private nativeImpl;
    private browserImpl;
    private model;
    private currentDialog;
    constructor(configurationService: IConfigurationService, dialogService: IDialogService, logService: ILogService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService, nativeHostService: INativeHostService, environmentService: IWorkbenchEnvironmentService);
    private processDialogs;
    private get useCustomDialog();
}
