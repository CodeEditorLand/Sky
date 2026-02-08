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
import { match, splitGlobAware } from "../../../../../base/common/glob.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { Schemas } from "../../../../../base/common/network.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ChatRequestVariableSet, IChatRequestVariableEntry, isPromptFileVariableEntry, toPromptFileVariableEntry, toPromptTextVariableEntry, PromptFileVariableKind, toToolVariableEntry } from "../attachments/chatVariableEntries.js";
import { ILanguageModelToolsService, VSCodeToolReference } from "../tools/languageModelToolsService.js";
import { PromptsConfig } from "./config/config.js";
import { isPromptOrInstructionsFile } from "./config/promptFileLocations.js";
import { PromptsType } from "./promptTypes.js";
import { IPromptsService } from "./service/promptsService.js";
import { OffsetRange } from "../../../../../editor/common/core/ranges/offsetRange.js";
import { ChatConfiguration, ChatModeKind } from "../constants.js";
function newInstructionsCollectionEvent() {
  return { applyingInstructionsCount: 0, referencedInstructionsCount: 0, agentInstructionsCount: 0, listedInstructionsCount: 0, totalInstructionsCount: 0 };
}
__name(newInstructionsCollectionEvent, "newInstructionsCollectionEvent");
let ComputeAutomaticInstructions = class ComputeAutomaticInstructions2 {
  static {
    __name(this, "ComputeAutomaticInstructions");
  }
  constructor(_modeKind, _enabledTools, _enabledSubagents, _promptsService, _logService, _labelService, _configurationService, _workspaceService, _fileService, _telemetryService, _languageModelToolsService) {
    this._modeKind = _modeKind;
    this._enabledTools = _enabledTools;
    this._enabledSubagents = _enabledSubagents;
    this._promptsService = _promptsService;
    this._logService = _logService;
    this._labelService = _labelService;
    this._configurationService = _configurationService;
    this._workspaceService = _workspaceService;
    this._fileService = _fileService;
    this._telemetryService = _telemetryService;
    this._languageModelToolsService = _languageModelToolsService;
    this._parseResults = new ResourceMap();
  }
  async _parseInstructionsFile(uri, token) {
    if (this._parseResults.has(uri)) {
      return this._parseResults.get(uri);
    }
    try {
      const result = await this._promptsService.parseNew(uri, token);
      this._parseResults.set(uri, result);
      return result;
    } catch (error) {
      this._logService.error(`[InstructionsContextComputer] Failed to parse instruction file: ${uri}`, error);
      return void 0;
    }
  }
  async collect(variables, token) {
    const instructionFiles = await this._promptsService.listPromptFiles(PromptsType.instructions, token);
    this._logService.trace(`[InstructionsContextComputer] ${instructionFiles.length} instruction files available.`);
    const telemetryEvent = newInstructionsCollectionEvent();
    const context = this._getContext(variables);
    await this.addApplyingInstructions(instructionFiles, context, variables, telemetryEvent, token);
    await this._addReferencedInstructions(variables, telemetryEvent, token);
    await this._addAgentInstructions(variables, telemetryEvent, token);
    const instructionsListVariable = await this._getInstructionsWithPatternsList(instructionFiles, variables, token);
    if (instructionsListVariable) {
      variables.add(instructionsListVariable);
      telemetryEvent.listedInstructionsCount++;
    }
    this.sendTelemetry(telemetryEvent);
  }
  sendTelemetry(telemetryEvent) {
    telemetryEvent.totalInstructionsCount = telemetryEvent.agentInstructionsCount + telemetryEvent.referencedInstructionsCount + telemetryEvent.applyingInstructionsCount + telemetryEvent.listedInstructionsCount;
    this._telemetryService.publicLog2("instructionsCollected", telemetryEvent);
  }
  /** public for testing */
  async addApplyingInstructions(instructionFiles, context, variables, telemetryEvent, token) {
    const includeApplyingInstructions = this._configurationService.getValue(PromptsConfig.INCLUDE_APPLYING_INSTRUCTIONS);
    if (!includeApplyingInstructions && this._modeKind !== ChatModeKind.Edit) {
      this._logService.trace(`[InstructionsContextComputer] includeApplyingInstructions is disabled and agent kind is not Edit. No applying instructions will be added.`);
      return;
    }
    for (const { uri } of instructionFiles) {
      const parsedFile = await this._parseInstructionsFile(uri, token);
      if (!parsedFile) {
        this._logService.trace(`[InstructionsContextComputer] Unable to read: ${uri}`);
        continue;
      }
      const applyTo = parsedFile.header?.applyTo;
      if (!applyTo) {
        this._logService.trace(`[InstructionsContextComputer] No 'applyTo' found: ${uri}`);
        continue;
      }
      if (context.instructions.has(uri)) {
        this._logService.trace(`[InstructionsContextComputer] Skipping already processed instruction file: ${uri}`);
        continue;
      }
      const match2 = this._matches(context.files, applyTo);
      if (match2) {
        this._logService.trace(`[InstructionsContextComputer] Match for ${uri} with ${match2.pattern}${match2.file ? ` for file ${match2.file}` : ""}`);
        const reason = !match2.file ? localize("instruction.file.reason.allFiles", "Automatically attached as pattern is **") : localize("instruction.file.reason.specificFile", "Automatically attached as pattern {0} matches {1}", applyTo, this._labelService.getUriLabel(match2.file, { relative: true }));
        variables.add(toPromptFileVariableEntry(uri, PromptFileVariableKind.Instruction, reason, true));
        telemetryEvent.applyingInstructionsCount++;
      } else {
        this._logService.trace(`[InstructionsContextComputer] No match for ${uri} with ${applyTo}`);
      }
    }
  }
  _getContext(attachedContext) {
    const files = new ResourceSet();
    const instructions = new ResourceSet();
    for (const variable of attachedContext.asArray()) {
      if (isPromptFileVariableEntry(variable)) {
        instructions.add(variable.value);
      } else {
        const uri = IChatRequestVariableEntry.toUri(variable);
        if (uri) {
          files.add(uri);
        }
      }
    }
    return { files, instructions };
  }
  async _addAgentInstructions(variables, telemetryEvent, token) {
    const useCopilotInstructionsFiles = this._configurationService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES);
    const useAgentMd = this._configurationService.getValue(PromptsConfig.USE_AGENT_MD);
    if (!useCopilotInstructionsFiles && !useAgentMd) {
      this._logService.trace(`[InstructionsContextComputer] No agent instructions files added (settings disabled).`);
      return;
    }
    const entries = new ChatRequestVariableSet();
    if (useCopilotInstructionsFiles) {
      const files = await this._promptsService.listCopilotInstructionsMDs(token);
      for (const file of files) {
        entries.add(toPromptFileVariableEntry(file, PromptFileVariableKind.Instruction, localize("instruction.file.reason.copilot", "Automatically attached as setting {0} is enabled", PromptsConfig.USE_COPILOT_INSTRUCTION_FILES), true));
        telemetryEvent.agentInstructionsCount++;
        this._logService.trace(`[InstructionsContextComputer] copilot-instruction.md files added: ${file.toString()}`);
      }
      await this._addReferencedInstructions(entries, telemetryEvent, token);
    }
    if (useAgentMd) {
      const files = await this._promptsService.listAgentMDs(token, false);
      for (const file of files) {
        entries.add(toPromptFileVariableEntry(file, PromptFileVariableKind.Instruction, localize("instruction.file.reason.agentsmd", "Automatically attached as setting {0} is enabled", PromptsConfig.USE_AGENT_MD), true));
        telemetryEvent.agentInstructionsCount++;
        this._logService.trace(`[InstructionsContextComputer] AGENTS.md files added: ${file.toString()}`);
      }
    }
    for (const entry of entries.asArray()) {
      variables.add(entry);
    }
  }
  _matches(files, applyToPattern) {
    const patterns = splitGlobAware(applyToPattern, ",");
    const patterMatches = /* @__PURE__ */ __name((pattern) => {
      pattern = pattern.trim();
      if (pattern.length === 0) {
        return void 0;
      }
      if (pattern === "**" || pattern === "**/*" || pattern === "*") {
        return { pattern };
      }
      if (!pattern.startsWith("/") && !pattern.startsWith("**/")) {
        pattern = "**/" + pattern;
      }
      for (const file of files) {
        if (match(pattern, file.path, { ignoreCase: true })) {
          return { pattern, file };
        }
      }
      return void 0;
    }, "patterMatches");
    for (const pattern of patterns) {
      const matchResult = patterMatches(pattern);
      if (matchResult) {
        return matchResult;
      }
    }
    return void 0;
  }
  _getTool(referenceName) {
    if (!this._enabledTools) {
      return void 0;
    }
    const tool = this._languageModelToolsService.getToolByName(referenceName);
    if (tool && this._enabledTools[tool.id]) {
      return { tool, variable: `#tool:${this._languageModelToolsService.getFullReferenceName(tool)}` };
    }
    return void 0;
  }
  async _getInstructionsWithPatternsList(instructionFiles, _existingVariables, token) {
    const readTool = this._getTool("readFile");
    const runSubagentTool = this._getTool(VSCodeToolReference.runSubagent);
    const entries = [];
    if (readTool) {
      const searchNestedAgentMd = this._configurationService.getValue(PromptsConfig.USE_NESTED_AGENT_MD);
      const agentsMdPromise = searchNestedAgentMd ? this._promptsService.findAgentMDsInWorkspace(token) : Promise.resolve([]);
      entries.push("<instructions>");
      entries.push("Here is a list of instruction files that contain rules for working with this codebase.");
      entries.push("These files are important for understanding the codebase structure, conventions, and best practices.");
      entries.push("Please make sure to follow the rules specified in these files when working with the codebase.");
      entries.push(`If the file is not already available as attachment, use the ${readTool.variable} tool to acquire it.`);
      entries.push("Make sure to acquire the instructions before working with the codebase.");
      let hasContent = false;
      for (const { uri } of instructionFiles) {
        const parsedFile = await this._parseInstructionsFile(uri, token);
        if (parsedFile) {
          entries.push("<instruction>");
          if (parsedFile.header) {
            const { description, applyTo } = parsedFile.header;
            if (description) {
              entries.push(`<description>${description}</description>`);
            }
            entries.push(`<file>${getFilePath(uri)}</file>`);
            if (applyTo) {
              entries.push(`<applyTo>${applyTo}</applyTo>`);
            }
          } else {
            entries.push(`<file>${getFilePath(uri)}</file>`);
          }
          entries.push("</instruction>");
          hasContent = true;
        }
      }
      const agentsMdFiles = await agentsMdPromise;
      for (const uri of agentsMdFiles) {
        const folderName = this._labelService.getUriLabel(dirname(uri), { relative: true });
        const description = folderName.trim().length === 0 ? localize("instruction.file.description.agentsmd.root", "Instructions for the workspace") : localize("instruction.file.description.agentsmd.folder", "Instructions for folder '{0}'", folderName);
        entries.push("<instruction>");
        entries.push(`<description>${description}</description>`);
        entries.push(`<file>${getFilePath(uri)}</file>`);
        entries.push("</instruction>");
        hasContent = true;
      }
      if (!hasContent) {
        entries.length = 0;
      } else {
        entries.push("</instructions>", "", "");
      }
      const agentSkills = await this._promptsService.findAgentSkills(token);
      if (agentSkills && agentSkills.length > 0) {
        const useSkillAdherencePrompt = this._configurationService.getValue(PromptsConfig.USE_SKILL_ADHERENCE_PROMPT);
        entries.push("<skills>");
        if (useSkillAdherencePrompt) {
          entries.push("Skills provide specialized capabilities, domain knowledge, and refined workflows for producing high-quality outputs. Each skill folder contains tested instructions for specific domains like testing strategies, API design, or performance optimization. Multiple skills can be combined when a task spans different domains.");
          entries.push(`BLOCKING REQUIREMENT: When a skill applies to the user's request, you MUST load and read the SKILL.md file IMMEDIATELY as your first action, BEFORE generating any other response or taking action on the task. Use ${readTool.variable} to load the relevant skill(s).`);
          entries.push("NEVER just mention or reference a skill in your response without actually reading it first. If a skill is relevant, load it before proceeding.");
          entries.push("How to determine if a skill applies:");
          entries.push("1. Review the available skills below and match their descriptions against the user's request");
          entries.push("2. If any skill's domain overlaps with the task, load that skill immediately");
          entries.push("3. When multiple skills apply (e.g., a flowchart in documentation), load all relevant skills");
          entries.push("Examples:");
          entries.push(`- "Help me write unit tests for this module" -> Load the testing skill via ${readTool.variable} FIRST, then proceed`);
          entries.push(`- "Optimize this slow function" -> Load the performance-profiling skill via ${readTool.variable} FIRST, then proceed`);
          entries.push(`- "Add a discount code field to checkout" -> Load both the checkout-flow and form-validation skills FIRST`);
          entries.push("Available skills:");
        } else {
          entries.push("Here is a list of skills that contain domain specific knowledge on a variety of topics.");
          entries.push("Each skill comes with a description of the topic and a file path that contains the detailed instructions.");
          entries.push(`When a user asks you to perform a task that falls within the domain of a skill, use the ${readTool.variable} tool to acquire the full instructions from the file URI.`);
        }
        for (const skill of agentSkills) {
          entries.push("<skill>");
          entries.push(`<name>${skill.name}</name>`);
          if (skill.description) {
            entries.push(`<description>${skill.description}</description>`);
          }
          entries.push(`<file>${getFilePath(skill.uri)}</file>`);
          entries.push("</skill>");
        }
        entries.push("</skills>", "", "");
      }
    }
    if (runSubagentTool && this._configurationService.getValue(ChatConfiguration.SubagentToolCustomAgents)) {
      const canUseAgent = (() => {
        if (!this._enabledSubagents || this._enabledSubagents.includes("*")) {
          return (agent) => agent.visibility.agentInvokable;
        } else {
          const subagents = this._enabledSubagents;
          return (agent) => subagents.includes(agent.name);
        }
      })();
      const agents = await this._promptsService.getCustomAgents(token);
      if (agents.length > 0) {
        entries.push("<agents>");
        entries.push("Here is a list of agents that can be used when running a subagent.");
        entries.push("Each agent has optionally a description with the agent's purpose and expertise. When asked to run a subagent, choose the most appropriate agent from this list.");
        entries.push(`Use the ${runSubagentTool.variable} tool with the agent name to run the subagent.`);
        for (const agent of agents) {
          if (canUseAgent(agent)) {
            entries.push("<agent>");
            entries.push(`<name>${agent.name}</name>`);
            if (agent.description) {
              entries.push(`<description>${agent.description}</description>`);
            }
            if (agent.argumentHint) {
              entries.push(`<argumentHint>${agent.argumentHint}</argumentHint>`);
            }
            entries.push("</agent>");
          }
        }
        entries.push("</agents>", "", "");
      }
    }
    if (entries.length === 0) {
      return void 0;
    }
    const content = entries.join("\n");
    const toolReferences = [];
    const collectToolReference = /* @__PURE__ */ __name((tool) => {
      if (tool) {
        let offset = content.indexOf(tool.variable);
        while (offset >= 0) {
          toolReferences.push(toToolVariableEntry(tool.tool, new OffsetRange(offset, offset + tool.variable.length)));
          offset = content.indexOf(tool.variable, offset + 1);
        }
      }
    }, "collectToolReference");
    collectToolReference(readTool);
    collectToolReference(runSubagentTool);
    return toPromptTextVariableEntry(content, true, toolReferences);
  }
  async _addReferencedInstructions(attachedContext, telemetryEvent, token) {
    const includeReferencedInstructions = this._configurationService.getValue(PromptsConfig.INCLUDE_REFERENCED_INSTRUCTIONS);
    if (!includeReferencedInstructions && this._modeKind !== ChatModeKind.Edit) {
      this._logService.trace(`[InstructionsContextComputer] includeReferencedInstructions is disabled and agent kind is not Edit. No referenced instructions will be added.`);
      return;
    }
    const seen = new ResourceSet();
    const todo = [];
    for (const variable of attachedContext.asArray()) {
      if (isPromptFileVariableEntry(variable)) {
        if (!seen.has(variable.value)) {
          todo.push(variable.value);
          seen.add(variable.value);
        }
      }
    }
    let next = todo.pop();
    while (next) {
      const result = await this._parseInstructionsFile(next, token);
      if (result && result.body) {
        const refsToCheck = [];
        for (const ref of result.body.fileReferences) {
          const url = result.body.resolveFilePath(ref.content);
          if (url && !seen.has(url) && (isPromptOrInstructionsFile(url) || this._workspaceService.getWorkspaceFolder(url) !== void 0)) {
            refsToCheck.push({ resource: url });
            seen.add(url);
          }
        }
        if (refsToCheck.length > 0) {
          const stats = await this._fileService.resolveAll(refsToCheck);
          for (let i = 0; i < stats.length; i++) {
            const stat = stats[i];
            const uri = refsToCheck[i].resource;
            if (stat.success && stat.stat?.isFile) {
              if (isPromptOrInstructionsFile(uri)) {
                todo.push(uri);
              }
              const reason = localize("instruction.file.reason.referenced", "Referenced by {0}", basename(next));
              attachedContext.add(toPromptFileVariableEntry(uri, PromptFileVariableKind.InstructionReference, reason, true));
              telemetryEvent.referencedInstructionsCount++;
              this._logService.trace(`[InstructionsContextComputer] ${uri.toString()} added, referenced by ${next.toString()}`);
            }
          }
        }
      }
      next = todo.pop();
    }
  }
};
ComputeAutomaticInstructions = __decorate([
  __param(3, IPromptsService),
  __param(4, ILogService),
  __param(5, ILabelService),
  __param(6, IConfigurationService),
  __param(7, IWorkspaceContextService),
  __param(8, IFileService),
  __param(9, ITelemetryService),
  __param(10, ILanguageModelToolsService)
], ComputeAutomaticInstructions);
function getFilePath(uri) {
  if (uri.scheme === Schemas.file || uri.scheme === Schemas.vscodeRemote) {
    return uri.fsPath;
  }
  return uri.toString();
}
__name(getFilePath, "getFilePath");
export {
  ComputeAutomaticInstructions,
  newInstructionsCollectionEvent
};
//# sourceMappingURL=computeAutomaticInstructions.js.map
