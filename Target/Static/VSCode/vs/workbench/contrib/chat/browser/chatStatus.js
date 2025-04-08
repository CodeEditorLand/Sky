var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./media/chatStatus.css";
import { safeIntl } from "../../../../base/common/date.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { language } from "../../../../base/common/platform.js";
import { localize } from "../../../../nls.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, ShowTooltipCommand, StatusbarAlignment, StatusbarEntryKind } from "../../../services/statusbar/browser/statusbar.js";
import { $, addDisposableListener, append, clearNode, EventHelper, EventType } from "../../../../base/browser/dom.js";
import { ChatEntitlement, ChatEntitlementService, ChatSentiment, IChatEntitlementService } from "../common/chatEntitlementService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { defaultButtonStyles, defaultCheckboxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { Checkbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { contrastBorder, inputValidationErrorBorder, inputValidationInfoBorder, inputValidationWarningBorder, registerColor, transparent } from "../../../../platform/theme/common/colorRegistry.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { Color } from "../../../../base/common/color.js";
import { Gesture, EventType as TouchEventType } from "../../../../base/browser/touch.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import product from "../../../../platform/product/common/product.js";
import { isObject } from "../../../../base/common/types.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification, IAction, toAction } from "../../../../base/common/actions.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IChatStatusItemService, ChatStatusEntry } from "./chatStatusItemService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { getCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { URI } from "../../../../base/common/uri.js";
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
  manageSettingsUrl: product.defaultChatAgent?.manageSettingsUrl ?? ""
};
let ChatStatusBarEntry = class extends Disposable {
  constructor(chatEntitlementService, instantiationService, statusbarService, editorService, configurationService) {
    super();
    this.chatEntitlementService = chatEntitlementService;
    this.instantiationService = instantiationService;
    this.statusbarService = statusbarService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.create();
    this.registerListeners();
  }
  static {
    __name(this, "ChatStatusBarEntry");
  }
  static ID = "workbench.contrib.chatStatusBarEntry";
  entry = void 0;
  dashboard = new Lazy(() => this.instantiationService.createInstance(ChatStatusDashboard));
  activeCodeEditorListener = this._register(new MutableDisposable());
  async create() {
    const hidden = this.chatEntitlementService.sentiment === ChatSentiment.Disabled;
    if (!hidden) {
      this.entry ||= this.statusbarService.addEntry(this.getEntryProps(), "chat.statusBarEntry", StatusbarAlignment.RIGHT, { location: { id: "status.editor.mode", priority: 100.1 }, alignment: StatusbarAlignment.RIGHT });
      const completionsStatusId = `${defaultChat.extensionId}.status`;
      this.statusbarService.updateEntryVisibility(completionsStatusId, false);
      this.statusbarService.overrideEntry(completionsStatusId, { name: localize("codeCompletionsStatus", "Copilot Code Completions"), text: localize("codeCompletionsStatusText", "$(copilot) Completions") });
    } else {
      this.entry?.dispose();
      this.entry = void 0;
    }
  }
  registerListeners() {
    this._register(this.chatEntitlementService.onDidChangeQuotaExceeded(() => this.entry?.update(this.getEntryProps())));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => this.entry?.update(this.getEntryProps())));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => this.entry?.update(this.getEntryProps())));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(defaultChat.completionsEnablementSetting)) {
        this.entry?.update(this.getEntryProps());
      }
    }));
  }
  onDidActiveEditorChange() {
    this.entry?.update(this.getEntryProps());
    this.activeCodeEditorListener.clear();
    const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
    if (activeCodeEditor) {
      this.activeCodeEditorListener.value = activeCodeEditor.onDidChangeModelLanguage(() => {
        this.entry?.update(this.getEntryProps());
      });
    }
  }
  getEntryProps() {
    let text = "$(copilot)";
    let ariaLabel = localize("chatStatus", "Copilot Status");
    let kind;
    if (!isNewUser(this.chatEntitlementService)) {
      const { chatQuotaExceeded, completionsQuotaExceeded } = this.chatEntitlementService.quotas;
      if (this.chatEntitlementService.entitlement === ChatEntitlement.Unknown) {
        const signedOutWarning = localize("notSignedIntoCopilot", "Signed out");
        text = `$(copilot-not-connected) ${signedOutWarning}`;
        ariaLabel = signedOutWarning;
        kind = "prominent";
      } else if (chatQuotaExceeded || completionsQuotaExceeded) {
        let quotaWarning;
        if (chatQuotaExceeded && !completionsQuotaExceeded) {
          quotaWarning = localize("chatQuotaExceededStatus", "Chat limit reached");
        } else if (completionsQuotaExceeded && !chatQuotaExceeded) {
          quotaWarning = localize("completionsQuotaExceededStatus", "Completions limit reached");
        } else {
          quotaWarning = localize("chatAndCompletionsQuotaExceededStatus", "Limit reached");
        }
        text = `$(copilot-warning) ${quotaWarning}`;
        ariaLabel = quotaWarning;
        kind = "prominent";
      } else if (this.editorService.activeTextEditorLanguageId && !isCompletionsEnabled(this.configurationService, this.editorService.activeTextEditorLanguageId)) {
        text = `$(copilot-unavailable)`;
        ariaLabel = localize("completionsDisabledStatus", "Code Completions Disabled");
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
ChatStatusBarEntry = __decorateClass([
  __decorateParam(0, IChatEntitlementService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IStatusbarService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IConfigurationService)
], ChatStatusBarEntry);
function isNewUser(chatEntitlementService) {
  return chatEntitlementService.sentiment !== ChatSentiment.Installed || // copilot not installed
  chatEntitlementService.entitlement === ChatEntitlement.Available;
}
__name(isNewUser, "isNewUser");
function canUseCopilot(chatEntitlementService) {
  const newUser = isNewUser(chatEntitlementService);
  const signedOut = chatEntitlementService.entitlement === ChatEntitlement.Unknown;
  const allQuotaReached = chatEntitlementService.quotas.chatQuotaExceeded && chatEntitlementService.quotas.completionsQuotaExceeded;
  return !newUser && !signedOut && !allQuotaReached;
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
let ChatStatusDashboard = class extends Disposable {
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
  }
  static {
    __name(this, "ChatStatusDashboard");
  }
  element = $("div.chat-status-bar-entry-tooltip");
  dateFormatter = new Lazy(() => safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" }));
  entryDisposables = this._register(new MutableDisposable());
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
        const header = this.element.appendChild($("div.header", void 0, label ?? ""));
        if (action) {
          const toolbar = disposables.add(new ActionBar(header));
          toolbar.push([action], { icon: true, label: false });
        }
      }
      needsSeparator = true;
    }, "addSeparator");
    if (this.chatEntitlementService.entitlement === ChatEntitlement.Limited) {
      const { chatTotal, chatRemaining, completionsTotal, completionsRemaining, quotaResetDate, chatQuotaExceeded, completionsQuotaExceeded } = this.chatEntitlementService.quotas;
      addSeparator(localize("usageTitle", "Copilot Free Plan Usage"), toAction({
        id: "workbench.action.openChatSettings",
        label: localize("quotaLabel", "Manage Copilot"),
        tooltip: localize("quotaTooltip", "Manage Copilot"),
        class: ThemeIcon.asClassName(Codicon.settings),
        run: /* @__PURE__ */ __name(() => this.runCommandAndClose(() => this.openerService.open(URI.parse(defaultChat.manageSettingsUrl))), "run")
      }));
      const chatQuotaIndicator = this.createQuotaIndicator(this.element, chatTotal, chatRemaining, localize("chatsLabel", "Chat messages"));
      const completionsQuotaIndicator = this.createQuotaIndicator(this.element, completionsTotal, completionsRemaining, localize("completionsLabel", "Code completions"));
      this.element.appendChild($("div.description", void 0, localize("limitQuota", "Limits will reset on {0}.", this.dateFormatter.value.format(quotaResetDate))));
      if (chatQuotaExceeded || completionsQuotaExceeded) {
        const upgradePlanButton = disposables.add(new Button(this.element, {
          ...defaultButtonStyles,
          secondary: canUseCopilot(this.chatEntitlementService)
          /* use secondary color when copilot can still be used */
        }));
        upgradePlanButton.label = localize("upgradeToCopilotPro", "Upgrade to Copilot Pro");
        disposables.add(upgradePlanButton.onDidClick(() => this.runCommandAndClose("workbench.action.chat.upgradePlan")));
      }
      (async () => {
        await this.chatEntitlementService.update(token);
        if (token.isCancellationRequested) {
          return;
        }
        const { chatTotal: chatTotal2, chatRemaining: chatRemaining2, completionsTotal: completionsTotal2, completionsRemaining: completionsRemaining2 } = this.chatEntitlementService.quotas;
        chatQuotaIndicator(chatTotal2, chatRemaining2);
        completionsQuotaIndicator(completionsTotal2, completionsRemaining2);
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
      addSeparator(localize("settingsTitle", "Settings"), this.chatEntitlementService.sentiment === ChatSentiment.Installed ? toAction({
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
      const signedOut = this.chatEntitlementService.entitlement === ChatEntitlement.Unknown;
      if (newUser || signedOut) {
        addSeparator();
        this.element.appendChild($("div.description", void 0, newUser ? localize("activateDescription", "Set up Copilot to use AI features.") : localize("signInDescription", "Sign in to use Copilot AI features.")));
        const button = disposables.add(new Button(this.element, { ...defaultButtonStyles }));
        button.label = newUser ? localize("activateCopilotButton", "Set up Copilot") : localize("signInToUseCopilotButton", "Sign in to use Copilot");
        disposables.add(button.onDidClick(() => this.runCommandAndClose(newUser ? "workbench.action.chat.triggerSetup" : () => this.chatEntitlementService.requests?.value.signIn())));
      }
    }
    return this.element;
  }
  renderContributedChatStatusItem(item) {
    const disposables = new DisposableStore();
    const itemElement = $("div.contribution");
    itemElement.appendChild($("div.header", void 0, item.label));
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
  createQuotaIndicator(container, total, remaining, label) {
    const quotaText = $("span.quota-percentage");
    const quotaBit = $("div.quota-bit");
    const quotaIndicator = container.appendChild($(
      "div.quota-indicator",
      void 0,
      $(
        "div.quota-label",
        void 0,
        $("span", void 0, label),
        quotaText
      ),
      $(
        "div.quota-bar",
        void 0,
        quotaBit
      )
    ));
    const update = /* @__PURE__ */ __name((total2, remaining2) => {
      quotaIndicator.classList.remove("error");
      quotaIndicator.classList.remove("warning");
      if (typeof total2 === "number" && typeof remaining2 === "number") {
        let usedPercentage = Math.round((total2 - remaining2) / total2 * 100);
        if (total2 !== remaining2 && usedPercentage === 0) {
          usedPercentage = 1;
        }
        quotaText.textContent = localize("quotaDisplay", "{0}%", usedPercentage);
        quotaBit.style.width = `${usedPercentage}%`;
        if (usedPercentage >= 90) {
          quotaIndicator.classList.add("error");
        } else if (usedPercentage >= 75) {
          quotaIndicator.classList.add("warning");
        }
      }
    }, "update");
    update(total, remaining);
    return update;
  }
  createSettings(container, disposables) {
    const modeId = this.editorService.activeTextEditorLanguageId;
    const settings = container.appendChild($("div.settings"));
    {
      const globalSetting = append(settings, $("div.setting"));
      this.createCodeCompletionsSetting(globalSetting, localize("settings.codeCompletions", "Code Completions (all files)"), "*", disposables);
      if (modeId) {
        const languageSetting = append(settings, $("div.setting"));
        this.createCodeCompletionsSetting(languageSetting, localize("settings.codeCompletionsLanguage", "Code Completions ({0})", this.languageService.getLanguageName(modeId) ?? modeId), modeId, disposables);
      }
    }
    {
      const setting = append(settings, $("div.setting"));
      this.createNextEditSuggestionsSetting(setting, localize("settings.nextEditSuggestions", "Next Edit Suggestions"), modeId, this.getCompletionsSettingAccessor(modeId), disposables);
    }
    return settings;
  }
  createSetting(container, settingId, label, accessor, disposables) {
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
      if (e.affectsConfiguration(settingId)) {
        checkbox.checked = Boolean(accessor.readSetting());
      }
    }));
    if (!canUseCopilot(this.chatEntitlementService)) {
      container.classList.add("disabled");
      checkbox.disable();
    }
    return checkbox;
  }
  createCodeCompletionsSetting(container, label, modeId, disposables) {
    this.createSetting(container, defaultChat.completionsEnablementSetting, label, this.getCompletionsSettingAccessor(modeId), disposables);
  }
  getCompletionsSettingAccessor(modeId = "*") {
    const settingId = defaultChat.completionsEnablementSetting;
    return {
      readSetting: /* @__PURE__ */ __name(() => isCompletionsEnabled(this.configurationService, modeId), "readSetting"),
      writeSetting: /* @__PURE__ */ __name((value) => {
        let result = this.configurationService.getValue(settingId);
        if (!isObject(result)) {
          result = /* @__PURE__ */ Object.create(null);
        }
        return this.configurationService.updateValue(settingId, { ...result, [modeId]: value });
      }, "writeSetting")
    };
  }
  createNextEditSuggestionsSetting(container, label, modeId, completionsSettingAccessor, disposables) {
    const nesSettingId = defaultChat.nextEditSuggestionsSetting;
    const completionsSettingId = defaultChat.completionsEnablementSetting;
    const resource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
    const checkbox = this.createSetting(container, nesSettingId, label, {
      readSetting: /* @__PURE__ */ __name(() => this.textResourceConfigurationService.getValue(resource, nesSettingId), "readSetting"),
      writeSetting: /* @__PURE__ */ __name((value) => this.textResourceConfigurationService.updateValue(resource, nesSettingId, value), "writeSetting")
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
ChatStatusDashboard = __decorateClass([
  __decorateParam(0, IChatEntitlementService),
  __decorateParam(1, IChatStatusItemService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, ITextResourceConfigurationService)
], ChatStatusDashboard);
export {
  ChatStatusBarEntry
};
//# sourceMappingURL=chatStatus.js.map
