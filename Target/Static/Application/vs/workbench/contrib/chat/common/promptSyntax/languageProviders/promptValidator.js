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
import { isEmptyPattern, parse, splitGlobAware } from "../../../../../../base/common/glob.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { localize } from "../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IMarkerService, MarkerSeverity } from "../../../../../../platform/markers/common/markers.js";
import { ChatMode, IChatModeService } from "../../chatModes.js";
import { ChatModeKind } from "../../constants.js";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "../../languageModels.js";
import { ILanguageModelToolsService, SpecedToolAliases } from "../../tools/languageModelToolsService.js";
import { getPromptsTypeForLanguageId, PromptsType } from "../promptTypes.js";
import { GithubPromptHeaderAttributes, PromptHeaderAttributes, Target } from "../promptFileParser.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { Delayer } from "../../../../../../base/common/async.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { IPromptsService } from "../service/promptsService.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { AGENTS_SOURCE_FOLDER, LEGACY_MODE_FILE_EXTENSION } from "../config/promptFileLocations.js";
import { Lazy } from "../../../../../../base/common/lazy.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
const MARKERS_OWNER_ID = "prompts-diagnostics-provider";
let PromptValidator = class PromptValidator2 {
  static {
    __name(this, "PromptValidator");
  }
  constructor(languageModelsService, languageModelToolsService, chatModeService, fileService, labelService, promptsService) {
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this.fileService = fileService;
    this.labelService = labelService;
    this.promptsService = promptsService;
  }
  async validate(promptAST, promptType, report) {
    promptAST.header?.errors.forEach((error) => report(toMarker(error.message, error.range, MarkerSeverity.Error)));
    await this.validateHeader(promptAST, promptType, report);
    await this.validateBody(promptAST, promptType, report);
    await this.validateFileName(promptAST, promptType, report);
    await this.validateSkillFolderName(promptAST, promptType, report);
  }
  async validateFileName(promptAST, promptType, report) {
    if (promptType === PromptsType.agent && promptAST.uri.path.endsWith(LEGACY_MODE_FILE_EXTENSION)) {
      const location = this.promptsService.getAgentFileURIFromModeFile(promptAST.uri);
      if (location && await this.fileService.canCreateFile(location)) {
        report(toMarker(localize("promptValidator.chatModesRenamedToAgents", "Chat modes have been renamed to agents. Please move this file to {0}", location.toString()), new Range(1, 1, 1, 4), MarkerSeverity.Warning));
      } else {
        report(toMarker(localize("promptValidator.chatModesRenamedToAgentsNoMove", "Chat modes have been renamed to agents. Please move the file to {0}", AGENTS_SOURCE_FOLDER), new Range(1, 1, 1, 4), MarkerSeverity.Warning));
      }
    }
  }
  async validateSkillFolderName(promptAST, promptType, report) {
    if (promptType !== PromptsType.skill) {
      return;
    }
    const nameAttribute = promptAST.header?.attributes.find((attr) => attr.key === PromptHeaderAttributes.name);
    if (!nameAttribute || nameAttribute.value.type !== "string") {
      return;
    }
    const skillName = nameAttribute.value.value.trim();
    if (!skillName) {
      return;
    }
    const pathParts = promptAST.uri.path.split("/");
    const skillIndex = pathParts.findIndex((part) => part === "SKILL.md");
    if (skillIndex > 0) {
      const folderName = pathParts[skillIndex - 1];
      if (folderName && skillName !== folderName) {
        report(toMarker(localize("promptValidator.skillNameFolderMismatch", "The skill name '{0}' should match the folder name '{1}'.", skillName, folderName), nameAttribute.value.range, MarkerSeverity.Warning));
      }
    }
  }
  async validateBody(promptAST, promptType, report) {
    const body = promptAST.body;
    if (!body) {
      return;
    }
    const fileReferenceChecks = [];
    for (const ref of body.fileReferences) {
      const resolved = body.resolveFilePath(ref.content);
      if (!resolved) {
        report(toMarker(localize("promptValidator.invalidFileReference", "Invalid file reference '{0}'.", ref.content), ref.range, MarkerSeverity.Warning));
        continue;
      }
      if (promptAST.uri.scheme === resolved.scheme) {
        fileReferenceChecks.push((async () => {
          try {
            const exists = await this.fileService.exists(resolved);
            if (exists) {
              return;
            }
          } catch {
          }
          const loc = this.labelService.getUriLabel(resolved);
          report(toMarker(localize("promptValidator.fileNotFound", "File '{0}' not found at '{1}'.", ref.content, loc), ref.range, MarkerSeverity.Warning));
        })());
      }
    }
    const isGitHubTarget = isGithubTarget(promptType, promptAST.header?.target);
    if (body.variableReferences.length && !isGitHubTarget) {
      const headerTools = promptAST.header?.tools;
      const headerTarget = promptAST.header?.target;
      const headerToolsMap = headerTools ? this.languageModelToolsService.toToolAndToolSetEnablementMap(headerTools, headerTarget, void 0) : void 0;
      const available = new Set(this.languageModelToolsService.getFullReferenceNames());
      const deprecatedNames = this.languageModelToolsService.getDeprecatedFullReferenceNames();
      for (const variable of body.variableReferences) {
        if (!available.has(variable.name)) {
          if (deprecatedNames.has(variable.name)) {
            const currentNames = deprecatedNames.get(variable.name);
            if (currentNames && currentNames.size > 0) {
              if (currentNames.size === 1) {
                const newName = Array.from(currentNames)[0];
                report(toMarker(localize("promptValidator.deprecatedVariableReference", "Tool or toolset '{0}' has been renamed, use '{1}' instead.", variable.name, newName), variable.range, MarkerSeverity.Info));
              } else {
                const newNames = Array.from(currentNames).sort((a, b) => a.localeCompare(b)).join(", ");
                report(toMarker(localize("promptValidator.deprecatedVariableReferenceMultipleNames", "Tool or toolset '{0}' has been renamed, use the following tools instead: {1}", variable.name, newNames), variable.range, MarkerSeverity.Info));
              }
            }
          } else {
            report(toMarker(localize("promptValidator.unknownVariableReference", "Unknown tool or toolset '{0}'.", variable.name), variable.range, MarkerSeverity.Warning));
          }
        } else if (headerToolsMap) {
          const tool = this.languageModelToolsService.getToolByFullReferenceName(variable.name);
          if (tool && headerToolsMap.get(tool) === false) {
            report(toMarker(localize("promptValidator.disabledTool", "Tool or toolset '{0}' also needs to be enabled in the header.", variable.name), variable.range, MarkerSeverity.Warning));
          }
        }
      }
    }
    await Promise.all(fileReferenceChecks);
  }
  async validateHeader(promptAST, promptType, report) {
    const header = promptAST.header;
    if (!header) {
      return;
    }
    const attributes = header.attributes;
    const isGitHubTarget = isGithubTarget(promptType, header.target);
    this.checkForInvalidArguments(attributes, promptType, isGitHubTarget, report);
    this.validateName(attributes, isGitHubTarget, report);
    this.validateDescription(attributes, report);
    this.validateArgumentHint(attributes, report);
    switch (promptType) {
      case PromptsType.prompt: {
        const agent = this.validateAgent(attributes, report);
        this.validateTools(attributes, agent?.kind ?? ChatModeKind.Agent, header.target, report);
        this.validateModel(attributes, agent?.kind ?? ChatModeKind.Agent, report);
        break;
      }
      case PromptsType.instructions:
        this.validateApplyTo(attributes, report);
        this.validateExcludeAgent(attributes, report);
        break;
      case PromptsType.agent: {
        this.validateTarget(attributes, report);
        this.validateInfer(attributes, report);
        this.validateUserInvokable(attributes, report);
        this.validateDisableModelInvocation(attributes, report);
        this.validateTools(attributes, ChatModeKind.Agent, header.target, report);
        if (!isGitHubTarget) {
          this.validateModel(attributes, ChatModeKind.Agent, report);
          this.validateHandoffs(attributes, report);
          await this.validateAgentsAttribute(attributes, header, report);
        }
        break;
      }
      case PromptsType.skill:
        break;
    }
  }
  checkForInvalidArguments(attributes, promptType, isGitHubTarget, report) {
    const validAttributeNames = getValidAttributeNames(promptType, true, isGitHubTarget);
    const validGithubCopilotAttributeNames = new Lazy(() => new Set(getValidAttributeNames(promptType, false, true)));
    for (const attribute of attributes) {
      if (!validAttributeNames.includes(attribute.key)) {
        const supportedNames = new Lazy(() => getValidAttributeNames(promptType, false, isGitHubTarget).sort().join(", "));
        switch (promptType) {
          case PromptsType.prompt:
            report(toMarker(localize("promptValidator.unknownAttribute.prompt", "Attribute '{0}' is not supported in prompt files. Supported: {1}.", attribute.key, supportedNames.value), attribute.range, MarkerSeverity.Warning));
            break;
          case PromptsType.agent:
            if (isGitHubTarget) {
              report(toMarker(localize("promptValidator.unknownAttribute.github-agent", "Attribute '{0}' is not supported in custom GitHub Copilot agent files. Supported: {1}.", attribute.key, supportedNames.value), attribute.range, MarkerSeverity.Warning));
            } else {
              if (validGithubCopilotAttributeNames.value.has(attribute.key)) {
                report(toMarker(localize("promptValidator.ignoredAttribute.vscode-agent", "Attribute '{0}' is ignored when running locally in VS Code.", attribute.key), attribute.range, MarkerSeverity.Info));
              } else {
                report(toMarker(localize("promptValidator.unknownAttribute.vscode-agent", "Attribute '{0}' is not supported in VS Code agent files. Supported: {1}.", attribute.key, supportedNames.value), attribute.range, MarkerSeverity.Warning));
              }
            }
            break;
          case PromptsType.instructions:
            report(toMarker(localize("promptValidator.unknownAttribute.instructions", "Attribute '{0}' is not supported in instructions files. Supported: {1}.", attribute.key, supportedNames.value), attribute.range, MarkerSeverity.Warning));
            break;
          case PromptsType.skill:
            report(toMarker(localize("promptValidator.unknownAttribute.skill", "Attribute '{0}' is not supported in skill files. Supported: {1}.", attribute.key, supportedNames.value), attribute.range, MarkerSeverity.Warning));
            break;
        }
      }
    }
  }
  validateName(attributes, isGitHubTarget, report) {
    const nameAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.name);
    if (!nameAttribute) {
      return;
    }
    if (nameAttribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.nameMustBeString", "The 'name' attribute must be a string."), nameAttribute.range, MarkerSeverity.Error));
      return;
    }
    if (nameAttribute.value.value.trim().length === 0) {
      report(toMarker(localize("promptValidator.nameShouldNotBeEmpty", "The 'name' attribute must not be empty."), nameAttribute.value.range, MarkerSeverity.Error));
      return;
    }
  }
  validateDescription(attributes, report) {
    const descriptionAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.description);
    if (!descriptionAttribute) {
      return;
    }
    if (descriptionAttribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.descriptionMustBeString", "The 'description' attribute must be a string."), descriptionAttribute.range, MarkerSeverity.Error));
      return;
    }
    if (descriptionAttribute.value.value.trim().length === 0) {
      report(toMarker(localize("promptValidator.descriptionShouldNotBeEmpty", "The 'description' attribute should not be empty."), descriptionAttribute.value.range, MarkerSeverity.Error));
      return;
    }
  }
  validateArgumentHint(attributes, report) {
    const argumentHintAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.argumentHint);
    if (!argumentHintAttribute) {
      return;
    }
    if (argumentHintAttribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.argumentHintMustBeString", "The 'argument-hint' attribute must be a string."), argumentHintAttribute.range, MarkerSeverity.Error));
      return;
    }
    if (argumentHintAttribute.value.value.trim().length === 0) {
      report(toMarker(localize("promptValidator.argumentHintShouldNotBeEmpty", "The 'argument-hint' attribute should not be empty."), argumentHintAttribute.value.range, MarkerSeverity.Error));
      return;
    }
  }
  validateModel(attributes, agentKind, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.model);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "string" && attribute.value.type !== "array") {
      report(toMarker(localize("promptValidator.modelMustBeStringOrArray", "The 'model' attribute must be a string or an array of strings."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
    const modelNames = [];
    if (attribute.value.type === "string") {
      const modelName = attribute.value.value.trim();
      if (modelName.length === 0) {
        report(toMarker(localize("promptValidator.modelMustBeNonEmpty", "The 'model' attribute must be a non-empty string."), attribute.value.range, MarkerSeverity.Error));
        return;
      }
      modelNames.push([modelName, attribute.value.range]);
    } else if (attribute.value.type === "array") {
      if (attribute.value.items.length === 0) {
        report(toMarker(localize("promptValidator.modelArrayMustNotBeEmpty", "The 'model' array must not be empty."), attribute.value.range, MarkerSeverity.Error));
        return;
      }
      for (const item of attribute.value.items) {
        if (item.type !== "string") {
          report(toMarker(localize("promptValidator.modelArrayMustContainStrings", "The 'model' array must contain only strings."), item.range, MarkerSeverity.Error));
          return;
        }
        const modelName = item.value.trim();
        if (modelName.length === 0) {
          report(toMarker(localize("promptValidator.modelArrayItemMustBeNonEmpty", "Model names in the array must be non-empty strings."), item.range, MarkerSeverity.Error));
          return;
        }
        modelNames.push([modelName, item.range]);
      }
    }
    const languageModels = this.languageModelsService.getLanguageModelIds();
    if (languageModels.length === 0) {
      return;
    }
    for (const [modelName, range] of modelNames) {
      const modelMetadata = this.findModelByName(modelName);
      if (!modelMetadata) {
        report(toMarker(localize("promptValidator.modelNotFound", "Unknown model '{0}'.", modelName), range, MarkerSeverity.Warning));
      } else if (agentKind === ChatModeKind.Agent && !ILanguageModelChatMetadata.suitableForAgentMode(modelMetadata)) {
        report(toMarker(localize("promptValidator.modelNotSuited", "Model '{0}' is not suited for agent mode.", modelName), range, MarkerSeverity.Warning));
      }
    }
  }
  findModelByName(modelName) {
    const metadataAndId = this.languageModelsService.lookupLanguageModelByQualifiedName(modelName);
    if (metadataAndId && metadataAndId.metadata.isUserSelectable !== false) {
      return metadataAndId.metadata;
    }
    return void 0;
  }
  validateAgent(attributes, report) {
    const agentAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.agent);
    const modeAttribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.mode);
    if (modeAttribute) {
      if (agentAttribute) {
        report(toMarker(localize("promptValidator.modeDeprecated", "The 'mode' attribute has been deprecated. The 'agent' attribute is used instead."), modeAttribute.range, MarkerSeverity.Warning));
      } else {
        report(toMarker(localize("promptValidator.modeDeprecated.useAgent", "The 'mode' attribute has been deprecated. Please rename it to 'agent'."), modeAttribute.range, MarkerSeverity.Error));
      }
    }
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.agent) ?? modeAttribute;
    if (!attribute) {
      return void 0;
    }
    if (attribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.attributeMustBeString", "The '{0}' attribute must be a string.", attribute.key), attribute.value.range, MarkerSeverity.Error));
      return void 0;
    }
    const agentValue = attribute.value.value;
    if (agentValue.trim().length === 0) {
      report(toMarker(localize("promptValidator.attributeMustBeNonEmpty", "The '{0}' attribute must be a non-empty string.", attribute.key), attribute.value.range, MarkerSeverity.Error));
      return void 0;
    }
    return this.validateAgentValue(attribute.value, report);
  }
  validateAgentValue(value, report) {
    const agents = this.chatModeService.getModes();
    const availableAgents = [];
    for (const agent of Iterable.concat(agents.builtin, agents.custom)) {
      if (agent.name.get() === value.value) {
        return agent;
      }
      availableAgents.push(agent.name.get());
    }
    const errorMessage = localize("promptValidator.agentNotFound", "Unknown agent '{0}'. Available agents: {1}.", value.value, availableAgents.join(", "));
    report(toMarker(errorMessage, value.range, MarkerSeverity.Warning));
    return void 0;
  }
  validateTools(attributes, agentKind, target, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.tools);
    if (!attribute) {
      return;
    }
    if (agentKind !== ChatModeKind.Agent) {
      report(toMarker(localize("promptValidator.toolsOnlyInAgent", "The 'tools' attribute is only supported when using agents. Attribute will be ignored."), attribute.range, MarkerSeverity.Warning));
    }
    switch (attribute.value.type) {
      case "array":
        if (target === Target.GitHubCopilot) {
        } else {
          this.validateVSCodeTools(attribute.value, target, report);
        }
        break;
      default:
        report(toMarker(localize("promptValidator.toolsMustBeArrayOrMap", "The 'tools' attribute must be an array."), attribute.value.range, MarkerSeverity.Error));
    }
  }
  validateVSCodeTools(valueItem, target, report) {
    if (valueItem.items.length > 0) {
      const available = new Set(this.languageModelToolsService.getFullReferenceNames());
      const deprecatedNames = this.languageModelToolsService.getDeprecatedFullReferenceNames();
      for (const item of valueItem.items) {
        if (item.type !== "string") {
          report(toMarker(localize("promptValidator.eachToolMustBeString", "Each tool name in the 'tools' attribute must be a string."), item.range, MarkerSeverity.Error));
        } else if (item.value) {
          if (!available.has(item.value)) {
            const currentNames = deprecatedNames.get(item.value);
            if (currentNames) {
              if (currentNames?.size === 1) {
                const newName = Array.from(currentNames)[0];
                report(toMarker(localize("promptValidator.toolDeprecated", "Tool or toolset '{0}' has been renamed, use '{1}' instead.", item.value, newName), item.range, MarkerSeverity.Info));
              } else {
                const newNames = Array.from(currentNames).sort((a, b) => a.localeCompare(b)).join(", ");
                report(toMarker(localize("promptValidator.toolDeprecatedMultipleNames", "Tool or toolset '{0}' has been renamed, use the following tools instead: {1}", item.value, newNames), item.range, MarkerSeverity.Info));
              }
            } else {
              report(toMarker(localize("promptValidator.toolNotFound", "Unknown tool '{0}'.", item.value), item.range, MarkerSeverity.Warning));
            }
          }
        }
      }
    }
  }
  validateApplyTo(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.applyTo);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.applyToMustBeString", "The 'applyTo' attribute must be a string."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
    const pattern = attribute.value.value;
    try {
      const patterns = splitGlobAware(pattern, ",");
      if (patterns.length === 0) {
        report(toMarker(localize("promptValidator.applyToMustBeValidGlob", "The 'applyTo' attribute must be a valid glob pattern."), attribute.value.range, MarkerSeverity.Error));
        return;
      }
      for (const pattern2 of patterns) {
        const globPattern = parse(pattern2);
        if (isEmptyPattern(globPattern)) {
          report(toMarker(localize("promptValidator.applyToMustBeValidGlob", "The 'applyTo' attribute must be a valid glob pattern."), attribute.value.range, MarkerSeverity.Error));
          return;
        }
      }
    } catch (_error) {
      report(toMarker(localize("promptValidator.applyToMustBeValidGlob", "The 'applyTo' attribute must be a valid glob pattern."), attribute.value.range, MarkerSeverity.Error));
    }
  }
  validateExcludeAgent(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.excludeAgent);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "array" && attribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.excludeAgentMustBeArray", "The 'excludeAgent' attribute must be an string or array."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
  }
  validateHandoffs(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.handOffs);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "array") {
      report(toMarker(localize("promptValidator.handoffsMustBeArray", "The 'handoffs' attribute must be an array."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
    for (const item of attribute.value.items) {
      if (item.type !== "object") {
        report(toMarker(localize("promptValidator.eachHandoffMustBeObject", "Each handoff in the 'handoffs' attribute must be an object with 'label', 'agent', 'prompt' and optional 'send'."), item.range, MarkerSeverity.Error));
        continue;
      }
      const required = /* @__PURE__ */ new Set(["label", "agent", "prompt"]);
      for (const prop of item.properties) {
        switch (prop.key.value) {
          case "label":
            if (prop.value.type !== "string" || prop.value.value.trim().length === 0) {
              report(toMarker(localize("promptValidator.handoffLabelMustBeNonEmptyString", "The 'label' property in a handoff must be a non-empty string."), prop.value.range, MarkerSeverity.Error));
            }
            break;
          case "agent":
            if (prop.value.type !== "string" || prop.value.value.trim().length === 0) {
              report(toMarker(localize("promptValidator.handoffAgentMustBeNonEmptyString", "The 'agent' property in a handoff must be a non-empty string."), prop.value.range, MarkerSeverity.Error));
            } else {
              this.validateAgentValue(prop.value, report);
            }
            break;
          case "prompt":
            if (prop.value.type !== "string") {
              report(toMarker(localize("promptValidator.handoffPromptMustBeString", "The 'prompt' property in a handoff must be a string."), prop.value.range, MarkerSeverity.Error));
            }
            break;
          case "send":
            if (prop.value.type !== "boolean") {
              report(toMarker(localize("promptValidator.handoffSendMustBeBoolean", "The 'send' property in a handoff must be a boolean."), prop.value.range, MarkerSeverity.Error));
            }
            break;
          case "showContinueOn":
            if (prop.value.type !== "boolean") {
              report(toMarker(localize("promptValidator.handoffShowContinueOnMustBeBoolean", "The 'showContinueOn' property in a handoff must be a boolean."), prop.value.range, MarkerSeverity.Error));
            }
            break;
          case "model":
            if (prop.value.type !== "string") {
              report(toMarker(localize("promptValidator.handoffModelMustBeString", "The 'model' property in a handoff must be a string."), prop.value.range, MarkerSeverity.Error));
            }
            break;
          default:
            report(toMarker(localize("promptValidator.unknownHandoffProperty", "Unknown property '{0}' in handoff object. Supported properties are 'label', 'agent', 'prompt' and optional 'send', 'showContinueOn', 'model'.", prop.key.value), prop.value.range, MarkerSeverity.Warning));
        }
        required.delete(prop.key.value);
      }
      if (required.size > 0) {
        report(toMarker(localize("promptValidator.missingHandoffProperties", "Missing required properties {0} in handoff object.", Array.from(required).map((s) => `'${s}'`).join(", ")), item.range, MarkerSeverity.Error));
      }
    }
  }
  validateInfer(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.infer);
    if (!attribute) {
      return;
    }
    report(toMarker(localize("promptValidator.inferDeprecated", "The 'infer' attribute is deprecated in favour of 'user-invokable' and 'disable-model-invocation'."), attribute.value.range, MarkerSeverity.Error));
  }
  validateTarget(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.target);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "string") {
      report(toMarker(localize("promptValidator.targetMustBeString", "The 'target' attribute must be a string."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
    const targetValue = attribute.value.value.trim();
    if (targetValue.length === 0) {
      report(toMarker(localize("promptValidator.targetMustBeNonEmpty", "The 'target' attribute must be a non-empty string."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
    const validTargets = ["github-copilot", "vscode"];
    if (!validTargets.includes(targetValue)) {
      report(toMarker(localize("promptValidator.targetInvalidValue", "The 'target' attribute must be one of: {0}.", validTargets.join(", ")), attribute.value.range, MarkerSeverity.Error));
    }
  }
  validateUserInvokable(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.userInvokable);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "boolean") {
      report(toMarker(localize("promptValidator.userInvokableMustBeBoolean", "The 'user-invokable' attribute must be a boolean."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
  }
  validateDisableModelInvocation(attributes, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.disableModelInvocation);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "boolean") {
      report(toMarker(localize("promptValidator.disableModelInvocationMustBeBoolean", "The 'disable-model-invocation' attribute must be a boolean."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
  }
  async validateAgentsAttribute(attributes, header, report) {
    const attribute = attributes.find((attr) => attr.key === PromptHeaderAttributes.agents);
    if (!attribute) {
      return;
    }
    if (attribute.value.type !== "array") {
      report(toMarker(localize("promptValidator.agentsMustBeArray", "The 'agents' attribute must be an array."), attribute.value.range, MarkerSeverity.Error));
      return;
    }
    const agents = await this.promptsService.getCustomAgents(CancellationToken.None);
    const availableAgentNames = new Set(agents.map((agent) => agent.name));
    availableAgentNames.add(ChatMode.Agent.name.get());
    const agentNames = [];
    for (const item of attribute.value.items) {
      if (item.type !== "string") {
        report(toMarker(localize("promptValidator.eachAgentMustBeString", "Each agent name in the 'agents' attribute must be a string."), item.range, MarkerSeverity.Error));
      } else if (item.value) {
        agentNames.push(item.value);
        if (item.value !== "*" && !availableAgentNames.has(item.value)) {
          report(toMarker(localize("promptValidator.agentInAgentsNotFound", "Unknown agent '{0}'. Available agents: {1}.", item.value, Array.from(availableAgentNames).join(", ")), item.range, MarkerSeverity.Warning));
        }
      }
    }
    if (agentNames.length > 0) {
      const tools = header.tools;
      if (tools && !tools.includes(SpecedToolAliases.agent)) {
        report(toMarker(localize("promptValidator.agentsRequiresAgentTool", "When 'agents' and 'tools' are specified, the 'agent' tool must be included in the 'tools' attribute."), attribute.value.range, MarkerSeverity.Warning));
      }
    }
  }
};
PromptValidator = __decorate([
  __param(0, ILanguageModelsService),
  __param(1, ILanguageModelToolsService),
  __param(2, IChatModeService),
  __param(3, IFileService),
  __param(4, ILabelService),
  __param(5, IPromptsService)
], PromptValidator);
const allAttributeNames = {
  [PromptsType.prompt]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.model, PromptHeaderAttributes.tools, PromptHeaderAttributes.mode, PromptHeaderAttributes.agent, PromptHeaderAttributes.argumentHint],
  [PromptsType.instructions]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.applyTo, PromptHeaderAttributes.excludeAgent],
  [PromptsType.agent]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.model, PromptHeaderAttributes.tools, PromptHeaderAttributes.advancedOptions, PromptHeaderAttributes.handOffs, PromptHeaderAttributes.argumentHint, PromptHeaderAttributes.target, PromptHeaderAttributes.infer, PromptHeaderAttributes.agents, PromptHeaderAttributes.userInvokable, PromptHeaderAttributes.disableModelInvocation],
  [PromptsType.skill]: [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.license, PromptHeaderAttributes.compatibility, PromptHeaderAttributes.metadata],
  [PromptsType.hook]: []
  // hooks are JSON files, not markdown with YAML frontmatter
};
const githubCopilotAgentAttributeNames = [PromptHeaderAttributes.name, PromptHeaderAttributes.description, PromptHeaderAttributes.tools, PromptHeaderAttributes.target, GithubPromptHeaderAttributes.mcpServers, PromptHeaderAttributes.infer];
const recommendedAttributeNames = {
  [PromptsType.prompt]: allAttributeNames[PromptsType.prompt].filter((name) => !isNonRecommendedAttribute(name)),
  [PromptsType.instructions]: allAttributeNames[PromptsType.instructions].filter((name) => !isNonRecommendedAttribute(name)),
  [PromptsType.agent]: allAttributeNames[PromptsType.agent].filter((name) => !isNonRecommendedAttribute(name)),
  [PromptsType.skill]: allAttributeNames[PromptsType.skill].filter((name) => !isNonRecommendedAttribute(name)),
  [PromptsType.hook]: []
  // hooks are JSON files, not markdown with YAML frontmatter
};
function getValidAttributeNames(promptType, includeNonRecommended, isGitHubTarget) {
  if (isGitHubTarget && promptType === PromptsType.agent) {
    return githubCopilotAgentAttributeNames;
  }
  return includeNonRecommended ? allAttributeNames[promptType] : recommendedAttributeNames[promptType];
}
__name(getValidAttributeNames, "getValidAttributeNames");
function isNonRecommendedAttribute(attributeName) {
  return attributeName === PromptHeaderAttributes.advancedOptions || attributeName === PromptHeaderAttributes.excludeAgent || attributeName === PromptHeaderAttributes.mode || attributeName === PromptHeaderAttributes.infer;
}
__name(isNonRecommendedAttribute, "isNonRecommendedAttribute");
function getAttributeDescription(attributeName, promptType) {
  switch (promptType) {
    case PromptsType.instructions:
      switch (attributeName) {
        case PromptHeaderAttributes.name:
          return localize("promptHeader.instructions.name", "The name of the instruction file as shown in the UI. If not set, the name is derived from the file name.");
        case PromptHeaderAttributes.description:
          return localize("promptHeader.instructions.description", "The description of the instruction file. It can be used to provide additional context or information about the instructions and is passed to the language model as part of the prompt.");
        case PromptHeaderAttributes.applyTo:
          return localize("promptHeader.instructions.applyToRange", "One or more glob pattern (separated by comma) that describe for which files the instructions apply to. Based on these patterns, the file is automatically included in the prompt, when the context contains a file that matches one or more of these patterns. Use `**` when you want this file to always be added.\nExample: `**/*.ts`, `**/*.js`, `client/**`");
      }
      break;
    case PromptsType.skill:
      switch (attributeName) {
        case PromptHeaderAttributes.name:
          return localize("promptHeader.skill.name", "The name of the skill.");
        case PromptHeaderAttributes.description:
          return localize("promptHeader.skill.description", "The description of the skill. The description is added to every request and will be used by the agent to decide when to load the skill.");
      }
      break;
    case PromptsType.agent:
      switch (attributeName) {
        case PromptHeaderAttributes.name:
          return localize("promptHeader.agent.name", "The name of the agent as shown in the UI.");
        case PromptHeaderAttributes.description:
          return localize("promptHeader.agent.description", "The description of the custom agent, what it does and when to use it.");
        case PromptHeaderAttributes.argumentHint:
          return localize("promptHeader.agent.argumentHint", "The argument-hint describes what inputs the custom agent expects or supports.");
        case PromptHeaderAttributes.model:
          return localize("promptHeader.agent.model", "Specify the model that runs this custom agent. Can also be a list of models. The first available model will be used.");
        case PromptHeaderAttributes.tools:
          return localize("promptHeader.agent.tools", "The set of tools that the custom agent has access to.");
        case PromptHeaderAttributes.handOffs:
          return localize("promptHeader.agent.handoffs", "Possible handoff actions when the agent has completed its task.");
        case PromptHeaderAttributes.target:
          return localize("promptHeader.agent.target", "The target to which the header attributes like tools apply to. Possible values are `github-copilot` and `vscode`.");
        case PromptHeaderAttributes.infer:
          return localize("promptHeader.agent.infer", "Controls visibility of the agent.");
        case PromptHeaderAttributes.agents:
          return localize("promptHeader.agent.agents", "One or more agents that this agent can use as subagents. Use '*' to specify all available agents.");
        case PromptHeaderAttributes.userInvokable:
          return localize("promptHeader.agent.userInvokable", "Whether the agent can be selected and invoked by users in the UI.");
        case PromptHeaderAttributes.disableModelInvocation:
          return localize("promptHeader.agent.disableModelInvocation", "If true, prevents the agent from being invoked as a subagent.");
      }
      break;
    case PromptsType.prompt:
      switch (attributeName) {
        case PromptHeaderAttributes.name:
          return localize("promptHeader.prompt.name", "The name of the prompt. This is also the name of the slash command that will run this prompt.");
        case PromptHeaderAttributes.description:
          return localize("promptHeader.prompt.description", "The description of the reusable prompt, what it does and when to use it.");
        case PromptHeaderAttributes.argumentHint:
          return localize("promptHeader.prompt.argumentHint", "The argument-hint describes what inputs the prompt expects or supports.");
        case PromptHeaderAttributes.model:
          return localize("promptHeader.prompt.model", "The model to use in this prompt. Can also be a list of models. The first available model will be used.");
        case PromptHeaderAttributes.tools:
          return localize("promptHeader.prompt.tools", "The tools to use in this prompt.");
        case PromptHeaderAttributes.agent:
        case PromptHeaderAttributes.mode:
          return localize("promptHeader.prompt.agent.description", "The agent to use when running this prompt.");
      }
      break;
  }
  return void 0;
}
__name(getAttributeDescription, "getAttributeDescription");
const knownGithubCopilotTools = [
  SpecedToolAliases.execute,
  SpecedToolAliases.read,
  SpecedToolAliases.edit,
  SpecedToolAliases.search,
  SpecedToolAliases.agent
];
function isGithubTarget(promptType, target) {
  return promptType === PromptsType.agent && target === Target.GitHubCopilot;
}
__name(isGithubTarget, "isGithubTarget");
function toMarker(message, range, severity = MarkerSeverity.Error) {
  return { severity, message, ...range };
}
__name(toMarker, "toMarker");
let PromptValidatorContribution = class PromptValidatorContribution2 extends Disposable {
  static {
    __name(this, "PromptValidatorContribution");
  }
  constructor(modelService, instantiationService, markerService, promptsService, languageModelsService, languageModelToolsService, chatModeService) {
    super();
    this.modelService = modelService;
    this.markerService = markerService;
    this.promptsService = promptsService;
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this.localDisposables = this._register(new DisposableStore());
    this.validator = instantiationService.createInstance(PromptValidator);
    this.updateRegistration();
  }
  updateRegistration() {
    this.localDisposables.clear();
    const trackers = new ResourceMap();
    this.localDisposables.add(toDisposable(() => {
      trackers.forEach((tracker) => tracker.dispose());
      trackers.clear();
    }));
    this.modelService.getModels().forEach((model) => {
      const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
      if (promptType) {
        trackers.set(model.uri, new ModelTracker(model, promptType, this.validator, this.promptsService, this.markerService));
      }
    });
    this.localDisposables.add(this.modelService.onModelAdded((model) => {
      const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
      if (promptType && !trackers.has(model.uri)) {
        trackers.set(model.uri, new ModelTracker(model, promptType, this.validator, this.promptsService, this.markerService));
      }
    }));
    this.localDisposables.add(this.modelService.onModelRemoved((model) => {
      const tracker = trackers.get(model.uri);
      if (tracker) {
        tracker.dispose();
        trackers.delete(model.uri);
      }
    }));
    this.localDisposables.add(this.modelService.onModelLanguageChanged((event) => {
      const { model } = event;
      const tracker = trackers.get(model.uri);
      if (tracker) {
        tracker.dispose();
        trackers.delete(model.uri);
      }
      const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
      if (promptType) {
        trackers.set(model.uri, new ModelTracker(model, promptType, this.validator, this.promptsService, this.markerService));
      }
    }));
    const validateAll = /* @__PURE__ */ __name(() => trackers.forEach((tracker) => tracker.validate()), "validateAll");
    this.localDisposables.add(this.languageModelToolsService.onDidChangeTools(() => validateAll()));
    this.localDisposables.add(this.chatModeService.onDidChangeChatModes(() => validateAll()));
    this.localDisposables.add(this.languageModelsService.onDidChangeLanguageModels(() => validateAll()));
  }
};
PromptValidatorContribution = __decorate([
  __param(0, IModelService),
  __param(1, IInstantiationService),
  __param(2, IMarkerService),
  __param(3, IPromptsService),
  __param(4, ILanguageModelsService),
  __param(5, ILanguageModelToolsService),
  __param(6, IChatModeService)
], PromptValidatorContribution);
let ModelTracker = class ModelTracker2 extends Disposable {
  static {
    __name(this, "ModelTracker");
  }
  constructor(textModel, promptType, validator, promptsService, markerService) {
    super();
    this.textModel = textModel;
    this.promptType = promptType;
    this.validator = validator;
    this.promptsService = promptsService;
    this.markerService = markerService;
    this.delayer = this._register(new Delayer(200));
    this._register(textModel.onDidChangeContent(() => this.validate()));
    this.validate();
  }
  validate() {
    this.delayer.trigger(async () => {
      const markers = [];
      const ast = this.promptsService.getParsedPromptFile(this.textModel);
      await this.validator.validate(ast, this.promptType, (m) => markers.push(m));
      this.markerService.changeOne(MARKERS_OWNER_ID, this.textModel.uri, markers);
    });
  }
  dispose() {
    this.markerService.remove(MARKERS_OWNER_ID, [this.textModel.uri]);
    super.dispose();
  }
};
ModelTracker = __decorate([
  __param(3, IPromptsService),
  __param(4, IMarkerService)
], ModelTracker);
export {
  MARKERS_OWNER_ID,
  PromptValidator,
  PromptValidatorContribution,
  getAttributeDescription,
  getValidAttributeNames,
  isGithubTarget,
  isNonRecommendedAttribute,
  knownGithubCopilotTools
};
//# sourceMappingURL=promptValidator.js.map
