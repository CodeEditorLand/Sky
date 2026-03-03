/**
 * @module Effect/MountainSync/Layer/MountainSyncMock
 * @description
 * Mock layer for MountainSync service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/MountainSync/Layer/MountainSyncLive} Live layer
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @category Layer
 */
import { Effect, Layer } from "effect";
import MountainSyncTag from "../Tag/MountainSyncTag.js";
/**
 * Creates a mock MountainSync service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock MountainSync service instance
 */
declare const makeMockMountainSync: () => {
    start: () => Effect.Effect<void, never, never>;
    stop: () => Effect.Effect<void, never, never>;
    syncNow: () => Effect.Effect<{
        success: true;
        itemsSynced: number;
        duration: number;
    }, never, never>;
    getStatus: () => Effect.Effect<"idle", never, never>;
    getStats: () => Effect.Effect<{
        lastSyncTime: number;
        syncCount: number;
        successCount: number;
        errorCount: number;
        itemsSynced: number;
    }, never, never>;
    pause: () => Effect.Effect<void, never, never>;
    resume: () => Effect.Effect<void, never, never>;
};
/**
 * Mock layer for MountainSync service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { MountainSyncMock } from "./Effect/MountainSync/Layer/MountainSyncMock.js";
 *
 * const testLayer = MountainSyncMock;
 * ```
 */
declare const MountainSyncMock: Layer.Layer<MountainSyncTag, never, never>;
export default MountainSyncMock;
export { makeMockMountainSync };
//# sourceMappingURL=MountainSyncMock.d.ts.map