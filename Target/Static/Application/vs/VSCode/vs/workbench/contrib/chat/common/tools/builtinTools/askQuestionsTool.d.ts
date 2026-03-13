import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IChatQuestionAnswers, IChatService } from '../../chatService/chatService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../languageModelToolsService.js';
/**
 * Response returned to the model when the user is not available (autopilot mode).
 */
export declare const AUTOPILOT_ASK_USER_RESPONSE = "The user is not available to respond and will review your work later. Work autonomously and make good decisions.";
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
    private readonly configService;
    constructor(chatService: IChatService, telemetryService: ITelemetryService, logService: ILogService, configService: IConfigurationService);
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    private getRequest;
    private toQuestionCarousel;
    private toChatQuestion;
    protected convertCarouselAnswers(questions: IQuestion[], carouselAnswers: IChatQuestionAnswers | undefined, idToHeaderMap: Map<string, string>): IAnswerResult;
    private collectMetrics;
    private createSkippedResult;
    private createAutopilotResult;
    /**
     * Build carousel answer data keyed by carousel question IDs for rendering
     * the completed summary in the UI during autopilot mode.
     */
    private buildAutopilotCarouselAnswers;
    private sendTelemetry;
}
