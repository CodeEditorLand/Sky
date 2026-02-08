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
import { $, clearNode, getWindow, hide, scheduleAtNextAnimationFrame } from "../../../../../../base/browser/dom.js";
import { alert } from "../../../../../../base/browser/ui/aria/aria.js";
import { DomScrollableElement } from "../../../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { IChatToolInvocation } from "../../../common/chatService/chatService.js";
import { ChatConfiguration, ThinkingDisplayMode } from "../../../common/constants.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { extractCodeblockUrisFromText } from "../../../common/widget/annotations.js";
import { basename } from "../../../../../../base/common/resources.js";
import { ChatCollapsibleContentPart } from "./chatCollapsibleContentPart.js";
import { localize } from "../../../../../../nls.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { DisposableMap, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { CancellationTokenSource } from "../../../../../../base/common/cancellation.js";
import { IChatMarkdownAnchorService } from "./chatMarkdownAnchorService.js";
import { ILanguageModelsService } from "../../../common/languageModels.js";
import { ExtensionIdentifier } from "../../../../../../platform/extensions/common/extensions.js";
import "./media/chatThinkingContent.css";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
function extractTextFromPart(content) {
  const raw = Array.isArray(content.value) ? content.value.join("") : content.value || "";
  return raw.trim();
}
__name(extractTextFromPart, "extractTextFromPart");
function getToolInvocationIcon(toolId) {
  const lowerToolId = toolId.toLowerCase();
  if (lowerToolId.includes("search") || lowerToolId.includes("grep") || lowerToolId.includes("find") || lowerToolId.includes("list") || lowerToolId.includes("semantic") || lowerToolId.includes("changes") || lowerToolId.includes("codebase")) {
    return Codicon.search;
  }
  if (lowerToolId.includes("read") || lowerToolId.includes("get_file") || lowerToolId.includes("problems")) {
    return Codicon.book;
  }
  if (lowerToolId.includes("edit") || lowerToolId.includes("create")) {
    return Codicon.pencil;
  }
  if (lowerToolId.includes("terminal")) {
    return Codicon.terminal;
  }
  return Codicon.tools;
}
__name(getToolInvocationIcon, "getToolInvocationIcon");
function createThinkingIcon(icon) {
  const iconElement = $("span.chat-thinking-icon");
  iconElement.classList.add(...ThemeIcon.asClassNameArray(icon));
  return iconElement;
}
__name(createThinkingIcon, "createThinkingIcon");
function extractTitleFromThinkingContent(content) {
  const headerMatch = content.match(/^\*\*([^*]+)\*\*/);
  return headerMatch ? headerMatch[1] : void 0;
}
__name(extractTitleFromThinkingContent, "extractTitleFromThinkingContent");
const THINKING_SCROLL_MAX_HEIGHT = 200;
var WorkingMessageCategory;
(function(WorkingMessageCategory2) {
  WorkingMessageCategory2["Thinking"] = "thinking";
  WorkingMessageCategory2["Terminal"] = "terminal";
  WorkingMessageCategory2["Tool"] = "tool";
})(WorkingMessageCategory || (WorkingMessageCategory = {}));
const thinkingMessages = [
  localize("chat.thinking.thinking.1", "Thinking..."),
  localize("chat.thinking.thinking.2", "Reasoning..."),
  localize("chat.thinking.thinking.3", "Considering..."),
  localize("chat.thinking.thinking.4", "Analyzing..."),
  localize("chat.thinking.thinking.5", "Evaluating...")
];
const terminalMessages = [
  localize("chat.thinking.terminal.1", "Executing..."),
  localize("chat.thinking.terminal.2", "Running..."),
  localize("chat.thinking.terminal.3", "Processing...")
];
const toolMessages = [
  localize("chat.thinking.tool.1", "Processing..."),
  localize("chat.thinking.tool.2", "Preparing..."),
  localize("chat.thinking.tool.3", "Loading..."),
  localize("chat.thinking.tool.4", "Analyzing..."),
  localize("chat.thinking.tool.5", "Evaluating...")
];
let ChatThinkingContentPart = class ChatThinkingContentPart2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatThinkingContentPart");
  }
  getRandomWorkingMessage(category = "tool") {
    let pool = this.availableMessagesByCategory.get(category);
    if (!pool || pool.length === 0) {
      switch (category) {
        case "thinking":
          pool = [...thinkingMessages];
          break;
        case "terminal":
          pool = [...terminalMessages];
          break;
        case "tool":
        default:
          pool = [...toolMessages];
          break;
      }
      this.availableMessagesByCategory.set(category, pool);
    }
    const index = Math.floor(Math.random() * pool.length);
    return pool.splice(index, 1)[0];
  }
  constructor(content, context, chatContentMarkdownRenderer, streamingCompleted, instantiationService, configurationService, chatMarkdownAnchorService, languageModelsService, hoverService) {
    const initialText = extractTextFromPart(content);
    const extractedTitle = extractTitleFromThinkingContent(initialText) ?? "Working...";
    super(extractedTitle, context, void 0, hoverService);
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.streamingCompleted = streamingCompleted;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.languageModelsService = languageModelsService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.defaultTitle = localize("chat.thinking.header", "Working...");
    this.fixedScrollingMode = false;
    this.autoScrollEnabled = true;
    this.extractedTitles = [];
    this.toolInvocationCount = 0;
    this.appendedItemCount = 0;
    this.isActive = true;
    this.toolInvocations = [];
    this.lazyItems = [];
    this.hasExpandedOnce = false;
    this.availableMessagesByCategory = /* @__PURE__ */ new Map();
    this.toolWrappersByCallId = /* @__PURE__ */ new Map();
    this.toolDisposables = this._register(new DisposableMap());
    this.pendingRemovals = [];
    this.isUpdatingDimensions = false;
    this.id = content.id;
    this.content = content;
    const configuredMode = this.configurationService.getValue("chat.agent.thinkingStyle") ?? ThinkingDisplayMode.Collapsed;
    this.fixedScrollingMode = configuredMode === ThinkingDisplayMode.FixedScrolling;
    this.currentTitle = extractedTitle;
    if (extractedTitle !== this.defaultTitle) {
      this.lastExtractedTitle = extractedTitle;
    }
    this.currentThinkingValue = initialText;
    if (initialText.trim()) {
      this.appendedItemCount++;
    }
    alert(localize("chat.thinking.started", "Thinking"));
    if (configuredMode === ThinkingDisplayMode.Collapsed) {
      this.setExpanded(false);
    } else if (configuredMode === ThinkingDisplayMode.CollapsedPreview) {
      this.setExpanded(!this.streamingCompleted && !this.element.isComplete);
    } else {
      this.setExpanded(false);
    }
    const node = this.domNode;
    node.classList.add("chat-thinking-box");
    if (this.fixedScrollingMode) {
      node.classList.add("chat-thinking-fixed-mode");
      this.currentTitle = this.defaultTitle;
    }
    this._register(autorun((r) => {
      const isExpanded = this.expanded.read(r);
      if (this._collapseButton) {
        if (this.streamingCompleted || this.element.isComplete) {
          this._collapseButton.icon = Codicon.check;
        } else if (!this.fixedScrollingMode) {
          if (isExpanded) {
            this._collapseButton.icon = Codicon.chevronDown;
          } else {
            this._collapseButton.icon = ThemeIcon.modify(Codicon.loading, "spin");
          }
        }
      }
    }));
    this._register(autorun((r) => {
      if (this._isExpanded.read(r) && !this.hasExpandedOnce && this.lazyItems.length > 0) {
        this.hasExpandedOnce = true;
        for (const item of this.lazyItems) {
          this.materializeLazyItem(item);
        }
      }
      this._onDidChangeHeight.fire();
    }));
    const label = this.lastExtractedTitle ?? "";
    if (!this.fixedScrollingMode && !this._isExpanded.get()) {
      this.setTitle(label);
    }
    if (this._collapseButton) {
      this._register(this._collapseButton.onDidClick(() => {
        if (this.streamingCompleted || this.fixedScrollingMode) {
          return;
        }
        const expanded = this.isExpanded();
        if (expanded) {
          this.setTitle(this.defaultTitle, true);
          this.currentTitle = this.defaultTitle;
        } else if (this.lastExtractedTitle) {
          const collapsedLabel = this.lastExtractedTitle ?? "";
          this.setTitle(collapsedLabel);
          this.currentTitle = collapsedLabel;
        }
      }));
    }
  }
  shouldInitEarly() {
    return this.fixedScrollingMode && !this.streamingCompleted;
  }
  // @TODO: @justschen Convert to template for each setting?
  initContent() {
    this.wrapper = $(".chat-used-context-list.chat-thinking-collapsible");
    if (!this.streamingCompleted) {
      this.wrapper.classList.add("chat-thinking-streaming");
    }
    const hasLazyThinkingItems = this.lazyItems.some((item) => item.kind === "thinking");
    if (this.currentThinkingValue && !hasLazyThinkingItems) {
      this.textContainer = $(".chat-thinking-item.markdown-content");
      this.wrapper.appendChild(this.textContainer);
      this.renderMarkdown(this.currentThinkingValue);
    }
    if (!this.streamingCompleted && !this.element.isComplete) {
      this.workingSpinnerElement = $(".chat-thinking-item.chat-thinking-spinner-item");
      const spinnerIcon = createThinkingIcon(ThemeIcon.modify(Codicon.loading, "spin"));
      this.workingSpinnerElement.appendChild(spinnerIcon);
      this.workingSpinnerLabel = $("span.chat-thinking-spinner-label");
      this.workingSpinnerLabel.textContent = this.getRandomWorkingMessage(
        "thinking"
        /* WorkingMessageCategory.Thinking */
      );
      this.workingSpinnerElement.appendChild(this.workingSpinnerLabel);
      this.wrapper.appendChild(this.workingSpinnerElement);
    }
    if (this.fixedScrollingMode) {
      this.scrollableElement = this._register(new DomScrollableElement(this.wrapper, {
        vertical: 1,
        horizontal: 2,
        handleMouseWheel: true,
        alwaysConsumeMouseWheel: false
      }));
      this._register(this.scrollableElement.onScroll((e) => this.handleScroll(e.scrollTop)));
      const mutationObserver = new MutationObserver(() => {
        if (!this.streamingCompleted) {
          this.syncDimensionsAndScheduleScroll();
        }
      });
      mutationObserver.observe(this.wrapper, {
        childList: true,
        subtree: true,
        characterData: true
      });
      this.mutationObserverDisposable = { dispose: /* @__PURE__ */ __name(() => mutationObserver.disconnect(), "dispose") };
      this._register(this.mutationObserverDisposable);
      this._register(this._onDidChangeHeight.event(() => {
        this.syncDimensionsAndScheduleScroll();
      }));
      this.syncDimensionsAndScheduleScroll();
      this.updateDropdownClickability();
      return this.scrollableElement.getDomNode();
    }
    this.updateDropdownClickability();
    return this.wrapper;
  }
  handleScroll(scrollTop) {
    if (!this.scrollableElement || this.isUpdatingDimensions) {
      return;
    }
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    const maxScrollTop = scrollDimensions.scrollHeight - scrollDimensions.height;
    const isAtBottom = maxScrollTop <= 0 || scrollTop >= maxScrollTop - 10;
    if (isAtBottom) {
      this.autoScrollEnabled = true;
    } else {
      this.autoScrollEnabled = false;
    }
  }
  // try to schedule scroll
  syncDimensionsAndScheduleScroll() {
    if (this.autoScrollEnabled && this.scrollableElement) {
      this.isUpdatingDimensions = true;
      try {
        this.updateScrollDimensions();
        this.scrollToBottom();
      } finally {
        this.isUpdatingDimensions = false;
      }
      return;
    }
    if (this.pendingScrollDisposable) {
      return;
    }
    this.pendingScrollDisposable = scheduleAtNextAnimationFrame(getWindow(this.domNode), () => {
      this.pendingScrollDisposable = void 0;
      if (this._store.isDisposed) {
        return;
      }
      this.isUpdatingDimensions = true;
      try {
        this.updateScrollDimensions();
      } finally {
        this.isUpdatingDimensions = false;
      }
    });
  }
  updateScrollDimensions() {
    if (!this.scrollableElement) {
      return;
    }
    const isCollapsed = this.domNode.classList.contains("chat-used-context-collapsed");
    if (!isCollapsed) {
      return;
    }
    const contentHeight = this.wrapper.scrollHeight;
    const viewportHeight = Math.min(contentHeight, THINKING_SCROLL_MAX_HEIGHT);
    this.scrollableElement.setScrollDimensions({
      width: this.scrollableElement.getDomNode().clientWidth,
      scrollWidth: this.wrapper.scrollWidth,
      height: viewportHeight,
      scrollHeight: contentHeight
    });
  }
  scrollToBottom() {
    if (!this.scrollableElement) {
      return;
    }
    const contentHeight = this.wrapper.scrollHeight;
    const viewportHeight = Math.min(contentHeight, THINKING_SCROLL_MAX_HEIGHT);
    if (contentHeight > viewportHeight) {
      this.scrollableElement.setScrollPosition({ scrollTop: contentHeight - viewportHeight });
    }
  }
  /**
   * updates scroll dimensions when streaming is complete.
   */
  updateScrollDimensionsForCompletion() {
    if (!this.scrollableElement || !this.fixedScrollingMode) {
      return;
    }
    const contentHeight = this.wrapper.scrollHeight;
    const viewportHeight = Math.min(contentHeight, THINKING_SCROLL_MAX_HEIGHT);
    this.scrollableElement.setScrollDimensions({
      width: this.scrollableElement.getDomNode().clientWidth,
      scrollWidth: this.wrapper.scrollWidth,
      height: viewportHeight,
      scrollHeight: contentHeight
    });
    if (contentHeight <= THINKING_SCROLL_MAX_HEIGHT) {
      this.scrollableElement.setScrollPosition({ scrollTop: 0 });
    }
  }
  renderMarkdown(content, reuseExisting) {
    if (this._store.isDisposed) {
      return;
    }
    const cleanedContent = content.trim();
    if (!cleanedContent) {
      if (this.markdownResult) {
        this.markdownResult.dispose();
        this.markdownResult = void 0;
      }
      if (this.textContainer) {
        clearNode(this.textContainer);
      }
      return;
    }
    let contentToRender = cleanedContent;
    if (cleanedContent.startsWith("**") && cleanedContent.endsWith("**")) {
      contentToRender = cleanedContent.slice(2, -2);
    }
    const target = reuseExisting ? this.markdownResult?.element : void 0;
    if (this.markdownResult) {
      this.markdownResult.dispose();
      this.markdownResult = void 0;
    }
    const rendered = this._register(this.chatContentMarkdownRenderer.render(new MarkdownString(contentToRender), {
      fillInIncompleteTokens: true,
      asyncRenderCallback: /* @__PURE__ */ __name(() => this._onDidChangeHeight.fire(), "asyncRenderCallback"),
      codeBlockRendererSync: /* @__PURE__ */ __name((_languageId, text, raw) => {
        const codeElement = $("code");
        codeElement.textContent = text;
        return codeElement;
      }, "codeBlockRendererSync")
    }, target));
    this.markdownResult = rendered;
    if (!target) {
      if (this.textContainer) {
        clearNode(this.textContainer);
        this.textContainer.appendChild(createThinkingIcon(Codicon.circleFilled));
        this.textContainer.appendChild(rendered.element);
      }
    }
  }
  setDropdownClickable(clickable) {
    if (this._collapseButton) {
      this._collapseButton.element.style.pointerEvents = clickable ? "auto" : "none";
    }
    if (!clickable && this.streamingCompleted) {
      super.setTitle(this.lastExtractedTitle ?? this.currentTitle);
    }
  }
  updateDropdownClickability() {
    if (!this.wrapper) {
      return;
    }
    if (this.wrapper.children.length > 1 || this.toolInvocationCount > 0 || this.lazyItems.length > 0) {
      this.setDropdownClickable(true);
      return;
    }
    const contentWithoutTitle = this.currentThinkingValue.trim();
    const titleToCompare = this.lastExtractedTitle ?? this.currentTitle;
    const stripMarkdown = /* @__PURE__ */ __name((text) => {
      return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").trim();
    }, "stripMarkdown");
    const strippedContent = stripMarkdown(contentWithoutTitle);
    const shouldDisable = !strippedContent || strippedContent === titleToCompare;
    this.setDropdownClickable(!shouldDisable);
  }
  appendToWrapper(element) {
    if (!this.wrapper) {
      return;
    }
    if (this.workingSpinnerElement && this.workingSpinnerElement.parentNode === this.wrapper) {
      this.wrapper.insertBefore(element, this.workingSpinnerElement);
    } else {
      this.wrapper.appendChild(element);
    }
  }
  resetId() {
    this.id = void 0;
  }
  collapseContent() {
    this.setExpanded(false);
  }
  updateThinking(content) {
    if (this._store.isDisposed) {
      return;
    }
    this.content = content;
    for (const lazyItem of this.lazyItems) {
      if (lazyItem.kind === "thinking" && lazyItem.content.id === content.id) {
        lazyItem.content = content;
        break;
      }
    }
    const raw = extractTextFromPart(content);
    const next = raw;
    if (next === this.currentThinkingValue) {
      return;
    }
    const previousValue = this.currentThinkingValue;
    const reuseExisting = !!(this.markdownResult && next.startsWith(previousValue) && next.length > previousValue.length);
    this.currentThinkingValue = next;
    this.renderMarkdown(next, reuseExisting);
    if (this.fixedScrollingMode && this.scrollableElement) {
      this.syncDimensionsAndScheduleScroll();
    }
    const extractedTitle = extractTitleFromThinkingContent(raw);
    if (extractedTitle && extractedTitle !== this.currentTitle) {
      if (!this.extractedTitles.includes(extractedTitle)) {
        this.extractedTitles.push(extractedTitle);
      }
      this.lastExtractedTitle = extractedTitle;
    }
    if (!extractedTitle || extractedTitle === this.currentTitle) {
      return;
    }
    const label = this.lastExtractedTitle ?? "";
    if (!this.fixedScrollingMode && !this._isExpanded.get()) {
      this.setTitle(label);
    }
    this.updateDropdownClickability();
  }
  getIsActive() {
    return this.isActive;
  }
  markAsInactive() {
    this.isActive = false;
    this.processPendingRemovals();
    if (this.workingSpinnerElement) {
      this.workingSpinnerElement.remove();
      this.workingSpinnerElement = void 0;
      this.workingSpinnerLabel = void 0;
    }
  }
  finalizeTitleIfDefault() {
    this.processPendingRemovals();
    if (this.wrapper) {
      this.wrapper.classList.remove("chat-thinking-streaming");
    }
    this.streamingCompleted = true;
    if (this.mutationObserverDisposable) {
      this.mutationObserverDisposable.dispose();
      this.mutationObserverDisposable = void 0;
    }
    if (this.workingSpinnerElement) {
      this.workingSpinnerElement.remove();
      this.workingSpinnerElement = void 0;
      this.workingSpinnerLabel = void 0;
    }
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
    }
    this.updateScrollDimensionsForCompletion();
    this.updateDropdownClickability();
    if (this.content.generatedTitle) {
      this.currentTitle = this.content.generatedTitle;
      super.setTitle(this.content.generatedTitle);
      return;
    }
    const existingToolTitle = this.toolInvocations.find((t) => t.generatedTitle)?.generatedTitle;
    if (existingToolTitle) {
      this.currentTitle = existingToolTitle;
      this.content.generatedTitle = existingToolTitle;
      super.setTitle(existingToolTitle);
      return;
    }
    if (this.appendedItemCount === 1 && this.currentThinkingValue.trim() === "" && this.singleItemInfo) {
      this.restoreSingleItemToOriginalPosition();
      return;
    }
    if (this.extractedTitles.length === 1 && this.toolInvocationCount === 0) {
      const title = this.extractedTitles[0];
      this.currentTitle = title;
      this.content.generatedTitle = title;
      super.setTitle(title);
      return;
    }
    const generateTitles = this.configurationService.getValue(ChatConfiguration.ThinkingGenerateTitles) ?? true;
    if (!generateTitles) {
      this.setFallbackTitle();
      return;
    }
    this.generateTitleViaLLM();
  }
  setGeneratedTitleOnToolInvocations(title) {
    for (const toolInvocation of this.toolInvocations) {
      toolInvocation.generatedTitle = title;
    }
  }
  async generateTitleViaLLM() {
    const cts = new CancellationTokenSource();
    const timeout = setTimeout(() => cts.cancel(), 5e3);
    try {
      let models = await this.languageModelsService.selectLanguageModels({ vendor: "copilot", id: "copilot-fast" });
      if (!models.length) {
        models = await this.languageModelsService.selectLanguageModels({ vendor: "copilot", family: "gpt-4o-mini" });
      }
      if (!models.length) {
        this.setFallbackTitle();
        return;
      }
      if (cts.token.isCancellationRequested) {
        this.setFallbackTitle();
        return;
      }
      let context;
      if (this.extractedTitles.length > 0) {
        context = this.extractedTitles.join(", ");
      } else {
        context = this.currentThinkingValue.substring(0, 1e3);
      }
      const prompt = `Summarize the following content in a SINGLE sentence (under 10 words) using past tense. Follow these rules strictly:

			OUTPUT FORMAT:
			- MUST be a single sentence
			- MUST be under 10 words
			- No quotes, no trailing punctuation

			GENERAL:
			- The content may include tool invocations (file edits, reads, searches, terminal commands), reasoning headers, or raw thinking text
			- For reasoning headers or thinking text (no tool calls), summarize WHAT was considered/analyzed, NOT that thinking occurred
			- For thinking-only summaries, use phrases like: "Considered...", "Planned...", "Analyzed...", "Reviewed..."

			TOOL NAME FILTERING:
			- NEVER include tool names like "Replace String in File", "Multi Replace String in File", "Create File", "Read File", etc. in the output
			- If an action says "Edited X and used Replace String in File", output ONLY the action on X
			- Tool names describe HOW something was done, not WHAT was done - always omit them

			VOCABULARY - Use varied synonyms for natural-sounding summaries:
			- For edits: "Updated", "Modified", "Changed", "Refactored", "Fixed", "Adjusted"
			- For reads: "Reviewed", "Examined", "Checked", "Inspected", "Analyzed", "Explored"
			- For creates: "Created", "Added", "Generated"
			- For searches: "Searched for", "Looked up", "Investigated"
			- For terminal: "Ran command", "Executed"
			- For reasoning/thinking: "Considered", "Planned", "Analyzed", "Reviewed", "Evaluated"
			- Choose the synonym that best fits the context

			RULES FOR TOOL CALLS:
			1. If the SAME file was both edited AND read: Use a combined phrase like "Reviewed and updated <filename>"
			2. If exactly ONE file was edited: Start with an edit synonym + "<filename>" (include actual filename)
			3. If exactly ONE file was read: Start with a read synonym + "<filename>" (include actual filename)
			4. If MULTIPLE files were edited: Start with an edit synonym + "X files"
			5. If MULTIPLE files were read: Start with a read synonym + "X files"
			6. If BOTH edits AND reads occurred on DIFFERENT files: Combine them naturally
			7. For searches: Say "searched for <term>" or "looked up <term>" with the actual search term, NOT "searched for files"
			8. After the file info, you may add a brief summary of other actions if space permits
			9. NEVER say "1 file" - always use the actual filename when there's only one file

			RULES FOR REASONING HEADERS (no tool calls):
			1. If the input contains reasoning/analysis headers without actual tool invocations, summarize the main topic and what was considered
			2. Use past tense verbs that indicate thinking, not doing: "Considered", "Planned", "Analyzed", "Evaluated"
			3. Focus on WHAT was being thought about, not that thinking occurred

			RULES FOR RAW THINKING TEXT:
			1. Extract the main topic or question being considered from the text
			2. Identify any specific files, functions, or concepts mentioned
			3. Summarize as "Analyzed <topic>" or "Considered <specific thing>"
			4. If discussing code structure: "Reviewed <component/architecture>"
			5. If discussing a problem: "Analyzed <problem description>"
			6. If discussing implementation: "Planned <feature/change>"

			EXAMPLES WITH TOOLS:
			- "Read HomePage.tsx, Edited HomePage.tsx" \u2192 "Reviewed and updated HomePage.tsx"
			- "Edited HomePage.tsx" \u2192 "Updated HomePage.tsx"
			- "Edited config.css and used Replace String in File" \u2192 "Modified config.css"
			- "Edited App.tsx, used Multi Replace String in File" \u2192 "Refactored App.tsx"
			- "Read config.json, Read package.json" \u2192 "Reviewed 2 files"
			- "Edited App.tsx, Read utils.ts" \u2192 "Updated App.tsx and checked utils.ts"
			- "Edited App.tsx, Read utils.ts, Read types.ts" \u2192 "Updated App.tsx and reviewed 2 files"
			- "Edited index.ts, Edited styles.css, Ran terminal command" \u2192 "Modified 2 files and ran command"
			- "Read README.md, Searched for AuthService" \u2192 "Checked README.md and searched for AuthService"
			- "Searched for login, Searched for authentication" \u2192 "Searched for login and authentication"
			- "Edited api.ts, Edited models.ts, Read schema.json" \u2192 "Updated 2 files and reviewed schema.json"
			- "Edited Button.tsx, Edited Button.css, Edited index.ts" \u2192 "Modified 3 files"
			- "Searched codebase for error handling" \u2192 "Looked up error handling"

			EXAMPLES WITH REASONING HEADERS (no tools):
			- "Analyzing component architecture" \u2192 "Considered component architecture"
			- "Planning refactor strategy" \u2192 "Planned refactor strategy"
			- "Reviewing error handling approach, Considering edge cases" \u2192 "Analyzed error handling approach"
			- "Understanding the codebase structure" \u2192 "Reviewed codebase structure"
			- "Thinking about implementation options" \u2192 "Considered implementation options"

			EXAMPLES WITH RAW THINKING TEXT:
			- "I need to understand how the authentication flow works in this app..." \u2192 "Analyzed authentication flow"
			- "Let me think about how to refactor this component to be more maintainable..." \u2192 "Planned component refactoring"
			- "The error seems to be coming from the database connection..." \u2192 "Investigated database connection issue"
			- "Looking at the UserService class, I see it handles..." \u2192 "Reviewed UserService implementation"

			Content: ${context}`;
      const response = await this.languageModelsService.sendChatRequest(models[0], new ExtensionIdentifier("core"), [{ role: 1, content: [{ type: "text", value: prompt }] }], {}, cts.token);
      let generatedTitle = "";
      for await (const part of response.stream) {
        if (cts.token.isCancellationRequested) {
          break;
        }
        if (Array.isArray(part)) {
          for (const p of part) {
            if (p.type === "text") {
              generatedTitle += p.value;
            }
          }
        } else if (part.type === "text") {
          generatedTitle += part.value;
        }
      }
      if (cts.token.isCancellationRequested) {
        this.setFallbackTitle();
        return;
      }
      await response.result;
      generatedTitle = generatedTitle.trim();
      if (generatedTitle.includes("can't assist with that")) {
        this.setFallbackTitle();
        return;
      }
      if (generatedTitle && !this._store.isDisposed) {
        this.currentTitle = generatedTitle;
        if (this._collapseButton) {
          this._collapseButton.label = generatedTitle;
        }
        this.content.generatedTitle = generatedTitle;
        this.setGeneratedTitleOnToolInvocations(generatedTitle);
        return;
      }
    } catch (error) {
    } finally {
      clearTimeout(timeout);
      cts.dispose();
    }
    this.setFallbackTitle();
  }
  restoreSingleItemToOriginalPosition() {
    if (!this.singleItemInfo) {
      return;
    }
    const { element, originalParent, originalNextSibling } = this.singleItemInfo;
    if (element.childElementCount > 1) {
      this.singleItemInfo = void 0;
      return;
    }
    if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
      originalParent.insertBefore(element, originalNextSibling);
    } else {
      originalParent.appendChild(element);
    }
    hide(this.domNode);
    this.singleItemInfo = void 0;
  }
  setFallbackTitle() {
    const finalLabel = this.appendedItemCount > 0 ? localize("chat.thinking.finished.withSteps", "Finished with {0} step{1}", this.appendedItemCount, this.appendedItemCount === 1 ? "" : "s") : localize("chat.thinking.finished", "Finished Working");
    this.currentTitle = finalLabel;
    if (this.wrapper) {
      this.wrapper.classList.remove("chat-thinking-streaming");
    }
    this.streamingCompleted = true;
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
      this._collapseButton.label = finalLabel;
    }
    this.updateDropdownClickability();
  }
  /**
   * Appends a tool invocation or content item to the thinking group.
   * The factory is called lazily - only when the thinking section is expanded.
   * If already expanded, the factory is called immediately.
   */
  appendItem(factory, toolInvocationId, toolInvocationOrMarkdown, originalParent) {
    this.processPendingRemovals();
    this.trackToolMetadata(toolInvocationId, toolInvocationOrMarkdown);
    this.appendedItemCount++;
    if (this.workingSpinnerLabel) {
      const isTerminalTool = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized") && toolInvocationOrMarkdown.toolSpecificData?.kind === "terminal";
      const category = isTerminalTool ? "terminal" : "tool";
      this.workingSpinnerLabel.textContent = this.getRandomWorkingMessage(category);
    }
    if (this.isExpanded() || this.hasExpandedOnce || this.fixedScrollingMode && !this.streamingCompleted) {
      const result = factory();
      this.appendItemToDOM(result.domNode, toolInvocationId, toolInvocationOrMarkdown, originalParent);
      if (result.disposable) {
        const toolCallId = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized") ? toolInvocationOrMarkdown.toolCallId : void 0;
        if (toolCallId) {
          this.toolDisposables.get(toolCallId)?.add(result.disposable);
        } else {
          this._register(result.disposable);
        }
      }
    } else {
      const item = {
        kind: "tool",
        lazy: new Lazy(factory),
        toolInvocationId,
        toolInvocationOrMarkdown,
        originalParent
      };
      this.lazyItems.push(item);
    }
    this.updateDropdownClickability();
  }
  /**
   * removes/re-establishes a lazy item from the thinking container
   * this is needed so we can check if there are confirmations still needed
   */
  removeLazyItem(toolInvocationId) {
    const index = this.lazyItems.findIndex((item) => item.kind === "tool" && item.toolInvocationId === toolInvocationId);
    if (index === -1) {
      return false;
    }
    this.lazyItems.splice(index, 1);
    this.appendedItemCount--;
    this.toolInvocationCount--;
    const toolInvocationsIndex = this.toolInvocations.findIndex((t) => (t.kind === "toolInvocation" || t.kind === "toolInvocationSerialized") && t.toolId === toolInvocationId);
    if (toolInvocationsIndex !== -1) {
      this.toolInvocations.splice(toolInvocationsIndex, 1);
    }
    this.updateDropdownClickability();
    return true;
  }
  processPendingRemovals() {
    for (const pending of this.pendingRemovals) {
      this.removeStreamingToolEntry(pending.toolCallId, pending.toolLabel);
    }
    this.pendingRemovals = [];
  }
  // removes the tool entry that was previously streaming and now is not. removes item from dom and internal tracking.
  removeStreamingToolEntry(toolCallId, toolLabel) {
    this.toolDisposables.deleteAndDispose(toolCallId);
    const wrapper = this.toolWrappersByCallId.get(toolCallId);
    if (wrapper) {
      wrapper.remove();
      this.toolWrappersByCallId.delete(toolCallId);
    }
    const lazyIndex = this.lazyItems.findIndex((item) => item.kind === "tool" && item.toolInvocationOrMarkdown && (item.toolInvocationOrMarkdown.kind === "toolInvocation" || item.toolInvocationOrMarkdown.kind === "toolInvocationSerialized") && item.toolInvocationOrMarkdown.toolCallId === toolCallId);
    if (lazyIndex !== -1) {
      this.lazyItems.splice(lazyIndex, 1);
    }
    this.appendedItemCount = Math.max(0, this.appendedItemCount - 1);
    this.toolInvocationCount = Math.max(0, this.toolInvocationCount - 1);
    const toolInvocationsIndex = this.toolInvocations.findIndex((t) => (t.kind === "toolInvocation" || t.kind === "toolInvocationSerialized") && t.toolCallId === toolCallId);
    if (toolInvocationsIndex !== -1) {
      this.toolInvocations.splice(toolInvocationsIndex, 1);
    }
    const titleIndex = this.extractedTitles.indexOf(toolLabel);
    if (titleIndex !== -1) {
      this.extractedTitles.splice(titleIndex, 1);
    }
    this.updateDropdownClickability();
    this._onDidChangeHeight.fire();
  }
  trackToolMetadata(toolInvocationId, toolInvocationOrMarkdown) {
    if (!toolInvocationId) {
      return;
    }
    this.toolInvocationCount++;
    let toolCallLabel;
    const isToolInvocation = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized");
    if (isToolInvocation && toolInvocationOrMarkdown.invocationMessage) {
      const message = typeof toolInvocationOrMarkdown.invocationMessage === "string" ? toolInvocationOrMarkdown.invocationMessage : toolInvocationOrMarkdown.invocationMessage.value;
      toolCallLabel = message;
      this.toolInvocations.push(toolInvocationOrMarkdown);
      if (toolInvocationOrMarkdown.kind === "toolInvocation") {
        let currentToolLabel = toolCallLabel;
        let isComplete = false;
        let isStreaming = IChatToolInvocation.isStreaming(toolInvocationOrMarkdown);
        const toolStore = new DisposableStore();
        this.toolDisposables.set(toolInvocationOrMarkdown.toolCallId, toolStore);
        const updateTitle = /* @__PURE__ */ __name((updatedMessage) => {
          if (updatedMessage && updatedMessage !== currentToolLabel) {
            const oldIndex = this.extractedTitles.indexOf(currentToolLabel);
            const updatedIndex = this.extractedTitles.indexOf(updatedMessage);
            if (oldIndex !== -1) {
              if (updatedIndex !== -1 && updatedIndex !== oldIndex) {
                this.extractedTitles.splice(oldIndex, 1);
              } else {
                this.extractedTitles[oldIndex] = updatedMessage;
              }
            } else if (updatedIndex === -1) {
              this.extractedTitles.push(updatedMessage);
            }
            currentToolLabel = updatedMessage;
            this.lastExtractedTitle = updatedMessage;
            if (!this.fixedScrollingMode && !this._isExpanded.read(void 0)) {
              this.setTitle(updatedMessage);
            }
          }
        }, "updateTitle");
        const autorunDisposable = autorun((reader) => {
          if (isComplete) {
            return;
          }
          const currentState = toolInvocationOrMarkdown.state.read(reader);
          if (isStreaming && currentState.type !== 0) {
            isStreaming = false;
            if (toolInvocationOrMarkdown.presentation === "hidden") {
              this.pendingRemovals.push({ toolCallId: toolInvocationOrMarkdown.toolCallId, toolLabel: currentToolLabel });
              isComplete = true;
              return;
            }
          }
          if (currentState.type === 4 || currentState.type === 5) {
            isComplete = true;
            return;
          }
          if (currentState.type === 0) {
            isStreaming = true;
            const streamingMessage = currentState.streamingMessage.read(reader);
            if (streamingMessage) {
              const updatedMessage = typeof streamingMessage === "string" ? streamingMessage : streamingMessage.value;
              updateTitle(updatedMessage);
            }
            return;
          }
          if (currentState.type === 2) {
            const progressData = currentState.progress.read(reader);
            if (progressData.message) {
              const updatedMessage = typeof progressData.message === "string" ? progressData.message : progressData.message.value;
              updateTitle(updatedMessage);
            } else {
              const invocationMsg2 = toolInvocationOrMarkdown.invocationMessage;
              if (invocationMsg2) {
                const updatedMessage = typeof invocationMsg2 === "string" ? invocationMsg2 : invocationMsg2.value;
                updateTitle(updatedMessage);
              }
            }
            return;
          }
          const invocationMsg = toolInvocationOrMarkdown.invocationMessage;
          if (invocationMsg) {
            const updatedMessage = typeof invocationMsg === "string" ? invocationMsg : invocationMsg.value;
            updateTitle(updatedMessage);
          }
        });
        toolStore.add(autorunDisposable);
      }
    } else if (toolInvocationOrMarkdown?.kind === "markdownContent") {
      const codeblockInfo = extractCodeblockUrisFromText(toolInvocationOrMarkdown.content.value);
      if (codeblockInfo?.uri) {
        const filename = basename(codeblockInfo.uri);
        toolCallLabel = localize("chat.thinking.editedFile", "Edited {0}", filename);
      } else {
        toolCallLabel = localize("chat.thinking.editingFile", "Edited file");
      }
    } else {
      toolCallLabel = `Invoked \`${toolInvocationId}\``;
    }
    if (!this.extractedTitles.includes(toolCallLabel)) {
      this.extractedTitles.push(toolCallLabel);
    }
    this.lastExtractedTitle = toolCallLabel;
    if (!this.fixedScrollingMode && !this._isExpanded.get()) {
      this.setTitle(toolCallLabel);
    }
  }
  appendItemToDOM(content, toolInvocationId, toolInvocationOrMarkdown, originalParent) {
    if (!content.hasChildNodes() || content.textContent?.trim() === "") {
      return;
    }
    if (this.appendedItemCount === 1 && originalParent) {
      this.singleItemInfo = {
        element: content,
        originalParent,
        originalNextSibling: this.domNode
      };
    } else {
      this.singleItemInfo = void 0;
    }
    const itemWrapper = $(".chat-thinking-tool-wrapper");
    const isMarkdownEdit = toolInvocationOrMarkdown?.kind === "markdownContent";
    const isTerminalTool = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized") && toolInvocationOrMarkdown.toolSpecificData?.kind === "terminal";
    let icon;
    if (isMarkdownEdit) {
      icon = Codicon.pencil;
    } else if (isTerminalTool) {
      const terminalData = toolInvocationOrMarkdown.toolSpecificData;
      const exitCode = terminalData?.terminalCommandState?.exitCode;
      icon = exitCode !== void 0 && exitCode !== 0 ? Codicon.error : Codicon.terminal;
    } else {
      icon = toolInvocationId ? getToolInvocationIcon(toolInvocationId) : Codicon.tools;
    }
    const iconElement = createThinkingIcon(icon);
    itemWrapper.appendChild(iconElement);
    itemWrapper.appendChild(content);
    const isToolInvocation = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized");
    if (isToolInvocation && toolInvocationOrMarkdown.toolCallId) {
      this.toolWrappersByCallId.set(toolInvocationOrMarkdown.toolCallId, itemWrapper);
    }
    this.appendToWrapper(itemWrapper);
    if (this.fixedScrollingMode && this.scrollableElement) {
      this.syncDimensionsAndScheduleScroll();
    }
  }
  materializeLazyItem(item) {
    if (item.kind === "thinking") {
      this.appendToWrapper(item.textContainer);
      this.textContainer = item.textContainer;
      this.id = item.content.id;
      this.updateThinking(item.content);
      return;
    }
    if (this.workingSpinnerLabel) {
      const isTerminalTool = item.toolInvocationOrMarkdown && (item.toolInvocationOrMarkdown.kind === "toolInvocation" || item.toolInvocationOrMarkdown.kind === "toolInvocationSerialized") && item.toolInvocationOrMarkdown.toolSpecificData?.kind === "terminal";
      const category = isTerminalTool ? "terminal" : "tool";
      this.workingSpinnerLabel.textContent = this.getRandomWorkingMessage(category);
    }
    if (item.lazy.hasValue) {
      return;
    }
    const result = item.lazy.value;
    this.appendItemToDOM(result.domNode, item.toolInvocationId, item.toolInvocationOrMarkdown, item.originalParent);
    if (result.disposable) {
      const toolCallId = item.toolInvocationOrMarkdown && (item.toolInvocationOrMarkdown.kind === "toolInvocation" || item.toolInvocationOrMarkdown.kind === "toolInvocationSerialized") ? item.toolInvocationOrMarkdown.toolCallId : void 0;
      if (toolCallId) {
        this.toolDisposables.get(toolCallId)?.add(result.disposable);
      } else {
        this._register(result.disposable);
      }
    }
  }
  // makes a new text container. when we update, we now update this container.
  setupThinkingContainer(content) {
    if (this._store.isDisposed) {
      return;
    }
    this.appendedItemCount++;
    this.textContainer = $(".chat-thinking-item.markdown-content");
    if (content.value) {
      if (this.isExpanded() || this.hasExpandedOnce || this.fixedScrollingMode && !this.streamingCompleted) {
        this.appendToWrapper(this.textContainer);
        this.id = content.id;
        this.updateThinking(content);
      } else {
        this.content = content;
        this.id = content.id;
        const lazyThinking = {
          kind: "thinking",
          textContainer: this.textContainer,
          content
        };
        this.lazyItems.push(lazyThinking);
      }
      if (this.workingSpinnerLabel) {
        this.workingSpinnerLabel.textContent = this.getRandomWorkingMessage(
          "thinking"
          /* WorkingMessageCategory.Thinking */
        );
      }
    }
    this.updateDropdownClickability();
  }
  setTitle(title, omitPrefix) {
    if (!title || this.element.isComplete) {
      return;
    }
    if (omitPrefix) {
      this.setTitleWithWidgets(new MarkdownString(title), this.instantiationService, this.chatMarkdownAnchorService, this.chatContentMarkdownRenderer);
      this.currentTitle = title;
      return;
    }
    const thinkingLabel = `Working: ${title}`;
    this.lastExtractedTitle = title;
    this.currentTitle = thinkingLabel;
    this.setTitleWithWidgets(new MarkdownString(thinkingLabel), this.instantiationService, this.chatMarkdownAnchorService, this.chatContentMarkdownRenderer);
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized" || other.kind === "markdownContent") {
      return true;
    }
    if (other.kind !== "thinking") {
      return false;
    }
    return other?.id !== this.id;
  }
  dispose() {
    if (this.markdownResult) {
      this.markdownResult.dispose();
      this.markdownResult = void 0;
    }
    if (this.workingSpinnerElement) {
      this.workingSpinnerElement.remove();
      this.workingSpinnerElement = void 0;
      this.workingSpinnerLabel = void 0;
    }
    this.pendingScrollDisposable?.dispose();
    super.dispose();
  }
};
ChatThinkingContentPart = __decorate([
  __param(4, IInstantiationService),
  __param(5, IConfigurationService),
  __param(6, IChatMarkdownAnchorService),
  __param(7, ILanguageModelsService),
  __param(8, IHoverService)
], ChatThinkingContentPart);
export {
  ChatThinkingContentPart,
  createThinkingIcon,
  getToolInvocationIcon
};
//# sourceMappingURL=chatThinkingContentPart.js.map
