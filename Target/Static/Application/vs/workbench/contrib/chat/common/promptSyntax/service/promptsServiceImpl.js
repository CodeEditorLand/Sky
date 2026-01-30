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
import { CancellationError } from "../../../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../../../../base/common/map.js";
import { basename, dirname, isEqual } from "../../../../../../base/common/resources.js";
import { URI } from "../../../../../../base/common/uri.js";
import { OffsetRange } from "../../../../../../editor/common/core/ranges/offsetRange.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { localize } from "../../../../../../nls.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { FileOperationError, IFileService } from "../../../../../../platform/files/common/files.js";
import { IExtensionService } from "../../../../../services/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { IFilesConfigurationService } from "../../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { IUserDataProfileService } from "../../../../../services/userDataProfile/common/userDataProfile.js";
import { PromptsConfig } from "../config/config.js";
import { getCleanPromptName, PromptFileSource } from "../config/promptFileLocations.js";
import { PROMPT_LANGUAGE_ID, PromptsType, getPromptsTypeForLanguageId } from "../promptTypes.js";
import { PromptFilesLocator } from "../utils/promptFilesLocator.js";
import { PromptFileParser, PromptHeaderAttributes } from "../promptFileParser.js";
import { PromptsStorage, ExtensionAgentSourceType, CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT, INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT, PROMPT_FILE_PROVIDER_ACTIVATION_EVENT, SKILL_PROVIDER_ACTIVATION_EVENT } from "./promptsService.js";
import { Delayer } from "../../../../../../base/common/async.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { IChatPromptContentStore } from "../chatPromptContentStore.js";
class SkillMissingNameError extends Error {
  static {
    __name(this, "SkillMissingNameError");
  }
  constructor(uri) {
    super("Skill file must have a name attribute");
    this.uri = uri;
  }
}
class SkillMissingDescriptionError extends Error {
  static {
    __name(this, "SkillMissingDescriptionError");
  }
  constructor(uri) {
    super("Skill file must have a description attribute");
    this.uri = uri;
  }
}
class SkillNameMismatchError extends Error {
  static {
    __name(this, "SkillNameMismatchError");
  }
  constructor(uri, skillName, folderName) {
    super(`Skill name must match folder name: expected "${folderName}" but got "${skillName}"`);
    this.uri = uri;
    this.skillName = skillName;
    this.folderName = folderName;
  }
}
let PromptsService = class PromptsService2 extends Disposable {
  static {
    __name(this, "PromptsService");
  }
  constructor(logger, labelService, modelService, instantiationService, userDataService, configurationService, fileService, filesConfigService, storageService, extensionService, telemetryService, chatPromptContentStore) {
    super();
    this.logger = logger;
    this.labelService = labelService;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.userDataService = userDataService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.filesConfigService = filesConfigService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.telemetryService = telemetryService;
    this.chatPromptContentStore = chatPromptContentStore;
    this.cachedParsedPromptFromModels = new ResourceMap();
    this.cachedFileLocations = {};
    this.fileLocatorEvents = {};
    this.contributedFiles = {
      [PromptsType.prompt]: new ResourceMap(),
      [PromptsType.instructions]: new ResourceMap(),
      [PromptsType.agent]: new ResourceMap(),
      [PromptsType.skill]: new ResourceMap()
    };
    this.promptFileProviders = [];
    this.disabledPromptsStorageKeyPrefix = "chat.disabledPromptFiles.";
    this.fileLocator = this.instantiationService.createInstance(PromptFilesLocator);
    this._register(this.modelService.onModelRemoved((model) => {
      this.cachedParsedPromptFromModels.delete(model.uri);
    }));
    const modelChangeEvent = this._register(new ModelChangeTracker(this.modelService)).onDidPromptChange;
    this.cachedCustomAgents = this._register(new CachedPromise((token) => this.computeCustomAgents(token), () => Event.any(this.getFileLocatorEvent(PromptsType.agent), Event.filter(modelChangeEvent, (e) => e.promptType === PromptsType.agent))));
    this.cachedSlashCommands = this._register(new CachedPromise((token) => this.computePromptSlashCommands(token), () => Event.any(this.getFileLocatorEvent(PromptsType.prompt), Event.filter(modelChangeEvent, (e) => e.promptType === PromptsType.prompt))));
  }
  getFileLocatorEvent(type) {
    let event = this.fileLocatorEvents[type];
    if (!event) {
      event = this.fileLocatorEvents[type] = this._register(this.fileLocator.createFilesUpdatedEvent(type)).event;
      this._register(event(() => {
        this.cachedFileLocations[type] = void 0;
      }));
    }
    return event;
  }
  getParsedPromptFile(textModel) {
    const cached = this.cachedParsedPromptFromModels.get(textModel.uri);
    if (cached && cached[0] === textModel.getVersionId()) {
      return cached[1];
    }
    const ast = new PromptFileParser().parse(textModel.uri, textModel.getValue());
    if (!cached || cached[0] < textModel.getVersionId()) {
      this.cachedParsedPromptFromModels.set(textModel.uri, [textModel.getVersionId(), ast]);
    }
    return ast;
  }
  async listPromptFiles(type, token) {
    let listPromise = this.cachedFileLocations[type];
    if (!listPromise) {
      listPromise = this.computeListPromptFiles(type, token);
      if (!this.fileLocatorEvents[type]) {
        return listPromise;
      }
      this.cachedFileLocations[type] = listPromise;
      return listPromise;
    }
    return listPromise;
  }
  async computeListPromptFiles(type, token) {
    const prompts = await Promise.all([
      this.fileLocator.listFiles(type, PromptsStorage.user, token).then((uris) => uris.map((uri) => ({ uri, storage: PromptsStorage.user, type }))),
      this.fileLocator.listFiles(type, PromptsStorage.local, token).then((uris) => uris.map((uri) => ({ uri, storage: PromptsStorage.local, type }))),
      this.getExtensionPromptFiles(type, token)
    ]);
    return [...prompts.flat()];
  }
  /**
   * Registers a prompt file provider (CustomAgentProvider, InstructionsProvider, or PromptFileProvider).
   * This will be called by the extension host bridge when
   * an extension registers a provider via vscode.chat.registerCustomAgentProvider(),
   * registerInstructionsProvider(), or registerPromptFileProvider().
   */
  registerPromptFileProvider(extension, type, provider) {
    const providerEntry = { extension, type, ...provider };
    this.promptFileProviders.push(providerEntry);
    const disposables = new DisposableStore();
    if (provider.onDidChangePromptFiles) {
      disposables.add(provider.onDidChangePromptFiles(() => {
        if (type === PromptsType.agent) {
          this.cachedFileLocations[PromptsType.agent] = void 0;
          this.cachedCustomAgents.refresh();
        } else if (type === PromptsType.instructions) {
          this.cachedFileLocations[PromptsType.instructions] = void 0;
        } else if (type === PromptsType.prompt) {
          this.cachedFileLocations[PromptsType.prompt] = void 0;
          this.cachedSlashCommands.refresh();
        } else if (type === PromptsType.skill) {
          this.cachedFileLocations[PromptsType.skill] = void 0;
        }
      }));
    }
    if (type === PromptsType.agent) {
      this.cachedFileLocations[PromptsType.agent] = void 0;
      this.cachedCustomAgents.refresh();
    } else if (type === PromptsType.instructions) {
      this.cachedFileLocations[PromptsType.instructions] = void 0;
    } else if (type === PromptsType.prompt) {
      this.cachedFileLocations[PromptsType.prompt] = void 0;
      this.cachedSlashCommands.refresh();
    } else if (type === PromptsType.skill) {
      this.cachedFileLocations[PromptsType.skill] = void 0;
    }
    disposables.add({
      dispose: /* @__PURE__ */ __name(() => {
        const index = this.promptFileProviders.findIndex((p) => p === providerEntry);
        if (index >= 0) {
          this.promptFileProviders.splice(index, 1);
          if (type === PromptsType.agent) {
            this.cachedFileLocations[PromptsType.agent] = void 0;
            this.cachedCustomAgents.refresh();
          } else if (type === PromptsType.instructions) {
            this.cachedFileLocations[PromptsType.instructions] = void 0;
          } else if (type === PromptsType.prompt) {
            this.cachedFileLocations[PromptsType.prompt] = void 0;
            this.cachedSlashCommands.refresh();
          } else if (type === PromptsType.skill) {
            this.cachedFileLocations[PromptsType.skill] = void 0;
          }
        }
      }, "dispose")
    });
    return disposables;
  }
  /**
   * Shared helper to list prompt files from registered providers for a given type.
   */
  async listFromProviders(type, activationEvent, token) {
    const result = [];
    await this.extensionService.activateByEvent(activationEvent);
    const providers = this.promptFileProviders.filter((p) => p.type === type);
    if (providers.length === 0) {
      return result;
    }
    for (const providerEntry of providers) {
      try {
        const files = await providerEntry.providePromptFiles({}, token);
        if (!files || token.isCancellationRequested) {
          continue;
        }
        for (const file of files) {
          if (!file.isEditable) {
            try {
              await this.filesConfigService.updateReadonly(file.uri, true);
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              this.logger.error(`[listFromProviders] Failed to make file readonly: ${file.uri}`, msg);
            }
          }
          result.push({
            uri: file.uri,
            storage: PromptsStorage.extension,
            type,
            extension: providerEntry.extension,
            source: ExtensionAgentSourceType.provider
          });
        }
      } catch (e) {
        this.logger.error(`[listFromProviders] Failed to get ${type} files from provider`, e instanceof Error ? e.message : String(e));
      }
    }
    return result;
  }
  async listPromptFilesForStorage(type, storage, token) {
    switch (storage) {
      case PromptsStorage.extension:
        return this.getExtensionPromptFiles(type, token);
      case PromptsStorage.local:
        return this.fileLocator.listFiles(type, PromptsStorage.local, token).then((uris) => uris.map((uri) => ({ uri, storage: PromptsStorage.local, type })));
      case PromptsStorage.user:
        return this.fileLocator.listFiles(type, PromptsStorage.user, token).then((uris) => uris.map((uri) => ({ uri, storage: PromptsStorage.user, type })));
      default:
        throw new Error(`[listPromptFilesForStorage] Unsupported prompt storage type: ${storage}`);
    }
  }
  async getExtensionPromptFiles(type, token) {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const contributedFiles = await Promise.all(this.contributedFiles[type].values());
    const activationEvent = this.getProviderActivationEvent(type);
    const providerFiles = await this.listFromProviders(type, activationEvent, token);
    return [...contributedFiles, ...providerFiles];
  }
  getProviderActivationEvent(type) {
    switch (type) {
      case PromptsType.agent:
        return CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT;
      case PromptsType.instructions:
        return INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT;
      case PromptsType.prompt:
        return PROMPT_FILE_PROVIDER_ACTIVATION_EVENT;
      case PromptsType.skill:
        return SKILL_PROVIDER_ACTIVATION_EVENT;
    }
  }
  async getSourceFolders(type) {
    const result = [];
    if (type === PromptsType.agent) {
      const folders = await this.fileLocator.getAgentSourceFolders();
      for (const uri of folders) {
        result.push({ uri, storage: PromptsStorage.local, type });
      }
    } else {
      for (const uri of await this.fileLocator.getConfigBasedSourceFolders(type)) {
        result.push({ uri, storage: PromptsStorage.local, type });
      }
    }
    if (type !== PromptsType.skill) {
      const userHome = this.userDataService.currentProfile.promptsHome;
      result.push({ uri: userHome, storage: PromptsStorage.user, type });
    }
    return result;
  }
  // slash prompt commands
  /**
   * Emitter for slash commands change events.
   */
  get onDidChangeSlashCommands() {
    return this.cachedSlashCommands.onDidChange;
  }
  async getPromptSlashCommands(token) {
    return this.cachedSlashCommands.get(token);
  }
  async computePromptSlashCommands(token) {
    const promptFiles = await this.listPromptFiles(PromptsType.prompt, token);
    const details = await Promise.all(promptFiles.map(async (promptPath) => {
      try {
        const parsedPromptFile = await this.parseNew(promptPath.uri, token);
        return this.asChatPromptSlashCommand(parsedPromptFile, promptPath);
      } catch (e) {
        this.logger.error(`[computePromptSlashCommands] Failed to parse prompt file for slash command: ${promptPath.uri}`, e instanceof Error ? e.message : String(e));
        return void 0;
      }
    }));
    const result = [];
    const seen = new ResourceSet();
    for (const detail of details) {
      if (detail) {
        result.push(detail);
        seen.add(detail.promptPath.uri);
      }
    }
    for (const model of this.modelService.getModels()) {
      if (model.getLanguageId() === PROMPT_LANGUAGE_ID && model.uri.scheme === Schemas.untitled && !seen.has(model.uri)) {
        const parsedPromptFile = this.getParsedPromptFile(model);
        result.push(this.asChatPromptSlashCommand(parsedPromptFile, { uri: model.uri, storage: PromptsStorage.local, type: PromptsType.prompt }));
      }
    }
    return result;
  }
  isValidSlashCommandName(command) {
    return command.match(/^[\p{L}\d_\-\.]+$/u) !== null;
  }
  async resolvePromptSlashCommand(name, token) {
    const commands = await this.getPromptSlashCommands(token);
    return commands.find((cmd) => cmd.name === name);
  }
  asChatPromptSlashCommand(parsedPromptFile, promptPath) {
    let name = parsedPromptFile?.header?.name ?? promptPath.name ?? getCleanPromptName(promptPath.uri);
    name = name.replace(/[^\p{L}\d_\-\.]+/gu, "-");
    return {
      name,
      description: parsedPromptFile?.header?.description ?? promptPath.description,
      argumentHint: parsedPromptFile?.header?.argumentHint,
      parsedPromptFile,
      promptPath
    };
  }
  async getPromptSlashCommandName(uri, token) {
    const slashCommands = await this.getPromptSlashCommands(token);
    const slashCommand = slashCommands.find((c) => isEqual(c.promptPath.uri, uri));
    if (!slashCommand) {
      return getCleanPromptName(uri);
    }
    return slashCommand.name;
  }
  // custom agents
  /**
   * Emitter for custom agents change events.
   */
  get onDidChangeCustomAgents() {
    return this.cachedCustomAgents.onDidChange;
  }
  async getCustomAgents(token) {
    return this.cachedCustomAgents.get(token);
  }
  async computeCustomAgents(token) {
    let agentFiles = await this.listPromptFiles(PromptsType.agent, token);
    const disabledAgents = this.getDisabledPromptFiles(PromptsType.agent);
    agentFiles = agentFiles.filter((promptPath) => !disabledAgents.has(promptPath.uri));
    const customAgentsResults = await Promise.allSettled(agentFiles.map(async (promptPath) => {
      const uri = promptPath.uri;
      const ast = await this.parseNew(uri, token);
      let metadata;
      if (ast.header) {
        const advanced = ast.header.getAttribute(PromptHeaderAttributes.advancedOptions);
        if (advanced && advanced.value.type === "object") {
          metadata = {};
          for (const [key, value] of Object.entries(advanced.value)) {
            if (["string", "number", "boolean"].includes(value.type)) {
              metadata[key] = value;
            }
          }
        }
      }
      const toolReferences = [];
      if (ast.body) {
        const bodyOffset = ast.body.offset;
        const bodyVarRefs = ast.body.variableReferences;
        for (let i = bodyVarRefs.length - 1; i >= 0; i--) {
          const { name: name2, offset } = bodyVarRefs[i];
          const range = new OffsetRange(offset - bodyOffset, offset - bodyOffset + name2.length + 1);
          toolReferences.push({ name: name2, range });
        }
      }
      const agentInstructions = {
        content: ast.body?.getContent() ?? "",
        toolReferences,
        metadata
      };
      const name = ast.header?.name ?? promptPath.name ?? getCleanPromptName(uri);
      const source = IAgentSource.fromPromptPath(promptPath);
      if (!ast.header) {
        return { uri, name, agentInstructions, source };
      }
      const { description, model, tools, handOffs, argumentHint, target, infer } = ast.header;
      return { uri, name, description, model, tools, handOffs, argumentHint, target, infer, agentInstructions, source };
    }));
    const customAgents = [];
    for (let i = 0; i < customAgentsResults.length; i++) {
      const result = customAgentsResults[i];
      if (result.status === "fulfilled") {
        customAgents.push(result.value);
      } else {
        const uri = agentFiles[i].uri;
        const error = result.reason;
        if (error instanceof FileOperationError && error.fileOperationResult === 1) {
          this.logger.warn(`[computeCustomAgents] Skipping agent file that does not exist: ${uri}`, error.message);
        } else {
          this.logger.error(`[computeCustomAgents] Failed to parse agent file: ${uri}`, error);
        }
      }
    }
    return customAgents;
  }
  async parseNew(uri, token) {
    const model = this.modelService.getModel(uri);
    if (model) {
      return this.getParsedPromptFile(model);
    }
    if (uri.scheme === Schemas.vscodeChatPrompt) {
      const content = this.chatPromptContentStore.getContent(uri);
      if (content !== void 0) {
        return new PromptFileParser().parse(uri, content);
      }
      throw new Error(`Content not found in store for virtual prompt URI: ${uri.toString()}`);
    }
    const fileContent = await this.fileService.readFile(uri);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    return new PromptFileParser().parse(uri, fileContent.value.toString());
  }
  registerContributedFile(type, uri, extension, name, description) {
    const bucket = this.contributedFiles[type];
    if (bucket.has(uri)) {
      return Disposable.None;
    }
    const entryPromise = (async () => {
      if (type === PromptsType.skill) {
        try {
          const validated = await this.validateAndSanitizeSkillFile(uri, CancellationToken.None);
          name = validated.name;
          description = validated.description;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.error(`[registerContributedFile] Extension '${extension.identifier.value}' failed to validate skill file: ${uri}`, msg);
          throw e;
        }
      }
      try {
        await this.filesConfigService.updateReadonly(uri, true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.error(`[registerContributedFile] Failed to make prompt file readonly: ${uri}`, msg);
      }
      return { uri, name, description, storage: PromptsStorage.extension, type, extension, source: ExtensionAgentSourceType.contribution };
    })();
    bucket.set(uri, entryPromise);
    const flushCachesIfRequired = /* @__PURE__ */ __name(() => {
      this.cachedFileLocations[type] = void 0;
      switch (type) {
        case PromptsType.agent:
          this.cachedCustomAgents.refresh();
          break;
        case PromptsType.prompt:
          this.cachedSlashCommands.refresh();
          break;
      }
    }, "flushCachesIfRequired");
    flushCachesIfRequired();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        bucket.delete(uri);
        flushCachesIfRequired();
      }, "dispose")
    };
  }
  getPromptLocationLabel(promptPath) {
    switch (promptPath.storage) {
      case PromptsStorage.local:
        return this.labelService.getUriLabel(dirname(promptPath.uri), { relative: true });
      case PromptsStorage.user:
        return localize("user-data-dir.capitalized", "User Data");
      case PromptsStorage.extension: {
        return localize("extension.with.id", "Extension: {0}", promptPath.extension.displayName ?? promptPath.extension.id);
      }
      default:
        throw new Error("Unknown prompt storage type");
    }
  }
  findAgentMDsInWorkspace(token) {
    return this.fileLocator.findAgentMDsInWorkspace(token);
  }
  async listAgentMDs(token, includeNested) {
    const useAgentMD = this.configurationService.getValue(PromptsConfig.USE_AGENT_MD);
    if (!useAgentMD) {
      return [];
    }
    if (includeNested) {
      return await this.fileLocator.findAgentMDsInWorkspace(token);
    } else {
      return await this.fileLocator.findAgentMDsInWorkspaceRoots(token);
    }
  }
  async listCopilotInstructionsMDs(token) {
    const useCopilotInstructionsFiles = this.configurationService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES);
    if (!useCopilotInstructionsFiles) {
      return [];
    }
    return await this.fileLocator.findCopilotInstructionsMDsInWorkspace(token);
  }
  getAgentFileURIFromModeFile(oldURI) {
    return this.fileLocator.getAgentFileURIFromModeFile(oldURI);
  }
  getDisabledPromptFiles(type) {
    const disabledKey = this.disabledPromptsStorageKeyPrefix + type;
    const value = this.storageService.get(disabledKey, 0, "[]");
    const result = new ResourceSet();
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) {
        for (const s of arr) {
          try {
            result.add(URI.revive(s));
          } catch {
          }
        }
      }
    } catch {
    }
    return result;
  }
  setDisabledPromptFiles(type, uris) {
    const disabled = Array.from(uris).map((uri) => uri.toJSON());
    this.storageService.store(
      this.disabledPromptsStorageKeyPrefix + type,
      JSON.stringify(disabled),
      0,
      0
      /* StorageTarget.USER */
    );
    if (type === PromptsType.agent) {
      this.cachedCustomAgents.refresh();
    }
  }
  // Agent skills
  sanitizeAgentSkillText(text) {
    return text.replace(/<[^>]+>/g, "");
  }
  /**
   * Validates and sanitizes a skill file. Throws an error if validation fails.
   * @returns The sanitized name and description
   */
  async validateAndSanitizeSkillFile(uri, token) {
    const parsedFile = await this.parseNew(uri, token);
    const name = parsedFile.header?.name;
    if (!name) {
      this.logger.error(`[validateAndSanitizeSkillFile] Agent skill file missing name attribute: ${uri}`);
      throw new SkillMissingNameError(uri);
    }
    const description = parsedFile.header?.description;
    if (!description) {
      this.logger.error(`[validateAndSanitizeSkillFile] Agent skill file missing description attribute: ${uri}`);
      throw new SkillMissingDescriptionError(uri);
    }
    const sanitizedName = this.truncateAgentSkillName(name, uri);
    const skillFolderUri = dirname(uri);
    const folderName = basename(skillFolderUri);
    if (sanitizedName !== folderName) {
      this.logger.error(`[validateAndSanitizeSkillFile] Agent skill name "${sanitizedName}" does not match folder name "${folderName}": ${uri}`);
      throw new SkillNameMismatchError(uri, sanitizedName, folderName);
    }
    const sanitizedDescription = this.truncateAgentSkillDescription(parsedFile.header?.description, uri);
    return { name: sanitizedName, description: sanitizedDescription };
  }
  truncateAgentSkillName(name, uri) {
    const MAX_NAME_LENGTH = 64;
    const sanitized = this.sanitizeAgentSkillText(name);
    if (sanitized !== name) {
      this.logger.warn(`[findAgentSkills] Agent skill name contains XML tags, removed: ${uri}`);
    }
    if (sanitized.length > MAX_NAME_LENGTH) {
      this.logger.warn(`[findAgentSkills] Agent skill name exceeds ${MAX_NAME_LENGTH} characters, truncated: ${uri}`);
      return sanitized.substring(0, MAX_NAME_LENGTH);
    }
    return sanitized;
  }
  truncateAgentSkillDescription(description, uri) {
    if (!description) {
      return void 0;
    }
    const MAX_DESCRIPTION_LENGTH = 1024;
    const sanitized = this.sanitizeAgentSkillText(description);
    if (sanitized !== description) {
      this.logger.warn(`[findAgentSkills] Agent skill description contains XML tags, removed: ${uri}`);
    }
    if (sanitized.length > MAX_DESCRIPTION_LENGTH) {
      this.logger.warn(`[findAgentSkills] Agent skill description exceeds ${MAX_DESCRIPTION_LENGTH} characters, truncated: ${uri}`);
      return sanitized.substring(0, MAX_DESCRIPTION_LENGTH);
    }
    return sanitized;
  }
  async findAgentSkills(token) {
    const useAgentSkills = this.configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS);
    if (useAgentSkills) {
      const result = [];
      const seenNames = /* @__PURE__ */ new Set();
      const skillTypes = /* @__PURE__ */ new Map();
      let skippedMissingName = 0;
      let skippedMissingDescription = 0;
      let skippedDuplicateName = 0;
      let skippedParseFailed = 0;
      let skippedNameMismatch = 0;
      const process = /* @__PURE__ */ __name(async (uri, source, storage) => {
        try {
          const parsedFile = await this.parseNew(uri, token);
          const name = parsedFile.header?.name;
          if (!name) {
            skippedMissingName++;
            this.logger.error(`[findAgentSkills] Agent skill file missing name attribute: ${uri}`);
            return;
          }
          const sanitizedName = this.truncateAgentSkillName(name, uri);
          const skillFolderUri = dirname(uri);
          const folderName = basename(skillFolderUri);
          if (sanitizedName !== folderName) {
            skippedNameMismatch++;
            this.logger.error(`[findAgentSkills] Agent skill name "${sanitizedName}" does not match folder name "${folderName}": ${uri}`);
            return;
          }
          if (seenNames.has(sanitizedName)) {
            skippedDuplicateName++;
            this.logger.warn(`[findAgentSkills] Skipping duplicate agent skill name: ${sanitizedName} at ${uri}`);
            return;
          }
          seenNames.add(sanitizedName);
          const sanitizedDescription = this.truncateAgentSkillDescription(parsedFile.header?.description, uri);
          result.push({ uri, storage, name: sanitizedName, description: sanitizedDescription });
          skillTypes.set(source, (skillTypes.get(source) || 0) + 1);
        } catch (e) {
          if (e instanceof SkillMissingNameError) {
            skippedMissingName++;
          } else if (e instanceof SkillMissingDescriptionError) {
            skippedMissingDescription++;
          } else if (e instanceof SkillNameMismatchError) {
            skippedNameMismatch++;
          } else {
            skippedParseFailed++;
          }
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.error(`[findAgentSkills] Failed to validate Agent skill file: ${uri}`, msg);
        }
      }, "process");
      const allSkills = [];
      const discoveredSkills = await this.fileLocator.findAgentSkills(token);
      const extensionSkills = await this.getExtensionPromptFiles(PromptsType.skill, token);
      allSkills.push(...discoveredSkills, ...extensionSkills.map((extPath) => ({
        fileUri: extPath.uri,
        storage: extPath.storage,
        source: extPath.source === ExtensionAgentSourceType.contribution ? PromptFileSource.ExtensionContribution : PromptFileSource.ExtensionAPI
      })));
      const getPriority = /* @__PURE__ */ __name((skill) => {
        if (skill.storage === PromptsStorage.local) {
          return 0;
        }
        if (skill.storage === PromptsStorage.user) {
          return 1;
        }
        if (skill.source === PromptFileSource.ExtensionAPI) {
          return 2;
        }
        if (skill.source === PromptFileSource.ExtensionContribution) {
          return 3;
        }
        return 4;
      }, "getPriority");
      allSkills.sort((a, b) => getPriority(a) - getPriority(b));
      for (const skill of allSkills) {
        await process(skill.fileUri, skill.source, skill.storage);
      }
      this.telemetryService.publicLog2("agentSkillsFound", {
        totalSkillsFound: result.length,
        claudePersonal: skillTypes.get(PromptFileSource.ClaudePersonal) ?? 0,
        claudeWorkspace: skillTypes.get(PromptFileSource.ClaudeWorkspace) ?? 0,
        copilotPersonal: skillTypes.get(PromptFileSource.CopilotPersonal) ?? 0,
        githubWorkspace: skillTypes.get(PromptFileSource.GitHubWorkspace) ?? 0,
        configWorkspace: skillTypes.get(PromptFileSource.ConfigWorkspace) ?? 0,
        configPersonal: skillTypes.get(PromptFileSource.ConfigPersonal) ?? 0,
        extensionContribution: skillTypes.get(PromptFileSource.ExtensionContribution) ?? 0,
        extensionAPI: skillTypes.get(PromptFileSource.ExtensionAPI) ?? 0,
        skippedDuplicateName,
        skippedMissingName,
        skippedMissingDescription,
        skippedNameMismatch,
        skippedParseFailed
      });
      return result;
    }
    return void 0;
  }
};
PromptsService = __decorate([
  __param(0, ILogService),
  __param(1, ILabelService),
  __param(2, IModelService),
  __param(3, IInstantiationService),
  __param(4, IUserDataProfileService),
  __param(5, IConfigurationService),
  __param(6, IFileService),
  __param(7, IFilesConfigurationService),
  __param(8, IStorageService),
  __param(9, IExtensionService),
  __param(10, ITelemetryService),
  __param(11, IChatPromptContentStore)
], PromptsService);
class CachedPromise extends Disposable {
  static {
    __name(this, "CachedPromise");
  }
  constructor(computeFn, getEvent, delay = 0) {
    super();
    this.computeFn = computeFn;
    this.getEvent = getEvent;
    this.delay = delay;
    this.cachedPromise = void 0;
    this.onDidUpdatePromiseEmitter = void 0;
  }
  get onDidChange() {
    if (!this.onDidUpdatePromiseEmitter) {
      const emitter = this.onDidUpdatePromiseEmitter = this._register(new Emitter());
      const delayer = this._register(new Delayer(this.delay));
      this._register(this.getEvent()(() => {
        this.cachedPromise = void 0;
        delayer.trigger(() => emitter.fire());
      }));
    }
    return this.onDidUpdatePromiseEmitter.event;
  }
  get(token) {
    if (this.cachedPromise !== void 0) {
      return this.cachedPromise;
    }
    const result = this.computeFn(token);
    if (!this.onDidUpdatePromiseEmitter) {
      return result;
    }
    this.cachedPromise = result;
    this.onDidUpdatePromiseEmitter.fire();
    return result;
  }
  refresh() {
    this.cachedPromise = void 0;
    this.onDidUpdatePromiseEmitter?.fire();
  }
}
class ModelChangeTracker extends Disposable {
  static {
    __name(this, "ModelChangeTracker");
  }
  get onDidPromptChange() {
    return this.onDidPromptModelChange.event;
  }
  constructor(modelService) {
    super();
    this.listeners = new ResourceMap();
    this.onDidPromptModelChange = this._register(new Emitter());
    const onAdd = /* @__PURE__ */ __name((model) => {
      const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
      if (promptType !== void 0) {
        this.listeners.set(model.uri, model.onDidChangeContent(() => this.onDidPromptModelChange.fire({ uri: model.uri, promptType })));
      }
    }, "onAdd");
    const onRemove = /* @__PURE__ */ __name((languageId, uri) => {
      const promptType = getPromptsTypeForLanguageId(languageId);
      if (promptType !== void 0) {
        this.listeners.get(uri)?.dispose();
        this.listeners.delete(uri);
        this.onDidPromptModelChange.fire({ uri, promptType });
      }
    }, "onRemove");
    this._register(modelService.onModelAdded((model) => onAdd(model)));
    this._register(modelService.onModelLanguageChanged((e) => {
      onRemove(e.oldLanguageId, e.model.uri);
      onAdd(e.model);
    }));
    this._register(modelService.onModelRemoved((model) => onRemove(model.getLanguageId(), model.uri)));
  }
  dispose() {
    super.dispose();
    this.listeners.forEach((listener) => listener.dispose());
    this.listeners.clear();
  }
}
var IAgentSource;
(function(IAgentSource2) {
  function fromPromptPath(promptPath) {
    if (promptPath.storage === PromptsStorage.extension) {
      return {
        storage: PromptsStorage.extension,
        extensionId: promptPath.extension.identifier,
        type: promptPath.source
      };
    } else {
      return {
        storage: promptPath.storage
      };
    }
  }
  __name(fromPromptPath, "fromPromptPath");
  IAgentSource2.fromPromptPath = fromPromptPath;
})(IAgentSource || (IAgentSource = {}));
export {
  PromptsService,
  SkillMissingDescriptionError,
  SkillMissingNameError,
  SkillNameMismatchError
};
//# sourceMappingURL=promptsServiceImpl.js.map
