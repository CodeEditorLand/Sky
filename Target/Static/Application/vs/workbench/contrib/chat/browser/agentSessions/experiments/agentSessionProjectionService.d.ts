import './media/agentsessionprojection.css';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { IEditorGroupsService } from '../../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IAgentSession } from '../agentSessionsModel.js';
import { IChatWidgetService } from '../../chat.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { IWorkbenchLayoutService } from '../../../../../services/layout/browser/layoutService.js';
import { IChatEditingService } from '../../../common/editing/chatEditingService.js';
import { IAgentTitleBarStatusService } from './agentTitleBarStatusService.js';
import { IAgentSessionsService } from '../agentSessionsService.js';
/**
 * Provider types that support agent session projection mode.
 * Only sessions from these providers will trigger projection mode.
 */
export declare const AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS: Set<string>;
export interface IAgentSessionProjectionService {
    readonly _serviceBrand: undefined;
    /**
     * Whether projection mode is active.
     */
    readonly isActive: boolean;
    /**
     * The currently active session in projection mode, if any.
     */
    readonly activeSession: IAgentSession | undefined;
    /**
     * Event fired when projection mode changes.
     */
    readonly onDidChangeProjectionMode: Event<boolean>;
    /**
     * Event fired when the active session changes (including when switching between sessions).
     */
    readonly onDidChangeActiveSession: Event<IAgentSession | undefined>;
    /**
     * Enter projection mode for the given session.
     */
    enterProjection(session: IAgentSession): Promise<void>;
    /**
     * Exit projection mode.
     * @param options.startNewChat If true (default), starts a new chat after exiting. Set to false to keep the current chat open.
     */
    exitProjection(options?: {
        startNewChat?: boolean;
    }): Promise<void>;
}
export declare const IAgentSessionProjectionService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentSessionProjectionService>;
export declare class AgentSessionProjectionService extends Disposable implements IAgentSessionProjectionService {
    private readonly configurationService;
    private readonly editorGroupsService;
    private readonly editorService;
    private readonly logService;
    private readonly chatWidgetService;
    private readonly chatSessionsService;
    private readonly layoutService;
    private readonly commandService;
    private readonly chatEditingService;
    private readonly agentTitleBarStatusService;
    private readonly agentSessionsService;
    readonly _serviceBrand: undefined;
    private _isActive;
    get isActive(): boolean;
    /** Prevents re-entrant exits and enter-on-exit races */
    private _isExiting;
    /** Prevents checkForEmptyEditors from exiting during session swaps */
    private _isSwappingSessions;
    private _activeSession;
    get activeSession(): IAgentSession | undefined;
    private readonly _onDidChangeProjectionMode;
    readonly onDidChangeProjectionMode: Event<boolean>;
    private readonly _onDidChangeActiveSession;
    readonly onDidChangeActiveSession: Event<IAgentSession | undefined>;
    private readonly _inProjectionModeContextKey;
    /** Working set saved when entering projection mode (to restore on exit) */
    private _preProjectionWorkingSet;
    /** Working sets per session, keyed by session resource URI string */
    private readonly _sessionWorkingSets;
    /** Whether the auxiliary bar was maximized when entering projection mode */
    private _wasAuxiliaryBarMaximized;
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, editorGroupsService: IEditorGroupsService, editorService: IEditorService, logService: ILogService, chatWidgetService: IChatWidgetService, chatSessionsService: IChatSessionsService, layoutService: IWorkbenchLayoutService, commandService: ICommandService, chatEditingService: IChatEditingService, agentTitleBarStatusService: IAgentTitleBarStatusService, agentSessionsService: IAgentSessionsService);
    private _isEnabled;
    private _checkForEmptyEditors;
    private _checkForInProgressSession;
    /**
     * Opens a session in the chat panel without entering projection mode.
     */
    private _openSessionInChatPanel;
    /**
     * Open the session's files in a multi-diff editor.
     * @returns true if any files were opened, false if nothing to display
     */
    private _openSessionFiles;
    enterProjection(session: IAgentSession): Promise<void>;
    exitProjection(options?: {
        startNewChat?: boolean;
    }): Promise<void>;
}
