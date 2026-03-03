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
import { Codicon } from "../../../../../../base/common/codicons.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
import { IActionWidgetService } from "../../../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { IsSessionsWindowContext } from "../../../../../common/contextkeys.js";
import { IChatSessionsService } from "../../../common/chatSessionsService.js";
import { ACTION_ID_NEW_CHAT } from "../../actions/chatActions.js";
import { AgentSessionProviders, getAgentCanContinueIn, getAgentSessionProvider, isFirstPartyAgentSessionProvider } from "../../agentSessions/agentSessions.js";
import { SessionTypePickerActionItem } from "./sessionTargetPickerActionItem.js";
let DelegationSessionPickerActionItem = class DelegationSessionPickerActionItem2 extends SessionTypePickerActionItem {
  static {
    __name(this, "DelegationSessionPickerActionItem");
  }
  constructor(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService, telemetryService) {
    super(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService, telemetryService);
    this._isSessionsWindow = IsSessionsWindowContext.getValue(contextKeyService) === true;
  }
  _run(sessionTypeItem) {
    if (this.delegate.setPendingDelegationTarget) {
      this.delegate.setPendingDelegationTarget(sessionTypeItem.type);
    }
    if (this.element) {
      this.renderLabel(this.element);
    }
  }
  _getSelectedSessionType() {
    const delegationTarget = this.delegate.getPendingDelegationTarget ? this.delegate.getPendingDelegationTarget() : void 0;
    if (delegationTarget) {
      return delegationTarget;
    }
    return this.delegate.getActiveSessionProvider();
  }
  _isSessionTypeEnabled(type) {
    const allContributions = this.chatSessionsService.getAllChatSessionContributions();
    const contribution = allContributions.find((contribution2) => getAgentSessionProvider(contribution2.type) === type);
    const activeProvider = this.delegate.getActiveSessionProvider();
    if (!this._isSessionsWindow && activeProvider !== AgentSessionProviders.Local) {
      return false;
    }
    if (this._isSessionsWindow && activeProvider !== AgentSessionProviders.Background) {
      return false;
    }
    if (contribution && !contribution.canDelegate && activeProvider !== type) {
      return false;
    }
    return this._getSelectedSessionType() !== type;
  }
  _isVisible(type) {
    if (this._isSessionsWindow && type === AgentSessionProviders.Local) {
      return false;
    }
    if (this.delegate.getActiveSessionProvider() === type) {
      return true;
    }
    return getAgentCanContinueIn(type);
  }
  _getSessionCategory(sessionTypeItem) {
    if (isFirstPartyAgentSessionProvider(sessionTypeItem.type)) {
      return { label: localize("continueIn", "Continue In"), order: 1, showHeader: true };
    }
    return { label: localize("continueInThirdParty", "Continue In (Third Party)"), order: 2, showHeader: false };
  }
  _getLearnMore() {
    const learnMoreUrl = "https://aka.ms/vscode-continue-chat-in";
    return {
      id: "workbench.action.chat.agentOverview.learnMoreHandOff",
      label: localize("chat.learnMoreAgentHandOff", "Learn about agent handoff..."),
      tooltip: learnMoreUrl,
      class: void 0,
      enabled: true,
      run: /* @__PURE__ */ __name(async () => {
        await this.openerService.open(URI.parse(learnMoreUrl));
      }, "run")
    };
  }
  _getAdditionalActions() {
    if (this._isSessionsWindow) {
      return [];
    }
    return [{
      id: "newChatSession",
      class: void 0,
      label: localize("chat.newChatSession", "New Chat Session"),
      tooltip: "",
      hover: { content: "", position: this.pickerOptions.hoverPosition },
      checked: false,
      icon: Codicon.plus,
      enabled: true,
      category: { label: localize("chat.newChatSession.category", "New Chat Session"), order: 0, showHeader: false },
      description: this.keybindingService.lookupKeybinding(ACTION_ID_NEW_CHAT)?.getLabel() || void 0,
      run: /* @__PURE__ */ __name(async () => {
        this.commandService.executeCommand(ACTION_ID_NEW_CHAT, this.chatSessionPosition);
      }, "run")
    }];
  }
};
DelegationSessionPickerActionItem = __decorate([
  __param(4, IActionWidgetService),
  __param(5, IKeybindingService),
  __param(6, IContextKeyService),
  __param(7, IChatSessionsService),
  __param(8, ICommandService),
  __param(9, IOpenerService),
  __param(10, ITelemetryService)
], DelegationSessionPickerActionItem);
export {
  DelegationSessionPickerActionItem
};
//# sourceMappingURL=delegationSessionPickerActionItem.js.map
