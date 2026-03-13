import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { ConfirmedReason } from '../../chatService/chatService.js';
import { ILanguageModelToolConfirmationActions, ILanguageModelToolConfirmationContribution, ILanguageModelToolConfirmationContributionQuickTreeItem, ILanguageModelToolConfirmationRef } from '../languageModelToolsConfirmationService.js';
export interface IExternalPathInfo {
    path: string;
    isDirectory: boolean;
}
/**
 * Confirmation contribution for read_file and list_dir tools that allows users to approve
 * accessing paths outside the workspace, with an option to allow all access
 * from a containing folder for the current chat session.
 */
export declare class ChatExternalPathConfirmationContribution implements ILanguageModelToolConfirmationContribution, IDisposable {
    private readonly _getPathInfo;
    private readonly _labelService;
    private readonly _findGitRoot?;
    private readonly _pickFolder?;
    readonly canUseDefaultApprovals = false;
    private readonly _sessionFolderAllowlist;
    /** Cache of path URI -> resolved git root URI (or null if not in a repo) */
    private readonly _gitRootCache;
    private readonly _workspaceAllowlist?;
    constructor(_getPathInfo: (ref: ILanguageModelToolConfirmationRef) => IExternalPathInfo | undefined, _labelService: ILabelService, _findGitRoot?: ((pathUri: URI) => Promise<URI | undefined>) | undefined, storageService?: IStorageService, _pickFolder?: (() => Promise<URI | undefined>) | undefined);
    dispose(): void;
    private _getWorkspaceFolders;
    private _setWorkspaceFolders;
    getPreConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined;
    getPreConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[];
    getManageActions(): ILanguageModelToolConfirmationContributionQuickTreeItem[];
    reset(): void;
}
