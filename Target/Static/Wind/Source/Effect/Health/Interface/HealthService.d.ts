/**
 * @module Effect/Health/Interface/HealthService
 * @description
 * Service interface for health monitoring operations.
 * @category Interface
 */
import { Effect } from "effect";
import type { ServiceHealth, SystemHealth, HealthStatus } from "../Type/HealthType.js";
export interface HealthService {
    readonly checkService: (serviceName: string) => Effect.Effect<ServiceHealth, never>;
    readonly checkAllServices: () => Effect.Effect<SystemHealth, never>;
    readonly getOverallStatus: () => Effect.Effect<HealthStatus, never>;
    readonly monitorService: (serviceName: string, intervalMs: number) => Effect.Effect<void, never>;
}
//# sourceMappingURL=HealthService.d.ts.map