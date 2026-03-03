/**
 * @module Effect/MountainSync/Interface/MountainSyncService
 * @description
 * Service interface for Mountain-Wind synchronization.
 * Provides methods to control background sync operations between Mountain and Wind.
 * @see {@link Effect/MountainSync/Type/MountainSyncType} Type definitions
 * @see {@link Effect/MountainSync/Tag/MountainSyncTag} Service tag
 * @see {@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { SyncConfig, SyncStats, MountainSyncResult } from "../Type/MountainSyncType.js";
/**
 * MountainSync service interface for managing background synchronization.
 * Provides full lifecycle management of sync operations including start,
 * stop, pause, resume, and on-demand sync capabilities.
 */
export interface MountainSyncService {
    /** Start automatic synchronization with optional configuration overrides */
    readonly start: (config?: Partial<SyncConfig>) => Effect.Effect<void>;
    /** Stop the background synchronization process */
    readonly stop: () => Effect.Effect<void>;
    /** Perform an immediate synchronization operation on demand */
    readonly syncNow: () => Effect.Effect<MountainSyncResult>;
    /** Get the current synchronization status */
    readonly getStatus: () => Effect.Effect<"idle" | "syncing" | "paused" | "error">;
    /** Get synchronization statistics and metrics */
    readonly getStats: () => Effect.Effect<SyncStats>;
    /** Pause the background synchronization process */
    readonly pause: () => Effect.Effect<void>;
    /** Resume a paused background synchronization process */
    readonly resume: () => Effect.Effect<void>;
}
//# sourceMappingURL=MountainSyncService.d.ts.map