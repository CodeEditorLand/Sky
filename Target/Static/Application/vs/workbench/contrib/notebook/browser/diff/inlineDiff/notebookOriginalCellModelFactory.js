var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ReferenceCollection } from "../../../../../../base/common/lifecycle.js";
import { createDecorator, IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { CellKind } from "../../../common/notebookCommon.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
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
const INotebookOriginalCellModelFactory = createDecorator("INotebookOriginalCellModelFactory");
let OriginalNotebookCellModelReferenceCollection = class OriginalNotebookCellModelReferenceCollection2 extends ReferenceCollection {
  static {
    __name(this, "OriginalNotebookCellModelReferenceCollection");
  }
  constructor(modelService, _languageService) {
    super();
    this.modelService = modelService;
    this._languageService = _languageService;
  }
  createReferencedObject(_key, uri, cellValue, language, cellKind) {
    const scheme = `${uri.scheme}-chat-edit`;
    const originalCellUri = URI.from({ scheme, fragment: uri.fragment, path: uri.path });
    const languageSelection = this._languageService.getLanguageIdByLanguageName(language) ? this._languageService.createById(language) : cellKind === CellKind.Markup ? this._languageService.createById("markdown") : null;
    return this.modelService.createModel(cellValue, languageSelection, originalCellUri);
  }
  destroyReferencedObject(_key, model) {
    model.dispose();
  }
};
OriginalNotebookCellModelReferenceCollection = __decorate([
  __param(0, IModelService),
  __param(1, ILanguageService)
], OriginalNotebookCellModelReferenceCollection);
let OriginalNotebookCellModelFactory = class OriginalNotebookCellModelFactory2 {
  static {
    __name(this, "OriginalNotebookCellModelFactory");
  }
  constructor(instantiationService) {
    this._data = instantiationService.createInstance(OriginalNotebookCellModelReferenceCollection);
  }
  getOrCreate(uri, cellValue, language, cellKind) {
    return this._data.acquire(uri.toString(), uri, cellValue, language, cellKind);
  }
};
OriginalNotebookCellModelFactory = __decorate([
  __param(0, IInstantiationService)
], OriginalNotebookCellModelFactory);
export {
  INotebookOriginalCellModelFactory,
  OriginalNotebookCellModelFactory,
  OriginalNotebookCellModelReferenceCollection
};
//# sourceMappingURL=notebookOriginalCellModelFactory.js.map
