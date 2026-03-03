/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeLoggerType
 * @description
 * Logger-related types for VSCode logging service.
 * Includes log levels, logger options, and logger interface.
 * @see {@link Bootstrap/Types/VSCode/Interface/VSCodeLoggerService} Related service interface
 * @category Type
 */
import type { Event, IDisposable } from "./VSCodeCommonType.js";
/**
 * Log level enum
 * Defines the severity levels for logging
 */
export declare enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
    Critical = 5,
    Off = 6
}
/**
 * Logger options interface
 */
export interface ILoggerOptions {
    name?: string;
    logLevel?: LogLevel;
}
/**
 * Logger interface
 * Main logging interface used by VSCode
 */
export interface ILogger {
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    critical(message: string, ...args: any[]): void;
}
export type { Event, IDisposable };
//# sourceMappingURL=VSCodeLoggerType.d.ts.map