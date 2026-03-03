/**
 * @module Bootstrap/Types/VSCode/Interface/VSCodeLoggerService
 * @description
 * VSCode Logger Service Interface.
 * Provides logging capabilities with multiple log levels.
 * @see {@link Bootstrap/Types/VSCode/Type/VSCodeLoggerType} Related logger types
 * @category Interface
 */
import type { ILogger, ILoggerOptions } from "../Type/VSCodeLoggerType.js";
/**
 * VSCode Logger Service interface
 */
export interface IVSCodeLoggerService {
    _serviceBrand: undefined;
    createLogger(file: string, options?: ILoggerOptions): ILogger;
    getLogger(file: string): ILogger | undefined;
    dispose(): void;
}
//# sourceMappingURL=VSCodeLoggerService.d.ts.map