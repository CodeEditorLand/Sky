import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';
import { ISCMService } from '../../scm/common/scm.js';
import { IChatService } from '../common/chatService/chatService.js';
import { IExportableRepoData } from '../common/model/chatModel.js';
/**
 * Captures repository state from the first available SCM repository.
 */
export declare function captureRepoInfo(scmService: ISCMService, fileService: IFileService): Promise<IExportableRepoData | undefined>;
/**
 * Captures repository information for chat sessions on creation and first message.
 */
export declare class ChatRepoInfoContribution extends Disposable implements IWorkbenchContribution {
    private readonly chatService;
    private readonly chatEntitlementService;
    private readonly scmService;
    private readonly fileService;
    private readonly logService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.chatRepoInfo";
    private _configurationRegistered;
    constructor(chatService: IChatService, chatEntitlementService: IChatEntitlementService, scmService: ISCMService, fileService: IFileService, logService: ILogService, configurationService: IConfigurationService);
    private registerConfigurationIfInternal;
    private captureAndSetRepoData;
    /**
     * Trims diffs from older sessions, keeping full diffs only for the most recent sessions.
     */
    private trimOldSessionDiffs;
}
