var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { ToolDataSource } from "../../../../chat/common/tools/languageModelToolsService.js";
import { RunInTerminalTool } from "./runInTerminalTool.js";
const KillTerminalToolData = {
  id: "kill_terminal",
  toolReferenceName: "killTerminal",
  displayName: localize("killTerminalTool.displayName", "Kill Terminal"),
  modelDescription: `Kill a terminal by its ID. Use this to clean up terminals that are no longer needed (e.g., after stopping a server or when a long-running task completes). The terminal ID is returned by ${"run_in_terminal"} when isBackground=true.`,
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: `The ID of the background terminal to kill (returned by ${"run_in_terminal"} when isBackground=true).`
      }
    },
    required: [
      "id"
    ]
  }
};
class KillTerminalTool extends Disposable {
  static {
    __name(this, "KillTerminalTool");
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("kill.progressive", "Killing terminal"),
      pastTenseMessage: localize("kill.past", "Killed terminal")
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const args = invocation.parameters;
    const execution = RunInTerminalTool.getExecution(args.id);
    if (!execution) {
      return {
        content: [{
          kind: "text",
          value: `Error: No active terminal execution found with ID ${args.id}. The terminal may have already been killed or the ID is invalid.`
        }]
      };
    }
    const finalOutput = execution.getOutput();
    execution.instance.dispose();
    RunInTerminalTool.removeExecution(args.id);
    const outputSummary = finalOutput ? `Final output before termination:
${finalOutput}` : "No output was captured.";
    return {
      content: [{
        kind: "text",
        value: `Successfully killed background terminal ${args.id}. ${outputSummary}`
      }]
    };
  }
}
export {
  KillTerminalTool,
  KillTerminalToolData
};
//# sourceMappingURL=killTerminalTool.js.map
