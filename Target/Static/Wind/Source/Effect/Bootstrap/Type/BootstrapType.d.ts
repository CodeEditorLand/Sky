/**
 * @module Effect/Bootstrap/Type/BootstrapType
 * @description
 * Type definitions for bootstrap orchestration.
 * Defines options, results, and stage result types.
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface using these types
 * @see [Effect-TS Types](https://effect.website/docs/guide/type-system)
 * @category Type
 */
/**
 * Options for configuring bootstrap behavior.
 */
export interface BootstrapOptions {
    /** Enable debug mode for detailed logging */
    readonly debugMode?: boolean;
    /** Enable verbose logging output */
    readonly verboseLogging?: boolean;
    /** Pause between stages for debugging */
    readonly pauseBetweenStages?: boolean;
    /** Track performance metrics */
    readonly enablePerformanceTracking?: boolean;
    /** Skip health check stage */
    readonly skipHealthCheck?: boolean;
}
/**
 * Result of a single bootstrap stage execution.
 */
export interface StageResult {
    /** Name of the stage that was executed */
    readonly stageName: string;
    /** Whether the stage completed successfully */
    readonly success: boolean;
    /** Duration of stage execution in milliseconds */
    readonly duration: number;
    /** Error if stage failed, undefined otherwise */
    readonly error: Error | undefined;
}
/**
 * Complete result of bootstrap execution.
 */
export interface BootstrapResult {
    /** Whether bootstrap completed successfully */
    readonly success: boolean;
    /** Total duration of bootstrap in milliseconds */
    readonly totalDuration: number;
    /** Results from each stage */
    readonly stages: ReadonlyArray<StageResult>;
    /** Overall error if bootstrap failed */
    readonly error: Error | undefined;
}
//# sourceMappingURL=BootstrapType.d.ts.map