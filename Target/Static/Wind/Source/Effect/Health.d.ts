/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Replaces Bootstrap Stage6 - HealthCheck with Effect-based monitoring.
 * @category Service
 */
export type { HealthStatus, ServiceHealth, SystemHealth } from "./Health/index.js";
export type { HealthService } from "./Health/Interface/HealthService.js";
export { HealthTag } from "./Health/index.js";
export { CreateServiceHealth, CreateServiceHealthWithNoResponseTime, } from "./Health/index.js";
import { HealthLive as LiveLayer, HealthMock as MockLayer } from "./Health/Implementation/HealthImplementation.js";
export { LiveLayer, MockLayer };
export declare const HealthLive: import("effect/Layer").Layer<import("./Health.js").HealthTag, never, never>;
export declare const HealthMock: import("effect/Layer").Layer<import("./Health.js").HealthTag, never, never>;
//# sourceMappingURL=Health.d.ts.map