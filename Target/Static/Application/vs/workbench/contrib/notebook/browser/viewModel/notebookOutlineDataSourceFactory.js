var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ReferenceCollection } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService, createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { NotebookCellOutlineDataSource } from "./notebookOutlineDataSource.js";
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
let NotebookCellOutlineDataSourceReferenceCollection = class NotebookCellOutlineDataSourceReferenceCollection2 extends ReferenceCollection {
  static {
    __name(this, "NotebookCellOutlineDataSourceReferenceCollection");
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  createReferencedObject(_key, editor) {
    return this.instantiationService.createInstance(NotebookCellOutlineDataSource, editor);
  }
  destroyReferencedObject(_key, object) {
    object.dispose();
  }
};
NotebookCellOutlineDataSourceReferenceCollection = __decorate([
  __param(0, IInstantiationService)
], NotebookCellOutlineDataSourceReferenceCollection);
const INotebookCellOutlineDataSourceFactory = createDecorator("INotebookCellOutlineDataSourceFactory");
let NotebookCellOutlineDataSourceFactory = class NotebookCellOutlineDataSourceFactory2 {
  static {
    __name(this, "NotebookCellOutlineDataSourceFactory");
  }
  constructor(instantiationService) {
    this._data = instantiationService.createInstance(NotebookCellOutlineDataSourceReferenceCollection);
  }
  getOrCreate(editor) {
    return this._data.acquire(editor.getId(), editor);
  }
};
NotebookCellOutlineDataSourceFactory = __decorate([
  __param(0, IInstantiationService)
], NotebookCellOutlineDataSourceFactory);
export {
  INotebookCellOutlineDataSourceFactory,
  NotebookCellOutlineDataSourceFactory
};
//# sourceMappingURL=notebookOutlineDataSourceFactory.js.map
