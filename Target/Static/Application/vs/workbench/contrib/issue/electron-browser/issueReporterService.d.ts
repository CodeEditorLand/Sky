import { IProductConfiguration } from '../../../../base/common/product.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProcessService } from '../../../../platform/process/common/process.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { BaseIssueReporterService } from '../browser/baseIssueReporterService.js';
import { IIssueFormService, IssueReporterData } from '../common/issue.js';
export declare class IssueReporter extends BaseIssueReporterService {
    private readonly nativeHostService;
    private readonly updateService;
    private readonly processService;
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, nativeHostService: INativeHostService, issueFormService: IIssueFormService, processService: IProcessService, themeService: IThemeService, fileService: IFileService, fileDialogService: IFileDialogService, updateService: IUpdateService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, authenticationService: IAuthenticationService, openerService: IOpenerService);
    private checkForUpdates;
    setEventHandlers(): void;
    submitToGitHub(issueTitle: string, issueBody: string, gitHubDetails: {
        owner: string;
        repositoryName: string;
    }): Promise<boolean>;
    createIssue(shouldCreate?: boolean, privateUri?: boolean): Promise<boolean>;
    writeToClipboard(baseUrl: string, issueBody: string): Promise<string>;
    private updateSystemInfo;
    private updateRestrictedMode;
    private updateUnsupportedMode;
    private updateExperimentsInfo;
}
