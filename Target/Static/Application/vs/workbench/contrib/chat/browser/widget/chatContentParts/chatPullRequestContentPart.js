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
import "./media/chatPullRequestContent.css";
import * as dom from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { addDisposableListener } from "../../../../../../base/browser/dom.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { renderAsPlaintext } from "../../../../../../base/browser/markdownRenderer.js";
let ChatPullRequestContentPart = class ChatPullRequestContentPart2 extends Disposable {
  static {
    __name(this, "ChatPullRequestContentPart");
  }
  constructor(pullRequestContent, openerService) {
    super();
    this.pullRequestContent = pullRequestContent;
    this.openerService = openerService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.domNode = dom.$(".chat-pull-request-content-part");
    const container = dom.append(this.domNode, dom.$(".container"));
    const contentContainer = dom.append(container, dom.$(".content-container"));
    const titleContainer = dom.append(contentContainer, dom.$(".title-container"));
    const icon = dom.append(titleContainer, dom.$(".icon"));
    icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.gitPullRequest));
    const titleElement = dom.append(titleContainer, dom.$(".title"));
    titleElement.textContent = `${this.pullRequestContent.title} - ${this.pullRequestContent.author}`;
    const descriptionElement = dom.append(contentContainer, dom.$(".description"));
    const descriptionWrapper = dom.append(descriptionElement, dom.$(".description-wrapper"));
    const plainText = renderAsPlaintext({ value: this.pullRequestContent.description });
    descriptionWrapper.textContent = plainText;
    const seeMoreContainer = dom.append(descriptionElement, dom.$(".see-more"));
    const seeMore = dom.append(seeMoreContainer, dom.$("a"));
    seeMore.textContent = localize("chatPullRequest.seeMore", "See more");
    this._register(addDisposableListener(seeMore, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openerService.open(this.pullRequestContent.uri);
    }));
    seeMore.href = this.pullRequestContent.uri.toString();
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "pullRequest";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatPullRequestContentPart = __decorate([
  __param(1, IOpenerService)
], ChatPullRequestContentPart);
export {
  ChatPullRequestContentPart
};
//# sourceMappingURL=chatPullRequestContentPart.js.map
