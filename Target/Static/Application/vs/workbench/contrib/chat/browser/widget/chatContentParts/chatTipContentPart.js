var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/chatTipContent.css";
import * as dom from "../../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
const $ = dom.$;
class ChatTipContentPart extends Disposable {
  static {
    __name(this, "ChatTipContentPart");
  }
  constructor(tip, renderer) {
    super();
    this.domNode = $(".chat-tip-widget");
    this.domNode.appendChild(renderIcon(Codicon.lightbulb));
    const markdownContent = this._register(renderer.render(tip.content));
    this.domNode.appendChild(markdownContent.element);
  }
}
export {
  ChatTipContentPart
};
//# sourceMappingURL=chatTipContentPart.js.map
