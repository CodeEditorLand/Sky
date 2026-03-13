import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ConfirmedReason } from '../../common/chatService/chatService.js';
import { ILanguageModelToolConfirmationActions, ILanguageModelToolConfirmationContribution, ILanguageModelToolConfirmationRef, ILanguageModelToolsConfirmationService } from '../../common/tools/languageModelToolsConfirmationService.js';
import { IToolData } from '../../common/tools/languageModelToolsService.js';
export declare class LanguageModelToolsConfirmationService extends Disposable implements ILanguageModelToolsConfirmationService {
    private readonly _instantiationService;
    private readonly _quickInputService;
    readonly _serviceBrand: undefined;
    private _preExecutionToolConfirmStore;
    private _postExecutionToolConfirmStore;
    private _preExecutionServerConfirmStore;
    private _postExecutionServerConfirmStore;
    private _contributions;
    constructor(_instantiationService: IInstantiationService, _quickInputService: IQuickInputService);
    getPreConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined;
    getPostConfirmAction(ref: ILanguageModelToolConfirmationRef): ConfirmedReason | undefined;
    getPreConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[];
    getPostConfirmActions(ref: ILanguageModelToolConfirmationRef): ILanguageModelToolConfirmationActions[];
    registerConfirmationContribution(toolName: string, contribution: ILanguageModelToolConfirmationContribution): IDisposable;
    toolCanManageConfirmation(tool: IToolData): boolean;
    manageConfirmationPreferences(tools: readonly IToolData[], options?: {
        defaultScope?: 'workspace' | 'profile' | 'session';
        focusToolId?: string;
    }): void;
    resetToolAutoConfirmation(): void;
}
