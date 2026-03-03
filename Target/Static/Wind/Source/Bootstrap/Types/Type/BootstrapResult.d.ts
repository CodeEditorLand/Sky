/**
 * @module Bootstrap/Types/Type/BootstrapResult
 * @description
 * Type defining the complete result of the bootstrap process.
 * Aggregates results from all bootstrap stages.
 * @see {@link Bootstrap/Types/Type/StageResult} Individual stage result type
 * @category Type
 */
import type { StageResult } from "./StageResult.js";
/**
 * Bootstrap result interface
 */
export interface BootstrapResult {
    /** Whether the entire bootstrap process succeeded */
    success: boolean;
    /** Results from each individual stage */
    results: StageResult[];
    /** Total duration of all stages in milliseconds */
    totalDuration: number;
}
//# sourceMappingURL=BootstrapResult.d.ts.map