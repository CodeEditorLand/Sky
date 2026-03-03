/**
 * @module Effect/Health/Implementation/HealthHelper
 * @description
 * Helper functions for creating service health instances.
 * @category Implementation
 */
import type { ServiceHealth, HealthStatus } from "../Type/HealthType.js";
export declare const CreateServiceHealth: (Name: string, Status: HealthStatus, Message: string, ResponseTime: number, Details?: Readonly<Record<string, unknown>>) => ServiceHealth;
export declare const CreateServiceHealthWithNoResponseTime: (Name: string, Status: HealthStatus, Message: string) => ServiceHealth;
declare const _default: {
    CreateServiceHealth: (Name: string, Status: HealthStatus, Message: string, ResponseTime: number, Details?: Readonly<Record<string, unknown>>) => ServiceHealth;
    CreateServiceHealthWithNoResponseTime: (Name: string, Status: HealthStatus, Message: string) => ServiceHealth;
};
export default _default;
//# sourceMappingURL=HealthHelper.d.ts.map