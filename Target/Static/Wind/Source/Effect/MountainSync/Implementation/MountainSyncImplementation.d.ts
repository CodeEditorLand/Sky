/**
 * @module Effect/MountainSync/Implementation/MountainSyncImplementation
 * @description
 * Main implementation factory for MountainSync service.
 * Creates MountainSync service instances with background sync capabilities.
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Tag/MountainSyncTag} Service tag
 * @see {@link Effect/MountainSync/Type/MountainSyncType} Type definitions
 * @category Implementation
 */
import type { MountainSyncService } from "../Interface/MountainSyncService.js";
import type { MountainService } from "../../Mountain.js";
import type { IPCService } from "../../IPC.js";
import type { TelemetryService } from "../../Telemetry.js";
/**
 * Creates a MountainSync service instance.
 * Manages background synchronization between Mountain and Wind.
 *
 * @param mountain - Mountain service for backend operations
 * @param ipc - IPC service for communication
 * @param telemetry - Telemetry service for logging
 * @returns MountainSync service instance
 */
declare const makeMountainSync: (Mountain: MountainService, IPC: IPCService, TelemetryService: TelemetryService) => MountainSyncService;
export default makeMountainSync;
//# sourceMappingURL=MountainSyncImplementation.d.ts.map