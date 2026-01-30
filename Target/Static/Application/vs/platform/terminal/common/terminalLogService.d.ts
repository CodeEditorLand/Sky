import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { ILoggerService, LogLevel } from '../../log/common/log.js';
import { ITerminalLogService } from './terminal.js';
import { IWorkspaceContextService } from '../../workspace/common/workspace.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
export declare class TerminalLogService extends Disposable implements ITerminalLogService {
    private readonly _loggerService;
    _serviceBrand: undefined;
    _logBrand: undefined;
    private readonly _logger;
    private _workspaceId;
    get onDidChangeLogLevel(): Event<LogLevel>;
    constructor(_loggerService: ILoggerService, workspaceContextService: IWorkspaceContextService, environmentService: IEnvironmentService);
    getLevel(): LogLevel;
    setLevel(level: LogLevel): void;
    flush(): void;
    trace(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string | Error, ...args: unknown[]): void;
    private _formatMessage;
}
