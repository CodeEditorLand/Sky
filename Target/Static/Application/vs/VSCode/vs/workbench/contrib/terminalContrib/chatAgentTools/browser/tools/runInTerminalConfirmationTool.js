var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../../base/common/codicons.js";
import { localize } from "../../../../../../nls.js";
import { ToolDataSource, ToolInvocationPresentation } from "../../../../chat/common/tools/languageModelToolsService.js";
import { RunInTerminalTool } from "./runInTerminalTool.js";
const ConfirmTerminalCommandToolData = {
  id: "vscode_get_terminal_confirmation",
  displayName: localize("confirmTerminalCommandTool.displayName", "Confirm Terminal Command"),
  modelDescription: [
    "This tool allows you to get explicit user confirmation for a terminal command without executing it.",
    "",
    "When to use:",
    "- When you need to verify user approval before executing a command",
    "- When you want to show command details, auto-approval status, and simplified versions to the user",
    "- When you need the user to review a potentially risky command",
    "",
    "The tool will:",
    "- Show the command with syntax highlighting",
    "- Display auto-approval status if enabled",
    "- Show simplified version of the command if applicable",
    "- Provide custom actions for creating auto-approval rules",
    "- Return approval/rejection status",
    "",
    "After confirmation, use a tool to actually execute the command."
  ].join("\n"),
  userDescription: localize("confirmTerminalCommandTool.userDescription", "Tool for confirming terminal commands"),
  source: ToolDataSource.Internal,
  icon: Codicon.shield,
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to confirm with the user."
      },
      explanation: {
        type: "string",
        description: "A one-sentence description of what the command does. This will be shown to the user in the confirmation dialog."
      },
      isBackground: {
        type: "boolean",
        description: "Whether the command would start a background process. This provides context for the confirmation."
      }
    },
    required: [
      "command",
      "explanation",
      "isBackground"
    ]
  }
};
class ConfirmTerminalCommandTool extends RunInTerminalTool {
  static {
    __name(this, "ConfirmTerminalCommandTool");
  }
  async prepareToolInvocation(context, token) {
    const preparedInvocation = await super.prepareToolInvocation(context, token);
    if (preparedInvocation) {
      preparedInvocation.presentation = ToolInvocationPresentation.HiddenAfterComplete;
    }
    return preparedInvocation;
  }
  async invoke(invocation, countTokens, progress, token) {
    return {
      content: [{
        kind: "text",
        value: "yes"
      }]
    };
  }
}
export {
  ConfirmTerminalCommandTool,
  ConfirmTerminalCommandToolData
};
//# sourceMappingURL=runInTerminalConfirmationTool.js.map
