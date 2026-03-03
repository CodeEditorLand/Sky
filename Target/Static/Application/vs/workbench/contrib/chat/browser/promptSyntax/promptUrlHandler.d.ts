import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { IURLHandler, IURLService } from '../../../../../platform/url/common/url.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IHostService } from '../../../../services/host/browser/host.js';
export declare class PromptUrlHandler extends Disposable implements IWorkbenchContribution, IURLHandler {
    private readonly notificationService;
    private readonly requestService;
    private readonly instantiationService;
    private readonly fileService;
    private readonly openerService;
    private readonly logService;
    private readonly dialogService;
    private readonly hostService;
    static readonly ID = "workbench.contrib.promptUrlHandler";
    constructor(urlService: IURLService, notificationService: INotificationService, requestService: IRequestService, instantiationService: IInstantiationService, fileService: IFileService, openerService: IOpenerService, logService: ILogService, dialogService: IDialogService, hostService: IHostService);
    handleURL(uri: URI): Promise<boolean>;
    private shouldBlockInstall;
}
