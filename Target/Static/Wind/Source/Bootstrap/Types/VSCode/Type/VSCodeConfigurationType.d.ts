/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeConfigurationType
 * @description
 * Configuration-related types for VSCode service.
 * Includes event types and configuration target enum.
 * @see {@link Bootstrap/Types/VSCode/Interface/VSCodeConfigurationService} Related service interface
 * @category Type
 */
import type { URI } from "./VSCodeUtilityType.js";
/**
 * Event type definition
 */
export interface Event<T> {
    (listener: (e: T) => any): IDisposable;
}
/**
 * Disposable interface
 */
export interface IDisposable {
    dispose(): void;
}
/**
 * Configuration change event interface
 */
export interface IConfigurationChangeEvent {
    affectsConfiguration(section: string, resource?: URI): boolean;
}
/**
 * Configuration change event interface
 */
export interface IConfigurationChangeEvent {
    affectsConfiguration(section: string, resource?: URI): boolean;
}
/**
 * Configuration target enum
 */
export declare enum ConfigurationTarget {
    USER = 1,
    WORKSPACE = 2,
    WORKSPACE_FOLDER = 3,
    DEFAULT = 4,
    MEMORY = 5
}
//# sourceMappingURL=VSCodeConfigurationType.d.ts.map