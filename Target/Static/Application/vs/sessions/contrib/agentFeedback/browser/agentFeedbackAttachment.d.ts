import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IAgentFeedbackService } from './agentFeedbackService.js';
import { IChatWidgetService } from '../../../../workbench/contrib/chat/browser/chat.js';
export declare const ATTACHMENT_ID_PREFIX = "agentFeedback:";
/**
 * Keeps the "N feedback items" attachment in the chat input in sync with the
 * AgentFeedbackService. One attachment per session resource, updated reactively.
 * Clears feedback after the chat prompt is sent.
 */
export declare class AgentFeedbackAttachmentContribution extends Disposable {
    private readonly _agentFeedbackService;
    private readonly _chatWidgetService;
    private readonly _textModelService;
    static readonly ID = "workbench.contrib.agentFeedbackAttachment";
    /** Track onDidAcceptInput subscriptions per widget session */
    private readonly _widgetListeners;
    /** Cache of resolved code snippets keyed by feedback ID */
    private readonly _snippetCache;
    constructor(_agentFeedbackService: IAgentFeedbackService, _chatWidgetService: IChatWidgetService, _textModelService: ITextModelService);
    private _updateAttachment;
    /**
     * Builds a rich string value for the agent feedback attachment that includes
     * the code snippet at each feedback item's location alongside the feedback text.
     * Uses a cache keyed by feedback ID to avoid re-resolving snippets for
     * items that haven't changed.
     */
    private _buildFeedbackValue;
    /**
     * Resolves the text model for a resource and extracts the code in the given range.
     * Returns undefined if the model cannot be resolved.
     */
    private _getCodeSnippet;
    /**
     * Ensure we listen for the chat widget's submit event so we can clear feedback after send.
     */
    private _ensureAcceptListener;
}
