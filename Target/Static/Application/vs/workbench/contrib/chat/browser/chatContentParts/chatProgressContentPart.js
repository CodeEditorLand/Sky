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
import { $, addDisposableListener, append, EventType } from "../../../../../base/browser/dom.js";
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import { InlineAnchorWidget } from "../chatInlineAnchorWidget.js";
import { IChatMarkdownAnchorService } from "./chatMarkdownAnchorService.js";
let ChatProgressContentPart = class ChatProgressContentPart2 extends Disposable {
  static {
    __name(this, "ChatProgressContentPart");
  }
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
ChatProgressContentPart = __decorate([
  __param(6, IInstantiationService),
  __param(7, IChatMarkdownAnchorService)
], ChatProgressContentPart);
function shouldShowSpinner(followingContent, element) {
  return isResponseVM(element) && !element.isComplete && followingContent.length === 0;
}
__name(shouldShowSpinner, "shouldShowSpinner");
let ChatWorkingProgressContentPart = class ChatWorkingProgressContentPart2 extends ChatProgressContentPart {
  static {
    __name(this, "ChatWorkingProgressContentPart");
  }
  constructor(workingProgress, renderer, context, instantiationService, chatMarkdownAnchorService) {
    const progressMessage = {
      kind: "progressMessage",
      content: workingProgress.isPaused ? new MarkdownString().appendText(localize("pausedMessage", "Paused")) : new MarkdownString().appendText(localize("workingMessage", "Working..."))
    };
    super(progressMessage, renderer, context, void 0, void 0, workingProgress.isPaused ? Codicon.debugPause : void 0, instantiationService, chatMarkdownAnchorService);
    this.workingProgress = workingProgress;
    if (workingProgress.isPaused) {
      this.domNode.style.cursor = "pointer";
      this.domNode.title = localize("resume", "Click to resume");
      this._register(addDisposableListener(this.domNode, EventType.CLICK, () => {
        workingProgress.setPaused(false);
      }));
    }
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "working" && this.workingProgress.isPaused === other.isPaused;
  }
};
ChatWorkingProgressContentPart = __decorate([
  __param(3, IInstantiationService),
  __param(4, IChatMarkdownAnchorService)
], ChatWorkingProgressContentPart);
class ChatCustomProgressPart {
  static {
    __name(this, "ChatCustomProgressPart");
  }
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
