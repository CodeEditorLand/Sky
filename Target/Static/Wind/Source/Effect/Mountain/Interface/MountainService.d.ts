/**
 * @module Effect/Mountain/Interface/MountainService
 * @description
 * Service interface for Mountain backend integration.
 * Manages connection, RPC calls, and resource synchronization.
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Default implementation
 * @see [Effect-TS Services](https://effect.website/docs/guide/context)
 * @category Interface
 */
import { Effect, Stream } from "effect";
import type { MountainConnectionState, SyncResource, SyncResult } from "../Type/MountainType.js";
import type { MountainConnectionError } from "../Error/MountainConnectionError.js";
import type { MountainRPCError } from "../Error/MountainRPCError.js";
import type { MountainSyncError } from "../Error/MountainSyncError.js";
/**
 * Service interface for Mountain backend operations.
 * Manages connection to the Mountain backend, RPC calls, and resource sync.
 */
export interface MountainService {
    /**
     * Current connection state.
     */
    readonly connectionState: Effect.Effect<MountainConnectionState, never>;
    /**
     * Stream of connection state changes.
     */
    readonly connectionChanges: Stream.Stream<MountainConnectionState, never>;
    /**
     * Connect to Mountain backend.
     * @returns Effect that completes when connection is established
     */
    readonly connect: Effect.Effect<void, MountainConnectionError>;
    /**
     * Disconnect from Mountain backend.
     * @returns Effect that completes when disconnected
     */
    readonly disconnect: Effect.Effect<void, never>;
    /**
     * Execute RPC method.
     * @param method - The RPC method name
     * @returns A function that takes args and returns the RPC result
     */
    readonly rpc: <T>(method: string) => (args?: Record<string, unknown>) => Effect.Effect<T, MountainRPCError>;
    /**
     * Sync a specific resource type.
     * @param resourceType - The type of resource to sync
     * @returns Effect that resolves to sync result
     */
    readonly sync: (resourceType: SyncResource["type"]) => Effect.Effect<SyncResult, MountainSyncError>;
    /**
     * Stream of all sync events.
     */
    readonly syncEvents: Stream.Stream<SyncResource, never>;
    /**
     * Get Mountain version.
     * @returns Effect that resolves to version string
     */
    readonly version: Effect.Effect<string, MountainConnectionError>;
    /**
     * Health check.
     * @returns Effect that resolves to whether backend is healthy
     */
    readonly healthCheck: Effect.Effect<boolean, MountainConnectionError>;
}
//# sourceMappingURL=MountainService.d.ts.map