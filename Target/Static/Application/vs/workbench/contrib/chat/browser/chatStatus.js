var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/chatStatus.css";
import { safeIntl } from "../../../../base/common/date.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { language } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { IStatusbarService, ShowTooltipCommand } from "../../../services/statusbar/browser/statusbar.js";
import { $, addDisposableListener, append, clearNode, EventHelper, EventType } from "../../../../base/browser/dom.js";
import { ChatEntitlement, IChatEntitlementService, isProUser } from "../common/chatEntitlementService.js";
import { defaultButtonStyles, defaultCheckboxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { Checkbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { contrastBorder, inputValidationErrorBorder, inputValidationInfoBorder, inputValidationWarningBorder, registerColor, transparent } from "../../../../platform/theme/common/colorRegistry.js";
import { IHoverService, nativeHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { Color } from "../../../../base/common/color.js";
import { Gesture, EventType as TouchEventType } from "../../../../base/browser/touch.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import product from "../../../../platform/product/common/product.js";
import { isObject } from "../../../../base/common/types.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { toAction } from "../../../../base/common/actions.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IChatStatusItemService } from "./chatStatusItemService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { getCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { URI } from "../../../../base/common/uri.js";
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
const gaugeBackground = registerColor("gauge.background", {
  dark: inputValidationInfoBorder,
  light: inputValidationInfoBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeBackground", "Gauge background color."));
registerColor("gauge.foreground", {
  dark: transparent(gaugeBackground, 0.3),
  light: transparent(gaugeBackground, 0.3),
  hcDark: Color.white,
  hcLight: Color.white
}, localize("gaugeForeground", "Gauge foreground color."));
registerColor("gauge.border", {
  dark: null,
  light: null,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeBorder", "Gauge border color."));
const gaugeWarningBackground = registerColor("gauge.warningBackground", {
  dark: inputValidationWarningBorder,
  light: inputValidationWarningBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeWarningBackground", "Gauge warning background color."));
registerColor("gauge.warningForeground", {
  dark: transparent(gaugeWarningBackground, 0.3),
  light: transparent(gaugeWarningBackground, 0.3),
  hcDark: Color.white,
  hcLight: Color.white
}, localize("gaugeWarningForeground", "Gauge warning foreground color."));
const gaugeErrorBackground = registerColor("gauge.errorBackground", {
  dark: inputValidationErrorBorder,
  light: inputValidationErrorBorder,
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize("gaugeErrorBackground", "Gauge error background color."));
registerColor("gauge.errorForeground", {
  dark: transparent(gaugeErrorBackground, 0.3),
  light: transparent(gaugeErrorBackground, 0.3),
  hcDark: Color.white,
  hcLight: Color.white
}, localize("gaugeErrorForeground", "Gauge error foreground color."));
const defaultChat = {
  extensionId: product.defaultChatAgent?.extensionId ?? "",
  completionsEnablementSetting: product.defaultChatAgent?.completionsEnablementSetting ?? "",
  nextEditSuggestionsSetting: product.defaultChatAgent?.nextEditSuggestionsSetting ?? "",
  manageSettingsUrl: product.defaultChatAgent?.manageSettingsUrl ?? "",
  manageOverageUrl: product.defaultChatAgent?.manageOverageUrl ?? ""
};
let ChatStatusBarEntry = class ChatStatusBarEntry2 extends Disposable {
  static {
    __name(this, "ChatStatusBarEntry");
  }
  static {
    this.ID = "workbench.contrib.chatStatusBarEntry";
  }
  constructor(chatEntitlementService, instantiationService, statusbarService, editorService, configurationService) {
    super();
    this.chatEntitlementService = chatEntitlementService;
    this.instantiationService = instantiationService;
    this.statusbarService = statusbarService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.entry = void 0;
    this.dashboard = new Lazy(() => this.instantiationService.createInstance(ChatStatusDashboard));
    this.activeCodeEditorListener = this._register(new MutableDisposable());
    this.update();
    this.registerListeners();
  }
  update() {
    if (!this.chatEntitlementService.sentiment.hidden) {
      if (!this.entry) {
        this.entry = this.statusbarService.addEntry(this.getEntryProps(), "chat.statusBarEntry", 1, {
          location: { id: "status.editor.mode", priority: 100.1 },
          alignment: 1
          /* StatusbarAlignment.RIGHT */
        });
      } else {
        this.entry.update(this.getEntryProps());
      }
    } else {
      this.entry?.dispose();
      this.entry = void 0;
    }
  }
  registerListeners() {
    this._register(this.chatEntitlementService.onDidChangeQuotaExceeded(() => this.update()));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => this.update()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.update()));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(defaultChat.completionsEnablementSetting)) {
        this.update();
      }
    }));
  }
  onDidActiveEditorChange() {
    this.update();
    this.activeCodeEditorListener.clear();
    const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
    if (activeCodeEditor) {
      this.activeCodeEditorListener.value = activeCodeEditor.onDidChangeModelLanguage(() => {
        this.update();
      });
    }
  }
  getEntryProps() {
    let text = "$(copilot)";
    let ariaLabel = localize("chatStatus", "Copilot Status");
    let kind;
    if (isNewUser(this.chatEntitlementService)) {
      const entitlement = this.chatEntitlementService.entitlement;
      if ((this.chatEntitlementService.sentiment.later || // user skipped setup
      entitlement === ChatEntitlement.Available || // user is entitled
      isProUser(entitlement) || // user is already pro
      entitlement === ChatEntitlement.Free) && this.configurationService.getValue("chat.setup.continueLaterIndicator") === true) {
        const finishSetup = localize("copilotLaterStatus", "Finish Setup");
        text = `$(copilot) ${finishSetup}`;
        ariaLabel = finishSetup;
        kind = this.chatEntitlementService.sentiment.later ? "prominent" : void 0;
      }
    } else {
      const chatQuotaExceeded = this.chatEntitlementService.quotas.chat?.percentRemaining === 0;
      const completionsQuotaExceeded = this.chatEntitlementService.quotas.completions?.percentRemaining === 0;
      if (this.chatEntitlementService.sentiment.disabled) {
        text = `$(copilot-unavailable)`;
        ariaLabel = localize("copilotDisabledStatus", "Copilot Disabled");
      } else if (this.chatEntitlementService.entitlement === ChatEntitlement.Unknown) {
        const signedOutWarning = localize("notSignedIntoCopilot", "Signed out");
        text = `$(copilot-not-connected) ${signedOutWarning}`;
        ariaLabel = signedOutWarning;
        kind = "prominent";
      } else if (this.chatEntitlementService.entitlement === ChatEntitlement.Free && (chatQuotaExceeded || completionsQuotaExceeded)) {
        let quotaWarning;
        if (chatQuotaExceeded && !completionsQuotaExceeded) {
          quotaWarning = localize("chatQuotaExceededStatus", "Chat quota reached");
        } else if (completionsQuotaExceeded && !chatQuotaExceeded) {
          quotaWarning = localize("completionsQuotaExceededStatus", "Completions quota reached");
        } else {
          quotaWarning = localize("chatAndCompletionsQuotaExceededStatus", "Quota reached");
        }
        text = `$(copilot-warning) ${quotaWarning}`;
        ariaLabel = quotaWarning;
        kind = "prominent";
      } else if (this.editorService.activeTextEditorLanguageId && !isCompletionsEnabled(this.configurationService, this.editorService.activeTextEditorLanguageId)) {
        text = `$(copilot-unavailable)`;
        ariaLabel = localize("completionsDisabledStatus", "Code completions disabled");
      }
    }
    return {
      name: localize("chatStatus", "Copilot Status"),
      text,
      ariaLabel,
      command: ShowTooltipCommand,
      showInAllWindows: true,
      kind,
      tooltip: { element: /* @__PURE__ */ __name((token) => this.dashboard.value.show(token), "element") }
    };
  }
  dispose() {
    super.dispose();
    this.entry?.dispose();
    this.entry = void 0;
  }
};
ChatStatusBarEntry = __decorate([
  __param(0, IChatEntitlementService),
  __param(1, IInstantiationService),
  __param(2, IStatusbarService),
  __param(3, IEditorService),
  __param(4, IConfigurationService)
], ChatStatusBarEntry);
function isNewUser(chatEntitlementService) {
  return !chatEntitlementService.sentiment.installed || // copilot not installed
  chatEntitlementService.entitlement === ChatEntitlement.Available;
}
__name(isNewUser, "isNewUser");
function canUseCopilot(chatEntitlementService) {
  const newUser = isNewUser(chatEntitlementService);
  const disabled = chatEntitlementService.sentiment.disabled;
  const signedOut = chatEntitlementService.entitlement === ChatEntitlement.Unknown;
  const free = chatEntitlementService.entitlement === ChatEntitlement.Free;
  const allFreeQuotaReached = free && chatEntitlementService.quotas.chat?.percentRemaining === 0 && chatEntitlementService.quotas.completions?.percentRemaining === 0;
  return !newUser && !signedOut && !allFreeQuotaReached && !disabled;
}
__name(canUseCopilot, "canUseCopilot");
function isCompletionsEnabled(configurationService, modeId = "*") {
  const result = configurationService.getValue(defaultChat.completionsEnablementSetting);
  if (!isObject(result)) {
    return false;
  }
  if (typeof result[modeId] !== "undefined") {
    return Boolean(result[modeId]);
  }
  return Boolean(result["*"]);
}
__name(isCompletionsEnabled, "isCompletionsEnabled");
let ChatStatusDashboard = class ChatStatusDashboard2 extends Disposable {
  static {
    __name(this, "ChatStatusDashboard");
  }
  constructor(chatEntitlementService, chatStatusItemService, commandService, configurationService, editorService, hoverService, languageService, openerService, telemetryService, textResourceConfigurationService) {
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
    this.element = $("div.chat-status-bar-entry-tooltip");
    this.dateFormatter = safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" });
    this.quotaPercentageFormatter = safeIntl.NumberFormat(void 0, { maximumFractionDigits: 1, minimumFractionDigits: 0 });
    this.quotaOverageFormatter = safeIntl.NumberFormat(void 0, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    this.entryDisposables = this._register(new MutableDisposable());
  }
  show(token) {
    clearNode(this.element);
    const disposables = this.entryDisposables.value = new DisposableStore();
    disposables.add(token.onCancellationRequested(() => disposables.dispose()));
    let needsSeparator = false;
    const addSeparator = /* @__PURE__ */ __name((label, action) => {
      if (needsSeparator) {
        this.element.appendChild($("hr"));
      }
      if (label || action) {
        this.renderHeader(this.element, disposables, label ?? "", action);
      }
      needsSeparator = true;
    }, "addSeparator");
    const { chat: chatQuota, completions: completionsQuota, premiumChat: premiumChatQuota, resetDate } = this.chatEntitlementService.quotas;
    if (chatQuota || completionsQuota || premiumChatQuota) {
      addSeparator(localize("usageTitle", "Copilot Usage"), toAction({
        id: "workbench.action.manageCopilot",
        label: localize("quotaLabel", "Manage Copilot"),
        tooltip: localize("quotaTooltip", "Manage Copilot"),
        class: ThemeIcon.asClassName(Codicon.settings),
        run: /* @__PURE__ */ __name(() => this.runCommandAndClose(() => this.openerService.open(URI.parse(defaultChat.manageSettingsUrl))), "run")
      }));
      const completionsQuotaIndicator = completionsQuota && (completionsQuota.total > 0 || completionsQuota.unlimited) ? this.createQuotaIndicator(this.element, disposables, completionsQuota, localize("completionsLabel", "Code completions"), false) : void 0;
      const chatQuotaIndicator = chatQuota && (chatQuota.total > 0 || chatQuota.unlimited) ? this.createQuotaIndicator(this.element, disposables, chatQuota, localize("chatsLabel", "Chat messages"), false) : void 0;
      const premiumChatQuotaIndicator = premiumChatQuota && (premiumChatQuota.total > 0 || premiumChatQuota.unlimited) ? this.createQuotaIndicator(this.element, disposables, premiumChatQuota, localize("premiumChatsLabel", "Premium requests"), true) : void 0;
      if (resetDate) {
        this.element.appendChild($("div.description", void 0, localize("limitQuota", "Allowance resets {0}.", this.dateFormatter.value.format(new Date(resetDate)))));
      }
      if (this.chatEntitlementService.entitlement === ChatEntitlement.Free && (Number(chatQuota?.percentRemaining) <= 25 || Number(completionsQuota?.percentRemaining) <= 25)) {
        const upgradeProButton = disposables.add(new Button(this.element, {
          ...defaultButtonStyles,
          secondary: canUseCopilot(this.chatEntitlementService)
          /* use secondary color when copilot can still be used */
        }));
        upgradeProButton.label = localize("upgradeToCopilotPro", "Upgrade to Copilot Pro");
        disposables.add(upgradeProButton.onDidClick(() => this.runCommandAndClose("workbench.action.chat.upgradePlan")));
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
    }
    {
      for (const item of this.chatStatusItemService.getEntries()) {
        addSeparator();
        const itemDisposables = disposables.add(new MutableDisposable());
        let rendered = this.renderContributedChatStatusItem(item);
        itemDisposables.value = rendered.disposables;
        this.element.appendChild(rendered.element);
        disposables.add(this.chatStatusItemService.onDidChange((e) => {
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
      addSeparator(localize("settingsTitle", "Settings"), chatSentiment.installed && !chatSentiment.disabled ? toAction({
        id: "workbench.action.openChatSettings",
        label: localize("settingsLabel", "Settings"),
        tooltip: localize("settingsTooltip", "Open Settings"),
        class: ThemeIcon.asClassName(Codicon.settingsGear),
        run: /* @__PURE__ */ __name(() => this.runCommandAndClose(() => this.commandService.executeCommand("workbench.action.openSettings", { query: `@id:${defaultChat.completionsEnablementSetting} @id:${defaultChat.nextEditSuggestionsSetting}` })), "run")
      }) : void 0);
      this.createSettings(this.element, disposables);
    }
    {
      const newUser = isNewUser(this.chatEntitlementService);
      const disabled = this.chatEntitlementService.sentiment.disabled;
      const signedOut = this.chatEntitlementService.entitlement === ChatEntitlement.Unknown;
      if (newUser || signedOut || disabled) {
        addSeparator();
        let descriptionText;
        if (newUser) {
          descriptionText = localize("activateDescription", "Set up Copilot to use AI features.");
        } else if (disabled) {
          descriptionText = localize("enableDescription", "Enable Copilot to use AI features.");
        } else {
          descriptionText = localize("signInDescription", "Sign in to use Copilot AI features.");
        }
        let buttonLabel;
        if (newUser) {
          buttonLabel = localize("activateCopilotButton", "Set up Copilot");
        } else if (disabled) {
          buttonLabel = localize("enableCopilotButton", "Enable Copilot");
        } else {
          buttonLabel = localize("signInToUseCopilotButton", "Sign in to use Copilot");
        }
        this.element.appendChild($("div.description", void 0, descriptionText));
        const button = disposables.add(new Button(this.element, { ...defaultButtonStyles }));
        button.label = buttonLabel;
        disposables.add(button.onDidClick(() => this.runCommandAndClose("workbench.action.chat.triggerSetup")));
      }
    }
    return this.element;
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
  runCommandAndClose(commandOrFn) {
    if (typeof commandOrFn === "function") {
      commandOrFn();
    } else {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: commandOrFn, from: "chat-status" });
      this.commandService.executeCommand(commandOrFn);
    }
    this.hoverService.hideHover(true);
  }
  createQuotaIndicator(container, disposables, quota, label, supportsOverage) {
    const quotaValue = $("span.quota-value");
    const quotaBit = $("div.quota-bit");
    const overageLabel = $("span.overage-label");
    const quotaIndicator = container.appendChild($("div.quota-indicator", void 0, $("div.quota-label", void 0, $("span", void 0, label), quotaValue), $("div.quota-bar", void 0, quotaBit), $("div.description", void 0, overageLabel)));
    if (supportsOverage && (this.chatEntitlementService.entitlement === ChatEntitlement.Pro || this.chatEntitlementService.entitlement === ChatEntitlement.ProPlus)) {
      const manageOverageButton = disposables.add(new Button(quotaIndicator, { ...defaultButtonStyles, secondary: true }));
      manageOverageButton.label = localize("enableAdditionalUsage", "Manage paid premium requests");
      disposables.add(manageOverageButton.onDidClick(() => this.runCommandAndClose(() => this.openerService.open(URI.parse(defaultChat.manageOverageUrl)))));
    }
    const update = /* @__PURE__ */ __name((quota2) => {
      quotaIndicator.classList.remove("error");
      quotaIndicator.classList.remove("warning");
      let usedPercentage;
      if (quota2.unlimited) {
        usedPercentage = 0;
      } else {
        usedPercentage = Math.max(0, 100 - quota2.percentRemaining);
      }
      if (quota2.unlimited) {
        quotaValue.textContent = localize("quotaUnlimited", "Included");
      } else if (quota2.overageCount) {
        quotaValue.textContent = localize("quotaDisplayWithOverage", "+{0} requests", this.quotaOverageFormatter.value.format(quota2.overageCount));
      } else {
        quotaValue.textContent = localize("quotaDisplay", "{0}%", this.quotaPercentageFormatter.value.format(usedPercentage));
      }
      quotaBit.style.width = `${usedPercentage}%`;
      if (usedPercentage >= 90) {
        quotaIndicator.classList.add("error");
      } else if (usedPercentage >= 75) {
        quotaIndicator.classList.add("warning");
      }
      if (supportsOverage) {
        if (quota2.overageEnabled) {
          overageLabel.textContent = localize("additionalUsageEnabled", "Additional paid premium requests enabled.");
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
      this.createCodeCompletionsSetting(globalSetting, localize("settings.codeCompletions", "Code completions (all files)"), "*", disposables);
      if (modeId) {
        const languageSetting = append(settings, $("div.setting"));
        this.createCodeCompletionsSetting(languageSetting, localize("settings.codeCompletionsLanguage", "Code completions ({0})", this.languageService.getLanguageName(modeId) ?? modeId), modeId, disposables);
      }
    }
    {
      const setting = append(settings, $("div.setting"));
      this.createNextEditSuggestionsSetting(setting, localize("settings.nextEditSuggestions", "Next edit suggestions"), this.getCompletionsSettingAccessor(modeId), disposables);
    }
    return settings;
  }
  createSetting(container, settingIdsToReEvaluate, label, accessor, disposables) {
    const checkbox = disposables.add(new Checkbox(label, Boolean(accessor.readSetting()), defaultCheckboxStyles));
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
    if (!canUseCopilot(this.chatEntitlementService)) {
      container.classList.add("disabled");
      checkbox.disable();
      checkbox.checked = false;
    }
    return checkbox;
  }
  createCodeCompletionsSetting(container, label, modeId, disposables) {
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
        if (completionsSettingAccessor.readSetting() && canUseCopilot(this.chatEntitlementService)) {
          checkbox.enable();
          container.classList.remove("disabled");
        } else {
          checkbox.disable();
          container.classList.add("disabled");
        }
      }
    }));
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
  __param(9, ITextResourceConfigurationService)
], ChatStatusDashboard);
export {
  ChatStatusBarEntry
};
//# sourceMappingURL=chatStatus.js.map
