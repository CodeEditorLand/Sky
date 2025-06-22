var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IUserDataSyncUtilService, getDefaultIgnoredSettings } from "../../../../platform/userDataSync/common/userDataSync.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ITextResourcePropertiesService, ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
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
let UserDataSyncUtilService = class UserDataSyncUtilService2 {
  static {
    __name(this, "UserDataSyncUtilService");
  }
  constructor(keybindingsService, textModelService, textResourcePropertiesService, textResourceConfigurationService) {
    this.keybindingsService = keybindingsService;
    this.textModelService = textModelService;
    this.textResourcePropertiesService = textResourcePropertiesService;
    this.textResourceConfigurationService = textResourceConfigurationService;
  }
  async resolveDefaultCoreIgnoredSettings() {
    return getDefaultIgnoredSettings(true);
  }
  async resolveUserBindings(userBindings) {
    const keys = {};
    for (const userbinding of userBindings) {
      keys[userbinding] = this.keybindingsService.resolveUserBinding(userbinding).map((part) => part.getUserSettingsLabel()).join(" ");
    }
    return keys;
  }
  async resolveFormattingOptions(resource) {
    try {
      const modelReference = await this.textModelService.createModelReference(resource);
      const { insertSpaces, tabSize } = modelReference.object.textEditorModel.getOptions();
      const eol = modelReference.object.textEditorModel.getEOL();
      modelReference.dispose();
      return { eol, insertSpaces, tabSize };
    } catch (e) {
    }
    return {
      eol: this.textResourcePropertiesService.getEOL(resource),
      insertSpaces: !!this.textResourceConfigurationService.getValue(resource, "editor.insertSpaces"),
      tabSize: this.textResourceConfigurationService.getValue(resource, "editor.tabSize")
    };
  }
};
UserDataSyncUtilService = __decorate([
  __param(0, IKeybindingService),
  __param(1, ITextModelService),
  __param(2, ITextResourcePropertiesService),
  __param(3, ITextResourceConfigurationService)
], UserDataSyncUtilService);
registerSingleton(
  IUserDataSyncUtilService,
  UserDataSyncUtilService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=userDataSyncUtil.js.map
