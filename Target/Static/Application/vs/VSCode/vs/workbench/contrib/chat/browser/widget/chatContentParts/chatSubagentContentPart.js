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
var ChatSubagentContentPart_1;
import * as dom from "../../../../../../base/browser/dom.js";
import { $, AnimationFrameScheduler, DisposableResizeObserver } from "../../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { rcut } from "../../../../../../base/common/strings.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { ChatCollapsibleContentPart } from "./chatCollapsibleContentPart.js";
import { ChatCollapsibleMarkdownContentPart } from "./chatCollapsibleMarkdownContentPart.js";
import { renderFileWidgets } from "./chatInlineAnchorWidget.js";
import { IChatMarkdownAnchorService } from "./chatMarkdownAnchorService.js";
import { createThinkingIcon, getToolInvocationIcon } from "./chatThinkingContentPart.js";
import { ChatToolInvocationPart } from "./toolInvocationParts/chatToolInvocationPart.js";
import "./media/chatSubagentContent.css";
const MAX_TITLE_LENGTH = 100;
let ChatSubagentContentPart = ChatSubagentContentPart_1 = class ChatSubagentContentPart2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatSubagentContentPart");
  }
  /**
   * Check if a tool invocation is the parent subagent tool (the tool that spawns a subagent).
   * A parent subagent tool has subagent toolSpecificData but no subAgentInvocationId.
   */
  static isParentSubagentTool(toolInvocation) {
    return toolInvocation.toolSpecificData?.kind === "subagent" && !toolInvocation.subAgentInvocationId;
  }
  /**
   * Extracts subagent info (description, agentName, prompt) from a tool invocation.
   */
  static extractSubagentInfo(toolInvocation) {
    const defaultDescription = localize("chat.subagent.defaultDescription", "Running subagent...");
    if (!ChatSubagentContentPart_1.isParentSubagentTool(toolInvocation)) {
      return { description: defaultDescription, agentName: void 0, prompt: void 0, modelName: void 0 };
    }
    if (toolInvocation.toolSpecificData?.kind === "subagent") {
      return {
        description: toolInvocation.toolSpecificData.description ?? defaultDescription,
        agentName: toolInvocation.toolSpecificData.agentName,
        prompt: toolInvocation.toolSpecificData.prompt,
        modelName: toolInvocation.toolSpecificData.modelName
      };
    }
    if (toolInvocation.kind === "toolInvocation") {
      const state = toolInvocation.state.get();
      const params = state.type !== 0 ? state.parameters : void 0;
      return {
        description: params?.description ?? defaultDescription,
        agentName: params?.agentName,
        prompt: params?.prompt,
        modelName: void 0
      };
    }
    return { description: defaultDescription, agentName: void 0, prompt: void 0, modelName: void 0 };
  }
  constructor(subAgentInvocationId, toolInvocation, context, chatContentMarkdownRenderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, announcedToolProgressKeys, instantiationService, chatMarkdownAnchorService, hoverService, configurationService) {
    const { description, agentName, prompt, modelName } = ChatSubagentContentPart_1.extractSubagentInfo(toolInvocation);
    const prefix = agentName || localize("chat.subagent.prefix", "Subagent");
    const initialTitle = `${prefix}: ${description}`;
    super(initialTitle, context, void 0, hoverService, configurationService);
    this.subAgentInvocationId = subAgentInvocationId;
    this.context = context;
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.listPool = listPool;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.announcedToolProgressKeys = announcedToolProgressKeys;
    this.instantiationService = instantiationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.isActive = true;
    this.hasToolItems = false;
    this.lazyItems = [];
    this.hasExpandedOnce = false;
    this.pendingPromptRender = false;
    this._hoverDisposable = this._register(new MutableDisposable());
    this.toolsWaitingForConfirmation = 0;
    this.userManuallyExpanded = false;
    this.autoExpandedForConfirmation = false;
    this.description = description;
    this.agentName = agentName;
    this.prompt = prompt;
    this.modelName = modelName;
    this.isInitiallyComplete = this.element.isComplete;
    const node = this.domNode;
    node.classList.add("chat-thinking-box", "chat-thinking-fixed-mode", "chat-subagent-part");
    if (!this.element.isComplete) {
      node.classList.add("chat-thinking-active");
    }
    if (!this.element.isComplete && this._collapseButton) {
      const labelElement = this._collapseButton.labelElement;
      labelElement.textContent = "";
      this.titleShimmerSpan = $("span.chat-thinking-title-shimmer");
      this.titleShimmerSpan.textContent = initialTitle;
      labelElement.appendChild(this.titleShimmerSpan);
    }
    if (this._collapseButton && !this.element.isComplete) {
      this._collapseButton.icon = Codicon.circleFilled;
    }
    this._register(autorun((r) => {
      this.expanded.read(r);
      if (this._collapseButton) {
        if (!this.element.isComplete && this.isActive) {
          this._collapseButton.icon = Codicon.circleFilled;
        } else {
          this._collapseButton.icon = Codicon.check;
        }
      }
    }));
    this._register(autorun((r) => {
      if (this._isExpanded.read(r) && !this.hasExpandedOnce) {
        this.hasExpandedOnce = true;
        this.materializePendingContent();
      }
    }));
    this.setExpanded(false);
    this._register(autorun((r) => {
      const expanded = this._isExpanded.read(r);
      if (expanded) {
        if (!this.autoExpandedForConfirmation) {
          this.userManuallyExpanded = true;
        }
      } else {
        if (this.autoExpandedForConfirmation) {
          this.autoExpandedForConfirmation = false;
        }
        if (this.userManuallyExpanded) {
          this.userManuallyExpanded = false;
        }
      }
    }));
    this.layoutScheduler = this._register(new AnimationFrameScheduler(this.domNode, () => this.performLayout()));
    this.updateHover();
    this.renderPromptSection();
    this.watchToolCompletion(toolInvocation);
  }
  initContent() {
    this.wrapper = $(".chat-used-context-list.chat-thinking-collapsible");
    if (!this.hasToolItems) {
      this.wrapper.style.display = "none";
    }
    this.materializePendingContent();
    const resizeObserver = this._register(new DisposableResizeObserver(() => this.layoutScheduler.schedule()));
    this._register(resizeObserver.observe(this.wrapper));
    return this.wrapper;
  }
  /**
   * Renders the prompt as a collapsible section at the start of the content.
   * If the wrapper doesn't exist yet (lazy init) or subagent is initially complete,
   * this is deferred until expanded.
   */
  renderPromptSection() {
    if (!this.prompt || this.promptContainer) {
      return;
    }
    if (!this.wrapper || this.isInitiallyComplete && !this.isExpanded() && !this.hasExpandedOnce) {
      this.pendingPromptRender = true;
      return;
    }
    this.pendingPromptRender = false;
    this.doRenderPromptSection();
  }
  doRenderPromptSection() {
    if (!this.prompt || this.promptContainer) {
      return;
    }
    const lines = this.prompt.split("\n");
    const rawFirstLine = lines[0] || localize("chat.subagent.prompt", "Prompt");
    const restOfLines = lines.slice(1).join("\n").trim();
    const titleContent = rcut(rawFirstLine, MAX_TITLE_LENGTH);
    const wasTruncated = rawFirstLine.length > MAX_TITLE_LENGTH;
    const title = wasTruncated ? titleContent + "\u2026" : titleContent;
    const titleRemainder = rawFirstLine.length > titleContent.length ? rawFirstLine.slice(titleContent.length).trim() : "";
    const content = titleRemainder ? titleRemainder + (restOfLines ? "\n" + restOfLines : "") : restOfLines || this.prompt;
    const collapsiblePart = this._register(this.instantiationService.createInstance(ChatCollapsibleMarkdownContentPart, title, content, this.context, this.chatContentMarkdownRenderer));
    this.promptContainer = $(".chat-thinking-tool-wrapper.chat-subagent-section");
    const promptIcon = createThinkingIcon(Codicon.comment);
    this.promptContainer.appendChild(promptIcon);
    this.promptContainer.appendChild(collapsiblePart.domNode);
    if (this.wrapper) {
      if (this.wrapper.firstChild) {
        this.wrapper.insertBefore(this.promptContainer, this.wrapper.firstChild);
      } else {
        dom.append(this.wrapper, this.promptContainer);
      }
      if (this.wrapper.style.display === "none") {
        this.wrapper.style.display = "";
      }
    }
  }
  getIsActive() {
    return this.isActive;
  }
  markAsInactive() {
    this.isActive = false;
    this.domNode.classList.remove("chat-thinking-active");
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
    }
    this.finalizeTitle();
    this.setExpanded(false);
  }
  finalizeTitle() {
    this.updateTitle();
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
    }
  }
  updateTitle() {
    const prefix = this.agentName || localize("chat.subagent.prefix", "Subagent");
    const shimmerText = `${prefix}: ${this.description}`;
    const toolCallText = this.currentRunningToolMessage && this.isActive ? ` \u2014 ${this.currentRunningToolMessage}` : ``;
    if (!this._collapseButton) {
      return;
    }
    const labelElement = this._collapseButton.labelElement;
    if (!this.isActive) {
      labelElement.textContent = "";
      this.titleShimmerSpan = void 0;
      if (this.titleDetailRendered) {
        this.titleDetailRendered.dispose();
        this.titleDetailRendered = void 0;
      }
      this.titleDetailContainer = void 0;
      const prefixSpan = $("span");
      prefixSpan.textContent = `${prefix}:`;
      labelElement.appendChild(prefixSpan);
      const descSpan = $("span.chat-thinking-title-detail-text");
      descSpan.textContent = ` ${this.description}`;
      labelElement.appendChild(descSpan);
      this._collapseButton.element.ariaLabel = shimmerText;
      this._collapseButton.element.ariaExpanded = String(this.isExpanded());
      return;
    }
    if (!this.titleShimmerSpan || !this.titleShimmerSpan.parentElement) {
      labelElement.textContent = "";
      this.titleShimmerSpan = $("span.chat-thinking-title-shimmer");
      labelElement.appendChild(this.titleShimmerSpan);
    }
    this.titleShimmerSpan.textContent = shimmerText;
    if (this.titleDetailRendered) {
      this.titleDetailRendered.dispose();
      this.titleDetailRendered = void 0;
    }
    if (!toolCallText) {
      if (this.titleDetailContainer) {
        this.titleDetailContainer.remove();
        this.titleDetailContainer = void 0;
      }
    } else {
      const result = this.chatContentMarkdownRenderer.render(new MarkdownString(toolCallText));
      result.element.classList.add("collapsible-title-content", "chat-thinking-title-detail");
      renderFileWidgets(result.element, this.instantiationService, this.chatMarkdownAnchorService, this._store);
      this.titleDetailRendered = result;
      if (this.titleDetailContainer) {
        this.titleDetailContainer.replaceWith(result.element);
      } else {
        labelElement.appendChild(result.element);
      }
      this.titleDetailContainer = result.element;
    }
    const fullLabel = `${shimmerText}${toolCallText}`;
    this._collapseButton.element.ariaLabel = fullLabel;
    this._collapseButton.element.ariaExpanded = String(this.isExpanded());
  }
  updateHover() {
    if (!this.modelName || !this._collapseButton) {
      return;
    }
    this._hoverDisposable.value = this.hoverService.setupDelayedHover(this._collapseButton.element, {
      content: localize("chat.subagent.modelTooltip", "Model: {0}", this.modelName)
    });
  }
  /**
   * Tracks a tool invocation's state for:
   * 1. Updating the title with the current tool message (persists even after completion)
   * 2. Auto-expanding when a tool is waiting for confirmation
   * 3. Auto-collapsing when the confirmation is addressed
   * This method is public to support testing.
   */
  trackToolState(toolInvocation) {
    if (toolInvocation.kind !== "toolInvocation") {
      return;
    }
    const message = toolInvocation.invocationMessage;
    const messageText = typeof message === "string" ? message : message.value;
    this.currentRunningToolMessage = messageText;
    this.updateTitle();
    let wasWaitingForConfirmation = false;
    this._register(autorun((r) => {
      const state = toolInvocation.state.read(r);
      const isWaitingForConfirmation = state.type === 1 || state.type === 3;
      if (isWaitingForConfirmation && !wasWaitingForConfirmation) {
        this.toolsWaitingForConfirmation++;
        if (!this.isExpanded()) {
          this.autoExpandedForConfirmation = true;
          this.setExpanded(true);
        }
      } else if (!isWaitingForConfirmation && wasWaitingForConfirmation) {
        this.toolsWaitingForConfirmation--;
        if (this.toolsWaitingForConfirmation === 0 && this.autoExpandedForConfirmation && !this.userManuallyExpanded) {
          this.autoExpandedForConfirmation = false;
          this.setExpanded(false);
        }
      }
      wasWaitingForConfirmation = isWaitingForConfirmation;
    }));
  }
  /**
   * Watches the tool invocation for completion and renders the result.
   * Handles both live and serialized invocations.
   */
  watchToolCompletion(toolInvocation) {
    if (!ChatSubagentContentPart_1.isParentSubagentTool(toolInvocation)) {
      return;
    }
    if (toolInvocation.kind === "toolInvocation") {
      let wasStreaming = toolInvocation.state.get().type === 0;
      this._register(autorun((r) => {
        const state = toolInvocation.state.read(r);
        if (state.type === 4) {
          wasStreaming = false;
          const textParts = (state.contentForModel || []).filter((part) => part.kind === "text").map((part) => part.value);
          if (textParts.length > 0) {
            this.renderResultText(textParts.join("\n"));
          }
          if (toolInvocation.toolSpecificData?.kind === "subagent" && toolInvocation.toolSpecificData.modelName) {
            this.modelName = toolInvocation.toolSpecificData.modelName;
            this.updateHover();
          }
          this.markAsInactive();
        } else if (wasStreaming && state.type !== 0) {
          wasStreaming = false;
          const { description, agentName, prompt, modelName } = ChatSubagentContentPart_1.extractSubagentInfo(toolInvocation);
          this.description = description;
          this.agentName = agentName;
          this.prompt = prompt;
          if (modelName) {
            this.modelName = modelName;
            this.updateHover();
          }
          this.renderPromptSection();
          this.updateTitle();
        }
      }));
    } else if (toolInvocation.toolSpecificData?.kind === "subagent" && toolInvocation.toolSpecificData.result) {
      this.renderResultText(toolInvocation.toolSpecificData.result);
      this.markAsInactive();
    }
  }
  /**
   * Renders the result text as a collapsible section.
   * If the wrapper doesn't exist yet (lazy init) or subagent is initially complete,
   * this is deferred until expanded.
   */
  renderResultText(resultText) {
    if (this.resultContainer || !resultText) {
      return;
    }
    if (!this.wrapper || this.isInitiallyComplete && !this.isExpanded() && !this.hasExpandedOnce) {
      this.pendingResultText = resultText;
      return;
    }
    this.pendingResultText = void 0;
    this.doRenderResultText(resultText);
  }
  doRenderResultText(resultText) {
    if (this.resultContainer || !resultText) {
      return;
    }
    const lines = resultText.split("\n");
    const rawFirstLine = lines[0] || "";
    const restOfLines = lines.slice(1).join("\n").trim();
    const titleContent = rcut(rawFirstLine, MAX_TITLE_LENGTH);
    const wasTruncated = rawFirstLine.length > MAX_TITLE_LENGTH;
    const title = wasTruncated ? titleContent + "\u2026" : titleContent;
    const titleRemainder = rawFirstLine.length > titleContent.length ? rawFirstLine.slice(titleContent.length).trim() : "";
    const content = titleRemainder ? titleRemainder + (restOfLines ? "\n" + restOfLines : "") : restOfLines;
    const collapsiblePart = this._register(this.instantiationService.createInstance(ChatCollapsibleMarkdownContentPart, title, content, this.context, this.chatContentMarkdownRenderer));
    this.resultContainer = $(".chat-thinking-tool-wrapper.chat-subagent-section");
    const resultIcon = createThinkingIcon(Codicon.check);
    this.resultContainer.appendChild(resultIcon);
    this.resultContainer.appendChild(collapsiblePart.domNode);
    if (this.wrapper) {
      dom.append(this.wrapper, this.resultContainer);
      if (this.wrapper.style.display === "none") {
        this.wrapper.style.display = "";
      }
    }
  }
  /**
   * Appends a tool invocation to the subagent group.
   * The tool part is created lazily - only when the subagent section is expanded,
   * unless it's actively streaming (not initially complete), in which case render immediately.
   */
  appendToolInvocation(toolInvocation, codeBlockStartIndex) {
    if (!this.hasToolItems) {
      this.hasToolItems = true;
      if (this.wrapper) {
        this.wrapper.style.display = "";
      }
    }
    this.trackToolState(toolInvocation);
    if (this.isExpanded() || this.hasExpandedOnce) {
      const part = this.createToolPart(toolInvocation, codeBlockStartIndex);
      this.appendToolPartToDOM(part, toolInvocation);
    } else {
      const item = {
        kind: "tool",
        lazy: new Lazy(() => this.createToolPart(toolInvocation, codeBlockStartIndex)),
        toolInvocation,
        codeBlockStartIndex
      };
      this.lazyItems.push(item);
    }
  }
  /**
   * Appends a markdown item (e.g., an edit pill) to the subagent content part.
   * This is used to route codeblockUri parts with subAgentInvocationId to this subagent's container.
   */
  appendMarkdownItem(factory, _codeblocksPartId, _markdown, _originalParent) {
    if (this.isExpanded() || this.hasExpandedOnce) {
      const result = factory();
      this.appendMarkdownItemToDOM(result.domNode);
      if (result.disposable) {
        this._register(result.disposable);
      }
    } else {
      const item = {
        kind: "markdown",
        lazy: new Lazy(factory)
      };
      this.lazyItems.push(item);
    }
  }
  /**
   * Appends a hook item (blocked/warning) to the subagent content part.
   */
  appendHookItem(factory, hookPart) {
    const hookMessage = hookPart.stopReason ? hookPart.toolDisplayName ? localize("hook.subagent.blocked", "Blocked {0}", hookPart.toolDisplayName) : localize("hook.subagent.blockedGeneric", "Blocked by hook") : hookPart.toolDisplayName ? localize("hook.subagent.warning", "Warning for {0}", hookPart.toolDisplayName) : localize("hook.subagent.warningGeneric", "Hook warning");
    this.currentRunningToolMessage = hookMessage;
    this.updateTitle();
    if (this.isExpanded() || this.hasExpandedOnce) {
      const result = factory();
      this.appendHookItemToDOM(result.domNode, hookPart);
      if (result.disposable) {
        this._register(result.disposable);
      }
    } else {
      const item = {
        kind: "hook",
        lazy: new Lazy(factory),
        hookPart
      };
      this.lazyItems.push(item);
    }
  }
  /**
   * Appends a hook item's DOM node to the wrapper.
   */
  appendHookItemToDOM(domNode, hookPart) {
    const itemWrapper = $(".chat-thinking-tool-wrapper");
    const icon = hookPart.stopReason ? Codicon.error : Codicon.warning;
    const iconElement = createThinkingIcon(icon);
    itemWrapper.appendChild(iconElement);
    itemWrapper.appendChild(domNode);
    if (!this.hasToolItems) {
      this.hasToolItems = true;
      if (this.wrapper) {
        this.wrapper.style.display = "";
      }
    }
    if (this.wrapper) {
      if (this.resultContainer) {
        this.wrapper.insertBefore(itemWrapper, this.resultContainer);
      } else {
        this.wrapper.appendChild(itemWrapper);
      }
    }
    this.lastItemWrapper = itemWrapper;
    this.layoutScheduler.schedule();
  }
  /**
   * Appends a markdown item's DOM node to the wrapper.
   */
  appendMarkdownItemToDOM(domNode) {
    if (!domNode.hasChildNodes() || domNode.textContent?.trim() === "") {
      return;
    }
    const itemWrapper = $(".chat-thinking-tool-wrapper");
    const iconElement = createThinkingIcon(Codicon.edit);
    itemWrapper.appendChild(domNode);
    itemWrapper.insertBefore(iconElement, itemWrapper.firstChild);
    if (this.wrapper) {
      if (this.resultContainer) {
        this.wrapper.insertBefore(itemWrapper, this.resultContainer);
      } else {
        this.wrapper.appendChild(itemWrapper);
      }
    }
    this.lastItemWrapper = itemWrapper;
    this.layoutScheduler.schedule();
  }
  shouldInitEarly() {
    return false;
  }
  /**
   * Creates a ChatToolInvocationPart for the given tool invocation.
   */
  createToolPart(toolInvocation, codeBlockStartIndex) {
    const part = this.instantiationService.createInstance(ChatToolInvocationPart, toolInvocation, this.context, this.chatContentMarkdownRenderer, this.listPool, this.editorPool, this.currentWidthDelegate, this.codeBlockModelCollection, this.announcedToolProgressKeys, codeBlockStartIndex);
    this._register(part);
    return part;
  }
  /**
   * Appends a tool part's DOM node to the wrapper with appropriate icon wrapper.
   */
  appendToolPartToDOM(part, toolInvocation) {
    const content = part.domNode;
    if (!content.hasChildNodes() || content.textContent?.trim() === "") {
      return;
    }
    const itemWrapper = $(".chat-thinking-tool-wrapper");
    const icon = getToolInvocationIcon(toolInvocation.toolId);
    const iconElement = createThinkingIcon(icon);
    itemWrapper.appendChild(content);
    if (toolInvocation.kind === "toolInvocation") {
      this._register(autorun((r) => {
        const state = toolInvocation.state.read(r);
        const hasConfirmation = state.type === 1 || state.type === 3;
        if (hasConfirmation) {
          iconElement.remove();
        } else if (!iconElement.parentElement) {
          itemWrapper.insertBefore(iconElement, itemWrapper.firstChild);
        }
      }));
    } else {
      itemWrapper.insertBefore(iconElement, itemWrapper.firstChild);
    }
    if (this.wrapper) {
      if (this.resultContainer) {
        this.wrapper.insertBefore(itemWrapper, this.resultContainer);
      } else {
        this.wrapper.appendChild(itemWrapper);
      }
    }
    this.lastItemWrapper = itemWrapper;
    this.layoutScheduler.schedule();
  }
  /**
   * Materializes a lazy item by creating the content and adding it to the DOM.
   */
  materializeLazyItem(item) {
    if (item.lazy.hasValue) {
      return;
    }
    if (item.kind === "tool") {
      const part = item.lazy.value;
      this.appendToolPartToDOM(part, item.toolInvocation);
    } else if (item.kind === "markdown") {
      const result = item.lazy.value;
      this.appendMarkdownItemToDOM(result.domNode);
      if (result.disposable) {
        this._register(result.disposable);
      }
    } else if (item.kind === "hook") {
      const result = item.lazy.value;
      this.appendHookItemToDOM(result.domNode, item.hookPart);
      if (result.disposable) {
        this._register(result.disposable);
      }
    }
  }
  /**
   * Materializes all pending lazy content (prompt, tool items, result) when the section is expanded.
   * This is called when first expanded, but the wrapper must exist (created by base class initContent).
   */
  materializePendingContent() {
    if (!this.wrapper) {
      return;
    }
    if (this.pendingPromptRender) {
      this.pendingPromptRender = false;
      this.doRenderPromptSection();
    }
    for (const item of this.lazyItems) {
      this.materializeLazyItem(item);
    }
    if (this.pendingResultText) {
      const resultText = this.pendingResultText;
      this.pendingResultText = void 0;
      this.doRenderResultText(resultText);
    }
  }
  performLayout() {
    if (this.lastItemWrapper && this.wrapper) {
      const height = this.lastItemWrapper.offsetHeight;
      if (height > 0) {
        this.wrapper.style.setProperty("--chat-subagent-last-item-height", `${height}px`);
      }
    }
    if (this.isActive && !this.isInitiallyComplete && this.wrapper) {
      const scrollHeight = this.wrapper.scrollHeight;
      this.wrapper.scrollTop = scrollHeight;
    }
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind === "markdownContent") {
      return true;
    }
    if (other.kind === "hook" && other.subAgentInvocationId) {
      return this.subAgentInvocationId === other.subAgentInvocationId;
    }
    if ((other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && (other.subAgentInvocationId || ChatSubagentContentPart_1.isParentSubagentTool(other))) {
      const otherEffectiveId = other.subAgentInvocationId ?? other.toolCallId;
      if (this.subAgentInvocationId && otherEffectiveId) {
        return this.subAgentInvocationId === otherEffectiveId;
      }
      return !this.subAgentInvocationId && !otherEffectiveId;
    }
    return false;
  }
};
ChatSubagentContentPart = ChatSubagentContentPart_1 = __decorate([
  __param(9, IInstantiationService),
  __param(10, IChatMarkdownAnchorService),
  __param(11, IHoverService),
  __param(12, IConfigurationService)
], ChatSubagentContentPart);
export {
  ChatSubagentContentPart
};
//# sourceMappingURL=chatSubagentContentPart.js.map
