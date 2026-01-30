import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { AbstractLogger, ILoggerService } from '../../../../platform/log/common/log.js';
import { IEditSessionsLogService } from './editSessions.js';
export declare class EditSessionsLogService extends AbstractLogger implements IEditSessionsLogService {
    readonly _serviceBrand: undefined;
    private readonly logger;
    constructor(loggerService: ILoggerService, environmentService: IEnvironmentService);
    trace(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string | Error, ...args: unknown[]): void;
    flush(): void;
}
