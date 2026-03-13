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
import "./media/chatContextUsageDetails.css";
import * as dom from "../../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { IMenuService, MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { MenuWorkbenchButtonBar } from "../../../../../../platform/actions/browser/buttonbar.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
const $ = dom.$;
let ChatContextUsageDetails = class ChatContextUsageDetails2 extends Disposable {
  static {
    __name(this, "ChatContextUsageDetails");
  }
  constructor(instantiationService, menuService, contextKeyService) {
    super();
    this.instantiationService = instantiationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.domNode = $(".chat-context-usage-details");
    this.quotaItem = this.domNode.appendChild($(".quota-indicator"));
    const header = this.domNode.insertBefore($("div.header"), this.quotaItem);
    header.textContent = localize("contextWindow", "Context Window");
    const quotaLabel = this.quotaItem.appendChild($(".quota-label"));
    this.tokenCountLabel = quotaLabel.appendChild($("span"));
    this.percentageLabel = quotaLabel.appendChild($("span.quota-value"));
    const progressBar = this.quotaItem.appendChild($(".quota-bar"));
    this.progressFill = progressBar.appendChild($(".quota-bit"));
    this.outputBufferFill = progressBar.appendChild($(".quota-bit.output-buffer"));
    this.outputBufferLegend = this.quotaItem.appendChild($(".output-buffer-legend"));
    this.outputBufferLegend.appendChild($(".output-buffer-swatch"));
    const legendLabel = this.outputBufferLegend.appendChild($("span"));
    legendLabel.textContent = localize("outputReserved", "Reserved for response");
    this.outputBufferLegend.style.display = "none";
    this.tokenDetailsContainer = this.domNode.appendChild($(".token-details-container"));
    this.warningMessage = this.domNode.appendChild($("div.description"));
    this.warningMessage.textContent = localize("qualityWarning", "Quality may decline as limit nears.");
    this.warningMessage.style.display = "none";
    this.actionsSection = this.domNode.appendChild($(".actions-section"));
    const buttonBarContainer = this.actionsSection.appendChild($(".button-bar-container"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchButtonBar, buttonBarContainer, MenuId.ChatContextUsageActions, {
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup")
      },
      buttonConfigProvider: /* @__PURE__ */ __name(() => ({ isSecondary: true }), "buttonConfigProvider")
    }));
    const menu = this._register(this.menuService.createMenu(MenuId.ChatContextUsageActions, this.contextKeyService));
    const updateActionsVisibility = /* @__PURE__ */ __name(() => {
      const actions = menu.getActions();
      const hasActions = actions.length > 0 && actions.some(([, items]) => items.length > 0);
      this.actionsSection.style.display = hasActions ? "" : "none";
    }, "updateActionsVisibility");
    this._register(menu.onDidChange(updateActionsVisibility));
    updateActionsVisibility();
  }
  update(data) {
    const { percentage, usedTokens, totalContextWindow, outputBufferPercentage, promptTokenDetails } = data;
    this.tokenCountLabel.textContent = localize("tokenCount", "{0} / {1} tokens", this.formatTokenCount(usedTokens, 1), this.formatTokenCount(totalContextWindow, 0));
    this.percentageLabel.textContent = localize("quotaDisplay", "{0}%", Math.min(100, percentage).toFixed(0));
    const usageBarWidth = Math.max(0, Math.min(100, percentage));
    this.progressFill.style.width = `${usageBarWidth}%`;
    if (outputBufferPercentage !== void 0 && outputBufferPercentage > 0) {
      this.outputBufferFill.style.width = `${Math.max(0, Math.min(100 - usageBarWidth, outputBufferPercentage))}%`;
      this.outputBufferFill.style.display = "";
      this.outputBufferLegend.style.display = "";
    } else {
      this.outputBufferFill.style.width = "0";
      this.outputBufferFill.style.display = "none";
      this.outputBufferLegend.style.display = "none";
    }
    this.quotaItem.classList.remove("warning", "error");
    if (percentage >= 90) {
      this.quotaItem.classList.add("error");
    } else if (percentage >= 75) {
      this.quotaItem.classList.add("warning");
    }
    this.renderTokenDetails(promptTokenDetails, percentage);
    this.warningMessage.style.display = percentage >= 75 ? "" : "none";
  }
  formatTokenCount(count, decimals) {
    const mThreshold = 1e6 - 500 * Math.pow(10, -decimals);
    if (count >= mThreshold) {
      return `${(count / 1e6).toFixed(decimals)}M`;
    } else if (count >= 1e3) {
      return `${(count / 1e3).toFixed(decimals)}K`;
    }
    return count.toString();
  }
  renderTokenDetails(details, contextWindowPercentage) {
    dom.clearNode(this.tokenDetailsContainer);
    if (!details || details.length === 0) {
      this.tokenDetailsContainer.style.display = "none";
      return;
    }
    this.tokenDetailsContainer.style.display = "";
    const categoryMap = /* @__PURE__ */ new Map();
    let totalPercentage = 0;
    for (const detail of details) {
      const existing = categoryMap.get(detail.category) || [];
      existing.push({ label: detail.label, percentageOfPrompt: detail.percentageOfPrompt });
      categoryMap.set(detail.category, existing);
      totalPercentage += detail.percentageOfPrompt;
    }
    if (totalPercentage < 100) {
      const uncategorizedPercentage = 100 - totalPercentage;
      categoryMap.set(localize("uncategorized", "Uncategorized"), [
        { label: localize("other", "Other"), percentageOfPrompt: uncategorizedPercentage }
      ]);
    }
    for (const [category, items] of categoryMap) {
      const visibleItems = items.filter((item) => {
        const contextRelativePercentage = item.percentageOfPrompt / 100 * contextWindowPercentage;
        return contextRelativePercentage >= 0.05;
      });
      if (visibleItems.length === 0) {
        continue;
      }
      const categorySection = this.tokenDetailsContainer.appendChild($(".token-category"));
      const categoryHeader = categorySection.appendChild($(".token-category-header"));
      categoryHeader.textContent = category;
      for (const item of visibleItems) {
        const itemRow = categorySection.appendChild($(".token-detail-item"));
        const itemLabel = itemRow.appendChild($(".token-detail-label"));
        itemLabel.textContent = item.label;
        const contextRelativePercentage = item.percentageOfPrompt / 100 * contextWindowPercentage;
        const itemValue = itemRow.appendChild($(".token-detail-value"));
        itemValue.textContent = `${contextRelativePercentage.toFixed(1)}%`;
      }
    }
  }
  focus() {
    this.domNode.focus();
  }
};
ChatContextUsageDetails = __decorate([
  __param(0, IInstantiationService),
  __param(1, IMenuService),
  __param(2, IContextKeyService)
], ChatContextUsageDetails);
export {
  ChatContextUsageDetails
};
//# sourceMappingURL=chatContextUsageDetails.js.map
