import { IProductConfiguration } from '../../../../base/common/product.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IIssueFormService, IssueReporterData } from '../common/issue.js';
import { BaseIssueReporterService } from './baseIssueReporterService.js';
export declare class IssueWebReporter extends BaseIssueReporterService {
    constructor(disableExtensions: boolean, data: IssueReporterData, os: {
        type: string;
        arch: string;
        release: string;
    }, product: IProductConfiguration, window: Window, issueFormService: IIssueFormService, themeService: IThemeService, fileService: IFileService, fileDialogService: IFileDialogService, contextMenuService: IContextMenuService, authenticationService: IAuthenticationService, openerService: IOpenerService);
    setEventHandlers(): void;
}
