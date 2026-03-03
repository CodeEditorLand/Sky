/**
 * @module Effect/IPC/Interface/IPCService
 * @description
 * Service interface for IPC (Inter-Process Communication) operations.
 * Provides methods for sending messages, invoking methods, and subscribing to events.
 * @see {@link Effect/IPC/Implementation/IPCImplementation} Implementation
 * @see {@link Effect/IPC/Tag/IPCTag} Service tag
 * @category Interface
 */
import { Effect, Stream } from "effect";
import type { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "../Error/IPCError.js";
/**
 * IPC Service interface
 */
export interface IPCService {
    /** Send a message without expecting a response */
    readonly send: (channel: string) => (args: ReadonlyArray<unknown>) => Effect.Effect<void, IPCSendError>;
    /** Invoke a method and await response */
    readonly invoke: (channel: string) => (args: ReadonlyArray<unknown>) => Effect.Effect<unknown, IPCInvokeError>;
    /** Subscribe to events on a channel as a Stream */
    readonly events: (channel: string) => Stream.Stream<{
        readonly channel: string;
        readonly args: ReadonlyArray<unknown>;
    }, IPCSubscriptionError>;
    /** One-shot event listener */
    readonly once: (channel: string) => Effect.Effect<{
        readonly channel: string;
        readonly args: ReadonlyArray<unknown>;
    }, IPCSubscriptionError>;
    /** Remove all listeners for a channel */
    readonly removeAllListeners: (channel: string) => Effect.Effect<void, never>;
}
//# sourceMappingURL=IPCService.d.ts.map