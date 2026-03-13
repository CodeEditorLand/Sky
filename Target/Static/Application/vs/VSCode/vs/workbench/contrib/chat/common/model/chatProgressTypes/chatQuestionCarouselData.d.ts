import { DeferredPromise } from '../../../../../../base/common/async.js';
import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { IChatQuestion, IChatQuestionAnswers, IChatQuestionCarousel } from '../../chatService/chatService.js';
import { ToolDataSource } from '../../tools/languageModelToolsService.js';
/**
 * Runtime representation of a question carousel with a {@link DeferredPromise}
 * that is resolved when the user submits answers. {@link toJSON} strips the
 * completion so only serialisable data is persisted.
 */
export declare class ChatQuestionCarouselData implements IChatQuestionCarousel {
    questions: IChatQuestion[];
    allowSkip: boolean;
    resolveId?: string | undefined;
    data?: IChatQuestionAnswers | undefined;
    isUsed?: boolean | undefined;
    message?: (string | IMarkdownString) | undefined;
    source?: ToolDataSource | undefined;
    readonly kind: "questionCarousel";
    readonly completion: DeferredPromise<{
        answers: IChatQuestionAnswers | undefined;
    }>;
    draftAnswers: IChatQuestionAnswers | undefined;
    draftCurrentIndex: number | undefined;
    constructor(questions: IChatQuestion[], allowSkip: boolean, resolveId?: string | undefined, data?: IChatQuestionAnswers | undefined, isUsed?: boolean | undefined, message?: (string | IMarkdownString) | undefined, source?: ToolDataSource | undefined);
    toJSON(): IChatQuestionCarousel;
}
