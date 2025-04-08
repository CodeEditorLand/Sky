var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { $, append } from "../../../../../base/browser/dom.js";
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatProgressMessage, IChatTask } from "../../common/chatService.js";
import { IChatRendererContent, IChatWorkingProgress, isResponseVM } from "../../common/chatViewModel.js";
import { ChatTreeItem } from "../chat.js";
import { InlineAnchorWidget } from "../chatInlineAnchorWidget.js";
import { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
import { IChatMarkdownAnchorService } from "./chatMarkdownAnchorService.js";
let ChatProgressContentPart = class extends Disposable {
  constructor(progress, renderer, context, forceShowSpinner, forceShowMessage, icon, instantiationService, chatMarkdownAnchorService) {
    super();
    this.instantiationService = instantiationService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    const followingContent = context.content.slice(context.contentIndex + 1);
    this.showSpinner = forceShowSpinner ?? shouldShowSpinner(followingContent, context.element);
    this.isHidden = forceShowMessage !== true && followingContent.some((part) => part.kind !== "progressMessage");
    if (this.isHidden) {
      this.domNode = $("");
      return;
    }
    if (this.showSpinner) {
      alert(progress.content.value);
    }
    const codicon = icon ? icon : this.showSpinner ? ThemeIcon.modify(Codicon.loading, "spin") : Codicon.check;
    const result = this._register(renderer.render(progress.content));
    result.element.classList.add("progress-step");
    this.renderFileWidgets(result.element);
    this.domNode = $(".progress-container");
    const iconElement = $("div");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(codicon));
    append(this.domNode, iconElement);
    append(this.domNode, result.element);
  }
  static {
    __name(this, "ChatProgressContentPart");
  }
  domNode;
  showSpinner;
  isHidden;
  renderFileWidgets(element) {
    const links = element.querySelectorAll("a");
    links.forEach((a) => {
      if (!a.textContent?.trim()) {
        const href = a.getAttribute("data-href");
        const uri = href ? URI.parse(href) : void 0;
        if (uri?.scheme) {
          const widget = this._register(this.instantiationService.createInstance(InlineAnchorWidget, a, { kind: "inlineReference", inlineReference: uri }));
          this._register(this.chatMarkdownAnchorService.register(widget));
        }
      }
    });
  }
  hasSameContent(other, followingContent, element) {
    if (followingContent.some((part) => part.kind !== "progressMessage") && !this.isHidden) {
      return false;
    }
    const showSpinner = shouldShowSpinner(followingContent, element);
    return other.kind === "progressMessage" && this.showSpinner === showSpinner;
  }
};
ChatProgressContentPart = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IChatMarkdownAnchorService)
], ChatProgressContentPart);
function shouldShowSpinner(followingContent, element) {
  return isResponseVM(element) && !element.isComplete && followingContent.length === 0;
}
__name(shouldShowSpinner, "shouldShowSpinner");
let ChatWorkingProgressContentPart = class extends ChatProgressContentPart {
  constructor(workingProgress, renderer, context, instantiationService, chatMarkdownAnchorService) {
    const progressMessage = {
      kind: "progressMessage",
      content: workingProgress.isPaused ? new MarkdownString().appendText(localize("pausedMessage", "Paused")) : new MarkdownString().appendText(localize("workingMessage", "Working..."))
    };
    super(progressMessage, renderer, context, void 0, void 0, workingProgress.isPaused ? Codicon.debugPause : void 0, instantiationService, chatMarkdownAnchorService);
    this.workingProgress = workingProgress;
  }
  static {
    __name(this, "ChatWorkingProgressContentPart");
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "working" && this.workingProgress.isPaused === other.isPaused;
  }
};
ChatWorkingProgressContentPart = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IChatMarkdownAnchorService)
], ChatWorkingProgressContentPart);
class ChatCustomProgressPart {
  static {
    __name(this, "ChatCustomProgressPart");
  }
  domNode;
  constructor(messageElement, icon) {
    this.domNode = $(".progress-container");
    const iconElement = $("div");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(icon));
    append(this.domNode, iconElement);
    messageElement.classList.add("progress-step");
    append(this.domNode, messageElement);
  }
}
export {
  ChatCustomProgressPart,
  ChatProgressContentPart,
  ChatWorkingProgressContentPart
};
//# sourceMappingURL=chatProgressContentPart.js.map
