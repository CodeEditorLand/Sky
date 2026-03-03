/**
 * @module Effect/Health
 * @description
 * Health monitoring service for checking service availability and system health.
 * Replaces Bootstrap Stage6 - HealthCheck with Effect-based monitoring.
 * @category Service
 */
export type { HealthStatus, ServiceHealth, SystemHealth } from "./Type/HealthType.js";
export type { HealthService } from "./Interface/HealthService.js";
export { HealthTag } from "./Tag/HealthTag.js";
export { CreateServiceHealth, CreateServiceHealthWithNoResponseTime } from "./Implementation/HealthHelper.js";
export { makeHealthChecker, makeMockHealth } from "./Implementation/HealthImplementation.js";
export { HealthLive, HealthMock } from "./Implementation/HealthImplementation.js";
//# sourceMappingURL=index.d.ts.map