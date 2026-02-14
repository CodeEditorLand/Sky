var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, SubscriptionRef } from "effect";
import { ActivityBarTag } from "../Tag/ActivityBarTag.js";
import { Telemetry } from "../../Telemetry.js";
import {
  MakeCreateItem,
  MakeUpdateItem,
  MakeRemoveItem,
  MakeGetItem,
  MakeSetActiveItem,
  MakeSetBadge,
  MakeGetBadge
} from "./ActivityBarHelper.js";
const ActivityBarLive = Layer.effect(
  ActivityBarTag,
  Effect.gen(function* () {
    const TelemetryService = yield* Telemetry;
    const ItemsRef = yield* SubscriptionRef.make([]);
    const ActiveItemRef = yield* SubscriptionRef.make(void 0);
    const GetItem = MakeGetItem(ItemsRef);
    const CreateItem = MakeCreateItem(ItemsRef, TelemetryService);
    const UpdateItem = MakeUpdateItem(ItemsRef, GetItem, TelemetryService);
    const RemoveItem = MakeRemoveItem(ItemsRef, ActiveItemRef, GetItem, TelemetryService);
    const SetActiveItem = MakeSetActiveItem(ActiveItemRef, GetItem, TelemetryService);
    const SetBadge = MakeSetBadge(UpdateItem);
    const GetBadge = MakeGetBadge(GetItem);
    yield* TelemetryService.log("info", "ActivityBar service initialized");
    return {
      createItem: CreateItem,
      updateItem: UpdateItem,
      removeItem: RemoveItem,
      getItem: GetItem,
      items: ItemsRef.get,
      itemsChanges: ItemsRef.changes,
      setActiveItem: SetActiveItem,
      getActiveItem: ActiveItemRef.get,
      activeItemChanges: ActiveItemRef.changes,
      setBadge: SetBadge,
      getBadge: GetBadge,
      clearBadge: /* @__PURE__ */ __name((Id) => SetBadge(Id, void 0), "clearBadge")
    };
  })
);
var ActivityBarImplementation_default = ActivityBarLive;
export {
  ActivityBarLive,
  ActivityBarImplementation_default as default
};
//# sourceMappingURL=ActivityBarImplementation.js.map
