var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize2 } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IChatWidgetService } from "../../../chat/browser/chat.js";
import { ChatContextKeys } from "../../../chat/common/chatContextKeys.js";
import { IChatService } from "../../../chat/common/chatService.js";
import { ChatAgentLocation } from "../../../chat/common/constants.js";
import { AbstractInline1ChatAction } from "../../../inlineChat/browser/inlineChatActions.js";
import { isDetachedTerminalInstance } from "../../../terminal/browser/terminal.js";
import { registerActiveXtermAction } from "../../../terminal/browser/terminalActions.js";
import { TerminalContextKeys } from "../../../terminal/common/terminalContextKey.js";
import { MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from "./terminalChat.js";
import { TerminalChatController } from "./terminalChatController.js";
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.start",
  title: localize2("startChat", "Terminal Inline Chat"),
  category: AbstractInline1ChatAction.category,
  keybinding: {
    primary: 2048 | 39,
    when: ContextKeyExpr.and(TerminalContextKeys.focusInAny),
    // HACK: Force weight to be higher than the extension contributed keybinding to override it until it gets replaced
    weight: 400 + 1
    // KeybindingWeight.WorkbenchContrib,
  },
  f1: true,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.hasChatAgent),
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance, opts) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    if (opts) {
      opts = typeof opts === "string" ? { query: opts } : opts;
      if (typeof opts === "object" && opts !== null && "query" in opts && typeof opts.query === "string") {
        contr?.updateInput(opts.query, false);
        if (!("isPartialQuery" in opts && opts.isPartialQuery)) {
          contr?.terminalChatWidget?.acceptInput();
        }
      }
    }
    contr?.terminalChatWidget?.reveal();
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.close",
  title: localize2("closeChat", "Close"),
  category: AbstractInline1ChatAction.category,
  keybinding: {
    primary: 9,
    when: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.focus, TerminalChatContextKeys.focused), TerminalChatContextKeys.visible),
    weight: 200
  },
  menu: [{
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 2
  }],
  icon: Codicon.close,
  f1: true,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, TerminalChatContextKeys.visible),
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.clear();
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.runCommand",
  title: localize2("runCommand", "Run Chat Command"),
  shortTitle: localize2("run", "Run"),
  category: AbstractInline1ChatAction.category,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.requestActive.negate(), TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate()),
  icon: Codicon.play,
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200,
    primary: 2048 | 3
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 0,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate(), TerminalChatContextKeys.requestActive.negate())
  },
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(true);
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.runFirstCommand",
  title: localize2("runFirstCommand", "Run First Chat Command"),
  shortTitle: localize2("runFirst", "Run First"),
  category: AbstractInline1ChatAction.category,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.requestActive.negate(), TerminalChatContextKeys.responseContainsMultipleCodeBlocks),
  icon: Codicon.play,
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200,
    primary: 2048 | 3
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 0,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsMultipleCodeBlocks, TerminalChatContextKeys.requestActive.negate())
  },
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(true);
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.insertCommand",
  title: localize2("insertCommand", "Insert Chat Command"),
  shortTitle: localize2("insert", "Insert"),
  category: AbstractInline1ChatAction.category,
  icon: Codicon.insert,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.requestActive.negate(), TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate()),
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200,
    primary: 512 | 3,
    secondary: [
      2048 | 3 | 512
      /* KeyMod.Alt */
    ]
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 1,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.responseContainsMultipleCodeBlocks.negate(), TerminalChatContextKeys.requestActive.negate())
  },
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(false);
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.insertFirstCommand",
  title: localize2("insertFirstCommand", "Insert First Chat Command"),
  shortTitle: localize2("insertFirst", "Insert First"),
  category: AbstractInline1ChatAction.category,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.requestActive.negate(), TerminalChatContextKeys.responseContainsMultipleCodeBlocks),
  keybinding: {
    when: TerminalChatContextKeys.requestActive.negate(),
    weight: 200,
    primary: 512 | 3,
    secondary: [
      2048 | 3 | 512
      /* KeyMod.Alt */
    ]
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 1,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsMultipleCodeBlocks, TerminalChatContextKeys.requestActive.negate())
  },
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.terminalChatWidget?.acceptCommand(false);
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.rerunRequest",
  title: localize2("chat.rerun.label", "Rerun Request"),
  f1: false,
  icon: Codicon.refresh,
  category: AbstractInline1ChatAction.category,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.requestActive.negate()),
  keybinding: {
    weight: 200,
    primary: 2048 | 48,
    when: TerminalChatContextKeys.focused
  },
  menu: {
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "0_main",
    order: 5,
    when: ContextKeyExpr.and(TerminalChatContextKeys.inputHasText.toNegated(), TerminalChatContextKeys.requestActive.negate())
  },
  run: /* @__PURE__ */ __name(async (_xterm, _accessor, activeInstance) => {
    const chatService = _accessor.get(IChatService);
    const chatWidgetService = _accessor.get(IChatWidgetService);
    const contr = TerminalChatController.activeChatController;
    const model = contr?.terminalChatWidget?.inlineChatWidget.chatWidget.viewModel?.model;
    if (!model) {
      return;
    }
    const lastRequest = model.getRequests().at(-1);
    if (lastRequest) {
      const widget = chatWidgetService.getWidgetBySessionId(model.sessionId);
      await chatService.resendRequest(lastRequest, {
        noCommandDetection: false,
        attempt: lastRequest.attempt + 1,
        location: ChatAgentLocation.Terminal,
        userSelectedModelId: widget?.input.currentLanguageModel
      });
    }
  }, "run")
});
registerActiveXtermAction({
  id: "workbench.action.terminal.chat.viewInChat",
  title: localize2("viewInChat", "View in Chat"),
  category: AbstractInline1ChatAction.category,
  precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalChatContextKeys.requestActive.negate()),
  icon: Codicon.commentDiscussion,
  menu: [{
    id: MENU_TERMINAL_CHAT_WIDGET_STATUS,
    group: "zzz",
    order: 1,
    isHiddenByDefault: true,
    when: ContextKeyExpr.and(TerminalChatContextKeys.responseContainsCodeBlock, TerminalChatContextKeys.requestActive.negate())
  }],
  run: /* @__PURE__ */ __name((_xterm, _accessor, activeInstance) => {
    if (isDetachedTerminalInstance(activeInstance)) {
      return;
    }
    const contr = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
    contr?.viewInChat();
  }, "run")
});
//# sourceMappingURL=terminalChatActions.js.map
