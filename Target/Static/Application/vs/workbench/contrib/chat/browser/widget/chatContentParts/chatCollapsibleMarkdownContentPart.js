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
import { $ } from "../../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { ChatCollapsibleContentPart } from "./chatCollapsibleContentPart.js";
let ChatCollapsibleMarkdownContentPart = class ChatCollapsibleMarkdownContentPart2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatCollapsibleMarkdownContentPart");
  }
  constructor(title, markdownContent, context, chatContentMarkdownRenderer, hoverService) {
    super(title, context, void 0, hoverService);
    this.markdownContent = markdownContent;
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.icon = Codicon.check;
  }
  initContent() {
    const wrapper = $(".chat-collapsible-markdown-content.chat-used-context-list");
    if (this.markdownContent) {
      this.contentElement = $(".chat-collapsible-markdown-body");
      const rendered = this._register(this.chatContentMarkdownRenderer.render(new MarkdownString(this.markdownContent)));
      this.contentElement.appendChild(rendered.element);
      wrapper.appendChild(this.contentElement);
    }
    return wrapper;
  }
  hasSameContent(other, _followingContent, _element) {
    return false;
  }
};
ChatCollapsibleMarkdownContentPart = __decorate([
  __param(4, IHoverService)
], ChatCollapsibleMarkdownContentPart);
export {
  ChatCollapsibleMarkdownContentPart
};
//# sourceMappingURL=chatCollapsibleMarkdownContentPart.js.map
