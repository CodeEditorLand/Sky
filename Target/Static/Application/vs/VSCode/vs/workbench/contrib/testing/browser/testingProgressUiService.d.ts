import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
import { ITestResultService } from '../common/testResultService.js';
/** Workbench contribution that triggers updates in the TestingProgressUi service */
export declare class TestingProgressTrigger extends Disposable {
    private readonly configurationService;
    private readonly viewsService;
    static readonly ID = "workbench.contrib.testing.progressTrigger";
    constructor(resultService: ITestResultService, testCoverageService: ITestCoverageService, configurationService: IConfigurationService, viewsService: IViewsService);
    private attachAutoOpenForNewResults;
    private openExplorerView;
    private openResultsView;
}
