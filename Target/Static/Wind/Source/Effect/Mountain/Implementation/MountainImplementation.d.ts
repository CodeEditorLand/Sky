/**
 * @module Effect/Mountain/Implementation/MountainImplementation
 * @description
 * Main implementation of Mountain service with connection management and sync.
 * Provides production-ready implementation with telemetry and background sync.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */
import { Layer } from "effect";
import { MountainTag } from "../Tag/MountainTag.js";
import { Configuration } from "../../Configuration.js";
/**
 * Live implementation layer for Mountain service.
 * Provides reactive connection management with automatic retry and background sync.
 */
export declare const MountainLive: Layer.Layer<MountainTag, never, import("../../Telemetry.js").TelemetryTag | Configuration | import("../../IPC.js").IPCTag>;
export default MountainLive;
//# sourceMappingURL=MountainImplementation.d.ts.map