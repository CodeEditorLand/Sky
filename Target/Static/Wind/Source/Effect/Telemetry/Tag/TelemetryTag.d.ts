/**
 * @module Effect/Telemetry/Tag/TelemetryTag
 * @description
 * Service tag for Telemetry dependency injection.
 * Provides the Context.Tag for accessing Telemetry service in Effect programs.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live implementation
 * @category Tag
 */
import { Context } from "effect";
import type { TelemetryService } from "../Interface/TelemetryService.js";
declare const TelemetryTag_base: Context.TagClass<TelemetryTag, "Telemetry", TelemetryService>;
/**
 * Context.Tag for Telemetry service dependency injection.
 * Use this tag to access Telemetry in Effect programs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { Telemetry } from "./Effect/Telemetry/Tag/TelemetryTag.js";
 *
 * const logMessage = Effect.gen(function* () {
 *   const telemetry = yield* Telemetry;
 *   return yield* telemetry.log("info", "System started");
 * });
 * ```
 */
export default class TelemetryTag extends TelemetryTag_base {
}
/**
 * Alias for TelemetryTag for shorter import paths.
 */
export declare const Telemetry: typeof TelemetryTag;
export {};
//# sourceMappingURL=TelemetryTag.d.ts.map