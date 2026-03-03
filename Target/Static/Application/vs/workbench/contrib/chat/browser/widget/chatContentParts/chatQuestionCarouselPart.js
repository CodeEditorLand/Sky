var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import * as dom from "../../../../../../base/browser/dom.js";
import { renderAsPlaintext } from "../../../../../../base/browser/markdownRenderer.js";
import { StandardKeyboardEvent } from "../../../../../../base/browser/keyboardEvent.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { MarkdownString, isMarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { hasKey } from "../../../../../../base/common/types.js";
import { localize } from "../../../../../../nls.js";
import { IAccessibilityService } from "../../../../../../platform/accessibility/common/accessibility.js";
import { IMarkdownRendererService } from "../../../../../../platform/markdown/browser/markdownRenderer.js";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "../../../../../../platform/theme/browser/defaultStyles.js";
import { Button } from "../../../../../../base/browser/ui/button/button.js";
import { InputBox } from "../../../../../../base/browser/ui/inputbox/inputBox.js";
import { Checkbox } from "../../../../../../base/browser/ui/toggle/toggle.js";
import { isResponseVM } from "../../../common/model/chatViewModel.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import "./media/chatQuestionCarousel.css";
const PREVIOUS_QUESTION_ACTION_ID = "workbench.action.chat.previousQuestion";
const NEXT_QUESTION_ACTION_ID = "workbench.action.chat.nextQuestion";
let ChatQuestionCarouselPart = class ChatQuestionCarouselPart2 extends Disposable {
  static {
    __name(this, "ChatQuestionCarouselPart");
  }
  constructor(carousel, context, _options, _markdownRendererService, _hoverService, _accessibilityService, _contextKeyService, _keybindingService) {
    super();
    this.carousel = carousel;
    this._options = _options;
    this._markdownRendererService = _markdownRendererService;
    this._hoverService = _hoverService;
    this._accessibilityService = _accessibilityService;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._currentIndex = 0;
    this._answers = /* @__PURE__ */ new Map();
    this._nextButtonHover = this._register(new MutableDisposable());
    this._isSkipped = false;
    this._textInputBoxes = /* @__PURE__ */ new Map();
    this._singleSelectItems = /* @__PURE__ */ new Map();
    this._multiSelectCheckboxes = /* @__PURE__ */ new Map();
    this._freeformTextareas = /* @__PURE__ */ new Map();
    this._inputBoxes = this._register(new DisposableStore());
    this._questionRenderStore = this._register(new MutableDisposable());
    this._interactiveUIStore = this._register(new MutableDisposable());
    this.domNode = dom.$(".chat-question-carousel-container");
    this._inChatQuestionCarouselContextKey = ChatContextKeys.inChatQuestionCarousel.bindTo(this._contextKeyService);
    const focusTracker = this._register(dom.trackFocus(this.domNode));
    this._register(focusTracker.onDidFocus(() => this._inChatQuestionCarouselContextKey.set(true)));
    this._register(focusTracker.onDidBlur(() => this._inChatQuestionCarouselContextKey.set(false)));
    this._register({ dispose: /* @__PURE__ */ __name(() => this._inChatQuestionCarouselContextKey.reset(), "dispose") });
    this.domNode.tabIndex = 0;
    this.domNode.setAttribute("role", "region");
    this.domNode.setAttribute("aria-roledescription", localize("chat.questionCarousel.roleDescription", "chat question"));
    this._updateAriaLabel();
    if (carousel.data) {
      for (const [key, value] of Object.entries(carousel.data)) {
        this._answers.set(key, value);
      }
    }
    const responseIsComplete = isResponseVM(context.element) && context.element.isComplete;
    if (carousel.isUsed || responseIsComplete) {
      this._isSkipped = true;
      this.domNode.classList.add("chat-question-carousel-used");
      this.renderSummary();
      return;
    }
    const interactiveStore = new DisposableStore();
    this._interactiveUIStore.value = interactiveStore;
    this._questionContainer = dom.$(".chat-question-carousel-content");
    this.domNode.append(this._questionContainer);
    if (carousel.allowSkip) {
      this._closeButtonContainer = dom.$(".chat-question-close-container");
      const skipAllTitle = localize("chat.questionCarousel.skipAllTitle", "Skip all questions");
      const skipAllButton = interactiveStore.add(new Button(this._closeButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
      skipAllButton.label = `$(${Codicon.close.id})`;
      skipAllButton.element.classList.add("chat-question-nav-arrow", "chat-question-close");
      skipAllButton.element.setAttribute("aria-label", skipAllTitle);
      interactiveStore.add(this._hoverService.setupDelayedHover(skipAllButton.element, { content: skipAllTitle }));
      this._skipAllButton = skipAllButton;
    }
    this._footerRow = dom.$(".chat-question-footer-row");
    this._stepIndicator = dom.$(".chat-question-step-indicator");
    this._footerRow.appendChild(this._stepIndicator);
    this._navigationButtons = dom.$(".chat-question-carousel-nav");
    this._navigationButtons.setAttribute("role", "navigation");
    this._navigationButtons.setAttribute("aria-label", localize("chat.questionCarousel.navigation", "Question navigation"));
    const arrowsContainer = dom.$(".chat-question-nav-arrows");
    const previousLabel = localize("previous", "Previous");
    const previousLabelWithKeybinding = this.getLabelWithKeybinding(previousLabel, PREVIOUS_QUESTION_ACTION_ID);
    const prevButton = interactiveStore.add(new Button(arrowsContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    prevButton.element.classList.add("chat-question-nav-arrow", "chat-question-nav-prev");
    prevButton.label = `$(${Codicon.chevronLeft.id})`;
    prevButton.element.setAttribute("aria-label", previousLabelWithKeybinding);
    interactiveStore.add(this._hoverService.setupDelayedHover(prevButton.element, { content: previousLabelWithKeybinding }));
    this._prevButton = prevButton;
    const nextButton = interactiveStore.add(new Button(arrowsContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    nextButton.element.classList.add("chat-question-nav-arrow", "chat-question-nav-next");
    nextButton.label = `$(${Codicon.chevronRight.id})`;
    this._nextButton = nextButton;
    this._navigationButtons.appendChild(arrowsContainer);
    this._footerRow.appendChild(this._navigationButtons);
    this.domNode.append(this._footerRow);
    interactiveStore.add(prevButton.onDidClick(() => this.navigate(-1)));
    interactiveStore.add(nextButton.onDidClick(() => this.handleNext()));
    if (this._skipAllButton) {
      interactiveStore.add(this._skipAllButton.onDidClick(() => this.ignore()));
    }
    interactiveStore.add(dom.addDisposableListener(this.domNode, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 9 && this.carousel.allowSkip) {
        e.preventDefault();
        e.stopPropagation();
        this.ignore();
      } else if (event.keyCode === 3 && !event.shiftKey) {
        const target = e.target;
        const isTextInput = target.tagName === "INPUT" && target.type === "text";
        const isFreeformTextarea = target.tagName === "TEXTAREA" && target.classList.contains("chat-question-freeform-textarea");
        if (isTextInput || isFreeformTextarea) {
          e.preventDefault();
          e.stopPropagation();
          this.handleNext();
        }
      } else if ((event.ctrlKey || event.metaKey) && (event.keyCode === 1 || event.keyCode === 20)) {
        e.stopPropagation();
      }
    }));
    this.renderCurrentQuestion();
  }
  /**
   * Saves the current question's answer to the answers map.
   */
  saveCurrentAnswer() {
    const currentQuestion = this.carousel.questions[this._currentIndex];
    const answer = this.getCurrentAnswer();
    if (answer !== void 0) {
      this._answers.set(currentQuestion.id, answer);
    }
  }
  /**
   * Navigates the carousel by the given delta.
   * @param delta Negative for previous, positive for next
   */
  navigate(delta) {
    const newIndex = this._currentIndex + delta;
    if (newIndex >= 0 && newIndex < this.carousel.questions.length) {
      this.saveCurrentAnswer();
      this._currentIndex = newIndex;
      this.renderCurrentQuestion(true);
    }
  }
  /**
   * Handles the next/submit button action.
   * Either advances to the next question or submits.
   */
  handleNext() {
    this.saveCurrentAnswer();
    if (this._currentIndex < this.carousel.questions.length - 1) {
      this._currentIndex++;
      this.renderCurrentQuestion(true);
    } else {
      this._options.onSubmit(this._answers);
      this.hideAndShowSummary();
    }
  }
  /**
   * Focuses the container element and announces the question for screen reader users.
   */
  _focusContainerAndAnnounce() {
    this.domNode.focus();
    const question = this.carousel.questions[this._currentIndex];
    if (question) {
      const questionText = question.message ?? question.title;
      const messageContent = this.getQuestionText(questionText);
      const questionCount = this.carousel.questions.length;
      const alertMessage = questionCount === 1 ? messageContent : localize("chat.questionCarousel.questionAlertMulti", "Question {0} of {1}: {2}", this._currentIndex + 1, questionCount, messageContent);
      this._accessibilityService.alert(alertMessage);
    }
  }
  /**
   * Hides the carousel UI and shows a summary of answers.
   */
  hideAndShowSummary() {
    this._isSkipped = true;
    this.domNode.classList.add("chat-question-carousel-used");
    this.clearInteractiveResources();
    dom.clearNode(this.domNode);
    this.renderSummary();
    this._onDidChangeHeight.fire();
  }
  /**
   * Clears and disposes all interactive UI resources (header, nav buttons, input boxes, etc.)
   * and resets references to disposed elements.
   */
  clearInteractiveResources() {
    this._interactiveUIStore.clear();
    this._questionRenderStore.clear();
    this._inputBoxes.clear();
    this._textInputBoxes.clear();
    this._singleSelectItems.clear();
    this._multiSelectCheckboxes.clear();
    this._freeformTextareas.clear();
    this._prevButton = void 0;
    this._nextButton = void 0;
    this._skipAllButton = void 0;
    this._questionContainer = void 0;
    this._navigationButtons = void 0;
    this._closeButtonContainer = void 0;
    this._footerRow = void 0;
    this._stepIndicator = void 0;
  }
  /**
   * Skips the carousel with default values - called when user wants to proceed quickly.
   * Returns defaults for all questions.
   */
  skip() {
    if (this._isSkipped || !this.carousel.allowSkip) {
      return false;
    }
    const defaults = this.getDefaultAnswers();
    this._options.onSubmit(defaults);
    this._answers.clear();
    for (const [key, value] of defaults) {
      this._answers.set(key, value);
    }
    this.hideAndShowSummary();
    return true;
  }
  /**
   * Ignores the carousel completely - called when user wants to dismiss without data.
   * Returns undefined to signal the carousel was ignored.
   */
  ignore() {
    if (this._isSkipped || !this.carousel.allowSkip) {
      return false;
    }
    this._isSkipped = true;
    this._options.onSubmit(void 0);
    this.clearInteractiveResources();
    this.domNode.classList.add("chat-question-carousel-used");
    dom.clearNode(this.domNode);
    this.renderSkippedMessage();
    this._onDidChangeHeight.fire();
    return true;
  }
  /**
   * Collects default values for all questions in the carousel.
   */
  getDefaultAnswers() {
    const answers = /* @__PURE__ */ new Map();
    for (const question of this.carousel.questions) {
      const defaultAnswer = this.getDefaultAnswerForQuestion(question);
      if (defaultAnswer !== void 0) {
        answers.set(question.id, defaultAnswer);
      }
    }
    return answers;
  }
  /**
   * Gets the default answer for a specific question.
   */
  getDefaultAnswerForQuestion(question) {
    switch (question.type) {
      case "text":
        return question.defaultValue;
      case "singleSelect": {
        const defaultOptionId = typeof question.defaultValue === "string" ? question.defaultValue : void 0;
        const defaultOption = defaultOptionId !== void 0 ? question.options?.find((opt) => opt.id === defaultOptionId) : void 0;
        const selectedValue = defaultOption?.value;
        return selectedValue !== void 0 ? { selectedValue, freeformValue: void 0 } : void 0;
      }
      case "multiSelect": {
        const defaultIds = Array.isArray(question.defaultValue) ? question.defaultValue : typeof question.defaultValue === "string" ? [question.defaultValue] : [];
        const selectedValues = question.options?.filter((opt) => defaultIds.includes(opt.id)).map((opt) => opt.value).filter((v) => v !== void 0) ?? [];
        return selectedValues.length > 0 ? { selectedValues, freeformValue: void 0 } : void 0;
      }
      default:
        return question.defaultValue;
    }
  }
  /**
   * Returns whether auto-focus should be enabled.
   * Disabled when screen reader mode is active or when explicitly disabled via options.
   */
  _shouldAutoFocus() {
    if (this._options.shouldAutoFocus === false) {
      return false;
    }
    return !this._accessibilityService.isScreenReaderOptimized();
  }
  /**
   * Updates the aria-label of the carousel container based on the current question.
   */
  _updateAriaLabel() {
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      this.domNode.setAttribute("aria-label", localize("chat.questionCarousel.label", "Chat question"));
      return;
    }
    const questionText = question.message ?? question.title;
    const messageContent = this.getQuestionText(questionText);
    const questionCount = this.carousel.questions.length;
    if (questionCount === 1) {
      this.domNode.setAttribute("aria-label", localize("chat.questionCarousel.singleQuestionLabel", "Chat question: {0}", messageContent));
    } else {
      this.domNode.setAttribute("aria-label", localize("chat.questionCarousel.multiQuestionLabel", "Chat question {0} of {1}: {2}", this._currentIndex + 1, questionCount, messageContent));
    }
  }
  /**
   * Focuses the carousel container element.
   */
  focus() {
    this.domNode.focus();
  }
  /**
   * Returns whether the carousel container has focus.
   */
  hasFocus() {
    return dom.isAncestorOfActiveElement(this.domNode);
  }
  navigateToPreviousQuestion() {
    if (this._currentIndex <= 0) {
      return false;
    }
    this.navigate(-1);
    return true;
  }
  navigateToNextQuestion() {
    if (this._currentIndex >= this.carousel.questions.length - 1) {
      return false;
    }
    this.navigate(1);
    return true;
  }
  renderCurrentQuestion(focusContainerForScreenReader = false) {
    if (!this._questionContainer || !this._prevButton || !this._nextButton) {
      return;
    }
    const questionRenderStore = new DisposableStore();
    this._questionRenderStore.value = questionRenderStore;
    this._inputBoxes.clear();
    this._textInputBoxes.clear();
    this._singleSelectItems.clear();
    this._multiSelectCheckboxes.clear();
    this._freeformTextareas.clear();
    dom.clearNode(this._questionContainer);
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      return;
    }
    const headerRow = dom.$(".chat-question-header-row");
    const questionText = question.message ?? question.title;
    if (questionText) {
      const title = dom.$(".chat-question-title");
      const messageContent = this.getQuestionText(questionText);
      title.setAttribute("aria-label", messageContent);
      if (question.message !== void 0) {
        const messageMd = isMarkdownString(questionText) ? MarkdownString.lift(questionText) : new MarkdownString(questionText);
        const renderedTitle = questionRenderStore.add(this._markdownRendererService.render(messageMd));
        title.appendChild(renderedTitle.element);
      } else {
        const parenMatch = messageContent.match(/^(.+?)\s*(\([^)]+\))\s*$/);
        if (parenMatch) {
          const mainTitle = dom.$("span.chat-question-title-main");
          mainTitle.textContent = parenMatch[1];
          title.appendChild(mainTitle);
          const subtitle = dom.$("span.chat-question-title-subtitle");
          subtitle.textContent = " " + parenMatch[2];
          title.appendChild(subtitle);
        } else {
          title.textContent = messageContent;
        }
      }
      headerRow.appendChild(title);
    }
    if (this._closeButtonContainer) {
      headerRow.appendChild(this._closeButtonContainer);
    }
    this._questionContainer.appendChild(headerRow);
    const isSingleQuestion = this.carousel.questions.length === 1;
    if (this._stepIndicator) {
      this._stepIndicator.textContent = `${this._currentIndex + 1}/${this.carousel.questions.length}`;
      this._stepIndicator.style.display = isSingleQuestion ? "none" : "";
    }
    const inputContainer = dom.$(".chat-question-input-container");
    this.renderInput(inputContainer, question);
    this._questionContainer.appendChild(inputContainer);
    this._prevButton.enabled = this._currentIndex > 0;
    this._prevButton.element.style.display = isSingleQuestion ? "none" : "";
    const isLastQuestion = this._currentIndex === this.carousel.questions.length - 1;
    const submitLabel = localize("submit", "Submit");
    const nextLabel = localize("next", "Next");
    const nextLabelWithKeybinding = this.getLabelWithKeybinding(nextLabel, NEXT_QUESTION_ACTION_ID);
    if (isLastQuestion) {
      this._nextButton.label = submitLabel;
      this._nextButton.element.setAttribute("aria-label", submitLabel);
      this._nextButton.element.classList.add("chat-question-nav-submit");
      this._nextButtonHover.value = this._hoverService.setupDelayedHover(this._nextButton.element, { content: submitLabel });
    } else {
      this._nextButton.label = `$(${Codicon.chevronRight.id})`;
      this._nextButton.element.setAttribute("aria-label", nextLabelWithKeybinding);
      this._nextButton.element.classList.remove("chat-question-nav-submit");
      this._nextButtonHover.value = this._hoverService.setupDelayedHover(this._nextButton.element, { content: nextLabelWithKeybinding });
    }
    this._updateAriaLabel();
    if (focusContainerForScreenReader && this._accessibilityService.isScreenReaderOptimized()) {
      this._focusContainerAndAnnounce();
    }
    this._onDidChangeHeight.fire();
  }
  getLabelWithKeybinding(label, actionId) {
    const keybindingLabel = this._keybindingService.lookupKeybinding(actionId, this._contextKeyService)?.getLabel();
    return keybindingLabel ? localize("chat.questionCarousel.labelWithKeybinding", "{0} ({1})", label, keybindingLabel) : label;
  }
  renderInput(container, question) {
    switch (question.type) {
      case "text":
        this.renderTextInput(container, question);
        break;
      case "singleSelect":
        this.renderSingleSelect(container, question);
        break;
      case "multiSelect":
        this.renderMultiSelect(container, question);
        break;
    }
  }
  /**
   * Sets up auto-resize behavior for a textarea element.
   * @returns A function that triggers the resize manually (useful for initial sizing).
   */
  setupTextareaAutoResize(textarea) {
    const autoResize = /* @__PURE__ */ __name(() => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      this._onDidChangeHeight.fire();
    }, "autoResize");
    this._inputBoxes.add(dom.addDisposableListener(textarea, dom.EventType.INPUT, autoResize));
    return autoResize;
  }
  renderTextInput(container, question) {
    const inputBox = this._inputBoxes.add(new InputBox(container, void 0, {
      placeholder: localize("chat.questionCarousel.enterText", "Enter your answer"),
      inputBoxStyles: defaultInputBoxStyles
    }));
    const previousAnswer = this._answers.get(question.id);
    if (previousAnswer !== void 0) {
      inputBox.value = String(previousAnswer);
    } else if (question.defaultValue !== void 0) {
      inputBox.value = String(question.defaultValue);
    }
    this._textInputBoxes.set(question.id, inputBox);
    if (this._shouldAutoFocus()) {
      this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(inputBox.element), () => inputBox.focus()));
    }
  }
  renderSingleSelect(container, question) {
    const options = question.options || [];
    const selectContainer = dom.$(".chat-question-list");
    selectContainer.setAttribute("role", "listbox");
    selectContainer.setAttribute("aria-label", question.title);
    selectContainer.tabIndex = 0;
    container.appendChild(selectContainer);
    const previousAnswer = this._answers.get(question.id);
    const previousFreeform = typeof previousAnswer === "object" && previousAnswer !== null && hasKey(previousAnswer, { freeformValue: true }) ? previousAnswer.freeformValue : void 0;
    const previousSelectedValue = typeof previousAnswer === "object" && previousAnswer !== null && hasKey(previousAnswer, { selectedValue: true }) ? previousAnswer.selectedValue : previousAnswer;
    const defaultOptionId = typeof question.defaultValue === "string" ? question.defaultValue : void 0;
    let selectedIndex = -1;
    options.forEach((option, index) => {
      if (previousSelectedValue !== void 0 && option.value === previousSelectedValue) {
        selectedIndex = index;
      } else if (selectedIndex === -1 && !previousFreeform && defaultOptionId !== void 0 && option.id === defaultOptionId) {
        selectedIndex = index;
      }
    });
    const listItems = [];
    const indicators = [];
    const updateSelection = /* @__PURE__ */ __name((newIndex) => {
      listItems.forEach((item, i) => {
        const isSelected = i === newIndex;
        item.classList.toggle("selected", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
        const indicator = indicators[i];
        indicator.classList.toggle("codicon", isSelected);
        indicator.classList.toggle("codicon-check", isSelected);
      });
      if (newIndex >= 0 && newIndex < listItems.length) {
        selectContainer.setAttribute("aria-activedescendant", listItems[newIndex].id);
      }
      const data = this._singleSelectItems.get(question.id);
      if (data) {
        data.selectedIndex = newIndex;
      }
    }, "updateSelection");
    options.forEach((option, index) => {
      const isSelected = index === selectedIndex;
      const listItem = dom.$(".chat-question-list-item");
      listItem.setAttribute("role", "option");
      listItem.setAttribute("aria-selected", String(isSelected));
      listItem.setAttribute("aria-label", localize("chat.questionCarousel.optionLabel", "Option {0}: {1}", index + 1, option.label));
      listItem.id = `option-${question.id}-${index}`;
      listItem.tabIndex = -1;
      const number = dom.$(".chat-question-list-number");
      number.textContent = `${index + 1}`;
      listItem.appendChild(number);
      const indicator = dom.$(".chat-question-list-indicator");
      if (isSelected) {
        indicator.classList.add("codicon", "codicon-check");
      }
      indicators.push(indicator);
      const label = dom.$(".chat-question-list-label");
      const separatorIndex = option.label.indexOf(" - ");
      if (separatorIndex !== -1) {
        const titleSpan = dom.$("span.chat-question-list-label-title");
        titleSpan.textContent = option.label.substring(0, separatorIndex);
        label.appendChild(titleSpan);
        const descSpan = dom.$("span.chat-question-list-label-desc");
        descSpan.textContent = ": " + option.label.substring(separatorIndex + 3);
        label.appendChild(descSpan);
      } else {
        label.textContent = option.label;
      }
      listItem.appendChild(label);
      listItem.appendChild(indicator);
      if (isSelected) {
        listItem.classList.add("selected");
      }
      this._inputBoxes.add(dom.addDisposableListener(listItem, dom.EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateSelection(index);
        const freeform = this._freeformTextareas.get(question.id);
        if (freeform) {
          freeform.value = "";
        }
        this.handleNext();
      }));
      this._inputBoxes.add(this._hoverService.setupDelayedHover(listItem, {
        content: option.label,
        position: {
          hoverPosition: 2
          /* HoverPosition.BELOW */
        },
        appearance: { showPointer: true }
      }));
      selectContainer.appendChild(listItem);
      listItems.push(listItem);
    });
    this._singleSelectItems.set(question.id, { items: listItems, selectedIndex });
    if (selectedIndex >= 0 && selectedIndex < listItems.length) {
      selectContainer.setAttribute("aria-activedescendant", listItems[selectedIndex].id);
    }
    const freeformContainer = dom.$(".chat-question-freeform");
    const freeformNumber = dom.$(".chat-question-freeform-number");
    freeformNumber.textContent = `${options.length + 1}`;
    freeformContainer.appendChild(freeformNumber);
    const freeformTextarea = dom.$("textarea.chat-question-freeform-textarea");
    freeformTextarea.placeholder = localize("chat.questionCarousel.enterCustomAnswer", "Enter custom answer");
    freeformTextarea.rows = 1;
    if (previousFreeform !== void 0) {
      freeformTextarea.value = previousFreeform;
    }
    const autoResize = this.setupTextareaAutoResize(freeformTextarea);
    this._inputBoxes.add(dom.addDisposableListener(freeformTextarea, dom.EventType.INPUT, () => {
      if (freeformTextarea.value.length > 0) {
        updateSelection(-1);
      }
    }));
    freeformContainer.appendChild(freeformTextarea);
    container.appendChild(freeformContainer);
    this._freeformTextareas.set(question.id, freeformTextarea);
    this._inputBoxes.add(dom.addDisposableListener(selectContainer, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      const data = this._singleSelectItems.get(question.id);
      if (!data || !listItems.length) {
        return;
      }
      let newIndex = data.selectedIndex;
      if (event.keyCode === 18) {
        e.preventDefault();
        newIndex = Math.min(data.selectedIndex + 1, listItems.length - 1);
      } else if (event.keyCode === 16) {
        e.preventDefault();
        newIndex = Math.max(data.selectedIndex - 1, 0);
      } else if (event.keyCode === 3 || event.keyCode === 10) {
        e.preventDefault();
        e.stopPropagation();
        this.handleNext();
        return;
      } else if (event.keyCode >= 22 && event.keyCode <= 30) {
        const numberIndex = event.keyCode - 22;
        if (numberIndex < listItems.length) {
          e.preventDefault();
          updateSelection(numberIndex);
        } else if (numberIndex === listItems.length) {
          e.preventDefault();
          updateSelection(-1);
          freeformTextarea.focus();
        }
        return;
      }
      if (newIndex !== data.selectedIndex && newIndex >= 0) {
        updateSelection(newIndex);
      }
    }));
    if (previousFreeform !== void 0) {
      this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(freeformTextarea), () => autoResize()));
    }
    if (this._shouldAutoFocus()) {
      if (previousFreeform) {
        this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(freeformTextarea), () => {
          freeformTextarea.focus();
        }));
      } else if (listItems.length > 0) {
        const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
        if (selectedIndex < 0) {
          updateSelection(0);
        }
        this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(selectContainer), () => {
          listItems[focusIndex]?.focus();
        }));
      }
    }
  }
  renderMultiSelect(container, question) {
    const options = question.options || [];
    const selectContainer = dom.$(".chat-question-list");
    selectContainer.setAttribute("role", "listbox");
    selectContainer.setAttribute("aria-multiselectable", "true");
    selectContainer.setAttribute("aria-label", question.title);
    selectContainer.tabIndex = 0;
    container.appendChild(selectContainer);
    const previousAnswer = this._answers.get(question.id);
    const previousFreeform = typeof previousAnswer === "object" && previousAnswer !== null && hasKey(previousAnswer, { freeformValue: true }) ? previousAnswer.freeformValue : void 0;
    const previousSelectedValues = typeof previousAnswer === "object" && previousAnswer !== null && hasKey(previousAnswer, { selectedValues: true }) ? previousAnswer.selectedValues : Array.isArray(previousAnswer) ? previousAnswer : [];
    const defaultOptionIds = Array.isArray(question.defaultValue) ? question.defaultValue : typeof question.defaultValue === "string" ? [question.defaultValue] : [];
    const checkboxes = [];
    const listItems = [];
    let focusedIndex = 0;
    let firstCheckedIndex = -1;
    options.forEach((option, index) => {
      let isChecked = false;
      if (previousSelectedValues && previousSelectedValues.length > 0) {
        isChecked = previousSelectedValues.includes(option.value);
      } else if (!previousFreeform && defaultOptionIds.includes(option.id)) {
        isChecked = true;
      }
      const listItem = dom.$(".chat-question-list-item.multi-select");
      listItem.setAttribute("role", "option");
      listItem.setAttribute("aria-selected", String(isChecked));
      listItem.setAttribute("aria-label", localize("chat.questionCarousel.optionLabel", "Option {0}: {1}", index + 1, option.label));
      listItem.id = `option-${question.id}-${index}`;
      listItem.tabIndex = -1;
      const number = dom.$(".chat-question-list-number");
      number.textContent = `${index + 1}`;
      listItem.appendChild(number);
      const checkbox = this._inputBoxes.add(new Checkbox(option.label, isChecked, defaultCheckboxStyles));
      checkbox.domNode.classList.add("chat-question-list-checkbox");
      checkbox.domNode.tabIndex = -1;
      listItem.appendChild(checkbox.domNode);
      const label = dom.$(".chat-question-list-label");
      const separatorIndex = option.label.indexOf(" - ");
      if (separatorIndex !== -1) {
        const titleSpan = dom.$("span.chat-question-list-label-title");
        titleSpan.textContent = option.label.substring(0, separatorIndex);
        label.appendChild(titleSpan);
        const descSpan = dom.$("span.chat-question-list-label-desc");
        descSpan.textContent = ": " + option.label.substring(separatorIndex + 3);
        label.appendChild(descSpan);
      } else {
        label.textContent = option.label;
      }
      listItem.appendChild(label);
      if (isChecked) {
        listItem.classList.add("checked");
        if (firstCheckedIndex === -1) {
          firstCheckedIndex = index;
        }
      }
      this._inputBoxes.add(checkbox.onChange(() => {
        listItem.classList.toggle("checked", checkbox.checked);
        listItem.setAttribute("aria-selected", String(checkbox.checked));
      }));
      this._inputBoxes.add(dom.addDisposableListener(listItem, dom.EventType.CLICK, (e) => {
        focusedIndex = index;
        if (e.target !== checkbox.domNode && !checkbox.domNode.contains(e.target)) {
          checkbox.domNode.click();
        }
      }));
      this._inputBoxes.add(this._hoverService.setupDelayedHover(listItem, {
        content: option.label,
        position: {
          hoverPosition: 2
          /* HoverPosition.BELOW */
        },
        appearance: { showPointer: true }
      }));
      selectContainer.appendChild(listItem);
      checkboxes.push(checkbox);
      listItems.push(listItem);
    });
    this._multiSelectCheckboxes.set(question.id, checkboxes);
    const freeformContainer = dom.$(".chat-question-freeform");
    const freeformNumber = dom.$(".chat-question-freeform-number");
    freeformNumber.textContent = `${options.length + 1}`;
    freeformContainer.appendChild(freeformNumber);
    const freeformTextarea = dom.$("textarea.chat-question-freeform-textarea");
    freeformTextarea.placeholder = localize("chat.questionCarousel.enterCustomAnswer", "Enter custom answer");
    freeformTextarea.rows = 1;
    if (previousFreeform !== void 0) {
      freeformTextarea.value = previousFreeform;
    }
    const autoResize = this.setupTextareaAutoResize(freeformTextarea);
    freeformContainer.appendChild(freeformTextarea);
    container.appendChild(freeformContainer);
    this._freeformTextareas.set(question.id, freeformTextarea);
    this._inputBoxes.add(dom.addDisposableListener(selectContainer, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (!listItems.length) {
        return;
      }
      if (event.keyCode === 18) {
        e.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, listItems.length - 1);
        listItems[focusedIndex].focus();
      } else if (event.keyCode === 16) {
        e.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        listItems[focusedIndex].focus();
      } else if (event.keyCode === 3) {
        e.preventDefault();
        e.stopPropagation();
        this.handleNext();
      } else if (event.keyCode === 10) {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < checkboxes.length) {
          checkboxes[focusedIndex].domNode.click();
        }
      } else if (event.keyCode >= 22 && event.keyCode <= 30) {
        const numberIndex = event.keyCode - 22;
        if (numberIndex < checkboxes.length) {
          e.preventDefault();
          checkboxes[numberIndex].domNode.click();
        } else if (numberIndex === checkboxes.length) {
          e.preventDefault();
          freeformTextarea.focus();
        }
      }
    }));
    if (previousFreeform !== void 0) {
      this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(freeformTextarea), () => autoResize()));
    }
    if (this._shouldAutoFocus()) {
      if (previousFreeform) {
        this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(freeformTextarea), () => {
          freeformTextarea.focus();
        }));
      } else if (listItems.length > 0) {
        const initialFocusIndex = firstCheckedIndex >= 0 ? firstCheckedIndex : 0;
        focusedIndex = initialFocusIndex;
        this._inputBoxes.add(dom.runAtThisOrScheduleAtNextAnimationFrame(dom.getWindow(selectContainer), () => {
          listItems[initialFocusIndex]?.focus();
        }));
      }
    }
  }
  getCurrentAnswer() {
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      return void 0;
    }
    switch (question.type) {
      case "text": {
        const inputBox = this._textInputBoxes.get(question.id);
        return inputBox?.value ?? question.defaultValue;
      }
      case "singleSelect": {
        const data = this._singleSelectItems.get(question.id);
        let selectedValue = void 0;
        if (data && data.selectedIndex >= 0) {
          selectedValue = question.options?.[data.selectedIndex]?.value;
        }
        if (selectedValue === void 0 && typeof question.defaultValue === "string") {
          const defaultOption = question.options?.find((opt) => opt.id === question.defaultValue);
          selectedValue = defaultOption?.value;
        }
        const freeformTextarea = this._freeformTextareas.get(question.id);
        const freeformValue = freeformTextarea?.value !== "" ? freeformTextarea?.value : void 0;
        if (freeformValue) {
          return { selectedValue: void 0, freeformValue };
        }
        if (selectedValue !== void 0) {
          return { selectedValue, freeformValue: void 0 };
        }
        return void 0;
      }
      case "multiSelect": {
        const checkboxes = this._multiSelectCheckboxes.get(question.id);
        const selectedValues = [];
        if (checkboxes) {
          checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked) {
              const value = question.options?.[index]?.value;
              if (value !== void 0) {
                selectedValues.push(value);
              }
            }
          });
        }
        const freeformTextarea = this._freeformTextareas.get(question.id);
        const freeformValue = freeformTextarea?.value !== "" ? freeformTextarea?.value : void 0;
        if (freeformValue || selectedValues.length > 0) {
          return { selectedValues, freeformValue };
        }
        return void 0;
      }
      default:
        return question.defaultValue;
    }
  }
  /**
   * Renders a "Skipped" message when the carousel is dismissed without answers.
   */
  renderSkippedMessage() {
    const skippedContainer = dom.$(".chat-question-carousel-summary");
    const skippedMessage = dom.$(".chat-question-summary-skipped");
    skippedMessage.textContent = localize("chat.questionCarousel.skipped", "Skipped");
    skippedContainer.appendChild(skippedMessage);
    this.domNode.appendChild(skippedContainer);
  }
  /**
   * Renders a summary of answers when the carousel is already used.
   */
  renderSummary() {
    if (this._answers.size === 0) {
      if (this.carousel.isUsed) {
        this.renderSkippedMessage();
      }
      return;
    }
    const summaryContainer = dom.$(".chat-question-carousel-summary");
    for (const question of this.carousel.questions) {
      const answer = this._answers.get(question.id);
      if (answer === void 0) {
        continue;
      }
      const summaryItem = dom.$(".chat-question-summary-item");
      const questionLabel = dom.$("span.chat-question-summary-label");
      const questionText = question.message ?? question.title;
      let labelText = typeof questionText === "string" ? questionText : questionText.value;
      labelText = labelText.replace(/[:\s]+$/, "");
      questionLabel.textContent = labelText;
      summaryItem.appendChild(questionLabel);
      const formattedAnswer = this.formatAnswerForSummary(question, answer);
      const separatorIndex = formattedAnswer.indexOf(" - ");
      if (separatorIndex !== -1) {
        const answerTitle = dom.$("span.chat-question-summary-answer-title");
        answerTitle.textContent = formattedAnswer.substring(0, separatorIndex);
        summaryItem.appendChild(answerTitle);
        const answerDesc = dom.$("span.chat-question-summary-answer-desc");
        answerDesc.textContent = " - " + formattedAnswer.substring(separatorIndex + 3);
        summaryItem.appendChild(answerDesc);
      } else {
        const answerValue = dom.$("span.chat-question-summary-answer-title");
        answerValue.textContent = formattedAnswer;
        summaryItem.appendChild(answerValue);
      }
      summaryContainer.appendChild(summaryItem);
    }
    this.domNode.appendChild(summaryContainer);
  }
  /**
   * Formats an answer for display in the summary.
   */
  formatAnswerForSummary(question, answer) {
    switch (question.type) {
      case "text":
        return String(answer);
      case "singleSelect": {
        if (typeof answer === "object" && answer !== null && hasKey(answer, { selectedValue: true })) {
          const { selectedValue, freeformValue } = answer;
          const selectedLabel = question.options?.find((opt) => opt.value === selectedValue)?.label;
          if (freeformValue) {
            return freeformValue;
          }
          return selectedLabel ?? String(selectedValue ?? "");
        }
        const label = question.options?.find((opt) => opt.value === answer)?.label;
        return label ?? String(answer);
      }
      case "multiSelect": {
        if (typeof answer === "object" && answer !== null && hasKey(answer, { selectedValues: true })) {
          const { selectedValues, freeformValue } = answer;
          const labels = (selectedValues ?? []).map((v) => question.options?.find((opt) => opt.value === v)?.label ?? String(v));
          if (freeformValue) {
            labels.push(freeformValue);
          }
          return labels.join(localize("chat.questionCarousel.listSeparator", ", "));
        }
        if (Array.isArray(answer)) {
          return answer.map((v) => question.options?.find((opt) => opt.value === v)?.label ?? String(v)).join(localize("chat.questionCarousel.listSeparator", ", "));
        }
        return String(answer);
      }
      default:
        return String(answer);
    }
  }
  getQuestionText(questionText) {
    const md = typeof questionText === "string" ? new MarkdownString(questionText) : questionText;
    return renderAsPlaintext(md);
  }
  hasSameContent(other, _followingContent, element) {
    if (!this._isSkipped && !this.carousel.isUsed && isResponseVM(element) && element.isComplete) {
      return false;
    }
    return other.kind === "questionCarousel" && other === this.carousel;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatQuestionCarouselPart = __decorate([
  __param(3, IMarkdownRendererService),
  __param(4, IHoverService),
  __param(5, IAccessibilityService),
  __param(6, IContextKeyService),
  __param(7, IKeybindingService)
], ChatQuestionCarouselPart);
export {
  ChatQuestionCarouselPart
};
//# sourceMappingURL=chatQuestionCarouselPart.js.map
