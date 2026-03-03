import './media/agentFeedbackEditorWidget.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../../editor/browser/editorBrowser.js';
import { URI } from '../../../../base/common/uri.js';
import { IAgentFeedback, IAgentFeedbackService } from './agentFeedbackService.js';
/**
 * Widget that displays agent feedback comments for a group of nearby feedback items.
 * Positioned on the right side of the editor like a speech bubble.
 */
export declare class AgentFeedbackEditorWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly _feedbackItems;
    private readonly _agentFeedbackService;
    private readonly _sessionResource;
    private static _idPool;
    private readonly _id;
    private readonly _domNode;
    private readonly _headerNode;
    private readonly _titleNode;
    private readonly _dismissButton;
    private readonly _toggleButton;
    private readonly _bodyNode;
    private readonly _itemElements;
    private _position;
    private _isExpanded;
    private _disposed;
    private _startLineNumber;
    private readonly _rangeHighlightDecoration;
    private readonly _eventStore;
    constructor(_editor: ICodeEditor, _feedbackItems: readonly IAgentFeedback[], _agentFeedbackService: IAgentFeedbackService, _sessionResource: URI);
    private _setupEventHandlers;
    private _toggleExpanded;
    private _dismiss;
    private _updateTitle;
    private _updateToggleButton;
    private _buildFeedbackItems;
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
}
