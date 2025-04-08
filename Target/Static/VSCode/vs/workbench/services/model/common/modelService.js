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
import { URI } from "../../../../base/common/uri.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ModelService } from "../../../../editor/common/services/modelService.js";
import { ITextResourcePropertiesService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import { IPathService } from "../../path/common/pathService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
let WorkbenchModelService = class extends ModelService {
  constructor(configurationService, resourcePropertiesService, undoRedoService, _pathService, instantiationService) {
    super(configurationService, resourcePropertiesService, undoRedoService, instantiationService);
    this._pathService = _pathService;
  }
  static {
    __name(this, "WorkbenchModelService");
  }
  _schemaShouldMaintainUndoRedoElements(resource) {
    return super._schemaShouldMaintainUndoRedoElements(resource) || resource.scheme === this._pathService.defaultUriScheme;
  }
};
WorkbenchModelService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITextResourcePropertiesService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IPathService),
  __decorateParam(4, IInstantiationService)
], WorkbenchModelService);
registerSingleton(IModelService, WorkbenchModelService, InstantiationType.Delayed);
export {
  WorkbenchModelService
};
//# sourceMappingURL=modelService.js.map
