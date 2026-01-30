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
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { localize } from "../../../../../../nls.js";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "../../languageModels.js";
import { ILanguageModelToolsService, ToolSet } from "../../tools/languageModelToolsService.js";
import { IChatModeService, isBuiltinChatMode } from "../../chatModes.js";
import { getPromptsTypeForLanguageId, PromptsType } from "../promptTypes.js";
import { IPromptsService } from "../service/promptsService.js";
import { PromptHeaderAttributes } from "../promptFileParser.js";
import { isGithubTarget } from "./promptValidator.js";
let PromptHoverProvider = class PromptHoverProvider2 {
  static {
    __name(this, "PromptHoverProvider");
  }
  constructor(promptsService, languageModelToolsService, languageModelsService, chatModeService) {
    this.promptsService = promptsService;
    this.languageModelToolsService = languageModelToolsService;
    this.languageModelsService = languageModelsService;
    this.chatModeService = chatModeService;
    this._debugDisplayName = "PromptHoverProvider";
  }
  createHover(contents, range) {
    return {
      contents: [new MarkdownString(contents)],
      range
    };
  }
  async provideHover(model, position, token, _context) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    if (promptAST.header?.range.containsPosition(position)) {
      return this.provideHeaderHover(position, promptType, promptAST.header);
    }
    if (promptAST.body?.range.containsPosition(position)) {
      return this.provideBodyHover(position, promptAST.body);
    }
    return void 0;
  }
  async provideBodyHover(position, body) {
    for (const ref of body.variableReferences) {
      if (ref.range.containsPosition(position)) {
        const toolName = ref.name;
        return this.getToolHoverByName(toolName, ref.range);
      }
    }
    return void 0;
  }
  async provideHeaderHover(position, promptType, header) {
    switch (promptType) {
      case PromptsType.instructions:
        for (const attribute of header.attributes) {
          if (attribute.range.containsPosition(position)) {
            switch (attribute.key) {
              case PromptHeaderAttributes.name:
                return this.createHover(localize("promptHeader.instructions.name", "The name of the instruction file as shown in the UI. If not set, the name is derived from the file name."), attribute.range);
              case PromptHeaderAttributes.description:
                return this.createHover(localize("promptHeader.instructions.description", "The description of the instruction file. It can be used to provide additional context or information about the instructions and is passed to the language model as part of the prompt."), attribute.range);
              case PromptHeaderAttributes.applyTo:
                return this.createHover(localize("promptHeader.instructions.applyToRange", "One or more glob pattern (separated by comma) that describe for which files the instructions apply to. Based on these patterns, the file is automatically included in the prompt, when the context contains a file that matches one or more of these patterns. Use `**` when you want this file to always be added.\nExample: `**/*.ts`, `**/*.js`, `client/**`"), attribute.range);
            }
          }
        }
        break;
      case PromptsType.skill:
        for (const attribute of header.attributes) {
          if (attribute.range.containsPosition(position)) {
            switch (attribute.key) {
              case PromptHeaderAttributes.name:
                return this.createHover(localize("promptHeader.skill.name", "The name of the skill."), attribute.range);
              case PromptHeaderAttributes.description:
                return this.createHover(localize("promptHeader.skill.description", "The description of the skill. The description is added to every request and will be used by the agent to decide when to load the skill."), attribute.range);
            }
          }
        }
        break;
      case PromptsType.agent:
        for (const attribute of header.attributes) {
          if (attribute.range.containsPosition(position)) {
            switch (attribute.key) {
              case PromptHeaderAttributes.name:
                return this.createHover(localize("promptHeader.agent.name", "The name of the agent as shown in the UI."), attribute.range);
              case PromptHeaderAttributes.description:
                return this.createHover(localize("promptHeader.agent.description", "The description of the custom agent, what it does and when to use it."), attribute.range);
              case PromptHeaderAttributes.argumentHint:
                return this.createHover(localize("promptHeader.agent.argumentHint", "The argument-hint describes what inputs the custom agent expects or supports."), attribute.range);
              case PromptHeaderAttributes.model:
                return this.getModelHover(attribute, attribute.range, localize("promptHeader.agent.model", "Specify the model that runs this custom agent."), isGithubTarget(promptType, header.target));
              case PromptHeaderAttributes.tools:
                return this.getToolHover(attribute, position, localize("promptHeader.agent.tools", "The set of tools that the custom agent has access to."));
              case PromptHeaderAttributes.handOffs:
                return this.getHandsOffHover(attribute, position, isGithubTarget(promptType, header.target));
              case PromptHeaderAttributes.target:
                return this.createHover(localize("promptHeader.agent.target", "The target to which the header attributes like tools apply to. Possible values are `github-copilot` and `vscode`."), attribute.range);
              case PromptHeaderAttributes.infer:
                return this.createHover(localize("promptHeader.agent.infer", "Whether the agent can be used as a subagent."), attribute.range);
            }
          }
        }
        break;
      case PromptsType.prompt:
        for (const attribute of header.attributes) {
          if (attribute.range.containsPosition(position)) {
            switch (attribute.key) {
              case PromptHeaderAttributes.name:
                return this.createHover(localize("promptHeader.prompt.name", "The name of the prompt. This is also the name of the slash command that will run this prompt."), attribute.range);
              case PromptHeaderAttributes.description:
                return this.createHover(localize("promptHeader.prompt.description", "The description of the reusable prompt, what it does and when to use it."), attribute.range);
              case PromptHeaderAttributes.argumentHint:
                return this.createHover(localize("promptHeader.prompt.argumentHint", "The argument-hint describes what inputs the prompt expects or supports."), attribute.range);
              case PromptHeaderAttributes.model:
                return this.getModelHover(attribute, attribute.range, localize("promptHeader.prompt.model", "The model to use in this prompt."), false);
              case PromptHeaderAttributes.tools:
                return this.getToolHover(attribute, position, localize("promptHeader.prompt.tools", "The tools to use in this prompt."));
              case PromptHeaderAttributes.agent:
              case PromptHeaderAttributes.mode:
                return this.getAgentHover(attribute, position);
            }
          }
        }
        break;
    }
    return void 0;
  }
  getToolHover(node, position, baseMessage) {
    if (node.value.type === "array") {
      for (const toolName of node.value.items) {
        if (toolName.type === "string" && toolName.range.containsPosition(position)) {
          const description = this.getToolHoverByName(toolName.value, toolName.range);
          if (description) {
            return description;
          }
        }
      }
    }
    return this.createHover(baseMessage, node.range);
  }
  getToolHoverByName(toolName, range) {
    const tool = this.languageModelToolsService.getToolByFullReferenceName(toolName);
    if (tool !== void 0) {
      if (tool instanceof ToolSet) {
        return this.getToolsetHover(tool, range);
      } else {
        return this.createHover(tool.userDescription ?? tool.modelDescription, range);
      }
    }
    return void 0;
  }
  getToolsetHover(toolSet, range) {
    const lines = [];
    lines.push(localize("toolSetName", "ToolSet: {0}\n\n", toolSet.referenceName));
    if (toolSet.description) {
      lines.push(toolSet.description);
    }
    for (const tool of toolSet.getTools()) {
      lines.push(`- ${tool.toolReferenceName ?? tool.displayName}`);
    }
    return this.createHover(lines.join("\n"), range);
  }
  getModelHover(node, range, baseMessage, isGitHubTarget) {
    if (isGitHubTarget) {
      return this.createHover(baseMessage + "\n\n" + localize("promptHeader.agent.model.githubCopilot", "Note: This attribute is not used when target is github-copilot."), range);
    }
    if (node.value.type === "string") {
      for (const id of this.languageModelsService.getLanguageModelIds()) {
        const meta = this.languageModelsService.lookupLanguageModel(id);
        if (meta && ILanguageModelChatMetadata.matchesQualifiedName(node.value.value, meta)) {
          const lines = [];
          lines.push(baseMessage + "\n");
          lines.push(localize("modelName", "- Name: {0}", meta.name));
          lines.push(localize("modelFamily", "- Family: {0}", meta.family));
          lines.push(localize("modelVendor", "- Vendor: {0}", meta.vendor));
          if (meta.tooltip) {
            lines.push("", "", meta.tooltip);
          }
          return this.createHover(lines.join("\n"), range);
        }
      }
    }
    return this.createHover(baseMessage, range);
  }
  getAgentHover(agentAttribute, position) {
    const lines = [];
    const value = agentAttribute.value;
    if (value.type === "string" && value.range.containsPosition(position)) {
      const agent = this.chatModeService.findModeByName(value.value);
      if (agent) {
        const description = agent.description.get() || (isBuiltinChatMode(agent) ? localize("promptHeader.prompt.agent.builtInDesc", "Built-in agent") : localize("promptHeader.prompt.agent.customDesc", "Custom agent"));
        lines.push(`\`${agent.name.get()}\`: ${description}`);
      }
    } else {
      const agents = this.chatModeService.getModes();
      lines.push(localize("promptHeader.prompt.agent.description", "The agent to use when running this prompt."));
      lines.push("");
      lines.push(localize("promptHeader.prompt.agent.builtin", "**Built-in agents:**"));
      for (const agent of agents.builtin) {
        lines.push(`- \`${agent.name.get()}\`: ${agent.description.get() || agent.label.get()}`);
      }
      if (agents.custom.length > 0) {
        lines.push("");
        lines.push(localize("promptHeader.prompt.agent.custom", "**Custom agents:**"));
        for (const agent of agents.custom) {
          const description = agent.description.get();
          lines.push(`- \`${agent.name.get()}\`: ${description || localize("promptHeader.prompt.agent.customDesc", "Custom agent")}`);
        }
      }
    }
    return this.createHover(lines.join("\n"), agentAttribute.range);
  }
  getHandsOffHover(attribute, position, isGitHubTarget) {
    const handoffsBaseMessage = localize("promptHeader.agent.handoffs", "Possible handoff actions when the agent has completed its task.");
    if (isGitHubTarget) {
      return this.createHover(handoffsBaseMessage + "\n\n" + localize("promptHeader.agent.handoffs.githubCopilot", "Note: This attribute is not used when target is github-copilot."), attribute.range);
    }
    return this.createHover(handoffsBaseMessage, attribute.range);
  }
};
PromptHoverProvider = __decorate([
  __param(0, IPromptsService),
  __param(1, ILanguageModelToolsService),
  __param(2, ILanguageModelsService),
  __param(3, IChatModeService)
], PromptHoverProvider);
export {
  PromptHoverProvider
};
//# sourceMappingURL=promptHovers.js.map
