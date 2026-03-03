import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
export declare const minSize = 1;
export declare const maxSize = 20;
export declare class SashSettingsController extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    static readonly ID = "workbench.contrib.sash";
    private readonly styleSheet;
    constructor(configurationService: IConfigurationService);
    private onDidChangeSize;
    private onDidChangeHoverDelay;
}
