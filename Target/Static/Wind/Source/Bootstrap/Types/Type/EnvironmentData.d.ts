/**
 * @module Bootstrap/Types/Type/EnvironmentData
 * @description
 * Type defining environment detection data collected during bootstrap.
 * Contains platform, mode, and localization information.
 * @see {@link Bootstrap/Types/Type/Platform} Platform type
 * @see {@link Bootstrap/Types/Type/Mode} Mode type
 * @category Type
 */
import type { Mode } from "./Mode.js";
import type { Platform } from "./Platform.js";
/**
 * Environment data interface
 */
export interface EnvironmentData {
    /** Runtime platform */
    platform: Platform;
    /** Execution mode */
    mode: Mode;
    /** Browser user agent string */
    userAgent: string;
    /** Browser/system language */
    language: string;
    /** System timezone */
    timezone: string;
}
//# sourceMappingURL=EnvironmentData.d.ts.map