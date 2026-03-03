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
import { $, append } from "../../../../../../base/browser/dom.js";
import { alert } from "../../../../../../base/browser/ui/aria/aria.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { localize } from "../../../../../../nls.js";
import { isResponseVM } from "../../../common/model/chatViewModel.js";
import { renderFileWidgets } from "./chatInlineAnchorWidget.js";
import { getToolApprovalMessage } from "./toolInvocationParts/chatToolPartUtilities.js";
import { IChatMarkdownAnchorService } from "./chatMarkdownAnchorService.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { ILanguageModelToolsService } from "../../../common/tools/languageModelToolsService.js";
import { isEqual } from "../../../../../../base/common/resources.js";
let ChatProgressContentPart = class ChatProgressContentPart2 extends Disposable {
  static {
    __name(this, "ChatProgressContentPart");
  }
  constructor(progress, chatContentMarkdownRenderer, context, forceShowSpinner, forceShowMessage, icon, toolInvocation, shimmer, instantiationService, chatMarkdownAnchorService, configurationService) {
    super();
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.toolInvocation = toolInvocation;
    this.instantiationService = instantiationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.configurationService = configurationService;
    this.renderedMessage = this._register(new MutableDisposable());
    this._fileWidgetStore = this._register(new DisposableStore());
    this.currentContent = progress.content;
    const followingContent = context.content.slice(context.contentIndex + 1);
    this.showSpinner = forceShowSpinner ?? shouldShowSpinner(followingContent, context.element);
    this.isHidden = forceShowMessage !== true && followingContent.some((part) => part.kind !== "progressMessage");
    if (this.isHidden) {
      this.domNode = $("");
      return;
    }
    if (this.showSpinner && !this.configurationService.getValue(
      "accessibility.verboseChatProgressUpdates"
      /* AccessibilityWorkbenchSettingId.VerboseChatProgressUpdates */
    )) {
      alert(progress.content.value);
    }
    const isLoadingIcon = icon && ThemeIcon.isEqual(icon, ThemeIcon.modify(Codicon.loading, "spin"));
    const useShimmer = (shimmer ?? (!icon || isLoadingIcon)) && this.showSpinner;
    const codicon = useShimmer ? Codicon.check : icon ?? (this.showSpinner ? ThemeIcon.modify(Codicon.loading, "spin") : Codicon.check);
    const result = this.chatContentMarkdownRenderer.render(progress.content);
    result.element.classList.add("progress-step");
    renderFileWidgets(result.element, this.instantiationService, this.chatMarkdownAnchorService, this._fileWidgetStore);
    const tooltip = this.createApprovalMessage();
    const progressPart = this._register(instantiationService.createInstance(ChatProgressSubPart, result.element, codicon, tooltip));
    this.domNode = progressPart.domNode;
    if (useShimmer) {
      this.domNode.classList.add("shimmer-progress");
    }
    this.renderedMessage.value = result;
  }
  updateMessage(content) {
    if (this.isHidden) {
      return;
    }
    const result = this._register(this.chatContentMarkdownRenderer.render(content));
    result.element.classList.add("progress-step");
    this._fileWidgetStore.clear();
    renderFileWidgets(result.element, this.instantiationService, this.chatMarkdownAnchorService, this._fileWidgetStore);
    if (this.renderedMessage.value) {
      this.renderedMessage.value.element.replaceWith(result.element);
    } else {
      this.domNode.appendChild(result.element);
    }
    this.renderedMessage.value = result;
  }
  hasSameContent(other, followingContent, element) {
    if (followingContent.some((part) => part.kind !== "progressMessage") && !this.isHidden) {
      return false;
    }
    const showSpinner = shouldShowSpinner(followingContent, element);
    if (other.kind === "progressMessage" && other.content.value !== this.currentContent.value) {
      return false;
    }
    return other.kind === "progressMessage" && this.showSpinner === showSpinner;
  }
  createApprovalMessage() {
    return this.toolInvocation && getToolApprovalMessage(this.toolInvocation);
  }
};
ChatProgressContentPart = __decorate([
  __param(8, IInstantiationService),
  __param(9, IChatMarkdownAnchorService),
  __param(10, IConfigurationService)
], ChatProgressContentPart);
function shouldShowSpinner(followingContent, element) {
  return isResponseVM(element) && !element.isComplete && followingContent.length === 0;
}
__name(shouldShowSpinner, "shouldShowSpinner");
let ChatProgressSubPart = class ChatProgressSubPart2 extends Disposable {
  static {
    __name(this, "ChatProgressSubPart");
  }
  constructor(messageElement, icon, tooltip, hoverService) {
    super();
    this.domNode = $(".progress-container");
    const iconElement = $("div");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(icon));
    if (tooltip) {
      this._register(hoverService.setupDelayedHover(iconElement, {
        content: tooltip,
        style: 1
      }));
      this._register(hoverService.setupDelayedHover(messageElement, {
        content: tooltip,
        style: 1
      }));
    }
    append(this.domNode, iconElement);
    messageElement.classList.add("progress-step");
    append(this.domNode, messageElement);
  }
};
ChatProgressSubPart = __decorate([
  __param(3, IHoverService)
], ChatProgressSubPart);
let ChatWorkingProgressContentPart = class ChatWorkingProgressContentPart2 extends ChatProgressContentPart {
  static {
    __name(this, "ChatWorkingProgressContentPart");
  }
  constructor(_workingProgress, chatContentMarkdownRenderer, context, instantiationService, chatMarkdownAnchorService, configurationService, languageModelToolsService) {
    const progressMessage = {
      kind: "progressMessage",
      content: new MarkdownString().appendText(localize("workingMessage", "Working"))
    };
    super(progressMessage, chatContentMarkdownRenderer, context, void 0, void 0, void 0, void 0, true, instantiationService, chatMarkdownAnchorService, configurationService);
    this._register(languageModelToolsService.onDidPrepareToolCallBecomeUnresponsive((e) => {
      if (isEqual(context.element.sessionResource, e.sessionResource)) {
        this.updateMessage(new MarkdownString(localize("toolCallUnresponsive", "Waiting for tool '{0}' to respond...", e.toolData.displayName)));
      }
    }));
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "working";
  }
};
ChatWorkingProgressContentPart = __decorate([
  __param(3, IInstantiationService),
  __param(4, IChatMarkdownAnchorService),
  __param(5, IConfigurationService),
  __param(6, ILanguageModelToolsService)
], ChatWorkingProgressContentPart);
export {
  ChatProgressContentPart,
  ChatProgressSubPart,
  ChatWorkingProgressContentPart
};
//# sourceMappingURL=chatProgressContentPart.js.map
