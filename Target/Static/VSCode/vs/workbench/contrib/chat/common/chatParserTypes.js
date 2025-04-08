var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { revive } from "../../../../base/common/marshalling.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IOffsetRange, OffsetRange } from "../../../../editor/common/core/offsetRange.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { IChatAgentCommand, IChatAgentData, IChatAgentService, reviveSerializedAgent } from "./chatAgents.js";
import { IChatRequestVariableEntry, IDiagnosticVariableEntryFilterData } from "./chatModel.js";
import { IChatSlashData } from "./chatSlashCommands.js";
import { IChatRequestProblemsVariable, IChatRequestVariableValue } from "./chatVariables.js";
import { ChatAgentLocation } from "./constants.js";
import { IToolData } from "./languageModelToolsService.js";
function getPromptText(request) {
  const message = request.parts.map((r) => r.promptText).join("").trimStart();
  const diff = request.text.length - message.length;
  return { message, diff };
}
__name(getPromptText, "getPromptText");
class ChatRequestTextPart {
  constructor(range, editorRange, text) {
    this.range = range;
    this.editorRange = editorRange;
    this.text = text;
  }
  static {
    __name(this, "ChatRequestTextPart");
  }
  static Kind = "text";
  kind = ChatRequestTextPart.Kind;
  get promptText() {
    return this.text;
  }
}
const chatVariableLeader = "#";
const chatAgentLeader = "@";
const chatSubcommandLeader = "/";
class ChatRequestVariablePart {
  constructor(range, editorRange, variableName, variableArg, variableId) {
    this.range = range;
    this.editorRange = editorRange;
    this.variableName = variableName;
    this.variableArg = variableArg;
    this.variableId = variableId;
  }
  static {
    __name(this, "ChatRequestVariablePart");
  }
  static Kind = "var";
  kind = ChatRequestVariablePart.Kind;
  get text() {
    const argPart = this.variableArg ? `:${this.variableArg}` : "";
    return `${chatVariableLeader}${this.variableName}${argPart}`;
  }
  get promptText() {
    return this.text;
  }
}
class ChatRequestToolPart {
  constructor(range, editorRange, toolName, toolId, displayName, icon) {
    this.range = range;
    this.editorRange = editorRange;
    this.toolName = toolName;
    this.toolId = toolId;
    this.displayName = displayName;
    this.icon = icon;
  }
  static {
    __name(this, "ChatRequestToolPart");
  }
  static Kind = "tool";
  kind = ChatRequestToolPart.Kind;
  get text() {
    return `${chatVariableLeader}${this.toolName}`;
  }
  get promptText() {
    return this.text;
  }
  toVariableEntry() {
    return { id: this.toolId, name: this.toolName, range: this.range, value: void 0, isTool: true, icon: ThemeIcon.isThemeIcon(this.icon) ? this.icon : void 0, fullName: this.displayName };
  }
}
class ChatRequestAgentPart {
  constructor(range, editorRange, agent) {
    this.range = range;
    this.editorRange = editorRange;
    this.agent = agent;
  }
  static {
    __name(this, "ChatRequestAgentPart");
  }
  static Kind = "agent";
  kind = ChatRequestAgentPart.Kind;
  get text() {
    return `${chatAgentLeader}${this.agent.name}`;
  }
  get promptText() {
    return "";
  }
}
class ChatRequestAgentSubcommandPart {
  constructor(range, editorRange, command) {
    this.range = range;
    this.editorRange = editorRange;
    this.command = command;
  }
  static {
    __name(this, "ChatRequestAgentSubcommandPart");
  }
  static Kind = "subcommand";
  kind = ChatRequestAgentSubcommandPart.Kind;
  get text() {
    return `${chatSubcommandLeader}${this.command.name}`;
  }
  get promptText() {
    return "";
  }
}
class ChatRequestSlashCommandPart {
  constructor(range, editorRange, slashCommand) {
    this.range = range;
    this.editorRange = editorRange;
    this.slashCommand = slashCommand;
  }
  static {
    __name(this, "ChatRequestSlashCommandPart");
  }
  static Kind = "slash";
  kind = ChatRequestSlashCommandPart.Kind;
  get text() {
    return `${chatSubcommandLeader}${this.slashCommand.command}`;
  }
  get promptText() {
    return `${chatSubcommandLeader}${this.slashCommand.command}`;
  }
}
class ChatRequestDynamicVariablePart {
  constructor(range, editorRange, text, id, modelDescription, data, fullName, icon, isFile, isDirectory) {
    this.range = range;
    this.editorRange = editorRange;
    this.text = text;
    this.id = id;
    this.modelDescription = modelDescription;
    this.data = data;
    this.fullName = fullName;
    this.icon = icon;
    this.isFile = isFile;
    this.isDirectory = isDirectory;
  }
  static {
    __name(this, "ChatRequestDynamicVariablePart");
  }
  static Kind = "dynamic";
  kind = ChatRequestDynamicVariablePart.Kind;
  get referenceText() {
    return this.text.replace(chatVariableLeader, "");
  }
  get promptText() {
    return this.text;
  }
  toVariableEntry() {
    if (this.id === "vscode.problems") {
      return IDiagnosticVariableEntryFilterData.toEntry(this.data.filter);
    }
    return { id: this.id, name: this.referenceText, range: this.range, value: this.data, fullName: this.fullName, icon: this.icon, isFile: this.isFile, isDirectory: this.isDirectory };
  }
}
function reviveParsedChatRequest(serialized) {
  return {
    text: serialized.text,
    parts: serialized.parts.map((part) => {
      if (part.kind === ChatRequestTextPart.Kind) {
        return new ChatRequestTextPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.text
        );
      } else if (part.kind === ChatRequestVariablePart.Kind) {
        return new ChatRequestVariablePart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.variableName,
          part.variableArg,
          part.variableId || ""
        );
      } else if (part.kind === ChatRequestToolPart.Kind) {
        return new ChatRequestToolPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.toolName,
          part.toolId,
          part.displayName,
          part.icon
        );
      } else if (part.kind === ChatRequestAgentPart.Kind) {
        let agent = part.agent;
        agent = reviveSerializedAgent(agent);
        return new ChatRequestAgentPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          agent
        );
      } else if (part.kind === ChatRequestAgentSubcommandPart.Kind) {
        return new ChatRequestAgentSubcommandPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.command
        );
      } else if (part.kind === ChatRequestSlashCommandPart.Kind) {
        return new ChatRequestSlashCommandPart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.slashCommand
        );
      } else if (part.kind === ChatRequestDynamicVariablePart.Kind) {
        return new ChatRequestDynamicVariablePart(
          new OffsetRange(part.range.start, part.range.endExclusive),
          part.editorRange,
          part.text,
          part.id,
          part.modelDescription,
          revive(part.data),
          part.fullName,
          part.icon,
          part.isFile,
          part.isDirectory
        );
      } else {
        throw new Error(`Unknown chat request part: ${part.kind}`);
      }
    })
  };
}
__name(reviveParsedChatRequest, "reviveParsedChatRequest");
function extractAgentAndCommand(parsed) {
  const agentPart = parsed.parts.find((r) => r instanceof ChatRequestAgentPart);
  const commandPart = parsed.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
  return { agentPart, commandPart };
}
__name(extractAgentAndCommand, "extractAgentAndCommand");
function formatChatQuestion(chatAgentService, location, prompt, participant = null, command = null) {
  let question = "";
  if (participant && participant !== chatAgentService.getDefaultAgent(location)?.id) {
    const agent = chatAgentService.getAgent(participant);
    if (!agent) {
      return void 0;
    }
    question += `${chatAgentLeader}${agent.name} `;
    if (command) {
      question += `${chatSubcommandLeader}${command} `;
    }
  }
  return question + prompt;
}
__name(formatChatQuestion, "formatChatQuestion");
export {
  ChatRequestAgentPart,
  ChatRequestAgentSubcommandPart,
  ChatRequestDynamicVariablePart,
  ChatRequestSlashCommandPart,
  ChatRequestTextPart,
  ChatRequestToolPart,
  chatAgentLeader,
  chatSubcommandLeader,
  chatVariableLeader,
  extractAgentAndCommand,
  formatChatQuestion,
  getPromptText,
  reviveParsedChatRequest
};
//# sourceMappingURL=chatParserTypes.js.map
