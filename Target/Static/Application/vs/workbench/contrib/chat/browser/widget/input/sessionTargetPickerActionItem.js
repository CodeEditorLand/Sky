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
import { renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IChatSessionsService } from "../../../common/chatSessionsService.js";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "../../agentSessions/agentSessions.js";
import { ChatInputPickerActionViewItem } from "./chatInputPickerActionItem.js";
let SessionTypePickerActionItem = class SessionTypePickerActionItem2 extends ChatInputPickerActionViewItem {
  static {
    __name(this, "SessionTypePickerActionItem");
  }
  constructor(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService) {
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const currentType = this.delegate.getActiveSessionProvider();
        const actions = [];
        for (const sessionTypeItem of this._sessionTypeItems) {
          actions.push({
            ...action,
            id: sessionTypeItem.commandId,
            label: sessionTypeItem.label,
            tooltip: sessionTypeItem.description,
            checked: currentType === sessionTypeItem.type,
            icon: getAgentSessionProviderIcon(sessionTypeItem.type),
            enabled: true,
            run: /* @__PURE__ */ __name(async () => {
              if (this.delegate.setActiveSessionProvider) {
                this.delegate.setActiveSessionProvider(sessionTypeItem.type);
              } else {
                this.commandService.executeCommand(sessionTypeItem.commandId, this.chatSessionPosition);
              }
              if (this.element) {
                this.renderLabel(this.element);
              }
            }, "run")
          });
        }
        return actions;
      }, "getActions")
    };
    const actionBarActions = [];
    const learnMoreUrl = "https://code.visualstudio.com/docs/copilot/agents/overview";
    actionBarActions.push({
      id: "workbench.action.chat.agentOverview.learnMore",
      label: localize("chat.learnMore", "Learn about agent types..."),
      tooltip: learnMoreUrl,
      class: void 0,
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
        await openerService.open(URI.parse(learnMoreUrl));
      }, "run")
    });
    const sessionTargetPickerOptions = {
      actionProvider,
      actionBarActions,
      actionBarActionProvider: void 0,
      showItemKeybindings: true
    };
    super(action, sessionTargetPickerOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService);
    this.chatSessionPosition = chatSessionPosition;
    this.delegate = delegate;
    this.chatSessionsService = chatSessionsService;
    this.commandService = commandService;
    this._sessionTypeItems = [];
    this._updateAgentSessionItems();
    this._register(this.chatSessionsService.onDidChangeAvailability(() => {
      this._updateAgentSessionItems();
    }));
  }
  _updateAgentSessionItems() {
    const localSessionItem = {
      type: AgentSessionProviders.Local,
      label: getAgentSessionProviderName(AgentSessionProviders.Local),
      description: localize("chat.sessionTarget.local.description", "Local chat session"),
      commandId: `workbench.action.chat.openNewChatSessionInPlace.${AgentSessionProviders.Local}`
    };
    const agentSessionItems = [localSessionItem];
    const contributions = this.chatSessionsService.getAllChatSessionContributions();
    for (const contribution of contributions) {
      const agentSessionType = getAgentSessionProvider(contribution.type);
      if (!agentSessionType) {
        continue;
      }
      agentSessionItems.push({
        type: agentSessionType,
        label: getAgentSessionProviderName(agentSessionType),
        description: contribution.description,
        commandId: `workbench.action.chat.openNewChatSessionInPlace.${contribution.type}`
      });
    }
    this._sessionTypeItems = agentSessionItems;
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const currentType = this.delegate.getActiveSessionProvider();
    const label = getAgentSessionProviderName(currentType ?? AgentSessionProviders.Local);
    const icon = getAgentSessionProviderIcon(currentType ?? AgentSessionProviders.Local);
    const labelElements = [];
    labelElements.push(...renderLabelWithIcons(`$(${icon.id})`));
    if (currentType !== AgentSessionProviders.Local) {
      labelElements.push(dom.$("span.chat-input-picker-label", void 0, label));
    }
    labelElements.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...labelElements);
    return null;
  }
};
SessionTypePickerActionItem = __decorate([
  __param(4, IActionWidgetService),
  __param(5, IKeybindingService),
  __param(6, IContextKeyService),
  __param(7, IChatSessionsService),
  __param(8, ICommandService),
  __param(9, IOpenerService)
], SessionTypePickerActionItem);
export {
  SessionTypePickerActionItem
};
//# sourceMappingURL=sessionTargetPickerActionItem.js.map
