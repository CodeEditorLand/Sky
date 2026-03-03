/**
 * @module Effect/ActivityBar/Implementation/ActivityBarHelper
 * @description
 * Helper functions for ActivityBar service implementation.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Main implementation
 * @category Implementation
 */
import { Effect, SubscriptionRef } from "effect";
import type { ActivityBarBadge, ActivityBarItem, CreateActivityBarItem } from "../Type/ActivityBarType.js";
import { ActivityBarItemNotFoundError } from "../Error/ActivityBarItemNotFoundError.js";
import { ActivityBarUpdateError } from "../Error/ActivityBarUpdateError.js";
import type { TelemetryService } from "../../Telemetry.js";
/**
 * Generates a unique ID for activity bar items.
 */
export declare const GenerateItemId: () => string;
/**
 * Creates the createItem effect implementation.
 */
export declare const MakeCreateItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>, Telemetry: TelemetryService) => (Item: CreateActivityBarItem) => Effect.Effect<ActivityBarItem, never>;
/**
 * Creates the updateItem effect implementation.
 */
export declare const MakeUpdateItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>, GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>, Telemetry: TelemetryService) => (Id: string, Updates: Partial<Omit<ActivityBarItem, "id">>) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
/**
 * Creates the removeItem effect implementation.
 */
export declare const MakeRemoveItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>, ActiveItemRef: SubscriptionRef.SubscriptionRef<string | undefined>, GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>, Telemetry: TelemetryService) => (Id: string) => Effect.Effect<void, ActivityBarItemNotFoundError>;
/**
 * Creates the getItem effect implementation.
 */
export declare const MakeGetItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>) => (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>;
/**
 * Creates the setActiveItem effect implementation.
 */
export declare const MakeSetActiveItem: (ActiveItemRef: SubscriptionRef.SubscriptionRef<string | undefined>, GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>, Telemetry: TelemetryService) => (Id: string) => Effect.Effect<void, ActivityBarItemNotFoundError>;
/**
 * Creates the setBadge effect implementation.
 */
export declare const MakeSetBadge: (UpdateItem: (Id: string, Updates: Partial<Omit<ActivityBarItem, "id">>) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>) => (Id: string, Badge: ActivityBarBadge | undefined) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
/**
 * Creates the getBadge effect implementation.
 */
export declare const MakeGetBadge: (GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>) => (Id: string) => Effect.Effect<ActivityBarBadge | undefined, never>;
declare const _default: {
    MakeCreateItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>, Telemetry: TelemetryService) => (Item: CreateActivityBarItem) => Effect.Effect<ActivityBarItem, never>;
    MakeUpdateItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>, GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>, Telemetry: TelemetryService) => (Id: string, Updates: Partial<Omit<ActivityBarItem, "id">>) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
    MakeRemoveItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>, ActiveItemRef: SubscriptionRef.SubscriptionRef<string | undefined>, GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>, Telemetry: TelemetryService) => (Id: string) => Effect.Effect<void, ActivityBarItemNotFoundError>;
    MakeGetItem: (ItemsRef: SubscriptionRef.SubscriptionRef<ReadonlyArray<ActivityBarItem>>) => (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>;
    MakeSetActiveItem: (ActiveItemRef: SubscriptionRef.SubscriptionRef<string | undefined>, GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>, Telemetry: TelemetryService) => (Id: string) => Effect.Effect<void, ActivityBarItemNotFoundError>;
    MakeSetBadge: (UpdateItem: (Id: string, Updates: Partial<Omit<ActivityBarItem, "id">>) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>) => (Id: string, Badge: ActivityBarBadge | undefined) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
    MakeGetBadge: (GetItem: (Id: string) => Effect.Effect<ActivityBarItem | undefined, never>) => (Id: string) => Effect.Effect<ActivityBarBadge | undefined, never>;
    GenerateItemId: () => string;
};
export default _default;
//# sourceMappingURL=ActivityBarHelper.d.ts.map