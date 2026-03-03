/**
 * @module Bootstrap/Types/Type/ServiceData
 * @description
 * Type defining service registration data collected during bootstrap.
 * Tracks which services were successfully registered or failed.
 * @category Type
 */
/**
 * Service data interface
 */
export interface ServiceData {
    /** List of successfully registered service names */
    servicesRegistered: string[];
    /** List of services that failed to register */
    servicesFailed: string[];
    /** Total number of services */
    serviceCount: number;
}
//# sourceMappingURL=ServiceData.d.ts.map