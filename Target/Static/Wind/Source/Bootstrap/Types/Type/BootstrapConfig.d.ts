/**
 * @module Bootstrap/Types/Type/BootstrapConfig
 * @description
 * Type defining configuration options for the bootstrap process.
 * Controls behavior during application initialization.
 * @category Type
 */
/**
 * Bootstrap configuration interface
 */
export interface BootstrapConfig {
    /** Enable debug mode for detailed output */
    debugMode: boolean;
    /** Enable verbose logging */
    verboseLogging: boolean;
    /** Show status UI during bootstrap */
    showStatusUI: boolean;
    /** Pause between stages for debugging */
    pauseBetweenStages: boolean;
    /** Enable performance tracking and metrics */
    enablePerformanceTracking: boolean;
}
//# sourceMappingURL=BootstrapConfig.d.ts.map