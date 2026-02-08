import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../../../base/common/map.js';
import { URI } from '../../../../../../base/common/uri.js';
import { type ITextModel } from '../../../../../../editor/common/model.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IExtensionDescription } from '../../../../../../platform/extensions/common/extensions.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IExtensionService } from '../../../../../services/extensions/common/extensions.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { IFilesConfigurationService } from '../../../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IUserDataProfileService } from '../../../../../services/userDataProfile/common/userDataProfile.js';
import { IResolvedPromptSourceFolder } from '../config/promptFileLocations.js';
import { PromptsType } from '../promptTypes.js';
import { ParsedPromptFile } from '../promptFileParser.js';
import { IChatPromptSlashCommand, ICustomAgent, IPromptPath, IPromptsService, IAgentSkill, PromptsStorage, IPromptFileContext, IPromptFileResource, IPromptDiscoveryInfo } from './promptsService.js';
import { IChatRequestHooks } from '../hookSchema.js';
import { IWorkspaceContextService } from '../../../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../../../services/path/common/pathService.js';
/**
 * Error thrown when a skill file is missing the required name attribute.
 */
export declare class SkillMissingNameError extends Error {
    readonly uri: URI;
    constructor(uri: URI);
}
/**
 * Error thrown when a skill file is missing the required description attribute.
 */
export declare class SkillMissingDescriptionError extends Error {
    readonly uri: URI;
    constructor(uri: URI);
}
/**
 * Error thrown when a skill's name does not match its parent folder name.
 */
export declare class SkillNameMismatchError extends Error {
    readonly uri: URI;
    readonly skillName: string;
    readonly folderName: string;
    constructor(uri: URI, skillName: string, folderName: string);
}
/**
 * Provides prompt services.
 */
