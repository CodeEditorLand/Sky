var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { VIEWLET_ID } from "./files.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IActivityService, NumberBadge } from "../../../services/activity/common/activity.js";
import { IWorkingCopyService } from "../../../services/workingCopy/common/workingCopyService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
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
let DirtyFilesIndicator = class DirtyFilesIndicator2 extends Disposable {
  static {
    __name(this, "DirtyFilesIndicator");
  }
  static {
    this.ID = "workbench.contrib.dirtyFilesIndicator";
  }
  constructor(activityService, workingCopyService, filesConfigurationService) {
    super();
    this.activityService = activityService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.badgeHandle = this._register(new MutableDisposable());
    this.lastKnownDirtyCount = 0;
    this.updateActivityBadge();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.onWorkingCopyDidChangeDirty(workingCopy)));
  }
  onWorkingCopyDidChangeDirty(workingCopy) {
    const gotDirty = workingCopy.isDirty();
    if (gotDirty && !(workingCopy.capabilities & 2) && this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource)) {
      return;
    }
    if (gotDirty || this.lastKnownDirtyCount > 0) {
      this.updateActivityBadge();
    }
  }
  updateActivityBadge() {
    const dirtyCount = this.lastKnownDirtyCount = this.workingCopyService.dirtyCount;
    if (dirtyCount > 0) {
      this.badgeHandle.value = this.activityService.showViewContainerActivity(VIEWLET_ID, {
        badge: new NumberBadge(dirtyCount, (num) => num === 1 ? nls.localize("dirtyFile", "1 unsaved file") : nls.localize("dirtyFiles", "{0} unsaved files", dirtyCount))
      });
    } else {
      this.badgeHandle.clear();
    }
  }
};
DirtyFilesIndicator = __decorate([
  __param(0, IActivityService),
  __param(1, IWorkingCopyService),
  __param(2, IFilesConfigurationService)
], DirtyFilesIndicator);
export {
  DirtyFilesIndicator
};
//# sourceMappingURL=dirtyFilesIndicator.js.map
