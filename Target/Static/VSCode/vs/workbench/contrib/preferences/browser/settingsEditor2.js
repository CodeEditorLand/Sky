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
import * as DOM from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { ITreeElement } from "../../../../base/browser/ui/tree/tree.js";
import { Action } from "../../../../base/common/actions.js";
import { Delayer, raceTimeout } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { fromNow } from "../../../../base/common/date.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { Disposable, DisposableStore, dispose, MutableDisposable } from "../../../../base/common/lifecycle.js";
import * as platform from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import "./media/settingsEditor2.css";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ConfigurationTarget, IConfigurationUpdateOverrides } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { asCssVariable, badgeBackground, badgeForeground, contrastBorder, editorForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IUserDataSyncEnablementService, IUserDataSyncService, SyncStatus } from "../../../../platform/userDataSync/common/userDataSync.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { IEditorMemento, IEditorOpenContext, IEditorPane } from "../../../common/editor.js";
import { SuggestEnabledInput } from "../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";
import { SettingsTarget, SettingsTargetsWidget } from "./preferencesWidgets.js";
import { ITOCEntry, getCommonlyUsedData, tocData } from "./settingsLayout.js";
import { AbstractSettingRenderer, HeightChangeParams, ISettingLinkClickEvent, resolveConfiguredUntrustedSettings, createTocTreeForExtensionSettings, resolveSettingsTree, SettingsTree, SettingTreeRenderers } from "./settingsTree.js";
import { ISettingsEditorViewState, parseQuery, SearchResultIdx, SearchResultModel, SettingsTreeElement, SettingsTreeGroupChild, SettingsTreeGroupElement, SettingsTreeModel, SettingsTreeSettingElement } from "./settingsTreeModels.js";
import { createTOCIterator, TOCTree, TOCTreeModel } from "./tocTree.js";
import { CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, ENABLE_LANGUAGE_FILTER, EXTENSION_FETCH_TIMEOUT_MS, EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, ID_SETTING_TAG, IPreferencesSearchService, ISearchProvider, LANGUAGE_SETTING_TAG, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS, WORKSPACE_TRUST_SETTING_TAG, getExperimentalExtensionToggleData } from "../common/preferences.js";
import { settingsHeaderBorder, settingsSashBorder, settingsTextInputBorder } from "../common/settingsEditorColorRegistry.js";
import { IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IOpenSettingsOptions, IPreferencesService, ISearchResult, ISetting, ISettingsEditorModel, ISettingsEditorOptions, ISettingsGroup, SettingMatchType, SettingValueType, validateSettingsEditorOptions } from "../../../services/preferences/common/preferences.js";
import { SettingsEditor2Input } from "../../../services/preferences/common/preferencesEditorInput.js";
import { Settings2EditorModel, nullRange } from "../../../services/preferences/common/preferencesModels.js";
import { IUserDataSyncWorkbenchService } from "../../../services/userDataSync/common/userDataSync.js";
import { preferencesClearInputIcon, preferencesFilterIcon } from "./preferencesIcons.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { APPLICATION_SCOPES, IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { Orientation, Sizing, SplitView } from "../../../../base/browser/ui/splitview/splitview.js";
import { Color } from "../../../../base/common/color.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { SettingsSearchFilterDropdownMenuActionViewItem } from "./settingsSearchMenu.js";
import { IExtensionGalleryService, IExtensionManagementService, IGalleryExtension } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ISettingOverrideClickEvent } from "./settingsEditorSettingIndicators.js";
import { ConfigurationScope, Extensions, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { registerNavigableContainer } from "../../../browser/actions/widgetNavigationCommands.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { IExtensionManifest } from "../../../../platform/extensions/common/extensions.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
var SettingsFocusContext = /* @__PURE__ */ ((SettingsFocusContext2) => {
  SettingsFocusContext2[SettingsFocusContext2["Search"] = 0] = "Search";
  SettingsFocusContext2[SettingsFocusContext2["TableOfContents"] = 1] = "TableOfContents";
  SettingsFocusContext2[SettingsFocusContext2["SettingTree"] = 2] = "SettingTree";
  SettingsFocusContext2[SettingsFocusContext2["SettingControl"] = 3] = "SettingControl";
  return SettingsFocusContext2;
})(SettingsFocusContext || {});
function createGroupIterator(group) {
  return Iterable.map(group.children, (g) => {
    return {
      element: g,
      children: g instanceof SettingsTreeGroupElement ? createGroupIterator(g) : void 0
    };
  });
}
__name(createGroupIterator, "createGroupIterator");
const $ = DOM.$;
const searchBoxLabel = localize("SearchSettings.AriaLabel", "Search settings");
const SEARCH_TOC_BEHAVIOR_KEY = "workbench.settings.settingsSearchTocBehavior";
const SETTINGS_EDITOR_STATE_KEY = "settingsEditorState";
let SettingsEditor2 = class extends EditorPane {
  constructor(group, telemetryService, configurationService, textResourceConfigurationService, themeService, preferencesService, instantiationService, preferencesSearchService, logService, contextKeyService, storageService, editorGroupService, userDataSyncWorkbenchService, userDataSyncEnablementService, workspaceTrustManagementService, extensionService, languageService, extensionManagementService, productService, extensionGalleryService, editorProgressService, userDataProfileService) {
    super(SettingsEditor2.ID, group, telemetryService, themeService, storageService);
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this.instantiationService = instantiationService;
    this.preferencesSearchService = preferencesSearchService;
    this.logService = logService;
    this.storageService = storageService;
    this.editorGroupService = editorGroupService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.extensionService = extensionService;
    this.languageService = languageService;
    this.extensionManagementService = extensionManagementService;
    this.productService = productService;
    this.extensionGalleryService = extensionGalleryService;
    this.editorProgressService = editorProgressService;
    this.searchDelayer = new Delayer(300);
    this.viewState = { settingsTarget: ConfigurationTarget.USER_LOCAL };
    this.settingFastUpdateDelayer = new Delayer(SettingsEditor2.SETTING_UPDATE_FAST_DEBOUNCE);
    this.settingSlowUpdateDelayer = new Delayer(SettingsEditor2.SETTING_UPDATE_SLOW_DEBOUNCE);
    this.searchInputDelayer = new Delayer(SettingsEditor2.SEARCH_DEBOUNCE);
    this.updatedConfigSchemaDelayer = new Delayer(SettingsEditor2.CONFIG_SCHEMA_UPDATE_DELAYER);
    this.inSettingsEditorContextKey = CONTEXT_SETTINGS_EDITOR.bindTo(contextKeyService);
    this.searchFocusContextKey = CONTEXT_SETTINGS_SEARCH_FOCUS.bindTo(contextKeyService);
    this.tocRowFocused = CONTEXT_TOC_ROW_FOCUS.bindTo(contextKeyService);
    this.settingRowFocused = CONTEXT_SETTINGS_ROW_FOCUS.bindTo(contextKeyService);
    this.scheduledRefreshes = /* @__PURE__ */ new Map();
    this.editorMemento = this.getEditorMemento(editorGroupService, textResourceConfigurationService, SETTINGS_EDITOR_STATE_KEY);
    this.dismissedExtensionSettings = this.storageService.get(this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY, StorageScope.PROFILE, "").split(this.DISMISSED_EXTENSION_SETTINGS_DELIMITER);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.source !== ConfigurationTarget.DEFAULT) {
        this.onConfigUpdate(e.affectedKeys);
      }
    }));
    this._register(userDataProfileService.onDidChangeCurrentProfile((e) => {
      e.join(this.whenCurrentProfileChanged());
    }));
    this._register(workspaceTrustManagementService.onDidChangeTrust(() => {
      this.searchResultModel?.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
      if (this.settingsTreeModel.value) {
        this.settingsTreeModel.value.updateWorkspaceTrust(workspaceTrustManagementService.isWorkspaceTrusted());
        this.renderTree();
      }
    }));
    this._register(configurationService.onDidChangeRestrictedSettings((e) => {
      if (e.default.length && this.currentSettingsModel) {
        this.updateElementsByKey(new Set(e.default));
      }
    }));
    this._register(extensionManagementService.onDidInstallExtensions(() => {
      this.refreshInstalledExtensionsList();
    }));
    this._register(extensionManagementService.onDidUninstallExtension(() => {
      this.refreshInstalledExtensionsList();
    }));
    this.modelDisposables = this._register(new DisposableStore());
    if (ENABLE_LANGUAGE_FILTER && !SettingsEditor2.SUGGESTIONS.includes(`@${LANGUAGE_SETTING_TAG}`)) {
      SettingsEditor2.SUGGESTIONS.push(`@${LANGUAGE_SETTING_TAG}`);
    }
    this.inputChangeListener = this._register(new MutableDisposable());
  }
  static {
    __name(this, "SettingsEditor2");
  }
  static ID = "workbench.editor.settings2";
  static NUM_INSTANCES = 0;
  static SEARCH_DEBOUNCE = 200;
  static SETTING_UPDATE_FAST_DEBOUNCE = 200;
  static SETTING_UPDATE_SLOW_DEBOUNCE = 1e3;
  static CONFIG_SCHEMA_UPDATE_DELAYER = 500;
  static TOC_MIN_WIDTH = 100;
  static TOC_RESET_WIDTH = 200;
  static EDITOR_MIN_WIDTH = 500;
  // Below NARROW_TOTAL_WIDTH, we only render the editor rather than the ToC.
  static NARROW_TOTAL_WIDTH = this.TOC_RESET_WIDTH + this.EDITOR_MIN_WIDTH;
  static SUGGESTIONS = [
    `@${MODIFIED_SETTING_TAG}`,
    "@tag:notebookLayout",
    "@tag:notebookOutputLayout",
    `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}`,
    `@tag:${WORKSPACE_TRUST_SETTING_TAG}`,
    "@tag:sync",
    "@tag:usesOnlineServices",
    "@tag:telemetry",
    "@tag:accessibility",
    "@tag:preview",
    "@tag:experimental",
    `@${ID_SETTING_TAG}`,
    `@${EXTENSION_SETTING_TAG}`,
    `@${FEATURE_SETTING_TAG}scm`,
    `@${FEATURE_SETTING_TAG}explorer`,
    `@${FEATURE_SETTING_TAG}search`,
    `@${FEATURE_SETTING_TAG}debug`,
    `@${FEATURE_SETTING_TAG}extensions`,
    `@${FEATURE_SETTING_TAG}terminal`,
    `@${FEATURE_SETTING_TAG}task`,
    `@${FEATURE_SETTING_TAG}problems`,
    `@${FEATURE_SETTING_TAG}output`,
    `@${FEATURE_SETTING_TAG}comments`,
    `@${FEATURE_SETTING_TAG}remote`,
    `@${FEATURE_SETTING_TAG}timeline`,
    `@${FEATURE_SETTING_TAG}notebook`,
    `@${POLICY_SETTING_TAG}`
  ];
  static shouldSettingUpdateFast(type) {
    if (Array.isArray(type)) {
      return false;
    }
    return type === SettingValueType.Enum || type === SettingValueType.Array || type === SettingValueType.BooleanObject || type === SettingValueType.Object || type === SettingValueType.Complex || type === SettingValueType.Boolean || type === SettingValueType.Exclude || type === SettingValueType.Include;
  }
  // (!) Lots of props that are set once on the first render
  defaultSettingsEditorModel;
  modelDisposables;
  rootElement;
  headerContainer;
  bodyContainer;
  searchWidget;
  countElement;
  controlsElement;
  settingsTargetsWidget;
  splitView;
  settingsTreeContainer;
  settingsTree;
  settingRenderers;
  tocTreeModel;
  settingsTreeModel = this._register(new MutableDisposable());
  noResultsMessage;
  clearFilterLinkContainer;
  tocTreeContainer;
  tocTree;
  searchDelayer;
  searchInProgress = null;
  searchInputDelayer;
  updatedConfigSchemaDelayer;
  settingFastUpdateDelayer;
  settingSlowUpdateDelayer;
  pendingSettingUpdate = null;
  viewState;
  _searchResultModel = this._register(new MutableDisposable());
  searchResultLabel = null;
  lastSyncedLabel = null;
  settingsOrderByTocIndex = null;
  tocRowFocused;
  settingRowFocused;
  inSettingsEditorContextKey;
  searchFocusContextKey;
  scheduledRefreshes;
  _currentFocusContext = 0 /* Search */;
  /** Don't spam warnings */
  hasWarnedMissingSettings = false;
  tocTreeDisposed = false;
  /** Persist the search query upon reloads */
  editorMemento;
  tocFocusedElement = null;
  treeFocusedElement = null;
  settingsTreeScrollTop = 0;
  dimension;
  installedExtensionIds = [];
  dismissedExtensionSettings = [];
  DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY = "settingsEditor2.dismissedExtensionSettings";
  DISMISSED_EXTENSION_SETTINGS_DELIMITER = "	";
  inputChangeListener;
  async whenCurrentProfileChanged() {
    this.updatedConfigSchemaDelayer.trigger(() => {
      this.dismissedExtensionSettings = this.storageService.get(this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY, StorageScope.PROFILE, "").split(this.DISMISSED_EXTENSION_SETTINGS_DELIMITER);
      this.onConfigUpdate(void 0, true);
    });
  }
  get minimumWidth() {
    return SettingsEditor2.EDITOR_MIN_WIDTH;
  }
  get maximumWidth() {
    return Number.POSITIVE_INFINITY;
  }
  get minimumHeight() {
    return 180;
  }
  // these setters need to exist because this extends from EditorPane
  set minimumWidth(value) {
  }
  set maximumWidth(value) {
  }
  get currentSettingsModel() {
    return this.searchResultModel || this.settingsTreeModel.value;
  }
  get searchResultModel() {
    return this._searchResultModel.value ?? null;
  }
  set searchResultModel(value) {
    this._searchResultModel.value = value ?? void 0;
    this.rootElement.classList.toggle("search-mode", !!this._searchResultModel.value);
  }
  get focusedSettingDOMElement() {
    const focused = this.settingsTree.getFocus()[0];
    if (!(focused instanceof SettingsTreeSettingElement)) {
      return;
    }
    return this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), focused.setting.key)[0];
  }
  get currentFocusContext() {
    return this._currentFocusContext;
  }
  createEditor(parent) {
    parent.setAttribute("tabindex", "-1");
    this.rootElement = DOM.append(parent, $(".settings-editor", { tabindex: "-1" }));
    this.createHeader(this.rootElement);
    this.createBody(this.rootElement);
    this.addCtrlAInterceptor(this.rootElement);
    this.updateStyles();
    this._register(registerNavigableContainer({
      name: "settingsEditor2",
      focusNotifiers: [this],
      focusNextWidget: /* @__PURE__ */ __name(() => {
        if (this.searchWidget.inputWidget.hasWidgetFocus()) {
          this.focusTOC();
        }
      }, "focusNextWidget"),
      focusPreviousWidget: /* @__PURE__ */ __name(() => {
        if (!this.searchWidget.inputWidget.hasWidgetFocus()) {
          this.focusSearch();
        }
      }, "focusPreviousWidget")
    }));
  }
  async setInput(input, options, context, token) {
    this.inSettingsEditorContextKey.set(true);
    await super.setInput(input, options, context, token);
    if (!this.input) {
      return;
    }
    const model = await this.input.resolve();
    if (token.isCancellationRequested || !(model instanceof Settings2EditorModel)) {
      return;
    }
    this.modelDisposables.clear();
    this.modelDisposables.add(model.onDidChangeGroups(() => {
      this.updatedConfigSchemaDelayer.trigger(() => {
        this.onConfigUpdate(void 0, false, true);
      });
    }));
    this.defaultSettingsEditorModel = model;
    options = options || validateSettingsEditorOptions({});
    if (!this.viewState.settingsTarget || !this.settingsTargetsWidget.settingsTarget) {
      const optionsHasViewStateTarget = options.viewState && options.viewState.settingsTarget;
      if (!options.target && !optionsHasViewStateTarget) {
        options.target = ConfigurationTarget.USER_LOCAL;
      }
    }
    this._setOptions(options);
    this.onConfigUpdate(void 0, true).then(() => {
      this.inputChangeListener.value = input.onWillDispose(() => {
        this.searchWidget.setValue("");
      });
      this.updateTreeScrollSync();
    });
    await this.refreshInstalledExtensionsList();
  }
  async refreshInstalledExtensionsList() {
    const installedExtensions = await this.extensionManagementService.getInstalled();
    this.installedExtensionIds = installedExtensions.filter((ext) => ext.manifest.contributes?.configuration).map((ext) => ext.identifier.id);
  }
  restoreCachedState() {
    const cachedState = this.input && this.editorMemento.loadEditorState(this.group, this.input);
    if (cachedState && typeof cachedState.target === "object") {
      cachedState.target = URI.revive(cachedState.target);
    }
    if (cachedState) {
      const settingsTarget = cachedState.target;
      this.settingsTargetsWidget.settingsTarget = settingsTarget;
      this.viewState.settingsTarget = settingsTarget;
      if (!this.searchWidget.getValue()) {
        this.searchWidget.setValue(cachedState.searchQuery);
      }
    }
    if (this.input) {
      this.editorMemento.clearEditorState(this.input, this.group);
    }
    return cachedState ?? null;
  }
  getViewState() {
    return this.viewState;
  }
  setOptions(options) {
    super.setOptions(options);
    if (options) {
      this._setOptions(options);
    }
  }
  _setOptions(options) {
    if (options.focusSearch && !platform.isIOS) {
      this.focusSearch();
    }
    const recoveredViewState = options.viewState ? options.viewState : void 0;
    const query = recoveredViewState?.query ?? options.query;
    if (query !== void 0) {
      this.searchWidget.setValue(query);
      this.viewState.query = query;
    }
    const target = options.folderUri ?? recoveredViewState?.settingsTarget ?? options.target;
    if (target) {
      this.settingsTargetsWidget.updateTarget(target);
    }
  }
  clearInput() {
    this.inSettingsEditorContextKey.set(false);
    super.clearInput();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (!this.isVisible()) {
      return;
    }
    this.layoutSplitView(dimension);
    const innerWidth = Math.min(this.headerContainer.clientWidth, dimension.width) - 24 * 2;
    const monacoWidth = innerWidth - 10 - this.countElement.clientWidth - this.controlsElement.clientWidth - 12;
    this.searchWidget.layout(new DOM.Dimension(monacoWidth, 20));
    this.rootElement.classList.toggle("narrow-width", dimension.width < SettingsEditor2.NARROW_TOTAL_WIDTH);
  }
  focus() {
    super.focus();
    if (this._currentFocusContext === 0 /* Search */) {
      if (!platform.isIOS) {
        this.focusSearch();
      }
    } else if (this._currentFocusContext === 3 /* SettingControl */) {
      const element = this.focusedSettingDOMElement;
      if (element) {
        const control = element.querySelector(AbstractSettingRenderer.CONTROL_SELECTOR);
        if (control) {
          control.focus();
          return;
        }
      }
    } else if (this._currentFocusContext === 2 /* SettingTree */) {
      this.settingsTree.domFocus();
    } else if (this._currentFocusContext === 1 /* TableOfContents */) {
      this.tocTree.domFocus();
    }
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (!visible) {
      setTimeout(() => {
        this.searchWidget.onHide();
        this.settingRenderers.cancelSuggesters();
      }, 0);
    }
  }
  focusSettings(focusSettingInput = false) {
    const focused = this.settingsTree.getFocus();
    if (!focused.length) {
      this.settingsTree.focusFirst();
    }
    this.settingsTree.domFocus();
    if (focusSettingInput) {
      const controlInFocusedRow = this.settingsTree.getHTMLElement().querySelector(`.focused ${AbstractSettingRenderer.CONTROL_SELECTOR}`);
      if (controlInFocusedRow) {
        controlInFocusedRow.focus();
      }
    }
  }
  focusTOC() {
    this.tocTree.domFocus();
  }
  showContextMenu() {
    const focused = this.settingsTree.getFocus()[0];
    const rowElement = this.focusedSettingDOMElement;
    if (rowElement && focused instanceof SettingsTreeSettingElement) {
      this.settingRenderers.showContextMenu(focused, rowElement);
    }
  }
  focusSearch(filter, selectAll = true) {
    if (filter && this.searchWidget) {
      this.searchWidget.setValue(filter);
    }
    this.searchWidget.focus(selectAll && !this.searchInputDelayer.isTriggered);
  }
  clearSearchResults() {
    this.searchWidget.setValue("");
    this.focusSearch();
  }
  clearSearchFilters() {
    const query = this.searchWidget.getValue();
    const splitQuery = query.split(" ").filter((word) => {
      return word.length && !SettingsEditor2.SUGGESTIONS.some((suggestion) => word.startsWith(suggestion));
    });
    this.searchWidget.setValue(splitQuery.join(" "));
  }
  updateInputAriaLabel() {
    let label = searchBoxLabel;
    if (this.searchResultLabel) {
      label += `. ${this.searchResultLabel}`;
    }
    if (this.lastSyncedLabel) {
      label += `. ${this.lastSyncedLabel}`;
    }
    this.searchWidget.updateAriaLabel(label);
  }
  /**
   * Render the header of the Settings editor, which includes the content above the splitview.
   */
  createHeader(parent) {
    this.headerContainer = DOM.append(parent, $(".settings-header"));
    const searchContainer = DOM.append(this.headerContainer, $(".search-container"));
    const clearInputAction = this._register(new Action(SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, localize("clearInput", "Clear Settings Search Input"), ThemeIcon.asClassName(preferencesClearInputIcon), false, async () => this.clearSearchResults()));
    const filterAction = this._register(new Action(SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS, localize("filterInput", "Filter Settings"), ThemeIcon.asClassName(preferencesFilterIcon)));
    this.searchWidget = this._register(this.instantiationService.createInstance(SuggestEnabledInput, `${SettingsEditor2.ID}.searchbox`, searchContainer, {
      triggerCharacters: ["@", ":"],
      provideResults: /* @__PURE__ */ __name((query) => {
        const queryParts = query.split(/\s/g);
        if (queryParts[queryParts.length - 1].startsWith(`@${LANGUAGE_SETTING_TAG}`)) {
          const sortedLanguages = this.languageService.getRegisteredLanguageIds().map((languageId) => {
            return `@${LANGUAGE_SETTING_TAG}${languageId} `;
          }).sort();
          return sortedLanguages.filter((langFilter) => !query.includes(langFilter));
        } else if (queryParts[queryParts.length - 1].startsWith(`@${EXTENSION_SETTING_TAG}`)) {
          const installedExtensionsTags = this.installedExtensionIds.map((extensionId) => {
            return `@${EXTENSION_SETTING_TAG}${extensionId} `;
          }).sort();
          return installedExtensionsTags.filter((extFilter) => !query.includes(extFilter));
        } else if (queryParts[queryParts.length - 1].startsWith("@")) {
          return SettingsEditor2.SUGGESTIONS.filter((tag) => !query.includes(tag)).map((tag) => tag.endsWith(":") ? tag : tag + " ");
        }
        return [];
      }, "provideResults")
    }, searchBoxLabel, "settingseditor:searchinput" + SettingsEditor2.NUM_INSTANCES++, {
      placeholderText: searchBoxLabel,
      focusContextKey: this.searchFocusContextKey,
      styleOverrides: {
        inputBorder: settingsTextInputBorder
      }
      // TODO: Aria-live
    }));
    this._register(this.searchWidget.onDidFocus(() => {
      this._currentFocusContext = 0 /* Search */;
    }));
    this.countElement = DOM.append(searchContainer, DOM.$(".settings-count-widget.monaco-count-badge.long"));
    this.countElement.style.backgroundColor = asCssVariable(badgeBackground);
    this.countElement.style.color = asCssVariable(badgeForeground);
    this.countElement.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    this._register(this.searchWidget.onInputDidChange(() => {
      const searchVal = this.searchWidget.getValue();
      clearInputAction.enabled = !!searchVal;
      this.searchInputDelayer.trigger(() => this.onSearchInputChanged());
    }));
    const headerControlsContainer = DOM.append(this.headerContainer, $(".settings-header-controls"));
    headerControlsContainer.style.borderColor = asCssVariable(settingsHeaderBorder);
    const targetWidgetContainer = DOM.append(headerControlsContainer, $(".settings-target-container"));
    this.settingsTargetsWidget = this._register(this.instantiationService.createInstance(SettingsTargetsWidget, targetWidgetContainer, { enableRemoteSettings: true }));
    this.settingsTargetsWidget.settingsTarget = ConfigurationTarget.USER_LOCAL;
    this._register(this.settingsTargetsWidget.onDidTargetChange((target) => this.onDidSettingsTargetChange(target)));
    this._register(DOM.addDisposableListener(targetWidgetContainer, DOM.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === KeyCode.DownArrow) {
        this.focusSettings();
      }
    }));
    if (this.userDataSyncWorkbenchService.enabled && this.userDataSyncEnablementService.canToggleEnablement()) {
      const syncControls = this._register(this.instantiationService.createInstance(SyncControls, this.window, headerControlsContainer));
      this._register(syncControls.onDidChangeLastSyncedLabel((lastSyncedLabel) => {
        this.lastSyncedLabel = lastSyncedLabel;
        this.updateInputAriaLabel();
      }));
    }
    this.controlsElement = DOM.append(searchContainer, DOM.$(".settings-clear-widget"));
    const actionBar = this._register(new ActionBar(this.controlsElement, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action.id === filterAction.id) {
          return this.instantiationService.createInstance(SettingsSearchFilterDropdownMenuActionViewItem, action, options, this.actionRunner, this.searchWidget);
        }
        return void 0;
      }, "actionViewItemProvider")
    }));
    actionBar.push([clearInputAction, filterAction], { label: false, icon: true });
  }
  onDidSettingsTargetChange(target) {
    this.viewState.settingsTarget = target;
    this.onConfigUpdate(void 0, true);
  }
  onDidDismissExtensionSetting(extensionId) {
    if (!this.dismissedExtensionSettings.includes(extensionId)) {
      this.dismissedExtensionSettings.push(extensionId);
    }
    this.storageService.store(
      this.DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY,
      this.dismissedExtensionSettings.join(this.DISMISSED_EXTENSION_SETTINGS_DELIMITER),
      StorageScope.PROFILE,
      StorageTarget.USER
    );
    this.onConfigUpdate(void 0, true);
  }
  onDidClickSetting(evt, recursed) {
    const targetElement = this.currentSettingsModel?.getElementsByName(evt.targetKey)?.[0];
    let revealFailed = false;
    if (targetElement) {
      let sourceTop = 0.5;
      try {
        const _sourceTop = this.settingsTree.getRelativeTop(evt.source);
        if (_sourceTop !== null) {
          sourceTop = _sourceTop;
        }
      } catch {
      }
      if (this.viewState.filterToCategory && evt.source.displayCategory !== targetElement.displayCategory) {
        this.tocTree.setFocus([]);
      }
      try {
        this.settingsTree.reveal(targetElement, sourceTop);
      } catch (_) {
        revealFailed = true;
      }
      if (!revealFailed) {
        setTimeout(() => {
          this.settingsTree.setFocus([targetElement]);
        }, 50);
        const domElements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), evt.targetKey);
        if (domElements && domElements[0]) {
          const control = domElements[0].querySelector(AbstractSettingRenderer.CONTROL_SELECTOR);
          if (control) {
            control.focus();
          }
        }
      }
    }
    if (!recursed && (!targetElement || revealFailed)) {
      const p = this.triggerSearch("");
      p.then(() => {
        this.searchWidget.setValue("");
        this.onDidClickSetting(evt, true);
      });
    }
  }
  switchToSettingsFile() {
    const query = parseQuery(this.searchWidget.getValue()).query;
    return this.openSettingsFile({ query });
  }
  async openSettingsFile(options) {
    const currentSettingsTarget = this.settingsTargetsWidget.settingsTarget;
    const openOptions = { jsonEditor: true, groupId: this.group.id, ...options };
    if (currentSettingsTarget === ConfigurationTarget.USER_LOCAL) {
      if (options?.revealSetting) {
        const configurationProperties = Registry.as(Extensions.Configuration).getConfigurationProperties();
        const configurationScope = configurationProperties[options?.revealSetting.key]?.scope;
        if (configurationScope && APPLICATION_SCOPES.includes(configurationScope)) {
          return this.preferencesService.openApplicationSettings(openOptions);
        }
      }
      return this.preferencesService.openUserSettings(openOptions);
    } else if (currentSettingsTarget === ConfigurationTarget.USER_REMOTE) {
      return this.preferencesService.openRemoteSettings(openOptions);
    } else if (currentSettingsTarget === ConfigurationTarget.WORKSPACE) {
      return this.preferencesService.openWorkspaceSettings(openOptions);
    } else if (URI.isUri(currentSettingsTarget)) {
      return this.preferencesService.openFolderSettings({ folderUri: currentSettingsTarget, ...openOptions });
    }
    return void 0;
  }
  createBody(parent) {
    this.bodyContainer = DOM.append(parent, $(".settings-body"));
    this.noResultsMessage = DOM.append(this.bodyContainer, $(".no-results-message"));
    this.noResultsMessage.innerText = localize("noResults", "No Settings Found");
    this.clearFilterLinkContainer = $("span.clear-search-filters");
    this.clearFilterLinkContainer.textContent = " - ";
    const clearFilterLink = DOM.append(this.clearFilterLinkContainer, $("a.pointer.prominent", { tabindex: 0 }, localize("clearSearchFilters", "Clear Filters")));
    this._register(DOM.addDisposableListener(clearFilterLink, DOM.EventType.CLICK, (e) => {
      DOM.EventHelper.stop(e, false);
      this.clearSearchFilters();
    }));
    DOM.append(this.noResultsMessage, this.clearFilterLinkContainer);
    this.noResultsMessage.style.color = asCssVariable(editorForeground);
    this.tocTreeContainer = $(".settings-toc-container");
    this.settingsTreeContainer = $(".settings-tree-container");
    this.createTOC(this.tocTreeContainer);
    this.createSettingsTree(this.settingsTreeContainer);
    this.splitView = this._register(new SplitView(this.bodyContainer, {
      orientation: Orientation.HORIZONTAL,
      proportionalLayout: true
    }));
    const startingWidth = this.storageService.getNumber("settingsEditor2.splitViewWidth", StorageScope.PROFILE, SettingsEditor2.TOC_RESET_WIDTH);
    this.splitView.addView({
      onDidChange: Event.None,
      element: this.tocTreeContainer,
      minimumSize: SettingsEditor2.TOC_MIN_WIDTH,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        this.tocTreeContainer.style.width = `${width}px`;
        this.tocTree.layout(height, width);
      }, "layout")
    }, startingWidth, void 0, true);
    this.splitView.addView({
      onDidChange: Event.None,
      element: this.settingsTreeContainer,
      minimumSize: SettingsEditor2.EDITOR_MIN_WIDTH,
      maximumSize: Number.POSITIVE_INFINITY,
      layout: /* @__PURE__ */ __name((width, _, height) => {
        this.settingsTreeContainer.style.width = `${width}px`;
        this.settingsTree.layout(height, width);
      }, "layout")
    }, Sizing.Distribute, void 0, true);
    this._register(this.splitView.onDidSashReset(() => {
      const totalSize = this.splitView.getViewSize(0) + this.splitView.getViewSize(1);
      this.splitView.resizeView(0, SettingsEditor2.TOC_RESET_WIDTH);
      this.splitView.resizeView(1, totalSize - SettingsEditor2.TOC_RESET_WIDTH);
    }));
    this._register(this.splitView.onDidSashChange(() => {
      const width = this.splitView.getViewSize(0);
      this.storageService.store("settingsEditor2.splitViewWidth", width, StorageScope.PROFILE, StorageTarget.USER);
    }));
    const borderColor = this.theme.getColor(settingsSashBorder);
    this.splitView.style({ separatorBorder: borderColor });
  }
  addCtrlAInterceptor(container) {
    this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, (e) => {
      if (e.keyCode === KeyCode.KeyA && (platform.isMacintosh ? e.metaKey : e.ctrlKey) && !DOM.isEditableElement(e.target)) {
        e.browserEvent.stopPropagation();
        e.browserEvent.preventDefault();
      }
    }));
  }
  createTOC(container) {
    this.tocTreeModel = this.instantiationService.createInstance(TOCTreeModel, this.viewState);
    this.tocTree = this._register(this.instantiationService.createInstance(
      TOCTree,
      DOM.append(container, $(".settings-toc-wrapper", {
        "role": "navigation",
        "aria-label": localize("settings", "Settings")
      })),
      this.viewState
    ));
    this.tocTreeDisposed = false;
    this._register(this.tocTree.onDidFocus(() => {
      this._currentFocusContext = 1 /* TableOfContents */;
    }));
    this._register(this.tocTree.onDidChangeFocus((e) => {
      const element = e.elements?.[0] ?? null;
      if (this.tocFocusedElement === element) {
        return;
      }
      this.tocFocusedElement = element;
      this.tocTree.setSelection(element ? [element] : []);
      if (this.searchResultModel) {
        if (this.viewState.filterToCategory !== element) {
          this.viewState.filterToCategory = element ?? void 0;
          this.renderTree(void 0, true);
          this.settingsTree.scrollTop = 0;
        }
      } else if (element && (!e.browserEvent || !e.browserEvent.fromScroll)) {
        this.settingsTree.reveal(element, 0);
        this.settingsTree.setFocus([element]);
      }
    }));
    this._register(this.tocTree.onDidFocus(() => {
      this.tocRowFocused.set(true);
    }));
    this._register(this.tocTree.onDidBlur(() => {
      this.tocRowFocused.set(false);
    }));
    this._register(this.tocTree.onDidDispose(() => {
      this.tocTreeDisposed = true;
    }));
  }
  applyFilter(filter) {
    if (this.searchWidget && !this.searchWidget.getValue().includes(filter)) {
      const newQuery = `${filter} ${this.searchWidget.getValue().trimStart()}`;
      this.focusSearch(newQuery, false);
    }
  }
  removeLanguageFilters() {
    if (this.searchWidget && this.searchWidget.getValue().includes(`@${LANGUAGE_SETTING_TAG}`)) {
      const query = this.searchWidget.getValue().split(" ");
      const newQuery = query.filter((word) => !word.startsWith(`@${LANGUAGE_SETTING_TAG}`)).join(" ");
      this.focusSearch(newQuery, false);
    }
  }
  createSettingsTree(container) {
    this.settingRenderers = this._register(this.instantiationService.createInstance(SettingTreeRenderers));
    this._register(this.settingRenderers.onDidChangeSetting((e) => this.onDidChangeSetting(e.key, e.value, e.type, e.manualReset, e.scope)));
    this._register(this.settingRenderers.onDidDismissExtensionSetting((e) => this.onDidDismissExtensionSetting(e)));
    this._register(this.settingRenderers.onDidOpenSettings((settingKey) => {
      this.openSettingsFile({ revealSetting: { key: settingKey, edit: true } });
    }));
    this._register(this.settingRenderers.onDidClickSettingLink((settingName) => this.onDidClickSetting(settingName)));
    this._register(this.settingRenderers.onDidFocusSetting((element) => {
      this.settingsTree.setFocus([element]);
      this._currentFocusContext = 3 /* SettingControl */;
      this.settingRowFocused.set(false);
    }));
    this._register(this.settingRenderers.onDidChangeSettingHeight((params) => {
      const { element, height } = params;
      try {
        this.settingsTree.updateElementHeight(element, height);
      } catch (e) {
      }
    }));
    this._register(this.settingRenderers.onApplyFilter((filter) => this.applyFilter(filter)));
    this._register(this.settingRenderers.onDidClickOverrideElement((element) => {
      this.removeLanguageFilters();
      if (element.language) {
        this.applyFilter(`@${LANGUAGE_SETTING_TAG}${element.language}`);
      }
      if (element.scope === "workspace") {
        this.settingsTargetsWidget.updateTarget(ConfigurationTarget.WORKSPACE);
      } else if (element.scope === "user") {
        this.settingsTargetsWidget.updateTarget(ConfigurationTarget.USER_LOCAL);
      } else if (element.scope === "remote") {
        this.settingsTargetsWidget.updateTarget(ConfigurationTarget.USER_REMOTE);
      }
      this.applyFilter(`@${ID_SETTING_TAG}${element.settingKey}`);
    }));
    this.settingsTree = this._register(this.instantiationService.createInstance(
      SettingsTree,
      container,
      this.viewState,
      this.settingRenderers.allRenderers
    ));
    this._register(this.settingsTree.onDidScroll(() => {
      if (this.settingsTree.scrollTop === this.settingsTreeScrollTop) {
        return;
      }
      this.settingsTreeScrollTop = this.settingsTree.scrollTop;
      setTimeout(() => {
        this.updateTreeScrollSync();
      }, 0);
    }));
    this._register(this.settingsTree.onDidFocus(() => {
      const classList = container.ownerDocument.activeElement?.classList;
      if (classList && classList.contains("monaco-list") && classList.contains("settings-editor-tree")) {
        this._currentFocusContext = 2 /* SettingTree */;
        this.settingRowFocused.set(true);
        this.treeFocusedElement ??= this.settingsTree.firstVisibleElement ?? null;
        if (this.treeFocusedElement) {
          this.treeFocusedElement.tabbable = true;
        }
      }
    }));
    this._register(this.settingsTree.onDidBlur(() => {
      this.settingRowFocused.set(false);
      this.treeFocusedElement = null;
    }));
    this._register(this.settingsTree.onDidChangeFocus((e) => {
      const element = e.elements[0];
      if (this.treeFocusedElement === element) {
        return;
      }
      if (this.treeFocusedElement) {
        this.treeFocusedElement.tabbable = false;
      }
      this.treeFocusedElement = element;
      if (this.treeFocusedElement) {
        this.treeFocusedElement.tabbable = true;
      }
      this.settingsTree.setSelection(element ? [element] : []);
    }));
  }
  onDidChangeSetting(key, value, type, manualReset, scope) {
    const parsedQuery = parseQuery(this.searchWidget.getValue());
    const languageFilter = parsedQuery.languageFilter;
    if (manualReset || this.pendingSettingUpdate && this.pendingSettingUpdate.key !== key) {
      this.updateChangedSetting(key, value, manualReset, languageFilter, scope);
    }
    this.pendingSettingUpdate = { key, value, languageFilter };
    if (SettingsEditor2.shouldSettingUpdateFast(type)) {
      this.settingFastUpdateDelayer.trigger(() => this.updateChangedSetting(key, value, manualReset, languageFilter, scope));
    } else {
      this.settingSlowUpdateDelayer.trigger(() => this.updateChangedSetting(key, value, manualReset, languageFilter, scope));
    }
  }
  updateTreeScrollSync() {
    this.settingRenderers.cancelSuggesters();
    if (this.searchResultModel) {
      return;
    }
    if (!this.tocTreeModel) {
      return;
    }
    const elementToSync = this.settingsTree.firstVisibleElement;
    const element = elementToSync instanceof SettingsTreeSettingElement ? elementToSync.parent : elementToSync instanceof SettingsTreeGroupElement ? elementToSync : null;
    let nodeExists = true;
    try {
      this.tocTree.getNode(element);
    } catch (e) {
      nodeExists = false;
    }
    if (!nodeExists) {
      return;
    }
    if (element && this.tocTree.getSelection()[0] !== element) {
      const ancestors = this.getAncestors(element);
      ancestors.forEach((e) => this.tocTree.expand(e));
      this.tocTree.reveal(element);
      const elementTop = this.tocTree.getRelativeTop(element);
      if (typeof elementTop !== "number") {
        return;
      }
      this.tocTree.collapseAll();
      ancestors.forEach((e) => this.tocTree.expand(e));
      if (elementTop < 0 || elementTop > 1) {
        this.tocTree.reveal(element);
      } else {
        this.tocTree.reveal(element, elementTop);
      }
      this.tocTree.expand(element);
      this.tocTree.setSelection([element]);
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      fakeKeyboardEvent.fromScroll = true;
      this.tocTree.setFocus([element], fakeKeyboardEvent);
    }
  }
  getAncestors(element) {
    const ancestors = [];
    while (element.parent) {
      if (element.parent.id !== "root") {
        ancestors.push(element.parent);
      }
      element = element.parent;
    }
    return ancestors.reverse();
  }
  updateChangedSetting(key, value, manualReset, languageFilter, scope) {
    const settingsTarget = this.settingsTargetsWidget.settingsTarget;
    const resource = URI.isUri(settingsTarget) ? settingsTarget : void 0;
    const configurationTarget = (resource ? ConfigurationTarget.WORKSPACE_FOLDER : settingsTarget) ?? ConfigurationTarget.USER_LOCAL;
    const overrides = { resource, overrideIdentifiers: languageFilter ? [languageFilter] : void 0 };
    const configurationTargetIsWorkspace = configurationTarget === ConfigurationTarget.WORKSPACE || configurationTarget === ConfigurationTarget.WORKSPACE_FOLDER;
    const userPassedInManualReset = configurationTargetIsWorkspace || !!languageFilter;
    const isManualReset = userPassedInManualReset ? manualReset : value === void 0;
    const inspected = this.configurationService.inspect(key, overrides);
    if (!userPassedInManualReset && inspected.defaultValue === value) {
      value = void 0;
    }
    return this.configurationService.updateValue(key, value, overrides, configurationTarget, { handleDirtyFile: "save" }).then(() => {
      const query = this.searchWidget.getValue();
      if (query.includes(`@${MODIFIED_SETTING_TAG}`)) {
        this.refreshTOCTree();
      }
      this.renderTree(key, isManualReset);
      this.pendingSettingUpdate = null;
      const reportModifiedProps = {
        key,
        query,
        searchResults: this.searchResultModel?.getUniqueResults() ?? null,
        rawResults: this.searchResultModel?.getRawResults() ?? null,
        showConfiguredOnly: !!this.viewState.tagFilters && this.viewState.tagFilters.has(MODIFIED_SETTING_TAG),
        isReset: typeof value === "undefined",
        settingsTarget: this.settingsTargetsWidget.settingsTarget
      };
      return this.reportModifiedSetting(reportModifiedProps);
    });
  }
  reportModifiedSetting(props) {
    let groupId = void 0;
    let nlpIndex = void 0;
    let displayIndex = void 0;
    if (props.searchResults) {
      displayIndex = props.searchResults.filterMatches.findIndex((m) => m.setting.key === props.key);
      if (this.searchResultModel) {
        const rawResults = this.searchResultModel.getRawResults();
        if (rawResults[SearchResultIdx.Local] && displayIndex >= 0) {
          const settingInLocalResults = rawResults[SearchResultIdx.Local].filterMatches.some((m) => m.setting.key === props.key);
          groupId = settingInLocalResults ? "local" : "remote";
        }
        if (rawResults[SearchResultIdx.Remote]) {
          const _nlpIndex = rawResults[SearchResultIdx.Remote].filterMatches.findIndex((m) => m.setting.key === props.key);
          nlpIndex = _nlpIndex >= 0 ? _nlpIndex : void 0;
        }
      }
    }
    const reportedTarget = props.settingsTarget === ConfigurationTarget.USER_LOCAL ? "user" : props.settingsTarget === ConfigurationTarget.USER_REMOTE ? "user_remote" : props.settingsTarget === ConfigurationTarget.WORKSPACE ? "workspace" : "folder";
    const data = {
      key: props.key,
      groupId,
      nlpIndex,
      displayIndex,
      showConfiguredOnly: props.showConfiguredOnly,
      isReset: props.isReset,
      target: reportedTarget
    };
    this.telemetryService.publicLog2("settingsEditor.settingModified", data);
  }
  scheduleRefresh(element, key = "") {
    if (key && this.scheduledRefreshes.has(key)) {
      return;
    }
    if (!key) {
      dispose(this.scheduledRefreshes.values());
      this.scheduledRefreshes.clear();
    }
    const store = new DisposableStore();
    const scheduledRefreshTracker = DOM.trackFocus(element);
    store.add(scheduledRefreshTracker);
    store.add(scheduledRefreshTracker.onDidBlur(() => {
      this.scheduledRefreshes.get(key)?.dispose();
      this.scheduledRefreshes.delete(key);
      this.onConfigUpdate(/* @__PURE__ */ new Set([key]));
    }));
    this.scheduledRefreshes.set(key, store);
  }
  createSettingsOrderByTocIndex(resolvedSettingsRoot) {
    const index = /* @__PURE__ */ new Map();
    function indexSettings(resolvedSettingsRoot2, counter = 0) {
      if (resolvedSettingsRoot2.settings) {
        for (const setting of resolvedSettingsRoot2.settings) {
          if (!index.has(setting.key)) {
            index.set(setting.key, counter++);
          }
        }
      }
      if (resolvedSettingsRoot2.children) {
        for (const child of resolvedSettingsRoot2.children) {
          counter = indexSettings(child, counter);
        }
      }
      return counter;
    }
    __name(indexSettings, "indexSettings");
    indexSettings(resolvedSettingsRoot);
    return index;
  }
  refreshModels(resolvedSettingsRoot) {
    this.settingsTreeModel.value.update(resolvedSettingsRoot);
    this.tocTreeModel.settingsTreeRoot = this.settingsTreeModel.value.root;
    this.settingsOrderByTocIndex = this.createSettingsOrderByTocIndex(resolvedSettingsRoot);
  }
  async onConfigUpdate(keys, forceRefresh = false, schemaChange = false) {
    if (keys && this.settingsTreeModel) {
      return this.updateElementsByKey(keys);
    }
    if (!this.defaultSettingsEditorModel) {
      return;
    }
    const groups = this.defaultSettingsEditorModel.settingsGroups.slice(1);
    const coreSettings = groups.filter((g) => !g.extensionInfo);
    const settingsResult = resolveSettingsTree(tocData, coreSettings, this.logService);
    const resolvedSettingsRoot = settingsResult.tree;
    if (settingsResult.leftoverSettings.size && !this.hasWarnedMissingSettings) {
      const settingKeyList = [];
      settingsResult.leftoverSettings.forEach((s) => {
        settingKeyList.push(s.key);
      });
      this.logService.warn(`SettingsEditor2: Settings not included in settingsLayout.ts: ${settingKeyList.join(", ")}`);
      this.hasWarnedMissingSettings = true;
    }
    const additionalGroups = [];
    let setAdditionalGroups = false;
    const toggleData = await getExperimentalExtensionToggleData(this.extensionGalleryService, this.productService);
    if (toggleData && groups.filter((g) => g.extensionInfo).length) {
      for (const key in toggleData.settingsEditorRecommendedExtensions) {
        const extension = toggleData.recommendedExtensionsGalleryInfo[key];
        if (!extension) {
          continue;
        }
        const extensionId = extension.identifier.id;
        await this.refreshInstalledExtensionsList();
        const extensionInstalled = this.installedExtensionIds.includes(extensionId);
        const matchingGroupIndex = groups.findIndex(
          (g) => g.extensionInfo && g.extensionInfo.id.toLowerCase() === extensionId.toLowerCase() && g.sections.length === 1 && g.sections[0].settings.length === 1 && g.sections[0].settings[0].displayExtensionId
        );
        if (extensionInstalled || this.dismissedExtensionSettings.includes(extensionId)) {
          if (matchingGroupIndex !== -1) {
            groups.splice(matchingGroupIndex, 1);
            setAdditionalGroups = true;
          }
          continue;
        }
        if (matchingGroupIndex !== -1) {
          continue;
        }
        let manifest = null;
        try {
          manifest = await raceTimeout(
            this.extensionGalleryService.getManifest(extension, CancellationToken.None),
            EXTENSION_FETCH_TIMEOUT_MS
          ) ?? null;
        } catch (e) {
          continue;
        }
        if (manifest === null) {
          continue;
        }
        const contributesConfiguration = manifest?.contributes?.configuration;
        let groupTitle;
        if (!Array.isArray(contributesConfiguration)) {
          groupTitle = contributesConfiguration?.title;
        } else if (contributesConfiguration.length === 1) {
          groupTitle = contributesConfiguration[0].title;
        }
        const recommendationInfo = toggleData.settingsEditorRecommendedExtensions[key];
        const extensionName = extension.displayName ?? extension.name ?? extensionId;
        const settingKey = `${key}.manageExtension`;
        const setting = {
          range: nullRange,
          key: settingKey,
          keyRange: nullRange,
          value: null,
          valueRange: nullRange,
          description: [recommendationInfo.onSettingsEditorOpen?.descriptionOverride ?? extension.description],
          descriptionIsMarkdown: false,
          descriptionRanges: [],
          scope: ConfigurationScope.WINDOW,
          type: "null",
          displayExtensionId: extensionId,
          extensionGroupTitle: groupTitle ?? extensionName,
          categoryLabel: "Extensions",
          title: extensionName
        };
        const additionalGroup = {
          sections: [{
            settings: [setting]
          }],
          id: extensionId,
          title: setting.extensionGroupTitle,
          titleRange: nullRange,
          range: nullRange,
          extensionInfo: {
            id: extensionId,
            displayName: extension.displayName
          }
        };
        groups.push(additionalGroup);
        additionalGroups.push(additionalGroup);
        setAdditionalGroups = true;
      }
    }
    resolvedSettingsRoot.children.push(await createTocTreeForExtensionSettings(this.extensionService, groups.filter((g) => g.extensionInfo)));
    const commonlyUsedDataToUse = getCommonlyUsedData(toggleData);
    const commonlyUsed = resolveSettingsTree(commonlyUsedDataToUse, groups, this.logService);
    resolvedSettingsRoot.children.unshift(commonlyUsed.tree);
    if (toggleData && setAdditionalGroups) {
      this.defaultSettingsEditorModel.setAdditionalGroups(additionalGroups);
    }
    if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && (this.viewState.settingsTarget instanceof URI || this.viewState.settingsTarget === ConfigurationTarget.WORKSPACE)) {
      const configuredUntrustedWorkspaceSettings = resolveConfiguredUntrustedSettings(groups, this.viewState.settingsTarget, this.viewState.languageFilter, this.configurationService);
      if (configuredUntrustedWorkspaceSettings.length) {
        resolvedSettingsRoot.children.unshift({
          id: "workspaceTrust",
          label: localize("settings require trust", "Workspace Trust"),
          settings: configuredUntrustedWorkspaceSettings
        });
      }
    }
    this.searchResultModel?.updateChildren();
    if (this.settingsTreeModel.value) {
      this.refreshModels(resolvedSettingsRoot);
      if (schemaChange && this.searchResultModel) {
        return await this.onSearchInputChanged();
      }
      this.refreshTOCTree();
      this.renderTree(void 0, forceRefresh);
    } else {
      this.settingsTreeModel.value = this.instantiationService.createInstance(SettingsTreeModel, this.viewState, this.workspaceTrustManagementService.isWorkspaceTrusted());
      this.refreshModels(resolvedSettingsRoot);
      const cachedState = !this.viewState.query ? this.restoreCachedState() : void 0;
      if (cachedState?.searchQuery || this.searchWidget.getValue()) {
        await this.onSearchInputChanged();
      } else {
        this.refreshTOCTree();
        this.refreshTree();
        this.tocTree.collapseAll();
      }
    }
  }
  updateElementsByKey(keys) {
    if (keys.size) {
      if (this.searchResultModel) {
        keys.forEach((key) => this.searchResultModel.updateElementsByName(key));
      }
      if (this.settingsTreeModel.value) {
        keys.forEach((key) => this.settingsTreeModel.value.updateElementsByName(key));
      }
      keys.forEach((key) => this.renderTree(key));
    } else {
      this.renderTree();
    }
  }
  getActiveControlInSettingsTree() {
    const element = this.settingsTree.getHTMLElement();
    const activeElement = element.ownerDocument.activeElement;
    return activeElement && DOM.isAncestorOfActiveElement(element) ? activeElement : null;
  }
  renderTree(key, force = false) {
    if (!force && key && this.scheduledRefreshes.has(key)) {
      this.updateModifiedLabelForKey(key);
      return;
    }
    if (this.contextViewFocused()) {
      const element = this.window.document.querySelector(".context-view");
      if (element) {
        this.scheduleRefresh(element, key);
      }
      return;
    }
    const activeElement = this.getActiveControlInSettingsTree();
    const focusedSetting = activeElement && this.settingRenderers.getSettingDOMElementForDOMElement(activeElement);
    if (focusedSetting && !force) {
      if (key) {
        const focusedKey = focusedSetting.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
        if (focusedKey === key && // update `list`s live, as they have a separate "submit edit" step built in before this
        (focusedSetting.parentElement && !focusedSetting.parentElement.classList.contains("setting-item-list"))) {
          this.updateModifiedLabelForKey(key);
          this.scheduleRefresh(focusedSetting, key);
          return;
        }
      } else {
        this.scheduleRefresh(focusedSetting);
        return;
      }
    }
    this.renderResultCountMessages();
    if (key) {
      const elements = this.currentSettingsModel?.getElementsByName(key);
      if (elements?.length) {
        if (elements.length >= 2) {
          console.warn("More than one setting with key " + key + " found");
        }
        this.refreshSingleElement(elements[0]);
      } else {
        return;
      }
    } else {
      this.refreshTree();
    }
    return;
  }
  contextViewFocused() {
    return !!DOM.findParentWithClass(this.rootElement.ownerDocument.activeElement, "context-view");
  }
  refreshSingleElement(element) {
    if (this.isVisible()) {
      if (!element.setting.deprecationMessage || element.isConfigured) {
        this.settingsTree.rerender(element);
      }
    }
  }
  refreshTree() {
    if (this.isVisible() && this.currentSettingsModel) {
      this.settingsTree.setChildren(null, createGroupIterator(this.currentSettingsModel.root));
    }
  }
  refreshTOCTree() {
    if (this.isVisible()) {
      this.tocTreeModel.update();
      this.tocTree.setChildren(null, createTOCIterator(this.tocTreeModel, this.tocTree));
    }
  }
  updateModifiedLabelForKey(key) {
    if (!this.currentSettingsModel) {
      return;
    }
    const dataElements = this.currentSettingsModel.getElementsByName(key);
    const isModified = dataElements && dataElements[0] && dataElements[0].isConfigured;
    const elements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), key);
    if (elements && elements[0]) {
      elements[0].classList.toggle("is-configured", !!isModified);
    }
  }
  async onSearchInputChanged() {
    if (!this.currentSettingsModel) {
      return;
    }
    const query = this.searchWidget.getValue().trim();
    this.viewState.query = query;
    await this.triggerSearch(query.replace(/\u203A/g, " "));
  }
  parseSettingFromJSON(query) {
    const match = query.match(/"([a-zA-Z.]+)": /);
    return match && match[1];
  }
  /**
   * Toggles the visibility of the Settings editor table of contents during a search
   * depending on the behavior.
   */
  toggleTocBySearchBehaviorType() {
    const tocBehavior = this.configurationService.getValue(SEARCH_TOC_BEHAVIOR_KEY);
    const hideToc = tocBehavior === "hide";
    if (hideToc) {
      this.splitView.setViewVisible(0, false);
      this.splitView.style({
        separatorBorder: Color.transparent
      });
    } else {
      this.layoutSplitView(this.dimension);
    }
  }
  async triggerSearch(query) {
    const progressRunner = this.editorProgressService.show(true, 800);
    this.viewState.tagFilters = /* @__PURE__ */ new Set();
    this.viewState.extensionFilters = /* @__PURE__ */ new Set();
    this.viewState.featureFilters = /* @__PURE__ */ new Set();
    this.viewState.idFilters = /* @__PURE__ */ new Set();
    this.viewState.languageFilter = void 0;
    if (query) {
      const parsedQuery = parseQuery(query);
      query = parsedQuery.query;
      parsedQuery.tags.forEach((tag) => this.viewState.tagFilters.add(tag));
      parsedQuery.extensionFilters.forEach((extensionId) => this.viewState.extensionFilters.add(extensionId));
      parsedQuery.featureFilters.forEach((feature) => this.viewState.featureFilters.add(feature));
      parsedQuery.idFilters.forEach((id) => this.viewState.idFilters.add(id));
      this.viewState.languageFilter = parsedQuery.languageFilter;
    }
    this.settingsTargetsWidget.updateLanguageFilterIndicators(this.viewState.languageFilter);
    if (query && query !== "@") {
      query = this.parseSettingFromJSON(query) || query;
      await this.triggerFilterPreferences(query);
      this.toggleTocBySearchBehaviorType();
    } else {
      if (this.viewState.tagFilters.size || this.viewState.extensionFilters.size || this.viewState.featureFilters.size || this.viewState.idFilters.size || this.viewState.languageFilter) {
        this.searchResultModel = this.createFilterModel();
      } else {
        this.searchResultModel = null;
      }
      this.searchDelayer.cancel();
      if (this.searchInProgress) {
        this.searchInProgress.dispose(true);
        this.searchInProgress = null;
      }
      this.tocTree.setFocus([]);
      this.viewState.filterToCategory = void 0;
      this.tocTreeModel.currentSearchModel = this.searchResultModel;
      if (this.searchResultModel) {
        this.tocTree.setSelection([]);
        this.tocTree.expandAll();
        this.refreshTOCTree();
        this.renderResultCountMessages();
        this.refreshTree();
        this.toggleTocBySearchBehaviorType();
      } else if (!this.tocTreeDisposed) {
        this.tocTree.collapseAll();
        this.refreshTOCTree();
        this.renderResultCountMessages();
        this.refreshTree();
        this.layoutSplitView(this.dimension);
      }
    }
    progressRunner.done();
  }
  /**
   * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
   */
  createFilterModel() {
    const filterModel = this.instantiationService.createInstance(SearchResultModel, this.viewState, this.settingsOrderByTocIndex, this.workspaceTrustManagementService.isWorkspaceTrusted());
    const fullResult = {
      filterMatches: [],
      exactMatch: false
    };
    for (const g of this.defaultSettingsEditorModel.settingsGroups.slice(1)) {
      for (const sect of g.sections) {
        for (const setting of sect.settings) {
          fullResult.filterMatches.push({ setting, matches: [], matchType: SettingMatchType.None, keyMatchScore: 0, score: 0 });
        }
      }
    }
    filterModel.setResult(0, fullResult);
    return filterModel;
  }
  async triggerFilterPreferences(query) {
    if (this.searchInProgress) {
      this.searchInProgress.dispose(true);
      this.searchInProgress = null;
    }
    const searchInProgress = this.searchInProgress = new CancellationTokenSource();
    return this.searchDelayer.trigger(async () => {
      if (searchInProgress.token.isCancellationRequested) {
        return;
      }
      const localResults = await this.localFilterPreferences(query, searchInProgress.token);
      if (localResults && !localResults.exactMatch && !searchInProgress.token.isCancellationRequested) {
        await this.remoteSearchPreferences(query, searchInProgress.token);
      }
      this.onDidFinishSearch();
    });
  }
  onDidFinishSearch() {
    this.tocTreeModel.currentSearchModel = this.searchResultModel;
    this.tocTreeModel.update();
    this.tocTree.setFocus([]);
    this.viewState.filterToCategory = void 0;
    this.tocTree.expandAll();
    this.settingsTree.scrollTop = 0;
    this.refreshTOCTree();
    this.renderTree(void 0, true);
  }
  localFilterPreferences(query, token) {
    const localSearchProvider = this.preferencesSearchService.getLocalSearchProvider(query);
    return this.searchWithProvider(SearchResultIdx.Local, localSearchProvider, token);
  }
  remoteSearchPreferences(query, token) {
    const remoteSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query);
    if (!remoteSearchProvider) {
      return Promise.resolve(null);
    }
    return this.searchWithProvider(SearchResultIdx.Remote, remoteSearchProvider, token);
  }
  async searchWithProvider(type, searchProvider, token) {
    const result = await this._searchPreferencesModel(this.defaultSettingsEditorModel, searchProvider, token);
    if (token.isCancellationRequested) {
      return null;
    }
    this.searchResultModel ??= this.instantiationService.createInstance(SearchResultModel, this.viewState, this.settingsOrderByTocIndex, this.workspaceTrustManagementService.isWorkspaceTrusted());
    this.searchResultModel.setResult(type, result);
    return result;
  }
  renderResultCountMessages() {
    if (!this.currentSettingsModel) {
      return;
    }
    this.clearFilterLinkContainer.style.display = this.viewState.tagFilters && this.viewState.tagFilters.size > 0 ? "initial" : "none";
    if (!this.searchResultModel) {
      if (this.countElement.style.display !== "none") {
        this.searchResultLabel = null;
        this.updateInputAriaLabel();
        this.countElement.style.display = "none";
        this.countElement.innerText = "";
        this.layout(this.dimension);
      }
      this.rootElement.classList.remove("no-results");
      this.splitView.el.style.visibility = "visible";
      return;
    } else {
      const count = this.searchResultModel.getUniqueResultsCount();
      let resultString;
      switch (count) {
        case 0:
          resultString = localize("noResults", "No Settings Found");
          break;
        case 1:
          resultString = localize("oneResult", "1 Setting Found");
          break;
        default:
          resultString = localize("moreThanOneResult", "{0} Settings Found", count);
      }
      this.searchResultLabel = resultString;
      this.updateInputAriaLabel();
      this.countElement.innerText = resultString;
      aria.status(resultString);
      if (this.countElement.style.display !== "block") {
        this.countElement.style.display = "block";
        this.layout(this.dimension);
      }
      this.rootElement.classList.toggle("no-results", count === 0);
      this.splitView.el.style.visibility = count === 0 ? "hidden" : "visible";
    }
  }
  async _searchPreferencesModel(model, provider, token) {
    try {
      return await provider.searchModel(model, token);
    } catch (err) {
      if (isCancellationError(err)) {
        return Promise.reject(err);
      } else {
        return null;
      }
    }
  }
  layoutSplitView(dimension) {
    if (!this.isVisible()) {
      return;
    }
    const listHeight = dimension.height - (72 + 11 + 14);
    this.splitView.el.style.height = `${listHeight}px`;
    this.splitView.layout(this.bodyContainer.clientWidth, listHeight);
    const tocBehavior = this.configurationService.getValue(SEARCH_TOC_BEHAVIOR_KEY);
    const hideTocForSearch = tocBehavior === "hide" && this.searchResultModel;
    if (!hideTocForSearch) {
      const firstViewWasVisible = this.splitView.isViewVisible(0);
      const firstViewVisible = this.bodyContainer.clientWidth >= SettingsEditor2.NARROW_TOTAL_WIDTH;
      this.splitView.setViewVisible(0, firstViewVisible);
      if (!firstViewWasVisible && firstViewVisible && this.bodyContainer.clientWidth >= SettingsEditor2.EDITOR_MIN_WIDTH + SettingsEditor2.TOC_RESET_WIDTH) {
        this.splitView.resizeView(0, SettingsEditor2.TOC_RESET_WIDTH);
      }
      this.splitView.style({
        separatorBorder: firstViewVisible ? this.theme.getColor(settingsSashBorder) : Color.transparent
      });
    }
  }
  saveState() {
    if (this.isVisible()) {
      const searchQuery = this.searchWidget.getValue().trim();
      const target = this.settingsTargetsWidget.settingsTarget;
      if (this.input) {
        this.editorMemento.saveEditorState(this.group, this.input, { searchQuery, target });
      }
    } else if (this.input) {
      this.editorMemento.clearEditorState(this.input, this.group);
    }
    super.saveState();
  }
};
SettingsEditor2 = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, ITextResourceConfigurationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IPreferencesService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IPreferencesSearchService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IEditorGroupsService),
  __decorateParam(12, IUserDataSyncWorkbenchService),
  __decorateParam(13, IUserDataSyncEnablementService),
  __decorateParam(14, IWorkspaceTrustManagementService),
  __decorateParam(15, IExtensionService),
  __decorateParam(16, ILanguageService),
  __decorateParam(17, IExtensionManagementService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IExtensionGalleryService),
  __decorateParam(20, IEditorProgressService),
  __decorateParam(21, IUserDataProfileService)
], SettingsEditor2);
let SyncControls = class extends Disposable {
  constructor(window, container, commandService, userDataSyncService, userDataSyncEnablementService, telemetryService) {
    super();
    this.commandService = commandService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    const headerRightControlsContainer = DOM.append(container, $(".settings-right-controls"));
    const turnOnSyncButtonContainer = DOM.append(headerRightControlsContainer, $(".turn-on-sync"));
    this.turnOnSyncButton = this._register(new Button(turnOnSyncButtonContainer, { title: true, ...defaultButtonStyles }));
    this.lastSyncedLabel = DOM.append(headerRightControlsContainer, $(".last-synced-label"));
    DOM.hide(this.lastSyncedLabel);
    this.turnOnSyncButton.enabled = true;
    this.turnOnSyncButton.label = localize("turnOnSyncButton", "Backup and Sync Settings");
    DOM.hide(this.turnOnSyncButton.element);
    this._register(this.turnOnSyncButton.onDidClick(async () => {
      await this.commandService.executeCommand("workbench.userDataSync.actions.turnOn");
    }));
    this.updateLastSyncedTime();
    this._register(this.userDataSyncService.onDidChangeLastSyncTime(() => {
      this.updateLastSyncedTime();
    }));
    const updateLastSyncedTimer = this._register(new DOM.WindowIntervalTimer());
    updateLastSyncedTimer.cancelAndSet(() => this.updateLastSyncedTime(), 60 * 1e3, window);
    this.update();
    this._register(this.userDataSyncService.onDidChangeStatus(() => {
      this.update();
    }));
    this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
      this.update();
    }));
  }
  static {
    __name(this, "SyncControls");
  }
  lastSyncedLabel;
  turnOnSyncButton;
  _onDidChangeLastSyncedLabel = this._register(new Emitter());
  onDidChangeLastSyncedLabel = this._onDidChangeLastSyncedLabel.event;
  updateLastSyncedTime() {
    const last = this.userDataSyncService.lastSyncTime;
    let label;
    if (typeof last === "number") {
      const d = fromNow(last, true, void 0, true);
      label = localize("lastSyncedLabel", "Last synced: {0}", d);
    } else {
      label = "";
    }
    this.lastSyncedLabel.textContent = label;
    this._onDidChangeLastSyncedLabel.fire(label);
  }
  update() {
    if (this.userDataSyncService.status === SyncStatus.Uninitialized) {
      return;
    }
    if (this.userDataSyncEnablementService.isEnabled() || this.userDataSyncService.status !== SyncStatus.Idle) {
      DOM.show(this.lastSyncedLabel);
      DOM.hide(this.turnOnSyncButton.element);
    } else {
      DOM.hide(this.lastSyncedLabel);
      DOM.show(this.turnOnSyncButton.element);
    }
  }
};
SyncControls = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IUserDataSyncService),
  __decorateParam(4, IUserDataSyncEnablementService),
  __decorateParam(5, ITelemetryService)
], SyncControls);
export {
  SettingsEditor2,
  SettingsFocusContext,
  createGroupIterator
};
//# sourceMappingURL=settingsEditor2.js.map
