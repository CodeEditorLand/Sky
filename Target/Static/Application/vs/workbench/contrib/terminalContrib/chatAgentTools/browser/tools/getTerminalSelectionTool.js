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
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { ToolDataSource } from "../../../../chat/common/tools/languageModelToolsService.js";
import { ITerminalService } from "../../../../terminal/browser/terminal.js";
const GetTerminalSelectionToolData = {
  id: "terminal_selection",
  toolReferenceName: "terminalSelection",
  legacyToolReferenceFullNames: ["runCommands/terminalSelection"],
  displayName: localize("terminalSelectionTool.displayName", "Get Terminal Selection"),
  modelDescription: "Get the current selection in the active terminal.",
  source: ToolDataSource.Internal,
  icon: Codicon.terminal
};
let GetTerminalSelectionTool = class GetTerminalSelectionTool2 extends Disposable {
  static {
    __name(this, "GetTerminalSelectionTool");
  }
  constructor(_terminalService) {
    super();
    this._terminalService = _terminalService;
  }
  async prepareToolInvocation(context, token) {
    return {
      invocationMessage: localize("getTerminalSelection.progressive", "Reading terminal selection"),
      pastTenseMessage: localize("getTerminalSelection.past", "Read terminal selection")
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const activeInstance = this._terminalService.activeInstance;
    if (!activeInstance) {
      return {
        content: [{
          kind: "text",
          value: "No active terminal instance found."
        }]
      };
    }
    const selection = activeInstance.selection;
    if (!selection) {
      return {
        content: [{
          kind: "text",
          value: "No text is currently selected in the active terminal."
        }]
      };
    }
    return {
      content: [{
        kind: "text",
        value: `The active terminal's selection:
${selection}`
      }]
    };
  }
};
GetTerminalSelectionTool = __decorate([
  __param(0, ITerminalService)
], GetTerminalSelectionTool);
export {
  GetTerminalSelectionTool,
  GetTerminalSelectionToolData
};
//# sourceMappingURL=getTerminalSelectionTool.js.map
