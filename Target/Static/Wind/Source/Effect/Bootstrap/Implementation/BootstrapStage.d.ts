/**
 * @module Effect/Bootstrap/Implementation/BootstrapStage
 * @description
 * Individual stage implementations for the bootstrap process.
 * Each stage is a standalone effect that can be composed.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Main orchestration
 * @category Implementation
 */
import { Effect } from "effect";
import { EnvironmentTag } from "../../Environment/index.js";
import { Configuration } from "../../Configuration.js";
import { MountainTag } from "../../Mountain.js";
import { HealthTag } from "../../Health.js";
/**
 * Stage 0: Environment detection
 * Detects platform, architecture, locale, and timezone.
 */
export declare const stage0_Environment: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, never, import("../../Telemetry.js").TelemetryTag | EnvironmentTag>, never, import("../../Telemetry.js").TelemetryTag>;
/**
 * Stage 1: Preload readiness
 * Waits for preload script to complete and globals to be available.
 */
export declare const stage1_Preload: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, import("../../../Types/Sandbox.js").SandboxNotReadyError, import("../../Telemetry.js").TelemetryTag | import("../../Sandbox.js").SandboxService>, never, import("../../Telemetry.js").TelemetryTag>;
/**
 * Stage 2: Configuration loading
 * Loads and applies configuration settings.
 */
export declare const stage2_Configuration: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, import("../../../Types/Sandbox.js").ConfigurationNotReadyError, import("../../Telemetry.js").TelemetryTag | Configuration>, never, import("../../Telemetry.js").TelemetryTag>;
/**
 * Stage 3: Services initialization
 * Connects to backend services (Mountain).
 */
export declare const stage3_Services: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, import("../../Mountain.js").MountainConnectionError, import("../../Telemetry.js").TelemetryTag | MountainTag>, never, import("../../Telemetry.js").TelemetryTag>;
/**
 * Stage 4: Preparation
 * Prepares workbench resources and assets.
 */
export declare const stage4_Preparation: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, never, import("../../Telemetry.js").TelemetryTag>, never, import("../../Telemetry.js").TelemetryTag>;
/**
 * Stage 5: Initialization
 * Initializes VSCode workbench and dispatches completion event.
 */
export declare const stage5_Initialization: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, never, import("../../Telemetry.js").TelemetryTag>, never, import("../../Telemetry.js").TelemetryTag>;
/**
 * Stage 6: Health check
 * Runs health checks on all services.
 */
export declare const stage6_HealthCheck: Effect.Effect<Effect.Effect<{
    stageName: string;
    success: boolean;
    duration: number;
    error: undefined;
}, never, import("../../Telemetry.js").TelemetryTag | HealthTag>, never, import("../../Telemetry.js").TelemetryTag>;
declare const _default: {
    stage0_Environment: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, never, import("../../Telemetry.js").TelemetryTag | EnvironmentTag>, never, import("../../Telemetry.js").TelemetryTag>;
    stage1_Preload: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, import("../../../Types/Sandbox.js").SandboxNotReadyError, import("../../Telemetry.js").TelemetryTag | import("../../Sandbox.js").SandboxService>, never, import("../../Telemetry.js").TelemetryTag>;
    stage2_Configuration: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, import("../../../Types/Sandbox.js").ConfigurationNotReadyError, import("../../Telemetry.js").TelemetryTag | Configuration>, never, import("../../Telemetry.js").TelemetryTag>;
    stage3_Services: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, import("../../Mountain.js").MountainConnectionError, import("../../Telemetry.js").TelemetryTag | MountainTag>, never, import("../../Telemetry.js").TelemetryTag>;
    stage4_Preparation: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, never, import("../../Telemetry.js").TelemetryTag>, never, import("../../Telemetry.js").TelemetryTag>;
    stage5_Initialization: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, never, import("../../Telemetry.js").TelemetryTag>, never, import("../../Telemetry.js").TelemetryTag>;
    stage6_HealthCheck: Effect.Effect<Effect.Effect<{
        stageName: string;
        success: boolean;
        duration: number;
        error: undefined;
    }, never, import("../../Telemetry.js").TelemetryTag | HealthTag>, never, import("../../Telemetry.js").TelemetryTag>;
};
export default _default;
//# sourceMappingURL=BootstrapStage.d.ts.map