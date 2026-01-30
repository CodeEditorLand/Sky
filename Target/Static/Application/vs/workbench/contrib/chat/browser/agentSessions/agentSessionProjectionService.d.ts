import './media/agentSessionProjection.css';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IAgentSession } from './agentSessionsModel.js';
import { IChatWidgetService } from '../chat.js';
import { IChatSessionsService } from '../../common/chatSessionsService.js';
import { IWorkbenchLayoutService } from '../../../../services/layout/browser/layoutService.js';
import { IChatEditingService } from '../../common/editing/chatEditingService.js';
import { IAgentStatusService } from './agentStatusService.js';
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
     */
    exitProjection(): Promise<void>;
}
export declare const IAgentSessionProjectionService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAgentSessionProjectionService>;
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
    private readonly agentStatusService;
    readonly _serviceBrand: undefined;
    private _isActive;
    get isActive(): boolean;
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
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, editorGroupsService: IEditorGroupsService, editorService: IEditorService, logService: ILogService, chatWidgetService: IChatWidgetService, chatSessionsService: IChatSessionsService, layoutService: IWorkbenchLayoutService, commandService: ICommandService, chatEditingService: IChatEditingService, agentStatusService: IAgentStatusService);
    private _isEnabled;
    private _checkForEmptyEditors;
    /**
     * Open the session's files in a multi-diff editor.
     * @returns true if any files were opened, false if nothing to display
     */
    private _openSessionFiles;
    enterProjection(session: IAgentSession): Promise<void>;
    exitProjection(): Promise<void>;
}
