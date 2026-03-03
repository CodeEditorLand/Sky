import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {
    private dialogService;
    private productService;
    static readonly ID = "workbench.contrib.dialogHandler";
    private readonly model;
    private readonly impl;
    private currentDialog;
    constructor(dialogService: IDialogService, instantiationService: IInstantiationService, productService: IProductService);
    private processDialogs;
}
