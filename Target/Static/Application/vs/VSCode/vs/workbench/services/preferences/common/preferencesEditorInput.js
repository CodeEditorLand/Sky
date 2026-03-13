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
var SettingsEditor2Input_1;
import { Codicon } from "../../../../base/common/codicons.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IPreferencesService } from "./preferences.js";
const SettingsEditorIcon = registerIcon("settings-editor-label-icon", Codicon.settings, nls.localize("settingsEditorLabelIcon", "Icon of the settings editor label."));
let SettingsEditor2Input = class SettingsEditor2Input2 extends EditorInput {
  static {
    __name(this, "SettingsEditor2Input");
  }
  static {
    SettingsEditor2Input_1 = this;
  }
  static {
    this.ID = "workbench.input.settings2";
  }
  constructor(_preferencesService) {
    super();
    this.resource = URI.from({
      scheme: Schemas.vscodeSettings,
      path: `settingseditor`
    });
    this._settingsModel = _preferencesService.createSettings2EditorModel();
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof SettingsEditor2Input_1;
  }
  get typeId() {
    return SettingsEditor2Input_1.ID;
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
SettingsEditor2Input = SettingsEditor2Input_1 = __decorate([
  __param(0, IPreferencesService)
], SettingsEditor2Input);
const PreferencesEditorIcon = registerIcon("preferences-editor-label-icon", Codicon.settings, nls.localize("preferencesEditorLabelIcon", "Icon of the preferences editor label."));
class PreferencesEditorInput extends EditorInput {
  static {
    __name(this, "PreferencesEditorInput");
  }
  constructor() {
    super(...arguments);
    this.resource = URI.from({
      scheme: Schemas.vscodeSettings,
      path: `preferenceseditor`
    });
  }
  static {
    this.ID = "workbench.input.preferences";
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof PreferencesEditorInput;
  }
  get typeId() {
    return PreferencesEditorInput.ID;
  }
  getName() {
    return nls.localize("preferencesEditorInputName", "Preferences");
  }
  getIcon() {
    return PreferencesEditorIcon;
  }
  async resolve() {
    return null;
  }
}
export {
  PreferencesEditorInput,
  SettingsEditor2Input
};
//# sourceMappingURL=preferencesEditorInput.js.map
