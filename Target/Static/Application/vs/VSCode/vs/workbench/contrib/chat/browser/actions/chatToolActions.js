var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { autorun } from "../../../../../base/common/observable.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
import { ChatModeKind } from "../../common/constants.js";
import { IChatWidgetService } from "../chat.js";
import { ToolsScope } from "../widget/input/chatSelectedTools.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { showToolsPicker } from "./chatToolPicker.js";
const AcceptToolConfirmationActionId = "workbench.action.chat.acceptTool";
const SkipToolConfirmationActionId = "workbench.action.chat.skipTool";
const AcceptToolPostConfirmationActionId = "workbench.action.chat.acceptToolPostExecution";
const SkipToolPostConfirmationActionId = "workbench.action.chat.skipToolPostExecution";
class ToolConfirmationAction extends Action2 {
  static {
    __name(this, "ToolConfirmationAction");
  }
  run(accessor, context) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = context?.sessionResource ? chatWidgetService.getWidgetBySessionResource(context.sessionResource) : chatWidgetService.lastFocusedWidget;
    const lastItem = widget?.viewModel?.getItems().at(-1);
    if (!isResponseVM(lastItem)) {
      return;
    }
    for (const item of lastItem.model.response.value) {
      const state = item.kind === "toolInvocation" ? item.state.get() : void 0;
      if (state?.type === 1 || state?.type === 3) {
        state.confirm(this.getReason());
        break;
      }
    }
    widget?.focusInput();
  }
}
class AcceptToolConfirmation extends ToolConfirmationAction {
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
        primary: 2048 | 3,
        // Override chatEditor.action.accept
        weight: 200 + 1
      }
    });
  }
  getReason() {
    return {
      type: 4
      /* ToolConfirmKind.UserAction */
    };
  }
}
class SkipToolConfirmation extends ToolConfirmationAction {
  static {
    __name(this, "SkipToolConfirmation");
  }
  constructor() {
    super({
      id: SkipToolConfirmationActionId,
      title: localize2("chat.skip", "Skip"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasToolConfirmation),
        primary: 2048 | 3 | 512,
        // Override chatEditor.action.accept
        weight: 200 + 1
      }
    });
  }
  getReason() {
    return {
      type: 5
      /* ToolConfirmKind.Skipped */
    };
  }
}
class ConfigureToolsAction extends Action2 {
  static {
    __name(this, "ConfigureToolsAction");
  }
  static {
    this.ID = "workbench.action.chat.configureTools";
  }
  constructor() {
    super({
      id: ConfigureToolsAction.ID,
      title: localize("label", "Configure Tools..."),
      icon: Codicon.settings,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Agent),
      menu: [{
        when: ContextKeyExpr.and(ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Agent), ChatContextKeys.lockedToCodingAgent.negate()),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 100
      }]
    });
  }
  async run(accessor, ...args) {
    const instaService = accessor.get(IInstantiationService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const telemetryService = accessor.get(ITelemetryService);
    let widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      widget = this.extractWidget(args);
    }
    if (!widget) {
      return;
    }
    const source = this.extractSource(args) ?? "chatInput";
    let placeholder;
    let description;
    const { entriesScope, entriesMap } = widget.input.selectedToolsModel;
    switch (entriesScope) {
      case ToolsScope.Session:
        placeholder = localize("chat.tools.placeholder.session", "Select tools for this chat session");
        description = localize("chat.tools.description.session", "The selected tools were configured only for this chat session.");
        break;
      case ToolsScope.Agent:
        placeholder = localize("chat.tools.placeholder.agent", "Select tools for this custom agent");
        description = localize("chat.tools.description.agent", "The selected tools are configured by the '{0}' custom agent. Changes to the tools will be applied to the custom agent file as well.", widget.input.currentModeObs.get().label.get());
        break;
      case ToolsScope.Agent_ReadOnly:
        placeholder = localize("chat.tools.placeholder.readOnlyAgent", "Select tools for this custom agent");
        description = localize("chat.tools.description.readOnlyAgent", "The selected tools are configured by the '{0}' custom agent. Changes to the tools will only be used for this session and will not change the '{0}' custom agent.", widget.input.currentModeObs.get().label.get());
        break;
      case ToolsScope.Global:
        placeholder = localize("chat.tools.placeholder.global", "Select tools that are available to chat.");
        description = localize("chat.tools.description.global", "The selected tools will be applied globally for all chat sessions that use the default agent.");
        break;
    }
    const cts = new CancellationTokenSource();
    const initialMode = widget.input.currentModeObs.get();
    const modeListener = autorun((reader) => {
      if (initialMode.id !== widget.input.currentModeObs.read(reader).id) {
        cts.cancel();
      }
    });
    try {
      const result = await instaService.invokeFunction(showToolsPicker, placeholder, source, description, () => entriesMap.get(), widget.input.selectedLanguageModel.get()?.metadata, cts.token);
      if (result) {
        widget.input.selectedToolsModel.set(result, false);
      }
    } finally {
      modeListener.dispose();
      cts.dispose();
    }
    const tools = widget.input.selectedToolsModel.entriesMap.get();
    telemetryService.publicLog2("chat/selectedTools", {
      total: tools.size,
      enabled: Iterable.reduce(tools, (prev, [_, enabled]) => enabled ? prev + 1 : prev, 0)
    });
  }
  extractWidget(args) {
    function isChatActionContext(obj) {
      return !!obj && typeof obj === "object" && !!obj.widget;
    }
    __name(isChatActionContext, "isChatActionContext");
    for (const arg of args) {
      if (isChatActionContext(arg)) {
        return arg.widget;
      }
    }
    return void 0;
  }
  extractSource(args) {
    function isChatActionSource(obj) {
      return !!obj && typeof obj === "object" && !!obj.source;
    }
    __name(isChatActionSource, "isChatActionSource");
    for (const arg of args) {
      if (isChatActionSource(arg)) {
        return arg.source;
      }
    }
    return void 0;
  }
}
function registerChatToolActions() {
  registerAction2(AcceptToolConfirmation);
  registerAction2(SkipToolConfirmation);
  registerAction2(ConfigureToolsAction);
}
__name(registerChatToolActions, "registerChatToolActions");
export {
  AcceptToolConfirmationActionId,
  AcceptToolPostConfirmationActionId,
  ConfigureToolsAction,
  SkipToolConfirmationActionId,
  SkipToolPostConfirmationActionId,
  registerChatToolActions
};
//# sourceMappingURL=chatToolActions.js.map
