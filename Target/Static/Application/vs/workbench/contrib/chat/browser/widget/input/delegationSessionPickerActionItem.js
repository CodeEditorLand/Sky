var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../../base/common/codicons.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
import { ACTION_ID_NEW_CHAT } from "../../actions/chatActions.js";
import { AgentSessionProviders, getAgentCanContinueIn, getAgentSessionProvider, isFirstPartyAgentSessionProvider } from "../../agentSessions/agentSessions.js";
import { SessionTypePickerActionItem } from "./sessionTargetPickerActionItem.js";
class DelegationSessionPickerActionItem extends SessionTypePickerActionItem {
  static {
    __name(this, "DelegationSessionPickerActionItem");
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
    if (this.delegate.getActiveSessionProvider() !== AgentSessionProviders.Local) {
      return false;
    }
    if (contribution && !contribution.canDelegate && this.delegate.getActiveSessionProvider() !== type) {
      return false;
    }
    return this._getSelectedSessionType() !== type;
  }
  _isVisible(type) {
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
  _getSessionDescription(sessionTypeItem) {
    const allContributions = this.chatSessionsService.getAllChatSessionContributions();
    const contribution = allContributions.find((contribution2) => getAgentSessionProvider(contribution2.type) === sessionTypeItem.type);
    return contribution?.name ? `@${contribution.name}` : void 0;
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
}
export {
  DelegationSessionPickerActionItem
};
//# sourceMappingURL=delegationSessionPickerActionItem.js.map
