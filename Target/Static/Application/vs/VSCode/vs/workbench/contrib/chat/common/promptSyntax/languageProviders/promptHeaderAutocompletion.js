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
import { getPromptsTypeForLanguageId, PromptsType, Target } from "../promptTypes.js";
import { IPromptsService } from "../service/promptsService.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { parseCommaSeparatedList, PromptHeaderAttributes } from "../promptFileParser.js";
import { getAttributeDefinition, getTarget, getValidAttributeNames, knownClaudeTools, knownGithubCopilotTools, ClaudeHeaderAttributes } from "./promptFileAttributes.js";
import { localize } from "../../../../../../nls.js";
import { formatArrayValue, getQuotePreference } from "../utils/promptEditHelper.js";
import { HOOKS_BY_TARGET, HOOK_METADATA } from "../hookTypes.js";
import { HOOK_COMMAND_FIELD_DESCRIPTIONS } from "../hookSchema.js";
import { IWorkbenchEnvironmentService } from "../../../../../services/environment/common/environmentService.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { PromptsConfig } from "../config/config.js";
let PromptHeaderAutocompletion = class PromptHeaderAutocompletion2 {
  static {
    __name(this, "PromptHeaderAutocompletion");
  }
  constructor(promptsService, languageModelsService, languageModelToolsService, chatModeService, environmentService, configurationService) {
    this.promptsService = promptsService;
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
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
      let containingAttribute = header.attributes.find(({ range }) => range.startLineNumber < position.lineNumber && position.lineNumber <= range.endLineNumber);
      if (!containingAttribute) {
        for (let i = header.attributes.length - 1; i >= 0; i--) {
          const attr = header.attributes[i];
          if (attr.range.endLineNumber < position.lineNumber && attr.value.type === "map") {
            const nextAttr = header.attributes[i + 1];
            const nextStartLine = nextAttr ? nextAttr.range.startLineNumber : headerRange.endLineNumber;
            if (position.lineNumber < nextStartLine) {
              containingAttribute = attr;
            }
            break;
          }
        }
      }
      if (containingAttribute) {
        const attrLineText = model.getLineContent(containingAttribute.range.startLineNumber);
        const attrColonIndex = attrLineText.indexOf(":");
        if (attrColonIndex !== -1) {
          return this.provideValueCompletions(model, position, header, new Position(containingAttribute.range.startLineNumber, attrColonIndex + 1), promptType, containingAttribute);
        }
      }
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
    if (!this.configurationService.getValue(PromptsConfig.USE_CUSTOM_AGENT_HOOKS)) {
      attributesToPropose.delete(PromptHeaderAttributes.hooks);
    }
    for (const attr of header.attributes) {
      attributesToPropose.delete(attr.key);
    }
    const getInsertText = /* @__PURE__ */ __name((key) => {
      if (colonPosition) {
        return key;
      }
      if (key === PromptHeaderAttributes.hooks && promptType === PromptsType.agent && target !== Target.Claude) {
        const hookNames = Object.keys(HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET[Target.Undefined]);
        return `${key}:
  \${1|${hookNames.join(",")}|}:
    - type: command
      command: "$2"`;
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
        documentation: getAttributeDefinition(attribute, promptType, target)?.description,
        kind: 9,
        insertText: getInsertText(attribute),
        insertTextRules: 4,
        range: new Range(position.lineNumber, 1, position.lineNumber, !colonPosition ? model.getLineMaxColumn(position.lineNumber) : colonPosition.column)
      };
      suggestions.push(item);
    }
    return { suggestions };
  }
  async provideValueCompletions(model, position, header, colonPosition, promptType, preFoundAttribute) {
    const suggestions = [];
    const posLineNumber = position.lineNumber;
    const attribute = preFoundAttribute ?? header.attributes.find(({ range }) => range.startLineNumber <= posLineNumber && posLineNumber <= range.endLineNumber);
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
            if (target === Target.GitHubCopilot || this.environmentService.isSessionsWindow) {
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
    if (attribute.key === PromptHeaderAttributes.hooks) {
      if (attribute.value.type === "map") {
        return this.provideHookEventCompletions(model, position, attribute.value, target);
      }
      if (position.lineNumber !== attribute.range.startLineNumber) {
        const emptyMap = { type: "map", properties: [], range: attribute.value.range };
        return this.provideHookEventCompletions(model, position, emptyMap, target);
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
    if (attribute.key === PromptHeaderAttributes.hooks && promptType === PromptsType.agent) {
      const hookSnippet = [
        "",
        "  ${1|" + Object.keys(HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET[Target.Undefined]).join(",") + "|}:",
        "    - type: command",
        '      command: "$2"'
      ].join("\n");
      const item = {
        label: localize("promptHeaderAutocompletion.newHook", "New Hook"),
        kind: 28,
        insertText: whilespaceAfterColon === 0 ? ` ${hookSnippet}` : hookSnippet,
        insertTextRules: 4,
        range: new Range(position.lineNumber, colonPosition.column + whilespaceAfterColon + 1, position.lineNumber, model.getLineMaxColumn(position.lineNumber))
      };
      suggestions.push(item);
    }
    return { suggestions };
  }
  /**
   * Provides completions inside the `hooks:` map.
   * Determines what to suggest based on nesting depth:
   * - At hook event level: suggest event names (SessionStart, PreToolUse, etc.)
   * - Inside a command object: suggest command fields (type, command, timeout, etc.)
   */
  provideHookEventCompletions(model, position, hooksMap, target) {
    const hookEventOnLine = hooksMap.properties.find((p) => p.key.range.startLineNumber === position.lineNumber);
    if (hookEventOnLine) {
      const lineText2 = model.getLineContent(position.lineNumber);
      const colonIdx = lineText2.indexOf(":");
      if (colonIdx !== -1 && position.column > colonIdx + 1) {
        const whilespaceAfterColon = lineText2.substring(colonIdx + 1).match(/^\s*/)?.[0].length ?? 0;
        const commandSnippet = [
          "",
          "  - type: command",
          '    command: "$1"'
        ].join("\n");
        return {
          suggestions: [{
            label: localize("promptHeaderAutocompletion.newCommand", "New Command"),
            documentation: localize("promptHeaderAutocompletion.newCommand.description", "Add a new command entry to this hook."),
            kind: 28,
            insertText: whilespaceAfterColon === 0 ? ` ${commandSnippet}` : commandSnippet,
            insertTextRules: 4,
            range: new Range(position.lineNumber, colonIdx + 1 + whilespaceAfterColon + 1, position.lineNumber, model.getLineMaxColumn(position.lineNumber))
          }]
        };
      }
    }
    const commandFieldCompletions = this.provideHookCommandFieldCompletions(model, position, hooksMap, target);
    if (commandFieldCompletions) {
      return commandFieldCompletions;
    }
    const suggestions = [];
    const hooksByTarget = HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET[Target.Undefined];
    const lineText = model.getLineContent(position.lineNumber);
    const firstNonWhitespace = lineText.search(/\S/);
    const isEmptyLine = firstNonWhitespace === -1;
    const rangeStartColumn = isEmptyLine ? position.column : firstNonWhitespace + 1;
    const existingKeys = new Set(hooksMap.properties.filter((p) => p.key.range.startLineNumber !== position.lineNumber).map((p) => p.key.value));
    const expectedIndent = hooksMap.properties.length > 0 ? hooksMap.properties[0].key.range.startColumn - 1 : -1;
    if (expectedIndent >= 0) {
      const scanEnd = model.getLineCount();
      for (let lineNum = hooksMap.range.endLineNumber + 1; lineNum <= scanEnd; lineNum++) {
        if (lineNum === position.lineNumber) {
          continue;
        }
        const lt = model.getLineContent(lineNum);
        const lineIndent = lt.search(/\S/);
        if (lineIndent === -1) {
          continue;
        }
        if (lineIndent < expectedIndent) {
          break;
        }
        if (lineIndent === expectedIndent) {
          const match = lt.match(/^\s+(\S+)\s*:/);
          if (match) {
            existingKeys.add(match[1]);
          }
        }
      }
    }
    const lineHasColon = lineText.indexOf(":") !== -1;
    for (const [hookName, hookType] of Object.entries(hooksByTarget)) {
      if (existingKeys.has(hookName)) {
        continue;
      }
      const meta = HOOK_METADATA[hookType];
      let insertText;
      if (isEmptyLine) {
        insertText = [
          `${hookName}:`,
          `  - type: command`,
          `    command: "$1"`
        ].join("\n");
      } else if (lineHasColon) {
        insertText = `${hookName}:`;
      } else {
        insertText = hookName;
      }
      suggestions.push({
        label: hookName,
        documentation: meta?.description,
        kind: 9,
        insertText,
        insertTextRules: 4,
        range: new Range(position.lineNumber, rangeStartColumn, position.lineNumber, model.getLineMaxColumn(position.lineNumber))
      });
    }
    return { suggestions };
  }
  /**
   * Provides completions for hook command fields (type, command, windows, etc.)
   * when the cursor is inside a command object within the hooks map.
   * Detects nesting by checking if the position falls within a sequence item
   * of a hook event's value.
   */
  provideHookCommandFieldCompletions(model, position, hooksMap, target) {
    const containingCommandMap = this.findContainingCommandMap(model, position, hooksMap);
    if (!containingCommandMap) {
      return void 0;
    }
    const isCopilotCli = target === Target.GitHubCopilot;
    const validFields = isCopilotCli ? ["type", "bash", "powershell", "cwd", "env", "timeoutSec"] : ["type", "command", "windows", "linux", "osx", "bash", "powershell", "cwd", "env", "timeout"];
    const existingFields = new Set(containingCommandMap.properties.filter((p) => p.key.range.startLineNumber !== position.lineNumber).map((p) => p.key.value));
    const lineText = model.getLineContent(position.lineNumber);
    const firstNonWhitespace = lineText.search(/\S/);
    const isEmptyLine = firstNonWhitespace === -1;
    const dashPrefixMatch = lineText.match(/^(\s*-\s+)/);
    const fieldStart = dashPrefixMatch ? dashPrefixMatch[1].length : firstNonWhitespace;
    const rangeStartColumn = isEmptyLine ? position.column : fieldStart + 1;
    const colonIndex = lineText.indexOf(":");
    const suggestions = [];
    for (const fieldName of validFields) {
      if (existingFields.has(fieldName)) {
        continue;
      }
      const desc = HOOK_COMMAND_FIELD_DESCRIPTIONS[fieldName];
      const insertText = colonIndex !== -1 ? fieldName : `${fieldName}: $0`;
      suggestions.push({
        label: fieldName,
        documentation: desc,
        kind: 9,
        insertText,
        insertTextRules: 4,
        range: new Range(position.lineNumber, rangeStartColumn, position.lineNumber, colonIndex !== -1 ? colonIndex + 1 : model.getLineMaxColumn(position.lineNumber))
      });
    }
    return suggestions.length > 0 ? { suggestions } : void 0;
  }
  /**
   * Walks the hooks map AST to find the command map object containing the position.
   * Handles both direct command objects and nested matcher format.
   * Also handles trailing lines after the last parsed property of a command map.
   */
  findContainingCommandMap(model, position, hooksMap) {
    for (let i = 0; i < hooksMap.properties.length; i++) {
      const prop = hooksMap.properties[i];
      if (prop.value.type !== "sequence") {
        continue;
      }
      const seqRange = prop.value.range;
      const nextProp = hooksMap.properties[i + 1];
      const isInSeq = seqRange.containsPosition(position);
      const isTrailingSeq = !isInSeq && seqRange.endLineNumber < position.lineNumber && (!nextProp || nextProp.key.range.startLineNumber > position.lineNumber);
      if (isInSeq || isTrailingSeq) {
        if (isTrailingSeq) {
          const lineText = model.getLineContent(position.lineNumber);
          const firstNonWs = lineText.search(/\S/);
          const effectiveIndent = firstNonWs === -1 ? position.column - 1 : firstNonWs;
          const hookKeyIndent = prop.key.range.startColumn - 1;
          if (effectiveIndent <= hookKeyIndent) {
            continue;
          }
        }
        const result = this.findCommandMapInSequence(position, prop.value);
        if (result) {
          return result;
        }
      }
    }
    return void 0;
  }
  findCommandMapInSequence(position, sequence) {
    for (let i = 0; i < sequence.items.length; i++) {
      const item = sequence.items[i];
      if (item.type !== "map") {
        if (item.type === "scalar" && item.range.startLineNumber === position.lineNumber) {
          return { type: "map", properties: [], range: item.range };
        }
        continue;
      }
      const isInRange = item.range.containsPosition(position);
      const isTrailing = !isInRange && item.range.endLineNumber < position.lineNumber && (i + 1 >= sequence.items.length || sequence.items[i + 1].range.startLineNumber > position.lineNumber);
      if (!isInRange && !isTrailing) {
        continue;
      }
      const nestedHooks = item.properties.find((p) => p.key.value === "hooks");
      if (nestedHooks?.value.type === "sequence") {
        const result = this.findCommandMapInSequence(position, nestedHooks.value);
        if (result) {
          return result;
        }
      }
      return item;
    }
    return void 0;
  }
  getValueSuggestions(promptType, attribute, target) {
    const attributeDesc = getAttributeDefinition(attribute, promptType, target);
    if (attributeDesc?.enums) {
      return attributeDesc.enums;
    }
    if (attributeDesc?.defaults) {
      return attributeDesc.defaults.map((value) => ({ name: value }));
    }
    switch (attribute) {
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
      case PromptHeaderAttributes.model:
        if (promptType === PromptsType.prompt || promptType === PromptsType.agent) {
          return this.getModelNames(promptType === PromptsType.agent);
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
  __param(3, IChatModeService),
  __param(4, IWorkbenchEnvironmentService),
  __param(5, IConfigurationService)
], PromptHeaderAutocompletion);
export {
  PromptHeaderAutocompletion
};
//# sourceMappingURL=promptHeaderAutocompletion.js.map
