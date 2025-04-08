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
import { Event, Emitter } from "../../../../base/common/event.js";
import { VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { IWorkingCopyBackup, IWorkingCopySaveEvent, WorkingCopyCapabilities } from "./workingCopy.js";
import { IFileWorkingCopy, IFileWorkingCopyModel, IFileWorkingCopyModelFactory, SnapshotContext } from "./fileWorkingCopy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IWorkingCopyService } from "./workingCopyService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ISaveOptions } from "../../../common/editor.js";
import { raceCancellation } from "../../../../base/common/async.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkingCopyBackupService } from "./workingCopyBackup.js";
import { emptyStream } from "../../../../base/common/stream.js";
let UntitledFileWorkingCopy = class extends Disposable {
  //#endregion
  constructor(typeId, resource, name, hasAssociatedFilePath, isScratchpad, initialContents, modelFactory, saveDelegate, workingCopyService, workingCopyBackupService, logService) {
    super();
    this.typeId = typeId;
    this.resource = resource;
    this.name = name;
    this.hasAssociatedFilePath = hasAssociatedFilePath;
    this.isScratchpad = isScratchpad;
    this.initialContents = initialContents;
    this.modelFactory = modelFactory;
    this.saveDelegate = saveDelegate;
    this.workingCopyBackupService = workingCopyBackupService;
    this.logService = logService;
    this.capabilities = this.isScratchpad ? WorkingCopyCapabilities.Untitled | WorkingCopyCapabilities.Scratchpad : WorkingCopyCapabilities.Untitled;
    this.modified = this.hasAssociatedFilePath || Boolean(this.initialContents && this.initialContents.markModified !== false);
    this._register(workingCopyService.registerWorkingCopy(this));
  }
  static {
    __name(this, "UntitledFileWorkingCopy");
  }
  capabilities;
  _model = void 0;
  get model() {
    return this._model;
  }
  //#region Events
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  _onDidChangeDirty = this._register(new Emitter());
  onDidChangeDirty = this._onDidChangeDirty.event;
  _onDidSave = this._register(new Emitter());
  onDidSave = this._onDidSave.event;
  _onDidRevert = this._register(new Emitter());
  onDidRevert = this._onDidRevert.event;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  //#region Dirty/Modified
  modified;
  isDirty() {
    return this.modified && !this.isScratchpad;
  }
  isModified() {
    return this.modified;
  }
  setModified(modified) {
    if (this.modified === modified) {
      return;
    }
    this.modified = modified;
    if (!this.isScratchpad) {
      this._onDidChangeDirty.fire();
    }
  }
  //#endregion
  //#region Resolve
  async resolve() {
    this.trace("resolve()");
    if (this.isResolved()) {
      this.trace("resolve() - exit (already resolved)");
      return;
    }
    let untitledContents;
    const backup = await this.workingCopyBackupService.resolve(this);
    if (backup) {
      this.trace("resolve() - with backup");
      untitledContents = backup.value;
    } else if (this.initialContents?.value) {
      this.trace("resolve() - with initial contents");
      untitledContents = this.initialContents.value;
    } else {
      this.trace("resolve() - empty");
      untitledContents = emptyStream();
    }
    await this.doCreateModel(untitledContents);
    this.setModified(this.hasAssociatedFilePath || !!backup || Boolean(this.initialContents && this.initialContents.markModified !== false));
    if (!!backup || this.initialContents) {
      this._onDidChangeContent.fire();
    }
  }
  async doCreateModel(contents) {
    this.trace("doCreateModel()");
    this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
    this.installModelListeners(this._model);
  }
  installModelListeners(model) {
    this._register(model.onDidChangeContent((e) => this.onModelContentChanged(e)));
    this._register(model.onWillDispose(() => this.dispose()));
  }
  onModelContentChanged(e) {
    if (!this.hasAssociatedFilePath && e.isInitial) {
      this.setModified(false);
    } else {
      this.setModified(true);
    }
    this._onDidChangeContent.fire();
  }
  isResolved() {
    return !!this.model;
  }
  //#endregion
  //#region Backup
  get backupDelay() {
    return this.model?.configuration?.backupDelay;
  }
  async backup(token) {
    let content = void 0;
    if (this.isResolved()) {
      content = await raceCancellation(this.model.snapshot(SnapshotContext.Backup, token), token);
    } else if (this.initialContents) {
      content = this.initialContents.value;
    }
    return { content };
  }
  //#endregion
  //#region Save
  async save(options) {
    this.trace("save()");
    const result = await this.saveDelegate(this, options);
    if (result) {
      this._onDidSave.fire({ reason: options?.reason, source: options?.source });
    }
    return result;
  }
  //#endregion
  //#region Revert
  async revert() {
    this.trace("revert()");
    this.setModified(false);
    this._onDidRevert.fire();
    this.dispose();
  }
  //#endregion
  dispose() {
    this.trace("dispose()");
    this._onWillDispose.fire();
    super.dispose();
  }
  trace(msg) {
    this.logService.trace(`[untitled file working copy] ${msg}`, this.resource.toString(), this.typeId);
  }
};
UntitledFileWorkingCopy = __decorateClass([
  __decorateParam(8, IWorkingCopyService),
  __decorateParam(9, IWorkingCopyBackupService),
  __decorateParam(10, ILogService)
], UntitledFileWorkingCopy);
export {
  UntitledFileWorkingCopy
};
//# sourceMappingURL=untitledFileWorkingCopy.js.map
