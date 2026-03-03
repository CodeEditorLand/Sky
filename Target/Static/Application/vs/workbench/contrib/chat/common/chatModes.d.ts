import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IOffsetRange } from '../../../../editor/common/core/ranges/offsetRange.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatAgentService } from './participants/chatAgents.js';
import { ChatModeKind } from './constants.js';
import { IHandOff } from './promptSyntax/promptFileParser.js';
import { ExtensionAgentSourceType, IAgentSource, ICustomAgent, ICustomAgentVisibility, IPromptsService, PromptsStorage, Target } from './promptSyntax/service/promptsService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export declare const IChatModeService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatModeService>;
export interface IChatModeService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeChatModes: Event<void>;
    getModes(): {
        builtin: readonly IChatMode[];
        custom: readonly IChatMode[];
    };
    findModeById(id: string): IChatMode | undefined;
    findModeByName(name: string): IChatMode | undefined;
}
export declare class ChatModeService extends Disposable implements IChatModeService {
    private readonly promptsService;
    private readonly chatAgentService;
    private readonly logService;
    private readonly storageService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private static readonly CUSTOM_MODES_STORAGE_KEY;
    private readonly hasCustomModes;
    private readonly agentModeDisabledByPolicy;
    private readonly _customModeInstances;
    private readonly _onDidChangeChatModes;
    readonly onDidChangeChatModes: Event<void>;
    constructor(promptsService: IPromptsService, chatAgentService: IChatAgentService, contextKeyService: IContextKeyService, logService: ILogService, storageService: IStorageService, configurationService: IConfigurationService);
    private loadCachedModes;
    private deserializeCachedModes;
    private saveCachedModes;
    private refreshCustomPromptModes;
    getModes(): {
        builtin: readonly IChatMode[];
        custom: readonly IChatMode[];
    };
    findModeById(id: string | ChatModeKind): IChatMode | undefined;
    findModeByName(name: string): IChatMode | undefined;
    private getBuiltinModes;
    private getCustomModes;
    private updateAgentModePolicyContextKey;
    private isAgentModeDisabledByPolicy;
}
export interface IChatModeData {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly kind: ChatModeKind;
    readonly customTools?: readonly string[];
    readonly model?: readonly string[] | string;
    readonly argumentHint?: string;
    readonly modeInstructions?: IChatModeInstructions;
    readonly body?: string;
    readonly handOffs?: readonly IHandOff[];
    readonly uri?: URI;
    readonly source?: IChatModeSourceData;
    readonly target?: Target;
    readonly visibility?: ICustomAgentVisibility;
    readonly agents?: readonly string[];
    readonly infer?: boolean;
}
export interface IChatMode {
    readonly id: string;
    readonly name: IObservable<string>;
    readonly label: IObservable<string>;
    readonly icon: IObservable<ThemeIcon | undefined>;
    readonly description: IObservable<string | undefined>;
    readonly isBuiltin: boolean;
    readonly kind: ChatModeKind;
    readonly customTools?: IObservable<readonly string[] | undefined>;
    readonly handOffs?: IObservable<readonly IHandOff[] | undefined>;
    readonly model?: IObservable<readonly string[] | undefined>;
    readonly argumentHint?: IObservable<string | undefined>;
    readonly modeInstructions?: IObservable<IChatModeInstructions>;
    readonly uri?: IObservable<URI>;
    readonly source?: IAgentSource;
    readonly target: IObservable<Target>;
    readonly visibility?: IObservable<ICustomAgentVisibility | undefined>;
    readonly agents?: IObservable<readonly string[] | undefined>;
}
export interface IVariableReference {
    readonly name: string;
    readonly range: IOffsetRange;
}
export interface IChatModeInstructions {
    readonly content: string;
    readonly toolReferences: readonly IVariableReference[];
    readonly metadata?: Record<string, boolean | string | number>;
}
export declare class CustomChatMode implements IChatMode {
    private readonly _nameObservable;
    private readonly _descriptionObservable;
    private readonly _customToolsObservable;
    private readonly _modeInstructions;
    private readonly _uriObservable;
    private readonly _modelObservable;
    private readonly _argumentHintObservable;
    private readonly _handoffsObservable;
    private readonly _targetObservable;
    private readonly _visibilityObservable;
    private readonly _agentsObservable;
    private _source;
    readonly id: string;
    get name(): IObservable<string>;
    get description(): IObservable<string | undefined>;
    get icon(): IObservable<ThemeIcon | undefined>;
    get isBuiltin(): boolean;
    get customTools(): IObservable<readonly string[] | undefined>;
    get model(): IObservable<readonly string[] | undefined>;
    get argumentHint(): IObservable<string | undefined>;
    get modeInstructions(): IObservable<IChatModeInstructions>;
    get uri(): IObservable<URI>;
    get label(): IObservable<string>;
    get handOffs(): IObservable<readonly IHandOff[] | undefined>;
    get source(): IAgentSource;
    get target(): IObservable<Target>;
    get visibility(): IObservable<ICustomAgentVisibility | undefined>;
    get agents(): IObservable<readonly string[] | undefined>;
    readonly kind = ChatModeKind.Agent;
    constructor(customChatMode: ICustomAgent);
    /**
     * Updates the underlying data and triggers observable changes
     */
    updateData(newData: ICustomAgent): void;
    toJSON(): IChatModeData;
}
type IChatModeSourceData = {
    readonly storage: PromptsStorage.extension;
    readonly extensionId: string;
    type?: ExtensionAgentSourceType;
} | {
    readonly storage: PromptsStorage.local | PromptsStorage.user;
} | {
    readonly storage: PromptsStorage.plugin;
    readonly pluginUri: URI;
};
export declare class BuiltinChatMode implements IChatMode {
    readonly kind: ChatModeKind;
    readonly name: IObservable<string>;
    readonly label: IObservable<string>;
    readonly description: IObservable<string>;
    readonly icon: IObservable<ThemeIcon>;
    readonly target: IObservable<Target>;
    constructor(kind: ChatModeKind, label: string, description: string, icon: ThemeIcon);
    get isBuiltin(): boolean;
    get id(): string;
    /**
     * Getters are not json-stringified
     */
    toJSON(): IChatModeData;
}
export declare namespace ChatMode {
    const Ask: BuiltinChatMode;
    const Edit: BuiltinChatMode;
    const Agent: BuiltinChatMode;
}
export declare function isBuiltinChatMode(mode: IChatMode): boolean;
/**
 * Returns a telemetry-safe mode name. User/local mode names are hashed
 * to avoid leaking PII; builtin and extension mode names are returned as-is.
 */
export declare function getModeNameForTelemetry(mode: IChatMode): string;
export {};
