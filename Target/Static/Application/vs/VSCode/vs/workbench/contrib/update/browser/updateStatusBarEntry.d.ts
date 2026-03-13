import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import './media/updateStatusBarEntry.css';
/**
 * Displays update status and actions in the status bar.
 */
export declare class UpdateStatusBarContribution extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly statusbarService;
    private static readonly actionableStates;
    private readonly accessor;
    private readonly tooltip;
    private lastStateType;
    constructor(configurationService: IConfigurationService, instantiationService: IInstantiationService, statusbarService: IStatusbarService, updateService: IUpdateService);
    private onStateChange;
    private updateEntry;
    private getDownloadingText;
    private getUpdatingText;
}
