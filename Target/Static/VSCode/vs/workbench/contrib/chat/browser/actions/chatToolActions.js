var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { diffSets } from "../../../../../base/common/collections.js";
import { Event } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { AddConfigurationAction } from "../../../mcp/browser/mcpCommands.js";
import { IMcpService, IMcpServer, McpConnectionState } from "../../../mcp/common/mcpTypes.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { IChatToolInvocation } from "../../common/chatService.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import { ChatMode } from "../../common/constants.js";
import { ILanguageModelToolsService, IToolData, ToolDataSource } from "../../common/languageModelToolsService.js";
import { IChatWidget, IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const AcceptToolConfirmationActionId = "workbench.action.chat.acceptTool";
class AcceptToolConfirmation extends Action2 {
  static {
    __name(this, "AcceptToolConfirmation");
  }
  constructor() {
    super({
      id: AcceptToolConfirmationActionId,
      title: localize2("chat.accept", "Accept"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasToolConfirmation),
        primary: KeyMod.CtrlCmd | KeyCode.Enter,
        // Override chatEditor.action.accept
        weight: KeybindingWeight.WorkbenchContrib + 1
      }
    });
  }
  run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    const lastItem = widget?.viewModel?.getItems().at(-1);
    if (!isResponseVM(lastItem)) {
      return;
    }
    const unconfirmedToolInvocation = lastItem.model.response.value.find((item) => item.kind === "toolInvocation" && !item.isConfirmed);
    if (unconfirmedToolInvocation) {
      unconfirmedToolInvocation.confirmed.complete(true);
    }
    widget?.focusInput();
  }
}
class AttachToolsAction extends Action2 {
  static {
    __name(this, "AttachToolsAction");
  }
  static id = "workbench.action.chat.attachTools";
  constructor() {
    super({
      id: AttachToolsAction.id,
      title: localize("label", "Select Tools..."),
      icon: Codicon.tools,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent),
      menu: {
        when: ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent),
        id: MenuId.ChatInputAttachmentToolbar,
        group: "navigation",
        order: 1
      },
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent)),
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Slash,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  async run(accessor, ...args) {
    const quickPickService = accessor.get(IQuickInputService);
    const mcpService = accessor.get(IMcpService);
    const toolsService = accessor.get(ILanguageModelToolsService);
    const extensionService = accessor.get(IExtensionService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const telemetryService = accessor.get(ITelemetryService);
    const commandService = accessor.get(ICommandService);
    const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    let widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      let isChatActionContext2 = function(obj) {
        return obj && typeof obj === "object" && obj.widget;
      };
      var isChatActionContext = isChatActionContext2;
      __name(isChatActionContext2, "isChatActionContext");
      const context = args[0];
      if (isChatActionContext2(context)) {
        widget = context.widget;
      }
    }
    if (!widget) {
      return;
    }
    const mcpServerByTool = /* @__PURE__ */ new Map();
    for (const server of mcpService.servers.get()) {
      for (const tool of server.tools.get()) {
        mcpServerByTool.set(tool.id, server);
      }
    }
    let BucketOrdinal;
    ((BucketOrdinal2) => {
      BucketOrdinal2[BucketOrdinal2["Extension"] = 0] = "Extension";
      BucketOrdinal2[BucketOrdinal2["Mcp"] = 1] = "Mcp";
      BucketOrdinal2[BucketOrdinal2["Other"] = 2] = "Other";
    })(BucketOrdinal || (BucketOrdinal = {}));
    const addMcpPick = { type: "item", label: localize("addServer", "Add MCP Server..."), iconClass: ThemeIcon.asClassName(Codicon.add), pickable: false, run: /* @__PURE__ */ __name(() => commandService.executeCommand(AddConfigurationAction.ID), "run") };
    const addExpPick = { type: "item", label: localize("addExtension", "Install Extension..."), iconClass: ThemeIcon.asClassName(Codicon.add), pickable: false, run: /* @__PURE__ */ __name(() => extensionWorkbenchService.openSearch("@tag:language-model-tools"), "run") };
    const addPick = {
      type: "item",
      label: localize("addAny", "Add More Tools..."),
      iconClass: ThemeIcon.asClassName(Codicon.add),
      pickable: false,
      run: /* @__PURE__ */ __name(async () => {
        const pick = await quickPickService.pick(
          [addMcpPick, addExpPick],
          {
            canPickMany: false,
            title: localize("noTools", "Add tools to chat")
          }
        );
        pick?.run();
      }, "run")
    };
    const defaultBucket = {
      type: "item",
      children: [],
      label: localize("defaultBucketLabel", "Other Tools"),
      source: { type: "internal" },
      ordinal: 2 /* Other */,
      picked: true
    };
    const nowSelectedTools = new Set(widget.input.selectedToolsModel.tools.get());
    const toolBuckets = /* @__PURE__ */ new Map();
    for (const tool of toolsService.getTools()) {
      if (!tool.supportsToolPicker) {
        continue;
      }
      let bucket;
      if (tool.source.type === "mcp") {
        const mcpServer = mcpServerByTool.get(tool.id);
        if (!mcpServer) {
          continue;
        }
        bucket = toolBuckets.get(mcpServer.definition.id) ?? {
          type: "item",
          label: localize("mcplabel", "MCP Server: {0}", mcpServer?.definition.label),
          status: localize("mcpstatus", "From {0} ({1})", mcpServer.collection.label, McpConnectionState.toString(mcpServer.connectionState.get())),
          ordinal: 1 /* Mcp */,
          source: tool.source,
          picked: false,
          children: []
        };
        toolBuckets.set(mcpServer.definition.id, bucket);
      } else if (tool.source.type === "extension") {
        const extensionId = tool.source.extensionId;
        const ext = extensionService.extensions.find((value) => ExtensionIdentifier.equals(value.identifier, extensionId));
        if (!ext) {
          continue;
        }
        bucket = toolBuckets.get(ExtensionIdentifier.toKey(extensionId)) ?? {
          type: "item",
          label: ext.displayName ?? ext.name,
          ordinal: 0 /* Extension */,
          picked: false,
          source: tool.source,
          children: []
        };
        toolBuckets.set(ExtensionIdentifier.toKey(ext.identifier), bucket);
      } else if (tool.source.type === "internal") {
        bucket = defaultBucket;
      } else {
        assertNever(tool.source);
      }
      const picked = nowSelectedTools.has(tool);
      bucket.children.push({
        tool,
        parent: bucket,
        type: "item",
        label: tool.displayName,
        description: tool.userDescription,
        picked,
        indented: true
      });
      if (picked) {
        bucket.picked = true;
      }
    }
    function isBucketPick(obj) {
      return Boolean(obj.children);
    }
    __name(isBucketPick, "isBucketPick");
    function isToolPick(obj) {
      return Boolean(obj.tool);
    }
    __name(isToolPick, "isToolPick");
    function isAddPick(obj) {
      return Boolean(obj.run);
    }
    __name(isAddPick, "isAddPick");
    const store = new DisposableStore();
    const picks = [];
    for (const bucket of Array.from(toolBuckets.values()).sort((a, b) => a.ordinal - b.ordinal)) {
      picks.push({
        type: "separator",
        label: bucket.status
      });
      picks.push(bucket);
      picks.push(...bucket.children);
    }
    const picker = store.add(quickPickService.createQuickPick({ useSeparators: true }));
    picker.placeholder = localize("placeholder", "Select tools that are available to chat");
    picker.canSelectMany = true;
    picker.keepScrollPosition = true;
    picker.matchOnDescription = true;
    if (picks.length === 0) {
      picker.placeholder = localize("noTools", "Add tools to chat");
      picker.canSelectMany = false;
      picks.push(
        addMcpPick,
        addExpPick
      );
    } else {
      picks.push(
        { type: "separator" },
        addPick
      );
    }
    let lastSelectedItems = /* @__PURE__ */ new Set();
    let ignoreEvent = false;
    const _update = /* @__PURE__ */ __name(() => {
      ignoreEvent = true;
      try {
        const items = picks.filter((p) => p.type === "item" && Boolean(p.picked));
        lastSelectedItems = new Set(items);
        picker.selectedItems = items;
        const disableBuckets = [];
        const disableTools = [];
        for (const item of picks) {
          if (item.type === "item" && !item.picked) {
            if (isBucketPick(item)) {
              disableBuckets.push(item.source);
            } else if (isToolPick(item) && item.parent.picked) {
              disableTools.push(item.tool);
            }
          }
        }
        widget.input.selectedToolsModel.update(disableBuckets, disableTools);
      } finally {
        ignoreEvent = false;
      }
    }, "_update");
    _update();
    picker.items = picks;
    picker.show();
    store.add(picker.onDidChangeSelection((selectedPicks) => {
      if (ignoreEvent) {
        return;
      }
      const addPick2 = selectedPicks.find(isAddPick);
      if (addPick2) {
        addPick2.run();
        picker.hide();
        return;
      }
      const { added, removed } = diffSets(lastSelectedItems, new Set(selectedPicks));
      for (const item of added) {
        item.picked = true;
        if (isBucketPick(item)) {
          for (const toolPick of item.children) {
            toolPick.picked = true;
          }
        } else if (isToolPick(item)) {
          item.parent.picked = true;
        }
      }
      for (const item of removed) {
        item.picked = false;
        if (isBucketPick(item)) {
          for (const toolPick of item.children) {
            toolPick.picked = false;
          }
        } else if (isToolPick(item) && item.parent.children.every((child) => !child.picked)) {
          item.parent.picked = false;
        }
      }
      _update();
    }));
    store.add(picker.onDidAccept(() => {
      picker.activeItems.find(isAddPick)?.run();
    }));
    await Promise.race([Event.toPromise(Event.any(picker.onDidAccept, picker.onDidHide))]);
    telemetryService.publicLog2("chat/selectedTools", {
      enabled: widget.input.selectedToolsModel.tools.get().length,
      total: Iterable.length(toolsService.getTools())
    });
    store.dispose();
  }
}
function registerChatToolActions() {
  registerAction2(AcceptToolConfirmation);
  registerAction2(AttachToolsAction);
}
__name(registerChatToolActions, "registerChatToolActions");
export {
  AcceptToolConfirmationActionId,
  AttachToolsAction,
  registerChatToolActions
};
//# sourceMappingURL=chatToolActions.js.map
