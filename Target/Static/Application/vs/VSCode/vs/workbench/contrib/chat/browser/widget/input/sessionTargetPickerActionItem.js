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
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { IChatSessionsService } from "../../../common/chatSessionsService.js";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderDescription, getAgentSessionProviderIcon, getAgentSessionProviderName, isFirstPartyAgentSessionProvider } from "../../agentSessions/agentSessions.js";
import { ChatInputPickerActionViewItem } from "./chatInputPickerActionItem.js";
const firstPartyCategory = { label: localize("chat.sessionTarget.category.agent", "Agent Types"), order: 1 };
const otherCategory = { label: localize("chat.sessionTarget.category.other", "Other"), order: 2 };
let SessionTypePickerActionItem = class SessionTypePickerActionItem2 extends ChatInputPickerActionViewItem {
  static {
    __name(this, "SessionTypePickerActionItem");
  }
  constructor(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService, telemetryService) {
    const actionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        const currentType = this._getSelectedSessionType();
        const actions = [...this._getAdditionalActions().map((a) => ({ ...action, ...a }))];
        for (const sessionTypeItem of this._sessionTypeItems) {
          if (!this._isVisible(sessionTypeItem.type)) {
            continue;
          }
          actions.push({
            ...action,
            id: sessionTypeItem.commandId,
            label: sessionTypeItem.label,
            checked: currentType === sessionTypeItem.type,
            icon: getAgentSessionProviderIcon(sessionTypeItem.type),
            enabled: this._isSessionTypeEnabled(sessionTypeItem.type),
            category: this._getSessionCategory(sessionTypeItem),
            description: this._getSessionDescription(sessionTypeItem),
            tooltip: "",
            hover: { content: sessionTypeItem.hoverDescription, position: this.pickerOptions.hoverPosition },
            run: /* @__PURE__ */ __name(async () => {
              this._run(sessionTypeItem);
            }, "run")
          });
        }
        return actions;
      }, "getActions")
    };
    const actionBarActionProvider = {
      getActions: /* @__PURE__ */ __name(() => {
        return [this._getLearnMore()];
      }, "getActions")
    };
    const sessionTargetPickerOptions = {
      actionProvider,
      actionBarActionProvider,
      showItemKeybindings: true,
      reporter: { id: "ChatSessionTypePicker", name: `ChatSessionTypePicker`, includeOptions: true }
    };
    super(action, sessionTargetPickerOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.chatSessionPosition = chatSessionPosition;
    this.delegate = delegate;
    this.keybindingService = keybindingService;
    this.chatSessionsService = chatSessionsService;
    this.commandService = commandService;
    this.openerService = openerService;
    this._sessionTypeItems = [];
    this._register(this.chatSessionsService.onDidChangeAvailability(() => {
      this._updateAgentSessionItems();
    }));
    this._updateAgentSessionItems();
  }
  _run(sessionTypeItem) {
    if (this.delegate.setActiveSessionProvider) {
      this.delegate.setActiveSessionProvider(sessionTypeItem.type);
    } else {
      this.commandService.executeCommand(sessionTypeItem.commandId, this.chatSessionPosition);
    }
    if (this.element) {
      this.renderLabel(this.element);
    }
  }
  _getSelectedSessionType() {
    return this.delegate.getActiveSessionProvider();
  }
  _getAdditionalActions() {
    return [];
  }
  _getLearnMore() {
    const learnMoreUrl = "https://code.visualstudio.com/docs/copilot/agents/overview";
    return {
      id: "workbench.action.chat.agentOverview.learnMore",
      label: localize("chat.learnMoreAgentTypes", "Learn about agent types..."),
      tooltip: learnMoreUrl,
      class: void 0,
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
        await this.openerService.open(URI.parse(learnMoreUrl));
      }, "run")
    };
  }
  _updateAgentSessionItems() {
    const localSessionItem = {
      type: AgentSessionProviders.Local,
      label: getAgentSessionProviderName(AgentSessionProviders.Local),
      hoverDescription: getAgentSessionProviderDescription(AgentSessionProviders.Local),
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
        hoverDescription: getAgentSessionProviderDescription(agentSessionType),
        commandId: contribution.canDelegate ? `workbench.action.chat.openNewChatSessionInPlace.${contribution.type}` : `workbench.action.chat.openNewChatSessionExternal.${contribution.type}`
      });
    }
    this._sessionTypeItems = agentSessionItems;
  }
  _isVisible(type) {
    return true;
  }
  _isSessionTypeEnabled(type) {
    if (type === AgentSessionProviders.Local) {
      return true;
    }
    return !!this.chatSessionsService.getChatSessionContribution(type);
  }
  _getSessionCategory(sessionTypeItem) {
    return isFirstPartyAgentSessionProvider(sessionTypeItem.type) ? firstPartyCategory : otherCategory;
  }
  _getSessionDescription(sessionTypeItem) {
    return void 0;
  }
  render(container) {
    super.render(container);
    container.classList.add("chat-session-target-picker-item");
  }
  renderLabel(element) {
    this.setAriaLabelAttributes(element);
    const currentType = this._getSelectedSessionType();
    const label = getAgentSessionProviderName(currentType ?? AgentSessionProviders.Local);
    const icon = getAgentSessionProviderIcon(currentType ?? AgentSessionProviders.Local);
    const labelElements = [];
    labelElements.push(...renderLabelWithIcons(`$(${icon.id})`));
    labelElements.push(dom.$("span.chat-input-picker-label", void 0, label));
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
  __param(9, IOpenerService),
  __param(10, ITelemetryService)
], SessionTypePickerActionItem);
export {
  SessionTypePickerActionItem
};
//# sourceMappingURL=sessionTargetPickerActionItem.js.map
