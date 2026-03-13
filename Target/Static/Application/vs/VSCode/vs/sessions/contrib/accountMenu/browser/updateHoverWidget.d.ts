import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUpdateService, State } from '../../../../platform/update/common/update.js';
import './media/updateHoverWidget.css';
export declare class UpdateHoverWidget {
    private readonly updateService;
    private readonly productService;
    private readonly hoverService;
    constructor(updateService: IUpdateService, productService: IProductService, hoverService: IHoverService);
    attachTo(target: HTMLElement): import("../../../../base/common/lifecycle.ts").IDisposable;
    createHoverContent(state?: State): HTMLElement;
    private appendGridRow;
    private formatCompactAge;
    private getUpdateFromState;
    /**
     * Returns progress as a percentage (0-100), or undefined if progress is not applicable.
     */
    private getUpdateProgressPercent;
    private getUpdateHeaderLabel;
}
