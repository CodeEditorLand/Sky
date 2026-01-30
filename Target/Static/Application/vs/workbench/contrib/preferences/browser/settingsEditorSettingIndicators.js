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
import * as DOM from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { SimpleIconLabel } from "../../../../base/browser/ui/iconLabel/simpleIconLabel.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { MarkdownString, createMarkdownLink } from "../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.js";
import { ADVANCED_INDICATOR_DESCRIPTION, EXPERIMENTAL_INDICATOR_DESCRIPTION, POLICY_SETTING_TAG, PREVIEW_INDICATOR_DESCRIPTION } from "../common/preferences.js";
const $ = DOM.$;
let cachedSyncIgnoredSettingsSet = /* @__PURE__ */ new Set();
let cachedSyncIgnoredSettings = [];
let SettingsTreeIndicatorsLabel = class SettingsTreeIndicatorsLabel2 {
  static {
    __name(this, "SettingsTreeIndicatorsLabel");
  }
  constructor(container, configurationService, hoverService, userDataSyncEnablementService, languageService, commandService) {
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.languageService = languageService;
    this.commandService = commandService;
    this.isolatedIndicators = [];
    this.keybindingListeners = new DisposableStore();
    this.focusedIndex = 0;
    this.defaultHoverOptions = {
      trapFocus: true,
      style: 1,
      position: {
        hoverPosition: 2
      }
    };
    this.indicatorsContainerElement = DOM.append(container, $(".setting-indicators-container"));
    this.indicatorsContainerElement.style.display = "inline";
    this.previewIndicator = this.createPreviewIndicator();
    this.advancedIndicator = this.createAdvancedIndicator();
    this.isolatedIndicators = [this.previewIndicator, this.advancedIndicator];
    this.workspaceTrustIndicator = this.createWorkspaceTrustIndicator();
    this.scopeOverridesIndicator = this.createScopeOverridesIndicator();
    this.syncIgnoredIndicator = this.createSyncIgnoredIndicator();
    this.defaultOverrideIndicator = this.createDefaultOverrideIndicator();
    this.parenthesizedIndicators = [this.workspaceTrustIndicator, this.scopeOverridesIndicator, this.syncIgnoredIndicator, this.defaultOverrideIndicator];
  }
  addHoverDisposables(disposables, element, showHover) {
    disposables.clear();
    const scheduler = disposables.add(new RunOnceScheduler(() => {
      const hover = showHover(false);
      if (hover) {
        disposables.add(hover);
      }
    }, this.configurationService.getValue("workbench.hover.delay")));
    disposables.add(DOM.addDisposableListener(element, DOM.EventType.MOUSE_OVER, () => {
      if (!scheduler.isScheduled()) {
        scheduler.schedule();
      }
    }));
    disposables.add(DOM.addDisposableListener(element, DOM.EventType.MOUSE_LEAVE, () => {
      scheduler.cancel();
    }));
    disposables.add(DOM.addDisposableListener(element, DOM.EventType.KEY_DOWN, (e) => {
      const evt = new StandardKeyboardEvent(e);
      if (evt.equals(
        10
        /* KeyCode.Space */
      ) || evt.equals(
        3
        /* KeyCode.Enter */
      )) {
        const hover = showHover(true);
        if (hover) {
          disposables.add(hover);
        }
        e.preventDefault();
      }
    }));
  }
  createWorkspaceTrustIndicator() {
    const disposables = new DisposableStore();
    const workspaceTrustElement = $("span.setting-indicator.setting-item-workspace-trust");
    const workspaceTrustLabel = disposables.add(new SimpleIconLabel(workspaceTrustElement));
    workspaceTrustLabel.text = "$(shield) " + localize("workspaceUntrustedLabel", "Requires workspace trust");
    const content = localize("trustLabel", "The setting value can only be applied in a trusted workspace.");
    const showHover = /* @__PURE__ */ __name((focus) => {
      return this.hoverService.showInstantHover({
        ...this.defaultHoverOptions,
        content,
        target: workspaceTrustElement,
        actions: [{
          label: localize("manageWorkspaceTrust", "Manage Workspace Trust"),
          commandId: "workbench.trust.manage",
          run: /* @__PURE__ */ __name((target) => {
            this.commandService.executeCommand("workbench.trust.manage");
          }, "run")
        }]
      }, focus);
    }, "showHover");
    this.addHoverDisposables(disposables, workspaceTrustElement, showHover);
    return {
      element: workspaceTrustElement,
      label: workspaceTrustLabel,
      disposables
    };
  }
  createScopeOverridesIndicator() {
    const disposables = new DisposableStore();
    const otherOverridesElement = $("span.setting-item-overrides");
    const otherOverridesLabel = disposables.add(new SimpleIconLabel(otherOverridesElement));
    return {
      element: otherOverridesElement,
      label: otherOverridesLabel,
      disposables
    };
  }
  createSyncIgnoredIndicator() {
    const disposables = new DisposableStore();
    const syncIgnoredElement = $("span.setting-indicator.setting-item-ignored");
    const syncIgnoredLabel = disposables.add(new SimpleIconLabel(syncIgnoredElement));
    syncIgnoredLabel.text = localize("extensionSyncIgnoredLabel", "Not synced");
    const syncIgnoredHoverContent = localize("syncIgnoredTitle", "This setting is ignored during sync");
    const showHover = /* @__PURE__ */ __name((focus) => {
      return this.hoverService.showInstantHover({
        ...this.defaultHoverOptions,
        content: syncIgnoredHoverContent,
        target: syncIgnoredElement
      }, focus);
    }, "showHover");
    this.addHoverDisposables(disposables, syncIgnoredElement, showHover);
    return {
      element: syncIgnoredElement,
      label: syncIgnoredLabel,
      disposables
    };
  }
  createDefaultOverrideIndicator() {
    const disposables = new DisposableStore();
    const defaultOverrideIndicator = $("span.setting-indicator.setting-item-default-overridden");
    const defaultOverrideLabel = disposables.add(new SimpleIconLabel(defaultOverrideIndicator));
    defaultOverrideLabel.text = localize("defaultOverriddenLabel", "Default value changed");
    return {
      element: defaultOverrideIndicator,
      label: defaultOverrideLabel,
      disposables
    };
  }
  createPreviewIndicator() {
    const disposables = new DisposableStore();
    const previewIndicator = $("span.setting-indicator.setting-item-preview");
    const previewLabel = disposables.add(new SimpleIconLabel(previewIndicator));
    return {
      element: previewIndicator,
      label: previewLabel,
      disposables
    };
  }
  createAdvancedIndicator() {
    const disposables = new DisposableStore();
    const advancedIndicator = $("span.setting-indicator.setting-item-preview");
    const advancedLabel = disposables.add(new SimpleIconLabel(advancedIndicator));
    advancedLabel.text = localize("advancedLabel", "Advanced");
    const showHover = /* @__PURE__ */ __name((focus) => {
      return this.hoverService.showInstantHover({
        ...this.defaultHoverOptions,
        content: ADVANCED_INDICATOR_DESCRIPTION,
        target: advancedIndicator
      }, focus);
    }, "showHover");
    this.addHoverDisposables(disposables, advancedIndicator, showHover);
    return {
      element: advancedIndicator,
      label: advancedLabel,
      disposables
    };
  }
  render() {
    this.indicatorsContainerElement.innerText = "";
    this.indicatorsContainerElement.style.display = "none";
    const isolatedIndicatorsToShow = this.isolatedIndicators.filter((indicator) => {
      return indicator.element.style.display !== "none";
    });
    if (isolatedIndicatorsToShow.length) {
      this.indicatorsContainerElement.style.display = "inline";
      for (let i = 0; i < isolatedIndicatorsToShow.length; i++) {
        DOM.append(this.indicatorsContainerElement, isolatedIndicatorsToShow[i].element);
      }
    }
    const parenthesizedIndicatorsToShow = this.parenthesizedIndicators.filter((indicator) => {
      return indicator.element.style.display !== "none";
    });
    if (parenthesizedIndicatorsToShow.length) {
      this.indicatorsContainerElement.style.display = "inline";
      DOM.append(this.indicatorsContainerElement, $("span", void 0, "("));
      for (let i = 0; i < parenthesizedIndicatorsToShow.length - 1; i++) {
        DOM.append(this.indicatorsContainerElement, parenthesizedIndicatorsToShow[i].element);
        DOM.append(this.indicatorsContainerElement, $("span.comma", void 0, " \u2022 "));
      }
      DOM.append(this.indicatorsContainerElement, parenthesizedIndicatorsToShow[parenthesizedIndicatorsToShow.length - 1].element);
      DOM.append(this.indicatorsContainerElement, $("span", void 0, ")"));
    }
    this.resetIndicatorNavigationKeyBindings([...isolatedIndicatorsToShow, ...parenthesizedIndicatorsToShow]);
  }
  resetIndicatorNavigationKeyBindings(indicators) {
    this.keybindingListeners.clear();
    this.indicatorsContainerElement.role = indicators.length >= 1 ? "toolbar" : "button";
    if (!indicators.length) {
      return;
    }
    const firstElement = indicators[0].focusElement ?? indicators[0].element;
    firstElement.tabIndex = 0;
    this.keybindingListeners.add(DOM.addDisposableListener(this.indicatorsContainerElement, "keydown", (e) => {
      const ev = new StandardKeyboardEvent(e);
      let handled = true;
      if (ev.equals(
        14
        /* KeyCode.Home */
      )) {
        this.focusIndicatorAt(indicators, 0);
      } else if (ev.equals(
        13
        /* KeyCode.End */
      )) {
        this.focusIndicatorAt(indicators, indicators.length - 1);
      } else if (ev.equals(
        17
        /* KeyCode.RightArrow */
      )) {
        const indexToFocus = (this.focusedIndex + 1) % indicators.length;
        this.focusIndicatorAt(indicators, indexToFocus);
      } else if (ev.equals(
        15
        /* KeyCode.LeftArrow */
      )) {
        const indexToFocus = this.focusedIndex ? this.focusedIndex - 1 : indicators.length - 1;
        this.focusIndicatorAt(indicators, indexToFocus);
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }));
  }
  focusIndicatorAt(indicators, index) {
    if (index === this.focusedIndex) {
      return;
    }
    const indicator = indicators[index];
    const elementToFocus = indicator.focusElement ?? indicator.element;
    elementToFocus.tabIndex = 0;
    elementToFocus.focus();
    const currentlyFocusedIndicator = indicators[this.focusedIndex];
    const previousFocusedElement = currentlyFocusedIndicator.focusElement ?? currentlyFocusedIndicator.element;
    previousFocusedElement.tabIndex = -1;
    this.focusedIndex = index;
  }
  updateWorkspaceTrust(element) {
    this.workspaceTrustIndicator.element.style.display = element.isUntrusted ? "inline" : "none";
    this.render();
  }
  updateSyncIgnored(element, ignoredSettings) {
    this.syncIgnoredIndicator.element.style.display = this.userDataSyncEnablementService.isEnabled() && ignoredSettings.includes(element.setting.key) ? "inline" : "none";
    this.render();
    if (cachedSyncIgnoredSettings !== ignoredSettings) {
      cachedSyncIgnoredSettings = ignoredSettings;
      cachedSyncIgnoredSettingsSet = new Set(cachedSyncIgnoredSettings);
    }
  }
  updatePreviewIndicator(element) {
    const isPreviewSetting = element.tags?.has("preview");
    const isExperimentalSetting = element.tags?.has("experimental");
    this.previewIndicator.element.style.display = isPreviewSetting || isExperimentalSetting ? "inline" : "none";
    this.previewIndicator.label.text = isPreviewSetting ? localize("previewLabel", "Preview") : localize("experimentalLabel", "Experimental");
    const content = isPreviewSetting ? PREVIEW_INDICATOR_DESCRIPTION : EXPERIMENTAL_INDICATOR_DESCRIPTION;
    const showHover = /* @__PURE__ */ __name((focus) => {
      return this.hoverService.showInstantHover({
        ...this.defaultHoverOptions,
        content,
        target: this.previewIndicator.element
      }, focus);
    }, "showHover");
    this.addHoverDisposables(this.previewIndicator.disposables, this.previewIndicator.element, showHover);
    this.render();
  }
  updateAdvancedIndicator(element) {
    const isAdvancedSetting = element.tags?.has("advanced");
    this.advancedIndicator.element.style.display = isAdvancedSetting ? "inline" : "none";
    this.render();
  }
  getInlineScopeDisplayText(completeScope) {
    const [scope, language] = completeScope.split(":");
    const localizedScope = scope === "user" ? localize("user", "User") : scope === "workspace" ? localize("workspace", "Workspace") : localize("remote", "Remote");
    if (language) {
      return `${this.languageService.getLanguageName(language)} > ${localizedScope}`;
    }
    return localizedScope;
  }
  dispose() {
    this.keybindingListeners.dispose();
    for (const indicator of this.isolatedIndicators) {
      indicator.disposables.dispose();
    }
    for (const indicator of this.parenthesizedIndicators) {
      indicator.disposables.dispose();
    }
  }
  updateScopeOverrides(element, onDidClickOverrideElement, onApplyFilter) {
    this.scopeOverridesIndicator.disposables.clear();
    this.scopeOverridesIndicator.element.innerText = "";
    this.scopeOverridesIndicator.element.style.display = "none";
    this.scopeOverridesIndicator.focusElement = this.scopeOverridesIndicator.element;
    if (element.hasPolicyValue) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = "$(briefcase) " + localize("policyLabelText", "Managed by organization");
      const content = localize("policyDescription", "This setting is managed by your organization and its actual value cannot be changed.");
      const showHover = /* @__PURE__ */ __name((focus) => {
        return this.hoverService.showInstantHover({
          ...this.defaultHoverOptions,
          content,
          actions: [{
            label: localize("policyFilterLink", "View policy settings"),
            commandId: "_settings.action.viewPolicySettings",
            run: /* @__PURE__ */ __name((_) => {
              onApplyFilter.fire(`@${POLICY_SETTING_TAG}`);
            }, "run")
          }],
          target: this.scopeOverridesIndicator.element
        }, focus);
      }, "showHover");
      this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
    } else if (element.settingsTarget === 3 && this.configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
      this.scopeOverridesIndicator.element.style.display = "inline";
      this.scopeOverridesIndicator.element.classList.add("setting-indicator");
      this.scopeOverridesIndicator.label.text = localize("applicationSetting", "Applies to all profiles");
      const content = localize("applicationSettingDescription", "The setting is not specific to the current profile, and will retain its value when switching profiles.");
      const showHover = /* @__PURE__ */ __name((focus) => {
        return this.hoverService.showInstantHover({
          ...this.defaultHoverOptions,
          content,
          target: this.scopeOverridesIndicator.element
        }, focus);
      }, "showHover");
      this.addHoverDisposables(this.scopeOverridesIndicator.disposables, this.scopeOverridesIndicator.element, showHover);
    } else if (element.overriddenScopeList.length || element.overriddenDefaultsLanguageList.length) {
      if (element.overriddenScopeList.length === 1 && !element.overriddenDefaultsLanguageList.length) {
        this.scopeOverridesIndicator.element.style.display = "inline";
        this.scopeOverridesIndicator.element.classList.remove("setting-indicator");
        const prefaceText = element.isConfigured ? localize("alsoConfiguredIn", "Also modified in") : localize("configuredIn", "Modified in");
        this.scopeOverridesIndicator.label.text = `${prefaceText} `;
        const overriddenScope = element.overriddenScopeList[0];
        const view = DOM.append(this.scopeOverridesIndicator.element, $("a.modified-scope", void 0, this.getInlineScopeDisplayText(overriddenScope)));
        view.tabIndex = -1;
        this.scopeOverridesIndicator.focusElement = view;
        const onClickOrKeydown = /* @__PURE__ */ __name((e) => {
          const [scope, language] = overriddenScope.split(":");
          onDidClickOverrideElement.fire({
            settingKey: element.setting.key,
            scope,
            language
          });
          e.preventDefault();
          e.stopPropagation();
        }, "onClickOrKeydown");
        this.scopeOverridesIndicator.disposables.add(DOM.addDisposableListener(view, DOM.EventType.CLICK, (e) => {
          onClickOrKeydown(e);
        }));
        this.scopeOverridesIndicator.disposables.add(DOM.addDisposableListener(view, DOM.EventType.KEY_DOWN, (e) => {
          const ev = new StandardKeyboardEvent(e);
          if (ev.equals(
            10
            /* KeyCode.Space */
          ) || ev.equals(
            3
            /* KeyCode.Enter */
          )) {
            onClickOrKeydown(e);
          }
        }));
      } else {
        this.scopeOverridesIndicator.element.style.display = "inline";
        this.scopeOverridesIndicator.element.classList.add("setting-indicator");
        const scopeOverridesLabelText = element.isConfigured ? localize("alsoConfiguredElsewhere", "Also modified elsewhere") : localize("configuredElsewhere", "Modified elsewhere");
        this.scopeOverridesIndicator.label.text = scopeOverridesLabelText;
        let contentMarkdownString = "";
        if (element.overriddenScopeList.length) {
          const prefaceText = element.isConfigured ? localize("alsoModifiedInScopes", "The setting has also been modified in the following scopes:") : localize("modifiedInScopes", "The setting has been modified in the following scopes:");
          contentMarkdownString = prefaceText;
          for (const scope of element.overriddenScopeList) {
            const scopeDisplayText = this.getInlineScopeDisplayText(scope);
            contentMarkdownString += "\n- " + createMarkdownLink(scopeDisplayText, SettingScopeLink.create(scope).toString(), getAccessibleScopeDisplayText(scope, this.languageService));
          }
        }
        if (element.overriddenDefaultsLanguageList.length) {
          if (contentMarkdownString) {
            contentMarkdownString += `

`;
          }
          const prefaceText = localize("hasDefaultOverridesForLanguages", "The following languages have default overrides:");
          contentMarkdownString += prefaceText;
          for (const language of element.overriddenDefaultsLanguageList) {
            const scopeDisplayText = this.languageService.getLanguageName(language);
            contentMarkdownString += "\n- " + createMarkdownLink(scopeDisplayText ?? language, SettingScopeLink.create(`default:${language}`).toString());
          }
        }
        const content = {
          value: contentMarkdownString,
          isTrusted: false,
          supportHtml: false
        };
        this.scopeOverridesIndicator.disposables.add(this.hoverService.setupDelayedHover(this.scopeOverridesIndicator.element, () => ({
          ...this.defaultHoverOptions,
          content,
          linkHandler: /* @__PURE__ */ __name((url) => {
            const [scope, language] = SettingScopeLink.parse(url).split(":");
            onDidClickOverrideElement.fire({
              settingKey: element.setting.key,
              scope,
              language
            });
          }, "linkHandler")
        }), { setupKeyboardEvents: true }));
      }
    }
    this.render();
  }
  updateDefaultOverrideIndicator(element) {
    this.defaultOverrideIndicator.element.style.display = "none";
    let sourceToDisplay = getDefaultValueSourceToDisplay(element);
    if (sourceToDisplay !== void 0) {
      this.defaultOverrideIndicator.element.style.display = "inline";
      this.defaultOverrideIndicator.disposables.clear();
      if (Array.isArray(sourceToDisplay) && sourceToDisplay.length === 1) {
        sourceToDisplay = sourceToDisplay[0];
      }
      let defaultOverrideHoverContent;
      if (!Array.isArray(sourceToDisplay)) {
        defaultOverrideHoverContent = localize("defaultOverriddenDetails", "Default setting value overridden by `{0}`", sourceToDisplay);
      } else {
        sourceToDisplay = sourceToDisplay.map((source) => `\`${source}\``);
        defaultOverrideHoverContent = localize("multipledefaultOverriddenDetails", "A default values has been set by {0}", sourceToDisplay.slice(0, -1).join(", ") + " & " + sourceToDisplay.slice(-1));
      }
      const showHover = /* @__PURE__ */ __name((focus) => {
        return this.hoverService.showInstantHover({
          content: new MarkdownString().appendMarkdown(defaultOverrideHoverContent),
          target: this.defaultOverrideIndicator.element,
          style: 1,
          position: {
            hoverPosition: 2
          }
        }, focus);
      }, "showHover");
      this.addHoverDisposables(this.defaultOverrideIndicator.disposables, this.defaultOverrideIndicator.element, showHover);
    }
    this.render();
  }
};
SettingsTreeIndicatorsLabel = __decorate([
  __param(1, IWorkbenchConfigurationService),
  __param(2, IHoverService),
  __param(3, IUserDataSyncEnablementService),
  __param(4, ILanguageService),
  __param(5, ICommandService)
], SettingsTreeIndicatorsLabel);
function getDefaultValueSourceToDisplay(element) {
  let sourceToDisplay;
  const defaultValueSource = element.defaultValueSource;
  if (defaultValueSource) {
    if (defaultValueSource instanceof Map) {
      sourceToDisplay = [];
      for (const [, value] of defaultValueSource) {
        const newValue = typeof value !== "string" ? value.displayName ?? value.id : value;
        if (!sourceToDisplay.includes(newValue)) {
          sourceToDisplay.push(newValue);
        }
      }
    } else if (typeof defaultValueSource === "string") {
      sourceToDisplay = defaultValueSource;
    } else {
      sourceToDisplay = defaultValueSource.displayName ?? defaultValueSource.id;
    }
  }
  return sourceToDisplay;
}
__name(getDefaultValueSourceToDisplay, "getDefaultValueSourceToDisplay");
function getAccessibleScopeDisplayText(completeScope, languageService) {
  const [scope, language] = completeScope.split(":");
  const localizedScope = scope === "user" ? localize("user", "User") : scope === "workspace" ? localize("workspace", "Workspace") : localize("remote", "Remote");
  if (language) {
    return localize("modifiedInScopeForLanguage", "The {0} scope for {1}", localizedScope, languageService.getLanguageName(language));
  }
  return localizedScope;
}
__name(getAccessibleScopeDisplayText, "getAccessibleScopeDisplayText");
function getAccessibleScopeDisplayMidSentenceText(completeScope, languageService) {
  const [scope, language] = completeScope.split(":");
  const localizedScope = scope === "user" ? localize("user", "User") : scope === "workspace" ? localize("workspace", "Workspace") : localize("remote", "Remote");
  if (language) {
    return localize("modifiedInScopeForLanguageMidSentence", "the {0} scope for {1}", localizedScope.toLowerCase(), languageService.getLanguageName(language));
  }
  return localizedScope;
}
__name(getAccessibleScopeDisplayMidSentenceText, "getAccessibleScopeDisplayMidSentenceText");
function getIndicatorsLabelAriaLabel(element, configurationService, userDataProfilesService, languageService) {
  const ariaLabelSections = [];
  if (element.tags?.has("preview")) {
    ariaLabelSections.push(localize("previewLabel", "Preview"));
  } else if (element.tags?.has("experimental")) {
    ariaLabelSections.push(localize("experimentalLabel", "Experimental"));
  }
  if (element.tags?.has("advanced")) {
    ariaLabelSections.push(localize("advancedLabel", "Advanced"));
  }
  if (element.isUntrusted) {
    ariaLabelSections.push(localize("workspaceUntrustedAriaLabel", "Workspace untrusted; setting value not applied"));
  }
  if (element.hasPolicyValue) {
    ariaLabelSections.push(localize("policyDescriptionAccessible", "Managed by organization policy; setting value not applied"));
  } else if (element.settingsTarget === 3 && configurationService.isSettingAppliedForAllProfiles(element.setting.key)) {
    ariaLabelSections.push(localize("applicationSettingDescriptionAccessible", "Setting value retained when switching profiles"));
  } else {
    const otherOverridesStart = element.isConfigured ? localize("alsoConfiguredIn", "Also modified in") : localize("configuredIn", "Modified in");
    const otherOverridesList = element.overriddenScopeList.map((scope) => getAccessibleScopeDisplayMidSentenceText(scope, languageService)).join(", ");
    if (element.overriddenScopeList.length) {
      ariaLabelSections.push(`${otherOverridesStart} ${otherOverridesList}`);
    }
  }
  if (cachedSyncIgnoredSettingsSet.has(element.setting.key)) {
    ariaLabelSections.push(localize("syncIgnoredAriaLabel", "Setting ignored during sync"));
  }
  let sourceToDisplay = getDefaultValueSourceToDisplay(element);
  if (sourceToDisplay !== void 0) {
    if (Array.isArray(sourceToDisplay) && sourceToDisplay.length === 1) {
      sourceToDisplay = sourceToDisplay[0];
    }
    let overriddenDetailsText;
    if (!Array.isArray(sourceToDisplay)) {
      overriddenDetailsText = localize("defaultOverriddenDetailsAriaLabel", "{0} overrides the default value", sourceToDisplay);
    } else {
      overriddenDetailsText = localize("multipleDefaultOverriddenDetailsAriaLabel", "{0} override the default value", sourceToDisplay.slice(0, -1).join(", ") + " & " + sourceToDisplay.slice(-1));
    }
    ariaLabelSections.push(overriddenDetailsText);
  }
  const otherLanguageOverridesList = element.overriddenDefaultsLanguageList.map((language) => languageService.getLanguageName(language)).join(", ");
  if (element.overriddenDefaultsLanguageList.length) {
    const otherLanguageOverridesText = localize("defaultOverriddenLanguagesList", "Language-specific default values exist for {0}", otherLanguageOverridesList);
    ariaLabelSections.push(otherLanguageOverridesText);
  }
  const ariaLabel = ariaLabelSections.join(". ");
  return ariaLabel;
}
__name(getIndicatorsLabelAriaLabel, "getIndicatorsLabelAriaLabel");
var SettingScopeLink;
(function(SettingScopeLink2) {
  function create(scope) {
    return URI.from({
      scheme: Schemas.internal,
      path: "/",
      query: encodeURIComponent(scope)
    });
  }
  __name(create, "create");
  SettingScopeLink2.create = create;
  function parse(link) {
    const uri = URI.parse(link);
    return decodeURIComponent(uri.query);
  }
  __name(parse, "parse");
  SettingScopeLink2.parse = parse;
})(SettingScopeLink || (SettingScopeLink = {}));
export {
  SettingsTreeIndicatorsLabel,
  getIndicatorsLabelAriaLabel
};
//# sourceMappingURL=settingsEditorSettingIndicators.js.map
