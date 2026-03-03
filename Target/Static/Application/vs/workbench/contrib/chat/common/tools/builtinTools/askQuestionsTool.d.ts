import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IChatService } from '../../chatService/chatService.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../languageModelToolsService.js';
export declare const AskQuestionsToolId = "vscode_askQuestions";
export interface IQuestionOption {
    readonly label: string;
    readonly description?: string;
    readonly recommended?: boolean;
}
export interface IQuestion {
    readonly header: string;
    readonly question: string;
    readonly multiSelect?: boolean;
    readonly options?: IQuestionOption[];
    readonly allowFreeformInput?: boolean;
}
export interface IAskQuestionsParams {
    readonly questions: IQuestion[];
}
export interface IQuestionAnswer {
    readonly selected: string[];
    readonly freeText: string | null;
    readonly skipped: boolean;
}
export interface IAnswerResult {
    readonly answers: Record<string, IQuestionAnswer>;
}
export declare function createAskQuestionsToolData(): IToolData;
export declare const AskQuestionsToolData: IToolData;
export declare class AskQuestionsTool extends Disposable implements IToolImpl {
    private readonly chatService;
    private readonly telemetryService;
    private readonly logService;
    constructor(chatService: IChatService, telemetryService: ITelemetryService, logService: ILogService);
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    private getRequest;
    private toQuestionCarousel;
    private toChatQuestion;
    protected convertCarouselAnswers(questions: IQuestion[], carouselAnswers: Record<string, unknown> | undefined, idToHeaderMap: Map<string, string>): IAnswerResult;
    private collectMetrics;
    private createSkippedResult;
    private sendTelemetry;
}
