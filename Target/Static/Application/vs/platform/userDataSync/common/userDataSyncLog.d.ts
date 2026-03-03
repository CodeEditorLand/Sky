import { IEnvironmentService } from '../../environment/common/environment.js';
import { AbstractLogger, ILoggerService } from '../../log/common/log.js';
import { IUserDataSyncLogService } from './userDataSync.js';
export declare class UserDataSyncLogService extends AbstractLogger implements IUserDataSyncLogService {
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
