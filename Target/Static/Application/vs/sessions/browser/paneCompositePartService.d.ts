import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { IProgressIndicator } from '../../platform/progress/common/progress.js';
import { IPaneComposite } from '../../workbench/common/panecomposite.js';
import { ViewContainerLocation } from '../../workbench/common/views.js';
import { IPaneCompositePartService } from '../../workbench/services/panecomposite/browser/panecomposite.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { PaneCompositeDescriptor } from '../../workbench/browser/panecomposite.js';
import { SINGLE_WINDOW_PARTS } from '../../workbench/services/layout/browser/layoutService.js';
export declare class AgenticPaneCompositePartService extends Disposable implements IPaneCompositePartService {
    readonly _serviceBrand: undefined;
    private readonly _onDidPaneCompositeOpen;
    readonly onDidPaneCompositeOpen: import("../../base/common/event.js").Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    private readonly _onDidPaneCompositeClose;
    readonly onDidPaneCompositeClose: import("../../base/common/event.js").Event<{
        composite: IPaneComposite;
        viewContainerLocation: ViewContainerLocation;
    }>;
    private readonly paneCompositeParts;
    constructor(instantiationService: IInstantiationService);
    private registerPart;
    getRegistryId(viewContainerLocation: ViewContainerLocation): string;
    getPartId(viewContainerLocation: ViewContainerLocation): SINGLE_WINDOW_PARTS;
    openPaneComposite(id: string | undefined, viewContainerLocation: ViewContainerLocation, focus?: boolean): Promise<IPaneComposite | undefined>;
    getActivePaneComposite(viewContainerLocation: ViewContainerLocation): IPaneComposite | undefined;
    getPaneComposite(id: string, viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor | undefined;
    getPaneComposites(viewContainerLocation: ViewContainerLocation): PaneCompositeDescriptor[];
    getPinnedPaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getVisiblePaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getPaneCompositeIds(viewContainerLocation: ViewContainerLocation): string[];
    getProgressIndicator(id: string, viewContainerLocation: ViewContainerLocation): IProgressIndicator | undefined;
    hideActivePaneComposite(viewContainerLocation: ViewContainerLocation): void;
    getLastActivePaneCompositeId(viewContainerLocation: ViewContainerLocation): string;
    private getPartByLocation;
}
