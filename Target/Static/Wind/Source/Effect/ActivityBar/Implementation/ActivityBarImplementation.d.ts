/**
 * @module Effect/ActivityBar/Implementation/ActivityBarImplementation
 * @description
 * Main implementation of ActivityBar service using reactive subscriptions.
 * Provides production-ready implementation with telemetry support.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */
import { Layer } from "effect";
import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
/**
 * Live implementation layer for ActivityBar service.
 * Provides in-memory storage with reactive state management.
 */
export declare const ActivityBarLive: Layer.Layer<ActivityBarTag, never, import("../../Telemetry.js").TelemetryTag>;
export default ActivityBarLive;
//# sourceMappingURL=ActivityBarImplementation.d.ts.map