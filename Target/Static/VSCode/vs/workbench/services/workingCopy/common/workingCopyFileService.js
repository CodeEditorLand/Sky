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
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Event, AsyncEmitter, IWaitUntil } from "../../../../base/common/event.js";
import { Promises } from "../../../../base/common/async.js";
import { insert } from "../../../../base/common/arrays.js";
import { URI } from "../../../../base/common/uri.js";
import { Disposable, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { IFileService, FileOperation, IFileStatWithMetadata } from "../../../../platform/files/common/files.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IWorkingCopyService } from "./workingCopyService.js";
import { IWorkingCopy } from "./workingCopy.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { WorkingCopyFileOperationParticipant } from "./workingCopyFileOperationParticipant.js";
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { SaveReason } from "../../../common/editor.js";
import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
import { StoredFileWorkingCopySaveParticipant } from "./storedFileWorkingCopySaveParticipant.js";
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from "./storedFileWorkingCopy.js";
const IWorkingCopyFileService = createDecorator("workingCopyFileService");
let WorkingCopyFileService = class extends Disposable {
  constructor(fileService, workingCopyService, instantiationService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.workingCopyService = workingCopyService;
    this.uriIdentityService = uriIdentityService;
    this.fileOperationParticipants = this._register(instantiationService.createInstance(WorkingCopyFileOperationParticipant));
    this.saveParticipants = this._register(instantiationService.createInstance(StoredFileWorkingCopySaveParticipant));
    this._register(this.registerWorkingCopyProvider((resource) => {
      return this.workingCopyService.workingCopies.filter((workingCopy) => {
        if (this.fileService.hasProvider(resource)) {
          return this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, resource);
        }
        return this.uriIdentityService.extUri.isEqual(workingCopy.resource, resource);
      });
    }));
  }
  static {
    __name(this, "WorkingCopyFileService");
  }
  //#region Events
  _onWillRunWorkingCopyFileOperation = this._register(new AsyncEmitter());
  onWillRunWorkingCopyFileOperation = this._onWillRunWorkingCopyFileOperation.event;
  _onDidFailWorkingCopyFileOperation = this._register(new AsyncEmitter());
  onDidFailWorkingCopyFileOperation = this._onDidFailWorkingCopyFileOperation.event;
  _onDidRunWorkingCopyFileOperation = this._register(new AsyncEmitter());
  onDidRunWorkingCopyFileOperation = this._onDidRunWorkingCopyFileOperation.event;
  //#endregion
  correlationIds = 0;
  //#region File operations
  create(operations, token, undoInfo) {
    return this.doCreateFileOrFolder(operations, true, token, undoInfo);
  }
  createFolder(operations, token, undoInfo) {
    return this.doCreateFileOrFolder(operations, false, token, undoInfo);
  }
  async doCreateFileOrFolder(operations, isFile, token, undoInfo) {
    if (operations.length === 0) {
      return [];
    }
    if (isFile) {
      const validateCreates = await Promises.settled(operations.map((operation) => this.fileService.canCreateFile(operation.resource, { overwrite: operation.overwrite })));
      const error = validateCreates.find((validateCreate) => validateCreate instanceof Error);
      if (error instanceof Error) {
        throw error;
      }
    }
    const files = operations.map((operation) => ({ target: operation.resource }));
    await this.runFileOperationParticipants(files, FileOperation.CREATE, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: FileOperation.CREATE, files };
    await this._onWillRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    let stats;
    try {
      if (isFile) {
        stats = await Promises.settled(operations.map((operation) => this.fileService.createFile(operation.resource, operation.contents, { overwrite: operation.overwrite })));
      } else {
        stats = await Promises.settled(operations.map((operation) => this.fileService.createFolder(operation.resource)));
      }
    } catch (error) {
      await this._onDidFailWorkingCopyFileOperation.fireAsync(
        event,
        CancellationToken.None
        /* intentional: we currently only forward cancellation to participants */
      );
      throw error;
    }
    await this._onDidRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    return stats;
  }
  async move(operations, token, undoInfo) {
    return this.doMoveOrCopy(operations, true, token, undoInfo);
  }
  async copy(operations, token, undoInfo) {
    return this.doMoveOrCopy(operations, false, token, undoInfo);
  }
  async doMoveOrCopy(operations, move, token, undoInfo) {
    const stats = [];
    for (const { file: { source, target }, overwrite } of operations) {
      const validateMoveOrCopy = await (move ? this.fileService.canMove(source, target, overwrite) : this.fileService.canCopy(source, target, overwrite));
      if (validateMoveOrCopy instanceof Error) {
        throw validateMoveOrCopy;
      }
    }
    const files = operations.map((o) => o.file);
    await this.runFileOperationParticipants(files, move ? FileOperation.MOVE : FileOperation.COPY, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: move ? FileOperation.MOVE : FileOperation.COPY, files };
    await this._onWillRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    try {
      for (const { file: { source, target }, overwrite } of operations) {
        if (!this.uriIdentityService.extUri.isEqual(source, target)) {
          const dirtyWorkingCopies = move ? [...this.getDirty(source), ...this.getDirty(target)] : this.getDirty(target);
          await Promises.settled(dirtyWorkingCopies.map((dirtyWorkingCopy) => dirtyWorkingCopy.revert({ soft: true })));
        }
        if (move) {
          stats.push(await this.fileService.move(source, target, overwrite));
        } else {
          stats.push(await this.fileService.copy(source, target, overwrite));
        }
      }
    } catch (error) {
      await this._onDidFailWorkingCopyFileOperation.fireAsync(
        event,
        CancellationToken.None
        /* intentional: we currently only forward cancellation to participants */
      );
      throw error;
    }
    await this._onDidRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    return stats;
  }
  async delete(operations, token, undoInfo) {
    for (const operation of operations) {
      const validateDelete = await this.fileService.canDelete(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
      if (validateDelete instanceof Error) {
        throw validateDelete;
      }
    }
    const files = operations.map((operation) => ({ target: operation.resource }));
    await this.runFileOperationParticipants(files, FileOperation.DELETE, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: FileOperation.DELETE, files };
    await this._onWillRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    for (const operation of operations) {
      const dirtyWorkingCopies = this.getDirty(operation.resource);
      await Promises.settled(dirtyWorkingCopies.map((dirtyWorkingCopy) => dirtyWorkingCopy.revert({ soft: true })));
    }
    try {
      for (const operation of operations) {
        await this.fileService.del(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
      }
    } catch (error) {
      await this._onDidFailWorkingCopyFileOperation.fireAsync(
        event,
        CancellationToken.None
        /* intentional: we currently only forward cancellation to participants */
      );
      throw error;
    }
    await this._onDidRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
  }
  //#endregion
  //#region File operation participants
  fileOperationParticipants;
  addFileOperationParticipant(participant) {
    return this.fileOperationParticipants.addFileOperationParticipant(participant);
  }
  runFileOperationParticipants(files, operation, undoInfo, token) {
    return this.fileOperationParticipants.participate(files, operation, undoInfo, token);
  }
  //#endregion
  //#region Save participants (stored file working copies only)
  saveParticipants;
  get hasSaveParticipants() {
    return this.saveParticipants.length > 0;
  }
  addSaveParticipant(participant) {
    return this.saveParticipants.addSaveParticipant(participant);
  }
  runSaveParticipants(workingCopy, context, progress, token) {
    return this.saveParticipants.participate(workingCopy, context, progress, token);
  }
  //#endregion
  //#region Path related
  workingCopyProviders = [];
  registerWorkingCopyProvider(provider) {
    const remove = insert(this.workingCopyProviders, provider);
    return toDisposable(remove);
  }
  getDirty(resource) {
    const dirtyWorkingCopies = /* @__PURE__ */ new Set();
    for (const provider of this.workingCopyProviders) {
      for (const workingCopy of provider(resource)) {
        if (workingCopy.isDirty()) {
          dirtyWorkingCopies.add(workingCopy);
        }
      }
    }
    return Array.from(dirtyWorkingCopies);
  }
  //#endregion
};
WorkingCopyFileService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IWorkingCopyService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IUriIdentityService)
], WorkingCopyFileService);
registerSingleton(IWorkingCopyFileService, WorkingCopyFileService, InstantiationType.Delayed);
export {
  IWorkingCopyFileService,
  WorkingCopyFileService
};
//# sourceMappingURL=workingCopyFileService.js.map
