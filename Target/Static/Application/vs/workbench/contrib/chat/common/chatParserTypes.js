var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { revive } from "../../../../base/common/marshalling.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { OffsetRange } from "../../../../editor/common/core/offsetRange.js";
import { reviveSerializedAgent } from "./chatAgents.js";
import { IDiagnosticVariableEntryFilterData } from "./chatModel.js";
function getPromptText(request) {
  const message = request.parts.map((r) => r.promptText).join("").trimStart();
  const diff = request.text.length - message.length;
  return { message, diff };
}
__name(getPromptText, "getPromptText");
class ChatRequestTextPart {
  static {
    __name(this, "ChatRequestTextPart");
  }
  static {
    this.Kind = "text";
  }
  constructor(range, editorRange, text) {
    this.range = range;
    this.editorRange = editorRange;
    this.text = text;
    this.kind = ChatRequestTextPart.Kind;
  }
  get promptText() {
    return this.text;
  }
}
const chatVariableLeader = "#";
const chatAgentLeader = "@";
const chatSubcommandLeader = "/";
class ChatRequestVariablePart {
  static {
    __name(this, "ChatRequestVariablePart");
  }
  static {
    this.Kind = "var";
  }
  constructor(range, editorRange, variableName, variableArg, variableId) {
    this.range = range;
    this.editorRange = editorRange;
    this.variableName = variableName;
    this.variableArg = variableArg;
    this.variableId = variableId;
    this.kind = ChatRequestVariablePart.Kind;
  }
  get text() {
    const argPart = this.variableArg ? `:${this.variableArg}` : "";
    return `${chatVariableLeader}${this.variableName}${argPart}`;
  }
  get promptText() {
    return this.text;
  }
}
class ChatRequestToolPart {
  static {
    __name(this, "ChatRequestToolPart");
  }
  static {
    this.Kind = "tool";
  }
  constructor(range, editorRange, toolName, toolId, displayName, icon) {
    this.range = range;
    this.editorRange = editorRange;
    this.toolName = toolName;
    this.toolId = toolId;
    this.displayName = displayName;
    this.icon = icon;
    this.kind = ChatRequestToolPart.Kind;
  }
  get text() {
    return `${chatVariableLeader}${this.toolName}`;
  }
  get promptText() {
    return this.text;
  }
  toVariableEntry() {
    return { kind: "tool", id: this.toolId, name: this.toolName, range: this.range, value: void 0, icon: ThemeIcon.isThemeIcon(this.icon) ? this.icon : void 0, fullName: this.displayName };
  }
}
class ChatRequestAgentPart {
  static {
    __name(this, "ChatRequestAgentPart");
  }
  static {
    this.Kind = "agent";
  }
  constructor(range, editorRange, agent) {
    this.range = range;
    this.editorRange = editorRange;
    this.agent = agent;
    this.kind = ChatRequestAgentPart.Kind;
  }
  get text() {
    return `${chatAgentLeader}${this.agent.name}`;
  }
  get promptText() {
    return "";
  }
}
class ChatRequestAgentSubcommandPart {
  static {
    __name(this, "ChatRequestAgentSubcommandPart");
  }
  static {
    this.Kind = "subcommand";
  }
  constructor(range, editorRange, command) {
    this.range = range;
    this.editorRange = editorRange;
    this.command = command;
    this.kind = ChatRequestAgentSubcommandPart.Kind;
  }
  get text() {
    return `${chatSubcommandLeader}${this.command.name}`;
  }
  get promptText() {
    return "";
  }
}
class ChatRequestSlashCommandPart {
  static {
    __name(this, "ChatRequestSlashCommandPart");
  }
  static {
    this.Kind = "slash";
  }
  constructor(range, editorRange, slashCommand) {
    this.range = range;
    this.editorRange = editorRange;
    this.slashCommand = slashCommand;
    this.kind = ChatRequestSlashCommandPart.Kind;
  }
  get text() {
    return `${chatSubcommandLeader}${this.slashCommand.command}`;
  }
  get promptText() {
    return `${chatSubcommandLeader}${this.slashCommand.command}`;
  }
}
class ChatRequestSlashPromptPart {
  static {
    __name(this, "ChatRequestSlashPromptPart");
  }
  static {
    this.Kind = "prompt";
  }
  constructor(range, editorRange, slashPromptCommand) {
    this.range = range;
    this.editorRange = editorRange;
    this.slashPromptCommand = slashPromptCommand;
    this.kind = ChatRequestSlashPromptPart.Kind;
  }
  get text() {
    return `${chatSubcommandLeader}${this.slashPromptCommand.command}`;
  }
  get promptText() {
    return `${chatSubcommandLeader}${this.slashPromptCommand.command}`;
  }
}
class ChatRequestDynamicVariablePart {
  static {
    __name(this, "ChatRequestDynamicVariablePart");
  }
  static {
    this.Kind = "dynamic";
  }
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
    this.kind = ChatRequestDynamicVariablePart.Kind;
  }
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
    return { kind: this.isDirectory ? "directory" : this.isFile ? "file" : "generic", id: this.id, name: this.referenceText, range: this.range, value: this.data, fullName: this.fullName, icon: this.icon };
  }
}
function reviveParsedChatRequest(serialized) {
  return {
    text: serialized.text,
    parts: serialized.parts.map((part) => {
      if (part.kind === ChatRequestTextPart.Kind) {
        return new ChatRequestTextPart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.text);
      } else if (part.kind === ChatRequestVariablePart.Kind) {
        return new ChatRequestVariablePart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.variableName, part.variableArg, part.variableId || "");
      } else if (part.kind === ChatRequestToolPart.Kind) {
        return new ChatRequestToolPart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.toolName, part.toolId, part.displayName, part.icon);
      } else if (part.kind === ChatRequestAgentPart.Kind) {
        let agent = part.agent;
        agent = reviveSerializedAgent(agent);
        return new ChatRequestAgentPart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, agent);
      } else if (part.kind === ChatRequestAgentSubcommandPart.Kind) {
        return new ChatRequestAgentSubcommandPart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.command);
      } else if (part.kind === ChatRequestSlashCommandPart.Kind) {
        return new ChatRequestSlashCommandPart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.slashCommand);
      } else if (part.kind === ChatRequestSlashPromptPart.Kind) {
        return new ChatRequestSlashPromptPart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.slashPromptCommand);
      } else if (part.kind === ChatRequestDynamicVariablePart.Kind) {
        return new ChatRequestDynamicVariablePart(new OffsetRange(part.range.start, part.range.endExclusive), part.editorRange, part.text, part.id, part.modelDescription, revive(part.data), part.fullName, part.icon, part.isFile, part.isDirectory);
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
  ChatRequestSlashPromptPart,
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
