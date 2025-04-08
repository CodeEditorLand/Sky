var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStringDictionary } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { IMatch } from "../../../../base/common/filters.js";
import { IJSONSchema, IJSONSchemaMap } from "../../../../base/common/jsonSchema.js";
import { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { ConfigurationDefaultValueSource, ConfigurationScope, EditPresentationTypes, IExtensionInfo } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ResolvedKeybindingItem } from "../../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { DEFAULT_EDITOR_ASSOCIATION, IEditorPane } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { Settings2EditorModel } from "./preferencesModels.js";
var SettingValueType = /* @__PURE__ */ ((SettingValueType2) => {
  SettingValueType2["Null"] = "null";
  SettingValueType2["Enum"] = "enum";
  SettingValueType2["String"] = "string";
  SettingValueType2["MultilineString"] = "multiline-string";
  SettingValueType2["Integer"] = "integer";
  SettingValueType2["Number"] = "number";
  SettingValueType2["Boolean"] = "boolean";
  SettingValueType2["Array"] = "array";
  SettingValueType2["Exclude"] = "exclude";
  SettingValueType2["Include"] = "include";
  SettingValueType2["Complex"] = "complex";
  SettingValueType2["NullableInteger"] = "nullable-integer";
  SettingValueType2["NullableNumber"] = "nullable-number";
  SettingValueType2["Object"] = "object";
  SettingValueType2["BooleanObject"] = "boolean-object";
  SettingValueType2["LanguageTag"] = "language-tag";
  SettingValueType2["ExtensionToggle"] = "extension-toggle";
  SettingValueType2["ComplexObject"] = "complex-object";
  return SettingValueType2;
})(SettingValueType || {});
var SettingMatchType = /* @__PURE__ */ ((SettingMatchType2) => {
  SettingMatchType2[SettingMatchType2["None"] = 0] = "None";
  SettingMatchType2[SettingMatchType2["LanguageTagSettingMatch"] = 1] = "LanguageTagSettingMatch";
  SettingMatchType2[SettingMatchType2["RemoteMatch"] = 2] = "RemoteMatch";
  SettingMatchType2[SettingMatchType2["NonContiguousQueryInSettingId"] = 4] = "NonContiguousQueryInSettingId";
  SettingMatchType2[SettingMatchType2["DescriptionOrValueMatch"] = 8] = "DescriptionOrValueMatch";
  SettingMatchType2[SettingMatchType2["NonContiguousWordsInSettingsLabel"] = 16] = "NonContiguousWordsInSettingsLabel";
  SettingMatchType2[SettingMatchType2["ContiguousWordsInSettingsLabel"] = 32] = "ContiguousWordsInSettingsLabel";
  SettingMatchType2[SettingMatchType2["ContiguousQueryInSettingId"] = 64] = "ContiguousQueryInSettingId";
  SettingMatchType2[SettingMatchType2["AllWordsInSettingsLabel"] = 128] = "AllWordsInSettingsLabel";
  SettingMatchType2[SettingMatchType2["ExactMatch"] = 256] = "ExactMatch";
  return SettingMatchType2;
})(SettingMatchType || {});
const SettingKeyMatchTypes = 128 /* AllWordsInSettingsLabel */ | 32 /* ContiguousWordsInSettingsLabel */ | 16 /* NonContiguousWordsInSettingsLabel */ | 4 /* NonContiguousQueryInSettingId */ | 64 /* ContiguousQueryInSettingId */;
function validateSettingsEditorOptions(options) {
  return {
    // Inherit provided options
    ...options,
    // Enforce some options for settings specifically
    override: DEFAULT_EDITOR_ASSOCIATION.id,
    pinned: true
  };
}
__name(validateSettingsEditorOptions, "validateSettingsEditorOptions");
const IPreferencesService = createDecorator("preferencesService");
const DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = "editor.contrib.defineKeybinding";
const FOLDER_SETTINGS_PATH = ".vscode/settings.json";
const DEFAULT_SETTINGS_EDITOR_SETTING = "workbench.settings.openDefaultSettings";
const USE_SPLIT_JSON_SETTING = "workbench.settings.useSplitJSON";
const SETTINGS_AUTHORITY = "settings";
export {
  DEFAULT_SETTINGS_EDITOR_SETTING,
  DEFINE_KEYBINDING_EDITOR_CONTRIB_ID,
  FOLDER_SETTINGS_PATH,
  IPreferencesService,
  SETTINGS_AUTHORITY,
  SettingKeyMatchTypes,
  SettingMatchType,
  SettingValueType,
  USE_SPLIT_JSON_SETTING,
  validateSettingsEditorOptions
};
//# sourceMappingURL=preferences.js.map
