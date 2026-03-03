import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { ITerminalService } from '../../../../workbench/contrib/terminal/browser/terminal.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
/**
 * Manages terminal instances in the sessions window, ensuring:
 * - A terminal exists for the active session's worktree (or repository if no worktree).
 * - A path→instanceId mapping tracks which terminal belongs to which worktree.
 * - All terminals for a worktree are closed when the session is archived.
 */
export declare class SessionsTerminalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _sessionsManagementService;
    private readonly _terminalService;
    private readonly _agentSessionsService;
    private readonly _logService;
    static readonly ID = "workbench.contrib.sessionsTerminal";
    /** Maps worktree/repository fsPath (lower-cased) to the terminal instance id. */
    private readonly _pathToInstanceId;
    private _lastTargetFsPath;
    constructor(_sessionsManagementService: ISessionsManagementService, _terminalService: ITerminalService, _agentSessionsService: IAgentSessionsService, _logService: ILogService);
    /**
     * Ensures a terminal exists for the given cwd, reusing an existing one
     * from the mapping or creating a new one. Sets it as active and optionally
     * focuses it.
     */
    ensureTerminal(cwd: URI, focus: boolean): Promise<void>;
    private _onActivePathChanged;
    private _closeTerminalsForPath;
}
