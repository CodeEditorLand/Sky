import { ConfirmedReason } from '../../chatService/chatService.js';
import { ILanguageModelToolConfirmationActions, ILanguageModelToolConfirmationContribution, ILanguageModelToolConfirmationRef } from '../languageModelToolsConfirmationService.js';
export interface IExternalPathInfo {
    path: string;
    isDirectory: boolean;
}
/**
 * Confirmation contribution for read_file and list_dir tools that allows users to approve
 * accessing paths outside the workspace, with an option to allow all access
 * from a containing folder for the current chat session.
 */
export declare class ChatExternalPathConfirmationContribution implements ILanguageModelToolConfirmationContribution {
    private readonly _getPathInfo;
    readonly canUseDefaultApprovals = false;
    private readonly _sessionFolderAllowlist;
    constructor(_getPathInfo: (ref: ILanguageModelToolConfirmationRef) => IExternalPathInfo | undefined);
    getPreConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined;
    getPreConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[];
}
