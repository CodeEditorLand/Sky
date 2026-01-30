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
import { toAction } from "../../../../base/common/actions.js";
import { CopyPasteController, pasteAsPreferenceConfig } from "../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js";
import { DropIntoEditorController, dropAsPreferenceConfig } from "../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js";
import { localize } from "../../../../nls.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
let DropOrPasteIntoCommands = class DropOrPasteIntoCommands2 {
  static {
    __name(this, "DropOrPasteIntoCommands");
  }
  static {
    this.ID = "workbench.contrib.dropOrPasteInto";
  }
  constructor(_preferencesService) {
    this._preferencesService = _preferencesService;
    CopyPasteController.setConfigureDefaultAction(toAction({
      id: "workbench.action.configurePreferredPasteAction",
      label: localize("configureDefaultPaste.label", "Configure preferred paste action..."),
      run: /* @__PURE__ */ __name(() => this.configurePreferredPasteAction(), "run")
    }));
    DropIntoEditorController.setConfigureDefaultAction(toAction({
      id: "workbench.action.configurePreferredDropAction",
      label: localize("configureDefaultDrop.label", "Configure preferred drop action..."),
      run: /* @__PURE__ */ __name(() => this.configurePreferredDropAction(), "run")
    }));
  }
  configurePreferredPasteAction() {
    return this._preferencesService.openUserSettings({
      jsonEditor: true,
      revealSetting: { key: pasteAsPreferenceConfig, edit: true }
    });
  }
  configurePreferredDropAction() {
    return this._preferencesService.openUserSettings({
      jsonEditor: true,
      revealSetting: { key: dropAsPreferenceConfig, edit: true }
    });
  }
};
DropOrPasteIntoCommands = __decorate([
  __param(0, IPreferencesService)
], DropOrPasteIntoCommands);
export {
  DropOrPasteIntoCommands
};
//# sourceMappingURL=commands.js.map
