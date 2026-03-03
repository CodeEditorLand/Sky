/**
 * @module Effect/MountainSync
 * @description
 * Main re-export module for MountainSync service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Layer/MountainSyncLive} Live layer
 * @see {@link Effect/MountainSync/Layer/MountainSyncMock} Mock layer
 * @category Re-export
 */
export type { SyncStatus, SyncConfig, SyncStats, MountainSyncResult } from "./Type/MountainSyncType.js";
export type { MountainSyncService } from "./Interface/MountainSyncService.js";
export { default as MountainSyncTag } from "./Tag/MountainSyncTag.js";
export { default as MountainSyncLive } from "./Layer/MountainSyncLive.js";
export { default as MountainSyncMock } from "./Layer/MountainSyncMock.js";
export { makeMockMountainSync } from "./Layer/MountainSyncMock.js";
//# sourceMappingURL=index.d.ts.map