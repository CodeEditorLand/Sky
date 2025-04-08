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
import { VSBufferReadableStream, streamToBuffer } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWriteFileOptions, IFileStatWithMetadata } from "../../../../platform/files/common/files.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IRevertOptions, ISaveOptions, IUntypedEditorInput } from "../../../common/editor.js";
import { EditorModel } from "../../../common/editor/editorModel.js";
import { NotebookTextModel } from "./model/notebookTextModel.js";
import { INotebookEditorModel, INotebookLoadOptions, IResolvedNotebookEditorModel, NotebookCellsChangeType, NotebookSetting } from "./notebookCommon.js";
import { INotebookLoggingService } from "./notebookLoggingService.js";
import { INotebookSerializer, INotebookService, SimpleNotebookProviderInfo } from "./notebookService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IFileWorkingCopyModelConfiguration, SnapshotContext } from "../../../services/workingCopy/common/fileWorkingCopy.js";
import { IFileWorkingCopyManager } from "../../../services/workingCopy/common/fileWorkingCopyManager.js";
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelContentChangedEvent, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopySaveEvent, StoredFileWorkingCopyState } from "../../../services/workingCopy/common/storedFileWorkingCopy.js";
import { IUntitledFileWorkingCopy, IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelContentChangedEvent, IUntitledFileWorkingCopyModelFactory } from "../../../services/workingCopy/common/untitledFileWorkingCopy.js";
import { WorkingCopyCapabilities } from "../../../services/workingCopy/common/workingCopy.js";
let SimpleNotebookEditorModel = class extends EditorModel {
  constructor(resource, _hasAssociatedFilePath, viewType, _workingCopyManager, scratchpad, _filesConfigurationService) {
    super();
    this.resource = resource;
    this._hasAssociatedFilePath = _hasAssociatedFilePath;
    this.viewType = viewType;
    this._workingCopyManager = _workingCopyManager;
    this._filesConfigurationService = _filesConfigurationService;
    this.scratchPad = scratchpad;
  }
  static {
    __name(this, "SimpleNotebookEditorModel");
  }
  _onDidChangeDirty = this._register(new Emitter());
  _onDidSave = this._register(new Emitter());
  _onDidChangeOrphaned = this._register(new Emitter());
  _onDidChangeReadonly = this._register(new Emitter());
  _onDidRevertUntitled = this._register(new Emitter());
  onDidChangeDirty = this._onDidChangeDirty.event;
  onDidSave = this._onDidSave.event;
  onDidChangeOrphaned = this._onDidChangeOrphaned.event;
  onDidChangeReadonly = this._onDidChangeReadonly.event;
  onDidRevertUntitled = this._onDidRevertUntitled.event;
  _workingCopy;
  _workingCopyListeners = this._register(new DisposableStore());
  scratchPad;
  dispose() {
    this._workingCopy?.dispose();
    super.dispose();
  }
  get notebook() {
    return this._workingCopy?.model?.notebookModel;
  }
  isResolved() {
    return Boolean(this._workingCopy?.model?.notebookModel);
  }
  async canDispose() {
    if (!this._workingCopy) {
      return true;
    }
    if (SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy)) {
      return this._workingCopyManager.stored.canDispose(this._workingCopy);
    } else {
      return true;
    }
  }
  isDirty() {
    return this._workingCopy?.isDirty() ?? false;
  }
  isModified() {
    return this._workingCopy?.isModified() ?? false;
  }
  isOrphaned() {
    return SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy) && this._workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN);
  }
  hasAssociatedFilePath() {
    return !SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy) && !!this._workingCopy?.hasAssociatedFilePath;
  }
  isReadonly() {
    if (SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy)) {
      return this._workingCopy?.isReadonly();
    } else {
      return this._filesConfigurationService.isReadonly(this.resource);
    }
  }
  get hasErrorState() {
    if (this._workingCopy && "hasState" in this._workingCopy) {
      return this._workingCopy.hasState(StoredFileWorkingCopyState.ERROR);
    }
    return false;
  }
  async revert(options) {
    assertType(this.isResolved());
    return this._workingCopy.revert(options);
  }
  async save(options) {
    assertType(this.isResolved());
    return this._workingCopy.save(options);
  }
  async load(options) {
    if (!this._workingCopy || !this._workingCopy.model) {
      if (this.resource.scheme === Schemas.untitled) {
        if (this._hasAssociatedFilePath) {
          this._workingCopy = await this._workingCopyManager.resolve({ associatedResource: this.resource });
        } else {
          this._workingCopy = await this._workingCopyManager.resolve({ untitledResource: this.resource, isScratchpad: this.scratchPad });
        }
        this._register(this._workingCopy.onDidRevert(() => this._onDidRevertUntitled.fire()));
      } else {
        this._workingCopy = await this._workingCopyManager.resolve(this.resource, {
          limits: options?.limits,
          reload: options?.forceReadFromFile ? { async: false, force: true } : void 0
        });
        this._workingCopyListeners.add(this._workingCopy.onDidSave((e) => this._onDidSave.fire(e)));
        this._workingCopyListeners.add(this._workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
        this._workingCopyListeners.add(this._workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
      }
      this._workingCopyListeners.add(this._workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(), void 0));
      this._workingCopyListeners.add(this._workingCopy.onWillDispose(() => {
        this._workingCopyListeners.clear();
        this._workingCopy?.model?.dispose();
      }));
    } else {
      await this._workingCopyManager.resolve(this.resource, {
        reload: {
          async: !options?.forceReadFromFile,
          force: options?.forceReadFromFile
        },
        limits: options?.limits
      });
    }
    assertType(this.isResolved());
    return this;
  }
  async saveAs(target) {
    const newWorkingCopy = await this._workingCopyManager.saveAs(this.resource, target);
    if (!newWorkingCopy) {
      return void 0;
    }
    return { resource: newWorkingCopy.resource };
  }
  static _isStoredFileWorkingCopy(candidate) {
    const isUntitled = candidate && candidate.capabilities & WorkingCopyCapabilities.Untitled;
    return !isUntitled;
  }
};
SimpleNotebookEditorModel = __decorateClass([
  __decorateParam(5, IFilesConfigurationService)
], SimpleNotebookEditorModel);
class NotebookFileWorkingCopyModel extends Disposable {
  constructor(_notebookModel, _notebookService, _configurationService, _telemetryService, _notebookLogService) {
    super();
    this._notebookModel = _notebookModel;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._notebookLogService = _notebookLogService;
    this.onWillDispose = _notebookModel.onWillDispose.bind(_notebookModel);
    this._register(_notebookModel.onDidChangeContent((e) => {
      for (const rawEvent of e.rawEvents) {
        if (rawEvent.kind === NotebookCellsChangeType.Initialize) {
          continue;
        }
        if (rawEvent.transient) {
          continue;
        }
        this._onDidChangeContent.fire({
          isRedoing: false,
          //todo@rebornix forward this information from notebook model
          isUndoing: false,
          isInitial: false
          //_notebookModel.cells.length === 0 // todo@jrieken non transient metadata?
        });
        break;
      }
    }));
    const saveWithReducedCommunication = this._configurationService.getValue(NotebookSetting.remoteSaving);
    if (saveWithReducedCommunication || _notebookModel.uri.scheme === Schemas.vscodeRemote) {
      this.configuration = {
        // Intentionally pick a larger delay for triggering backups to allow auto-save
        // to complete first on the optimized save path
        backupDelay: 1e4
      };
    }
    if (saveWithReducedCommunication) {
      this.setSaveDelegate().catch(console.error);
    }
  }
  static {
    __name(this, "NotebookFileWorkingCopyModel");
  }
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  onWillDispose;
  configuration = void 0;
  save;
  async setSaveDelegate() {
    await this.getNotebookSerializer();
    this.save = async (options, token) => {
      try {
        let serializer = this._notebookService.tryGetDataProviderSync(this.notebookModel.viewType)?.serializer;
        if (!serializer) {
          this._notebookLogService.info("WorkingCopyModel", "No serializer found for notebook model, checking if provider still needs to be resolved");
          serializer = await this.getNotebookSerializer();
        }
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        const stat = await serializer.save(this._notebookModel.uri, this._notebookModel.versionId, options, token);
        return stat;
      } catch (error) {
        if (!token.isCancellationRequested) {
          const isIPynb = this._notebookModel.viewType === "jupyter-notebook" || this._notebookModel.viewType === "interactive";
          this._telemetryService.publicLogError2("notebook/SaveError", {
            isRemote: this._notebookModel.uri.scheme === Schemas.vscodeRemote,
            isIPyNbWorkerSerializer: isIPynb && this._configurationService.getValue("ipynb.experimental.serialization"),
            error
          });
        }
        throw error;
      }
    };
  }
  dispose() {
    this._notebookModel.dispose();
    super.dispose();
  }
  get notebookModel() {
    return this._notebookModel;
  }
  async snapshot(context, token) {
    return this._notebookService.createNotebookTextDocumentSnapshot(this._notebookModel.uri, context, token);
  }
  async update(stream, token) {
    const serializer = await this.getNotebookSerializer();
    const bytes = await streamToBuffer(stream);
    const data = await serializer.dataToNotebook(bytes);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    this._notebookLogService.info("WorkingCopyModel", "Notebook content updated from file system - " + this._notebookModel.uri.toString());
    this._notebookModel.reset(data.cells, data.metadata, serializer.options);
  }
  async getNotebookSerializer() {
    const info = await this._notebookService.withNotebookDataProvider(this.notebookModel.viewType);
    if (!(info instanceof SimpleNotebookProviderInfo)) {
      throw new Error("CANNOT open file notebook with this provider");
    }
    return info.serializer;
  }
  get versionId() {
    return this._notebookModel.alternativeVersionId;
  }
  pushStackElement() {
    this._notebookModel.pushStackElement();
  }
}
let NotebookFileWorkingCopyModelFactory = class {
  constructor(_viewType, _notebookService, _configurationService, _telemetryService, _notebookLogService) {
    this._viewType = _viewType;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._notebookLogService = _notebookLogService;
  }
  static {
    __name(this, "NotebookFileWorkingCopyModelFactory");
  }
  async createModel(resource, stream, token) {
    const notebookModel = this._notebookService.getNotebookTextModel(resource) ?? await this._notebookService.createNotebookTextModel(this._viewType, resource, stream);
    return new NotebookFileWorkingCopyModel(notebookModel, this._notebookService, this._configurationService, this._telemetryService, this._notebookLogService);
  }
};
NotebookFileWorkingCopyModelFactory = __decorateClass([
  __decorateParam(1, INotebookService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INotebookLoggingService)
], NotebookFileWorkingCopyModelFactory);
export {
  NotebookFileWorkingCopyModel,
  NotebookFileWorkingCopyModelFactory,
  SimpleNotebookEditorModel
};
//# sourceMappingURL=notebookEditorModel.js.map
