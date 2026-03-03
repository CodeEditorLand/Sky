var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../base/browser/dom.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { katexContainerClassName, katexContainerLatexAttributeName } from "../../../markdown/common/markedKatexExtension.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isChatTreeItem, isRequestVM, isResponseVM } from "../../common/model/chatViewModel.js";
import { IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY, stringifyItem } from "./chatActions.js";
function registerChatCopyActions() {
  registerAction2(class CopyAllAction extends Action2 {
    static {
      __name(this, "CopyAllAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.copyAll",
        title: localize2("interactive.copyAll.label", "Copy All"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          when: ChatContextKeys.responseIsFiltered.negate(),
          group: "copy"
        }
      });
    }
    run(accessor, context) {
      const clipboardService = accessor.get(IClipboardService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const widget = (isRequestVM(context) || isResponseVM(context)) && chatWidgetService.getWidgetBySessionResource(context.sessionResource) || chatWidgetService.lastFocusedWidget;
      if (widget) {
        const viewModel = widget.viewModel;
        const sessionAsText = viewModel?.getItems().filter((item) => isRequestVM(item) || isResponseVM(item) && !item.errorDetails?.responseIsFiltered).map((item) => stringifyItem(item)).join("\n\n");
        if (sessionAsText) {
          clipboardService.writeText(sessionAsText);
        }
      }
    }
  });
  registerAction2(class CopyItemAction extends Action2 {
    static {
      __name(this, "CopyItemAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.copyItem",
        title: localize2("interactive.copyItem.label", "Copy"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          when: ChatContextKeys.responseIsFiltered.negate(),
          group: "copy"
        }
      });
    }
    async run(accessor, ...args) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const clipboardService = accessor.get(IClipboardService);
      const widget = chatWidgetService.lastFocusedWidget;
      let item = args[0];
      if (!isChatTreeItem(item)) {
        item = widget?.getFocus();
        if (!item) {
          return;
        }
      }
      const nativeSelection = dom.getActiveWindow().getSelection();
      const selectedText = nativeSelection?.toString();
      if (widget && selectedText && selectedText.length > 0 && dom.isAncestor(dom.getActiveElement(), widget.domNode)) {
        await clipboardService.writeText(selectedText);
        return;
      }
      if (!isRequestVM(item) && !isResponseVM(item)) {
        return;
      }
      const text = stringifyItem(item, false);
      await clipboardService.writeText(text);
    }
  });
  registerAction2(class CopyKatexMathSourceAction extends Action2 {
    static {
      __name(this, "CopyKatexMathSourceAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.copyKatexMathSource",
        title: localize2("chat.copyKatexMathSource.label", "Copy Math Source"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          group: "copy",
          when: ChatContextKeys.isKatexMathElement
        }
      });
    }
    async run(accessor, ...args) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const clipboardService = accessor.get(IClipboardService);
      const widget = chatWidgetService.lastFocusedWidget;
      let item = args[0];
      if (!isChatTreeItem(item)) {
        item = widget?.getFocus();
        if (!item) {
          return;
        }
      }
      let selectedElement = null;
      const activeElement = dom.getActiveElement();
      const nativeSelection = dom.getActiveWindow().getSelection();
      if (widget && nativeSelection && nativeSelection.rangeCount > 0 && dom.isAncestor(activeElement, widget.domNode)) {
        const range = nativeSelection.getRangeAt(0);
        selectedElement = range.commonAncestorContainer;
        if (selectedElement.nodeType === Node.TEXT_NODE) {
          selectedElement = selectedElement.parentElement;
        }
      }
      if (!selectedElement) {
        selectedElement = activeElement?.querySelector(`.${katexContainerClassName}`) ?? null;
      }
      const katexElement = dom.isHTMLElement(selectedElement) ? selectedElement.closest(`.${katexContainerClassName}`) : null;
      const latexSource = katexElement?.getAttribute(katexContainerLatexAttributeName) || "";
      if (latexSource) {
        await clipboardService.writeText(latexSource);
      }
    }
  });
}
__name(registerChatCopyActions, "registerChatCopyActions");
export {
  registerChatCopyActions
};
//# sourceMappingURL=chatCopyActions.js.map
