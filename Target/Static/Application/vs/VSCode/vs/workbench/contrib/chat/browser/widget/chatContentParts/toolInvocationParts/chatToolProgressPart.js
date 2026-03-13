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
import * as dom from "../../../../../../../base/browser/dom.js";
import { renderAsPlaintext } from "../../../../../../../base/browser/markdownRenderer.js";
import { status } from "../../../../../../../base/browser/ui/aria/aria.js";
import { MarkdownString } from "../../../../../../../base/common/htmlContent.js";
import { stripIcons } from "../../../../../../../base/common/iconLabels.js";
import { autorun } from "../../../../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
import { ChatProgressContentPart } from "../chatProgressContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
let ChatToolProgressSubPart = class ChatToolProgressSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatToolProgressSubPart");
  }
  constructor(toolInvocation, context, renderer, announcedToolProgressKeys, instantiationService, configurationService) {
    super(toolInvocation);
    this.context = context;
    this.renderer = renderer;
    this.announcedToolProgressKeys = announcedToolProgressKeys;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.codeblocks = [];
    this.domNode = this.createProgressPart();
    const updateCheckmarks = /* @__PURE__ */ __name(() => this.domNode.classList.toggle("show-checkmarks", !!this.configurationService.getValue(
      "accessibility.chat.showCheckmarks"
      /* AccessibilityWorkbenchSettingId.ShowChatCheckmarks */
    )), "updateCheckmarks");
    updateCheckmarks();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "accessibility.chat.showCheckmarks"
        /* AccessibilityWorkbenchSettingId.ShowChatCheckmarks */
      )) {
        updateCheckmarks();
      }
    }));
  }
  createProgressPart() {
    const isComplete = IChatToolInvocation.isComplete(this.toolInvocation);
    if (isComplete && this.toolIsConfirmed && this.toolInvocation.pastTenseMessage) {
      const key = this.getAnnouncementKey("complete");
      const completionContent = this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage;
      if (!this.hasMeaningfulContent(completionContent)) {
        return document.createElement("div");
      }
      const shouldAnnounce = this.toolInvocation.kind === "toolInvocation" && this.hasMeaningfulContent(completionContent) ? this.computeShouldAnnounce(key) : false;
      const part = this.renderProgressContent(completionContent, shouldAnnounce);
      this._register(part);
      return part.domNode;
    } else {
      const container = document.createElement("div");
      this._register(autorun((reader) => {
        let progressContent;
        const key = this.getAnnouncementKey("progress");
        if (this.toolInvocation.kind === "toolInvocation") {
          const state = this.toolInvocation.state.read(reader);
          if (state.type === 5 && state.reasonMessage) {
            progressContent = state.reasonMessage;
          } else if (state.type === 2) {
            const progress = state.progress.read(reader);
            progressContent = progress?.message ?? this.toolInvocation.invocationMessage;
          } else {
            progressContent = this.toolInvocation.invocationMessage;
          }
        } else {
          progressContent = this.toolInvocation.invocationMessage;
        }
        if (!this.hasMeaningfulContent(progressContent)) {
          dom.clearNode(container);
          return;
        }
        const shouldAnnounce = this.toolInvocation.kind === "toolInvocation" && this.hasMeaningfulContent(progressContent) ? this.computeShouldAnnounce(key) : false;
        const part = reader.store.add(this.renderProgressContent(progressContent, shouldAnnounce));
        dom.reset(container, part.domNode);
      }));
      return container;
    }
  }
  get toolIsConfirmed() {
    const c = IChatToolInvocation.executionConfirmedOrDenied(this.toolInvocation);
    return !!c && c.type !== 0;
  }
  renderProgressContent(content, shouldAnnounce) {
    if (typeof content === "string") {
      content = new MarkdownString().appendText(content);
    }
    const progressMessage = {
      kind: "progressMessage",
      content
    };
    if (shouldAnnounce) {
      this.provideScreenReaderStatus(content);
    }
    const isAskQuestionsTool = this.toolInvocation.toolId === "copilot_askQuestions" || this.toolInvocation.toolId === "vscode_askQuestions";
    return this.instantiationService.createInstance(ChatProgressContentPart, progressMessage, this.renderer, this.context, void 0, true, this.getIcon(), this.toolInvocation, isAskQuestionsTool ? void 0 : false);
  }
  getAnnouncementKey(kind) {
    return `${kind}:${this.toolInvocation.toolCallId}`;
  }
  computeShouldAnnounce(key) {
    if (!this.announcedToolProgressKeys) {
      return false;
    }
    if (!this.configurationService.getValue(
      "accessibility.verboseChatProgressUpdates"
      /* AccessibilityWorkbenchSettingId.VerboseChatProgressUpdates */
    )) {
      return false;
    }
    if (this.announcedToolProgressKeys.has(key)) {
      return false;
    }
    this.announcedToolProgressKeys.add(key);
    return true;
  }
  provideScreenReaderStatus(content) {
    const message = typeof content === "string" ? content : stripIcons(renderAsPlaintext(content, { useLinkFormatter: true }));
    status(message);
  }
  hasMeaningfulContent(content) {
    if (!content) {
      return false;
    }
    const text = typeof content === "string" ? content : content.value;
    return text.trim().length > 0;
  }
};
ChatToolProgressSubPart = __decorate([
  __param(4, IInstantiationService),
  __param(5, IConfigurationService)
], ChatToolProgressSubPart);
export {
  ChatToolProgressSubPart
};
//# sourceMappingURL=chatToolProgressPart.js.map
