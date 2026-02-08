import './media/chatEditingExplanationWidget.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../../../editor/browser/editorBrowser.js';
import { DetailedLineRangeMapping, LineRangeMapping } from '../../../../../editor/common/diff/rangeMapping.js';
import { URI } from '../../../../../base/common/uri.js';
import { IChatWidgetService } from '../chat.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IExplanationDiffInfo, IChatEditingExplanationModelManager } from './chatEditingExplanationModelManager.js';
/**
 * Widget that displays explanatory comments for chat-made changes
 * Positioned on the right side of the editor like a speech bubble
 */
export declare class ChatEditingExplanationWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private _changes;
    private readonly _chatWidgetService;
    private readonly _viewsService;
    private readonly _chatSessionResource?;
    private static _idPool;
    private readonly _id;
    private readonly _domNode;
    private readonly _headerNode;
    private readonly _readIndicator;
    private readonly _titleNode;
    private readonly _dismissButton;
    private readonly _toggleButton;
    private readonly _bodyNode;
    private readonly _explanationItems;
    private _position;
    private _explanations;
    private _isExpanded;
    private _isAllRead;
    private _disposed;
    private _startLineNumber;
    private readonly _uri;
    private readonly _rangeHighlightDecoration;
    private readonly _eventStore;
    constructor(_editor: ICodeEditor, _changes: readonly (LineRangeMapping | DetailedLineRangeMapping)[], diffInfo: IExplanationDiffInfo, _chatWidgetService: IChatWidgetService, _viewsService: IViewsService, _chatSessionResource?: URI | undefined);
    private _setupEventHandlers;
    private _toggleExpanded;
    private _dismiss;
    private _updateReadIndicator;
    private _updateTitle;
    private _updateToggleButton;
    private _buildExplanationItems;
    /**
     * Sets the explanation for a change matching the given line number range.
     * @returns true if a matching explanation was found and updated
     */
    setExplanationByLineNumber(startLineNumber: number, endLineNumber: number, explanation: string): boolean;
    /**
     * Gets the number of explanations in this widget.
     */
    get explanationCount(): number;
    private _updateExplanationText;
    private _updateItemReadIndicator;
    private _updateExplanationItemsReadState;
    /**
     * Updates the widget position and layout
     */
    layout(startLineNumber: number): void;
    /**
     * Shows or hides the widget
     */
    toggle(show: boolean): void;
    /**
     * Relayouts the widget at its current line number
     */
    relayout(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    dispose(): void;
}
/**
 * Manager for explanation widgets in an editor
 * Groups changes and creates combined widgets for nearby changes
 */
export declare class ChatEditingExplanationWidgetManager extends Disposable {
    private readonly _editor;
    private readonly _chatWidgetService;
    private readonly _viewsService;
    private readonly _modelUri;
    private readonly _widgets;
    private _visible;
    private _chatSessionResource;
    private _diffInfo;
    constructor(_editor: ICodeEditor, _chatWidgetService: IChatWidgetService, _viewsService: IViewsService, modelManager: IChatEditingExplanationModelManager, _modelUri: URI);
    private _createWidgets;
    private _handleExplanations;
    /**
     * Shows all widgets
     */
    show(): void;
    /**
     * Hides all widgets
     */
    hide(): void;
    private _clearWidgets;
    dispose(): void;
}
