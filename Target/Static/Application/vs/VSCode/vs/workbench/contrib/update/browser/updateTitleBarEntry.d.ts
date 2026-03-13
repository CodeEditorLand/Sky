import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IManagedHoverContent } from '../../../../base/browser/ui/hover/hover.js';
import { IAction } from '../../../../base/common/actions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActionViewItemService } from '../../../../platform/actions/browser/actionViewItemService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import './media/updateTitleBarEntry.css';
/**
 * Displays update status and actions in the title bar.
 */
export declare class UpdateTitleBarContribution extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly storageService;
    constructor(actionViewItemService: IActionViewItemService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, productService: IProductService, storageService: IStorageService, updateService: IUpdateService);
    private shouldShowTooltip;
    private isMajorMinorVersionChange;
}
/**
 * Custom action view item for the update indicator in the title bar.
 */
export declare class UpdateTitleBarEntry extends BaseActionViewItem {
    private readonly onDisposeTooltip;
    private showTooltipOnRender;
    private readonly commandService;
    private readonly hoverService;
    private readonly updateService;
    private content;
    private readonly tooltip;
    constructor(action: IAction, options: IBaseActionViewItemOptions, onDisposeTooltip: () => void, showTooltipOnRender: boolean, commandService: ICommandService, hoverService: IHoverService, instantiationService: IInstantiationService, updateService: IUpdateService);
    render(container: HTMLElement): void;
    protected getHoverContents(): IManagedHoverContent;
    private runAction;
    showTooltip(): void;
    private updateContent;
    private renderProgressState;
}
