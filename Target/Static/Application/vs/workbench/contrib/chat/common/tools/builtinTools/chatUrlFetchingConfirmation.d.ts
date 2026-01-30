import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IQuickInputService } from '../../../../../../platform/quickinput/common/quickInput.js';
import { IPreferencesService } from '../../../../../services/preferences/common/preferences.js';
import { ConfirmedReason } from '../../chatService/chatService.js';
import { ILanguageModelToolConfirmationActions, ILanguageModelToolConfirmationContribution, ILanguageModelToolConfirmationContributionQuickTreeItem, ILanguageModelToolConfirmationRef } from '../languageModelToolsConfirmationService.js';
export declare class ChatUrlFetchingConfirmationContribution implements ILanguageModelToolConfirmationContribution {
    private readonly _getURLS;
    private readonly _configurationService;
    private readonly _quickInputService;
    private readonly _preferencesService;
    readonly canUseDefaultApprovals = false;
    constructor(_getURLS: (parameters: unknown) => string[] | undefined, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _preferencesService: IPreferencesService);
    getPreConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined;
    getPostConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined;
    private _checkApproval;
    getPreConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[];
    getPostConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[];
    private _getConfirmActions;
    private _showMoreOptions;
    private _approvePattern;
    getManageActions(): ILanguageModelToolConfirmationContributionQuickTreeItem[];
    reset(): Promise<void>;
    private _getApprovedUrls;
}
