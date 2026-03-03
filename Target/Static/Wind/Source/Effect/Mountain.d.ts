/**
 * @module Effect/Mountain
 * @description
 * Atomic Mountain backend service using Effect-TS.
 * Consolidates MountainIntegrationService and MountainWindSync into a single,
 * unified backend integration layer with proper error handling and resilience.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./Mountain/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { Mountain, MountainLive } from "./Effect/Mountain.js";
 *
 * // New (recommended):
 * import { Mountain, MountainLive } from "./Effect/Mountain/index.js";
 * ```
 */
export { MountainConnectionError, MountainRPCError, MountainSyncError, MountainStateError, type MountainConnectionState, type SyncResource, type SyncResult, type MountainService, MountainTag, MountainLive, MountainMockLive, Mountain, } from "./Mountain/index.js";
//# sourceMappingURL=Mountain.d.ts.map