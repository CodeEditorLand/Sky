var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { EditTool, EditToolData } from "./editFileTool.js";
let BuiltinToolsContribution = class BuiltinToolsContribution2 extends Disposable {
  static {
    __name(this, "BuiltinToolsContribution");
  }
  static {
    this.ID = "chat.builtinTools";
  }
  constructor(toolsService, instantiationService) {
    super();
    const editTool = instantiationService.createInstance(EditTool);
    this._register(toolsService.registerToolData(EditToolData));
    this._register(toolsService.registerToolImplementation(EditToolData.id, editTool));
  }
};
BuiltinToolsContribution = __decorate([
  __param(0, ILanguageModelToolsService),
  __param(1, IInstantiationService)
], BuiltinToolsContribution);
const InternalFetchWebPageToolId = "vscode_fetchWebPage_internal";
export {
  BuiltinToolsContribution,
  InternalFetchWebPageToolId
};
//# sourceMappingURL=tools.js.map
