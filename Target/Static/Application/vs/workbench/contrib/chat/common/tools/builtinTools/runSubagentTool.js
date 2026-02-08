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
var RunSubagentTool_1;
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Event } from "../../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { generateUuid } from "../../../../../../base/common/uuid.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { IChatAgentService } from "../../participants/chatAgents.js";
import { IChatService } from "../../chatService/chatService.js";
import { ChatRequestVariableSet } from "../../attachments/chatVariableEntries.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../constants.js";
import { ILanguageModelsService } from "../../languageModels.js";
import { ILanguageModelToolsService, isToolSet, ToolDataSource, VSCodeToolReference } from "../languageModelToolsService.js";
import { ComputeAutomaticInstructions } from "../../promptSyntax/computeAutomaticInstructions.js";
import { ManageTodoListToolToolId } from "./manageTodoListTool.js";
import { createToolSimpleTextResult } from "./toolHelpers.js";
import { IPromptsService } from "../../promptSyntax/service/promptsService.js";
const BaseModelDescription = `Launch a new agent to handle complex, multi-step tasks autonomously. This tool is good at researching complex questions, searching for code, and executing multi-step tasks. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries, use this agent to perform the search for you.

- Agents do not run async or in the background, you will wait for the agent's result.
- When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.
- Each agent invocation is stateless. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.
- The agent's outputs should generally be trusted
- Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, web fetches, etc.), since it is not aware of the user's intent`;
let RunSubagentTool = class RunSubagentTool2 extends Disposable {
  static {
    __name(this, "RunSubagentTool");
  }
  static {
    RunSubagentTool_1 = this;
  }
  static {
    this.Id = "runSubagent";
  }
  constructor(chatAgentService, chatService, languageModelToolsService, languageModelsService, logService, toolsService, configurationService, promptsService, instantiationService) {
    super();
    this.chatAgentService = chatAgentService;
    this.chatService = chatService;
    this.languageModelToolsService = languageModelToolsService;
    this.languageModelsService = languageModelsService;
    this.logService = logService;
    this.toolsService = toolsService;
    this.configurationService = configurationService;
    this.promptsService = promptsService;
    this.instantiationService = instantiationService;
    this.onDidUpdateToolData = Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(ChatConfiguration.SubagentToolCustomAgents));
  }
  getToolData() {
    let modelDescription = BaseModelDescription;
    const inputSchema = {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "A detailed description of the task for the agent to perform"
        },
        description: {
          type: "string",
          description: "A short (3-5 word) description of the task"
        }
      },
      required: ["prompt", "description"]
    };
    if (this.configurationService.getValue(ChatConfiguration.SubagentToolCustomAgents)) {
      inputSchema.properties.agentName = {
        type: "string",
        description: "Optional name of a specific agent to invoke. If not provided, uses the current agent."
      };
      modelDescription += `
- If the user asks for a certain agent, you MUST provide that EXACT agent name (case-sensitive) to invoke that specific agent.`;
    }
    const runSubagentToolData = {
      id: RunSubagentTool_1.Id,
      toolReferenceName: VSCodeToolReference.runSubagent,
      icon: ThemeIcon.fromId(Codicon.organization.id),
      displayName: localize("tool.runSubagent.displayName", "Run Subagent"),
      userDescription: localize("tool.runSubagent.userDescription", "Run a task within an isolated subagent context to enable efficient organization of tasks and context window management."),
      modelDescription,
      source: ToolDataSource.Internal,
      inputSchema
    };
    return runSubagentToolData;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const args = invocation.parameters;
    this.logService.debug(`RunSubagentTool: Invoking with prompt: ${args.prompt.substring(0, 100)}...`);
    if (!invocation.context) {
      throw new Error("toolInvocationToken is required for this tool");
    }
    const model = this.chatService.getSession(invocation.context.sessionResource);
    if (!model) {
      throw new Error("Chat model not found for session");
    }
    const request = model.getRequests().at(-1);
    const store = new DisposableStore();
    try {
      const defaultAgent = this.chatAgentService.getDefaultAgent(ChatAgentLocation.Chat, ChatModeKind.Agent);
      if (!defaultAgent) {
        return createToolSimpleTextResult("Error: No default agent available");
      }
      let modeModelId = invocation.modelId;
      let modeTools = invocation.userSelectedTools;
      let modeInstructions;
      let subagent;
      const subAgentName = args.agentName;
      if (subAgentName) {
        subagent = await this.getSubAgentByName(subAgentName);
        if (subagent) {
          const modeModelQualifiedNames = subagent.model;
          if (modeModelQualifiedNames) {
            outer: for (const qualifiedName of modeModelQualifiedNames) {
              const lmByQualifiedName = this.languageModelsService.lookupLanguageModelByQualifiedName(qualifiedName);
              if (lmByQualifiedName?.identifier) {
                modeModelId = lmByQualifiedName.identifier;
                break outer;
              }
            }
          }
          const modeCustomTools = subagent.tools;
          if (modeCustomTools) {
            const enablementMap = this.languageModelToolsService.toToolAndToolSetEnablementMap(modeCustomTools, subagent.target, void 0);
            modeTools = {};
            for (const [tool, enabled] of enablementMap) {
              if (!isToolSet(tool)) {
                modeTools[tool.id] = enabled;
              }
            }
          }
          const instructions = subagent.agentInstructions;
          modeInstructions = instructions && {
            name: subAgentName,
            content: instructions.content,
            toolReferences: this.toolsService.toToolReferences(instructions.toolReferences),
            metadata: instructions.metadata
          };
        } else {
          throw new Error(`Requested agent '${subAgentName}' not found. Try again with the correct agent name, or omit the agentName to use the current agent.`);
        }
      }
      const markdownParts = [];
      const subAgentInvocationId = invocation.callId ?? `subagent-${generateUuid()}`;
      let inEdit = false;
      const progressCallback = /* @__PURE__ */ __name((parts) => {
        for (const part of parts) {
          if (part.kind === "textEdit" || part.kind === "notebookEdit" || part.kind === "codeblockUri") {
            if (part.kind === "codeblockUri" && !inEdit) {
              inEdit = true;
              model.acceptResponseProgress(request, { kind: "markdownContent", content: new MarkdownString("```\n") });
            }
            if (part.kind === "codeblockUri") {
              model.acceptResponseProgress(request, { ...part, subAgentInvocationId });
            } else {
              model.acceptResponseProgress(request, part);
            }
          } else if (part.kind === "markdownContent") {
            if (inEdit) {
              model.acceptResponseProgress(request, { kind: "markdownContent", content: new MarkdownString("\n```\n\n") });
              inEdit = false;
            }
            markdownParts.push(part.content.value);
          }
        }
      }, "progressCallback");
      if (modeTools) {
        modeTools[RunSubagentTool_1.Id] = false;
        modeTools[ManageTodoListToolToolId] = false;
        modeTools["copilot_askQuestions"] = false;
      }
      const variableSet = new ChatRequestVariableSet();
      const computer = this.instantiationService.createInstance(ComputeAutomaticInstructions, ChatModeKind.Agent, modeTools, void 0);
      await computer.collect(variableSet, token);
      const agentRequest = {
        sessionResource: invocation.context.sessionResource,
        requestId: invocation.callId ?? `subagent-${Date.now()}`,
        agentId: defaultAgent.id,
        message: args.prompt,
        variables: { variables: variableSet.asArray() },
        location: ChatAgentLocation.Chat,
        subAgentInvocationId: invocation.callId,
        subAgentName,
        userSelectedModelId: modeModelId,
        userSelectedTools: modeTools,
        modeInstructions,
        parentRequestId: invocation.chatRequestId
      };
      store.add(this.languageModelToolsService.onDidInvokeTool((e) => {
        if (e.subagentInvocationId === subAgentInvocationId) {
          markdownParts.length = 0;
        }
      }));
      const result = await this.chatAgentService.invokeAgent(defaultAgent.id, agentRequest, progressCallback, [], token);
      if (result.errorDetails) {
        return createToolSimpleTextResult(`Agent error: ${result.errorDetails.message}`);
      }
      const resultText = markdownParts.join("").replace(/^\n*```\n+```\n*/g, "").trim() || "Agent completed with no output";
      if (invocation.toolSpecificData?.kind === "subagent") {
        invocation.toolSpecificData.result = resultText;
      }
      return {
        content: [{
          kind: "text",
          value: resultText
        }],
        toolMetadata: {
          subAgentInvocationId,
          description: args.description,
          agentName: agentRequest.subAgentName
        }
      };
    } catch (error) {
      const errorMessage = `Error invoking subagent: ${error instanceof Error ? error.message : "Unknown error"}`;
      this.logService.error(errorMessage, error);
      return createToolSimpleTextResult(errorMessage);
    } finally {
      store.dispose();
    }
  }
  async getSubAgentByName(name) {
    const agents = await this.promptsService.getCustomAgents(CancellationToken.None);
    return agents.find((agent) => agent.name === name);
  }
  async prepareToolInvocation(context, _token) {
    const args = context.parameters;
    const subagent = args.agentName ? await this.getSubAgentByName(args.agentName) : void 0;
    return {
      invocationMessage: args.description,
      toolSpecificData: {
        kind: "subagent",
        description: args.description,
        agentName: subagent?.name,
        prompt: args.prompt
      }
    };
  }
};
RunSubagentTool = RunSubagentTool_1 = __decorate([
  __param(0, IChatAgentService),
  __param(1, IChatService),
  __param(2, ILanguageModelToolsService),
  __param(3, ILanguageModelsService),
  __param(4, ILogService),
  __param(5, ILanguageModelToolsService),
  __param(6, IConfigurationService),
  __param(7, IPromptsService),
  __param(8, IInstantiationService)
], RunSubagentTool);
export {
  RunSubagentTool
};
//# sourceMappingURL=runSubagentTool.js.map
