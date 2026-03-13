import { IRange } from '../../../../editor/common/core/range.js';
import { URI } from '../../../../base/common/uri.js';
import { IAgentFeedback } from './agentFeedbackService.js';
import { ICodeReviewComment, ICodeReviewState, ICodeReviewSuggestion, IPRReviewComment, IPRReviewState } from '../../codeReview/browser/codeReviewService.js';
export declare const enum SessionEditorCommentSource {
    AgentFeedback = "agentFeedback",
    CodeReview = "codeReview",
    PRReview = "prReview"
}
export interface ISessionEditorComment {
    readonly id: string;
    readonly sourceId: string;
    readonly source: SessionEditorCommentSource;
    readonly sessionResource: URI;
    readonly resourceUri: URI;
    readonly range: IRange;
    readonly text: string;
    readonly suggestion?: ICodeReviewSuggestion;
    readonly severity?: string;
    readonly canConvertToAgentFeedback: boolean;
}
export declare function getCodeReviewComments(reviewState: ICodeReviewState): readonly ICodeReviewComment[];
export declare function getPRReviewComments(prReviewState: IPRReviewState | undefined): readonly IPRReviewComment[];
export declare function getSessionEditorComments(sessionResource: URI, agentFeedbackItems: readonly IAgentFeedback[], reviewState: ICodeReviewState, prReviewState?: IPRReviewState): readonly ISessionEditorComment[];
export declare function compareSessionEditorComments(a: ISessionEditorComment, b: ISessionEditorComment): number;
export declare function groupNearbySessionEditorComments(items: readonly ISessionEditorComment[], lineThreshold?: number): ISessionEditorComment[][];
export declare function getResourceEditorComments(resourceUri: URI, comments: readonly ISessionEditorComment[]): readonly ISessionEditorComment[];
export declare function toSessionEditorCommentId(source: SessionEditorCommentSource, sourceId: string): string;
export declare function hasAgentFeedbackComments(comments: readonly ISessionEditorComment[]): boolean;
