var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AsyncEmitter } from "../../../../base/common/event.js";
import { Promises } from "../../../../base/common/async.js";
import { insert } from "../../../../base/common/arrays.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IWorkingCopyService } from "./workingCopyService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { WorkingCopyFileOperationParticipant } from "./workingCopyFileOperationParticipant.js";
import { StoredFileWorkingCopySaveParticipant } from "./storedFileWorkingCopySaveParticipant.js";
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
const IWorkingCopyFileService = createDecorator("workingCopyFileService");
let WorkingCopyFileService = class WorkingCopyFileService2 extends Disposable {
  static {
    __name(this, "WorkingCopyFileService");
  }
  constructor(fileService, workingCopyService, instantiationService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.workingCopyService = workingCopyService;
    this.uriIdentityService = uriIdentityService;
    this._onWillRunWorkingCopyFileOperation = this._register(new AsyncEmitter());
    this.onWillRunWorkingCopyFileOperation = this._onWillRunWorkingCopyFileOperation.event;
    this._onDidFailWorkingCopyFileOperation = this._register(new AsyncEmitter());
    this.onDidFailWorkingCopyFileOperation = this._onDidFailWorkingCopyFileOperation.event;
    this._onDidRunWorkingCopyFileOperation = this._register(new AsyncEmitter());
    this.onDidRunWorkingCopyFileOperation = this._onDidRunWorkingCopyFileOperation.event;
    this.correlationIds = 0;
    this.workingCopyProviders = [];
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
    await this.runFileOperationParticipants(files, 0, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: 0, files };
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
    await this.runFileOperationParticipants(files, move ? 2 : 3, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: move ? 2 : 3, files };
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
    await this.runFileOperationParticipants(files, 1, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: 1, files };
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
  addFileOperationParticipant(participant) {
    return this.fileOperationParticipants.addFileOperationParticipant(participant);
  }
  runFileOperationParticipants(files, operation, undoInfo, token) {
    return this.fileOperationParticipants.participate(files, operation, undoInfo, token);
  }
  get hasSaveParticipants() {
    return this.saveParticipants.length > 0;
  }
  addSaveParticipant(participant) {
    return this.saveParticipants.addSaveParticipant(participant);
  }
  runSaveParticipants(workingCopy, context, progress, token) {
    return this.saveParticipants.participate(workingCopy, context, progress, token);
  }
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
};
WorkingCopyFileService = __decorate([
  __param(0, IFileService),
  __param(1, IWorkingCopyService),
  __param(2, IInstantiationService),
  __param(3, IUriIdentityService)
], WorkingCopyFileService);
registerSingleton(
  IWorkingCopyFileService,
  WorkingCopyFileService,
  1
  /* InstantiationType.Delayed */
);
export {
  IWorkingCopyFileService,
  WorkingCopyFileService
};
//# sourceMappingURL=workingCopyFileService.js.map
