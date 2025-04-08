var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { InlineChatController } from "./inlineChatController.js";
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED } from "../common/inlineChat.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { AccessibleViewProviderId, AccessibleViewType, AccessibleContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IAccessibleViewImplementation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { renderMarkdownAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
class InlineChatAccessibleView {
  static {
    __name(this, "InlineChatAccessibleView");
  }
  priority = 100;
  name = "inlineChat";
  when = ContextKeyExpr.or(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED);
  type = AccessibleViewType.View;
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    const controller = InlineChatController.get(editor);
    if (!controller) {
      return;
    }
    const responseContent = controller.widget.responseContent;
    if (!responseContent) {
      return;
    }
    return new AccessibleContentProvider(
      AccessibleViewProviderId.InlineChat,
      { type: AccessibleViewType.View },
      () => renderMarkdownAsPlaintext(new MarkdownString(responseContent), true),
      () => controller.focus(),
      AccessibilityVerbositySettingId.InlineChat
    );
  }
}
export {
  InlineChatAccessibleView
};
//# sourceMappingURL=inlineChatAccessibleView.js.map
