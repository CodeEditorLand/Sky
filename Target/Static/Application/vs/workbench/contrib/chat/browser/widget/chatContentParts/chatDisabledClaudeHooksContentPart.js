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
import * as dom from "../../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { createMarkdownCommandLink, MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { IMarkdownRendererService, openLinkFromMarkdown } from "../../../../../../platform/markdown/browser/markdownRenderer.js";
import { localize } from "../../../../../../nls.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { PromptsConfig } from "../../../common/promptSyntax/config/config.js";
import "./media/chatDisabledClaudeHooksContent.css";
let ChatDisabledClaudeHooksContentPart = class ChatDisabledClaudeHooksContentPart2 extends Disposable {
  static {
    __name(this, "ChatDisabledClaudeHooksContentPart");
  }
  constructor(_context, _openerService, _markdownRendererService) {
    super();
    this._openerService = _openerService;
    this._markdownRendererService = _markdownRendererService;
    this.domNode = dom.$(".chat-disabled-claude-hooks");
    const messageContainer = dom.$(".chat-disabled-claude-hooks-message");
    const icon = dom.$(".chat-disabled-claude-hooks-icon");
    icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    const enableLink = createMarkdownCommandLink({
      title: localize("chat.disabledClaudeHooks.enableLink", "Enable"),
      id: "workbench.action.openSettings",
      arguments: [PromptsConfig.USE_CLAUDE_HOOKS]
    });
    const message = localize("chat.disabledClaudeHooks.message", "Claude Code hooks are available for this workspace. {0}", enableLink);
    const content = new MarkdownString(message, { isTrusted: true });
    const rendered = this._register(this._markdownRendererService.render(content, {
      actionHandler: /* @__PURE__ */ __name((href) => openLinkFromMarkdown(this._openerService, href, true), "actionHandler")
    }));
    messageContainer.appendChild(icon);
    messageContainer.appendChild(rendered.element);
    this.domNode.appendChild(messageContainer);
  }
  hasSameContent(other) {
    return other.kind === "disabledClaudeHooks";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatDisabledClaudeHooksContentPart = __decorate([
  __param(1, IOpenerService),
  __param(2, IMarkdownRendererService)
], ChatDisabledClaudeHooksContentPart);
export {
  ChatDisabledClaudeHooksContentPart
};
//# sourceMappingURL=chatDisabledClaudeHooksContentPart.js.map
