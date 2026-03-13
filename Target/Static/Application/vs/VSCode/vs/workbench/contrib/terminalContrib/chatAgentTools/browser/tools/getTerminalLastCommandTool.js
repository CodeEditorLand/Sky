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
const GetTerminalLastCommandToolData = {
  id: "terminal_last_command",
  toolReferenceName: "terminalLastCommand",
  legacyToolReferenceFullNames: ["runCommands/terminalLastCommand"],
  displayName: localize("terminalLastCommandTool.displayName", "Get Terminal Last Command"),
  modelDescription: "Get the last command run in the active terminal.",
  source: ToolDataSource.Internal,
  icon: Codicon.terminal
};
let GetTerminalLastCommandTool = class GetTerminalLastCommandTool2 extends Disposable {
  static {
    __name(this, "GetTerminalLastCommandTool");
  }
  constructor(_terminalService) {
    super();
    this._terminalService = _terminalService;
  }
  async prepareToolInvocation(context, token) {
    return {
      invocationMessage: localize("getTerminalLastCommand.progressive", "Getting last terminal command"),
      pastTenseMessage: localize("getTerminalLastCommand.past", "Got last terminal command")
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
    const commandDetection = activeInstance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (!commandDetection) {
      return {
        content: [{
          kind: "text",
          value: "No command detection capability available in the active terminal."
        }]
      };
    }
    const executingCommand = commandDetection.executingCommand;
    if (executingCommand) {
      const userPrompt2 = [];
      userPrompt2.push("The following command is currently executing in the terminal:");
      userPrompt2.push(executingCommand);
      const cwd = commandDetection.cwd;
      if (cwd) {
        userPrompt2.push("It is running in the directory:");
        userPrompt2.push(cwd);
      }
      return {
        content: [{
          kind: "text",
          value: userPrompt2.join("\n")
        }]
      };
    }
    const commands = commandDetection.commands;
    if (!commands || commands.length === 0) {
      return {
        content: [{
          kind: "text",
          value: "No command has been run in the active terminal."
        }]
      };
    }
    const lastCommand = commands[commands.length - 1];
    const userPrompt = [];
    if (lastCommand.command) {
      userPrompt.push("The following is the last command run in the terminal:");
      userPrompt.push(lastCommand.command);
    }
    if (lastCommand.cwd) {
      userPrompt.push("It was run in the directory:");
      userPrompt.push(lastCommand.cwd);
    }
    if (lastCommand.exitCode !== void 0) {
      userPrompt.push(`It exited with code: ${lastCommand.exitCode}`);
    }
    if (lastCommand.hasOutput() && lastCommand.getOutput) {
      const output = lastCommand.getOutput();
      if (output && output.trim().length > 0) {
        userPrompt.push("It has the following output:");
        userPrompt.push(output);
      }
    }
    return {
      content: [{
        kind: "text",
        value: userPrompt.join("\n")
      }]
    };
  }
};
GetTerminalLastCommandTool = __decorate([
  __param(0, ITerminalService)
], GetTerminalLastCommandTool);
export {
  GetTerminalLastCommandTool,
  GetTerminalLastCommandToolData
};
//# sourceMappingURL=getTerminalLastCommandTool.js.map
