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
import { $, append, EventType, addDisposableListener, EventHelper, disposableWindowInterval, getWindow } from "../../../../../base/browser/dom.js";
import { Gesture, EventType as TouchEventType } from "../../../../../base/browser/touch.js";
import { ActionBar } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Checkbox } from "../../../../../base/browser/ui/toggle/toggle.js";
import { toAction } from "../../../../../base/common/actions.js";
import { cancelOnDispose } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { safeIntl } from "../../../../../base/common/date.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { MutableDisposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { parseLinkedText } from "../../../../../base/common/linkedText.js";
import { language } from "../../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isObject } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { IInlineCompletionsService } from "../../../../../editor/browser/services/inlineCompletionsService.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IHoverService, nativeHoverDelegate } from "../../../../../platform/hover/browser/hover.js";
import { IMarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { Link } from "../../../../../platform/opener/browser/link.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { defaultButtonStyles, defaultCheckboxStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { DomWidget } from "../../../../../platform/domWidget/browser/domWidget.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { IChatEntitlementService, ChatEntitlement, getChatPlanName } from "../../../../services/chat/common/chatEntitlementService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { isNewUser } from "./chatStatus.js";
import { IChatStatusItemService } from "./chatStatusItemService.js";
import product from "../../../../../platform/product/common/product.js";
import { contrastBorder, inputValidationErrorBorder, inputValidationInfoBorder, inputValidationWarningBorder, registerColor, transparent } from "../../../../../platform/theme/common/colorRegistry.js";
import { Color } from "../../../../../base/common/color.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ChatViewId } from "../chat.js";
import { isCompletionsEnabled } from "../../../../../editor/common/services/completionsEnablement.js";
const defaultChat = product.defaultChatAgent;
const gaugeForeground = registerColor("gauge.foreground", {
  dark: inputValidationInfoBorder,
  light: inputValidationInfoBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeForeground", "Gauge foreground color."));
registerColor("gauge.background", {
  dark: transparent(gaugeForeground, 0.3),
  light: transparent(gaugeForeground, 0.3),
  hcDark: Color.white,
  hcLight: Color.white
}, localize("gaugeBackground", "Gauge background color."));
registerColor("gauge.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeBorder", "Gauge border color."));
const gaugeWarningForeground = registerColor("gauge.warningForeground", {
  dark: inputValidationWarningBorder,
  light: inputValidationWarningBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeWarningForeground", "Gauge warning foreground color."));
registerColor("gauge.warningBackground", {
  dark: transparent(gaugeWarningForeground, 0.3),
  light: transparent(gaugeWarningForeground, 0.3),
  hcDark: Color.white,
  hcLight: Color.white
}, localize("gaugeWarningBackground", "Gauge warning background color."));
const gaugeErrorForeground = registerColor("gauge.errorForeground", {
  dark: inputValidationErrorBorder,
  light: inputValidationErrorBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeErrorForeground", "Gauge error foreground color."));
registerColor("gauge.errorBackground", {
  dark: transparent(gaugeErrorForeground, 0.3),
  light: transparent(gaugeErrorForeground, 0.3),
  hcDark: Color.white,
  hcLight: Color.white
}, localize("gaugeErrorBackground", "Gauge error background color."));
let ChatStatusDashboard = class ChatStatusDashboard2 extends DomWidget {
  static {
    __name(this, "ChatStatusDashboard");
  }
  constructor(chatEntitlementService, chatStatusItemService, commandService, configurationService, editorService, hoverService, languageService, openerService, telemetryService, textResourceConfigurationService, inlineCompletionsService, chatSessionsService, markdownRendererService, languageFeaturesService, quickInputService, viewService) {
    super();
    this.chatEntitlementService = chatEntitlementService;
    this.chatStatusItemService = chatStatusItemService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.hoverService = hoverService;
    this.languageService = languageService;
    this.openerService = openerService;
    this.telemetryService = telemetryService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.inlineCompletionsService = inlineCompletionsService;
    this.chatSessionsService = chatSessionsService;
    this.markdownRendererService = markdownRendererService;
    this.languageFeaturesService = languageFeaturesService;
    this.quickInputService = quickInputService;
    this.viewService = viewService;
    this.element = $("div.chat-status-bar-entry-tooltip");
    this.dateFormatter = safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" });
    this.dateTimeFormatter = safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" });
    this.quotaPercentageFormatter = safeIntl.NumberFormat(void 0, { maximumFractionDigits: 1, minimumFractionDigits: 0 });
    this.quotaOverageFormatter = safeIntl.NumberFormat(void 0, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    this.render();
  }
  render() {
    const token = cancelOnDispose(this._store);
    let needsSeparator = false;
    const addSeparator = /* @__PURE__ */ __name((label, action) => {
      if (needsSeparator) {
        this.element.appendChild($("hr"));
      }
      if (label || action) {
        this.renderHeader(this.element, this._store, label ?? "", action);
      }
      needsSeparator = true;
    }, "addSeparator");
    const { chat: chatQuota, completions: completionsQuota, premiumChat: premiumChatQuota, resetDate, resetDateHasTime } = this.chatEntitlementService.quotas;
    if (chatQuota || completionsQuota || premiumChatQuota) {
      const usageTitle = this.getUsageTitle();
      addSeparator(usageTitle, toAction({
        id: "workbench.action.manageCopilot",
        label: localize("quotaLabel", "Manage Chat"),
        tooltip: localize("quotaTooltip", "Manage Chat"),
        class: ThemeIcon.asClassName(Codicon.settings),
        run: /* @__PURE__ */ __name(() => this.runCommandAndClose(() => this.openerService.open(URI.parse(defaultChat.manageSettingsUrl))), "run")
      }));
      const completionsQuotaIndicator = completionsQuota && (completionsQuota.total > 0 || completionsQuota.unlimited) ? this.createQuotaIndicator(this.element, this._store, completionsQuota, localize("completionsLabel", "Inline Suggestions"), false) : void 0;
      const chatQuotaIndicator = chatQuota && (chatQuota.total > 0 || chatQuota.unlimited) ? this.createQuotaIndicator(this.element, this._store, chatQuota, localize("chatsLabel", "Chat messages"), false) : void 0;
      const premiumChatLabel = premiumChatQuota?.overageEnabled && !premiumChatQuota?.unlimited ? localize("includedPremiumChatsLabel", "Included premium requests") : localize("premiumChatsLabel", "Premium requests");
      const premiumChatQuotaIndicator = premiumChatQuota && (premiumChatQuota.total > 0 || premiumChatQuota.unlimited) ? this.createQuotaIndicator(this.element, this._store, premiumChatQuota, premiumChatLabel, true) : void 0;
      if (resetDate) {
        this.element.appendChild($("div.description", void 0, localize("limitQuota", "Allowance resets {0}.", resetDateHasTime ? this.dateTimeFormatter.value.format(new Date(resetDate)) : this.dateFormatter.value.format(new Date(resetDate)))));
      }
      if (this.chatEntitlementService.entitlement === ChatEntitlement.Free && (Number(chatQuota?.percentRemaining) <= 25 || Number(completionsQuota?.percentRemaining) <= 25)) {
        const upgradeProButton = this._store.add(new Button(this.element, {
          ...defaultButtonStyles,
          hoverDelegate: nativeHoverDelegate,
          secondary: this.canUseChat()
          /* use secondary color when chat can still be used */
        }));
        upgradeProButton.label = localize("upgradeToCopilotPro", "Upgrade to GitHub Copilot Pro");
        this._store.add(upgradeProButton.onDidClick(() => this.runCommandAndClose("workbench.action.chat.upgradePlan")));
      }
      (async () => {
        await this.chatEntitlementService.update(token);
        if (token.isCancellationRequested) {
          return;
        }
        const { chat: chatQuota2, completions: completionsQuota2, premiumChat: premiumChatQuota2 } = this.chatEntitlementService.quotas;
        if (completionsQuota2) {
          completionsQuotaIndicator?.(completionsQuota2);
        }
        if (chatQuota2) {
          chatQuotaIndicator?.(chatQuota2);
        }
        if (premiumChatQuota2) {
          premiumChatQuotaIndicator?.(premiumChatQuota2);
        }
      })();
    } else if (this.chatEntitlementService.anonymous && this.chatEntitlementService.sentiment.installed) {
      addSeparator(localize("anonymousTitle", "Copilot Usage"));
      this.createQuotaIndicator(this.element, this._store, localize("quotaLimited", "Limited"), localize("completionsLabel", "Inline Suggestions"), false);
      this.createQuotaIndicator(this.element, this._store, localize("quotaLimited", "Limited"), localize("chatsLabel", "Chat messages"), false);
    }
    {
      const inProgress = this.chatSessionsService.getInProgress();
      if (inProgress.some((item) => item.count > 0)) {
        addSeparator(localize("chatAgentSessionsTitle", "Agent Sessions"), toAction({
          id: "workbench.view.chat.status.sessions",
          label: localize("viewChatSessionsLabel", "View Agent Sessions"),
          tooltip: localize("viewChatSessionsTooltip", "View Agent Sessions"),
          class: ThemeIcon.asClassName(Codicon.eye),
          run: /* @__PURE__ */ __name(() => {
            this.viewService.openView(ChatViewId, true);
            this.hoverService.hideHover(true);
          }, "run")
        }));
        for (const { displayName, count } of inProgress) {
          if (count > 0) {
            const text = localize("inProgressChatSession", "$(loading~spin) {0} in progress", displayName);
            const chatSessionsElement = this.element.appendChild($("div.description"));
            const parts = renderLabelWithIcons(text);
            chatSessionsElement.append(...parts);
          }
        }
      }
    }
    {
      for (const item of this.chatStatusItemService.getEntries()) {
        addSeparator();
        const itemDisposables = this._store.add(new MutableDisposable());
        let rendered = this.renderContributedChatStatusItem(item);
        itemDisposables.value = rendered.disposables;
        this.element.appendChild(rendered.element);
        this._store.add(this.chatStatusItemService.onDidChange((e) => {
          if (e.entry.id === item.id) {
            const previousElement = rendered.element;
            rendered = this.renderContributedChatStatusItem(e.entry);
            itemDisposables.value = rendered.disposables;
            previousElement.replaceWith(rendered.element);
          }
        }));
      }
    }
    {
      const chatSentiment = this.chatEntitlementService.sentiment;
      addSeparator(localize("inlineSuggestions", "Inline Suggestions"), chatSentiment.installed && !chatSentiment.disabled && !chatSentiment.untrusted ? toAction({
        id: "workbench.action.openChatSettings",
        label: localize("settingsLabel", "Settings"),
        tooltip: localize("settingsTooltip", "Open Settings"),
        class: ThemeIcon.asClassName(Codicon.settingsGear),
        run: /* @__PURE__ */ __name(() => this.runCommandAndClose(() => this.commandService.executeCommand("workbench.action.openSettings", { query: `@id:${defaultChat.completionsEnablementSetting} @id:${defaultChat.nextEditSuggestionsSetting}` })), "run")
      }) : void 0);
      this.createSettings(this.element, this._store);
    }
    {
      const providers = this.languageFeaturesService.inlineCompletionsProvider.allNoModel();
      const provider = providers.find((p) => p.modelInfo && p.modelInfo.models.length > 0);
      if (provider) {
        const modelInfo = provider.modelInfo;
        const currentModel = modelInfo.models.find((m) => m.id === modelInfo.currentModelId);
        if (currentModel) {
          const modelContainer = this.element.appendChild($("div.model-selection"));
          modelContainer.appendChild($("span.model-text", void 0, localize("modelLabel", "Model")));
          const actionBar = modelContainer.appendChild($("div.model-action-bar"));
          const toolbar = this._store.add(new ActionBar(actionBar, { hoverDelegate: nativeHoverDelegate }));
          toolbar.push([toAction({
            id: "workbench.action.selectInlineCompletionsModel",
            label: currentModel.name,
            tooltip: localize("selectModel", "Select Model"),
            class: ThemeIcon.asClassName(Codicon.gear),
            run: /* @__PURE__ */ __name(async () => {
              await this.showModelPicker(provider);
            }, "run")
          })], { icon: false, label: true });
        }
      }
    }
    {
      const providers = this.languageFeaturesService.inlineCompletionsProvider.allNoModel();
      for (const provider of providers) {
        if (provider.providerOptions && provider.providerOptions.length > 0) {
          for (const option of provider.providerOptions) {
            const currentValue = option.values.find((v) => v.id === option.currentValueId);
            if (currentValue) {
              const optionContainer = this.element.appendChild($("div.suggest-option-selection"));
              optionContainer.appendChild($("span.suggest-option-text", void 0, option.label));
              const actionBar = optionContainer.appendChild($("div.suggest-option-action-bar"));
              const toolbar = this._store.add(new ActionBar(actionBar, { hoverDelegate: nativeHoverDelegate }));
              toolbar.push([toAction({
                id: `workbench.action.selectProviderOption.${option.id}`,
                label: currentValue.label,
                tooltip: localize("selectOption", "Select {0}", option.label),
                run: /* @__PURE__ */ __name(async () => {
                  await this.showProviderOptionPicker(provider, option);
                }, "run")
              })], { icon: false, label: true });
            }
          }
        }
      }
    }
    if (this.canUseChat()) {
      const snooze = append(this.element, $("div.snooze-completions"));
      this.createCompletionsSnooze(snooze, localize("settings.snooze", "Snooze"), this._store);
    }
    {
      const newUser = isNewUser(this.chatEntitlementService);
      const anonymousUser = this.chatEntitlementService.anonymous;
      const disabled = this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted;
      const signedOut = this.chatEntitlementService.entitlement === ChatEntitlement.Unknown;
      if (newUser || signedOut || disabled) {
        addSeparator();
        let descriptionText;
        let descriptionClass = ".description";
        if (newUser && anonymousUser) {
          descriptionText = new MarkdownString(localize({ key: "activeDescriptionAnonymous", comment: ['{Locked="]({2})"}', '{Locked="]({3})"}'] }, "By continuing with {0} Copilot, you agree to {1}'s [Terms]({2}) and [Privacy Statement]({3})", defaultChat.provider.default.name, defaultChat.provider.default.name, defaultChat.termsStatementUrl, defaultChat.privacyStatementUrl), { isTrusted: true });
          descriptionClass = `${descriptionClass}.terms`;
        } else if (newUser) {
          descriptionText = localize("activateDescription", "Set up Copilot to use AI features.");
        } else if (anonymousUser) {
          descriptionText = localize("enableMoreDescription", "Sign in to enable more Copilot AI features.");
        } else if (disabled) {
          descriptionText = localize("enableDescription", "Enable Copilot to use AI features.");
        } else {
          descriptionText = localize("signInDescription", "Sign in to use Copilot AI features.");
        }
        let buttonLabel;
        if (newUser) {
          buttonLabel = localize("enableAIFeatures", "Use AI Features");
        } else if (anonymousUser) {
          buttonLabel = localize("enableMoreAIFeatures", "Enable more AI Features");
        } else if (disabled) {
          buttonLabel = localize("enableCopilotButton", "Enable AI Features");
        } else {
          buttonLabel = localize("signInToUseAIFeatures", "Sign in to use AI Features");
        }
        let commandId;
        if (newUser && anonymousUser) {
          commandId = "workbench.action.chat.triggerSetupAnonymousWithoutDialog";
        } else {
          commandId = "workbench.action.chat.triggerSetup";
        }
        if (typeof descriptionText === "string") {
          this.element.appendChild($(`div${descriptionClass}`, void 0, descriptionText));
        } else {
          this.element.appendChild($(`div${descriptionClass}`, void 0, this._store.add(this.markdownRendererService.render(descriptionText)).element));
        }
        const button = this._store.add(new Button(this.element, { ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate }));
        button.label = buttonLabel;
        this._store.add(button.onDidClick(() => this.runCommandAndClose(commandId)));
      }
    }
  }
  canUseChat() {
    if (!this.chatEntitlementService.sentiment.installed || this.chatEntitlementService.sentiment.disabled || this.chatEntitlementService.sentiment.untrusted) {
      return false;
    }
    if (this.chatEntitlementService.entitlement === ChatEntitlement.Unknown || this.chatEntitlementService.entitlement === ChatEntitlement.Available) {
      return this.chatEntitlementService.anonymous;
    }
    if (this.chatEntitlementService.entitlement === ChatEntitlement.Free && this.chatEntitlementService.quotas.chat?.percentRemaining === 0 && this.chatEntitlementService.quotas.completions?.percentRemaining === 0) {
      return false;
    }
    return true;
  }
  getUsageTitle() {
    const planName = getChatPlanName(this.chatEntitlementService.entitlement);
    return localize("usageTitleWithPlan", "{0} Usage", planName);
  }
  renderHeader(container, disposables, label, action) {
    const header = container.appendChild($("div.header", void 0, label ?? ""));
    if (action) {
      const toolbar = disposables.add(new ActionBar(header, { hoverDelegate: nativeHoverDelegate }));
      toolbar.push([action], { icon: true, label: false });
    }
  }
  renderContributedChatStatusItem(item) {
    const disposables = new DisposableStore();
    const itemElement = $("div.contribution");
    const headerLabel = typeof item.label === "string" ? item.label : item.label.label;
    const headerLink = typeof item.label === "string" ? void 0 : item.label.link;
    this.renderHeader(itemElement, disposables, headerLabel, headerLink ? toAction({
      id: "workbench.action.openChatStatusItemLink",
      label: localize("learnMore", "Learn More"),
      tooltip: localize("learnMore", "Learn More"),
      class: ThemeIcon.asClassName(Codicon.linkExternal),
      run: /* @__PURE__ */ __name(() => this.runCommandAndClose(() => this.openerService.open(URI.parse(headerLink))), "run")
    }) : void 0);
    const itemBody = itemElement.appendChild($("div.body"));
    const description = itemBody.appendChild($("span.description"));
    this.renderTextPlus(description, item.description, disposables);
    if (item.detail) {
      const detail = itemBody.appendChild($("div.detail-item"));
      this.renderTextPlus(detail, item.detail, disposables);
    }
    return { element: itemElement, disposables };
  }
  renderTextPlus(target, text, store) {
    for (const node of parseLinkedText(text).nodes) {
      if (typeof node === "string") {
        const parts = renderLabelWithIcons(node);
        target.append(...parts);
      } else {
        store.add(new Link(target, node, void 0, this.hoverService, this.openerService));
      }
    }
  }
  runCommandAndClose(commandOrFn, ...args) {
    if (typeof commandOrFn === "function") {
      commandOrFn(...args);
    } else {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: commandOrFn, from: "chat-status" });
      this.commandService.executeCommand(commandOrFn, ...args);
    }
    this.hoverService.hideHover(true);
  }
  createQuotaIndicator(container, disposables, quota, label, supportsOverage) {
    const quotaValue = $("span.quota-value");
    const quotaBit = $("div.quota-bit");
    const overageLabel = $("span.overage-label");
    const quotaIndicator = container.appendChild($("div.quota-indicator", void 0, $("div.quota-label", void 0, $("span", void 0, label), quotaValue), $("div.quota-bar", void 0, quotaBit), $("div.description", void 0, overageLabel)));
    if (supportsOverage && (this.chatEntitlementService.entitlement === ChatEntitlement.Pro || this.chatEntitlementService.entitlement === ChatEntitlement.ProPlus)) {
      const manageOverageButton = disposables.add(new Button(quotaIndicator, { ...defaultButtonStyles, secondary: true, hoverDelegate: nativeHoverDelegate }));
      manageOverageButton.label = localize("enableAdditionalUsage", "Manage paid premium requests");
      disposables.add(manageOverageButton.onDidClick(() => this.runCommandAndClose(() => this.openerService.open(URI.parse(defaultChat.manageOverageUrl)))));
    }
    const update = /* @__PURE__ */ __name((quota2) => {
      quotaIndicator.classList.remove("error");
      quotaIndicator.classList.remove("warning");
      let usedPercentage;
      if (typeof quota2 === "string" || quota2.unlimited) {
        usedPercentage = 0;
      } else {
        usedPercentage = Math.max(0, 100 - quota2.percentRemaining);
      }
      if (typeof quota2 === "string") {
        quotaValue.textContent = quota2;
      } else if (quota2.unlimited) {
        quotaValue.textContent = localize("quotaUnlimited", "Included");
      } else if (quota2.overageCount) {
        quotaValue.textContent = localize("quotaDisplayWithOverage", "+{0} requests", this.quotaOverageFormatter.value.format(quota2.overageCount));
      } else {
        quotaValue.textContent = localize("quotaDisplay", "{0}%", this.quotaPercentageFormatter.value.format(usedPercentage));
      }
      quotaBit.style.width = `${usedPercentage}%`;
      const overageEnabled = supportsOverage && typeof quota2 !== "string" && quota2?.overageEnabled;
      if (usedPercentage >= 90 && !overageEnabled) {
        quotaIndicator.classList.add("error");
      } else if (usedPercentage >= 75 && !overageEnabled) {
        quotaIndicator.classList.add("warning");
      }
      if (supportsOverage) {
        if (typeof quota2 !== "string" && quota2.unlimited) {
          overageLabel.textContent = "";
        } else if (typeof quota2 !== "string" && quota2?.overageEnabled) {
          overageLabel.replaceChildren(localize("additionalUsageApprovedLine1", "Additional premium requests approved."), $("br"), localize("additionalUsageApprovedLine2", "You can continue after the included premium requests limit reaches 100%."));
        } else {
          overageLabel.textContent = localize("additionalUsageDisabled", "Additional paid premium requests disabled.");
        }
      } else {
        overageLabel.textContent = "";
      }
    }, "update");
    update(quota);
    return update;
  }
  createSettings(container, disposables) {
    const modeId = this.editorService.activeTextEditorLanguageId;
    const settings = container.appendChild($("div.settings"));
    {
      const globalSetting = append(settings, $("div.setting"));
      this.createInlineSuggestionsSetting(globalSetting, localize("settings.codeCompletions.allFiles", "All files"), "*", disposables);
      if (modeId) {
        const languageSetting = append(settings, $("div.setting"));
        this.createInlineSuggestionsSetting(languageSetting, localize("settings.codeCompletions.language", "{0}", this.languageService.getLanguageName(modeId) ?? modeId), modeId, disposables);
      }
    }
    {
      const setting = append(settings, $("div.setting"));
      this.createNextEditSuggestionsSetting(setting, localize("settings.nextEditSuggestions", "Next edit suggestions"), this.getCompletionsSettingAccessor(modeId), disposables);
    }
    return settings;
  }
  createSetting(container, settingIdsToReEvaluate, label, accessor, disposables) {
    const checkbox = disposables.add(new Checkbox(label, Boolean(accessor.readSetting()), { ...defaultCheckboxStyles }));
    container.appendChild(checkbox.domNode);
    const settingLabel = append(container, $("span.setting-label", void 0, label));
    disposables.add(Gesture.addTarget(settingLabel));
    [EventType.CLICK, TouchEventType.Tap].forEach((eventType) => {
      disposables.add(addDisposableListener(settingLabel, eventType, (e) => {
        if (checkbox?.enabled) {
          EventHelper.stop(e, true);
          checkbox.checked = !checkbox.checked;
          accessor.writeSetting(checkbox.checked);
          checkbox.focus();
        }
      }));
    });
    disposables.add(checkbox.onChange(() => {
      accessor.writeSetting(checkbox.checked);
    }));
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (settingIdsToReEvaluate.some((id) => e.affectsConfiguration(id))) {
        checkbox.checked = Boolean(accessor.readSetting());
      }
    }));
    if (!this.canUseChat()) {
      container.classList.add("disabled");
      checkbox.disable();
      checkbox.checked = false;
    }
    return checkbox;
  }
  createInlineSuggestionsSetting(container, label, modeId, disposables) {
    this.createSetting(container, [defaultChat.completionsEnablementSetting], label, this.getCompletionsSettingAccessor(modeId), disposables);
  }
  getCompletionsSettingAccessor(modeId = "*") {
    const settingId = defaultChat.completionsEnablementSetting;
    return {
      readSetting: /* @__PURE__ */ __name(() => isCompletionsEnabled(this.configurationService, modeId), "readSetting"),
      writeSetting: /* @__PURE__ */ __name((value) => {
        this.telemetryService.publicLog2("chatStatus.settingChanged", {
          settingIdentifier: settingId,
          settingMode: modeId,
          settingEnablement: value ? "enabled" : "disabled"
        });
        let result = this.configurationService.getValue(settingId);
        if (!isObject(result)) {
          result = /* @__PURE__ */ Object.create(null);
        }
        return this.configurationService.updateValue(settingId, { ...result, [modeId]: value });
      }, "writeSetting")
    };
  }
  createNextEditSuggestionsSetting(container, label, completionsSettingAccessor, disposables) {
    const nesSettingId = defaultChat.nextEditSuggestionsSetting;
    const completionsSettingId = defaultChat.completionsEnablementSetting;
    const resource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
    const checkbox = this.createSetting(container, [nesSettingId, completionsSettingId], label, {
      readSetting: /* @__PURE__ */ __name(() => completionsSettingAccessor.readSetting() && this.textResourceConfigurationService.getValue(resource, nesSettingId), "readSetting"),
      writeSetting: /* @__PURE__ */ __name((value) => {
        this.telemetryService.publicLog2("chatStatus.settingChanged", {
          settingIdentifier: nesSettingId,
          settingEnablement: value ? "enabled" : "disabled"
        });
        return this.textResourceConfigurationService.updateValue(resource, nesSettingId, value);
      }, "writeSetting")
    }, disposables);
    if (!completionsSettingAccessor.readSetting()) {
      container.classList.add("disabled");
      checkbox.disable();
    }
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(completionsSettingId)) {
        if (completionsSettingAccessor.readSetting() && this.canUseChat()) {
          checkbox.enable();
          container.classList.remove("disabled");
        } else {
          checkbox.disable();
          container.classList.add("disabled");
        }
      }
    }));
  }
  createCompletionsSnooze(container, label, disposables) {
    const isEnabled = /* @__PURE__ */ __name(() => {
      const completionsEnabled = isCompletionsEnabled(this.configurationService);
      const completionsEnabledActiveLanguage = isCompletionsEnabled(this.configurationService, this.editorService.activeTextEditorLanguageId);
      return completionsEnabled || completionsEnabledActiveLanguage;
    }, "isEnabled");
    const button = disposables.add(new Button(container, { disabled: !isEnabled(), ...defaultButtonStyles, hoverDelegate: nativeHoverDelegate, secondary: true }));
    const timerDisplay = container.appendChild($("span.snooze-label"));
    const actionBar = container.appendChild($("div.snooze-action-bar"));
    const toolbar = disposables.add(new ActionBar(actionBar, { hoverDelegate: nativeHoverDelegate }));
    const cancelAction = toAction({
      id: "workbench.action.cancelSnoozeStatusBarLink",
      label: localize("cancelSnooze", "Cancel Snooze"),
      run: /* @__PURE__ */ __name(() => this.inlineCompletionsService.cancelSnooze(), "run"),
      class: ThemeIcon.asClassName(Codicon.stopCircle)
    });
    const update = /* @__PURE__ */ __name((isEnabled2) => {
      container.classList.toggle("disabled", !isEnabled2);
      toolbar.clear();
      const timeLeftMs = this.inlineCompletionsService.snoozeTimeLeft;
      if (!isEnabled2 || timeLeftMs <= 0) {
        timerDisplay.textContent = localize("completions.snooze5minutesTitle", "Hide suggestions for 5 min");
        timerDisplay.title = "";
        button.label = label;
        button.setTitle(localize("completions.snooze5minutes", "Hide inline suggestions for 5 min"));
        return true;
      }
      const timeLeftSeconds = Math.ceil(timeLeftMs / 1e3);
      const minutes = Math.floor(timeLeftSeconds / 60);
      const seconds = timeLeftSeconds % 60;
      timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds} ${localize("completions.remainingTime", "remaining")}`;
      timerDisplay.title = localize("completions.snoozeTimeDescription", "Inline suggestions are hidden for the remaining duration");
      button.label = localize("completions.plus5min", "+5 min");
      button.setTitle(localize("completions.snoozeAdditional5minutes", "Snooze additional 5 min"));
      toolbar.push([cancelAction], { icon: true, label: false });
      return false;
    }, "update");
    const timerDisposables = disposables.add(new DisposableStore());
    function updateIntervalTimer() {
      timerDisposables.clear();
      const enabled = isEnabled();
      if (update(enabled)) {
        return;
      }
      timerDisposables.add(disposableWindowInterval(getWindow(container), () => update(enabled), 1e3));
    }
    __name(updateIntervalTimer, "updateIntervalTimer");
    updateIntervalTimer();
    disposables.add(button.onDidClick(() => {
      this.inlineCompletionsService.snooze();
      update(isEnabled());
    }));
    disposables.add(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(defaultChat.completionsEnablementSetting)) {
        button.enabled = isEnabled();
      }
      updateIntervalTimer();
    }));
    disposables.add(this.inlineCompletionsService.onDidChangeIsSnoozing((e) => {
      updateIntervalTimer();
    }));
  }
  async showModelPicker(provider) {
    if (!provider.modelInfo || !provider.setModelId) {
      return;
    }
    const modelInfo = provider.modelInfo;
    const items = modelInfo.models.map((model) => ({
      id: model.id,
      label: model.name,
      description: model.id === modelInfo.currentModelId ? localize("currentModel.description", "Currently selected") : void 0,
      picked: model.id === modelInfo.currentModelId
    }));
    const selected = await this.quickInputService.pick(items, {
      placeHolder: localize("selectModelFor", "Select a model for {0}", provider.displayName || "inline completions"),
      canPickMany: false
    });
    if (selected && selected.id && selected.id !== modelInfo.currentModelId) {
      await provider.setModelId(selected.id);
    }
    this.hoverService.hideHover(true);
  }
  async showProviderOptionPicker(provider, option) {
    if (!provider.setProviderOption) {
      return;
    }
    const items = option.values.map((value) => ({
      id: value.id,
      label: value.label,
      description: value.id === option.currentValueId ? localize("currentOption.description", "Currently selected") : void 0,
      picked: value.id === option.currentValueId
    }));
    const selected = await this.quickInputService.pick(items, {
      placeHolder: localize("selectProviderOptionFor", "Select {0}", option.label),
      canPickMany: false
    });
    if (selected && selected.id && selected.id !== option.currentValueId) {
      await provider.setProviderOption(option.id, selected.id);
    }
    this.hoverService.hideHover(true);
  }
};
ChatStatusDashboard = __decorate([
  __param(0, IChatEntitlementService),
  __param(1, IChatStatusItemService),
  __param(2, ICommandService),
  __param(3, IConfigurationService),
  __param(4, IEditorService),
  __param(5, IHoverService),
  __param(6, ILanguageService),
  __param(7, IOpenerService),
  __param(8, ITelemetryService),
  __param(9, ITextResourceConfigurationService),
  __param(10, IInlineCompletionsService),
  __param(11, IChatSessionsService),
  __param(12, IMarkdownRendererService),
  __param(13, ILanguageFeaturesService),
  __param(14, IQuickInputService),
  __param(15, IViewsService)
], ChatStatusDashboard);
export {
  ChatStatusDashboard
};
//# sourceMappingURL=chatStatusDashboard.js.map
