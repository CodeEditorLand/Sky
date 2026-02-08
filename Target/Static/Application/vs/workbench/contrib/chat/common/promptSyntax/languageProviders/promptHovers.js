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
import { ILanguageModelsService } from "../../languageModels.js";
import { ILanguageModelToolsService, isToolSet } from "../../tools/languageModelToolsService.js";
import { IChatModeService, isBuiltinChatMode } from "../../chatModes.js";
import { getPromptsTypeForLanguageId, PromptsType } from "../promptTypes.js";
import { IPromptsService } from "../service/promptsService.js";
import { PromptHeaderAttributes } from "../promptFileParser.js";
import { getAttributeDescription, isGithubTarget } from "./promptValidator.js";
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
    for (const attribute of header.attributes) {
      if (attribute.range.containsPosition(position)) {
        const description = getAttributeDescription(attribute.key, promptType);
        if (description) {
          switch (attribute.key) {
            case PromptHeaderAttributes.model:
              return this.getModelHover(attribute, position, description, promptType === PromptsType.agent && isGithubTarget(promptType, header.target));
            case PromptHeaderAttributes.tools:
              return this.getToolHover(attribute, position, description);
            case PromptHeaderAttributes.agent:
            case PromptHeaderAttributes.mode:
              return this.getAgentHover(attribute, position, description);
            case PromptHeaderAttributes.handOffs:
              return this.getHandsOffHover(attribute, position, promptType === PromptsType.agent && isGithubTarget(promptType, header.target));
            case PromptHeaderAttributes.infer:
              return this.createHover(description + "\n\n" + localize("promptHeader.attribute.infer.hover", "Deprecated: Use `user-invokable` and `disable-model-invocation` instead."), attribute.range);
            default:
              return this.createHover(description, attribute.range);
          }
        }
      }
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
      if (isToolSet(tool)) {
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
  getModelHover(node, position, baseMessage, isGitHubTarget) {
    if (isGitHubTarget) {
      return this.createHover(baseMessage + "\n\n" + localize("promptHeader.agent.model.githubCopilot", "Note: This attribute is not used when target is github-copilot."), node.range);
    }
    const modelHoverContent = /* @__PURE__ */ __name((modelName) => {
      const result = this.languageModelsService.lookupLanguageModelByQualifiedName(modelName);
      if (result) {
        const meta = result.metadata;
        const lines = [];
        lines.push(baseMessage + "\n");
        lines.push(localize("modelName", "- Name: {0}", meta.name));
        lines.push(localize("modelFamily", "- Family: {0}", meta.family));
        lines.push(localize("modelVendor", "- Vendor: {0}", meta.vendor));
        if (meta.tooltip) {
          lines.push("", "", meta.tooltip);
        }
        return this.createHover(lines.join("\n"), node.range);
      }
      return void 0;
    }, "modelHoverContent");
    if (node.value.type === "string") {
      const hover = modelHoverContent(node.value.value);
      if (hover) {
        return hover;
      }
    } else if (node.value.type === "array") {
      for (const item of node.value.items) {
        if (item.type === "string" && item.range.containsPosition(position)) {
          const hover = modelHoverContent(item.value);
          if (hover) {
            return hover;
          }
        }
      }
    }
    return this.createHover(baseMessage, node.range);
  }
  getAgentHover(agentAttribute, position, baseMessage) {
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
      lines.push(baseMessage);
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
    const handoffsBaseMessage = getAttributeDescription(PromptHeaderAttributes.handOffs, PromptsType.agent);
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
