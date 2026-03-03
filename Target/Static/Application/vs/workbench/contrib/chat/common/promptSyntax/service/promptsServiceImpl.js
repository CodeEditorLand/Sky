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
import { parse as parseJSONC } from "../../../../../../base/common/json.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { ResourceMap, ResourceSet } from "../../../../../../base/common/map.js";
import { basename, dirname, isEqual, joinPath } from "../../../../../../base/common/resources.js";
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
import { AGENT_MD_FILENAME, CLAUDE_CONFIG_FOLDER, CLAUDE_LOCAL_MD_FILENAME, CLAUDE_MD_FILENAME, getCleanPromptName, PromptFileSource } from "../config/promptFileLocations.js";
import { PROMPT_LANGUAGE_ID, PromptsType, getPromptsTypeForLanguageId } from "../promptTypes.js";
import { PromptFilesLocator } from "../utils/promptFilesLocator.js";
import { PromptFileParser, PromptHeaderAttributes } from "../promptFileParser.js";
import { PromptsStorage, ExtensionAgentSourceType, CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT, INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT, PROMPT_FILE_PROVIDER_ACTIVATION_EVENT, SKILL_PROVIDER_ACTIVATION_EVENT, AgentFileType, Target } from "./promptsService.js";
import { Delayer } from "../../../../../../base/common/async.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { HookType } from "../hookSchema.js";
import { HookSourceFormat, getHookSourceFormat, parseHooksFromFile } from "../hookCompatibility.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IPathService } from "../../../../../services/path/common/pathService.js";
import { getTarget, mapClaudeModels, mapClaudeTools } from "../languageProviders/promptValidator.js";
import { StopWatch } from "../../../../../../base/common/stopwatch.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { getCanonicalPluginCommandId, IAgentPluginService } from "../../plugins/agentPluginService.js";
import { assertNever } from "../../../../../../base/common/assert.js";
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
  constructor(logger, labelService, modelService, instantiationService, userDataService, configurationService, fileService, filesConfigService, storageService, extensionService, telemetryService, workspaceService, pathService, contextKeyService, agentPluginService) {
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
    this.workspaceService = workspaceService;
    this.pathService = pathService;
    this.contextKeyService = contextKeyService;
    this.agentPluginService = agentPluginService;
    this.cachedParsedPromptFromModels = new ResourceMap();
    this._onDidLogDiscovery = this._register(new Emitter());
    this.onDidLogDiscovery = this._onDidLogDiscovery.event;
    this.cachedFileLocations = {};
    this.fileLocatorEvents = {};
    this.contributedFiles = {
      [PromptsType.prompt]: new ResourceMap(),
      [PromptsType.instructions]: new ResourceMap(),
      [PromptsType.agent]: new ResourceMap(),
      [PromptsType.skill]: new ResourceMap(),
      [PromptsType.hook]: new ResourceMap()
    };
    this._contributedWhenKeys = /* @__PURE__ */ new Set();
    this._contributedWhenClauses = /* @__PURE__ */ new Map();
    this._onDidContributedWhenChange = this._register(new Emitter());
    this._onDidPluginPromptFilesChange = this._register(new Emitter());
    this._onDidPluginHooksChange = this._register(new Emitter());
    this._pluginPromptFilesByType = /* @__PURE__ */ new Map();
    this.promptFileProviders = [];
    this.disabledPromptsStorageKeyPrefix = "chat.disabledPromptFiles.";
    this.fileLocator = this.createPromptFilesLocator();
    this._register(this.modelService.onModelRemoved((model) => {
      this.cachedParsedPromptFromModels.delete(model.uri);
    }));
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._contributedWhenKeys)) {
        for (const type of Object.keys(this.cachedFileLocations)) {
          this.cachedFileLocations[type] = void 0;
        }
        this._onDidContributedWhenChange.fire();
      }
    }));
    const modelChangeEvent = this._register(new ModelChangeTracker(this.modelService)).onDidPromptChange;
    this.cachedCustomAgents = this._register(new CachedPromise((token) => this.computeCustomAgents(token), () => Event.any(this.getFileLocatorEvent(PromptsType.agent), Event.filter(modelChangeEvent, (e) => e.promptType === PromptsType.agent), this._onDidContributedWhenChange.event)));
    this.cachedSlashCommands = this._register(new CachedPromise((token) => this.computePromptSlashCommands(token), () => Event.any(this.getFileLocatorEvent(PromptsType.prompt), this.getFileLocatorEvent(PromptsType.skill), Event.filter(modelChangeEvent, (e) => e.promptType === PromptsType.prompt), Event.filter(modelChangeEvent, (e) => e.promptType === PromptsType.skill), this._onDidContributedWhenChange.event, this._onDidPluginPromptFilesChange.event)));
    this.cachedSkills = this._register(new CachedPromise((token) => this.computeAgentSkills(token), () => Event.any(this.getFileLocatorEvent(PromptsType.skill), Event.filter(modelChangeEvent, (e) => e.promptType === PromptsType.skill), this._onDidContributedWhenChange.event, this._onDidPluginPromptFilesChange.event)));
    this.cachedHooks = this._register(new CachedPromise((token) => this.computeHooks(token), () => Event.any(this.getFileLocatorEvent(PromptsType.hook), Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(PromptsConfig.USE_CHAT_HOOKS) || e.affectsConfiguration(PromptsConfig.USE_CLAUDE_HOOKS)), this._onDidPluginHooksChange.event)));
    this._register(this.cachedSkills.onDidChange(() => {
    }));
    this._register(this.cachedHooks.onDidChange(() => {
    }));
    this._register(this.watchPluginPromptFilesForType(PromptsType.prompt, (plugin, reader) => plugin.commands.read(reader)));
    this._register(this.watchPluginPromptFilesForType(PromptsType.skill, (plugin, reader) => plugin.skills.read(reader)));
    this._register(this.watchPluginPromptFilesForType(PromptsType.agent, (plugin, reader) => plugin.agents.read(reader)));
    this._register(autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      for (const plugin of plugins) {
        plugin.hooks.read(reader);
      }
      this._onDidPluginHooksChange.fire();
    }));
  }
  watchPluginPromptFilesForType(type, getItems) {
    return autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      const nextFiles = [];
      for (const plugin of plugins) {
        for (const item of getItems(plugin, reader)) {
          nextFiles.push({
            uri: item.uri,
            storage: PromptsStorage.plugin,
            type,
            name: getCanonicalPluginCommandId(plugin, item.name),
            pluginUri: plugin.uri
          });
        }
      }
      nextFiles.sort((a, b) => `${a.name ?? ""}|${a.uri.toString()}`.localeCompare(`${b.name ?? ""}|${b.uri.toString()}`));
      this._pluginPromptFilesByType.set(type, nextFiles);
      this.cachedFileLocations[type] = void 0;
      this._onDidPluginPromptFilesChange.fire();
    });
  }
  createPromptFilesLocator() {
    return this.instantiationService.createInstance(PromptFilesLocator);
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
      this.getExtensionPromptFiles(type, token),
      this._pluginPromptFilesByType.get(type) ?? []
    ]);
    return [...prompts.flat()];
  }
  /**
   * Collects diagnostic information about which source folders were searched
   * and whether they exist, for display in the debug panel.
   */
  async _collectSourceFolderDiagnostics(type, foundFiles) {
    const resolvedFolders = await this.fileLocator.getSourceFoldersInDiscoveryOrder(type);
    const results = [];
    for (const folder of resolvedFolders) {
      const fileCount = foundFiles.filter((f) => f.uri.path.startsWith(folder.uri.path + "/")).length;
      let exists = fileCount > 0;
      let errorMessage;
      if (!exists) {
        try {
          const stat = await this.fileService.stat(folder.uri);
          exists = stat.isDirectory;
        } catch (e) {
          if (e instanceof FileOperationError && e.fileOperationResult === 1) {
            exists = false;
          } else {
            exists = false;
            errorMessage = e instanceof Error ? e.message : String(e);
          }
        }
      }
      results.push({
        uri: folder.uri,
        storage: folder.storage,
        exists,
        fileCount,
        errorMessage
      });
    }
    return results;
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
        this.invalidatePromptFileCache(type);
      }));
    }
    this.invalidatePromptFileCache(type);
    disposables.add({
      dispose: /* @__PURE__ */ __name(() => {
        const index = this.promptFileProviders.findIndex((p) => p === providerEntry);
        if (index >= 0) {
          this.promptFileProviders.splice(index, 1);
          this.invalidatePromptFileCache(type);
        }
      }, "dispose")
    });
    return disposables;
  }
  invalidatePromptFileCache(type) {
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
      this.cachedSkills.refresh();
      this.cachedSlashCommands.refresh();
    }
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
          try {
            await this.filesConfigService.updateReadonly(file.uri, true);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.logger.error(`[listFromProviders] Failed to make file readonly: ${file.uri}`, msg);
          }
          result.push({
            uri: file.uri,
            storage: PromptsStorage.extension,
            type,
            extension: providerEntry.extension,
            source: ExtensionAgentSourceType.provider,
            name: file.name,
            description: file.description
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
      case PromptsStorage.plugin:
        return this._pluginPromptFilesByType.get(type) ?? [];
      default:
        throw new Error(`[listPromptFilesForStorage] Unsupported prompt storage type: ${storage}`);
    }
  }
  async getExtensionPromptFiles(type, token) {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const settledResults = await Promise.allSettled(this.contributedFiles[type].values());
    const contributedFiles = settledResults.filter((result) => result.status === "fulfilled").map((result) => result.value).filter((file) => {
      if (!file.when) {
        return true;
      }
      const expr = ContextKeyExpr.deserialize(file.when);
      if (!expr) {
        this.logger.warn(`[getExtensionPromptFiles] Ignoring contributed prompt file with invalid when clause: ${file.when}`);
        return false;
      }
      return this.contextKeyService.contextMatchesRules(expr);
    });
    const activationEvent = this.getProviderActivationEvent(type);
    if (!activationEvent) {
      return contributedFiles;
    }
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
      case PromptsType.hook:
        return void 0;
    }
  }
  async getSourceFolders(type) {
    const result = [];
    if (type === PromptsType.hook) {
      const hooksFolders = await this.fileLocator.getHookSourceFolders();
      for (const uri of hooksFolders) {
        result.push({ uri, storage: PromptsStorage.local, type });
      }
    } else {
      for (const uri of await this.fileLocator.getConfigBasedSourceFolders(type)) {
        result.push({ uri, storage: PromptsStorage.local, type });
      }
    }
    if (type !== PromptsType.skill && type !== PromptsType.hook) {
      const userHome = this.userDataService.currentProfile.promptsHome;
      result.push({ uri: userHome, storage: PromptsStorage.user, type });
    }
    return result;
  }
  async getResolvedSourceFolders(type) {
    return this.fileLocator.getResolvedSourceFolders(type);
  }
  // slash prompt commands
  /**
   * Emitter for slash commands change events.
   */
  get onDidChangeSlashCommands() {
    return this.cachedSlashCommands.onDidChange;
  }
  async getPromptSlashCommands(token, sessionResource) {
    return await this.cachedSlashCommands.get(token);
  }
  async computePromptSlashCommands(token) {
    const promptFiles = await this.listPromptFiles(PromptsType.prompt, token);
    const useAgentSkills = this.configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS);
    const skills = useAgentSkills ? await this.listPromptFiles(PromptsType.skill, token) : [];
    const slashCommandFiles = [...promptFiles, ...skills];
    const details = await Promise.all(slashCommandFiles.map(async (promptPath) => {
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
    return command.match(/^[\p{L}\d_\-\.:]+$/u) !== null;
  }
  async resolvePromptSlashCommand(name, token) {
    const commands = await this.getPromptSlashCommands(token);
    return commands.find((cmd) => cmd.name === name);
  }
  asChatPromptSlashCommand(parsedPromptFile, promptPath) {
    let name = parsedPromptFile?.header?.name ?? promptPath.name ?? getCleanPromptName(promptPath.uri);
    name = name.replace(/[^\p{L}\d_\-\.:]+/gu, "-");
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
  async getCustomAgents(token, sessionResource) {
    const sw = StopWatch.create();
    const result = await this.cachedCustomAgents.get(token);
    if (sessionResource) {
      const elapsed = sw.elapsed();
      const discoveryInfo = await this.getAgentDiscoveryInfo(token);
      const details = result.length === 1 ? localize("promptsService.resolvedAgent", "Resolved {0} agent in {1}ms", result.length, elapsed.toFixed(1)) : localize("promptsService.resolvedAgents", "Resolved {0} agents in {1}ms", result.length, elapsed.toFixed(1));
      this._onDidLogDiscovery.fire({
        sessionResource,
        name: localize("promptsService.loadAgents", "Load Agents"),
        details,
        discoveryInfo,
        category: "discovery"
      });
    }
    return result;
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
        if (advanced && advanced.value.type === "map") {
          metadata = {};
          for (const [key, value] of Object.entries(advanced.value)) {
            if (value.type === "scalar") {
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
      const target = getTarget(PromptsType.agent, ast.header ?? uri);
      const source = IAgentSource.fromPromptPath(promptPath);
      if (!ast.header) {
        return { uri, name, agentInstructions, source, target, visibility: { userInvocable: true, agentInvocable: true } };
      }
      const visibility = {
        userInvocable: ast.header.userInvocable !== false,
        agentInvocable: ast.header.infer === true || ast.header.disableModelInvocation !== true
      };
      let model = ast.header.model;
      if (target === Target.Claude && model) {
        model = mapClaudeModels(model);
      }
      let { description, tools, handOffs, argumentHint, agents } = ast.header;
      if (target === Target.Claude && tools) {
        tools = mapClaudeTools(tools);
      }
      return { uri, name, description, model, tools, handOffs, argumentHint, target, visibility, agents, agentInstructions, source };
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
    const fileContent = await this.fileService.readFile(uri);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    return new PromptFileParser().parse(uri, fileContent.value.toString());
  }
  registerContributedFile(type, uri, extension, name, description, when) {
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
      return { uri, name, description, when, storage: PromptsStorage.extension, type, extension, source: ExtensionAgentSourceType.contribution };
    })();
    bucket.set(uri, entryPromise);
    if (when) {
      this._contributedWhenClauses.set(`${type}/${uri.toString()}`, when);
    }
    const flushCachesIfRequired = /* @__PURE__ */ __name(() => {
      this._updateContributedWhenKeys();
      this.cachedFileLocations[type] = void 0;
      switch (type) {
        case PromptsType.agent:
          this.cachedCustomAgents.refresh();
          break;
        case PromptsType.prompt:
          this.cachedSlashCommands.refresh();
          break;
        case PromptsType.skill:
          this.cachedSkills.refresh();
          this.cachedSlashCommands.refresh();
          break;
      }
    }, "flushCachesIfRequired");
    flushCachesIfRequired();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        bucket.delete(uri);
        this._contributedWhenClauses.delete(`${type}/${uri.toString()}`);
        flushCachesIfRequired();
      }, "dispose")
    };
  }
  _updateContributedWhenKeys() {
    this._contributedWhenKeys.clear();
    for (const whenClause of this._contributedWhenClauses.values()) {
      const expr = ContextKeyExpr.deserialize(whenClause);
      for (const key of expr?.keys() ?? []) {
        this._contributedWhenKeys.add(key);
      }
    }
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
      case PromptsStorage.plugin:
        return localize("plugin.capitalized", "Plugin");
      default:
        assertNever(promptPath, "Unknown prompt storage type");
    }
  }
  async listNestedAgentMDs(token) {
    const useAgentMD = this.configurationService.getValue(PromptsConfig.USE_AGENT_MD);
    if (!useAgentMD) {
      return [];
    }
    const useNestedAgentMD = this.configurationService.getValue(PromptsConfig.USE_NESTED_AGENT_MD);
    if (useNestedAgentMD) {
      return await this.fileLocator.findAgentMDsInWorkspace(token);
    }
    return [];
  }
  async listAgentMDs(token, logger) {
    const useAgentMD = this.configurationService.getValue(PromptsConfig.USE_AGENT_MD);
    if (!useAgentMD) {
      logger?.logInfo("Agent MD files are disabled via configuration.");
      return [];
    }
    return await this.fileLocator.findFilesInWorkspaceRoots(AGENT_MD_FILENAME, void 0, AgentFileType.agentsMd, token);
  }
  async listClaudeMDs(token, logger) {
    const useClaudeMD = this.configurationService.getValue(PromptsConfig.USE_CLAUDE_MD);
    if (!useClaudeMD) {
      logger?.logInfo("Claude MD files are disabled via configuration.");
      return [];
    }
    const results = [];
    const userHome = await this.pathService.userHome();
    const userClaudeFolder = joinPath(userHome, CLAUDE_CONFIG_FOLDER);
    await Promise.all([
      this.fileLocator.findFilesInWorkspaceRoots(CLAUDE_MD_FILENAME, void 0, AgentFileType.claudeMd, token, results),
      // in workspace roots
      this.fileLocator.findFilesInWorkspaceRoots(CLAUDE_LOCAL_MD_FILENAME, void 0, AgentFileType.claudeMd, token, results),
      // CLAUDE.local in workspace roots
      this.fileLocator.findFilesInWorkspaceRoots(CLAUDE_MD_FILENAME, CLAUDE_CONFIG_FOLDER, AgentFileType.claudeMd, token, results),
      // in workspace/.claude folders
      this.fileLocator.findFilesInRoots([userClaudeFolder], CLAUDE_MD_FILENAME, AgentFileType.claudeMd, token, results)
      // in ~/.claude folder
    ]);
    return results.sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
  }
  async listCopilotInstructionsMDs(token, logger) {
    const useCopilotInstructionsFiles = this.configurationService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES);
    if (!useCopilotInstructionsFiles) {
      logger?.logInfo("Copilot instructions files are disabled via configuration.");
      return [];
    }
    return await this.fileLocator.findCopilotInstructionsMDsInWorkspace(token);
  }
  async listAgentInstructions(token, logger) {
    const [agentMDs, claudeMDs, copilotInstructionsMDs] = await Promise.all([
      this.listAgentMDs(token, logger),
      this.listClaudeMDs(token, logger),
      this.listCopilotInstructionsMDs(token, logger)
    ]);
    if (token.isCancellationRequested) {
      return [];
    }
    const seenFileURI = new ResourceSet();
    const symlinks = [];
    const result = [];
    const add = /* @__PURE__ */ __name((file) => {
      if (file.realPath) {
        symlinks.push(file);
      } else {
        result.push(file);
        seenFileURI.add(file.uri);
      }
      return true;
    }, "add");
    agentMDs.forEach(add);
    claudeMDs.forEach(add);
    copilotInstructionsMDs.forEach(add);
    for (const symlink of symlinks) {
      if (seenFileURI.has(symlink.realPath)) {
        logger?.logInfo(`Skipping symlinked agent instructions file ${symlink.uri} as target already included: ${symlink.realPath}`);
      } else {
        result.push(symlink);
        seenFileURI.add(symlink.realPath);
      }
    }
    return result;
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
  get onDidChangeSkills() {
    return this.cachedSkills.onDidChange;
  }
  async findAgentSkills(token, sessionResource) {
    const useAgentSkills = this.configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS);
    if (!useAgentSkills) {
      return void 0;
    }
    const sw = StopWatch.create();
    const result = await this.cachedSkills.get(token);
    if (sessionResource) {
      const elapsed = sw.elapsed();
      const discoveryInfo = await this.getSkillDiscoveryInfo(token);
      const details = result.length === 1 ? localize("promptsService.resolvedSkill", "Resolved {0} skill in {1}ms", result.length, elapsed.toFixed(1)) : localize("promptsService.resolvedSkills", "Resolved {0} skills in {1}ms", result.length, elapsed.toFixed(1));
      this._onDidLogDiscovery.fire({
        sessionResource,
        name: localize("promptsService.loadSkills", "Load Skills"),
        details,
        discoveryInfo,
        category: "discovery"
      });
    }
    return result;
  }
  async computeAgentSkills(token) {
    const { files, skillsBySource } = await this.computeSkillDiscoveryInfo(token);
    const result = [];
    for (const file of files) {
      if (file.status === "loaded" && file.name) {
        const sanitizedDescription = this.truncateAgentSkillDescription(file.description, file.uri);
        result.push({
          uri: file.uri,
          storage: file.storage,
          name: file.name,
          description: sanitizedDescription,
          disableModelInvocation: file.disableModelInvocation ?? false,
          userInvocable: file.userInvocable ?? true
        });
      }
    }
    let skippedMissingName = 0;
    let skippedMissingDescription = 0;
    let skippedDuplicateName = 0;
    let skippedParseFailed = 0;
    let skippedNameMismatch = 0;
    for (const file of files) {
      if (file.status === "skipped") {
        switch (file.skipReason) {
          case "missing-name":
            skippedMissingName++;
            break;
          case "missing-description":
            skippedMissingDescription++;
            break;
          case "duplicate-name":
            skippedDuplicateName++;
            break;
          case "name-mismatch":
            skippedNameMismatch++;
            break;
          case "parse-error":
            skippedParseFailed++;
            break;
        }
      }
    }
    this.telemetryService.publicLog2("agentSkillsFound", {
      totalSkillsFound: result.length,
      claudePersonal: skillsBySource.get(PromptFileSource.ClaudePersonal) ?? 0,
      claudeWorkspace: skillsBySource.get(PromptFileSource.ClaudeWorkspace) ?? 0,
      copilotPersonal: skillsBySource.get(PromptFileSource.CopilotPersonal) ?? 0,
      githubWorkspace: skillsBySource.get(PromptFileSource.GitHubWorkspace) ?? 0,
      agentsPersonal: skillsBySource.get(PromptFileSource.AgentsPersonal) ?? 0,
      agentsWorkspace: skillsBySource.get(PromptFileSource.AgentsWorkspace) ?? 0,
      configWorkspace: skillsBySource.get(PromptFileSource.ConfigWorkspace) ?? 0,
      configPersonal: skillsBySource.get(PromptFileSource.ConfigPersonal) ?? 0,
      extensionContribution: skillsBySource.get(PromptFileSource.ExtensionContribution) ?? 0,
      extensionAPI: skillsBySource.get(PromptFileSource.ExtensionAPI) ?? 0,
      plugin: skillsBySource.get(PromptFileSource.Plugin) ?? 0,
      skippedDuplicateName,
      skippedMissingName,
      skippedMissingDescription,
      skippedNameMismatch,
      skippedParseFailed
    });
    return result;
  }
  async getHooks(token, sessionResource) {
    const sw = StopWatch.create();
    const result = await this.cachedHooks.get(token);
    if (sessionResource) {
      const elapsed = sw.elapsed();
      const hookCount = result ? Object.values(result.hooks).reduce((sum, arr) => sum + arr.length, 0) : 0;
      const discoveryInfo = await this.getHookDiscoveryInfo(token);
      const details = hookCount === 1 ? localize("promptsService.resolvedHook", "Resolved {0} hook in {1}ms", hookCount, elapsed.toFixed(1)) : localize("promptsService.resolvedHooks", "Resolved {0} hooks in {1}ms", hookCount, elapsed.toFixed(1));
      this._onDidLogDiscovery.fire({
        sessionResource,
        name: localize("promptsService.loadHooks", "Load Hooks"),
        details,
        discoveryInfo,
        category: "discovery"
      });
    }
    return result;
  }
  async getInstructionFiles(token, sessionResource) {
    const sw = StopWatch.create();
    const result = await this.listPromptFiles(PromptsType.instructions, token);
    if (sessionResource) {
      const elapsed = sw.elapsed();
      const discoveryInfo = await this.getInstructionsDiscoveryInfo(token);
      const details = result.length === 1 ? localize("promptsService.resolvedInstruction", "Resolved {0} instruction in {1}ms", result.length, elapsed.toFixed(1)) : localize("promptsService.resolvedInstructions", "Resolved {0} instructions in {1}ms", result.length, elapsed.toFixed(1));
      this._onDidLogDiscovery.fire({
        sessionResource,
        name: localize("promptsService.loadInstructions", "Load Instructions"),
        details,
        discoveryInfo,
        category: "discovery"
      });
    }
    return result;
  }
  async computeHooks(token) {
    const useChatHooks = this.configurationService.getValue(PromptsConfig.USE_CHAT_HOOKS);
    if (!useChatHooks) {
      return void 0;
    }
    const useClaudeHooks = this.configurationService.getValue(PromptsConfig.USE_CLAUDE_HOOKS);
    const hookFiles = await this.listPromptFiles(PromptsType.hook, token);
    this.logger.trace(`[PromptsService] Found ${hookFiles.length} hook file(s).`);
    const userHomeUri = await this.pathService.userHome();
    const userHome = userHomeUri.scheme === Schemas.file ? userHomeUri.fsPath : userHomeUri.path;
    let hasDisabledClaudeHooks = false;
    const collectedHooks = {
      [HookType.SessionStart]: [],
      [HookType.UserPromptSubmit]: [],
      [HookType.PreToolUse]: [],
      [HookType.PostToolUse]: [],
      [HookType.PreCompact]: [],
      [HookType.SubagentStart]: [],
      [HookType.SubagentStop]: [],
      [HookType.Stop]: []
    };
    const defaultFolder = this.workspaceService.getWorkspace().folders[0];
    for (const hookFile of hookFiles) {
      try {
        const content = await this.fileService.readFile(hookFile.uri);
        const json = parseJSONC(content.value.toString());
        const hookWorkspaceFolder = this.workspaceService.getWorkspaceFolder(hookFile.uri) ?? defaultFolder;
        const workspaceRootUri = hookWorkspaceFolder?.uri;
        const { format, hooks, disabledAllHooks } = parseHooksFromFile(hookFile.uri, json, workspaceRootUri, userHome);
        if (disabledAllHooks) {
          this.logger.trace(`[PromptsService] Skipping hook file with disableAllHooks: ${hookFile.uri}`);
          continue;
        }
        if (format === HookSourceFormat.Claude && useClaudeHooks === false) {
          const hasAnyCommands = [...hooks.values()].some(({ hooks: cmds }) => cmds.length > 0);
          if (hasAnyCommands) {
            hasDisabledClaudeHooks = true;
          }
          this.logger.trace(`[PromptsService] Skipping Claude hook file (disabled via setting): ${hookFile.uri}`);
          continue;
        }
        for (const [hookType, { hooks: commands }] of hooks) {
          for (const command of commands) {
            collectedHooks[hookType].push(command);
            this.logger.trace(`[PromptsService] Collected ${hookType} hook from ${hookFile.uri} (format: ${format})`);
          }
        }
      } catch (error) {
        this.logger.warn(`[PromptsService] Failed to parse hook file: ${hookFile.uri}`, error);
      }
    }
    const plugins = this.agentPluginService.plugins.get();
    for (const plugin of plugins) {
      for (const hook of plugin.hooks.get()) {
        collectedHooks[hook.type].push(...hook.hooks);
      }
    }
    const hasHooks = Object.values(collectedHooks).some((arr) => arr.length > 0);
    if (!hasHooks) {
      this.logger.trace("[PromptsService] No valid hooks collected.");
      return void 0;
    }
    const result = Object.fromEntries(Object.entries(collectedHooks).filter(([_, commands]) => commands.length > 0));
    this.logger.trace(`[PromptsService] Collected hooks: ${JSON.stringify(Object.keys(result))}`);
    return { hooks: result, hasDisabledClaudeHooks };
  }
  async getPromptDiscoveryInfo(type, token, sessionResource) {
    if (sessionResource) {
      this._onDidLogDiscovery.fire({
        sessionResource,
        name: localize("promptsService.discoveryStart", "Discovery {0} (Start)", type),
        category: "discovery"
      });
    }
    const files = [];
    let result;
    if (type === PromptsType.skill) {
      result = await this.getSkillDiscoveryInfo(token);
    } else if (type === PromptsType.agent) {
      result = await this.getAgentDiscoveryInfo(token);
    } else if (type === PromptsType.prompt) {
      result = await this.getPromptSlashCommandDiscoveryInfo(token);
    } else if (type === PromptsType.instructions) {
      result = await this.getInstructionsDiscoveryInfo(token);
    } else if (type === PromptsType.hook) {
      result = await this.getHookDiscoveryInfo(token);
    } else {
      result = { type, files };
    }
    const loadedCount = result.files.filter((f) => f.status === "loaded").length;
    const skippedCount = result.files.filter((f) => f.status === "skipped").length;
    if (!result.sourceFolders) {
      const sourceFolders = await this._collectSourceFolderDiagnostics(type, result.files.filter((f) => f.status === "loaded"));
      result = { ...result, sourceFolders };
    }
    if (sessionResource) {
      const details = localize("promptsService.discoveryResult", "{0} loaded, {1} skipped", loadedCount, skippedCount);
      this._onDidLogDiscovery.fire({
        sessionResource,
        name: localize("promptsService.discoveryEnd", "Discovery {0} (End)", type),
        details,
        discoveryInfo: result,
        category: "discovery"
      });
    }
    return result;
  }
  async getSkillDiscoveryInfo(token) {
    const useAgentSkills = this.configurationService.getValue(PromptsConfig.USE_AGENT_SKILLS);
    if (!useAgentSkills) {
      const allFiles = await this.listPromptFiles(PromptsType.skill, token);
      const files2 = allFiles.map((promptPath) => ({
        uri: promptPath.uri,
        storage: promptPath.storage,
        status: "skipped",
        skipReason: "disabled",
        extensionId: promptPath.extension?.identifier?.value
      }));
      const sourceFolders2 = await this._collectSourceFolderDiagnostics(PromptsType.skill, []);
      return { type: PromptsType.skill, files: files2, sourceFolders: sourceFolders2 };
    }
    const { files } = await this.computeSkillDiscoveryInfo(token);
    const sourceFolders = await this._collectSourceFolderDiagnostics(PromptsType.skill, files.filter((f) => f.status === "loaded"));
    return { type: PromptsType.skill, files, sourceFolders };
  }
  /**
   * Shared implementation for skill discovery used by both findAgentSkills and getSkillDiscoveryInfo.
   * Returns the discovery results and a map of skill counts by source type for telemetry.
   */
  async computeSkillDiscoveryInfo(token) {
    const files = [];
    const skillsBySource = /* @__PURE__ */ new Map();
    const seenNames = /* @__PURE__ */ new Set();
    const nameToUri = /* @__PURE__ */ new Map();
    const allSkills = [];
    const discoveredSkills = await this.fileLocator.findAgentSkills(token);
    const extensionSkills = await this.getExtensionPromptFiles(PromptsType.skill, token);
    const pluginSkills = this._pluginPromptFilesByType.get(PromptsType.skill) ?? [];
    allSkills.push(...discoveredSkills, ...extensionSkills.map((extPath) => ({
      fileUri: extPath.uri,
      storage: extPath.storage,
      source: extPath.source === ExtensionAgentSourceType.contribution ? PromptFileSource.ExtensionContribution : PromptFileSource.ExtensionAPI
    })), ...pluginSkills.map((p) => ({
      fileUri: p.uri,
      storage: p.storage,
      source: PromptFileSource.Plugin
    })));
    const getPriority = /* @__PURE__ */ __name((skill) => {
      if (skill.storage === PromptsStorage.local) {
        return 0;
      }
      if (skill.storage === PromptsStorage.user) {
        return 1;
      }
      if (skill.storage === PromptsStorage.plugin) {
        return 2;
      }
      if (skill.source === PromptFileSource.ExtensionAPI) {
        return 3;
      }
      if (skill.source === PromptFileSource.ExtensionContribution) {
        return 4;
      }
      return 5;
    }, "getPriority");
    allSkills.sort((a, b) => getPriority(a) - getPriority(b));
    const extensionIdByUri = /* @__PURE__ */ new Map();
    for (const extSkill of extensionSkills) {
      extensionIdByUri.set(extSkill.uri.toString(), extSkill.extension.identifier.value);
    }
    for (const skill of allSkills) {
      const uri = skill.fileUri;
      const storage = skill.storage;
      const source = skill.source;
      const extensionId = extensionIdByUri.get(uri.toString());
      try {
        const parsedFile = await this.parseNew(uri, token);
        const name = parsedFile.header?.name;
        if (!name) {
          this.logger.error(`[computeSkillDiscoveryInfo] Agent skill file missing name attribute: ${uri}`);
          files.push({ uri, storage, status: "skipped", skipReason: "missing-name", extensionId, source });
          continue;
        }
        const sanitizedName = this.truncateAgentSkillName(name, uri);
        const skillFolderUri = dirname(uri);
        const folderName = basename(skillFolderUri);
        if (sanitizedName !== folderName) {
          this.logger.error(`[computeSkillDiscoveryInfo] Agent skill name "${sanitizedName}" does not match folder name "${folderName}": ${uri}`);
          files.push({ uri, storage, status: "skipped", skipReason: "name-mismatch", name: sanitizedName, extensionId, source });
          continue;
        }
        if (seenNames.has(sanitizedName)) {
          this.logger.warn(`[computeSkillDiscoveryInfo] Skipping duplicate agent skill name: ${sanitizedName} at ${uri}`);
          files.push({ uri, storage, status: "skipped", skipReason: "duplicate-name", name: sanitizedName, duplicateOf: nameToUri.get(sanitizedName), extensionId, source });
          continue;
        }
        const description = parsedFile.header?.description;
        if (!description) {
          this.logger.error(`[computeSkillDiscoveryInfo] Agent skill file missing description attribute: ${uri}`);
          files.push({ uri, storage, status: "skipped", skipReason: "missing-description", name: sanitizedName, extensionId, source });
          continue;
        }
        seenNames.add(sanitizedName);
        nameToUri.set(sanitizedName, uri);
        const disableModelInvocation = parsedFile.header?.disableModelInvocation === true;
        const userInvocable = parsedFile.header?.userInvocable !== false;
        files.push({ uri, storage, status: "loaded", name: sanitizedName, description, extensionId, source, disableModelInvocation, userInvocable });
        skillsBySource.set(source, (skillsBySource.get(source) || 0) + 1);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.error(`[computeSkillDiscoveryInfo] Failed to validate Agent skill file: ${uri}`, msg);
        files.push({
          uri,
          storage,
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: msg,
          extensionId,
          source
        });
      }
    }
    return { files, skillsBySource };
  }
  async getAgentDiscoveryInfo(token) {
    const files = [];
    const disabledAgents = this.getDisabledPromptFiles(PromptsType.agent);
    const agentFiles = await this.listPromptFiles(PromptsType.agent, token);
    for (const promptPath of agentFiles) {
      const uri = promptPath.uri;
      const storage = promptPath.storage;
      const extensionId = promptPath.extension?.identifier?.value;
      if (disabledAgents.has(uri)) {
        files.push({ uri, storage, status: "skipped", skipReason: "disabled", extensionId });
        continue;
      }
      try {
        const ast = await this.parseNew(uri, token);
        const name = ast.header?.name ?? promptPath.name ?? getCleanPromptName(uri);
        files.push({ uri, storage, status: "loaded", name, extensionId });
      } catch (e) {
        files.push({
          uri,
          storage,
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: e instanceof Error ? e.message : String(e),
          extensionId
        });
      }
    }
    const sourceFolders = await this._collectSourceFolderDiagnostics(PromptsType.agent, files.filter((f) => f.status === "loaded"));
    return { type: PromptsType.agent, files, sourceFolders };
  }
  async getPromptSlashCommandDiscoveryInfo(token) {
    const files = [];
    const promptFiles = await this.listPromptFiles(PromptsType.prompt, token);
    for (const promptPath of promptFiles) {
      const uri = promptPath.uri;
      const storage = promptPath.storage;
      const extensionId = promptPath.extension?.identifier?.value;
      try {
        const parsedPromptFile = await this.parseNew(uri, token);
        const name = parsedPromptFile?.header?.name ?? promptPath.name ?? getCleanPromptName(uri);
        files.push({ uri, storage, status: "loaded", name, extensionId });
      } catch (e) {
        files.push({
          uri,
          storage,
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: e instanceof Error ? e.message : String(e),
          extensionId
        });
      }
    }
    const sourceFolders = await this._collectSourceFolderDiagnostics(PromptsType.prompt, files.filter((f) => f.status === "loaded"));
    return { type: PromptsType.prompt, files, sourceFolders };
  }
  async getInstructionsDiscoveryInfo(token) {
    const files = [];
    const instructionsFiles = await this.listPromptFiles(PromptsType.instructions, token);
    for (const promptPath of instructionsFiles) {
      const uri = promptPath.uri;
      const storage = promptPath.storage;
      const extensionId = promptPath.extension?.identifier?.value;
      try {
        const parsedPromptFile = await this.parseNew(uri, token);
        const name = parsedPromptFile?.header?.name ?? promptPath.name ?? getCleanPromptName(uri);
        files.push({ uri, storage, status: "loaded", name, extensionId });
      } catch (e) {
        files.push({
          uri,
          storage,
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: e instanceof Error ? e.message : String(e),
          extensionId
        });
      }
    }
    const sourceFolders = await this._collectSourceFolderDiagnostics(PromptsType.instructions, files.filter((f) => f.status === "loaded"));
    return { type: PromptsType.instructions, files, sourceFolders };
  }
  async getHookDiscoveryInfo(token) {
    const files = [];
    const userHomeUri = await this.pathService.userHome();
    const userHome = userHomeUri.scheme === Schemas.file ? userHomeUri.fsPath : userHomeUri.path;
    const useClaudeHooks = this.configurationService.getValue(PromptsConfig.USE_CLAUDE_HOOKS);
    const hookFiles = await this.listPromptFiles(PromptsType.hook, token);
    for (const promptPath of hookFiles) {
      const uri = promptPath.uri;
      const storage = promptPath.storage;
      const extensionId = promptPath.extension?.identifier?.value;
      const name = basename(uri);
      if (getHookSourceFormat(uri) === HookSourceFormat.Claude && useClaudeHooks === false) {
        files.push({
          uri,
          storage,
          status: "skipped",
          skipReason: "claude-hooks-disabled",
          name,
          extensionId
        });
        continue;
      }
      try {
        const content = await this.fileService.readFile(uri);
        const json = parseJSONC(content.value.toString());
        if (!json || typeof json !== "object") {
          files.push({
            uri,
            storage,
            status: "skipped",
            skipReason: "parse-error",
            errorMessage: "Invalid hooks file: must be a JSON object",
            name,
            extensionId
          });
          continue;
        }
        const hookWorkspaceFolder = this.workspaceService.getWorkspaceFolder(uri) ?? this.workspaceService.getWorkspace().folders[0];
        const workspaceRootUri = hookWorkspaceFolder?.uri;
        const { disabledAllHooks } = parseHooksFromFile(uri, json, workspaceRootUri, userHome);
        if (disabledAllHooks) {
          files.push({
            uri,
            storage,
            status: "skipped",
            skipReason: "all-hooks-disabled",
            name,
            extensionId
          });
          continue;
        }
        files.push({ uri, storage, status: "loaded", name, extensionId });
      } catch (e) {
        files.push({
          uri,
          storage,
          status: "skipped",
          skipReason: "parse-error",
          errorMessage: e instanceof Error ? e.message : String(e),
          name,
          extensionId
        });
      }
    }
    const sourceFolders = await this._collectSourceFolderDiagnostics(PromptsType.hook, files.filter((f) => f.status === "loaded"));
    return { type: PromptsType.hook, files, sourceFolders };
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
  __param(11, IWorkspaceContextService),
  __param(12, IPathService),
  __param(13, IContextKeyService),
  __param(14, IAgentPluginService)
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
    } else if (promptPath.storage === PromptsStorage.plugin) {
      return {
        storage: PromptsStorage.plugin,
        pluginUri: promptPath.pluginUri
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
