import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IChatSessionProviderOptionGroup, IChatSessionProviderOptionItem, IChatSessionsService } from '../../../../workbench/contrib/chat/common/chatSessionsService.js';
import { IsolationMode } from './sessionTargetPicker.js';
import { AgentSessionProviders } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatRequestVariableEntry } from '../../../../workbench/contrib/chat/common/attachments/chatVariableEntries.js';
import { IChatMode } from '../../../../workbench/contrib/chat/common/chatModes.js';
export type NewSessionChangeType = 'repoUri' | 'isolationMode' | 'branch' | 'options' | 'disabled' | 'agent';
/**
 * Represents a resolved option group with its current selected value.
 */
export interface ISessionOptionGroup {
    readonly group: IChatSessionProviderOptionGroup;
    readonly value: IChatSessionProviderOptionItem | undefined;
}
/**
 * A new session represents a session being configured before the first
 * request is sent. It holds the user's selections (repoUri, isolationMode)
 * and fires a single event when any property changes.
 */
export interface INewSession extends IDisposable {
    readonly resource: URI;
    readonly target: AgentSessionProviders;
    readonly repoUri: URI | undefined;
    readonly isolationMode: IsolationMode;
    readonly branch: string | undefined;
    readonly modelId: string | undefined;
    readonly mode: IChatMode | undefined;
    readonly query: string | undefined;
    readonly attachedContext: IChatRequestVariableEntry[] | undefined;
    readonly selectedOptions: ReadonlyMap<string, IChatSessionProviderOptionItem>;
    readonly disabled: boolean;
    readonly onDidChange: Event<NewSessionChangeType>;
    setRepoUri(uri: URI): void;
    setIsolationMode(mode: IsolationMode): void;
    setBranch(branch: string | undefined): void;
    setModelId(modelId: string | undefined): void;
    setMode(mode: IChatMode | undefined): void;
    setQuery(query: string): void;
    setAttachedContext(context: IChatRequestVariableEntry[] | undefined): void;
    setOption(optionId: string, value: IChatSessionProviderOptionItem | string): void;
}
/**
 * Local new session for Background agent sessions.
 * Fires `onDidChange` for both `repoUri` and `isolationMode` changes.
 * Notifies the extension service with session options for each property change.
 */
export declare class LocalNewSession extends Disposable implements INewSession {
    readonly resource: URI;
    private readonly chatSessionsService;
    private readonly logService;
    private _repoUri;
    private _isolationMode;
    private _branch;
    private _modelId;
    private _mode;
    private _query;
    private _attachedContext;
    private readonly _onDidChange;
    readonly onDidChange: Event<NewSessionChangeType>;
    readonly target = AgentSessionProviders.Background;
    readonly selectedOptions: Map<string, IChatSessionProviderOptionItem>;
    get repoUri(): URI | undefined;
    get isolationMode(): IsolationMode;
    get branch(): string | undefined;
    get modelId(): string | undefined;
    get mode(): IChatMode | undefined;
    get query(): string | undefined;
    get attachedContext(): IChatRequestVariableEntry[] | undefined;
    get disabled(): boolean;
    constructor(resource: URI, defaultRepoUri: URI | undefined, chatSessionsService: IChatSessionsService, logService: ILogService);
    setRepoUri(uri: URI): void;
    setIsolationMode(mode: IsolationMode): void;
    setBranch(branch: string | undefined): void;
    setModelId(modelId: string | undefined): void;
    setMode(mode: IChatMode | undefined): void;
    setQuery(query: string): void;
    setAttachedContext(context: IChatRequestVariableEntry[] | undefined): void;
    setOption(optionId: string, value: IChatSessionProviderOptionItem | string): void;
}
/**
 * Remote new session for Cloud agent sessions.
 * Manages extension-driven option groups (models, etc.) and their values.
 * Fires events for option group changes.
 */
export declare class RemoteNewSession extends Disposable implements INewSession {
    readonly resource: URI;
    readonly target: AgentSessionProviders;
    private readonly chatSessionsService;
    private readonly contextKeyService;
    private readonly logService;
    private _repoUri;
    private _modelId;
    private _query;
    private _attachedContext;
    private readonly _onDidChange;
    readonly onDidChange: Event<NewSessionChangeType>;
    private readonly _onDidChangeOptionGroups;
    readonly onDidChangeOptionGroups: Event<void>;
    readonly selectedOptions: Map<string, IChatSessionProviderOptionItem>;
    get repoUri(): URI | undefined;
    get isolationMode(): IsolationMode;
    get branch(): string | undefined;
    get modelId(): string | undefined;
    get mode(): IChatMode | undefined;
    get query(): string | undefined;
    get attachedContext(): IChatRequestVariableEntry[] | undefined;
    get disabled(): boolean;
    private readonly _whenClauseKeys;
    constructor(resource: URI, target: AgentSessionProviders, chatSessionsService: IChatSessionsService, contextKeyService: IContextKeyService, logService: ILogService);
    setRepoUri(uri: URI): void;
    setIsolationMode(_mode: IsolationMode): void;
    setBranch(_branch: string | undefined): void;
    setModelId(modelId: string | undefined): void;
    setMode(_mode: IChatMode | undefined): void;
    setQuery(query: string): void;
    setAttachedContext(context: IChatRequestVariableEntry[] | undefined): void;
    setOption(optionId: string, value: IChatSessionProviderOptionItem | string): void;
    getModelOptionGroup(): ISessionOptionGroup | undefined;
    getOtherOptionGroups(): ISessionOptionGroup[];
    getOptionValue(groupId: string): IChatSessionProviderOptionItem | undefined;
    setOptionValue(groupId: string, value: IChatSessionProviderOptionItem): void;
    private _getOptionGroups;
    private _isOptionGroupVisible;
    private _updateWhenClauseKeys;
    private _getValueForGroup;
}
