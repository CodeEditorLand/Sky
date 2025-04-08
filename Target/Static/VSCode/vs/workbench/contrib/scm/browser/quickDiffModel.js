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
import { ResourceMap } from "../../../../base/common/map.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { EncodingMode, IResolvedTextFileEditorModel, isTextFileEditorModel, ITextFileEditorModel, ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { Disposable, DisposableMap, DisposableStore, IReference, ReferenceCollection } from "../../../../base/common/lifecycle.js";
import { DiffAlgorithmName, IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { URI } from "../../../../base/common/uri.js";
import { IChange } from "../../../../editor/common/diff/legacyLinesDiffComputer.js";
import { IResolvedTextEditorModel, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ITextModel, shouldSynchronizeModel } from "../../../../editor/common/model.js";
import { compareChanges, getModifiedEndLineNumber, IQuickDiffService, QuickDiff, QuickDiffChange, QuickDiffResult } from "../common/quickDiff.js";
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { ISCMRepository, ISCMService } from "../common/scm.js";
import { sortedDiff, equals } from "../../../../base/common/arrays.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { ISplice } from "../../../../base/common/sequence.js";
import { DiffState } from "../../../../editor/browser/widget/diffEditor/diffEditorViewModel.js";
import { toLineChanges } from "../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";
import { LineRangeMapping } from "../../../../editor/common/diff/rangeMapping.js";
import { IDiffEditorModel } from "../../../../editor/common/editorCommon.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IProgressService, ProgressLocation } from "../../../../platform/progress/common/progress.js";
import { IChatEditingService, ModifiedFileEntryState } from "../../chat/common/chatEditingService.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { autorun, autorunWithStore } from "../../../../base/common/observable.js";
const IQuickDiffModelService = createDecorator("IQuickDiffModelService");
const decoratorQuickDiffModelOptions = {
  algorithm: "legacy",
  maxComputationTimeMs: 1e3
};
let QuickDiffModelReferenceCollection = class extends ReferenceCollection {
  constructor(_instantiationService) {
    super();
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "QuickDiffModelReferenceCollection");
  }
  createReferencedObject(_key, textFileModel, options) {
    return this._instantiationService.createInstance(QuickDiffModel, textFileModel, options);
  }
  destroyReferencedObject(_key, object) {
    object.dispose();
  }
};
QuickDiffModelReferenceCollection = __decorateClass([
  __decorateParam(0, IInstantiationService)
], QuickDiffModelReferenceCollection);
let QuickDiffModelService = class {
  constructor(instantiationService, textFileService, uriIdentityService) {
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this._references = this.instantiationService.createInstance(QuickDiffModelReferenceCollection);
  }
  static {
    __name(this, "QuickDiffModelService");
  }
  _serviceBrand;
  _references;
  createQuickDiffModelReference(resource, options = decoratorQuickDiffModelOptions) {
    const textFileModel = this.textFileService.files.get(resource);
    if (!textFileModel?.isResolved()) {
      return void 0;
    }
    resource = this.uriIdentityService.asCanonicalUri(resource).with({ query: JSON.stringify(options) });
    return this._references.acquire(resource.toString(), textFileModel, options);
  }
};
QuickDiffModelService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IUriIdentityService)
], QuickDiffModelService);
let QuickDiffModel = class extends Disposable {
  constructor(textFileModel, options, scmService, quickDiffService, editorWorkerService, configurationService, textModelResolverService, _chatEditingService, progressService) {
    super();
    this.options = options;
    this.scmService = scmService;
    this.quickDiffService = quickDiffService;
    this.editorWorkerService = editorWorkerService;
    this.configurationService = configurationService;
    this.textModelResolverService = textModelResolverService;
    this._chatEditingService = _chatEditingService;
    this.progressService = progressService;
    this._model = textFileModel;
    this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
    this._register(
      Event.filter(
        configurationService.onDidChangeConfiguration,
        (e) => e.affectsConfiguration("scm.diffDecorationsIgnoreTrimWhitespace") || e.affectsConfiguration("diffEditor.ignoreTrimWhitespace")
      )(this.triggerDiff, this)
    );
    this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
    for (const r of scmService.repositories) {
      this.onDidAddRepository(r);
    }
    this._register(this._model.onDidChangeEncoding(() => {
      this._diffDelayer.cancel();
      this._quickDiffs = [];
      this._originalEditorModels.clear();
      this._quickDiffsPromise = void 0;
      this.setChanges([], /* @__PURE__ */ new Map());
      this.triggerDiff();
    }));
    this._register(this.quickDiffService.onDidChangeQuickDiffProviders(() => this.triggerDiff()));
    this._register(autorunWithStore((r, store) => {
      for (const session of this._chatEditingService.editingSessionsObs.read(r)) {
        store.add(autorun((r2) => {
          for (const entry of session.entries.read(r2)) {
            entry.state.read(r2);
          }
          this.triggerDiff();
        }));
      }
    }));
    this.triggerDiff();
  }
  static {
    __name(this, "QuickDiffModel");
  }
  _model;
  _originalEditorModels = new ResourceMap();
  _originalEditorModelsDisposables = this._register(new DisposableStore());
  get originalTextModels() {
    return Iterable.map(this._originalEditorModels.values(), (editorModel) => editorModel.textEditorModel);
  }
  _disposed = false;
  _quickDiffs = [];
  _quickDiffsPromise;
  _diffDelayer = new ThrottledDelayer(200);
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _changes = [];
  get changes() {
    return this._changes;
  }
  /**
   * Map of quick diff name to the index of the change in `this.changes`
   */
  _quickDiffChanges = /* @__PURE__ */ new Map();
  get quickDiffChanges() {
    return this._quickDiffChanges;
  }
  _repositoryDisposables = new DisposableMap();
  get quickDiffs() {
    return this._quickDiffs;
  }
  getQuickDiffResults() {
    return this._quickDiffs.map((quickDiff) => {
      const changes = this.changes.filter((change) => change.label === quickDiff.label);
      return {
        label: quickDiff.label,
        original: quickDiff.originalResource,
        modified: this._model.resource,
        changes: changes.map((change) => change.change),
        changes2: changes.map((change) => change.change2)
      };
    });
  }
  getDiffEditorModel(originalUri) {
    const editorModel = this._originalEditorModels.get(originalUri);
    return editorModel ? {
      modified: this._model.textEditorModel,
      original: editorModel.textEditorModel
    } : void 0;
  }
  onDidAddRepository(repository) {
    const disposables = new DisposableStore();
    disposables.add(repository.provider.onDidChangeResources(this.triggerDiff, this));
    const onDidRemoveRepository = Event.filter(this.scmService.onDidRemoveRepository, (r) => r === repository);
    disposables.add(onDidRemoveRepository(() => this._repositoryDisposables.deleteAndDispose(repository)));
    this._repositoryDisposables.set(repository, disposables);
    this.triggerDiff();
  }
  triggerDiff() {
    if (!this._diffDelayer) {
      return;
    }
    this._diffDelayer.trigger(async () => {
      const result = await this.diff();
      const editorModels = Array.from(this._originalEditorModels.values());
      if (!result || this._disposed || this._model.isDisposed() || editorModels.some((editorModel) => editorModel.isDisposed())) {
        return;
      }
      this.setChanges(result.changes, result.mapChanges);
    }).catch((err) => onUnexpectedError(err));
  }
  setChanges(changes, mapChanges) {
    const diff = sortedDiff(this.changes, changes, (a, b) => compareChanges(a.change, b.change));
    this._changes = changes;
    this._quickDiffChanges = mapChanges;
    this._onDidChange.fire({ changes, diff });
  }
  diff() {
    return this.progressService.withProgress({ location: ProgressLocation.Scm, delay: 250 }, async () => {
      const originalURIs = await this.getQuickDiffsPromise();
      if (this._disposed || this._model.isDisposed() || originalURIs.length === 0) {
        return Promise.resolve({ changes: [], mapChanges: /* @__PURE__ */ new Map() });
      }
      const filteredToDiffable = originalURIs.filter((quickDiff) => this.editorWorkerService.canComputeDirtyDiff(quickDiff.originalResource, this._model.resource));
      if (filteredToDiffable.length === 0) {
        return Promise.resolve({ changes: [], mapChanges: /* @__PURE__ */ new Map() });
      }
      const ignoreTrimWhitespaceSetting = this.configurationService.getValue("scm.diffDecorationsIgnoreTrimWhitespace");
      const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === "inherit" ? this.configurationService.getValue("diffEditor.ignoreTrimWhitespace") : ignoreTrimWhitespaceSetting !== "false";
      const allDiffs = [];
      for (const quickDiff of filteredToDiffable) {
        const diff = await this._diff(quickDiff.originalResource, this._model.resource, ignoreTrimWhitespace);
        if (diff.changes && diff.changes2 && diff.changes.length === diff.changes2.length) {
          for (let index = 0; index < diff.changes.length; index++) {
            allDiffs.push({
              label: quickDiff.label,
              original: quickDiff.originalResource,
              modified: this._model.resource,
              change: diff.changes[index],
              change2: diff.changes2[index]
            });
          }
        }
      }
      const sorted = allDiffs.sort((a, b) => compareChanges(a.change, b.change));
      const map = /* @__PURE__ */ new Map();
      for (let i = 0; i < sorted.length; i++) {
        const label = sorted[i].label;
        if (!map.has(label)) {
          map.set(label, []);
        }
        map.get(label).push(i);
      }
      return { changes: sorted, mapChanges: map };
    });
  }
  async _diff(original, modified, ignoreTrimWhitespace) {
    const maxComputationTimeMs = this.options.maxComputationTimeMs ?? Number.MAX_SAFE_INTEGER;
    const result = await this.editorWorkerService.computeDiff(original, modified, {
      computeMoves: false,
      ignoreTrimWhitespace,
      maxComputationTimeMs
    }, this.options.algorithm);
    return { changes: result ? toLineChanges(DiffState.fromDiffResult(result)) : null, changes2: result?.changes ?? null };
  }
  getQuickDiffsPromise() {
    if (this._quickDiffsPromise) {
      return this._quickDiffsPromise;
    }
    this._quickDiffsPromise = this.getOriginalResource().then(async (quickDiffs) => {
      if (this._disposed) {
        return [];
      }
      if (quickDiffs.length === 0) {
        this._quickDiffs = [];
        this._originalEditorModels.clear();
        return [];
      }
      if (equals(this._quickDiffs, quickDiffs, (a, b) => a.originalResource.toString() === b.originalResource.toString() && a.label === b.label)) {
        return quickDiffs;
      }
      this._quickDiffs = quickDiffs;
      this._originalEditorModels.clear();
      this._originalEditorModelsDisposables.clear();
      return (await Promise.all(quickDiffs.map(async (quickDiff) => {
        try {
          const ref = await this.textModelResolverService.createModelReference(quickDiff.originalResource);
          if (this._disposed) {
            ref.dispose();
            return [];
          }
          this._originalEditorModels.set(quickDiff.originalResource, ref.object);
          if (isTextFileEditorModel(ref.object)) {
            const encoding = this._model.getEncoding();
            if (encoding) {
              ref.object.setEncoding(encoding, EncodingMode.Decode);
            }
          }
          this._originalEditorModelsDisposables.add(ref);
          this._originalEditorModelsDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
          return quickDiff;
        } catch (error) {
          return [];
        }
      }))).flat();
    });
    return this._quickDiffsPromise.finally(() => {
      this._quickDiffsPromise = void 0;
    });
  }
  async getOriginalResource() {
    if (this._disposed) {
      return Promise.resolve([]);
    }
    const uri = this._model.resource;
    const isBeingModifiedByChatEdits = this._chatEditingService.editingSessionsObs.get().some((session) => session.getEntry(uri)?.state.get() === ModifiedFileEntryState.Modified);
    if (isBeingModifiedByChatEdits) {
      return Promise.resolve([]);
    }
    const isSynchronized = this._model.textEditorModel ? shouldSynchronizeModel(this._model.textEditorModel) : void 0;
    return this.quickDiffService.getQuickDiffs(uri, this._model.getLanguageId(), isSynchronized);
  }
  findNextClosestChange(lineNumber, inclusive = true, provider) {
    let preferredProvider;
    if (!provider && inclusive) {
      preferredProvider = this.quickDiffs.find((value) => value.isSCM)?.label;
    }
    const possibleChanges = [];
    for (let i = 0; i < this.changes.length; i++) {
      if (provider && this.changes[i].label !== provider) {
        continue;
      }
      if (!this.quickDiffs.find((quickDiff) => quickDiff.label === this.changes[i].label)?.visible) {
        continue;
      }
      const change = this.changes[i];
      const possibleChangesLength = possibleChanges.length;
      if (inclusive) {
        if (getModifiedEndLineNumber(change.change) >= lineNumber) {
          if (preferredProvider && change.label !== preferredProvider) {
            possibleChanges.push(i);
          } else {
            return i;
          }
        }
      } else {
        if (change.change.modifiedStartLineNumber > lineNumber) {
          return i;
        }
      }
      if (possibleChanges.length > 0 && possibleChanges.length === possibleChangesLength) {
        return possibleChanges[0];
      }
    }
    return possibleChanges.length > 0 ? possibleChanges[0] : 0;
  }
  findPreviousClosestChange(lineNumber, inclusive = true, provider) {
    for (let i = this.changes.length - 1; i >= 0; i--) {
      if (provider && this.changes[i].label !== provider) {
        continue;
      }
      if (!this.quickDiffs.find((quickDiff) => quickDiff.label === this.changes[i].label)?.visible) {
        continue;
      }
      const change = this.changes[i].change;
      if (inclusive) {
        if (change.modifiedStartLineNumber <= lineNumber) {
          return i;
        }
      } else {
        if (getModifiedEndLineNumber(change) < lineNumber) {
          return i;
        }
      }
    }
    return this.changes.length - 1;
  }
  dispose() {
    this._disposed = true;
    this._quickDiffs = [];
    this._diffDelayer.cancel();
    this._originalEditorModels.clear();
    this._repositoryDisposables.dispose();
    super.dispose();
  }
};
QuickDiffModel = __decorateClass([
  __decorateParam(2, ISCMService),
  __decorateParam(3, IQuickDiffService),
  __decorateParam(4, IEditorWorkerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IChatEditingService),
  __decorateParam(8, IProgressService)
], QuickDiffModel);
export {
  IQuickDiffModelService,
  QuickDiffModel,
  QuickDiffModelService
};
//# sourceMappingURL=quickDiffModel.js.map
