/**
 * @module Effect/NetworkRestrictions/Interface/NetworkRestrictionsService
 * @description
 * Service interface for the NetworkRestrictions service. Provides methods for checking
 * and blocking network requests and IPC channels.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Implementation
 * @see {@link Effect/NetworkRestrictions/Error/NetworkBlockError} Related error type
 * @category Interface
 */
import { Effect } from "effect";
import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";
import type { NetworkBlockError } from "../Error/NetworkBlockError.js";
import type { IPCBlockError } from "../Error/IPCBlockError.js";
/**
 * Blocked request entry for logging
 */
export interface BlockedRequest {
    readonly timestamp: number;
    readonly type: "http" | "https" | "websocket" | "ipc";
    readonly target: string;
    readonly reason: string;
}
/**
 * Telemetry levels
 */
export type TelemetryLevel = "NONE" | "CRASH" | "ERROR" | "USAGE";
/**
 * Network Restrictions service interface
 */
export interface NetworkRestrictionsService {
    /** Check if a URL is allowed */
    readonly checkURL: (url: string) => Effect.Effect<boolean, NetworkBlockError>;
    /** Block a URL (used by window.fetch override) */
    readonly blockURL: (url: string, reason: string) => Effect.Effect<void, never>;
    /** Check if an IPC channel is allowed */
    readonly checkIPCChannel: (channel: string) => Effect.Effect<boolean, IPCBlockError>;
    /** Get current configuration */
    readonly config: Effect.Effect<NetworkRestrictionConfig, never>;
    /** Update configuration (atomic) */
    readonly updateConfig: (config: Partial<NetworkRestrictionConfig>) => Effect.Effect<void, never>;
    /** Get list of blocked requests (for debugging) */
    readonly getBlockedRequests: Effect.Effect<ReadonlyArray<BlockedRequest>, never>;
    /** Clear blocked requests log */
    readonly clearBlockedRequests: Effect.Effect<void, never>;
    /** Set telemetry level (NONE, CRASH, ERROR, USAGE) */
    readonly setTelemetryLevel: (level: TelemetryLevel) => Effect.Effect<void, never>;
    /** Get current telemetry level */
    readonly getTelemetryLevel: Effect.Effect<TelemetryLevel, never>;
}
//# sourceMappingURL=NetworkRestrictionsService.d.ts.map