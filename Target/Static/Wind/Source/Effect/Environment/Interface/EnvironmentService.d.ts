/**
 * @module Effect/Environment/Interface/EnvironmentService
 * @description
 * Service interface for environment detection and platform information.
 * Provides methods to detect platform, architecture, and environment settings.
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Implementation
 * @see {@link Effect/Environment/Tag/EnvironmentTag} Service tag
 * @category Interface
 */
import { Effect } from "effect";
import type { Platform, Architecture } from "../Type/EnvironmentType.js";
/**
 * Environment service interface
 */
export interface EnvironmentService {
    /** Get comprehensive environment information */
    readonly getInfo: Effect.Effect<{
        readonly platform: Platform;
        readonly architecture: Architecture;
        readonly locale: string;
        readonly timezone: string;
        readonly userAgent: string;
        readonly isSecureContext: boolean;
        readonly language: string;
    }, never>;
    /** Get platform type */
    readonly getPlatform: Effect.Effect<Platform, never>;
    /** Get architecture type */
    readonly getArchitecture: Effect.Effect<Architecture, never>;
    /** Check if running on Windows */
    readonly isWindows: Effect.Effect<boolean, never>;
    /** Check if running on macOS */
    readonly isMac: Effect.Effect<boolean, never>;
    /** Check if running on Linux */
    readonly isLinux: Effect.Effect<boolean, never>;
    /** Check if running in web environment */
    readonly isWeb: Effect.Effect<boolean, never>;
}
//# sourceMappingURL=EnvironmentService.d.ts.map