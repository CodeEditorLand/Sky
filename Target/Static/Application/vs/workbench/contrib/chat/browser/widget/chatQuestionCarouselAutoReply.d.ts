import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IChatQuestionCarousel } from '../../common/chatService/chatService.js';
import { ILanguageModelsService } from '../../common/languageModels.js';
/**
 * Encapsulates the logic for automatically replying to question carousels,
 * including opt-in state management, LLM-based answer resolution, fallback
 * answer generation, and answer parsing/merging.
 */
export declare class ChatQuestionCarouselAutoReply extends Disposable {
    private readonly configService;
    private readonly dialogService;
    private readonly logService;
    private readonly storageService;
    private readonly languageModelsService;
    constructor(configService: IConfigurationService, dialogService: IDialogService, logService: ILogService, storageService: IStorageService, languageModelsService: ILanguageModelsService);
    shouldAutoReply(): Promise<boolean>;
    autoReply(carousel: IChatQuestionCarousel, submit: (answers: Map<string, unknown> | undefined) => Promise<void>, modelName: string | undefined, requestMessageText: string | undefined, token: CancellationToken): Promise<void>;
    private checkOptIn;
    private getModelId;
    private buildPrompt;
    private requestAnswers;
    private parseAnswers;
    private mergeAnswers;
    private hasDefaultValue;
    private resolveAnswerFromRaw;
    private matchQuestionOption;
    buildFallbackCarouselAnswers(carousel: IChatQuestionCarousel, requestMessageText: string | undefined): Map<string, unknown>;
    private getFallbackAnswerForQuestion;
    private tryParseJsonObject;
}
