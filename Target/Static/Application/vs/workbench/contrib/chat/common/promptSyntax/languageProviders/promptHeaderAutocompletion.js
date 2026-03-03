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
import { IPromptsService, Target } from "../service/promptsService.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { ClaudeHeaderAttributes, parseCommaSeparatedList, PromptHeaderAttributes } from "../promptFileParser.js";
import { getAttributeDescription, getTarget, getValidAttributeNames, claudeAgentAttributes, claudeRulesAttributes, knownClaudeTools, knownGithubCopilotTools } from "./promptValidator.js";
import { localize } from "../../../../../../nls.js";
import { formatArrayValue, getQuotePreference } from "../utils/promptEditHelper.js";
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
    const target = getTarget(promptType, header);
    const attributesToPropose = new Set(getValidAttributeNames(promptType, false, target));
    for (const attr of header.attributes) {
      attributesToPropose.delete(attr.key);
    }
    const getInsertText = /* @__PURE__ */ __name((key) => {
      if (colonPosition) {
        return key;
      }
      const valueSuggestions = this.getValueSuggestions(promptType, key, target);
      if (valueSuggestions.length > 0) {
        return `${key}: \${0:${valueSuggestions[0].name}}`;
      } else {
        return `${key}: $0`;
      }
    }, "getInsertText");
    for (const attribute of attributesToPropose) {
      const item = {
        label: attribute,
        documentation: getAttributeDescription(attribute, promptType, target),
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
    const posLineNumber = position.lineNumber;
    const attribute = header.attributes.find(({ range }) => range.startLineNumber <= posLineNumber && posLineNumber <= range.endLineNumber);
    if (!attribute) {
      return void 0;
    }
    const target = getTarget(promptType, header);
    if (!getValidAttributeNames(promptType, true, target).includes(attribute.key)) {
      return void 0;
    }
    if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
      if (attribute.key === PromptHeaderAttributes.model) {
        if (attribute.value.type === "sequence") {
          const getValues = /* @__PURE__ */ __name(async () => {
            if (target === Target.Claude) {
              return knownClaudeTools;
            } else {
              return this.getModelNames(promptType === PromptsType.agent);
            }
          }, "getValues");
          return this.provideArrayCompletions(model, position, attribute.value, getValues);
        }
      }
      if (attribute.key === PromptHeaderAttributes.tools || attribute.key === ClaudeHeaderAttributes.disallowedTools) {
        let value = attribute.value;
        if (value.type === "scalar") {
          value = parseCommaSeparatedList(value);
        }
        if (value.type === "sequence") {
          const getValues = /* @__PURE__ */ __name(async () => {
            if (target === Target.GitHubCopilot) {
              return knownGithubCopilotTools;
            } else if (target === Target.Claude) {
              return knownClaudeTools;
            } else {
              return Array.from(this.languageModelToolsService.getFullReferenceNames()).map((name) => ({ name }));
            }
          }, "getValues");
          return this.provideArrayCompletions(model, position, value, getValues);
        }
      }
    }
    if (attribute.key === PromptHeaderAttributes.agents) {
      if (attribute.value.type === "sequence") {
        return this.provideArrayCompletions(model, position, attribute.value, async () => {
          return await this.promptsService.getCustomAgents(CancellationToken.None);
        });
      }
    }
    const lineContent = model.getLineContent(attribute.range.startLineNumber);
    const whilespaceAfterColon = lineContent.substring(colonPosition.column).match(/^\s*/)?.[0].length ?? 0;
    const entries = this.getValueSuggestions(promptType, attribute.key, target);
    for (const entry of entries) {
      const item = {
        label: entry.name,
        documentation: entry.description,
        kind: 13,
        insertText: whilespaceAfterColon === 0 ? ` ${entry.name}` : entry.name,
        range: new Range(position.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position.lineNumber, model.getLineMaxColumn(position.lineNumber))
      };
      suggestions.push(item);
    }
    if (attribute.key === PromptHeaderAttributes.handOffs) {
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
  getValueSuggestions(promptType, attribute, target) {
    if (target === Target.Claude) {
      const attributeDesc = promptType === PromptsType.instructions ? claudeRulesAttributes[attribute] : claudeAgentAttributes[attribute];
      if (attributeDesc) {
        if (attributeDesc.enums) {
          return attributeDesc.enums;
        } else if (attributeDesc.defaults) {
          return attributeDesc.defaults.map((value) => ({ name: value }));
        }
      }
      return [];
    }
    switch (attribute) {
      case PromptHeaderAttributes.applyTo:
        if (promptType === PromptsType.instructions) {
          return [
            { name: `'**'` },
            { name: `'**/*.ts, **/*.js'` },
            { name: `'**/*.php'` },
            { name: `'**/*.py'` }
          ];
        }
        break;
      case PromptHeaderAttributes.agent:
      case PromptHeaderAttributes.mode:
        if (promptType === PromptsType.prompt) {
          const agents = this.chatModeService.getModes();
          const suggestions = [];
          for (const agent of Iterable.concat(agents.builtin, agents.custom)) {
            suggestions.push({ name: agent.name.get(), description: agent.label.get() });
          }
          return suggestions;
        }
        break;
      case PromptHeaderAttributes.target:
        if (promptType === PromptsType.agent) {
          return [{ name: "vscode" }, { name: "github-copilot" }];
        }
        break;
      case PromptHeaderAttributes.tools:
        if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
          return [
            { name: "[]" },
            { name: `['search', 'edit', 'web']` }
          ];
        }
        break;
      case PromptHeaderAttributes.model:
        if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
          return this.getModelNames(promptType === PromptsType.agent);
        }
        break;
      case PromptHeaderAttributes.infer:
        if (promptType === PromptsType.agent) {
          return [
            { name: "true" },
            { name: "false" }
          ];
        }
        break;
      case PromptHeaderAttributes.agents:
        if (promptType === PromptsType.agent) {
          return [{ name: '["*"]' }];
        }
        break;
      case PromptHeaderAttributes.userInvocable:
        if (promptType === PromptsType.agent || promptType === PromptsType.skill) {
          return [{ name: "true" }, { name: "false" }];
        }
        break;
      case PromptHeaderAttributes.disableModelInvocation:
        if (promptType === PromptsType.agent || promptType === PromptsType.skill) {
          return [{ name: "true" }, { name: "false" }];
        }
        break;
    }
    return [];
  }
  getModelNames(agentModeOnly) {
    const result = [];
    for (const model of this.languageModelsService.getLanguageModelIds()) {
      const metadata = this.languageModelsService.lookupLanguageModel(model);
      if (metadata && metadata.isUserSelectable !== false && !metadata.targetChatSessionType) {
        if (!agentModeOnly || ILanguageModelChatMetadata.suitableForAgentMode(metadata)) {
          result.push({
            name: ILanguageModelChatMetadata.asQualifiedName(metadata),
            description: metadata.tooltip
          });
        }
      }
    }
    return result;
  }
  async provideArrayCompletions(model, position, arrayValue, getValues) {
    const getSuggestions = /* @__PURE__ */ __name(async (toolRange, currentItem) => {
      const suggestions = [];
      const entries = await getValues();
      const quotePreference = getQuotePreference(arrayValue, model);
      const existingValues = new Set(arrayValue.items.filter((item) => item !== currentItem).filter((item) => item.type === "scalar").map((item) => item.value));
      for (const entry of entries) {
        const entryName = entry.name;
        if (existingValues.has(entryName)) {
          continue;
        }
        let insertText;
        if (!toolRange.isEmpty()) {
          const firstChar = model.getValueInRange(toolRange).charCodeAt(0);
          insertText = firstChar === 39 ? `'${entryName}'` : firstChar === 34 ? `"${entryName}"` : entryName;
        } else {
          insertText = formatArrayValue(entryName, quotePreference);
        }
        suggestions.push({
          label: entryName,
          documentation: entry.description,
          kind: 13,
          filterText: insertText,
          insertText,
          range: toolRange
        });
      }
      return { suggestions };
    }, "getSuggestions");
    for (const item of arrayValue.items) {
      if (item.range.containsPosition(position)) {
        return await getSuggestions(item.range, item);
      }
    }
    const prefix = model.getValueInRange(new Range(position.lineNumber, 1, position.lineNumber, position.column));
    if (prefix.match(/[:,[]\s*$/)) {
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
