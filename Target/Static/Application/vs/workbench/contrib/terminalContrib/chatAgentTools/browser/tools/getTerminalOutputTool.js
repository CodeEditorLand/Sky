var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { ToolDataSource } from "../../../../chat/common/tools/languageModelToolsService.js";
import { RunInTerminalTool } from "./runInTerminalTool.js";
const GetTerminalOutputToolData = {
  id: "get_terminal_output",
  toolReferenceName: "getTerminalOutput",
  legacyToolReferenceFullNames: ["runCommands/getTerminalOutput"],
  displayName: localize("getTerminalOutputTool.displayName", "Get Terminal Output"),
  modelDescription: `Get the output of a terminal command previously started with ${"run_in_terminal"}`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the terminal to check."
      }
    },
    required: [
      "id"
    ]
  }
};
class GetTerminalOutputTool extends Disposable {
  static {
    __name(this, "GetTerminalOutputTool");
  }
  async prepareToolInvocation(context, token) {
    return {
      invocationMessage: localize("bg.progressive", "Checking background terminal output"),
      pastTenseMessage: localize("bg.past", "Checked background terminal output")
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args = invocation.parameters;
    return {
      content: [{
        kind: "text",
        value: `Output of terminal ${args.id}:
${RunInTerminalTool.getBackgroundOutput(args.id)}`
      }]
    };
  }
}
export {
  GetTerminalOutputTool,
  GetTerminalOutputToolData
};
//# sourceMappingURL=getTerminalOutputTool.js.map
