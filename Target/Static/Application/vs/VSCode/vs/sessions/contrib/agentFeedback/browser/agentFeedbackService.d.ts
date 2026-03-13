import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IChatEditingService } from '../../../../workbench/contrib/chat/common/editing/chatEditingService.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
import { IChatWidgetService } from '../../../../workbench/contrib/chat/browser/chat.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ICodeReviewSuggestion } from '../../codeReview/browser/codeReviewService.js';
export interface IAgentFeedback {
    readonly id: string;
    readonly text: string;
    readonly resourceUri: URI;
    readonly range: IRange;
    readonly sessionResource: URI;
    readonly suggestion?: ICodeReviewSuggestion;
}
export interface INavigableSessionComment {
    readonly id: string;
}
export interface IAgentFeedbackChangeEvent {
    readonly sessionResource: URI;
    readonly feedbackItems: readonly IAgentFeedback[];
}
export interface IAgentFeedbackNavigationBearing {
    readonly activeIdx: number;
    readonly totalCount: number;
}
export declare const IAgentFeedbackService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentFeedbackService>;
export interface IAgentFeedbackService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeFeedback: Event<IAgentFeedbackChangeEvent>;
    readonly onDidChangeNavigation: Event<URI>;
    /**
     * Add a feedback item for the given session.
     */
    addFeedback(sessionResource: URI, resourceUri: URI, range: IRange, text: string, suggestion?: ICodeReviewSuggestion): IAgentFeedback;
    /**
     * Remove a single feedback item.
     */
    removeFeedback(sessionResource: URI, feedbackId: string): void;
    /**
     * Get all feedback items for a session.
     */
    getFeedback(sessionResource: URI): readonly IAgentFeedback[];
    /**
     * Resolve the most recently updated session that has feedback for a given resource.
     */
    getMostRecentSessionForResource(resourceUri: URI): URI | undefined;
    /**
     * Set the navigation anchor to a specific feedback item, open its editor, and fire a navigation event.
     */
    revealFeedback(sessionResource: URI, feedbackId: string): Promise<void>;
    /**
     * Open an editor for the given session comment (feedback or code-review) at its range
     * and set it as the navigation anchor.
     */
    revealSessionComment(sessionResource: URI, commentId: string, resourceUri: URI, range: IRange): Promise<void>;
    /**
     * Navigate to next/previous feedback item in a session.
     */
    getNextFeedback(sessionResource: URI, next: boolean): IAgentFeedback | undefined;
    getNextNavigableItem<T extends INavigableSessionComment>(sessionResource: URI, items: readonly T[], next: boolean): T | undefined;
    setNavigationAnchor(sessionResource: URI, itemId: string | undefined): void;
    /**
     * Get the current navigation bearings for a session.
     */
    getNavigationBearing(sessionResource: URI, items?: readonly INavigableSessionComment[]): IAgentFeedbackNavigationBearing;
    /**
     * Clear all feedback items for a session (e.g., after sending).
     */
    clearFeedback(sessionResource: URI): void;
    /**
     * Add a feedback item and then submit the feedback. Waits for the
     * attachment to be updated in the chat widget before submitting.
     */
    addFeedbackAndSubmit(sessionResource: URI, resourceUri: URI, range: IRange, text: string, suggestion?: ICodeReviewSuggestion): Promise<void>;
}
export declare class AgentFeedbackService extends Disposable implements IAgentFeedbackService {
    private readonly _chatEditingService;
    private readonly _agentSessionsService;
    private readonly _editorService;
    private readonly _chatWidgetService;
    private readonly _commandService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeFeedback;
    readonly onDidChangeFeedback: Event<IAgentFeedbackChangeEvent>;
    private readonly _onDidChangeNavigation;
    readonly onDidChangeNavigation: Event<URI>;
    /** sessionResource → feedback items */
    private readonly _feedbackBySession;
    private readonly _sessionUpdatedOrder;
    private _sessionUpdatedSequence;
    private readonly _navigationAnchorBySession;
    constructor(_chatEditingService: IChatEditingService, _agentSessionsService: IAgentSessionsService, _editorService: IEditorService, _chatWidgetService: IChatWidgetService, _commandService: ICommandService, _logService: ILogService);
    addFeedback(sessionResource: URI, resourceUri: URI, range: IRange, text: string, suggestion?: ICodeReviewSuggestion): IAgentFeedback;
    removeFeedback(sessionResource: URI, feedbackId: string): void;
    getFeedback(sessionResource: URI): readonly IAgentFeedback[];
    getMostRecentSessionForResource(resourceUri: URI): URI | undefined;
    private _sessionContainsResource;
    revealFeedback(sessionResource: URI, feedbackId: string): Promise<void>;
    revealSessionComment(sessionResource: URI, commentId: string, resourceUri: URI, range: IRange): Promise<void>;
    private _getSessionChange;
    private _changeContainsResource;
    getNextFeedback(sessionResource: URI, next: boolean): IAgentFeedback | undefined;
    getNextNavigableItem<T extends INavigableSessionComment>(sessionResource: URI, items: readonly T[], next: boolean): T | undefined;
    setNavigationAnchor(sessionResource: URI, itemId: string | undefined): void;
    getNavigationBearing(sessionResource: URI, items?: readonly INavigableSessionComment[]): IAgentFeedbackNavigationBearing;
    clearFeedback(sessionResource: URI): void;
    addFeedbackAndSubmit(sessionResource: URI, resourceUri: URI, range: IRange, text: string, suggestion?: ICodeReviewSuggestion): Promise<void>;
}
