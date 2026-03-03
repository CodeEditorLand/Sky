/**
 * @module Effect/Mountain/Type/MountainType
 * @description
 * Type definitions for Mountain backend connection and sync.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using these types
 * @category Type
 */
/**
 * Represents the connection state of the Mountain backend.
 */
export type MountainConnectionState = {
    readonly _tag: "Idle";
} | {
    readonly _tag: "Connecting";
    readonly attempt: number;
} | {
    readonly _tag: "Connected";
    readonly version: string;
} | {
    readonly _tag: "Disconnected";
    readonly reason: string;
} | {
    readonly _tag: "Error";
    readonly error: Error;
};
/**
 * Represents a synced resource from Mountain.
 */
export interface SyncResource {
    /** Type of the resource being synced */
    readonly type: "configuration" | "services" | "state" | "files";
    /** Unique identifier for the resource */
    readonly id: string;
    /** The resource data */
    readonly data: unknown;
    /** Timestamp when resource was synced */
    readonly timestamp: number;
    /** Hash of the resource data for change detection */
    readonly hash: string;
}
/**
 * Result of a sync operation.
 */
export interface SyncResult {
    /** Whether the sync was successful */
    readonly success: boolean;
    /** Number of resources that were synced */
    readonly resourcesSynced: number;
    /** Any errors that occurred during sync */
    readonly errors: ReadonlyArray<string>;
    /** Duration of the sync operation */
    readonly duration: number;
}
//# sourceMappingURL=MountainType.d.ts.map