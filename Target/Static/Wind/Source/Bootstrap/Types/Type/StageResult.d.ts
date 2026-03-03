/**
 * @module Bootstrap/Types/Type/StageResult
 * @description
 * Type defining the result of a single bootstrap stage execution.
 * Contains success status, timing, and any data or errors from the stage.
 * @see {@link Bootstrap/Types/Type/StageName} Stage name type
 * @see {@link Bootstrap/Types/Type/BootstrapResult} Complete bootstrap result type
 * @category Type
 */
import type { StageName } from "./StageName.js";
/**
 * Stage result interface
 */
export interface StageResult {
    /** Whether the stage completed successfully */
    success: boolean;
    /** Name of the stage that was executed */
    stage: StageName;
    /** Duration in milliseconds */
    duration: number;
    /** Optional data returned from the stage */
    data?: any;
    /** Optional error if the stage failed */
    error?: Error;
    /** Whether failure is critical (halts bootstrap) */
    critical?: boolean;
    /** List of warnings (non-critical issues) */
    warnings?: string[];
}
//# sourceMappingURL=StageResult.d.ts.map