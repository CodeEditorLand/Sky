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
import { ReferenceCollection } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService, createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { NotebookCellOutlineDataSource } from "./notebookOutlineDataSource.js";
let NotebookCellOutlineDataSourceReferenceCollection = class extends ReferenceCollection {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "NotebookCellOutlineDataSourceReferenceCollection");
  }
  createReferencedObject(_key, editor) {
    return this.instantiationService.createInstance(NotebookCellOutlineDataSource, editor);
  }
  destroyReferencedObject(_key, object) {
    object.dispose();
  }
};
NotebookCellOutlineDataSourceReferenceCollection = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookCellOutlineDataSourceReferenceCollection);
const INotebookCellOutlineDataSourceFactory = createDecorator("INotebookCellOutlineDataSourceFactory");
let NotebookCellOutlineDataSourceFactory = class {
  static {
    __name(this, "NotebookCellOutlineDataSourceFactory");
  }
  _data;
  constructor(instantiationService) {
    this._data = instantiationService.createInstance(NotebookCellOutlineDataSourceReferenceCollection);
  }
  getOrCreate(editor) {
    return this._data.acquire(editor.getId(), editor);
  }
};
NotebookCellOutlineDataSourceFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookCellOutlineDataSourceFactory);
export {
  INotebookCellOutlineDataSourceFactory,
  NotebookCellOutlineDataSourceFactory
};
//# sourceMappingURL=notebookOutlineDataSourceFactory.js.map
