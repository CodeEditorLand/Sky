/**
 * @module Bootstrap/Types/Type/StatusUpdate
 * @description
 * Type defining real-time status updates during bootstrap.
 * Used to communicate progress to the UI.
 * @see {@link Bootstrap/Types/Type/ErrorSeverity} Error severity type
 * @see {@link Bootstrap/Types/Type/StageName} Stage name type
 * @category Type
 */
import type { StageName } from "./StageName.js";
/**
 * Status update interface
 */
export interface StatusUpdate {
    /** Stage this update is for */
    stage: StageName;
    /** Current status of the stage */
    status: "pending" | "running" | "success" | "error" | "warning";
    /** Human-readable status message */
    message: string;
    /** Progress percentage (0-100) */
    progress: number;
    /** Optional duration if completed */
    duration?: number;
    /** Optional error if status is error */
    error?: Error;
}
//# sourceMappingURL=StatusUpdate.d.ts.map