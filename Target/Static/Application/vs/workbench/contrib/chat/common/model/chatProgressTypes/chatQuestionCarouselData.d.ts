import { DeferredPromise } from '../../../../../../base/common/async.js';
import { IChatQuestion, IChatQuestionCarousel } from '../../chatService/chatService.js';
/**
 * Runtime representation of a question carousel with a {@link DeferredPromise}
 * that is resolved when the user submits answers. {@link toJSON} strips the
 * completion so only serialisable data is persisted.
 */
export declare class ChatQuestionCarouselData implements IChatQuestionCarousel {
    questions: IChatQuestion[];
    allowSkip: boolean;
    resolveId?: string | undefined;
    data?: Record<string, unknown> | undefined;
    isUsed?: boolean | undefined;
    readonly kind: "questionCarousel";
    readonly completion: DeferredPromise<{
        answers: Record<string, unknown> | undefined;
    }>;
    constructor(questions: IChatQuestion[], allowSkip: boolean, resolveId?: string | undefined, data?: Record<string, unknown> | undefined, isUsed?: boolean | undefined);
    toJSON(): IChatQuestionCarousel;
}
