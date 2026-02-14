var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, SubscriptionRef } from "effect";
import { ActivityBarItemNotFoundError } from "../Error/ActivityBarItemNotFoundError.js";
import { ActivityBarUpdateError } from "../Error/ActivityBarUpdateError.js";
const GenerateItemId = /* @__PURE__ */ __name(() => `activitybar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, "GenerateItemId");
const MakeCreateItem = /* @__PURE__ */ __name((ItemsRef, Telemetry) => {
  return (Item) => Effect.gen(function* () {
    const Id = GenerateItemId();
    const NewItem = { ...Item, id: Id };
    yield* SubscriptionRef.modify(
      ItemsRef,
      (Items) => [void 0, [...Items, NewItem].sort((a, b) => a.position - b.position)]
    );
    yield* Telemetry.log("info", `Created activity bar item: ${Id}`);
    return NewItem;
  });
}, "MakeCreateItem");
const MakeUpdateItem = /* @__PURE__ */ __name((ItemsRef, GetItem, Telemetry) => {
  return (Id, Updates) => Effect.gen(function* () {
    const Existing = yield* GetItem(Id);
    if (!Existing) {
      return yield* Effect.fail(new ActivityBarItemNotFoundError(Id));
    }
    try {
      const CleanUpdatesMap = /* @__PURE__ */ new Map();
      Object.entries(Updates).forEach(([Key, Value]) => {
        if (Key !== "badge" || Value !== void 0) {
          CleanUpdatesMap.set(Key, Value);
        }
      });
      const CleanUpdates = Object.fromEntries(CleanUpdatesMap);
      yield* SubscriptionRef.modify(
        ItemsRef,
        (Items) => [void 0, Items.map((Item) => Item.id === Id ? { ...Item, ...CleanUpdates } : Item).sort((a, b) => a.position - b.position)]
      );
      yield* Telemetry.log("info", `Updated activity bar item: ${Id}`);
    } catch (Error2) {
      return yield* Effect.fail(new ActivityBarUpdateError(Id, Error2));
    }
  });
}, "MakeUpdateItem");
const MakeRemoveItem = /* @__PURE__ */ __name((ItemsRef, ActiveItemRef, GetItem, Telemetry) => {
  return (Id) => Effect.gen(function* () {
    const Existing = yield* GetItem(Id);
    if (!Existing) {
      return yield* Effect.fail(new ActivityBarItemNotFoundError(Id));
    }
    yield* SubscriptionRef.modify(
      ItemsRef,
      (Items) => [void 0, Items.filter((Item) => Item.id !== Id)]
    );
    const CurrentActive = yield* ActiveItemRef.get;
    if (CurrentActive === Id) {
      yield* SubscriptionRef.set(ActiveItemRef, void 0);
    }
    yield* Telemetry.log("info", `Removed activity bar item: ${Id}`);
  });
}, "MakeRemoveItem");
const MakeGetItem = /* @__PURE__ */ __name((ItemsRef) => {
  return (Id) => Effect.map(ItemsRef.get, (Items) => Items.find((Item) => Item.id === Id));
}, "MakeGetItem");
const MakeSetActiveItem = /* @__PURE__ */ __name((ActiveItemRef, GetItem, Telemetry) => {
  return (Id) => Effect.gen(function* () {
    const Existing = yield* GetItem(Id);
    if (!Existing) {
      return yield* Effect.fail(new ActivityBarItemNotFoundError(Id));
    }
    yield* SubscriptionRef.set(ActiveItemRef, Id);
    yield* Telemetry.log("info", `Set active activity bar item: ${Id}`);
  });
}, "MakeSetActiveItem");
const MakeSetBadge = /* @__PURE__ */ __name((UpdateItem) => {
  return (Id, Badge) => Badge === void 0 ? UpdateItem(Id, {}) : UpdateItem(Id, { badge: Badge });
}, "MakeSetBadge");
const MakeGetBadge = /* @__PURE__ */ __name((GetItem) => {
  return (Id) => Effect.map(GetItem(Id), (Item) => Item?.badge);
}, "MakeGetBadge");
var ActivityBarHelper_default = {
  MakeCreateItem,
  MakeUpdateItem,
  MakeRemoveItem,
  MakeGetItem,
  MakeSetActiveItem,
  MakeSetBadge,
  MakeGetBadge,
  GenerateItemId
};
export {
  GenerateItemId,
  MakeCreateItem,
  MakeGetBadge,
  MakeGetItem,
  MakeRemoveItem,
  MakeSetActiveItem,
  MakeSetBadge,
  MakeUpdateItem,
  ActivityBarHelper_default as default
};
//# sourceMappingURL=ActivityBarHelper.js.map
