/**
 * @module Effect/Environment/Type/EnvironmentType
 * @description
 * Type definitions for the Environment service. Includes platform types,
 * architecture types, and the complete environment information interface.
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Usage context
 * @category Type
 */
/**
 * Platform type - supported operating systems
 */
export type Platform = "win32" | "darwin" | "linux" | "web";
/**
 * Architecture type - supported CPU architectures
 */
export type Architecture = "x64" | "arm64" | "arm" | "web";
/**
 * Complete environment information interface
 */
export interface EnvironmentInfo {
    readonly platform: Platform;
    readonly architecture: Architecture;
    readonly locale: string;
    readonly timezone: string;
    readonly userAgent: string;
    readonly isSecureContext: boolean;
    readonly language: string;
}
//# sourceMappingURL=EnvironmentType.d.ts.map