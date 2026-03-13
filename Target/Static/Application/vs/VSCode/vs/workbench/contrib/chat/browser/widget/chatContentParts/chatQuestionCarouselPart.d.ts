import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { IMarkdownRendererService } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatQuestionCarousel, IChatQuestionAnswerValue } from '../../../common/chatService/chatService.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import './media/chatQuestionCarousel.css';
export interface IChatQuestionCarouselOptions {
    onSubmit: (answers: Map<string, IChatQuestionAnswerValue> | undefined) => void;
    shouldAutoFocus?: boolean;
}
export declare class ChatQuestionCarouselPart extends Disposable implements IChatContentPart {
    readonly carousel: IChatQuestionCarousel;
    private readonly _options;
    private readonly _markdownRendererService;
    private readonly _hoverService;
    private readonly _accessibilityService;
    private readonly _contextKeyService;
    private readonly _keybindingService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private _currentIndex;
    private readonly _answers;
    private _questionContainer;
    private _closeButtonContainer;
    private _footerRow;
    private _stepIndicator;
    private _submitHint;
    private _submitButton;
    private _prevButton;
    private _nextButton;
    private _skipAllButton;
    private _isSkipped;
    private readonly _textInputBoxes;
    private readonly _singleSelectItems;
    private readonly _multiSelectCheckboxes;
    private readonly _freeformTextareas;
    private readonly _inputBoxes;
    private readonly _questionRenderStore;
    private _inputScrollable;
    /**
     * Disposable store for interactive UI components (header, nav buttons, etc.)
     * that should be disposed when transitioning to summary view.
     */
    private readonly _interactiveUIStore;
    private readonly _inChatQuestionCarouselContextKey;
    private _validationMessageElement;
    private _currentValidationError;
    constructor(carousel: IChatQuestionCarousel, context: IChatContentPartRenderContext, _options: IChatQuestionCarouselOptions, _markdownRendererService: IMarkdownRendererService, _hoverService: IHoverService, _accessibilityService: IAccessibilityService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService);
    /**
     * Saves the current question's answer to the answers map.
     */
    private saveCurrentAnswer;
    private persistDraftState;
    /**
     * Navigates the carousel by the given delta.
     * @param delta Negative for previous, positive for next
     */
    private navigate;
    /**
     * Handles the next/submit behavior for keyboard and option selection flows.
     * Either advances to the next question or submits when on the last question.
     */
    private handleNextOrSubmit;
    /**
     * Handles explicit submit action from the dedicated submit button.
     */
    private submit;
    /**
     * Focuses the container element and announces the question for screen reader users.
     */
    private _focusContainerAndAnnounce;
    /**
     * Hides the carousel UI and shows a summary of answers.
     */
    private hideAndShowSummary;
    /**
     * Clears and disposes all interactive UI resources (header, nav buttons, input boxes, etc.)
     * and resets references to disposed elements.
     */
    private clearInteractiveResources;
    private layoutInputScrollable;
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
    /**
     * Returns whether auto-focus should be enabled.
     * Disabled when screen reader mode is active or when explicitly disabled via options.
     */
    private _shouldAutoFocus;
    /**
     * Updates the aria-label of the carousel container based on the current question.
     */
    private _updateAriaLabel;
    /**
     * Focuses the carousel container element.
     */
    focus(): void;
    /**
     * Returns whether the carousel container has focus.
     */
    hasFocus(): boolean;
    navigateToPreviousQuestion(): boolean;
    navigateToNextQuestion(): boolean;
    private renderCurrentQuestion;
    /**
     * Renders or updates the persistent footer with nav arrows, step indicator, and submit button.
     */
    private renderFooter;
    /**
     * Updates the footer nav button enabled state and step indicator text.
     */
    private updateFooterState;
    /**
     * Renders a simplified footer with just a submit button for single-question multi-select carousels.
     */
    private renderSingleQuestionFooter;
    private getLabelWithKeybinding;
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
    private getQuestionText;
    /**
     * Validates the current question's answer against its validation rules.
     * Returns true if valid, false if validation errors were shown.
     */
    private validateCurrentQuestion;
    /**
     * Validates that all required questions have been answered.
     * Returns true if all required fields are satisfied.
     */
    private validateRequiredFields;
    /**
     * Returns a validation error message for the given value, or undefined if valid.
     */
    private getValidationError;
    private showValidationError;
    private clearValidationError;
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
    addDisposable(disposable: {
        dispose(): void;
    }): void;
    dispose(): void;
}
