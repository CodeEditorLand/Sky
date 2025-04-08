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
import { Codicon } from "../../../../base/common/codicons.js";
import { Schemas } from "../../../../base/common/network.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IPreferencesService } from "./preferences.js";
import { Settings2EditorModel } from "./preferencesModels.js";
const SettingsEditorIcon = registerIcon("settings-editor-label-icon", Codicon.settings, nls.localize("settingsEditorLabelIcon", "Icon of the settings editor label."));
let SettingsEditor2Input = class extends EditorInput {
  static {
    __name(this, "SettingsEditor2Input");
  }
  static ID = "workbench.input.settings2";
  _settingsModel;
  resource = URI.from({
    scheme: Schemas.vscodeSettings,
    path: `settingseditor`
  });
  constructor(_preferencesService) {
    super();
    this._settingsModel = _preferencesService.createSettings2EditorModel();
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof SettingsEditor2Input;
  }
  get typeId() {
    return SettingsEditor2Input.ID;
  }
  getName() {
    return nls.localize("settingsEditor2InputName", "Settings");
  }
  getIcon() {
    return SettingsEditorIcon;
  }
  async resolve() {
    return this._settingsModel;
  }
  dispose() {
    this._settingsModel.dispose();
    super.dispose();
  }
};
SettingsEditor2Input = __decorateClass([
  __decorateParam(0, IPreferencesService)
], SettingsEditor2Input);
export {
  SettingsEditor2Input
};
//# sourceMappingURL=preferencesEditorInput.js.map
