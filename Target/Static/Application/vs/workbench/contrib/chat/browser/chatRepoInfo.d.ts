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
 * Captures lightweight repository metadata (branch, commit, remote) from SCM providers.
 * No file I/O or diff computation - reads only from already-loaded SCM observables.
 * Used on chat message submission to record the point-in-time commit state.
 */
export declare function captureRepoMetadata(scmService: ISCMService): IExportableRepoData | undefined;
/**
 * Captures full repository state including working tree diffs.
 * Performs file I/O and diff computation - should only be called on explicit user action (e.g., export).
 */
export declare function captureRepoInfo(scmService: ISCMService, fileService: IFileService): Promise<IExportableRepoData | undefined>;
/**
 * Captures lightweight repository metadata for chat sessions on first message.
 * Only reads from already-loaded SCM provider observables, no file I/O.
 * Full diff capture is deferred to export time (see chatExportZip.ts).
 */
export declare class ChatRepoInfoContribution extends Disposable implements IWorkbenchContribution {
    private readonly chatService;
    private readonly chatEntitlementService;
    private readonly scmService;
    private readonly logService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.chatRepoInfo";
    private _configurationRegistered;
    constructor(chatService: IChatService, chatEntitlementService: IChatEntitlementService, scmService: ISCMService, logService: ILogService, configurationService: IConfigurationService);
    private registerConfigurationIfInternal;
    /**
     * Captures lightweight metadata (branch, commit, remote refs) on first message.
     * Synchronous, no file I/O. Reads only from SCM provider observables.
     */
    private captureAndSetRepoMetadata;
}
