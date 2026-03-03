var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationError } from "../../../../../../base/common/errors.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { ToolDataSource } from "../../../../chat/common/tools/languageModelToolsService.js";
import { RunInTerminalTool } from "./runInTerminalTool.js";
import { raceCancellationError, timeout } from "../../../../../../base/common/async.js";
const AwaitTerminalToolData = {
  id: "await_terminal",
  toolReferenceName: "awaitTerminal",
  displayName: localize("awaitTerminalTool.displayName", "Await Terminal"),
  modelDescription: "Wait for a background terminal command to complete. Returns the output, exit code, or timeout status.",
  icon: Codicon.terminal,
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: `The ID of the terminal to await (returned by ${"run_in_terminal"} when isBackground=true).`
      },
      timeout: {
        type: "number",
        description: "Timeout in milliseconds. If the command does not complete within this time, returns the output collected so far with a timeout indicator. Use 0 for no timeout."
      }
    },
    required: [
      "id",
      "timeout"
    ]
  }
};
class AwaitTerminalTool extends Disposable {
  static {
    __name(this, "AwaitTerminalTool");
  }
  async prepareToolInvocation(_context, _token) {
    return {
      invocationMessage: localize("await.progressive", "Awaiting terminal completion"),
      pastTenseMessage: localize("await.past", "Awaited terminal completion")
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args = invocation.parameters;
    const execution = RunInTerminalTool.getExecution(args.id);
    if (!execution) {
      return {
        content: [{
          kind: "text",
          value: `Error: No active terminal execution found with ID ${args.id}. The terminal may have already completed or the ID is invalid.`
        }]
      };
    }
    try {
      let result;
      const timeoutMs = Math.max(0, args.timeout);
      const hasTimeout = timeoutMs > 0;
      if (hasTimeout) {
        const timeoutPromise = timeout(timeoutMs).then(() => ({ type: "timeout" }));
        const completionPromise = raceCancellationError(execution.completionPromise, token).then((r) => ({ type: "completed", result: r }));
        const raceResult = await Promise.race([completionPromise, timeoutPromise]);
        if (raceResult.type === "timeout") {
          const partialOutput = execution.getOutput();
          return {
            toolMetadata: {
              exitCode: void 0,
              timedOut: true
            },
            content: [{
              kind: "text",
              value: `Terminal ${args.id} timed out after ${timeoutMs}ms. Output collected so far:
${partialOutput}`
            }]
          };
        }
        result = raceResult.result;
      } else {
        result = await raceCancellationError(execution.completionPromise, token);
      }
      const output = execution.getOutput();
      const exitCodeText = result.exitCode !== void 0 ? ` (exit code: ${result.exitCode})` : "";
      return {
        toolMetadata: {
          exitCode: result.exitCode
        },
        content: [{
          kind: "text",
          value: `Terminal ${args.id} completed${exitCodeText}:
${output}`
        }]
      };
    } catch (e) {
      if (e instanceof CancellationError) {
        throw e;
      }
      return {
        content: [{
          kind: "text",
          value: `Error awaiting terminal ${args.id}: ${e instanceof Error ? e.message : String(e)}`
        }]
      };
    }
  }
}
export {
  AwaitTerminalTool,
  AwaitTerminalToolData
};
//# sourceMappingURL=awaitTerminalTool.js.map
