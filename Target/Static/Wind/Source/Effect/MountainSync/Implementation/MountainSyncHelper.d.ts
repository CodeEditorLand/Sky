/**
 * @module Effect/MountainSync/Implementation/MountainSyncHelper
 * @description
 * Helper functions for MountainSync implementation.
 * Provides utility functions for sync operations and logging.
 * @see {@link Effect/MountainSync/Implementation/MountainSyncImplementation} Main implementation
 * @see {@link Effect/MountainSync/Type/MountainSyncType} Type definitions
 * @category Implementation
 */
import { Effect } from "effect";
import type { MountainSyncResult } from "../Type/MountainSyncType.js";
import type { MountainService } from "../../Mountain.js";
import type { IPCService } from "../../IPC.js";
import type { TelemetryService } from "../../Telemetry.js";
/**
 * Performs a single synchronization operation.
 * This is the core sync logic that coordinates between Mountain, IPC, and Telemetry.
 *
 * @param mountain - Mountain service for backend operations
 * @param ipc - IPC service for communication
 * @param telemetry - Telemetry service for logging
 * @returns Effect that produces MountainSyncResult
 */
declare const SyncNowEffect: (_mountain: MountainService, _ipc: IPCService, telemetry: TelemetryService) => Effect.Effect<MountainSyncResult>;
export default SyncNowEffect;
//# sourceMappingURL=MountainSyncHelper.d.ts.map