var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { raceTimeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { IExtensionRecommendations } from "../../../../base/common/product.js";
import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionGalleryService, IGalleryExtension } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ISearchResult, ISettingsEditorModel } from "../../../services/preferences/common/preferences.js";
const IPreferencesSearchService = createDecorator("preferencesSearchService");
const SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = "settings.action.clearSearchResults";
const SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU = "settings.action.showContextMenu";
const SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS = "settings.action.suggestFilters";
const CONTEXT_SETTINGS_EDITOR = new RawContextKey("inSettingsEditor", false);
const CONTEXT_SETTINGS_JSON_EDITOR = new RawContextKey("inSettingsJSONEditor", false);
const CONTEXT_SETTINGS_SEARCH_FOCUS = new RawContextKey("inSettingsSearch", false);
const CONTEXT_TOC_ROW_FOCUS = new RawContextKey("settingsTocRowFocus", false);
const CONTEXT_SETTINGS_ROW_FOCUS = new RawContextKey("settingRowFocus", false);
const CONTEXT_KEYBINDINGS_EDITOR = new RawContextKey("inKeybindings", false);
const CONTEXT_KEYBINDINGS_SEARCH_FOCUS = new RawContextKey("inKeybindingsSearch", false);
const CONTEXT_KEYBINDING_FOCUS = new RawContextKey("keybindingFocus", false);
const CONTEXT_WHEN_FOCUS = new RawContextKey("whenFocus", false);
const KEYBINDINGS_EDITOR_COMMAND_SEARCH = "keybindings.editor.searchKeybindings";
const KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = "keybindings.editor.clearSearchResults";
const KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY = "keybindings.editor.clearSearchHistory";
const KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS = "keybindings.editor.recordSearchKeys";
const KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE = "keybindings.editor.toggleSortByPrecedence";
const KEYBINDINGS_EDITOR_COMMAND_DEFINE = "keybindings.editor.defineKeybinding";
const KEYBINDINGS_EDITOR_COMMAND_ADD = "keybindings.editor.addKeybinding";
const KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN = "keybindings.editor.defineWhenExpression";
const KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN = "keybindings.editor.acceptWhenExpression";
const KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN = "keybindings.editor.rejectWhenExpression";
const KEYBINDINGS_EDITOR_COMMAND_REMOVE = "keybindings.editor.removeKeybinding";
const KEYBINDINGS_EDITOR_COMMAND_RESET = "keybindings.editor.resetKeybinding";
const KEYBINDINGS_EDITOR_COMMAND_COPY = "keybindings.editor.copyKeybindingEntry";
const KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND = "keybindings.editor.copyCommandKeybindingEntry";
const KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE = "keybindings.editor.copyCommandTitle";
const KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR = "keybindings.editor.showConflicts";
const KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS = "keybindings.editor.focusKeybindings";
const KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS = "keybindings.editor.showDefaultKeybindings";
const KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS = "keybindings.editor.showUserKeybindings";
const KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS = "keybindings.editor.showExtensionKeybindings";
const MODIFIED_SETTING_TAG = "modified";
const EXTENSION_SETTING_TAG = "ext:";
const FEATURE_SETTING_TAG = "feature:";
const ID_SETTING_TAG = "id:";
const LANGUAGE_SETTING_TAG = "lang:";
const GENERAL_TAG_SETTING_TAG = "tag:";
const POLICY_SETTING_TAG = "hasPolicy";
const WORKSPACE_TRUST_SETTING_TAG = "workspaceTrust";
const REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG = "requireTrustedWorkspace";
const KEYBOARD_LAYOUT_OPEN_PICKER = "workbench.action.openKeyboardLayoutPicker";
const ENABLE_LANGUAGE_FILTER = true;
const ENABLE_EXTENSION_TOGGLE_SETTINGS = true;
const EXTENSION_FETCH_TIMEOUT_MS = 1e3;
let cachedExtensionToggleData;
async function getExperimentalExtensionToggleData(extensionGalleryService, productService) {
  if (!ENABLE_EXTENSION_TOGGLE_SETTINGS) {
    return void 0;
  }
  if (!extensionGalleryService.isEnabled()) {
    return void 0;
  }
  if (cachedExtensionToggleData) {
    return cachedExtensionToggleData;
  }
  if (productService.extensionRecommendations && productService.commonlyUsedSettings) {
    const settingsEditorRecommendedExtensions = {};
    Object.keys(productService.extensionRecommendations).forEach((extensionId) => {
      const extensionInfo = productService.extensionRecommendations[extensionId];
      if (extensionInfo.onSettingsEditorOpen) {
        settingsEditorRecommendedExtensions[extensionId] = extensionInfo;
      }
    });
    const recommendedExtensionsGalleryInfo = {};
    for (const key in settingsEditorRecommendedExtensions) {
      const extensionId = key;
      const isStable = productService.quality === "stable";
      try {
        const extensions = await raceTimeout(extensionGalleryService.getExtensions([{ id: extensionId, preRelease: !isStable }], CancellationToken.None), EXTENSION_FETCH_TIMEOUT_MS);
        if (extensions?.length === 1) {
          recommendedExtensionsGalleryInfo[key] = extensions[0];
        } else {
          return void 0;
        }
      } catch (e) {
        return void 0;
      }
    }
    cachedExtensionToggleData = {
      settingsEditorRecommendedExtensions,
      recommendedExtensionsGalleryInfo,
      commonlyUsed: productService.commonlyUsedSettings
    };
    return cachedExtensionToggleData;
  }
  return void 0;
}
__name(getExperimentalExtensionToggleData, "getExperimentalExtensionToggleData");
function compareTwoNullableNumbers(a, b) {
  const aOrMax = a ?? Number.MAX_SAFE_INTEGER;
  const bOrMax = b ?? Number.MAX_SAFE_INTEGER;
  if (aOrMax < bOrMax) {
    return -1;
  } else if (aOrMax > bOrMax) {
    return 1;
  } else {
    return 0;
  }
}
__name(compareTwoNullableNumbers, "compareTwoNullableNumbers");
const PREVIEW_INDICATOR_DESCRIPTION = localize("previewIndicatorDescription", "Preview setting: this setting controls a new feature that is still under refinement yet ready to use. Feedback is welcome.");
const EXPERIMENTAL_INDICATOR_DESCRIPTION = localize("experimentalIndicatorDescription", "Experimental setting: this setting controls a new feature that is actively being developed and may be unstable. It is subject to change or removal.");
export {
  CONTEXT_KEYBINDINGS_EDITOR,
  CONTEXT_KEYBINDINGS_SEARCH_FOCUS,
  CONTEXT_KEYBINDING_FOCUS,
  CONTEXT_SETTINGS_EDITOR,
  CONTEXT_SETTINGS_JSON_EDITOR,
  CONTEXT_SETTINGS_ROW_FOCUS,
  CONTEXT_SETTINGS_SEARCH_FOCUS,
  CONTEXT_TOC_ROW_FOCUS,
  CONTEXT_WHEN_FOCUS,
  ENABLE_EXTENSION_TOGGLE_SETTINGS,
  ENABLE_LANGUAGE_FILTER,
  EXPERIMENTAL_INDICATOR_DESCRIPTION,
  EXTENSION_FETCH_TIMEOUT_MS,
  EXTENSION_SETTING_TAG,
  FEATURE_SETTING_TAG,
  GENERAL_TAG_SETTING_TAG,
  ID_SETTING_TAG,
  IPreferencesSearchService,
  KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_ADD,
  KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
  KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
  KEYBINDINGS_EDITOR_COMMAND_COPY,
  KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
  KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
  KEYBINDINGS_EDITOR_COMMAND_DEFINE,
  KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
  KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
  KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_REMOVE,
  KEYBINDINGS_EDITOR_COMMAND_RESET,
  KEYBINDINGS_EDITOR_COMMAND_SEARCH,
  KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
  KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
  KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
  KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
  KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
  KEYBOARD_LAYOUT_OPEN_PICKER,
  LANGUAGE_SETTING_TAG,
  MODIFIED_SETTING_TAG,
  POLICY_SETTING_TAG,
  PREVIEW_INDICATOR_DESCRIPTION,
  REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG,
  SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
  SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
  SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS,
  WORKSPACE_TRUST_SETTING_TAG,
  compareTwoNullableNumbers,
  getExperimentalExtensionToggleData
};
//# sourceMappingURL=preferences.js.map
