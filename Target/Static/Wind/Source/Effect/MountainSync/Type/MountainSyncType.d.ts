/**
 * @module Effect/MountainSync/Type/MountainSyncType
 * @description
 * Type definitions for MountainSync service.
 * Defines the status states, configuration options, statistics tracking,
 * and sync result types for Mountain-Wind synchronization.
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @category Type
 */
/**
 * Represents the current synchronization status.
 * Used to track the state of the background sync process.
 */
export type SyncStatus = "idle" | "syncing" | "paused" | "error";
/**
 * Configuration options for the MountainSync service.
 * Controls sync behavior including intervals, retry policies, and batch sizes.
 */
export interface SyncConfig {
    /** Whether synchronization is enabled */
    readonly enabled: boolean;
    /** Time interval between sync operations in milliseconds */
    readonly syncIntervalMs: number;
    /** Whether to automatically retry failed sync operations */
    readonly autoRetry: boolean;
    /** Maximum number of retry attempts for failed operations */
    readonly maxRetries: number;
    /** Number of items to sync in each batch operation */
    readonly batchSize: number;
}
/**
 * Statistics tracking for synchronization operations.
 * Provides metrics on sync performance and history.
 */
export interface SyncStats {
    /** Timestamp of the last successful sync operation */
    readonly lastSyncTime: number;
    /** Total number of sync operations performed */
    readonly syncCount: number;
    /** Number of successful sync operations */
    readonly successCount: number;
    /** Number of failed sync operations */
    readonly errorCount: number;
    /** Total number of items successfully synchronized */
    readonly itemsSynced: number;
}
/**
 * Result of a single synchronization operation.
 * Contains outcome details and any error information.
 */
export interface MountainSyncResult {
    /** Whether the sync operation completed successfully */
    readonly success: boolean;
    /** Number of items synchronized during this operation */
    readonly itemsSynced: number;
    /** Duration of the sync operation in milliseconds */
    readonly duration: number;
    /** Error details if the operation failed */
    readonly error?: Error;
}
//# sourceMappingURL=MountainSyncType.d.ts.map