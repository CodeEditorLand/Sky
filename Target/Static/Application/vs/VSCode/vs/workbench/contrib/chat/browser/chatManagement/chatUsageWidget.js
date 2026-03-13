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
import "./media/chatUsageWidget.css";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../../base/common/event.js";
import * as DOM from "../../../../../base/browser/dom.js";
import { localize } from "../../../../../nls.js";
import { IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
import { language } from "../../../../../base/common/platform.js";
import { safeIntl } from "../../../../../base/common/date.js";
const $ = DOM.$;
let ChatUsageWidget = class ChatUsageWidget2 extends Disposable {
  static {
    __name(this, "ChatUsageWidget");
  }
  constructor(chatEntitlementService) {
    super();
    this.chatEntitlementService = chatEntitlementService;
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this.dateFormatter = safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" });
    this.dateTimeFormatter = safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" });
    this.element = DOM.$(".chat-usage-widget");
    this.create(this.element);
    this.render();
    this._register(this.chatEntitlementService.onDidChangeQuotaRemaining(() => this.render()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.render()));
  }
  create(container) {
    this.usageSection = DOM.append(container, $(".copilot-usage-section"));
  }
  render() {
    DOM.clearNode(this.usageSection);
    const { chat: chatQuota, completions: completionsQuota, premiumChat: premiumChatQuota, resetDate, resetDateHasTime } = this.chatEntitlementService.quotas;
    if (this.chatEntitlementService.anonymous && this.chatEntitlementService.sentiment.installed && !completionsQuota && !chatQuota && !premiumChatQuota) {
      this.renderLimitedQuotaItem(this.usageSection, localize("completionsLabel", "Inline Suggestions"));
      this.renderLimitedQuotaItem(this.usageSection, localize("chatsLabel", "Chat messages"));
    } else if (completionsQuota || chatQuota || premiumChatQuota) {
      if (completionsQuota) {
        this.renderQuotaItem(this.usageSection, localize("plan.inlineSuggestions", "Inline Suggestions"), completionsQuota);
      }
      if (chatQuota) {
        this.renderQuotaItem(this.usageSection, localize("plan.chatMessages", "Chat messages"), chatQuota);
      }
      if (premiumChatQuota) {
        const premiumLabel = premiumChatQuota.overageEnabled ? localize("plan.includedPremiumRequests", "Included premium requests") : localize("plan.premiumRequests", "Premium requests");
        this.renderQuotaItem(this.usageSection, premiumLabel, premiumChatQuota, premiumChatQuota.overageEnabled);
        if (premiumChatQuota.overageEnabled && !premiumChatQuota.unlimited) {
          const overageMessage = DOM.append(this.usageSection, $(".overage-message"));
          overageMessage.append(localize("plan.overageApprovedLine1", "Additional premium requests approved."));
          DOM.append(overageMessage, $("br"));
          overageMessage.append(localize("plan.overageApprovedLine2", "You can continue after included premium requests limit reaches 100%."));
        }
      }
      if (resetDate) {
        const resetText = DOM.append(this.usageSection, $(".allowance-resets"));
        resetText.textContent = localize("plan.allowanceResets", "Allowance resets {0}.", resetDateHasTime ? this.dateTimeFormatter.value.format(new Date(resetDate)) : this.dateFormatter.value.format(new Date(resetDate)));
      }
    }
    const height = this.element.offsetHeight || 400;
    this._onDidChangeContentHeight.fire(height);
  }
  renderQuotaItem(container, label, quota, overageEnabled = false) {
    const quotaItem = DOM.append(container, $(".quota-item"));
    const quotaItemHeader = DOM.append(quotaItem, $(".quota-item-header"));
    const quotaItemLabel = DOM.append(quotaItemHeader, $(".quota-item-label"));
    quotaItemLabel.textContent = label;
    const quotaItemValue = DOM.append(quotaItemHeader, $(".quota-item-value"));
    if (quota.unlimited) {
      quotaItemValue.textContent = localize("plan.included", "Included");
    } else {
      quotaItemValue.textContent = localize("plan.included", "Included");
    }
    const progressBarContainer = DOM.append(quotaItem, $(".quota-bar"));
    const progressBar = DOM.append(progressBarContainer, $(".quota-bit"));
    const percentageUsed = this.getQuotaPercentageUsed(quota);
    progressBar.style.width = percentageUsed + "%";
    if (percentageUsed >= 90 && !overageEnabled) {
      quotaItem.classList.add("error");
    } else if (percentageUsed >= 75 && !overageEnabled) {
      quotaItem.classList.add("warning");
    }
  }
  getQuotaPercentageUsed(quota) {
    if (quota.unlimited) {
      return 0;
    }
    return Math.max(0, 100 - quota.percentRemaining);
  }
  renderLimitedQuotaItem(container, label) {
    const quotaItem = DOM.append(container, $(".quota-item"));
    const quotaItemHeader = DOM.append(quotaItem, $(".quota-item-header"));
    const quotaItemLabel = DOM.append(quotaItemHeader, $(".quota-item-label"));
    quotaItemLabel.textContent = label;
    const quotaItemValue = DOM.append(quotaItemHeader, $(".quota-item-value"));
    quotaItemValue.textContent = localize("quotaLimited", "Limited");
    const progressBarContainer = DOM.append(quotaItem, $(".quota-bar"));
    DOM.append(progressBarContainer, $(".quota-bit"));
  }
};
ChatUsageWidget = __decorate([
  __param(0, IChatEntitlementService)
], ChatUsageWidget);
export {
  ChatUsageWidget
};
//# sourceMappingURL=chatUsageWidget.js.map
