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
import { isAncestorOfActiveElement } from "../../../../../base/browser/dom.js";
import { toAction } from "../../../../../base/common/actions.js";
import { coalesce } from "../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { fromNowByDay, safeIntl } from "../../../../../base/common/date.js";
import { Event } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, markAsSingleton } from "../../../../../base/common/lifecycle.js";
import { language } from "../../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { EditorAction2 } from "../../../../../editor/browser/editorExtensions.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { SuggestController } from "../../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IActionViewItemService } from "../../../../../platform/actions/browser/actionViewItemService.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { Action2, MenuId, MenuItemAction, MenuRegistry, registerAction2, SubmenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IsLinuxContext, IsWindowsContext } from "../../../../../platform/contextkey/common/contextkeys.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import product from "../../../../../platform/product/common/product.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { ToggleTitleBarConfigAction } from "../../../../browser/parts/titlebar/titlebarActions.js";
import { IsCompactTitleBarContext } from "../../../../common/contextkeys.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP, IEditorService } from "../../../../services/editor/common/editorService.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { EXTENSIONS_CATEGORY, IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { ChatEntitlement, ChatSentiment, IChatEntitlementService } from "../../common/chatEntitlementService.js";
import { extractAgentAndCommand } from "../../common/chatParserTypes.js";
import { IChatService } from "../../common/chatService.js";
import { isRequestVM } from "../../common/chatViewModel.js";
import { IChatWidgetHistoryService } from "../../common/chatWidgetHistoryService.js";
import { ChatConfiguration, ChatMode, modeToString, validateChatMode } from "../../common/constants.js";
import { CopilotUsageExtensionFeatureId } from "../../common/languageModelStats.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { ChatViewId, IChatWidgetService, showChatView, showCopilotView } from "../chat.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { convertBufferToScreenshotVariable } from "../contrib/screenshot.js";
import { clearChatEditor } from "./chatClear.js";
const CHAT_CATEGORY = localize2("chat.category", "Chat");
const CHAT_OPEN_ACTION_ID = "workbench.action.chat.open";
const CHAT_SETUP_ACTION_ID = "workbench.action.chat.triggerSetup";
const TOGGLE_CHAT_ACTION_ID = "workbench.action.chat.toggle";
const OPEN_CHAT_QUOTA_EXCEEDED_DIALOG = "workbench.action.chat.openQuotaExceededDialog";
class OpenChatGlobalAction extends Action2 {
  static {
    __name(this, "OpenChatGlobalAction");
  }
  constructor(overrides, mode) {
    super({
      ...overrides,
      icon: Codicon.copilot,
      f1: true,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.Setup.hidden.negate()
    });
    this.mode = mode;
  }
  async run(accessor, opts) {
    opts = typeof opts === "string" ? { query: opts } : opts;
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const toolsService = accessor.get(ILanguageModelToolsService);
    const viewsService = accessor.get(IViewsService);
    const hostService = accessor.get(IHostService);
    let chatWidget = widgetService.lastFocusedWidget;
    if (!this.mode || !chatWidget || !isAncestorOfActiveElement(chatWidget.domNode)) {
      chatWidget = await showChatView(viewsService);
    }
    if (!chatWidget) {
      return;
    }
    const mode = opts?.mode ?? this.mode;
    if (mode && validateChatMode(mode)) {
      chatWidget.input.setChatMode(mode);
    }
    if (opts?.previousRequests?.length && chatWidget.viewModel) {
      for (const { request, response } of opts.previousRequests) {
        chatService.addCompleteRequest(chatWidget.viewModel.sessionId, request, void 0, 0, { message: response });
      }
    }
    if (opts?.attachScreenshot) {
      const screenshot = await hostService.getScreenshot();
      if (screenshot) {
        chatWidget.attachmentModel.addContext(convertBufferToScreenshotVariable(screenshot));
      }
    }
    if (opts?.query) {
      if (opts.query.startsWith("@") && (chatWidget.input.currentMode === ChatMode.Agent || chatService.edits2Enabled)) {
        chatWidget.input.setChatMode(ChatMode.Ask);
      }
      if (opts.isPartialQuery) {
        chatWidget.setInput(opts.query);
      } else {
        await chatWidget.waitForReady();
        chatWidget.acceptInput(opts.query);
      }
    }
    if (opts?.toolIds && opts.toolIds.length > 0) {
      for (const toolId of opts.toolIds) {
        const tool = toolsService.getTool(toolId);
        if (tool) {
          chatWidget.attachmentModel.addContext({
            id: tool.id,
            name: tool.displayName,
            fullName: tool.displayName,
            value: void 0,
            icon: ThemeIcon.isThemeIcon(tool.icon) ? tool.icon : void 0,
            kind: "tool"
          });
        }
      }
    }
    chatWidget.focusInput();
  }
}
class PrimaryOpenChatGlobalAction extends OpenChatGlobalAction {
  static {
    __name(this, "PrimaryOpenChatGlobalAction");
  }
  constructor() {
    super({
      id: CHAT_OPEN_ACTION_ID,
      title: localize2("openChat", "Open Chat"),
      keybinding: {
        weight: 200,
        primary: 2048 | 512 | 39,
        mac: {
          primary: 2048 | 256 | 39
          /* KeyCode.KeyI */
        }
      },
      menu: [{
        id: MenuId.ChatTitleBarMenu,
        group: "a_open",
        order: 1
      }]
    });
  }
}
function getOpenChatActionIdForMode(mode) {
  const modeStr = modeToString(mode);
  return `workbench.action.chat.open${modeStr}`;
}
__name(getOpenChatActionIdForMode, "getOpenChatActionIdForMode");
class ModeOpenChatGlobalAction extends OpenChatGlobalAction {
  static {
    __name(this, "ModeOpenChatGlobalAction");
  }
  constructor(mode, keybinding) {
    super({
      id: getOpenChatActionIdForMode(mode),
      title: localize2("openChatMode", "Open Chat ({0})", modeToString(mode)),
      keybinding
    }, mode);
  }
}
function registerChatActions() {
  registerAction2(PrimaryOpenChatGlobalAction);
  registerAction2(class extends ModeOpenChatGlobalAction {
    constructor() {
      super(ChatMode.Ask);
    }
  });
  registerAction2(class extends ModeOpenChatGlobalAction {
    constructor() {
      super(ChatMode.Agent, {
        when: ContextKeyExpr.has(`config.${ChatConfiguration.AgentEnabled}`),
        weight: 200,
        primary: 2048 | 1024 | 39,
        linux: {
          primary: 2048 | 512 | 1024 | 39
          /* KeyCode.KeyI */
        }
      });
    }
  });
  registerAction2(class extends ModeOpenChatGlobalAction {
    constructor() {
      super(ChatMode.Edit);
    }
  });
  registerAction2(class ToggleChatAction extends Action2 {
    static {
      __name(this, "ToggleChatAction");
    }
    constructor() {
      super({
        id: TOGGLE_CHAT_ACTION_ID,
        title: localize2("toggleChat", "Toggle Chat"),
        category: CHAT_CATEGORY
      });
    }
    async run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      const viewsService = accessor.get(IViewsService);
      const viewDescriptorService = accessor.get(IViewDescriptorService);
      const chatLocation = viewDescriptorService.getViewLocationById(ChatViewId);
      if (viewsService.isViewVisible(ChatViewId)) {
        this.updatePartVisibility(layoutService, chatLocation, false);
      } else {
        this.updatePartVisibility(layoutService, chatLocation, true);
        (await showCopilotView(viewsService, layoutService))?.focusInput();
      }
    }
    updatePartVisibility(layoutService, location, visible) {
      let part;
      switch (location) {
        case 1:
          part = "workbench.parts.panel";
          break;
        case 0:
          part = "workbench.parts.sidebar";
          break;
        case 2:
          part = "workbench.parts.auxiliarybar";
          break;
      }
      if (part) {
        layoutService.setPartHidden(!visible, part);
      }
    }
  });
  registerAction2(class ChatHistoryAction extends Action2 {
    static {
      __name(this, "ChatHistoryAction");
    }
    constructor() {
      super({
        id: `workbench.action.chat.history`,
        title: localize2("chat.history.label", "Show Chats..."),
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          group: "navigation",
          order: 2
        },
        category: CHAT_CATEGORY,
        icon: Codicon.history,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const chatService = accessor.get(IChatService);
      const quickInputService = accessor.get(IQuickInputService);
      const viewsService = accessor.get(IViewsService);
      const editorService = accessor.get(IEditorService);
      const dialogService = accessor.get(IDialogService);
      const view = await viewsService.openView(ChatViewId);
      if (!view) {
        return;
      }
      const chatSessionId = view.widget.viewModel?.model.sessionId;
      if (!chatSessionId) {
        return;
      }
      const editingSession = view.widget.viewModel?.model.editingSession;
      if (editingSession) {
        const phrase = localize("switchChat.confirmPhrase", "Switching chats will end your current edit session.");
        if (!await handleCurrentEditingSession(editingSession, phrase, dialogService)) {
          return;
        }
      }
      const showPicker = /* @__PURE__ */ __name(async () => {
        const openInEditorButton = {
          iconClass: ThemeIcon.asClassName(Codicon.file),
          tooltip: localize("interactiveSession.history.editor", "Open in Editor")
        };
        const deleteButton = {
          iconClass: ThemeIcon.asClassName(Codicon.x),
          tooltip: localize("interactiveSession.history.delete", "Delete")
        };
        const renameButton = {
          iconClass: ThemeIcon.asClassName(Codicon.pencil),
          tooltip: localize("chat.history.rename", "Rename")
        };
        const getPicks = /* @__PURE__ */ __name(async () => {
          const items = await chatService.getHistory();
          items.sort((a, b) => (b.lastMessageDate ?? 0) - (a.lastMessageDate ?? 0));
          let lastDate = void 0;
          const picks2 = items.flatMap((i) => {
            const timeAgoStr = fromNowByDay(i.lastMessageDate, true, true);
            const separator = timeAgoStr !== lastDate ? {
              type: "separator",
              label: timeAgoStr
            } : void 0;
            lastDate = timeAgoStr;
            return [
              separator,
              {
                label: i.title,
                description: i.isActive ? `(${localize("currentChatLabel", "current")})` : "",
                chat: i,
                buttons: i.isActive ? [renameButton] : [
                  renameButton,
                  openInEditorButton,
                  deleteButton
                ]
              }
            ];
          });
          return coalesce(picks2);
        }, "getPicks");
        const store = new DisposableStore();
        const picker = store.add(quickInputService.createQuickPick({ useSeparators: true }));
        picker.placeholder = localize("interactiveSession.history.pick", "Switch to chat");
        const picks = await getPicks();
        picker.items = picks;
        store.add(picker.onDidTriggerItemButton(async (context) => {
          if (context.button === openInEditorButton) {
            const options = { target: { sessionId: context.item.chat.sessionId }, pinned: true };
            editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options }, ACTIVE_GROUP);
            picker.hide();
          } else if (context.button === deleteButton) {
            chatService.removeHistoryEntry(context.item.chat.sessionId);
            picker.items = await getPicks();
          } else if (context.button === renameButton) {
            const title = await quickInputService.input({ title: localize("newChatTitle", "New chat title"), value: context.item.chat.title });
            if (title) {
              chatService.setChatSessionTitle(context.item.chat.sessionId, title);
            }
            await showPicker();
          }
        }));
        store.add(picker.onDidAccept(async () => {
          try {
            const item = picker.selectedItems[0];
            const sessionId = item.chat.sessionId;
            await view.loadSession(sessionId);
          } finally {
            picker.hide();
          }
        }));
        store.add(picker.onDidHide(() => store.dispose()));
        picker.show();
      }, "showPicker");
      await showPicker();
    }
  });
  registerAction2(class OpenChatEditorAction extends Action2 {
    static {
      __name(this, "OpenChatEditorAction");
    }
    constructor() {
      super({
        id: `workbench.action.openChat`,
        title: localize2("interactiveSession.open", "New Chat Editor"),
        f1: true,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true } });
    }
  });
  registerAction2(class ChatAddAction extends Action2 {
    static {
      __name(this, "ChatAddAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.addParticipant",
        title: localize2("chatWith", "Chat with Extension"),
        icon: Codicon.mention,
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatInput,
          when: ChatContextKeys.chatMode.isEqualTo(ChatMode.Ask),
          group: "navigation",
          order: 1
        }
      });
    }
    async run(accessor, ...args) {
      const widgetService = accessor.get(IChatWidgetService);
      const context = args[0];
      const widget = context?.widget ?? widgetService.lastFocusedWidget;
      if (!widget) {
        return;
      }
      const hasAgentOrCommand = extractAgentAndCommand(widget.parsedInput);
      if (hasAgentOrCommand?.agentPart || hasAgentOrCommand?.commandPart) {
        return;
      }
      const suggestCtrl = SuggestController.get(widget.inputEditor);
      if (suggestCtrl) {
        const curText = widget.inputEditor.getValue();
        const newValue = curText ? `@ ${curText}` : "@";
        if (!curText.startsWith("@")) {
          widget.inputEditor.setValue(newValue);
        }
        widget.inputEditor.setPosition(new Position(1, 2));
        suggestCtrl.triggerSuggest(void 0, true);
      }
    }
  });
  registerAction2(class ClearChatInputHistoryAction extends Action2 {
    static {
      __name(this, "ClearChatInputHistoryAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.clearInputHistory",
        title: localize2("interactiveSession.clearHistory.label", "Clear Input History"),
        precondition: ChatContextKeys.enabled,
        category: CHAT_CATEGORY,
        f1: true
      });
    }
    async run(accessor, ...args) {
      const historyService = accessor.get(IChatWidgetHistoryService);
      historyService.clearHistory();
    }
  });
  registerAction2(class ClearChatHistoryAction extends Action2 {
    static {
      __name(this, "ClearChatHistoryAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.clearHistory",
        title: localize2("chat.clear.label", "Clear All Workspace Chats"),
        precondition: ChatContextKeys.enabled,
        category: CHAT_CATEGORY,
        f1: true
      });
    }
    async run(accessor, ...args) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const chatService = accessor.get(IChatService);
      const instantiationService = accessor.get(IInstantiationService);
      const widgetService = accessor.get(IChatWidgetService);
      await chatService.clearAllHistoryEntries();
      widgetService.getAllWidgets().forEach((widget) => {
        widget.clear();
      });
      editorGroupsService.groups.forEach((group) => {
        group.editors.forEach((editor) => {
          if (editor instanceof ChatEditorInput) {
            instantiationService.invokeFunction(clearChatEditor, editor);
          }
        });
      });
    }
  });
  registerAction2(class FocusChatAction extends EditorAction2 {
    static {
      __name(this, "FocusChatAction");
    }
    constructor() {
      super({
        id: "chat.action.focus",
        title: localize2("actions.interactiveSession.focus", "Focus Chat List"),
        precondition: ContextKeyExpr.and(ChatContextKeys.inChatInput),
        category: CHAT_CATEGORY,
        keybinding: [
          // On mac, require that the cursor is at the top of the input, to avoid stealing cmd+up to move the cursor to the top
          {
            when: ContextKeyExpr.and(ChatContextKeys.inputCursorAtTop, ChatContextKeys.inQuickChat.negate()),
            primary: 2048 | 16,
            weight: 100
          },
          // On win/linux, ctrl+up can always focus the chat list
          {
            when: ContextKeyExpr.and(ContextKeyExpr.or(IsWindowsContext, IsLinuxContext), ChatContextKeys.inQuickChat.negate()),
            primary: 2048 | 16,
            weight: 100
          },
          {
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inQuickChat),
            primary: 2048 | 18,
            weight: 200
          }
        ]
      });
    }
    runEditorCommand(accessor, editor) {
      const editorUri = editor.getModel()?.uri;
      if (editorUri) {
        const widgetService = accessor.get(IChatWidgetService);
        widgetService.getWidgetByInputUri(editorUri)?.focusLastMessage();
      }
    }
  });
  registerAction2(class FocusChatInputAction extends Action2 {
    static {
      __name(this, "FocusChatInputAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.focusInput",
        title: localize2("interactiveSession.focusInput.label", "Focus Chat Input"),
        f1: false,
        keybinding: [
          {
            primary: 2048 | 18,
            weight: 200,
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate(), ChatContextKeys.inQuickChat.negate())
          },
          {
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate(), ChatContextKeys.inQuickChat),
            primary: 2048 | 16,
            weight: 200
          }
        ]
      });
    }
    run(accessor, ...args) {
      const widgetService = accessor.get(IChatWidgetService);
      widgetService.lastFocusedWidget?.focusInput();
    }
  });
  const nonEnterpriseCopilotUsers = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.notEquals(`config.${defaultChat.completionsAdvancedSetting}.authProvider`, defaultChat.enterpriseProviderId));
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.manageSettings",
        title: localize2("manageCopilot", "Manage Copilot"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ContextKeyExpr.and(ContextKeyExpr.or(ChatContextKeys.Entitlement.limited, ChatContextKeys.Entitlement.pro), nonEnterpriseCopilotUsers),
        menu: {
          id: MenuId.ChatTitleBarMenu,
          group: "y_manage",
          order: 1,
          when: nonEnterpriseCopilotUsers
        }
      });
    }
    async run(accessor) {
      const openerService = accessor.get(IOpenerService);
      openerService.open(URI.parse(defaultChat.manageSettingsUrl));
    }
  });
  registerAction2(class ShowExtensionsUsingCopilot extends Action2 {
    static {
      __name(this, "ShowExtensionsUsingCopilot");
    }
    constructor() {
      super({
        id: "workbench.action.chat.showExtensionsUsingCopilot",
        title: localize2("showCopilotUsageExtensions", "Show Extensions using Copilot"),
        f1: true,
        category: EXTENSIONS_CATEGORY,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
      extensionsWorkbenchService.openSearch(`@feature:${CopilotUsageExtensionFeatureId}`);
    }
  });
  registerAction2(class ConfigureCopilotCompletions extends Action2 {
    static {
      __name(this, "ConfigureCopilotCompletions");
    }
    constructor() {
      super({
        id: "workbench.action.chat.configureCodeCompletions",
        title: localize2("configureCompletions", "Configure Code Completions..."),
        precondition: ChatContextKeys.Setup.installed,
        menu: {
          id: MenuId.ChatTitleBarMenu,
          group: "f_completions",
          order: 10
        }
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      commandService.executeCommand(defaultChat.completionsMenuCommand);
    }
  });
  registerAction2(class ShowQuotaExceededDialogAction extends Action2 {
    static {
      __name(this, "ShowQuotaExceededDialogAction");
    }
    constructor() {
      super({
        id: OPEN_CHAT_QUOTA_EXCEEDED_DIALOG,
        title: localize("upgradeChat", "Upgrade Copilot Plan")
      });
    }
    async run(accessor) {
      const chatEntitlementService = accessor.get(IChatEntitlementService);
      const commandService = accessor.get(ICommandService);
      const dialogService = accessor.get(IDialogService);
      const telemetryService = accessor.get(ITelemetryService);
      let message;
      const chatQuotaExceeded = chatEntitlementService.quotas.chat?.percentRemaining === 0;
      const completionsQuotaExceeded = chatEntitlementService.quotas.completions?.percentRemaining === 0;
      if (chatQuotaExceeded && !completionsQuotaExceeded) {
        message = localize("chatQuotaExceeded", "You've reached your monthly chat messages quota. You still have free code completions available.");
      } else if (completionsQuotaExceeded && !chatQuotaExceeded) {
        message = localize("completionsQuotaExceeded", "You've reached your monthly code completions quota. You still have free chat messages available.");
      } else {
        message = localize("chatAndCompletionsQuotaExceeded", "You've reached your monthly chat messages and code completions quota.");
      }
      if (chatEntitlementService.quotas.resetDate) {
        const dateFormatter = safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" });
        const quotaResetDate = new Date(chatEntitlementService.quotas.resetDate);
        message = [message, localize("quotaResetDate", "The allowance will reset on {0}.", dateFormatter.format(quotaResetDate))].join(" ");
      }
      const limited = chatEntitlementService.entitlement === ChatEntitlement.Limited;
      const upgradeToPro = limited ? localize("upgradeToPro", "Upgrade to Copilot Pro (your first 30 days are free) for:\n- Unlimited code completions\n- Unlimited chat messages\n- Access to premium models") : void 0;
      await dialogService.prompt({
        type: "none",
        message: localize("copilotQuotaReached", "Copilot Quota Reached"),
        cancelButton: {
          label: localize("dismiss", "Dismiss"),
          run: /* @__PURE__ */ __name(() => {
          }, "run")
        },
        buttons: [
          {
            label: limited ? localize("upgradePro", "Upgrade to Copilot Pro") : localize("upgradePlan", "Upgrade Copilot Plan"),
            run: /* @__PURE__ */ __name(() => {
              const commandId = "workbench.action.chat.upgradePlan";
              telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "chat-dialog" });
              commandService.executeCommand(commandId);
            }, "run")
          }
        ],
        custom: {
          icon: Codicon.copilotWarningLarge,
          markdownDetails: coalesce([
            { markdown: new MarkdownString(message, true) },
            upgradeToPro ? { markdown: new MarkdownString(upgradeToPro, true) } : void 0
          ])
        }
      });
    }
  });
}
__name(registerChatActions, "registerChatActions");
function stringifyItem(item, includeName = true) {
  if (isRequestVM(item)) {
    return (includeName ? `${item.username}: ` : "") + item.messageText;
  } else {
    return (includeName ? `${item.username}: ` : "") + item.response.toString();
  }
}
__name(stringifyItem, "stringifyItem");
const defaultChat = {
  documentationUrl: product.defaultChatAgent?.documentationUrl ?? "",
  manageSettingsUrl: product.defaultChatAgent?.manageSettingsUrl ?? "",
  managePlanUrl: product.defaultChatAgent?.managePlanUrl ?? "",
  enterpriseProviderId: product.defaultChatAgent?.enterpriseProviderId ?? "",
  completionsAdvancedSetting: product.defaultChatAgent?.completionsAdvancedSetting ?? "",
  completionsMenuCommand: product.defaultChatAgent?.completionsMenuCommand ?? ""
};
MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
  submenu: MenuId.ChatTitleBarMenu,
  title: localize("title4", "Copilot"),
  icon: Codicon.copilot,
  when: ContextKeyExpr.and(ChatContextKeys.supported, ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabled.negate()), ContextKeyExpr.has("config.chat.commandCenter.enabled")),
  order: 10001
  // to the right of command center
});
MenuRegistry.appendMenuItem(MenuId.TitleBar, {
  submenu: MenuId.ChatTitleBarMenu,
  title: localize("title4", "Copilot"),
  group: "navigation",
  icon: Codicon.copilot,
  when: ContextKeyExpr.and(ChatContextKeys.supported, ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabled.negate()), ContextKeyExpr.has("config.chat.commandCenter.enabled"), ContextKeyExpr.has("config.window.commandCenter").negate()),
  order: 1
});
registerAction2(class ToggleCopilotControl extends ToggleTitleBarConfigAction {
  static {
    __name(this, "ToggleCopilotControl");
  }
  constructor() {
    super("chat.commandCenter.enabled", localize("toggle.chatControl", "Copilot Controls"), localize("toggle.chatControlsDescription", "Toggle visibility of the Copilot Controls in title bar"), 5, ContextKeyExpr.and(ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabled.negate()), IsCompactTitleBarContext.negate(), ChatContextKeys.supported));
  }
});
registerAction2(class ResetTrustedToolsAction extends Action2 {
  static {
    __name(this, "ResetTrustedToolsAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.resetTrustedTools",
      title: localize2("resetTrustedTools", "Reset Tool Confirmations"),
      category: CHAT_CATEGORY,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(ILanguageModelToolsService).resetToolAutoConfirmation();
    accessor.get(INotificationService).info(localize("resetTrustedToolsSuccess", "Tool confirmation preferences have been reset."));
  }
});
let CopilotTitleBarMenuRendering = class CopilotTitleBarMenuRendering2 extends Disposable {
  static {
    __name(this, "CopilotTitleBarMenuRendering");
  }
  static {
    this.ID = "workbench.contrib.copilotTitleBarMenuRendering";
  }
  constructor(actionViewItemService, instantiationService, chatEntitlementService) {
    super();
    const disposable = actionViewItemService.register(MenuId.CommandCenter, MenuId.ChatTitleBarMenu, (action, options) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      const dropdownAction = toAction({
        id: "copilot.titleBarMenuRendering.more",
        label: localize("more", "More..."),
        run() {
        }
      });
      const chatExtensionInstalled = chatEntitlementService.sentiment === ChatSentiment.Installed;
      const chatQuotaExceeded = chatEntitlementService.quotas.chat?.percentRemaining === 0;
      const signedOut = chatEntitlementService.entitlement === ChatEntitlement.Unknown;
      const limited = chatEntitlementService.entitlement === ChatEntitlement.Limited;
      let primaryActionId = TOGGLE_CHAT_ACTION_ID;
      let primaryActionTitle = localize("toggleChat", "Toggle Chat");
      let primaryActionIcon = Codicon.copilot;
      if (chatExtensionInstalled) {
        if (signedOut) {
          primaryActionId = CHAT_SETUP_ACTION_ID;
          primaryActionTitle = localize("signInToChatSetup", "Sign in to use Copilot...");
          primaryActionIcon = Codicon.copilotNotConnected;
        } else if (chatQuotaExceeded && limited) {
          primaryActionId = OPEN_CHAT_QUOTA_EXCEEDED_DIALOG;
          primaryActionTitle = localize("chatQuotaExceededButton", "Copilot Free plan chat messages quota reached. Click for details.");
          primaryActionIcon = Codicon.copilotWarning;
        }
      }
      return instantiationService.createInstance(DropdownWithPrimaryActionViewItem, instantiationService.createInstance(MenuItemAction, {
        id: primaryActionId,
        title: primaryActionTitle,
        icon: primaryActionIcon
      }, void 0, void 0, void 0, void 0), dropdownAction, action.actions, "", { ...options, skipTelemetry: true });
    }, Event.any(chatEntitlementService.onDidChangeSentiment, chatEntitlementService.onDidChangeQuotaExceeded, chatEntitlementService.onDidChangeEntitlement));
    markAsSingleton(disposable);
  }
};
CopilotTitleBarMenuRendering = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService),
  __param(2, IChatEntitlementService)
], CopilotTitleBarMenuRendering);
async function handleCurrentEditingSession(currentEditingSession, phrase, dialogService) {
  if (shouldShowClearEditingSessionConfirmation(currentEditingSession)) {
    return showClearEditingSessionConfirmation(currentEditingSession, dialogService, { messageOverride: phrase });
  }
  return true;
}
__name(handleCurrentEditingSession, "handleCurrentEditingSession");
async function showClearEditingSessionConfirmation(editingSession, dialogService, options) {
  const defaultPhrase = localize("chat.startEditing.confirmation.pending.message.default", "Starting a new chat will end your current edit session.");
  const defaultTitle = localize("chat.startEditing.confirmation.title", "Start new chat?");
  const phrase = options?.messageOverride ?? defaultPhrase;
  const title = options?.titleOverride ?? defaultTitle;
  const currentEdits = editingSession.entries.get();
  const undecidedEdits = currentEdits.filter(
    (edit) => edit.state.get() === 0
    /* ModifiedFileEntryState.Modified */
  );
  const { result } = await dialogService.prompt({
    title,
    message: phrase + " " + localize("chat.startEditing.confirmation.pending.message.2", "Do you want to keep pending edits to {0} files?", undecidedEdits.length),
    type: "info",
    cancelButton: true,
    buttons: [
      {
        label: localize("chat.startEditing.confirmation.acceptEdits", "Keep & Continue"),
        run: /* @__PURE__ */ __name(async () => {
          await editingSession.accept();
          return true;
        }, "run")
      },
      {
        label: localize("chat.startEditing.confirmation.discardEdits", "Undo & Continue"),
        run: /* @__PURE__ */ __name(async () => {
          await editingSession.reject();
          return true;
        }, "run")
      }
    ]
  });
  return Boolean(result);
}
__name(showClearEditingSessionConfirmation, "showClearEditingSessionConfirmation");
function shouldShowClearEditingSessionConfirmation(editingSession) {
  const currentEdits = editingSession.entries.get();
  const currentEditCount = currentEdits.length;
  if (currentEditCount) {
    const undecidedEdits = currentEdits.filter(
      (edit) => edit.state.get() === 0
      /* ModifiedFileEntryState.Modified */
    );
    return !!undecidedEdits.length;
  }
  return false;
}
__name(shouldShowClearEditingSessionConfirmation, "shouldShowClearEditingSessionConfirmation");
export {
  CHAT_CATEGORY,
  CHAT_OPEN_ACTION_ID,
  CHAT_SETUP_ACTION_ID,
  CopilotTitleBarMenuRendering,
  getOpenChatActionIdForMode,
  handleCurrentEditingSession,
  registerChatActions,
  shouldShowClearEditingSessionConfirmation,
  showClearEditingSessionConfirmation,
  stringifyItem
};
//# sourceMappingURL=chatActions.js.map
