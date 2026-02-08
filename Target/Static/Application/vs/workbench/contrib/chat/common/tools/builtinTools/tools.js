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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILanguageModelToolsService } from "../languageModelToolsService.js";
import { ConfirmationTool, ConfirmationToolData } from "./confirmationTool.js";
import { EditTool, EditToolData } from "./editFileTool.js";
import { createManageTodoListToolData, ManageTodoListTool } from "./manageTodoListTool.js";
import { RunSubagentTool } from "./runSubagentTool.js";
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
    this._register(toolsService.registerTool(EditToolData, editTool));
    const todoToolData = createManageTodoListToolData();
    const manageTodoListTool = this._register(instantiationService.createInstance(ManageTodoListTool));
    this._register(toolsService.registerTool(todoToolData, manageTodoListTool));
    const confirmationTool = instantiationService.createInstance(ConfirmationTool);
    this._register(toolsService.registerTool(ConfirmationToolData, confirmationTool));
    const runSubagentTool = this._register(instantiationService.createInstance(RunSubagentTool));
    let runSubagentRegistration;
    let toolSetRegistration;
    const registerRunSubagentTool = /* @__PURE__ */ __name(() => {
      runSubagentRegistration?.dispose();
      toolSetRegistration?.dispose();
      toolsService.flushToolUpdates();
      const runSubagentToolData = runSubagentTool.getToolData();
      runSubagentRegistration = toolsService.registerTool(runSubagentToolData, runSubagentTool);
      toolSetRegistration = toolsService.agentToolSet.addTool(runSubagentToolData);
    }, "registerRunSubagentTool");
    registerRunSubagentTool();
    this._register(runSubagentTool.onDidUpdateToolData(registerRunSubagentTool));
    this._register({
      dispose: /* @__PURE__ */ __name(() => {
        runSubagentRegistration?.dispose();
        toolSetRegistration?.dispose();
      }, "dispose")
    });
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
