/**
 * @module Bootstrap/Types/Type/WorkbenchData
 * @description
 * Type defining workbench initialization status.
 * Tracks the state of the VSCode workbench during bootstrap.
 * @category Type
 */
/**
 * Workbench data interface
 */
export interface WorkbenchData {
    /** Whether the workbench has been initialized */
    initialized: boolean;
    /** Whether the workbench is currently running */
    running: boolean;
    /** Whether all services are ready */
    servicesReady: boolean;
    /** Optional error if workbench failed to start */
    error?: Error;
}
//# sourceMappingURL=WorkbenchData.d.ts.map