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
import { $ } from "../../../../../base/browser/dom.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { markAsSingleton } from "../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IActionViewItemService } from "../../../../../platform/actions/browser/actionViewItemService.js";
import { MenuEntryActionViewItem } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, MenuId, MenuItemAction, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
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
  run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
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
      icon: Codicon.tools,
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
      let isChatActionContext2 = function(obj) {
        return !!obj && typeof obj === "object" && !!obj.widget;
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
      const result = await instaService.invokeFunction(showToolsPicker, placeholder, description, () => entriesMap.get(), cts.token);
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
}
let ConfigureToolsActionRendering = class ConfigureToolsActionRendering2 {
  static {
    __name(this, "ConfigureToolsActionRendering");
  }
  static {
    this.ID = "chat.configureToolsActionRendering";
  }
  constructor(actionViewItemService) {
    const disposable = actionViewItemService.register(MenuId.ChatInput, ConfigureToolsAction.ID, (action, _opts, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(class extends MenuEntryActionViewItem {
        render(container) {
          super.render(container);
          this.warningElement = $(`.tool-warning-indicator${ThemeIcon.asCSSSelector(Codicon.warning)}`);
          this.warningElement.style.display = "none";
          container.appendChild(this.warningElement);
          container.style.position = "relative";
          this.updateWarningState();
          this._register(this._contextKeyService.onDidChangeContext(() => {
            this.updateWarningState();
          }));
        }
        updateWarningState() {
          const wasShown = this.warningElement.style.display === "block";
          const shouldBeShown = this.isAboveToolLimit();
          if (!wasShown && shouldBeShown) {
            this.warningElement.style.display = "block";
            this.updateTooltip();
          } else if (wasShown && !shouldBeShown) {
            this.warningElement.style.display = "none";
            this.updateTooltip();
          }
        }
        getTooltip() {
          if (this.isAboveToolLimit()) {
            const warningMessage = localize("chatTools.tooManyEnabled", "More than {0} tools are enabled, you may experience degraded tool calling.", this._contextKeyService.getContextKeyValue(ChatContextKeys.chatToolGroupingThreshold.key));
            return `${warningMessage}`;
          }
          return super.getTooltip();
        }
        isAboveToolLimit() {
          const rawToolLimit = this._contextKeyService.getContextKeyValue(ChatContextKeys.chatToolGroupingThreshold.key);
          const rawToolCount = this._contextKeyService.getContextKeyValue(ChatContextKeys.chatToolCount.key);
          if (rawToolLimit === void 0 || rawToolCount === void 0) {
            return false;
          }
          const toolLimit = Number(rawToolLimit || 0);
          const toolCount = Number(rawToolCount || 0);
          return toolCount > toolLimit;
        }
      }, action, void 0);
    });
    markAsSingleton(disposable);
  }
};
ConfigureToolsActionRendering = __decorate([
  __param(0, IActionViewItemService)
], ConfigureToolsActionRendering);
function registerChatToolActions() {
  registerAction2(AcceptToolConfirmation);
  registerAction2(SkipToolConfirmation);
  registerAction2(ConfigureToolsAction);
  registerWorkbenchContribution2(
    ConfigureToolsActionRendering.ID,
    ConfigureToolsActionRendering,
    2
    /* WorkbenchPhase.BlockRestore */
  );
}
__name(registerChatToolActions, "registerChatToolActions");
export {
  AcceptToolConfirmationActionId,
  AcceptToolPostConfirmationActionId,
  SkipToolConfirmationActionId,
  SkipToolPostConfirmationActionId,
  registerChatToolActions
};
//# sourceMappingURL=chatToolActions.js.map
