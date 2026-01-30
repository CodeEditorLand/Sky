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
import { $, clearNode, hide } from "../../../../../../base/browser/dom.js";
import { alert } from "../../../../../../base/browser/ui/aria/aria.js";
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
import { autorun } from "../../../../../../base/common/observable.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
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
    return Codicon.wand;
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
let ChatThinkingContentPart = class ChatThinkingContentPart2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatThinkingContentPart");
  }
  constructor(content, context, chatContentMarkdownRenderer, instantiationService, configurationService, chatMarkdownAnchorService, languageModelsService, hoverService) {
    const initialText = extractTextFromPart(content);
    const extractedTitle = extractTitleFromThinkingContent(initialText) ?? "Working...";
    super(extractedTitle, context, void 0, hoverService);
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.languageModelsService = languageModelsService;
    this.defaultTitle = localize("chat.thinking.header", "Working...");
    this.fixedScrollingMode = false;
    this.extractedTitles = [];
    this.toolInvocationCount = 0;
    this.appendedItemCount = 0;
    this.streamingCompleted = false;
    this.isActive = true;
    this.toolInvocations = [];
    this.id = content.id;
    this.content = content;
    const configuredMode = this.configurationService.getValue("chat.agent.thinkingStyle") ?? ThinkingDisplayMode.Collapsed;
    this.fixedScrollingMode = configuredMode === ThinkingDisplayMode.FixedScrolling;
    this.currentTitle = extractedTitle;
    if (extractedTitle !== this.defaultTitle) {
      this.lastExtractedTitle = extractedTitle;
    }
    this.currentThinkingValue = initialText;
    alert(localize("chat.thinking.started", "Thinking"));
    if (configuredMode === ThinkingDisplayMode.Collapsed) {
      this.setExpanded(false);
    } else {
      this.setExpanded(true);
    }
    if (this.fixedScrollingMode) {
      this.setExpanded(false);
    }
    const node = this.domNode;
    node.classList.add("chat-thinking-box");
    node.tabIndex = 0;
    if (this.fixedScrollingMode) {
      node.classList.add("chat-thinking-fixed-mode");
      this.currentTitle = this.defaultTitle;
      if (this._collapseButton && !this.element.isComplete) {
        this._collapseButton.icon = ThemeIcon.modify(Codicon.loading, "spin");
      }
    }
    this._register(autorun((r) => {
      this.expanded.read(r);
      if (this._collapseButton && this.wrapper) {
        if (this.wrapper.classList.contains("chat-thinking-streaming") && !this.element.isComplete) {
          this._collapseButton.icon = ThemeIcon.modify(Codicon.loading, "spin");
        } else {
          this._collapseButton.icon = Codicon.check;
        }
      }
    }));
    if (this._collapseButton && !this.streamingCompleted && !this.element.isComplete) {
      this._collapseButton.icon = ThemeIcon.modify(Codicon.loading, "spin");
    }
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
  // @TODO: @justschen Convert to template for each setting?
  initContent() {
    this.wrapper = $(".chat-used-context-list.chat-thinking-collapsible");
    this.wrapper.classList.add("chat-thinking-streaming");
    if (this.currentThinkingValue) {
      this.textContainer = $(".chat-thinking-item.markdown-content");
      this.wrapper.appendChild(this.textContainer);
      this.renderMarkdown(this.currentThinkingValue);
    }
    this.updateDropdownClickability();
    return this.wrapper;
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
      clearNode(this.textContainer);
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
      clearNode(this.textContainer);
      this.textContainer.appendChild(createThinkingIcon(Codicon.comment));
      this.textContainer.appendChild(rendered.element);
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
    if (this.wrapper.children.length > 1 || this.toolInvocationCount > 0) {
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
    const raw = extractTextFromPart(content);
    const next = raw;
    if (next === this.currentThinkingValue) {
      return;
    }
    const previousValue = this.currentThinkingValue;
    const reuseExisting = !!(this.markdownResult && next.startsWith(previousValue) && next.length > previousValue.length);
    this.currentThinkingValue = next;
    this.renderMarkdown(next, reuseExisting);
    if (this.fixedScrollingMode && this.wrapper) {
      this.wrapper.scrollTop = this.wrapper.scrollHeight;
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
  }
  finalizeTitleIfDefault() {
    this.wrapper.classList.remove("chat-thinking-streaming");
    this.streamingCompleted = true;
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
    }
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
    try {
      let models = await this.languageModelsService.selectLanguageModels({ vendor: "copilot", id: "copilot-fast" });
      if (!models.length) {
        models = await this.languageModelsService.selectLanguageModels({ vendor: "copilot", family: "gpt-4o-mini" });
      }
      if (!models.length) {
        this.setFallbackTitle();
        return;
      }
      let context;
      if (this.extractedTitles.length > 0) {
        context = this.extractedTitles.join(", ");
      } else {
        context = this.currentThinkingValue.substring(0, 1e3);
      }
      const prompt = `Summarize the following actions in 6-7 words using past tense. Be very concise - focus on the main action only. No subjects, quotes, or punctuation.

			Examples:
			- "Preparing to create new page file, Read HomePage.tsx, Creating new TypeScript file" \u2192 "Created new page file"
			- "Searching for files, Reading configuration, Analyzing dependencies" \u2192 "Analyzed project structure"
			- "Invoked terminal command, Checked build output, Fixed errors" \u2192 "Ran build and fixed errors"

			Actions: ${context}`;
      const response = await this.languageModelsService.sendChatRequest(models[0], new ExtensionIdentifier("core"), [{ role: 1, content: [{ type: "text", value: prompt }] }], {}, CancellationToken.None);
      let generatedTitle = "";
      for await (const part of response.stream) {
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
      await response.result;
      generatedTitle = generatedTitle.trim();
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
    const finalLabel = this.toolInvocationCount > 0 ? localize("chat.thinking.finished.withTools", "Finished working and invoked {0} tool{1}", this.toolInvocationCount, this.toolInvocationCount === 1 ? "" : "s") : localize("chat.thinking.finished", "Finished Working");
    this.currentTitle = finalLabel;
    this.wrapper.classList.remove("chat-thinking-streaming");
    this.streamingCompleted = true;
    if (this._collapseButton) {
      this._collapseButton.icon = Codicon.check;
      this._collapseButton.label = finalLabel;
    }
    this.updateDropdownClickability();
  }
  appendItem(content, toolInvocationId, toolInvocationOrMarkdown, originalParent) {
    if (!content.hasChildNodes() || content.textContent?.trim() === "") {
      return;
    }
    if (this.appendedItemCount === 0 && originalParent) {
      this.singleItemInfo = {
        element: content,
        originalParent,
        originalNextSibling: this.domNode
      };
    } else {
      this.singleItemInfo = void 0;
    }
    this.appendedItemCount++;
    const itemWrapper = $(".chat-thinking-tool-wrapper");
    const isMarkdownEdit = toolInvocationOrMarkdown?.kind === "markdownContent";
    const isTerminalTool = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized") && toolInvocationOrMarkdown.toolSpecificData?.kind === "terminal";
    let icon;
    if (isMarkdownEdit) {
      icon = Codicon.wand;
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
    this.wrapper.appendChild(itemWrapper);
    if (toolInvocationId) {
      this.toolInvocationCount++;
      let toolCallLabel;
      const isToolInvocation = toolInvocationOrMarkdown && (toolInvocationOrMarkdown.kind === "toolInvocation" || toolInvocationOrMarkdown.kind === "toolInvocationSerialized");
      if (isToolInvocation && toolInvocationOrMarkdown.invocationMessage) {
        const message = typeof toolInvocationOrMarkdown.invocationMessage === "string" ? toolInvocationOrMarkdown.invocationMessage : toolInvocationOrMarkdown.invocationMessage.value;
        toolCallLabel = message;
        this.toolInvocations.push(toolInvocationOrMarkdown);
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
      if (!this.fixedScrollingMode && !this._isExpanded.get()) {
        this.setTitle(toolCallLabel);
      }
    }
    if (this.fixedScrollingMode && this.wrapper) {
      this.wrapper.scrollTop = this.wrapper.scrollHeight;
    }
    this.updateDropdownClickability();
  }
  // makes a new text container. when we update, we now update this container.
  setupThinkingContainer(content, context) {
    if (this._store.isDisposed) {
      return;
    }
    this.textContainer = $(".chat-thinking-item.markdown-content");
    if (content.value) {
      this.wrapper.appendChild(this.textContainer);
      this.id = content.id;
      this.updateThinking(content);
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
    super.dispose();
  }
};
ChatThinkingContentPart = __decorate([
  __param(3, IInstantiationService),
  __param(4, IConfigurationService),
  __param(5, IChatMarkdownAnchorService),
  __param(6, ILanguageModelsService),
  __param(7, IHoverService)
], ChatThinkingContentPart);
export {
  ChatThinkingContentPart,
  createThinkingIcon,
  getToolInvocationIcon
};
//# sourceMappingURL=chatThinkingContentPart.js.map
