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
import { $ } from "../../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { rcut } from "../../../../../../base/common/strings.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ChatCollapsibleContentPart } from "./chatCollapsibleContentPart.js";
import { ChatCollapsibleMarkdownContentPart } from "./chatCollapsibleMarkdownContentPart.js";
import { RunSubagentTool } from "../../../common/tools/builtinTools/runSubagentTool.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { createThinkingIcon, getToolInvocationIcon } from "./chatThinkingContentPart.js";
import "./media/chatSubagentContent.css";
const MAX_TITLE_LENGTH = 100;
let ChatSubagentContentPart = ChatSubagentContentPart_1 = class ChatSubagentContentPart2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatSubagentContentPart");
  }
  /**
   * Extracts subagent info (description, agentName, prompt) from a tool invocation.
   */
  static extractSubagentInfo(toolInvocation) {
    const defaultDescription = localize("chat.subagent.defaultDescription", "Running subagent...");
    if (toolInvocation.toolId !== RunSubagentTool.Id) {
      return { description: defaultDescription, agentName: void 0, prompt: void 0 };
    }
    if (toolInvocation.toolSpecificData?.kind === "subagent") {
      return {
        description: toolInvocation.toolSpecificData.description ?? defaultDescription,
        agentName: toolInvocation.toolSpecificData.agentName,
        prompt: toolInvocation.toolSpecificData.prompt
      };
    }
    if (toolInvocation.kind === "toolInvocation") {
      const state = toolInvocation.state.get();
      const params = state.type !== 0 ? state.parameters : void 0;
      return {
        description: params?.description ?? defaultDescription,
        agentName: params?.agentName,
        prompt: params?.prompt
      };
    }
    return { description: defaultDescription, agentName: void 0, prompt: void 0 };
  }
  constructor(subAgentInvocationId, toolInvocation, context, chatContentMarkdownRenderer, instantiationService, hoverService) {
    const { description, agentName, prompt } = ChatSubagentContentPart_1.extractSubagentInfo(toolInvocation);
    const prefix = agentName || localize("chat.subagent.prefix", "Subagent");
    const initialTitle = `${prefix}: ${description}`;
    super(initialTitle, context, void 0, hoverService);
    this.subAgentInvocationId = subAgentInvocationId;
    this.context = context;
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.instantiationService = instantiationService;
    this.isActive = true;
    this.hasToolItems = false;
    this.description = description;
    this.agentName = agentName;
    this.prompt = prompt;
    this.isInitiallyComplete = this.element.isComplete;
    const node = this.domNode;
    node.classList.add("chat-thinking-box", "chat-thinking-fixed-mode", "chat-subagent-part");
    node.tabIndex = 0;
    this.wrapper.style.display = "none";
    if (this._collapseButton && !this.element.isComplete) {
      this._collapseButton.icon = ThemeIcon.modify(Codicon.loading, "spin");
    }
    this._register(autorun((r) => {
      this.expanded.read(r);
      if (this._collapseButton && this.wrapper) {
        if (this.wrapper.classList.contains("chat-thinking-streaming") && !this.element.isComplete && this.isActive) {
          this._collapseButton.icon = ThemeIcon.modify(Codicon.loading, "spin");
        } else {
          this._collapseButton.icon = Codicon.check;
        }
      }
    }));
    this.setExpanded(false);
    this.layoutScheduler = this._register(new RunOnceScheduler(() => this.performLayout(), 0));
    this.renderPromptSection();
    this.watchToolCompletion(toolInvocation);
  }
  initContent() {
    const baseClasses = ".chat-used-context-list.chat-thinking-collapsible";
    const classes = this.isInitiallyComplete ? baseClasses : `${baseClasses}.chat-thinking-streaming`;
    this.wrapper = $(classes);
    return this.wrapper;
  }
  /**
   * Renders the prompt as a collapsible section at the start of the content.
   */
  renderPromptSection() {
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
    collapsiblePart.icon = Codicon.comment;
    this._register(collapsiblePart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this.promptContainer = collapsiblePart.domNode;
    if (this.wrapper.firstChild) {
      this.wrapper.insertBefore(this.promptContainer, this.wrapper.firstChild);
    } else {
      dom.append(this.wrapper, this.promptContainer);
    }
  }
  getIsActive() {
    return this.isActive;
  }
  markAsInactive() {
    this.isActive = false;
    this.wrapper.classList.remove("chat-thinking-streaming");
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
    }
    this.finalizeTitle();
    this.setExpanded(false);
    this._onDidChangeHeight.fire();
  }
  finalizeTitle() {
    this.updateTitle();
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
    }
  }
  updateTitle() {
    if (this._collapseButton) {
      const prefix = this.agentName || localize("chat.subagent.prefix", "Subagent");
      const finalLabel = `${prefix}: ${this.description}`;
      this._collapseButton.label = finalLabel;
    }
  }
  /**
   * Watches the tool invocation for completion and renders the result.
   * Handles both live and serialized invocations.
   */
  watchToolCompletion(toolInvocation) {
    if (toolInvocation.toolId !== RunSubagentTool.Id) {
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
          this.markAsInactive();
        } else if (wasStreaming && state.type !== 0) {
          wasStreaming = false;
          const { description, agentName, prompt } = ChatSubagentContentPart_1.extractSubagentInfo(toolInvocation);
          this.description = description;
          this.agentName = agentName;
          this.prompt = prompt;
          this.renderPromptSection();
          this.updateTitle();
        }
      }));
    } else if (toolInvocation.toolSpecificData?.kind === "subagent" && toolInvocation.toolSpecificData.result) {
      this.renderResultText(toolInvocation.toolSpecificData.result);
      this.markAsInactive();
    }
  }
  renderResultText(resultText) {
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
    this._register(collapsiblePart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this.resultContainer = collapsiblePart.domNode;
    dom.append(this.wrapper, this.resultContainer);
    if (this.wrapper.style.display === "none") {
      this.wrapper.style.display = "";
    }
    this._onDidChangeHeight.fire();
  }
  appendItem(content, toolInvocation) {
    if (!content.hasChildNodes() || content.textContent?.trim() === "") {
      return;
    }
    if (!this.hasToolItems) {
      this.hasToolItems = true;
      this.wrapper.style.display = "";
    }
    const itemWrapper = $(".chat-thinking-tool-wrapper");
    let needsConfirmation = false;
    if (toolInvocation.kind === "toolInvocation" && toolInvocation.state) {
      const state = toolInvocation.state.get();
      needsConfirmation = state.type === 1 || state.type === 3;
    }
    if (!needsConfirmation) {
      const icon = getToolInvocationIcon(toolInvocation.toolId);
      const iconElement = createThinkingIcon(icon);
      itemWrapper.appendChild(iconElement);
    }
    itemWrapper.appendChild(content);
    if (this.resultContainer) {
      this.wrapper.insertBefore(itemWrapper, this.resultContainer);
    } else {
      this.wrapper.appendChild(itemWrapper);
    }
    this.lastItemWrapper = itemWrapper;
    if (toolInvocation.kind === "toolInvocation") {
      this._register(autorun((r) => {
        const state = toolInvocation.state.read(r);
        if (state.type === 4) {
          this._onDidChangeHeight.fire();
        }
      }));
    }
    this.layoutScheduler.schedule();
  }
  performLayout() {
    if (this.lastItemWrapper) {
      const itemHeight = this.lastItemWrapper.offsetHeight;
      const height = itemHeight + 4;
      if (height > 0) {
        this.wrapper.style.setProperty("--chat-subagent-last-item-height", `${height}px`);
      }
    }
    if (this.isActive && !this.isInitiallyComplete) {
      const scrollHeight = this.wrapper.scrollHeight;
      this.wrapper.scrollTop = scrollHeight;
    }
    this._onDidChangeHeight.fire();
  }
  hasSameContent(other, _followingContent, _element) {
    if ((other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && (other.subAgentInvocationId || other.toolId === RunSubagentTool.Id)) {
      const otherEffectiveId = other.toolId === RunSubagentTool.Id ? other.toolCallId : other.subAgentInvocationId;
      if (this.subAgentInvocationId && otherEffectiveId) {
        return this.subAgentInvocationId === otherEffectiveId;
      }
      return !this.subAgentInvocationId && !otherEffectiveId;
    }
    return false;
  }
};
ChatSubagentContentPart = ChatSubagentContentPart_1 = __decorate([
  __param(4, IInstantiationService),
  __param(5, IHoverService)
], ChatSubagentContentPart);
export {
  ChatSubagentContentPart
};
//# sourceMappingURL=chatSubagentContentPart.js.map
