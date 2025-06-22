var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { isEqual } from "../../../../base/common/resources.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUserDataAutoSyncService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { VIEWLET_ID } from "../../extensions/common/extensions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { KeybindingsEditorInput } from "../../../services/preferences/browser/keybindingsEditorInput.js";
import { SettingsEditor2Input } from "../../../services/preferences/common/preferencesEditorInput.js";
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
let UserDataSyncTrigger = class UserDataSyncTrigger2 extends Disposable {
  static {
    __name(this, "UserDataSyncTrigger");
  }
  constructor(editorService, userDataProfilesService, viewsService, userDataAutoSyncService, hostService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    const event = Event.filter(Event.any(Event.map(editorService.onDidActiveEditorChange, () => this.getUserDataEditorInputSource(editorService.activeEditor)), Event.map(Event.filter(viewsService.onDidChangeViewContainerVisibility, (e) => e.id === VIEWLET_ID && e.visible), (e) => e.id)), (source) => source !== void 0);
    if (isWeb) {
      this._register(Event.debounce(Event.any(Event.map(hostService.onDidChangeFocus, () => "windowFocus"), Event.map(event, (source) => source)), (last, source) => last ? [...last, source] : [source], 1e3)((sources) => userDataAutoSyncService.triggerSync(sources, { skipIfSyncedRecently: true })));
    } else {
      this._register(event((source) => userDataAutoSyncService.triggerSync([source], { skipIfSyncedRecently: true })));
    }
  }
  getUserDataEditorInputSource(editorInput) {
    if (!editorInput) {
      return void 0;
    }
    if (editorInput instanceof SettingsEditor2Input) {
      return "settingsEditor";
    }
    if (editorInput instanceof KeybindingsEditorInput) {
      return "keybindingsEditor";
    }
    const resource = editorInput.resource;
    if (isEqual(resource, this.userDataProfilesService.defaultProfile.settingsResource)) {
      return "settingsEditor";
    }
    if (isEqual(resource, this.userDataProfilesService.defaultProfile.keybindingsResource)) {
      return "keybindingsEditor";
    }
    return void 0;
  }
};
UserDataSyncTrigger = __decorate([
  __param(0, IEditorService),
  __param(1, IUserDataProfilesService),
  __param(2, IViewsService),
  __param(3, IUserDataAutoSyncService),
  __param(4, IHostService)
], UserDataSyncTrigger);
export {
  UserDataSyncTrigger
};
//# sourceMappingURL=userDataSyncTrigger.js.map
