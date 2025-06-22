var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
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
let ResourceWorkingCopy = class ResourceWorkingCopy2 extends Disposable {
  static {
    __name(this, "ResourceWorkingCopy");
  }
  constructor(resource, fileService) {
    super();
    this.resource = resource;
    this.fileService = fileService;
    this._onDidChangeOrphaned = this._register(new Emitter());
    this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    this.orphaned = false;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._register(this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e)));
  }
  isOrphaned() {
    return this.orphaned;
  }
  async onDidFilesChange(e) {
    let fileEventImpactsUs = false;
    let newInOrphanModeGuess;
    if (this.orphaned) {
      const fileWorkingCopyResourceAdded = e.contains(
        this.resource,
        1
        /* FileChangeType.ADDED */
      );
      if (fileWorkingCopyResourceAdded) {
        newInOrphanModeGuess = false;
        fileEventImpactsUs = true;
      }
    } else {
      const fileWorkingCopyResourceDeleted = e.contains(
        this.resource,
        2
        /* FileChangeType.DELETED */
      );
      if (fileWorkingCopyResourceDeleted) {
        newInOrphanModeGuess = true;
        fileEventImpactsUs = true;
      }
    }
    if (fileEventImpactsUs && this.orphaned !== newInOrphanModeGuess) {
      let newInOrphanModeValidated = false;
      if (newInOrphanModeGuess) {
        await timeout(100, CancellationToken.None);
        if (this.isDisposed()) {
          newInOrphanModeValidated = true;
        } else {
          const exists = await this.fileService.exists(this.resource);
          newInOrphanModeValidated = !exists;
        }
      }
      if (this.orphaned !== newInOrphanModeValidated && !this.isDisposed()) {
        this.setOrphaned(newInOrphanModeValidated);
      }
    }
  }
  setOrphaned(orphaned) {
    if (this.orphaned !== orphaned) {
      this.orphaned = orphaned;
      this._onDidChangeOrphaned.fire();
    }
  }
  isDisposed() {
    return this._store.isDisposed;
  }
  dispose() {
    this.orphaned = false;
    this._onWillDispose.fire();
    super.dispose();
  }
  //#endregion
  //#region Modified Tracking
  isModified() {
    return this.isDirty();
  }
};
ResourceWorkingCopy = __decorate([
  __param(1, IFileService)
], ResourceWorkingCopy);
export {
  ResourceWorkingCopy
};
//# sourceMappingURL=resourceWorkingCopy.js.map
