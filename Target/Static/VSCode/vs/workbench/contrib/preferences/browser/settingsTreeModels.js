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
import * as arrays from "../../../../base/common/arrays.js";
import { escapeRegExpCharacters, isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { isUndefinedOrNull } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ConfigurationTarget, IConfigurationValue } from "../../../../platform/configuration/common/configuration.js";
import { SettingsTarget } from "./preferencesWidgets.js";
import { ITOCEntry, knownAcronyms, knownTermMappings, tocData } from "./settingsLayout.js";
import { ENABLE_EXTENSION_TOGGLE_SETTINGS, ENABLE_LANGUAGE_FILTER, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, compareTwoNullableNumbers } from "../common/preferences.js";
import { IExtensionSetting, ISearchResult, ISetting, ISettingMatch, SettingMatchType, SettingValueType } from "../../../services/preferences/common/preferences.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { FOLDER_SCOPES, WORKSPACE_SCOPES, REMOTE_MACHINE_SCOPES, LOCAL_MACHINE_SCOPES, IWorkbenchConfigurationService, APPLICATION_SCOPES } from "../../../services/configuration/common/configuration.js";
import { IJSONSchema } from "../../../../base/common/jsonSchema.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../base/common/event.js";
import { ConfigurationDefaultValueSource, ConfigurationScope, EditPresentationTypes, Extensions, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { USER_LOCAL_AND_REMOTE_SETTINGS } from "../../../../platform/request/common/request.js";
const ONLINE_SERVICES_SETTING_TAG = "usesOnlineServices";
class SettingsTreeElement extends Disposable {
  static {
    __name(this, "SettingsTreeElement");
  }
  id;
  parent;
  _tabbable = false;
  _onDidChangeTabbable = this._register(new Emitter());
  onDidChangeTabbable = this._onDidChangeTabbable.event;
  constructor(_id) {
    super();
    this.id = _id;
  }
  get tabbable() {
    return this._tabbable;
  }
  set tabbable(value) {
    this._tabbable = value;
    this._onDidChangeTabbable.fire();
  }
}
class SettingsTreeGroupElement extends SettingsTreeElement {
  static {
    __name(this, "SettingsTreeGroupElement");
  }
  count;
  label;
  level;
  isFirstGroup;
  _childSettingKeys = /* @__PURE__ */ new Set();
  _children = [];
  get children() {
    return this._children;
  }
  set children(newChildren) {
    this._children = newChildren;
    this._childSettingKeys = /* @__PURE__ */ new Set();
    this._children.forEach((child) => {
      if (child instanceof SettingsTreeSettingElement) {
        this._childSettingKeys.add(child.setting.key);
      }
    });
  }
  constructor(_id, count, label, level, isFirstGroup) {
    super(_id);
    this.count = count;
    this.label = label;
    this.level = level;
    this.isFirstGroup = isFirstGroup;
  }
  /**
   * Returns whether this group contains the given child key (to a depth of 1 only)
   */
  containsSetting(key) {
    return this._childSettingKeys.has(key);
  }
}
class SettingsTreeNewExtensionsElement extends SettingsTreeElement {
  constructor(_id, extensionIds) {
    super(_id);
    this.extensionIds = extensionIds;
  }
  static {
    __name(this, "SettingsTreeNewExtensionsElement");
  }
}
class SettingsTreeSettingElement extends SettingsTreeElement {
  constructor(setting, parent, settingsTarget, isWorkspaceTrusted, languageFilter, languageService, productService, userDataProfileService, configurationService) {
    super(sanitizeId(parent.id + "_" + setting.key));
    this.settingsTarget = settingsTarget;
    this.isWorkspaceTrusted = isWorkspaceTrusted;
    this.languageFilter = languageFilter;
    this.languageService = languageService;
    this.productService = productService;
    this.userDataProfileService = userDataProfileService;
    this.configurationService = configurationService;
    this.setting = setting;
    this.parent = parent;
    this.initSettingDescription();
    this.initSettingValueType();
  }
  static {
    __name(this, "SettingsTreeSettingElement");
  }
  static MAX_DESC_LINES = 20;
  setting;
  _displayCategory = null;
  _displayLabel = null;
  /**
   * scopeValue || defaultValue, for rendering convenience.
   */
  value;
  /**
   * The value in the current settings scope.
   */
  scopeValue;
  /**
   * The default value
   */
  defaultValue;
  /**
   * The source of the default value to display.
   * This value also accounts for extension-contributed language-specific default value overrides.
   */
  defaultValueSource;
  /**
   * Whether the setting is configured in the selected scope.
   */
  isConfigured = false;
  /**
   * Whether the setting requires trusted target
   */
  isUntrusted = false;
  /**
   * Whether the setting is under a policy that blocks all changes.
   */
  hasPolicyValue = false;
  tags;
  overriddenScopeList = [];
  overriddenDefaultsLanguageList = [];
  /**
   * For each language that contributes setting values or default overrides, we can see those values here.
   */
  languageOverrideValues = /* @__PURE__ */ new Map();
  description;
  valueType;
  get displayCategory() {
    if (!this._displayCategory) {
      this.initLabels();
    }
    return this._displayCategory;
  }
  get displayLabel() {
    if (!this._displayLabel) {
      this.initLabels();
    }
    return this._displayLabel;
  }
  initLabels() {
    if (this.setting.title) {
      this._displayLabel = this.setting.title;
      this._displayCategory = this.setting.categoryLabel ?? null;
      return;
    }
    const displayKeyFormat = settingKeyToDisplayFormat(this.setting.key, this.parent.id, this.setting.isLanguageTagSetting);
    this._displayLabel = displayKeyFormat.label;
    this._displayCategory = displayKeyFormat.category;
  }
  initSettingDescription() {
    if (this.setting.description.length > SettingsTreeSettingElement.MAX_DESC_LINES) {
      const truncatedDescLines = this.setting.description.slice(0, SettingsTreeSettingElement.MAX_DESC_LINES);
      truncatedDescLines.push("[...]");
      this.description = truncatedDescLines.join("\n");
    } else {
      this.description = this.setting.description.join("\n");
    }
  }
  initSettingValueType() {
    if (isExtensionToggleSetting(this.setting, this.productService)) {
      this.valueType = SettingValueType.ExtensionToggle;
    } else if (this.setting.enum && (!this.setting.type || settingTypeEnumRenderable(this.setting.type))) {
      this.valueType = SettingValueType.Enum;
    } else if (this.setting.type === "string") {
      if (this.setting.editPresentation === EditPresentationTypes.Multiline) {
        this.valueType = SettingValueType.MultilineString;
      } else {
        this.valueType = SettingValueType.String;
      }
    } else if (isExcludeSetting(this.setting)) {
      this.valueType = SettingValueType.Exclude;
    } else if (isIncludeSetting(this.setting)) {
      this.valueType = SettingValueType.Include;
    } else if (this.setting.type === "integer") {
      this.valueType = SettingValueType.Integer;
    } else if (this.setting.type === "number") {
      this.valueType = SettingValueType.Number;
    } else if (this.setting.type === "boolean") {
      this.valueType = SettingValueType.Boolean;
    } else if (this.setting.type === "array" && this.setting.arrayItemType && ["string", "enum", "number", "integer"].includes(this.setting.arrayItemType)) {
      this.valueType = SettingValueType.Array;
    } else if (Array.isArray(this.setting.type) && this.setting.type.includes(SettingValueType.Null) && this.setting.type.length === 2) {
      if (this.setting.type.includes(SettingValueType.Integer)) {
        this.valueType = SettingValueType.NullableInteger;
      } else if (this.setting.type.includes(SettingValueType.Number)) {
        this.valueType = SettingValueType.NullableNumber;
      } else {
        this.valueType = SettingValueType.Complex;
      }
    } else {
      const schemaType = getObjectSettingSchemaType(this.setting);
      if (schemaType) {
        if (this.setting.allKeysAreBoolean) {
          this.valueType = SettingValueType.BooleanObject;
        } else if (schemaType === "simple") {
          this.valueType = SettingValueType.Object;
        } else {
          this.valueType = SettingValueType.ComplexObject;
        }
      } else if (this.setting.isLanguageTagSetting) {
        this.valueType = SettingValueType.LanguageTag;
      } else {
        this.valueType = SettingValueType.Complex;
      }
    }
  }
  inspectSelf() {
    const targetToInspect = this.getTargetToInspect(this.setting);
    const inspectResult = inspectSetting(this.setting.key, targetToInspect, this.languageFilter, this.configurationService);
    this.update(inspectResult, this.isWorkspaceTrusted);
  }
  getTargetToInspect(setting) {
    if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
      if (setting.scope === ConfigurationScope.APPLICATION) {
        return ConfigurationTarget.APPLICATION;
      }
      if (this.configurationService.isSettingAppliedForAllProfiles(setting.key) && this.settingsTarget === ConfigurationTarget.USER_LOCAL) {
        return ConfigurationTarget.APPLICATION;
      }
    }
    return this.settingsTarget;
  }
  update(inspectResult, isWorkspaceTrusted) {
    let { isConfigured, inspected, targetSelector, inspectedLanguageOverrides, languageSelector } = inspectResult;
    switch (targetSelector) {
      case "workspaceFolderValue":
      case "workspaceValue":
        this.isUntrusted = !!this.setting.restricted && !isWorkspaceTrusted;
        break;
    }
    let displayValue = isConfigured ? inspected[targetSelector] : inspected.defaultValue;
    const overriddenScopeList = [];
    const overriddenDefaultsLanguageList = [];
    if ((languageSelector || targetSelector !== "workspaceValue") && typeof inspected.workspaceValue !== "undefined") {
      overriddenScopeList.push("workspace:");
    }
    if ((languageSelector || targetSelector !== "userRemoteValue") && typeof inspected.userRemoteValue !== "undefined") {
      overriddenScopeList.push("remote:");
    }
    if ((languageSelector || targetSelector !== "userLocalValue") && typeof inspected.userLocalValue !== "undefined") {
      overriddenScopeList.push("user:");
    }
    if (inspected.overrideIdentifiers) {
      for (const overrideIdentifier of inspected.overrideIdentifiers) {
        const inspectedOverride = inspectedLanguageOverrides.get(overrideIdentifier);
        if (inspectedOverride) {
          if (this.languageService.isRegisteredLanguageId(overrideIdentifier)) {
            if (languageSelector !== overrideIdentifier && typeof inspectedOverride.default?.override !== "undefined") {
              overriddenDefaultsLanguageList.push(overrideIdentifier);
            }
            if ((languageSelector !== overrideIdentifier || targetSelector !== "workspaceValue") && typeof inspectedOverride.workspace?.override !== "undefined") {
              overriddenScopeList.push(`workspace:${overrideIdentifier}`);
            }
            if ((languageSelector !== overrideIdentifier || targetSelector !== "userRemoteValue") && typeof inspectedOverride.userRemote?.override !== "undefined") {
              overriddenScopeList.push(`remote:${overrideIdentifier}`);
            }
            if ((languageSelector !== overrideIdentifier || targetSelector !== "userLocalValue") && typeof inspectedOverride.userLocal?.override !== "undefined") {
              overriddenScopeList.push(`user:${overrideIdentifier}`);
            }
          }
          this.languageOverrideValues.set(overrideIdentifier, inspectedOverride);
        }
      }
    }
    this.overriddenScopeList = overriddenScopeList;
    this.overriddenDefaultsLanguageList = overriddenDefaultsLanguageList;
    this.defaultValueSource = this.setting.nonLanguageSpecificDefaultValueSource;
    if (inspected.policyValue !== void 0) {
      this.hasPolicyValue = true;
      isConfigured = false;
      displayValue = inspected.policyValue;
      this.scopeValue = inspected.policyValue;
      this.defaultValue = inspected.defaultValue;
    } else if (languageSelector && this.languageOverrideValues.has(languageSelector)) {
      const overrideValues = this.languageOverrideValues.get(languageSelector);
      displayValue = (isConfigured ? overrideValues[targetSelector] : overrideValues.defaultValue) ?? displayValue;
      this.scopeValue = isConfigured && overrideValues[targetSelector];
      this.defaultValue = overrideValues.defaultValue ?? inspected.defaultValue;
      const registryValues = Registry.as(Extensions.Configuration).getConfigurationDefaultsOverrides();
      const source = registryValues.get(`[${languageSelector}]`)?.source;
      const overrideValueSource = source instanceof Map ? source.get(this.setting.key) : void 0;
      if (overrideValueSource) {
        this.defaultValueSource = overrideValueSource;
      }
    } else {
      this.scopeValue = isConfigured && inspected[targetSelector];
      this.defaultValue = inspected.defaultValue;
    }
    this.value = displayValue;
    this.isConfigured = isConfigured;
    if (isConfigured || this.setting.tags || this.tags || this.setting.restricted || this.hasPolicyValue) {
      this.tags = /* @__PURE__ */ new Set();
      if (isConfigured) {
        this.tags.add(MODIFIED_SETTING_TAG);
      }
      this.setting.tags?.forEach((tag) => this.tags.add(tag));
      if (this.setting.restricted) {
        this.tags.add(REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG);
      }
      if (this.hasPolicyValue) {
        this.tags.add(POLICY_SETTING_TAG);
      }
    }
  }
  matchesAllTags(tagFilters) {
    if (!tagFilters?.size) {
      return true;
    }
    if (!this.tags) {
      this.inspectSelf();
    }
    return !!this.tags?.size && Array.from(tagFilters).every((tag) => this.tags.has(tag));
  }
  matchesScope(scope, isRemote) {
    const configTarget = URI.isUri(scope) ? ConfigurationTarget.WORKSPACE_FOLDER : scope;
    if (!this.setting.scope) {
      return true;
    }
    if (configTarget === ConfigurationTarget.APPLICATION) {
      return APPLICATION_SCOPES.includes(this.setting.scope);
    }
    if (configTarget === ConfigurationTarget.WORKSPACE_FOLDER) {
      return FOLDER_SCOPES.includes(this.setting.scope);
    }
    if (configTarget === ConfigurationTarget.WORKSPACE) {
      return WORKSPACE_SCOPES.includes(this.setting.scope);
    }
    if (configTarget === ConfigurationTarget.USER_REMOTE) {
      return REMOTE_MACHINE_SCOPES.includes(this.setting.scope) || USER_LOCAL_AND_REMOTE_SETTINGS.includes(this.setting.key);
    }
    if (configTarget === ConfigurationTarget.USER_LOCAL) {
      if (isRemote) {
        return LOCAL_MACHINE_SCOPES.includes(this.setting.scope) || USER_LOCAL_AND_REMOTE_SETTINGS.includes(this.setting.key);
      }
    }
    return true;
  }
  matchesAnyExtension(extensionFilters) {
    if (!extensionFilters || !extensionFilters.size) {
      return true;
    }
    if (!this.setting.extensionInfo) {
      return false;
    }
    return Array.from(extensionFilters).some((extensionId) => extensionId.toLowerCase() === this.setting.extensionInfo.id.toLowerCase());
  }
  matchesAnyFeature(featureFilters) {
    if (!featureFilters || !featureFilters.size) {
      return true;
    }
    const features = tocData.children.find((child) => child.id === "features");
    return Array.from(featureFilters).some((filter) => {
      if (features && features.children) {
        const feature = features.children.find((feature2) => "features/" + filter === feature2.id);
        if (feature) {
          const patterns = feature.settings?.map((setting) => createSettingMatchRegExp(setting));
          return patterns && !this.setting.extensionInfo && patterns.some((pattern) => pattern.test(this.setting.key.toLowerCase()));
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  }
  matchesAnyId(idFilters) {
    if (!idFilters || !idFilters.size) {
      return true;
    }
    return idFilters.has(this.setting.key);
  }
  matchesAllLanguages(languageFilter) {
    if (!languageFilter) {
      return true;
    }
    if (!this.languageService.isRegisteredLanguageId(languageFilter)) {
      return false;
    }
    if (this.setting.scope === ConfigurationScope.LANGUAGE_OVERRIDABLE) {
      return true;
    }
    return false;
  }
}
function createSettingMatchRegExp(pattern) {
  pattern = escapeRegExpCharacters(pattern).replace(/\\\*/g, ".*");
  return new RegExp(`^${pattern}$`, "i");
}
__name(createSettingMatchRegExp, "createSettingMatchRegExp");
let SettingsTreeModel = class {
  constructor(_viewState, _isWorkspaceTrusted, _configurationService, _languageService, _userDataProfileService, _productService) {
    this._viewState = _viewState;
    this._isWorkspaceTrusted = _isWorkspaceTrusted;
    this._configurationService = _configurationService;
    this._languageService = _languageService;
    this._userDataProfileService = _userDataProfileService;
    this._productService = _productService;
  }
  static {
    __name(this, "SettingsTreeModel");
  }
  _root;
  _tocRoot;
  _treeElementsBySettingName = /* @__PURE__ */ new Map();
  get root() {
    return this._root;
  }
  update(newTocRoot = this._tocRoot) {
    this._treeElementsBySettingName.clear();
    const newRoot = this.createSettingsTreeGroupElement(newTocRoot);
    if (newRoot.children[0] instanceof SettingsTreeGroupElement) {
      newRoot.children[0].isFirstGroup = true;
    }
    if (this._root) {
      this.disposeChildren(this._root.children);
      this._root.children = newRoot.children;
      newRoot.dispose();
    } else {
      this._root = newRoot;
    }
  }
  updateWorkspaceTrust(workspaceTrusted) {
    this._isWorkspaceTrusted = workspaceTrusted;
    this.updateRequireTrustedTargetElements();
  }
  disposeChildren(children) {
    for (const child of children) {
      this.disposeChildAndRecurse(child);
    }
  }
  disposeChildAndRecurse(element) {
    if (element instanceof SettingsTreeGroupElement) {
      this.disposeChildren(element.children);
    }
    element.dispose();
  }
  getElementsByName(name) {
    return this._treeElementsBySettingName.get(name) ?? null;
  }
  updateElementsByName(name) {
    if (!this._treeElementsBySettingName.has(name)) {
      return;
    }
    this.reinspectSettings(this._treeElementsBySettingName.get(name));
  }
  updateRequireTrustedTargetElements() {
    this.reinspectSettings([...this._treeElementsBySettingName.values()].flat().filter((s) => s.isUntrusted));
  }
  reinspectSettings(settings) {
    for (const element of settings) {
      element.inspectSelf();
    }
  }
  createSettingsTreeGroupElement(tocEntry, parent) {
    const depth = parent ? this.getDepth(parent) + 1 : 0;
    const element = new SettingsTreeGroupElement(tocEntry.id, void 0, tocEntry.label, depth, false);
    element.parent = parent;
    const children = [];
    if (tocEntry.settings) {
      const settingChildren = tocEntry.settings.map((s) => this.createSettingsTreeSettingElement(s, element));
      for (const child of settingChildren) {
        if (!child.setting.deprecationMessage) {
          children.push(child);
        } else {
          child.inspectSelf();
          if (child.isConfigured) {
            children.push(child);
          } else {
            child.dispose();
          }
        }
      }
    }
    if (tocEntry.children) {
      const groupChildren = tocEntry.children.map((child) => this.createSettingsTreeGroupElement(child, element));
      children.push(...groupChildren);
    }
    element.children = children;
    return element;
  }
  getDepth(element) {
    if (element.parent) {
      return 1 + this.getDepth(element.parent);
    } else {
      return 0;
    }
  }
  createSettingsTreeSettingElement(setting, parent) {
    const element = new SettingsTreeSettingElement(
      setting,
      parent,
      this._viewState.settingsTarget,
      this._isWorkspaceTrusted,
      this._viewState.languageFilter,
      this._languageService,
      this._productService,
      this._userDataProfileService,
      this._configurationService
    );
    const nameElements = this._treeElementsBySettingName.get(setting.key) ?? [];
    nameElements.push(element);
    this._treeElementsBySettingName.set(setting.key, nameElements);
    return element;
  }
  dispose() {
    this._treeElementsBySettingName.clear();
    this.disposeChildAndRecurse(this._root);
  }
};
SettingsTreeModel = __decorateClass([
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IUserDataProfileService),
  __decorateParam(5, IProductService)
], SettingsTreeModel);
function inspectSetting(key, target, languageFilter, configurationService) {
  const inspectOverrides = URI.isUri(target) ? { resource: target } : void 0;
  const inspected = configurationService.inspect(key, inspectOverrides);
  const targetSelector = target === ConfigurationTarget.APPLICATION ? "applicationValue" : target === ConfigurationTarget.USER_LOCAL ? "userLocalValue" : target === ConfigurationTarget.USER_REMOTE ? "userRemoteValue" : target === ConfigurationTarget.WORKSPACE ? "workspaceValue" : "workspaceFolderValue";
  const targetOverrideSelector = target === ConfigurationTarget.APPLICATION ? "application" : target === ConfigurationTarget.USER_LOCAL ? "userLocal" : target === ConfigurationTarget.USER_REMOTE ? "userRemote" : target === ConfigurationTarget.WORKSPACE ? "workspace" : "workspaceFolder";
  let isConfigured = typeof inspected[targetSelector] !== "undefined";
  const overrideIdentifiers = inspected.overrideIdentifiers;
  const inspectedLanguageOverrides = /* @__PURE__ */ new Map();
  if (languageFilter) {
    isConfigured = false;
  }
  if (overrideIdentifiers) {
    for (const overrideIdentifier of overrideIdentifiers) {
      inspectedLanguageOverrides.set(overrideIdentifier, configurationService.inspect(key, { overrideIdentifier }));
    }
    if (languageFilter) {
      if (inspectedLanguageOverrides.has(languageFilter)) {
        const overrideValue = inspectedLanguageOverrides.get(languageFilter)[targetOverrideSelector]?.override;
        if (typeof overrideValue !== "undefined") {
          isConfigured = true;
        }
      }
    }
  }
  return { isConfigured, inspected, targetSelector, inspectedLanguageOverrides, languageSelector: languageFilter };
}
__name(inspectSetting, "inspectSetting");
function sanitizeId(id) {
  return id.replace(/[\.\/]/, "_");
}
__name(sanitizeId, "sanitizeId");
function settingKeyToDisplayFormat(key, groupId = "", isLanguageTagSetting = false) {
  const lastDotIdx = key.lastIndexOf(".");
  let category = "";
  if (lastDotIdx >= 0) {
    category = key.substring(0, lastDotIdx);
    key = key.substring(lastDotIdx + 1);
  }
  groupId = groupId.replace(/\//g, ".");
  category = trimCategoryForGroup(category, groupId);
  category = wordifyKey(category);
  if (isLanguageTagSetting) {
    key = key.replace(/[\[\]]/g, "");
    key = "$(bracket) " + key;
  }
  const label = wordifyKey(key);
  return { category, label };
}
__name(settingKeyToDisplayFormat, "settingKeyToDisplayFormat");
function wordifyKey(key) {
  key = key.replace(/\.([a-z0-9])/g, (_, p1) => ` \u203A ${p1.toUpperCase()}`).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^[a-z]/g, (match) => match.toUpperCase()).replace(/\b\w+\b/g, (match) => {
    return knownAcronyms.has(match.toLowerCase()) ? match.toUpperCase() : match;
  });
  for (const [k, v] of knownTermMappings) {
    key = key.replace(new RegExp(`\\b${k}\\b`, "gi"), v);
  }
  return key;
}
__name(wordifyKey, "wordifyKey");
function trimCategoryForGroup(category, groupId) {
  const doTrim = /* @__PURE__ */ __name((forward) => {
    if (!/insiders$/i.test(category)) {
      groupId = groupId.replace(/-?insiders$/i, "");
    }
    const parts = groupId.split(".").map((part) => {
      if (part.replace(/-/g, "").toLowerCase() === category.toLowerCase()) {
        return part.replace(/-/g, "");
      } else {
        return part;
      }
    });
    while (parts.length) {
      const reg = new RegExp(`^${parts.join("\\.")}(\\.|$)`, "i");
      if (reg.test(category)) {
        return category.replace(reg, "");
      }
      if (forward) {
        parts.pop();
      } else {
        parts.shift();
      }
    }
    return null;
  }, "doTrim");
  let trimmed = doTrim(true);
  if (trimmed === null) {
    trimmed = doTrim(false);
  }
  if (trimmed === null) {
    trimmed = category;
  }
  return trimmed;
}
__name(trimCategoryForGroup, "trimCategoryForGroup");
function isExtensionToggleSetting(setting, productService) {
  return ENABLE_EXTENSION_TOGGLE_SETTINGS && !!productService.extensionRecommendations && !!setting.displayExtensionId;
}
__name(isExtensionToggleSetting, "isExtensionToggleSetting");
function isExcludeSetting(setting) {
  return setting.key === "files.exclude" || setting.key === "search.exclude" || setting.key === "workbench.localHistory.exclude" || setting.key === "explorer.autoRevealExclude" || setting.key === "files.readonlyExclude" || setting.key === "files.watcherExclude";
}
__name(isExcludeSetting, "isExcludeSetting");
function isIncludeSetting(setting) {
  return setting.key === "files.readonlyInclude";
}
__name(isIncludeSetting, "isIncludeSetting");
function objectSettingSupportsRemoveDefaultValue(key) {
  return key === "workbench.editor.customLabels.patterns";
}
__name(objectSettingSupportsRemoveDefaultValue, "objectSettingSupportsRemoveDefaultValue");
function isSimpleType(type) {
  return type === "string" || type === "boolean" || type === "integer" || type === "number";
}
__name(isSimpleType, "isSimpleType");
function getObjectRenderableSchemaType(schema, key) {
  const { type } = schema;
  if (Array.isArray(type)) {
    if (objectSettingSupportsRemoveDefaultValue(key) && type.length === 2) {
      if (type.includes("null") && (type.includes("string") || type.includes("boolean") || type.includes("integer") || type.includes("number"))) {
        return "simple";
      }
    }
    for (const t of type) {
      if (!isSimpleType(t)) {
        return false;
      }
    }
    return "complex";
  }
  if (isSimpleType(type)) {
    return "simple";
  }
  if (type === "array") {
    if (schema.items) {
      const itemSchemas = Array.isArray(schema.items) ? schema.items : [schema.items];
      for (const { type: type2 } of itemSchemas) {
        if (Array.isArray(type2)) {
          for (const t of type2) {
            if (!isSimpleType(t)) {
              return false;
            }
          }
          return "complex";
        }
        if (!isSimpleType(type2)) {
          return false;
        }
        return "complex";
      }
    }
    return false;
  }
  return false;
}
__name(getObjectRenderableSchemaType, "getObjectRenderableSchemaType");
function getObjectSettingSchemaType({
  key,
  type,
  objectProperties,
  objectPatternProperties,
  objectAdditionalProperties
}) {
  if (type !== "object") {
    return false;
  }
  if (isUndefinedOrNull(objectProperties) && isUndefinedOrNull(objectPatternProperties) && isUndefinedOrNull(objectAdditionalProperties)) {
    return false;
  }
  if ((objectAdditionalProperties === true || objectAdditionalProperties === void 0) && !Object.keys(objectPatternProperties ?? {}).includes(".*")) {
    return false;
  }
  const schemas = [...Object.values(objectProperties ?? {}), ...Object.values(objectPatternProperties ?? {})];
  if (objectAdditionalProperties && typeof objectAdditionalProperties === "object") {
    schemas.push(objectAdditionalProperties);
  }
  let schemaType = "simple";
  for (const schema of schemas) {
    for (const subSchema of Array.isArray(schema.anyOf) ? schema.anyOf : [schema]) {
      const subSchemaType = getObjectRenderableSchemaType(subSchema, key);
      if (subSchemaType === false) {
        return false;
      }
      if (subSchemaType === "complex") {
        schemaType = "complex";
      }
    }
  }
  return schemaType;
}
__name(getObjectSettingSchemaType, "getObjectSettingSchemaType");
function settingTypeEnumRenderable(_type) {
  const enumRenderableSettingTypes = ["string", "boolean", "null", "integer", "number"];
  const type = Array.isArray(_type) ? _type : [_type];
  return type.every((type2) => enumRenderableSettingTypes.includes(type2));
}
__name(settingTypeEnumRenderable, "settingTypeEnumRenderable");
var SearchResultIdx = /* @__PURE__ */ ((SearchResultIdx2) => {
  SearchResultIdx2[SearchResultIdx2["Local"] = 0] = "Local";
  SearchResultIdx2[SearchResultIdx2["Remote"] = 1] = "Remote";
  SearchResultIdx2[SearchResultIdx2["NewExtensions"] = 2] = "NewExtensions";
  return SearchResultIdx2;
})(SearchResultIdx || {});
let SearchResultModel = class extends SettingsTreeModel {
  constructor(viewState, settingsOrderByTocIndex, isWorkspaceTrusted, configurationService, environmentService, languageService, userDataProfileService, productService) {
    super(viewState, isWorkspaceTrusted, configurationService, languageService, userDataProfileService, productService);
    this.environmentService = environmentService;
    this.settingsOrderByTocIndex = settingsOrderByTocIndex;
    this.update({ id: "searchResultModel", label: "" });
  }
  static {
    __name(this, "SearchResultModel");
  }
  rawSearchResults = null;
  cachedUniqueSearchResults = null;
  newExtensionSearchResults = null;
  searchResultCount = null;
  settingsOrderByTocIndex;
  id = "searchResultModel";
  sortResults(filterMatches) {
    if (this.settingsOrderByTocIndex) {
      for (const match of filterMatches) {
        match.setting.internalOrder = this.settingsOrderByTocIndex.get(match.setting.key);
      }
    }
    if (!this._viewState.query) {
      return filterMatches.sort((a, b) => compareTwoNullableNumbers(a.setting.internalOrder, b.setting.internalOrder));
    }
    filterMatches.sort((a, b) => {
      if (a.matchType !== b.matchType) {
        return b.matchType - a.matchType;
      } else if (a.matchType & SettingMatchType.NonContiguousWordsInSettingsLabel || a.matchType & SettingMatchType.ContiguousWordsInSettingsLabel) {
        return b.keyMatchScore - a.keyMatchScore || compareTwoNullableNumbers(a.setting.internalOrder, b.setting.internalOrder);
      } else if (a.matchType === SettingMatchType.RemoteMatch) {
        return b.score - a.score;
      } else {
        return compareTwoNullableNumbers(a.setting.internalOrder, b.setting.internalOrder);
      }
    });
    return arrays.distinct(filterMatches, (match) => match.setting.key);
  }
  getUniqueResults() {
    if (this.cachedUniqueSearchResults) {
      return this.cachedUniqueSearchResults;
    }
    if (!this.rawSearchResults) {
      return null;
    }
    let combinedFilterMatches = [];
    const localMatchKeys = /* @__PURE__ */ new Set();
    const localResult = this.rawSearchResults[0 /* Local */];
    if (localResult) {
      localResult.filterMatches.forEach((m) => localMatchKeys.add(m.setting.key));
      combinedFilterMatches = localResult.filterMatches;
    }
    const remoteResult = this.rawSearchResults[1 /* Remote */];
    if (remoteResult) {
      remoteResult.filterMatches = remoteResult.filterMatches.filter((m) => !localMatchKeys.has(m.setting.key));
      combinedFilterMatches = combinedFilterMatches.concat(remoteResult.filterMatches);
      this.newExtensionSearchResults = this.rawSearchResults[2 /* NewExtensions */];
    }
    combinedFilterMatches = this.sortResults(combinedFilterMatches);
    this.cachedUniqueSearchResults = {
      filterMatches: combinedFilterMatches,
      exactMatch: localResult.exactMatch
      // remote results should never have an exact match
    };
    return this.cachedUniqueSearchResults;
  }
  getRawResults() {
    return this.rawSearchResults ?? [];
  }
  setResult(order, result) {
    this.cachedUniqueSearchResults = null;
    this.newExtensionSearchResults = null;
    this.rawSearchResults ??= [];
    if (!result) {
      delete this.rawSearchResults[order];
      return;
    }
    this.rawSearchResults[order] = result;
    this.updateChildren();
  }
  updateChildren() {
    this.update({
      id: "searchResultModel",
      label: "searchResultModel",
      settings: this.getFlatSettings()
    });
    const isRemote = !!this.environmentService.remoteAuthority;
    const newChildren = [];
    for (const child of this.root.children) {
      if (child instanceof SettingsTreeSettingElement && child.matchesAllTags(this._viewState.tagFilters) && child.matchesScope(this._viewState.settingsTarget, isRemote) && child.matchesAnyExtension(this._viewState.extensionFilters) && child.matchesAnyId(this._viewState.idFilters) && child.matchesAnyFeature(this._viewState.featureFilters) && child.matchesAllLanguages(this._viewState.languageFilter)) {
        newChildren.push(child);
      } else {
        child.dispose();
      }
    }
    this.root.children = newChildren;
    this.searchResultCount = this.root.children.length;
    if (this.newExtensionSearchResults?.filterMatches.length) {
      let resultExtensionIds = this.newExtensionSearchResults.filterMatches.map((result) => result.setting).filter((setting) => setting.extensionName && setting.extensionPublisher).map((setting) => `${setting.extensionPublisher}.${setting.extensionName}`);
      resultExtensionIds = arrays.distinct(resultExtensionIds);
      if (resultExtensionIds.length) {
        const newExtElement = new SettingsTreeNewExtensionsElement("newExtensions", resultExtensionIds);
        newExtElement.parent = this._root;
        this._root.children.push(newExtElement);
      }
    }
  }
  getUniqueResultsCount() {
    return this.searchResultCount ?? 0;
  }
  getFlatSettings() {
    return this.getUniqueResults()?.filterMatches.map((m) => m.setting) ?? [];
  }
};
SearchResultModel = __decorateClass([
  __decorateParam(3, IWorkbenchConfigurationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IUserDataProfileService),
  __decorateParam(7, IProductService)
], SearchResultModel);
const tagRegex = /(^|\s)@tag:("([^"]*)"|[^"]\S*)/g;
const extensionRegex = /(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g;
const featureRegex = /(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g;
const idRegex = /(^|\s)@id:("([^"]*)"|[^"]\S*)?/g;
const languageRegex = /(^|\s)@lang:("([^"]*)"|[^"]\S*)?/g;
function parseQuery(query) {
  function getTagsForType(query2, filterRegex, parsedParts) {
    return query2.replace(filterRegex, (_, __, quotedParsedElement, unquotedParsedElement) => {
      const parsedElement = unquotedParsedElement || quotedParsedElement;
      if (parsedElement) {
        parsedParts.push(...parsedElement.split(",").map((s) => s.trim()).filter((s) => !isFalsyOrWhitespace(s)));
      }
      return "";
    });
  }
  __name(getTagsForType, "getTagsForType");
  const tags = [];
  query = query.replace(tagRegex, (_, __, quotedTag, tag) => {
    tags.push(tag || quotedTag);
    return "";
  });
  query = query.replace(`@${MODIFIED_SETTING_TAG}`, () => {
    tags.push(MODIFIED_SETTING_TAG);
    return "";
  });
  query = query.replace(`@${POLICY_SETTING_TAG}`, () => {
    tags.push(POLICY_SETTING_TAG);
    return "";
  });
  const extensions = [];
  const features = [];
  const ids = [];
  const langs = [];
  query = getTagsForType(query, extensionRegex, extensions);
  query = getTagsForType(query, featureRegex, features);
  query = getTagsForType(query, idRegex, ids);
  if (ENABLE_LANGUAGE_FILTER) {
    query = getTagsForType(query, languageRegex, langs);
  }
  query = query.trim();
  return {
    tags,
    extensionFilters: extensions,
    featureFilters: features,
    idFilters: ids,
    languageFilter: langs.length ? langs[0] : void 0,
    query
  };
}
__name(parseQuery, "parseQuery");
export {
  ONLINE_SERVICES_SETTING_TAG,
  SearchResultIdx,
  SearchResultModel,
  SettingsTreeElement,
  SettingsTreeGroupElement,
  SettingsTreeModel,
  SettingsTreeNewExtensionsElement,
  SettingsTreeSettingElement,
  inspectSetting,
  objectSettingSupportsRemoveDefaultValue,
  parseQuery,
  settingKeyToDisplayFormat
};
//# sourceMappingURL=settingsTreeModels.js.map
