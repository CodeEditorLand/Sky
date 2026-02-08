import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IChatQuestionCarousel } from '../../../common/chatService/chatService.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import './media/chatQuestionCarousel.css';
export interface IChatQuestionCarouselOptions {
    onSubmit: (answers: Map<string, unknown> | undefined) => void;
    shouldAutoFocus?: boolean;
}
export declare class ChatQuestionCarouselPart extends Disposable implements IChatContentPart {
    private readonly carousel;
    private readonly _options;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private _currentIndex;
    private readonly _answers;
    private _questionContainer;
    private _closeButtonContainer;
    private _footerRow;
    private _stepIndicator;
    private _navigationButtons;
    private _prevButton;
    private _nextButton;
    private _skipAllButton;
    private _isSkipped;
    private readonly _textInputBoxes;
    private readonly _singleSelectItems;
    private readonly _multiSelectCheckboxes;
    private readonly _freeformTextareas;
    private readonly _inputBoxes;
    /**
     * Disposable store for interactive UI components (header, nav buttons, etc.)
     * that should be disposed when transitioning to summary view.
     */
    private readonly _interactiveUIStore;
    constructor(carousel: IChatQuestionCarousel, context: IChatContentPartRenderContext, _options: IChatQuestionCarouselOptions);
    /**
     * Saves the current question's answer to the answers map.
     */
    private saveCurrentAnswer;
    /**
     * Navigates the carousel by the given delta.
     * @param delta Negative for previous, positive for next
     */
    private navigate;
    /**
     * Handles the next/submit button action.
     * Either advances to the next question or submits.
     */
    private handleNext;
    /**
     * Hides the carousel UI and shows a summary of answers.
     */
    private hideAndShowSummary;
    /**
     * Clears and disposes all interactive UI resources (header, nav buttons, input boxes, etc.)
     * and resets references to disposed elements.
     */
    private clearInteractiveResources;
    /**
     * Skips the carousel with default values - called when user wants to proceed quickly.
     * Returns defaults for all questions.
     */
    skip(): boolean;
    /**
     * Ignores the carousel completely - called when user wants to dismiss without data.
     * Returns undefined to signal the carousel was ignored.
     */
    ignore(): boolean;
    /**
     * Collects default values for all questions in the carousel.
     */
    private getDefaultAnswers;
    /**
     * Gets the default answer for a specific question.
     */
    private getDefaultAnswerForQuestion;
    private renderCurrentQuestion;
    private renderInput;
    /**
     * Sets up auto-resize behavior for a textarea element.
     * @returns A function that triggers the resize manually (useful for initial sizing).
     */
    private setupTextareaAutoResize;
    private renderTextInput;
    private renderSingleSelect;
    private renderMultiSelect;
    private getCurrentAnswer;
    /**
     * Renders a "Skipped" message when the carousel is dismissed without answers.
     */
    private renderSkippedMessage;
    /**
     * Renders a summary of answers when the carousel is already used.
     */
    private renderSummary;
    /**
     * Formats an answer for display in the summary.
     */
    private formatAnswerForSummary;
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: {
        dispose(): void;
    }): void;
}
