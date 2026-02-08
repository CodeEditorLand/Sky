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
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Position } from "../../../../../../editor/common/core/position.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "../../languageModels.js";
import { ILanguageModelToolsService } from "../../tools/languageModelToolsService.js";
import { IChatModeService } from "../../chatModes.js";
import { getPromptsTypeForLanguageId, PromptsType } from "../promptTypes.js";
import { IPromptsService } from "../service/promptsService.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { PromptHeaderAttributes } from "../promptFileParser.js";
import { getAttributeDescription, getValidAttributeNames, isGithubTarget, knownGithubCopilotTools } from "./promptValidator.js";
import { localize } from "../../../../../../nls.js";
let PromptHeaderAutocompletion = class PromptHeaderAutocompletion2 {
  static {
    __name(this, "PromptHeaderAutocompletion");
  }
  constructor(promptsService, languageModelsService, languageModelToolsService, chatModeService) {
    this.promptsService = promptsService;
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this._debugDisplayName = "PromptHeaderAutocompletion";
    this.triggerCharacters = [":"];
  }
  /**
   * The main function of this provider that calculates
   * completion items based on the provided arguments.
   */
  async provideCompletionItems(model, position, context, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    if (/^\s*$/.test(model.getValue())) {
      return {
        suggestions: [{
          label: localize("promptHeaderAutocompletion.addHeader", "Add Prompt Header"),
          kind: 28,
          insertText: [
            `---`,
            `description: $1`,
            `---`,
            `$0`
          ].join("\n"),
          insertTextRules: 4,
          range: model.getFullModelRange()
        }]
      };
    }
    const parsedAST = this.promptsService.getParsedPromptFile(model);
    const header = parsedAST.header;
    if (!header) {
      return void 0;
    }
    const headerRange = parsedAST.header.range;
    if (position.lineNumber < headerRange.startLineNumber || position.lineNumber >= headerRange.endLineNumber) {
      return void 0;
    }
    const lineText = model.getLineContent(position.lineNumber);
    const colonIndex = lineText.indexOf(":");
    const colonPosition = colonIndex !== -1 ? new Position(position.lineNumber, colonIndex + 1) : void 0;
    if (!colonPosition || position.isBeforeOrEqual(colonPosition)) {
      return this.provideAttributeNameCompletions(model, position, header, colonPosition, promptType);
    } else if (colonPosition && colonPosition.isBefore(position)) {
      return this.provideValueCompletions(model, position, header, colonPosition, promptType);
    }
    return void 0;
  }
  async provideAttributeNameCompletions(model, position, header, colonPosition, promptType) {
    const suggestions = [];
    const isGitHubTarget = isGithubTarget(promptType, header.target);
    const attributesToPropose = new Set(getValidAttributeNames(promptType, false, isGitHubTarget));
    for (const attr of header.attributes) {
      attributesToPropose.delete(attr.key);
    }
    const getInsertText = /* @__PURE__ */ __name((key) => {
      if (colonPosition) {
        return key;
      }
      const valueSuggestions = this.getValueSuggestions(promptType, key);
      if (valueSuggestions.length > 0) {
        return `${key}: \${0:${valueSuggestions[0]}}`;
      } else {
        return `${key}: $0`;
      }
    }, "getInsertText");
    for (const attribute of attributesToPropose) {
      const item = {
        label: attribute,
        documentation: getAttributeDescription(attribute, promptType),
        kind: 9,
        insertText: getInsertText(attribute),
        insertTextRules: 4,
        range: new Range(position.lineNumber, 1, position.lineNumber, !colonPosition ? model.getLineMaxColumn(position.lineNumber) : colonPosition.column)
      };
      suggestions.push(item);
    }
    return { suggestions };
  }
  async provideValueCompletions(model, position, header, colonPosition, promptType) {
    const suggestions = [];
    const attribute = header.attributes.find((attr) => attr.range.containsPosition(position));
    if (!attribute) {
      return void 0;
    }
    const isGitHubTarget = isGithubTarget(promptType, header.target);
    if (!getValidAttributeNames(promptType, true, isGitHubTarget).includes(attribute.key)) {
      return void 0;
    }
    if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
      if (attribute.key === PromptHeaderAttributes.model) {
        if (attribute.value.type === "array") {
          const getValues = /* @__PURE__ */ __name(async () => this.getModelNames(promptType === PromptsType.agent), "getValues");
          return this.provideArrayCompletions(model, position, attribute, getValues);
        }
      }
      if (attribute.key === PromptHeaderAttributes.tools) {
        if (attribute.value.type === "array") {
          const getValues = /* @__PURE__ */ __name(async () => isGitHubTarget ? knownGithubCopilotTools : Array.from(this.languageModelToolsService.getFullReferenceNames()), "getValues");
          return this.provideArrayCompletions(model, position, attribute, getValues);
        }
      }
    }
    if (promptType === PromptsType.agent) {
      if (attribute.key === PromptHeaderAttributes.agents && !isGitHubTarget) {
        if (attribute.value.type === "array") {
          return this.provideArrayCompletions(model, position, attribute, async () => (await this.promptsService.getCustomAgents(CancellationToken.None)).map((agent) => agent.name));
        }
      }
    }
    const lineContent = model.getLineContent(attribute.range.startLineNumber);
    const whilespaceAfterColon = lineContent.substring(colonPosition.column).match(/^\s*/)?.[0].length ?? 0;
    const values = this.getValueSuggestions(promptType, attribute.key);
    for (const value of values) {
      const item = {
        label: value,
        kind: 13,
        insertText: whilespaceAfterColon === 0 ? ` ${value}` : value,
        range: new Range(position.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position.lineNumber, model.getLineMaxColumn(position.lineNumber))
      };
      suggestions.push(item);
    }
    if (attribute.key === PromptHeaderAttributes.handOffs && promptType === PromptsType.agent) {
      const value = [
        "",
        "  - label: Start Implementation",
        "    agent: agent",
        "    prompt: Implement the plan",
        "    send: true"
      ].join("\n");
      const item = {
        label: localize("promptHeaderAutocompletion.handoffsExample", "Handoff Example"),
        kind: 13,
        insertText: whilespaceAfterColon === 0 ? ` ${value}` : value,
        range: new Range(position.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position.lineNumber, model.getLineMaxColumn(position.lineNumber))
      };
      suggestions.push(item);
    }
    return { suggestions };
  }
  getValueSuggestions(promptType, attribute) {
    switch (attribute) {
      case PromptHeaderAttributes.applyTo:
        if (promptType === PromptsType.instructions) {
          return [`'**'`, `'**/*.ts, **/*.js'`, `'**/*.php'`, `'**/*.py'`];
        }
        break;
      case PromptHeaderAttributes.agent:
      case PromptHeaderAttributes.mode:
        if (promptType === PromptsType.prompt) {
          const agents = this.chatModeService.getModes();
          const suggestions = [];
          for (const agent of Iterable.concat(agents.builtin, agents.custom)) {
            suggestions.push(agent.name.get());
          }
          return suggestions;
        }
        break;
      case PromptHeaderAttributes.target:
        if (promptType === PromptsType.agent) {
          return ["vscode", "github-copilot"];
        }
        break;
      case PromptHeaderAttributes.tools:
        if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
          return ["[]", `['search', 'edit', 'fetch']`];
        }
        break;
      case PromptHeaderAttributes.model:
        if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
          return this.getModelNames(promptType === PromptsType.agent);
        }
        break;
      case PromptHeaderAttributes.infer:
        if (promptType === PromptsType.agent) {
          return ["true", "false"];
        }
        break;
      case PromptHeaderAttributes.agents:
        if (promptType === PromptsType.agent) {
          return ['["*"]'];
        }
        break;
      case PromptHeaderAttributes.userInvokable:
        if (promptType === PromptsType.agent) {
          return ["true", "false"];
        }
        break;
      case PromptHeaderAttributes.disableModelInvocation:
        if (promptType === PromptsType.agent) {
          return ["true", "false"];
        }
        break;
    }
    return [];
  }
  getModelNames(agentModeOnly) {
    const result = [];
    for (const model of this.languageModelsService.getLanguageModelIds()) {
      const metadata = this.languageModelsService.lookupLanguageModel(model);
      if (metadata && metadata.isUserSelectable !== false) {
        if (!agentModeOnly || ILanguageModelChatMetadata.suitableForAgentMode(metadata)) {
          result.push(ILanguageModelChatMetadata.asQualifiedName(metadata));
        }
      }
    }
    return result;
  }
  async provideArrayCompletions(model, position, agentsAttr, getValues) {
    if (agentsAttr.value.type !== "array") {
      return void 0;
    }
    const getSuggestions = /* @__PURE__ */ __name(async (toolRange) => {
      const suggestions = [];
      const toolNames = await getValues();
      for (const toolName of toolNames) {
        let insertText;
        if (!toolRange.isEmpty()) {
          const firstChar = model.getValueInRange(toolRange).charCodeAt(0);
          insertText = firstChar === 39 ? `'${toolName}'` : firstChar === 34 ? `"${toolName}"` : toolName;
        } else {
          insertText = `'${toolName}'`;
        }
        suggestions.push({
          label: toolName,
          kind: 13,
          filterText: insertText,
          insertText,
          range: toolRange
        });
      }
      return { suggestions };
    }, "getSuggestions");
    for (const toolNameNode of agentsAttr.value.items) {
      if (toolNameNode.range.containsPosition(position)) {
        return await getSuggestions(toolNameNode.range);
      }
    }
    const prefix = model.getValueInRange(new Range(position.lineNumber, 1, position.lineNumber, position.column));
    if (prefix.match(/[,[]\s*$/)) {
      return await getSuggestions(new Range(position.lineNumber, position.column, position.lineNumber, position.column));
    }
    return void 0;
  }
};
PromptHeaderAutocompletion = __decorate([
  __param(0, IPromptsService),
  __param(1, ILanguageModelsService),
  __param(2, ILanguageModelToolsService),
  __param(3, IChatModeService)
], PromptHeaderAutocompletion);
export {
  PromptHeaderAutocompletion
};
//# sourceMappingURL=promptHeaderAutocompletion.js.map
