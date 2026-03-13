import './media/agentFeedbackEditorWidget.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { URI } from '../../../../base/common/uri.js';
import { IAgentFeedbackService } from './agentFeedbackService.js';
import { ICodeReviewService } from '../../codeReview/browser/codeReviewService.js';
import { ISessionEditorComment } from './sessionEditorComments.js';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.js';
/**
 * Widget that displays agent feedback comments for a group of nearby feedback items.
 * Positioned on the right side of the editor like a speech bubble.
 */
export declare class AgentFeedbackEditorWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly _commentItems;
    private readonly _sessionResource;
    private readonly _agentFeedbackService;
    private readonly _codeReviewService;
    private readonly _markdownRendererService;
    private static _idPool;
    private readonly _id;
    private readonly _domNode;
    private readonly _headerNode;
    private readonly _titleNode;
    private readonly _toggleButton;
    private readonly _bodyNode;
    private readonly _itemElements;
    private _position;
    private _isExpanded;
    private _disposed;
    private _startLineNumber;
    private readonly _rangeHighlightDecoration;
    private readonly _eventStore;
    constructor(_editor: ICodeEditor, _commentItems: readonly ISessionEditorComment[], _sessionResource: URI, _agentFeedbackService: IAgentFeedbackService, _codeReviewService: ICodeReviewService, _markdownRendererService: IMarkdownRendererService);
    private _setupEventHandlers;
    private _toggleExpanded;
    private _updateTitle;
    private _updateToggleButton;
    private _buildFeedbackItems;
    private _getTypeLabel;
    private _renderSuggestion;
    private _removeComment;
    private _convertToAgentFeedback;
    /**
     * Expand the widget body.
     */
    expand(): void;
    /**
     * Collapse the widget body.
     */
    collapse(): void;
    /**
     * Focus a specific feedback item within this widget.
     * Highlights its range in the editor and marks it as focused.
     */
    focusFeedback(feedbackId: string): void;
    /**
     * Clear focus state and range highlighting.
     */
    clearFocus(): void;
    private _highlightRange;
    /**
     * Returns true if this widget contains the given feedback item (by id).
     */
    containsFeedback(feedbackId: string): boolean;
    /**
     * Updates the widget position and layout.
     */
    layout(startLineNumber: number): void;
    /**
     * Shows or hides the widget.
     */
    toggle(show: boolean): void;
    /**
     * Relayouts the widget at its current line number.
     */
    relayout(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    dispose(): void;
    private _revealComment;
}
