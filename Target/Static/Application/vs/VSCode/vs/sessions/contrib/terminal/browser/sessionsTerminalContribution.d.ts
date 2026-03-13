import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { ITerminalInstance, ITerminalService } from '../../../../workbench/contrib/terminal/browser/terminal.js';
import { IPathService } from '../../../../workbench/services/path/common/pathService.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
/**
 * Manages terminal instances in the sessions window, ensuring:
 * - A terminal exists for the active session's worktree (or repository if no worktree).
 * - Terminals are shown/hidden based on their initial cwd matching the active path.
 * - All terminals for a worktree are closed when the session is archived.
 */
export declare class SessionsTerminalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _sessionsManagementService;
    private readonly _terminalService;
    private readonly _agentSessionsService;
    private readonly _logService;
    private readonly _pathService;
    static readonly ID = "workbench.contrib.sessionsTerminal";
    private _activeKey;
    constructor(_sessionsManagementService: ISessionsManagementService, _terminalService: ITerminalService, _agentSessionsService: IAgentSessionsService, _logService: ILogService, _pathService: IPathService);
    /**
     * Ensures a terminal exists for the given cwd by scanning all terminal
     * instances for a matching initial cwd. If none is found, creates a new
     * one. Sets it as active and optionally focuses it.
     */
    ensureTerminal(cwd: URI, focus: boolean): Promise<ITerminalInstance[]>;
    private _onActiveSessionChanged;
    /**
     * Finds the first terminal instance whose initial cwd (lower-cased) matches
     * the given key.
     */
    private _findTerminalsForKey;
    /**
     * Shows background terminals whose initial cwd matches the active key and
     * hides foreground terminals whose initial cwd does not match.
     */
    private _updateTerminalVisibility;
    private _closeTerminalsForPath;
    dumpTracking(): Promise<void>;
    showAllTerminals(): Promise<void>;
}
