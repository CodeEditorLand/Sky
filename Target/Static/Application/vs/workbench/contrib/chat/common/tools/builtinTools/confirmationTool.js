var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { ToolDataSource, ToolInvocationPresentation } from "../languageModelToolsService.js";
const ConfirmationToolId = "vscode_get_confirmation";
const ConfirmationToolWithOptionsId = "vscode_get_confirmation_with_options";
const ConfirmationToolData = {
  id: ConfirmationToolId,
  displayName: "Confirmation Tool",
  modelDescription: "A tool that demonstrates different types of confirmations. Takes a title, message, and confirmation type (basic or terminal).",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title for the confirmation dialog"
      },
      message: {
        type: "string",
        description: "Message to show in the confirmation dialog"
      },
      confirmationType: {
        type: "string",
        enum: ["basic", "terminal"],
        description: "Type of confirmation to show - basic for simple confirmation, terminal for terminal command confirmation"
      },
      terminalCommand: {
        type: "string",
        description: 'Terminal command to show (only used when confirmationType is "terminal")'
      }
    },
    required: ["title", "message", "confirmationType"],
    additionalProperties: false
  }
};
const ConfirmationToolWithOptionsData = {
  id: ConfirmationToolWithOptionsId,
  displayName: "Confirmation Tool with Options",
  modelDescription: "A tool that demonstrates different types of confirmations. Takes a title, message, and buttons.",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title for the confirmation dialog"
      },
      message: {
        type: "string",
        description: "Message to show in the confirmation dialog"
      },
      buttons: {
        type: "array",
        items: { type: "string" },
        description: "Custom button labels to display."
      }
    },
    required: ["title", "message", "buttons"],
    additionalProperties: false
  }
};
class ConfirmationTool {
  static {
    __name(this, "ConfirmationTool");
  }
  async prepareToolInvocation(context, token) {
    const parameters = context.parameters;
    if (!parameters.title || !parameters.message) {
      throw new Error("Missing required parameters for ConfirmationTool");
    }
    const confirmationType = parameters.confirmationType ?? "basic";
    let toolSpecificData;
    if (confirmationType === "terminal") {
      toolSpecificData = {
        kind: "terminal",
        commandLine: {
          original: parameters.terminalCommand ?? ""
        },
        language: "bash"
      };
    } else {
      toolSpecificData = void 0;
    }
    return {
      confirmationMessages: {
        title: parameters.title,
        message: new MarkdownString(parameters.message),
        allowAutoConfirm: (parameters.buttons || []).length ? false : true,
        // We cannot auto confirm if there are custom buttons, as we don't know which one to select
        customButtons: parameters.buttons
      },
      toolSpecificData,
      presentation: ToolInvocationPresentation.HiddenAfterComplete
    };
  }
  async invoke(invocation, countTokens, progress, token) {
    if (invocation.selectedCustomButton) {
      return {
        content: [{
          kind: "text",
          value: invocation.selectedCustomButton
        }]
      };
    }
    return {
      content: [{
        kind: "text",
        value: "yes"
        // Consumers should check for this label to know whether the tool was confirmed or skipped
      }]
    };
  }
}
export {
  ConfirmationTool,
  ConfirmationToolData,
  ConfirmationToolId,
  ConfirmationToolWithOptionsData,
  ConfirmationToolWithOptionsId
};
//# sourceMappingURL=confirmationTool.js.map
