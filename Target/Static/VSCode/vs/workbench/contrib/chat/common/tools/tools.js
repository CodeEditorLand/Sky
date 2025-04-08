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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { EditTool, EditToolData } from "./editFileTool.js";
let BuiltinToolsContribution = class extends Disposable {
  static {
    __name(this, "BuiltinToolsContribution");
  }
  static ID = "chat.builtinTools";
  constructor(toolsService, instantiationService) {
    super();
    const editTool = instantiationService.createInstance(EditTool);
    this._register(toolsService.registerToolData(EditToolData));
    this._register(toolsService.registerToolImplementation(EditToolData.id, editTool));
  }
};
BuiltinToolsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService)
], BuiltinToolsContribution);
const InternalFetchWebPageToolId = "vscode_fetchWebPage_internal";
export {
  BuiltinToolsContribution,
  InternalFetchWebPageToolId
};
//# sourceMappingURL=tools.js.map
