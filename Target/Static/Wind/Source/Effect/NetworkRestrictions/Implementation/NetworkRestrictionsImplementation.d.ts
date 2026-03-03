/**
 * @module Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation
 * @description
 * Main implementation of the NetworkRestrictions service. Provides a live layer
 * that blocks all external network traffic from VSCode workbench and extensions.
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @see {@link Effect/NetworkRestrictions/Tag/NetworkRestrictionsTag} Service tag
 * @category Implementation
 * @example
 * ```typescript
 * import { NetworkRestrictionsLive } from "./Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const restrictions = yield* NetworkRestrictions;
 *   const isAllowed = yield* restrictions.checkURL("https://api.example.com");
 *   console.log("Is allowed:", isAllowed);
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(NetworkRestrictionsLive)));
 * ```
 */
import { Layer } from "effect";
/**
 * Live layer for NetworkRestrictions service
 * Provides a complete implementation that blocks external network traffic
 */
export declare const NetworkRestrictionsLive: Layer.Layer<import("../Tag/NetworkRestrictionsTag.js").NetworkRestrictionsTag, never, import("../../Telemetry.js").TelemetryTag>;
export default NetworkRestrictionsLive;
//# sourceMappingURL=NetworkRestrictionsImplementation.d.ts.map