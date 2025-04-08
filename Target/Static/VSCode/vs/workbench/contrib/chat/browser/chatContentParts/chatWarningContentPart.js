var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { IChatContentPart } from "./chatContentParts.js";
import { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import { ChatErrorLevel } from "../../common/chatService.js";
const $ = dom.$;
class ChatWarningContentPart extends Disposable {
  static {
    __name(this, "ChatWarningContentPart");
  }
  domNode;
  constructor(kind, content, renderer) {
    super();
    this.domNode = $(".chat-notification-widget");
    let icon;
    let iconClass;
    switch (kind) {
      case ChatErrorLevel.Warning:
        icon = Codicon.warning;
        iconClass = ".chat-warning-codicon";
        break;
      case ChatErrorLevel.Error:
        icon = Codicon.error;
        iconClass = ".chat-error-codicon";
        break;
      case ChatErrorLevel.Info:
        icon = Codicon.info;
        iconClass = ".chat-info-codicon";
        break;
    }
    this.domNode.appendChild($(iconClass, void 0, renderIcon(icon)));
    const markdownContent = this._register(renderer.render(content));
    this.domNode.appendChild(markdownContent.element);
  }
  hasSameContent(other) {
    return other.kind === "warning";
  }
}
export {
  ChatWarningContentPart
};
//# sourceMappingURL=chatWarningContentPart.js.map