export declare class PromptsService extends Disposable implements IPromptsService {
    readonly logger: ILogService;
    private readonly labelService;
    private readonly modelService;
    private readonly instantiationService;
    private readonly userDataService;
    private readonly configurationService;
    private readonly fileService;
    private readonly filesConfigService;
    private readonly storageService;
    private readonly extensionService;
    private readonly telemetryService;
    private readonly workspaceService;
    private readonly pathService;
    readonly _serviceBrand: undefined;
    /**
     * Prompt files locator utility.
     */
    private readonly fileLocator;
    /**
     * Cached custom agents. Caching only happens if the `onDidChangeCustomAgents` event is used.
     */
    private readonly cachedCustomAgents;
    /**
     * Cached slash commands. Caching only happens if the `onDidChangeSlashCommands` event is used.
     */
    private readonly cachedSlashCommands;
    /**
     * Cached hooks. Invalidated when hook files change.
     */
    private readonly cachedHooks;
    /**
     * Cache for parsed prompt files keyed by URI.
     * The number in the returned tuple is textModel.getVersionId(), which is an internal VS Code counter that increments every time the text model's content changes.
     */
    private readonly cachedParsedPromptFromModels;
    /**
     * Cached file locations commands. Caching only happens if the corresponding `fileLocatorEvents` event is used.
     */
    private readonly cachedFileLocations;
    /**
     * Lazily created events that notify listeners when the file locations for a given prompt type change.
     * An event is created on demand for each prompt type and can be used by consumers to react to updates
     * in the set of prompt files (e.g., when prompt files are added, removed, or modified).
     */
    private readonly fileLocatorEvents;
    /**
     * Contributed files from extensions keyed by prompt type then name.
     */
    private readonly contributedFiles;
    constructor(logger: ILogService, labelService: ILabelService, modelService: IModelService, instantiationService: IInstantiationService, userDataService: IUserDataProfileService, configurationService: IConfigurationService, fileService: IFileService, filesConfigService: IFilesConfigurationService, storageService: IStorageService, extensionService: IExtensionService, telemetryService: ITelemetryService, workspaceService: IWorkspaceContextService, pathService: IPathService);
    private getFileLocatorEvent;
    getParsedPromptFile(textModel: ITextModel): ParsedPromptFile;
    listPromptFiles(type: PromptsType, token: CancellationToken): Promise<readonly IPromptPath[]>;
    private computeListPromptFiles;
    /**
     * Registry of prompt file provider instances (custom agents, instructions, prompt files).
     * Extensions can register providers via the proposed API.
     */
    private readonly promptFileProviders;
    /**
     * Registers a prompt file provider (CustomAgentProvider, InstructionsProvider, or PromptFileProvider).
     * This will be called by the extension host bridge when
     * an extension registers a provider via vscode.chat.registerCustomAgentProvider(),
     * registerInstructionsProvider(), or registerPromptFileProvider().
     */
    registerPromptFileProvider(extension: IExtensionDescription, type: PromptsType, provider: {
        onDidChangePromptFiles?: Event<void>;
        providePromptFiles: (context: IPromptFileContext, token: CancellationToken) => Promise<IPromptFileResource[] | undefined>;
    }): IDisposable;
    /**
     * Shared helper to list prompt files from registered providers for a given type.
     */
    private listFromProviders;
    listPromptFilesForStorage(type: PromptsType, storage: PromptsStorage, token: CancellationToken): Promise<readonly IPromptPath[]>;
    private getExtensionPromptFiles;
    private getProviderActivationEvent;
    getSourceFolders(type: PromptsType): Promise<readonly IPromptPath[]>;
    getResolvedSourceFolders(type: PromptsType): Promise<readonly IResolvedPromptSourceFolder[]>;
    /**
     * Emitter for slash commands change events.
     */
    get onDidChangeSlashCommands(): Event<void>;
    getPromptSlashCommands(token: CancellationToken): Promise<readonly IChatPromptSlashCommand[]>;
    private computePromptSlashCommands;
    isValidSlashCommandName(command: string): boolean;
    resolvePromptSlashCommand(name: string, token: CancellationToken): Promise<IChatPromptSlashCommand | undefined>;
    private asChatPromptSlashCommand;
    getPromptSlashCommandName(uri: URI, token: CancellationToken): Promise<string>;
    /**
     * Emitter for custom agents change events.
     */
    get onDidChangeCustomAgents(): Event<void>;
    getCustomAgents(token: CancellationToken): Promise<readonly ICustomAgent[]>;
    private computeCustomAgents;
    parseNew(uri: URI, token: CancellationToken): Promise<ParsedPromptFile>;
    registerContributedFile(type: PromptsType, uri: URI, extension: IExtensionDescription, name?: string, description?: string): Readonly<IDisposable>;
    getPromptLocationLabel(promptPath: IPromptPath): string;
    findAgentMDsInWorkspace(token: CancellationToken): Promise<URI[]>;
    listAgentMDs(token: CancellationToken, includeNested: boolean): Promise<URI[]>;
    listCopilotInstructionsMDs(token: CancellationToken): Promise<URI[]>;
    getAgentFileURIFromModeFile(oldURI: URI): URI | undefined;
    private readonly disabledPromptsStorageKeyPrefix;
    getDisabledPromptFiles(type: PromptsType): ResourceSet;
    setDisabledPromptFiles(type: PromptsType, uris: ResourceSet): void;
    private sanitizeAgentSkillText;
    /**
     * Validates and sanitizes a skill file. Throws an error if validation fails.
     * @returns The sanitized name and description
     */
    private validateAndSanitizeSkillFile;
    private truncateAgentSkillName;
    private truncateAgentSkillDescription;
    findAgentSkills(token: CancellationToken): Promise<IAgentSkill[] | undefined>;
    getHooks(token: CancellationToken): Promise<IChatRequestHooks | undefined>;
    private computeHooks;
    getPromptDiscoveryInfo(type: PromptsType, token: CancellationToken): Promise<IPromptDiscoveryInfo>;
    private getSkillDiscoveryInfo;
    /**
     * Shared implementation for skill discovery used by both findAgentSkills and getSkillDiscoveryInfo.
     * Returns the discovery results and a map of skill counts by source type for telemetry.
     */
    private computeSkillDiscoveryInfo;
    private getAgentDiscoveryInfo;
    private getPromptSlashCommandDiscoveryInfo;
    private getInstructionsDiscoveryInfo;
}
