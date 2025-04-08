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
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable, ITransaction, constObservable, derived, derivedObservableWithWritableCache, mapObservableArrayCached, observableFromValueWithChangeEvent, observableValue, transaction } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { ContextKeyValue } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IDiffEditorOptions } from "../../../common/config/editorOptions.js";
import { Selection } from "../../../common/core/selection.js";
import { IDiffEditorViewModel } from "../../../common/editorCommon.js";
import { IModelService } from "../../../common/services/model.js";
import { DiffEditorOptions } from "../diffEditor/diffEditorOptions.js";
import { DiffEditorViewModel } from "../diffEditor/diffEditorViewModel.js";
import { RefCounted } from "../diffEditor/utils.js";
import { IDocumentDiffItem, IMultiDiffEditorModel } from "./model.js";
class MultiDiffEditorViewModel extends Disposable {
  constructor(model, _instantiationService) {
    super();
    this.model = model;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "MultiDiffEditorViewModel");
  }
  _documents = observableFromValueWithChangeEvent(this.model, this.model.documents);
  _documentsArr = derived(this, (reader) => {
    const result = this._documents.read(reader);
    if (result === "loading") {
      return [];
    }
    return result;
  });
  isLoading = derived(this, (reader) => this._documents.read(reader) === "loading");
  items = mapObservableArrayCached(
    this,
    this._documentsArr,
    (d, store) => store.add(this._instantiationService.createInstance(DocumentDiffItemViewModel, d, this))
  ).recomputeInitiallyAndOnChange(this._store);
  focusedDiffItem = derived(this, (reader) => this.items.read(reader).find((i) => i.isFocused.read(reader)));
  activeDiffItem = derivedObservableWithWritableCache(
    this,
    (reader, lastValue) => this.focusedDiffItem.read(reader) ?? (lastValue && this.items.read(reader).indexOf(lastValue) !== -1) ? lastValue : void 0
  );
  async waitForDiffs() {
    for (const d of this.items.get()) {
      await d.diffEditorViewModel.waitForDiff();
    }
  }
  collapseAll() {
    transaction((tx) => {
      for (const d of this.items.get()) {
        d.collapsed.set(true, tx);
      }
    });
  }
  expandAll() {
    transaction((tx) => {
      for (const d of this.items.get()) {
        d.collapsed.set(false, tx);
      }
    });
  }
  get contextKeys() {
    return this.model.contextKeys;
  }
}
let DocumentDiffItemViewModel = class extends Disposable {
  constructor(documentDiffItem, _editorViewModel, _instantiationService, _modelService) {
    super();
    this._editorViewModel = _editorViewModel;
    this._instantiationService = _instantiationService;
    this._modelService = _modelService;
    this._register(toDisposable(() => {
      this.isAlive.set(false, void 0);
    }));
    this.documentDiffItemRef = this._register(documentDiffItem.createNewRef(this));
    function updateOptions(options2) {
      return {
        ...options2,
        hideUnchangedRegions: {
          enabled: true
        }
      };
    }
    __name(updateOptions, "updateOptions");
    const options = this._instantiationService.createInstance(DiffEditorOptions, updateOptions(this.documentDiffItem.options || {}));
    if (this.documentDiffItem.onOptionsDidChange) {
      this._register(this.documentDiffItem.onOptionsDidChange(() => {
        options.updateOptions(updateOptions(this.documentDiffItem.options || {}));
      }));
    }
    const diffEditorViewModelStore = new DisposableStore();
    const originalTextModel = this.documentDiffItem.original ?? diffEditorViewModelStore.add(this._modelService.createModel("", null));
    const modifiedTextModel = this.documentDiffItem.modified ?? diffEditorViewModelStore.add(this._modelService.createModel("", null));
    diffEditorViewModelStore.add(this.documentDiffItemRef.createNewRef(this));
    this.diffEditorViewModelRef = this._register(RefCounted.createWithDisposable(
      this._instantiationService.createInstance(DiffEditorViewModel, {
        original: originalTextModel,
        modified: modifiedTextModel
      }, options),
      diffEditorViewModelStore,
      this
    ));
  }
  static {
    __name(this, "DocumentDiffItemViewModel");
  }
  /**
   * The diff editor view model keeps its inner objects alive.
  */
  diffEditorViewModelRef;
  get diffEditorViewModel() {
    return this.diffEditorViewModelRef.object;
  }
  collapsed = observableValue(this, false);
  lastTemplateData = observableValue(
    this,
    { contentHeight: 500, selections: void 0 }
  );
  get originalUri() {
    return this.documentDiffItem.original?.uri;
  }
  get modifiedUri() {
    return this.documentDiffItem.modified?.uri;
  }
  isActive = derived(this, (reader) => this._editorViewModel.activeDiffItem.read(reader) === this);
  _isFocusedSource = observableValue(this, constObservable(false));
  isFocused = derived(this, (reader) => this._isFocusedSource.read(reader).read(reader));
  setIsFocused(source, tx) {
    this._isFocusedSource.set(source, tx);
  }
  documentDiffItemRef;
  get documentDiffItem() {
    return this.documentDiffItemRef.object;
  }
  isAlive = observableValue(this, true);
  getKey() {
    return JSON.stringify([
      this.originalUri?.toString(),
      this.modifiedUri?.toString()
    ]);
  }
};
DocumentDiffItemViewModel = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IModelService)
], DocumentDiffItemViewModel);
export {
  DocumentDiffItemViewModel,
  MultiDiffEditorViewModel
};
//# sourceMappingURL=multiDiffEditorViewModel.js.map
