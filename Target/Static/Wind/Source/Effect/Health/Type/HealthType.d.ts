/**
 * @module Effect/Health/Type/HealthType
 * @description
 * Type definitions for the Health monitoring service.
 * Includes health status types and health interfaces.
 * @category Type
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
export interface ServiceHealth {
    readonly serviceName: string;
    readonly status: HealthStatus;
    readonly message: string;
    readonly lastChecked: number;
    readonly responseTime: number;
    readonly details?: Readonly<Record<string, unknown>>;
}
export interface SystemHealth {
    readonly overallStatus: HealthStatus;
    readonly services: ReadonlyArray<ServiceHealth>;
    readonly systemInfo: {
        readonly platform: string;
        readonly architecture: string;
        readonly upSince: number;
    };
    readonly lastChecked: number;
}
//# sourceMappingURL=HealthType.d.ts.map