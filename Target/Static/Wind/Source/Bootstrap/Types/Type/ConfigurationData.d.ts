/**
 * @module Bootstrap/Types/Type/ConfigurationData
 * @description
 * Type defining application configuration data.
 * Contains window identifiers, paths, and system information.
 * @category Type
 */
/**
 * Configuration data interface
 */
export interface ConfigurationData {
    /** Unique window identifier */
    windowId: string;
    /** Unique machine identifier */
    machineId: string;
    /** Unique session identifier */
    sessionId: string;
    /** Application root directory path */
    appRoot: string;
    /** User data directory path */
    userDataPath: string;
    /** Platform string */
    platform: string;
    /** System architecture */
    arch: string;
    /** Logging level */
    logLevel: number;
    /** Additional configuration properties */
    [key: string]: any;
}
//# sourceMappingURL=ConfigurationData.d.ts.map